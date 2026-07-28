export interface Persona {
  id: string;
  name: string;
  gender: 'female' | 'male';
  avatar: string;
  voiceId: string;
}

// Voix ElevenLabs (modèle eleven_multilingual_v2, une seule voix par
// personnage pour l'anglais et le français) — voir la bibliothèque
// ElevenLabs pour prévisualiser ou changer un voice_id.
export const PERSONAS: Persona[] = [
  { id: 'kora', name: 'Kora', gender: 'female', avatar: '/avatars/kora.png', voiceId: 'cgSgspJ2msm6clMCkdW9' }, // Jessica
  { id: 'amara', name: 'Amara', gender: 'female', avatar: '/avatars/amara.png', voiceId: 'Xb7hH8MSUJpSbSDYk0k2' }, // Alice
  { id: 'kwame', name: 'Kwame', gender: 'male', avatar: '/avatars/kwame.png', voiceId: 'iP95p4xoKVk53GoZ742B' }, // Chris
  { id: 'sango', name: 'Sango', gender: 'male', avatar: '/avatars/sango.png', voiceId: 'JBFqnCBsd6RMkjVDRZzb' }, // George
];

export function getPersona(id: string): Persona {
  return PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];
}
