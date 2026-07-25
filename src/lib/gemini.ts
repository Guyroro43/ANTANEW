import { GoogleGenAI, Type } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const MODEL = 'gemini-2.5-flash';

function readJsonResponse<T>(text: string | undefined): T {
  if (!text) {
    throw new Error('Réponse IA vide ou invalide.');
  }
  return JSON.parse(text) as T;
}

export interface GeneratedQuestion {
  question_text: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

const quizQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question_text: { type: Type.STRING },
    options: { type: Type.ARRAY, items: { type: Type.STRING } },
    correct_index: { type: Type.INTEGER },
    explanation: { type: Type.STRING },
  },
  required: ['question_text', 'options', 'correct_index', 'explanation'],
};

const quizQuestionsSchema = {
  type: Type.OBJECT,
  properties: {
    questions: { type: Type.ARRAY, items: quizQuestionSchema },
  },
  required: ['questions'],
};

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
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire).

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
    config: {
      responseMimeType: 'application/json',
      responseSchema: quizQuestionsSchema,
    },
  });

  return readJsonResponse<{ questions: GeneratedQuestion[] }>(response.text).questions;
}

interface GenerateQuizQuestionsFromPdfParams {
  pdfUrl: string;
  lessonTitle: string;
  category: string | null;
  difficulty: string | null;
  count: number;
}

export async function generateQuizQuestionsFromPdf({
  pdfUrl,
  lessonTitle,
  category,
  difficulty,
  count,
}: GenerateQuizQuestionsFromPdfParams): Promise<GeneratedQuestion[]> {
  const pdfResponse = await fetch(pdfUrl);
  if (!pdfResponse.ok) {
    throw new Error('Impossible de télécharger le PDF source.');
  }
  const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: pdfBuffer.toString('base64') } },
          {
            text: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire).

Analyse le contenu de ce document PDF, qui sert de support à la leçon suivante :

Leçon : ${lessonTitle}
${category ? `Catégorie : ${category}` : ''}
Niveau : ${difficulty ?? 'debutant'}

Génère exactement ${count} questions à choix multiple (QCM) en français pour évaluer la compréhension de ce document.

Consignes :
- Base-toi uniquement sur le contenu réel du document, pas sur des connaissances générales.
- Chaque question a exactement 4 options, une seule correcte.
- "correct_index" est l'index (0 à 3) de la bonne option dans le tableau "options".
- "explanation" justifie brièvement la bonne réponse, en français, de façon pédagogique.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: quizQuestionsSchema,
    },
  });

  return readJsonResponse<{ questions: GeneratedQuestion[] }>(response.text).questions;
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

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Un apprenant d'anglais sur ANTA vient de se tromper sur ${items.length} question(s) de la leçon « ${lessonTitle} ». Pour chaque question, explique-lui en français, avec bienveillance et pédagogie, pourquoi sa réponse est fausse et ce qu'il aurait dû répondre.

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
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          feedback: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question_id: { type: Type.STRING },
                message: { type: Type.STRING },
              },
              required: ['question_id', 'message'],
            },
          },
        },
        required: ['feedback'],
      },
    },
  });

  return readJsonResponse<{ feedback: WrongAnswerFeedback[] }>(response.text).feedback;
}
