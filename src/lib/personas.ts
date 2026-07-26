export interface Persona {
  id: string;
  name: string;
  gender: 'female' | 'male';
  avatar: string;
  enVoice: string;
  frVoice: string;
}

// Voix Neural2 de Google Cloud TTS, appariées anglais/français par genre pour
// que chaque personnage garde un timbre cohérent selon la langue de la ligne.
export const PERSONAS: Persona[] = [
  { id: 'kora', name: 'Kora', gender: 'female', avatar: '/avatars/kora.png', enVoice: 'en-US-Neural2-F', frVoice: 'fr-FR-Neural2-A' },
  { id: 'amara', name: 'Amara', gender: 'female', avatar: '/avatars/amara.png', enVoice: 'en-US-Neural2-C', frVoice: 'fr-FR-Neural2-C' },
  { id: 'kwame', name: 'Kwame', gender: 'male', avatar: '/avatars/kwame.png', enVoice: 'en-US-Neural2-D', frVoice: 'fr-FR-Neural2-B' },
  { id: 'sango', name: 'Sango', gender: 'male', avatar: '/avatars/sango.png', enVoice: 'en-US-Neural2-A', frVoice: 'fr-FR-Neural2-D' },
];

export function getPersona(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
