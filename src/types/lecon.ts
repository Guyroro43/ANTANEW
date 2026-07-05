import type { Database } from '@/types/database';
import type { Lesson, Question } from '@/types/module';

export type Progress = Database['public']['Tables']['progress']['Row'];
export type ProgressInsert = Database['public']['Tables']['progress']['Insert'];

export interface ReponseQuestion {
  questionId: string;
  selectedIndex: number;
  isCorrect: boolean;
}

export interface ResultatLecon {
  lesson: Lesson;
  questions: Question[];
  reponses: ReponseQuestion[];
  score: number;
  xpGagne: number;
}
