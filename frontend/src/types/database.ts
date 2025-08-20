export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {

      admin_users: {
        Row: {
          email: string
          id: string
          is_active: boolean
          password: string
          role: string | null
        }
        Insert: {
          email: string
          id: string
          is_active?: boolean
          password: string
          role?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          password?: string
          role?: string | null
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          sort_order: number | null
          summary: string | null
          tags: Json | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          sort_order?: number | null
          summary?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          sort_order?: number | null
          summary?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      component_text_storage: {
        Row: {
          area: string | null
          content: string
          created_at: string | null
          description: string | null
          id: string
          key: string
          updated_at: string | null
        }
        Insert: {
          area?: string | null
          content: string
          created_at?: string | null
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
        }
        Update: {
          area?: string | null
          content?: string
          created_at?: string | null
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      contact_info: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          course_interest: string | null
          created_at: string | null
          id: string
          message: string
          name: string
          phone: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          course_interest?: string | null
          created_at?: string | null
          id?: string
          message: string
          name: string
          phone: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          course_interest?: string | null
          created_at?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }

      media_files: {
        Row: {
          alt_text: string | null
          created_at: string | null
          file_path: string
          file_size: number
          file_type: string | null
          filename: string
          height: number | null
          id: string
          mime_type: string | null
          updated_at: string | null
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string | null
          file_path: string
          file_size: number
          file_type?: string | null
          filename: string
          height?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string | null
          file_path?: string
          file_size?: number
          file_type?: string | null
          filename?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      page_configs: {
        Row: {
          config_data: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          grid_size: number | null
          id: string
          is_active: boolean | null
          is_published: boolean | null
          keywords: string | null
          layout_config: Json | null
          page_key: string | null
          page_name: string
          route: string | null
          sort_order: number | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          config_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          grid_size?: number | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          keywords?: string | null
          layout_config?: Json | null
          page_key?: string | null
          page_name: string
          route?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          config_data?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          grid_size?: number | null
          id?: string
          is_active?: boolean | null
          is_published?: boolean | null
          keywords?: string | null
          layout_config?: Json | null
          page_key?: string | null
          page_name?: string
          route?: string | null
          sort_order?: number | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }


      student_cases: {
        Row: {
          admitted_school: string | null
          created_at: string | null
          exam_score: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          sort_order: number | null
          testimonial: string | null
          undergraduate_school: string | null
          updated_at: string | null
          year: number | null
        }
        Insert: {
          admitted_school?: string | null
          created_at?: string | null
          exam_score?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          testimonial?: string | null
          undergraduate_school?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Update: {
          admitted_school?: string | null
          created_at?: string | null
          exam_score?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          testimonial?: string | null
          undergraduate_school?: string | null
          updated_at?: string | null
          year?: number | null
        }
        Relationships: []
      }
      teachers: {
        Row: {
          achievements: Json | null
          created_at: string | null
          description: string | null
          education_background: Json | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          sort_order: number | null
          teaching_subjects: Json | null
          updated_at: string | null
        }
        Insert: {
          achievements?: Json | null
          created_at?: string | null
          description?: string | null
          education_background?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          sort_order?: number | null
          teaching_subjects?: Json | null
          updated_at?: string | null
        }
        Update: {
          achievements?: Json | null
          created_at?: string | null
          description?: string | null
          education_background?: Json | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          sort_order?: number | null
          teaching_subjects?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }


      ui_configs: {
        Row: {
          component_type: string
          config_data: Json
          config_key: string
          config_name: string
          config_type: string
          config_value: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          page_scope: string[] | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          component_type: string
          config_data?: Json
          config_key: string
          config_name: string
          config_type?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_scope?: string[] | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          component_type?: string
          config_data?: Json
          config_key?: string
          config_name?: string
          config_type?: string
          config_value?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          page_scope?: string[] | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Type aliases for convenience
export type Course = Database['public']['Tables']['courses']['Row']
export type CourseInsert = Database['public']['Tables']['courses']['Insert']
export type CourseUpdate = Database['public']['Tables']['courses']['Update']

export type Teacher = Database['public']['Tables']['teachers']['Row']
export type TeacherInsert = Database['public']['Tables']['teachers']['Insert']
export type TeacherUpdate = Database['public']['Tables']['teachers']['Update']

export type StudentCase = Database['public']['Tables']['student_cases']['Row']
export type StudentCaseInsert = Database['public']['Tables']['student_cases']['Insert']
export type StudentCaseUpdate = Database['public']['Tables']['student_cases']['Update']

export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
export type ArticleUpdate = Database['public']['Tables']['articles']['Update']

export type MediaFile = Database['public']['Tables']['media_files']['Row']
export type MediaFileInsert = Database['public']['Tables']['media_files']['Insert']
export type MediaFileUpdate = Database['public']['Tables']['media_files']['Update']

export type PageConfig = Database['public']['Tables']['page_configs']['Row']
export type PageConfigInsert = Database['public']['Tables']['page_configs']['Insert']
export type PageConfigUpdate = Database['public']['Tables']['page_configs']['Update']

export type AdminUser = Database['public']['Tables']['admin_users']['Row']
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert']
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update']



export type ContactSubmission = Database['public']['Tables']['contact_submissions']['Row']
export type ContactSubmissionInsert = Database['public']['Tables']['contact_submissions']['Insert']
export type ContactSubmissionUpdate = Database['public']['Tables']['contact_submissions']['Update']

export type ContactInfo = Database['public']['Tables']['contact_info']['Row']
export type ContactInfoInsert = Database['public']['Tables']['contact_info']['Insert']
export type ContactInfoUpdate = Database['public']['Tables']['contact_info']['Update']



export type UIConfig = Database['public']['Tables']['ui_configs']['Row']
export type UIConfigInsert = Database['public']['Tables']['ui_configs']['Insert']
export type UIConfigUpdate = Database['public']['Tables']['ui_configs']['Update']

export type ComponentTextStorage = Database['public']['Tables']['component_text_storage']['Row']
export type ComponentTextStorageInsert = Database['public']['Tables']['component_text_storage']['Insert']
export type ComponentTextStorageUpdate = Database['public']['Tables']['component_text_storage']['Update']