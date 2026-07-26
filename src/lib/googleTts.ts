import { type Persona } from '@/lib/personas';

export interface SpeechSegment {
  text: string;
  lang: 'en' | 'fr';
}

const sanitizeForSpeech = (text: string) =>
  text
    .replace(/💡/g, '')
    .replace(/[*_#`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Découpe un message en segments par langue : dans le prompt de Kora, la
 * ligne de correction (préfixée "💡") est toujours en français, le reste
 * toujours en anglais — pas besoin de détection de langue générique.
 */
export function splitIntoSpeechSegments(text: string): SpeechSegment[] {
  return text
    .split('\n')
    .map((line) => ({ lang: (line.trim().startsWith('💡') ? 'fr' : 'en') as 'en' | 'fr', text: sanitizeForSpeech(line) }))
    .filter((segment) => segment.text.length > 0);
}

async function synthesizeSegment(text: string, languageCode: string, voiceName: string): Promise<string> {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  if (!apiKey) {
    throw new Error('GOOGLE_TTS_API_KEY manquante.');
  }

  const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode, name: voiceName },
      audioConfig: { audioEncoding: 'MP3' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Échec Google Cloud TTS (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as { audioContent: string };
  return data.audioContent;
}

export interface SynthesizedSegment {
  audioContentBase64: string;
  lang: 'en' | 'fr';
}

export async function synthesizeSpeech(text: string, persona: Persona): Promise<SynthesizedSegment[]> {
  const segments = splitIntoSpeechSegments(text);

  return Promise.all(
    segments.map(async (segment) => ({
      audioContentBase64: await synthesizeSegment(
        segment.text,
        segment.lang === 'fr' ? 'fr-FR' : 'en-US',
        segment.lang === 'fr' ? persona.frVoice : persona.enVoice,
      ),
      lang: segment.lang,
    })),
  );
}
