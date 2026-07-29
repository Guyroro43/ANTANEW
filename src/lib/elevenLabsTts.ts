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

async function synthesizeSegment(text: string, voiceId: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY manquante.');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': apiKey,
      Accept: 'audio/mpeg',
    },
    // eleven_multilingual_v2 gère l'anglais et le français avec la même voix,
    // pas besoin d'un voice_id distinct par langue comme sur Google Cloud TTS.
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Échec ElevenLabs TTS (${response.status}): ${errorBody}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString('base64');
}

export interface SynthesizedSegment {
  audioContentBase64: string;
  lang: 'en' | 'fr';
}

export async function synthesizeSpeech(text: string, persona: Persona): Promise<SynthesizedSegment[]> {
  const segments = splitIntoSpeechSegments(text);
  const results: SynthesizedSegment[] = [];

  // Séquentiel, et un segment qui échoue (ex. limite de requêtes simultanées
  // du palier gratuit ElevenLabs) est simplement ignoré plutôt que de faire
  // échouer tout le message — sinon la ligne 💡 (toujours en français) qui
  // rate emportait aussi les segments anglais pourtant réussis.
  for (const segment of segments) {
    try {
      const audioContentBase64 = await synthesizeSegment(segment.text, persona.voiceId);
      results.push({ audioContentBase64, lang: segment.lang });
    } catch {
      // Segment ignoré : le reste du message continue d'être synthétisé.
    }
  }

  return results;
}
