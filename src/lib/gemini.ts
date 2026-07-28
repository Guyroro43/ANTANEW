import { GoogleGenAI, Type } from '@google/genai';

let client: GoogleGenAI | null = null;

function getClient() {
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return client;
}

const MODEL = 'gemini-flash-latest';

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

export interface GeneratedVocabulary {
  word: string;
  definition: string;
  example: string;
}

export interface GeneratedLessonContent {
  vocabulary: GeneratedVocabulary[];
  questions: GeneratedQuestion[];
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

const vocabularyItemSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    definition: { type: Type.STRING },
    example: { type: Type.STRING },
  },
  required: ['word', 'definition', 'example'],
};

const lessonContentSchema = {
  type: Type.OBJECT,
  properties: {
    vocabulary: { type: Type.ARRAY, items: vocabularyItemSchema },
    questions: { type: Type.ARRAY, items: quizQuestionSchema },
  },
  required: ['vocabulary', 'questions'],
};

const questionsOnlySchema = {
  type: Type.OBJECT,
  properties: {
    questions: { type: Type.ARRAY, items: quizQuestionSchema },
  },
  required: ['questions'],
};

const QUESTION_VARIETY_CONSIGNES = `- Les questions ne doivent PAS être un simple rappel du mot de vocabulaire tel qu'il vient d'être présenté (ex. répéter la même définition) — c'est trop facile si le mot vient d'être vu. Varie l'angle : utilise le mot dans une phrase ou un contexte nouveau, teste une nuance de sens, une collocation, ou une erreur fréquente chez un francophone.
- Certaines questions peuvent dépasser légèrement le vocabulaire présenté (grammaire liée, usage courant) pour éviter un simple test de reconnaissance.
- Les 3 mauvaises options doivent être plausibles, pas absurdes : mélange un piège de sens proche, un piège de forme proche (orthographe ou sonorité similaire, ex. faux-ami), et une option liée au thème mais incorrecte. Évite les options qui se devinent trivialement par élimination.`;

function directionSheetBlock(directionSheet: string | null | undefined) {
  return directionSheet?.trim()
    ? `\nFiche de direction de l'instructeur (à respecter en priorité, prime sur les consignes générales ci-dessous en cas de conflit) :\n${directionSheet.trim()}\n`
    : '';
}

interface GenerateLessonContentParams {
  moduleTitle: string;
  lessonTitle: string;
  lessonDescription: string | null;
  category: string | null;
  difficulty: string | null;
  count: number;
  vocabCount: number;
  directionSheet?: string | null;
}

export async function generateLessonContent({
  moduleTitle,
  lessonTitle,
  lessonDescription,
  category,
  difficulty,
  count,
  vocabCount,
  directionSheet,
}: GenerateLessonContentParams): Promise<GeneratedLessonContent> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire). Tu construis une mini-leçon interactive complète (vocabulaire puis quiz), pas juste une évaluation sèche.

Sujet de la leçon :

Module : ${moduleTitle}
Leçon : ${lessonTitle}
${lessonDescription ? `Description : ${lessonDescription}` : ''}
${category ? `Catégorie : ${category}` : ''}
Niveau : ${difficulty ?? 'debutant'}
${directionSheetBlock(directionSheet)}
Génère exactement ${vocabCount} mots de vocabulaire et exactement ${count} questions.

Consignes :
- D'abord le vocabulaire : ${vocabCount} mots ou expressions anglaises clés pour ce sujet, utiles dans des situations de la vie quotidienne africaine (pas de références à New York, Londres ou Tokyo), avec leur définition en français et une phrase d'exemple en anglais.
- Puis les questions, avec exactement 4 options chacune, une seule correcte.
${QUESTION_VARIETY_CONSIGNES}
- "correct_index" est l'index (0 à 3) de la bonne option dans le tableau "options".
- "explanation" justifie brièvement la bonne réponse, en français, de façon pédagogique.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: lessonContentSchema,
    },
  });

  return readJsonResponse<GeneratedLessonContent>(response.text);
}

interface GenerateLessonContentFromPdfParams {
  pdfUrl: string;
  lessonTitle: string;
  category: string | null;
  difficulty: string | null;
  count: number;
  vocabCount: number;
  directionSheet?: string | null;
}

export async function generateLessonContentFromPdf({
  pdfUrl,
  lessonTitle,
  category,
  difficulty,
  count,
  vocabCount,
  directionSheet,
}: GenerateLessonContentFromPdfParams): Promise<GeneratedLessonContent> {
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
            text: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire). Tu construis une mini-leçon interactive complète (vocabulaire puis quiz) à partir de ce document, pas juste une évaluation sèche.

Analyse le contenu de ce document PDF, qui sert de support à la leçon suivante :

Leçon : ${lessonTitle}
${category ? `Catégorie : ${category}` : ''}
Niveau : ${difficulty ?? 'debutant'}
${directionSheetBlock(directionSheet)}
Génère exactement ${vocabCount} mots de vocabulaire et exactement ${count} questions, basés uniquement sur le contenu réel du document (pas sur des connaissances générales).

