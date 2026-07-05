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
          role: 'user' | 'admin';
          level: string;
          total_xp: number;
          subscription_plan: 'starter' | 'premium';
          subscription_expires_at: string | null;
          email: string | null;
          notifications_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          avatar_url?: string | null;
          english_level?: 'debutant' | 'intermediaire' | 'avance';
          country?: string | null;
          role?: 'user' | 'admin';
          email?: string | null;
          level?: string;
          total_xp?: number;
          subscription_plan?: 'starter' | 'premium';
          subscription_expires_at?: string | null;
          notifications_enabled?: boolean;
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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
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
        };
      };
    };
  };
}
