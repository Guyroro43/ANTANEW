export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          full_name: string;
          avatar_url: string | null;
          english_level: 'debutant' | 'intermediaire' | 'avance';
          country: string | null;
          role: 'user' | 'instructor' | 'founder' | 'founder_instructor' | 'developer';
          level: string;
          total_xp: number;
          subscription_plan: 'starter' | 'premium';
          subscription_expires_at: string | null;
          email: string | null;
          notifications_enabled: boolean;
          placement_topic: string | null;
          placement_test_completed: boolean;
          progress_summary: string | null;
          progress_summary_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          avatar_url?: string | null;
          english_level?: 'debutant' | 'intermediaire' | 'avance';
          country?: string | null;
          role?: 'user' | 'instructor' | 'founder' | 'founder_instructor' | 'developer';
          email?: string | null;
          level?: string;
          total_xp?: number;
          subscription_plan?: 'starter' | 'premium';
          subscription_expires_at?: string | null;
          notifications_enabled?: boolean;
          placement_topic?: string | null;
          placement_test_completed?: boolean;
          progress_summary?: string | null;
          progress_summary_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      modules: {
        Row: {
          id: string;
          slug: string;
          title: string;
          description: string | null;
          image_url: string | null;
          is_premium: boolean;
          xp_reward: number;
          order_index: number;
          is_published: boolean;
          difficulty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          description?: string | null;
          image_url?: string | null;
          is_premium?: boolean;
          xp_reward?: number;
          order_index?: number;
          is_published?: boolean;
          difficulty?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['modules']['Insert']>;
        Relationships: [];
      };
      lessons: {
        Row: {
          id: string;
          module_id: string;
          title: string;
          description: string | null;
          category: string | null;
          difficulty: string | null;
          order_index: number;
          is_published: boolean;
          content_type: 'qcm' | 'pdf' | 'video' | 'audio';
          content_url: string | null;
          source_pdf_path: string | null;
          access_level: 'free' | 'premium' | 'all';
          created_at: string;
        };
        Insert: {
          id?: string;
          module_id: string;
          title: string;
          description?: string | null;
          category?: string | null;
          difficulty?: string | null;
          order_index?: number;
          is_published?: boolean;
          content_type?: 'qcm' | 'pdf' | 'video' | 'audio';
          content_url?: string | null;
          source_pdf_path?: string | null;
          access_level?: 'free' | 'premium' | 'all';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lessons']['Insert']>;
        Relationships: [];
      };
      questions: {
        Row: {
          id: string;
          lesson_id: string;
          question_text: string;
          options: Json;
          correct_index: number;
          explanation: string | null;
          order_index: number;
          status: 'draft' | 'approved';
          source: 'manual' | 'ai';
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          question_text: string;
          options?: Json;
          correct_index?: number;
          explanation?: string | null;
          order_index?: number;
          status?: 'draft' | 'approved';
          source?: 'manual' | 'ai';
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['questions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'questions_lesson_id_fkey';
            columns: ['lesson_id'];
            isOneToOne: false;
            referencedRelation: 'lessons';
            referencedColumns: ['id'];
          },
        ];
      };
      lesson_vocabulary: {
        Row: {
          id: string;
          lesson_id: string;
          word: string;
          definition: string;
          example: string | null;
          audio_url: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          lesson_id: string;
          word: string;
          definition: string;
          example?: string | null;
          audio_url?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['lesson_vocabulary']['Insert']>;
        Relationships: [];
      };
      progress: {
        Row: {
          id: string;
          user_id: string;
          lesson_id: string;
          completed: boolean;
          score: number;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lesson_id: string;
          completed?: boolean;
          score?: number;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['progress']['Insert']>;
        Relationships: [];
      };
      streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_activity_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_activity_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['streaks']['Insert']>;
        Relationships: [];
      };
      xp_logs: {
        Row: {
          id: string;
          user_id: string;
          xp_earned: number;
          reason: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          xp_earned: number;
          reason: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['xp_logs']['Insert']>;
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string;
          icon: string;
          xp_required: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description: string;
          icon?: string;
          xp_required?: number | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['badges']['Insert']>;
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: Partial<Database['public']['Tables']['user_badges']['Insert']>;
        Relationships: [];
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          currency: string;
          status: 'pending' | 'success' | 'failed' | 'refunded';
          payment_method: string | null;
          provider: 'stripe' | 'cinetpay' | null;
          provider_reference: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          currency?: string;
          status?: 'pending' | 'success' | 'failed' | 'refunded';
          payment_method?: string | null;
          provider?: 'stripe' | 'cinetpay' | null;
          provider_reference?: string | null;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>;
        Relationships: [];
      };
      role_changes: {
        Row: {
          id: string;
          user_id: string;
          previous_role: string;
          new_role: string;
          changed_by: string | null;
          changed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          previous_role: string;
          new_role: string;
          changed_by?: string | null;
          changed_at?: string;
        };
        Update: Partial<Database['public']['Tables']['role_changes']['Insert']>;
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          author_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          author_id: string;
          content: string;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['messages']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'messages_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      placement_questions: {
        Row: {
          id: string;
          topic: string;
          order_index: number;
          question_text: string;
          options: Json;
          correct_index: number;
          difficulty: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          topic: string;
          order_index?: number;
          question_text: string;
          options: Json;
          correct_index: number;
          difficulty?: number;
          created_at?: string;
        };
        Update: Partial<Database['public']['Tables']['placement_questions']['Insert']>;
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      admin_update_profile: {
        Args: { p_user_id: string; p_role?: string | null; p_subscription_plan?: string | null };
        Returns: void;
      };
      get_leaderboard: {
        Args: { p_limit?: number };
        Returns: {
          rank: number;
          id: string;
          first_name: string;
          avatar_url: string | null;
          level: string;
          total_xp: number;
        }[];
      };
      get_my_rank: {
        Args: Record<PropertyKey, never>;
        Returns: number | null;
      };
      complete_lesson: {
        Args: { p_lesson_id: string; p_score?: number | null };
        Returns: {
          xp_earned: number;
          total_xp: number;
          current_streak: number;
          new_badges: { slug: string; name: string; icon: string }[];
        };
      };
      get_placement_test: {
        Args: Record<PropertyKey, never>;
        Returns: {
          question_id: string;
          topic: string;
          order_index: number;
          question_text: string;
          options: Json;
        }[];
      };
      submit_placement_test: {
        Args: { p_answers: Json };
        Returns: {
          level: 'debutant' | 'intermediaire' | 'avance';
          correct_count: number;
          total: number;
        }[];
      };
      purge_expired_messages: {
        Args: Record<PropertyKey, never>;
        Returns: void;
      };
    };
  };
}