Consignes :
- D'abord le vocabulaire : ${vocabCount} mots ou expressions anglaises clés tirés du document, avec leur définition en français et une phrase d'exemple en anglais.
- Puis les questions, basées sur le contenu du document, avec exactement 4 options chacune, une seule correcte.
${QUESTION_VARIETY_CONSIGNES}
- "correct_index" est l'index (0 à 3) de la bonne option dans le tableau "options".
- "explanation" justifie brièvement la bonne réponse, en français, de façon pédagogique.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: lessonContentSchema,
    },
  });

  return readJsonResponse<GeneratedLessonContent>(response.text);
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

export interface DraftedModuleFields {
  title: string;
  slug: string;
  description: string;
}

interface DraftModuleFieldsParams {
  brief: string;
}

export async function draftModuleFields({ brief }: DraftModuleFieldsParams): Promise<DraftedModuleFields> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire).

Un instructeur veut créer un module avec cette consigne courte : « ${brief} »

Rédige :
- "title" : un titre de module accrocheur et clair, en français, 3 à 6 mots.
- "slug" : version url-friendly du titre (minuscules, tirets, sans accents, ex. "saluer-se-presenter").
- "description" : une phrase engageante en français qui donne envie de suivre ce module (1 à 2 phrases).`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          slug: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ['title', 'slug', 'description'],
      },
    },
  });

  return readJsonResponse<DraftedModuleFields>(response.text);
}

export interface DraftedLessonFields {
  title: string;
  description: string;
  category: string;
}

interface DraftLessonFieldsParams {
  brief: string;
  moduleTitle: string;
}

export async function draftLessonFields({ brief, moduleTitle }: DraftLessonFieldsParams): Promise<DraftedLessonFields> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire).

Un instructeur veut créer une leçon dans le module « ${moduleTitle} », avec cette consigne courte : « ${brief} »

Rédige :
- "title" : un titre de leçon clair, en français, 3 à 6 mots.
- "description" : une phrase en français qui résume ce que l'apprenant va apprendre.
- "category" : une catégorie courte (1 à 2 mots, ex. "Vocabulaire", "Grammaire", "Expressions").`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
        },
        required: ['title', 'description', 'category'],
      },
    },
  });

  return readJsonResponse<DraftedLessonFields>(response.text);
}

interface CategoryStat {
  category: string;
  avgScorePercent: number;
  lessonsCompleted: number;
}

interface SummarizeProgressParams {
  firstName: string;
  level: string;
  completedLessonsCount: number;
  currentStreak: number;
  categoryStats: CategoryStat[];
}

export async function summarizeProgress({
  firstName,
  level,
  completedLessonsCount,
  currentStreak,
  categoryStats,
}: SummarizeProgressParams): Promise<string> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Tu es coach pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains.

Voici les statistiques réelles de progression de ${firstName} (niveau ${level}) :
- ${completedLessonsCount} leçon(s) complétée(s) au total.
- Streak actuel : ${currentStreak} jour(s).
- Score moyen par catégorie de leçon :
${categoryStats.map((c) => `  - ${c.category} : ${c.avgScorePercent}% sur ${c.lessonsCompleted} leçon(s)`).join('\n')}

Rédige un court message d'encouragement personnalisé (1 à 2 phrases, en français, ton chaleureux et motivant) qui :
- félicite la catégorie où le score moyen est le plus élevé,
- encourage à progresser sur la catégorie où le score moyen est le plus bas (sans être négatif).
Base-toi uniquement sur ces chiffres réels, n'invente aucune donnée.`,
  });

  return response.text?.trim() ?? '';
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

interface ChatWithPracticePartnerParams {
  level: string;
  firstName: string;
  history: ChatTurn[];
  message: string;
}

export async function chatWithPracticePartner({
  level,
  firstName,
  history,
  message,
}: ChatWithPracticePartnerParams): Promise<string> {
  const systemInstruction = `Tu es "Kora", le partenaire de conversation en anglais d'ANTA, une plateforme d'apprentissage pour de jeunes Africains. Tu discutes en anglais avec ${firstName}, dont le niveau est "${level}", pour qu'il/elle pratique à l'écrit dans un cadre bienveillant et motivant.

Règles :
- Réponds principalement en anglais, adapté au niveau ${level} (phrases courtes et vocabulaire simple si débutant, plus riche si avancé).
- Si l'apprenant fait une faute d'anglais notable, corrige-la brièvement et gentiment (une ligne, en français, précédée de "💡"), puis continue la conversation normalement.
- Pose des questions de relance pour maintenir la conversation active.
- Ancre les sujets dans le quotidien africain quand c'est pertinent (marché, transport, famille, foot...), jamais New York/Londres/Tokyo.
- Ceci est un espace d'entraînement libre, pas une évaluation : ne donne jamais de note ni de score.`;

  const contents = [
    ...history.map((turn) => ({ role: turn.role, parts: [{ text: turn.text }] })),
    { role: 'user' as const, parts: [{ text: message }] },
  ];

  const response = await getClient().models.generateContent({
    model: MODEL,
    contents,
    config: {
      systemInstruction,
    },
  });

  return response.text?.trim() ?? '';
}

