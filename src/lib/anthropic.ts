import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient() {
  if (!client) {
    client = new Anthropic();
  }
  return client;
}

function readJsonResponse<T>(response: Anthropic.Message): T {
  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Réponse IA vide ou invalide.');
  }
  return JSON.parse(textBlock.text) as T;
}

export interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

interface GenerateQuizQuestionsParams {
  moduleTitle: string;
  lessonTitle: string;
  lessonDescription: string | null;
  category: string | null;
  difficulty: string | null;
  count: number;
}

export async function generateQuizQuestions({
  moduleTitle,
  lessonTitle,
  lessonDescription,
  category,
  difficulty,
  count,
}: GenerateQuizQuestionsParams): Promise<GeneratedQuestion[]> {
  const response = await getClient().messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 4096,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'medium',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question_text: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' } },
                  correct_index: { type: 'integer' },
                  explanation: { type: 'string' },
                },
                required: ['question_text', 'options', 'correct_index', 'explanation'],
                additionalProperties: false,
              },
            },
          },
          required: ['questions'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire).

Génère exactement ${count} questions à choix multiple (QCM) en français pour évaluer la leçon suivante :

Module : ${moduleTitle}
Leçon : ${lessonTitle}
${lessonDescription ? `Description : ${lessonDescription}` : ''}
${category ? `Catégorie : ${category}` : ''}
Niveau : ${difficulty ?? 'debutant'}

Consignes :
- Chaque question porte sur le vocabulaire ou les expressions anglaises utiles dans des situations de la vie quotidienne africaine (pas de références à New York, Londres ou Tokyo).
- Chaque question a exactement 4 options, une seule correcte.
- "correct_index" est l'index (0 à 3) de la bonne option dans le tableau "options".
- "explanation" justifie brièvement la bonne réponse, en français, de façon pédagogique.`,
      },
    ],
  });

  return readJsonResponse<{ questions: GeneratedQuestion[] }>(response).questions;
}

export interface WrongAnswerItem {
  questionId: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  selectedIndex: number;
  explanation: string | null;
}

export interface WrongAnswerFeedback {
  question_id: string;
  message: string;
}

interface ExplainWrongAnswersParams {
  lessonTitle: string;
  items: WrongAnswerItem[];
}

export async function explainWrongAnswers({
  lessonTitle,
  items,
}: ExplainWrongAnswersParams): Promise<WrongAnswerFeedback[]> {
  if (items.length === 0) {
    return [];
  }

  const response = await getClient().messages.create({
    model: 'claude-opus-4-8',
    max_tokens: 2048,
    thinking: { type: 'adaptive' },
    output_config: {
      effort: 'medium',
      format: {
        type: 'json_schema',
        schema: {
          type: 'object',
          properties: {
            feedback: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question_id: { type: 'string' },
                  message: { type: 'string' },
                },
                required: ['question_id', 'message'],
                additionalProperties: false,
              },
            },
          },
          required: ['feedback'],
          additionalProperties: false,
        },
      },
    },
    messages: [
      {
        role: 'user',
        content: `Un apprenant d'anglais sur ANTA vient de se tromper sur ${items.length} question(s) de la leçon « ${lessonTitle} ». Pour chaque question, explique-lui en français, avec bienveillance et pédagogie, pourquoi sa réponse est fausse et ce qu'il aurait dû répondre.

${items
  .map(
    (item, index) => `Question ${index + 1} (id="${item.questionId}") : ${item.questionText}
Options : ${item.options.map((option, optionIndex) => `${optionIndex}) ${option}`).join(' ; ')}
Réponse de l'apprenant : ${item.selectedIndex}) ${item.options[item.selectedIndex] ?? ''}
Bonne réponse : ${item.correctIndex}) ${item.options[item.correctIndex] ?? ''}
${item.explanation ? `Indice existant : ${item.explanation}` : ''}`,
  )
  .join('\n\n')}

Réponds avec un "message" par question, en réutilisant exactement le "question_id" fourni pour chacune.`,
      },
    ],
  });

  return readJsonResponse<{ feedback: WrongAnswerFeedback[] }>(response).feedback;
}
