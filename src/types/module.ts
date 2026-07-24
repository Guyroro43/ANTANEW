import type { Database } from '@/types/database';

export type Module = Database['public']['Tables']['modules']['Row'];
export type ModuleInsert = Database['public']['Tables']['modules']['Insert'];
export type ModuleUpdate = Database['public']['Tables']['modules']['Update'];

export type Lesson = Database['public']['Tables']['lessons']['Row'];
export type LessonInsert = Database['public']['Tables']['lessons']['Insert'];
export type LessonUpdate = Database['public']['Tables']['lessons']['Update'];

export type Question = Database['public']['Tables']['questions']['Row'];
export type QuestionInsert = Database['public']['Tables']['questions']['Insert'];
export type QuestionUpdate = Database['public']['Tables']['questions']['Update'];

export type VocabularyItem = Database['public']['Tables']['lesson_vocabulary']['Row'];
export type VocabularyInsert = Database['public']['Tables']['lesson_vocabulary']['Insert'];
export type VocabularyUpdate = Database['public']['Tables']['lesson_vocabulary']['Update'];

export interface ModuleWithLessons extends Module {
  lessons: Lesson[];
}

export interface LessonWithQuestions extends Lesson {
  questions: Question[];
}