interface GenerateQuestionsFromMediaParams {
  mediaUrl: string;
  mimeType: string;
  lessonTitle: string;
  category: string | null;
  difficulty: string | null;
  count: number;
  directionSheet?: string | null;
}

/**
 * Pour les leçons vidéo/audio, l'apprenant consulte le média directement —
 * pas besoin de vocabulaire généré, seulement des questions basées sur son
 * contenu réel. Passe par les Files API de Gemini (pas d'inlineData base64)
 * car les vidéos dépassent souvent la limite de 20 Mo d'une requête inline.
 */
export async function generateQuestionsFromMedia({
  mediaUrl,
  mimeType,
  lessonTitle,
  category,
  difficulty,
  count,
  directionSheet,
}: GenerateQuestionsFromMediaParams): Promise<GeneratedQuestion[]> {
  const mediaResponse = await fetch(mediaUrl);
  if (!mediaResponse.ok) {
    throw new Error('Impossible de télécharger le fichier média.');
  }
  const buffer = Buffer.from(await mediaResponse.arrayBuffer());

  const client = getClient();
  let uploadedFile = await client.files.upload({
    file: new Blob([buffer], { type: mimeType }),
    config: { mimeType },
  });

  const startedAt = Date.now();
  while (uploadedFile.state === 'PROCESSING' && Date.now() - startedAt < 60_000) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (!uploadedFile.name) break;
    uploadedFile = await client.files.get({ name: uploadedFile.name });
  }
  if (uploadedFile.state === 'FAILED') {
    throw new Error('Le traitement du fichier média a échoué côté Gemini.');
  }
  if (!uploadedFile.uri) {
    throw new Error("Échec de l'envoi du fichier média à Gemini.");
  }

  const mediaKind = mimeType.startsWith('video') ? 'vidéo' : 'audio';

  const response = await client.models.generateContent({
    model: MODEL,
    contents: [
      {
        role: 'user',
        parts: [
          { fileData: { fileUri: uploadedFile.uri, mimeType } },
          {
            text: `Tu es concepteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire).

Regarde/écoute ce fichier ${mediaKind}, qui sert de support à la leçon suivante :

Leçon : ${lessonTitle}
${category ? `Catégorie : ${category}` : ''}
Niveau : ${difficulty ?? 'debutant'}
${directionSheetBlock(directionSheet)}
L'apprenant consulte directement ce ${mediaKind} dans l'app — génère uniquement des questions pour vérifier sa compréhension, exactement ${count} questions, basées uniquement sur le contenu réel du ${mediaKind} (pas sur des connaissances générales).

Consignes :
- Exactement 4 options par question, une seule correcte.
${QUESTION_VARIETY_CONSIGNES}
- "correct_index" est l'index (0 à 3) de la bonne option dans le tableau "options".
- "explanation" justifie brièvement la bonne réponse, en français, de façon pédagogique.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: questionsOnlySchema,
    },
  });

  return readJsonResponse<{ questions: GeneratedQuestion[] }>(response.text).questions;
}

export interface QuestionReview {
  verdict: 'ok' | 'a_corriger';
  comment: string;
}

interface ReviewQuestionParams {
  lessonTitle: string;
  questionText: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

/**
 * Relecture IA d'une question générée automatiquement, pour aider
 * l'instructeur humain à valider ou corriger plus vite (section
 * "Évaluations" du dashboard instructeur).
 */
export async function reviewQuestion({
  lessonTitle,
  questionText,
  options,
  correctIndex,
  explanation,
}: ReviewQuestionParams): Promise<QuestionReview> {
  const response = await getClient().models.generateContent({
    model: MODEL,
    contents: `Tu es relecteur pédagogique pour ANTA, une plateforme d'apprentissage de l'anglais pour de jeunes Africains (Côte d'Ivoire). Un instructeur doit valider ou corriger cette question de quiz générée par IA pour la leçon « ${lessonTitle} ».

Question : ${questionText}
Options : ${options.map((option, index) => `${index}) ${option}`).join(' ; ')}
Réponse marquée correcte : ${correctIndex}) ${options[correctIndex] ?? ''}
${explanation ? `Explication fournie : ${explanation}` : "Aucune explication fournie."}

Vérifie que : la question est claire et sans ambiguïté, une seule option est réellement correcte, les mauvaises options ne sont pas trivialement fausses ou absurdes, il n'y a pas de faute d'anglais ou de français.

Réponds avec :
- "verdict" : "ok" si la question est correcte et publiable telle quelle, "a_corriger" sinon.
- "comment" : une phrase en français expliquant ton verdict (si "a_corriger", précise le problème exact et comment le corriger).`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          verdict: { type: Type.STRING, enum: ['ok', 'a_corriger'] },
          comment: { type: Type.STRING },
        },
        required: ['verdict', 'comment'],
      },
    },
  });

  return readJsonResponse<QuestionReview>(response.text);
}
