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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      about_sections: {
        Row: {
          body: string
          heading: string
          page: string
          position: number
          scripture: Json
          slug: string
          status: string
          version: string
        }
        Insert: {
          body: string
          heading: string
          page?: string
          position: number
          scripture?: Json
          slug: string
          status?: string
          version?: string
        }
        Update: {
          body?: string
          heading?: string
          page?: string
          position?: number
          scripture?: Json
          slug?: string
          status?: string
          version?: string
        }
        Relationships: []
      }
      ai_access_state: {
        Row: {
          key: string
          message: string
          status: number
        }
        Insert: {
          key: string
          message: string
          status: number
        }
        Update: {
          key?: string
          message?: string
          status?: number
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      brain_chunks: {
        Row: {
          approx_tokens: number | null
          body: string
          entry_number: number | null
          faith_layer: boolean
          id: string
          kind: string
          slug: string | null
          status: string
          story_number: string | null
          tags: string[]
          title: string
          version: string
        }
        Insert: {
          approx_tokens?: number | null
          body: string
          entry_number?: number | null
          faith_layer?: boolean
          id?: string
          kind: string
          slug?: string | null
          status?: string
          story_number?: string | null
          tags?: string[]
          title: string
          version?: string
        }
        Update: {
          approx_tokens?: number | null
          body?: string
          entry_number?: number | null
          faith_layer?: boolean
          id?: string
          kind?: string
          slug?: string | null
          status?: string
          story_number?: string | null
          tags?: string[]
          title?: string
          version?: string
        }
        Relationships: []
      }
      chat_reservations: {
        Row: {
          completed: boolean
          day: string
          id: string
          reserved_tokens: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          day: string
          id?: string
          reserved_tokens: number
          user_id: string
        }
        Update: {
          completed?: boolean
          day?: string
          id?: string
          reserved_tokens?: number
          user_id?: string
        }
        Relationships: []
      }
      consent_log: {
        Row: {
          consent_type: string
          created_at: string
          granted: boolean
          id: string
          text_version: string
          user_id: string
        }
        Insert: {
          consent_type: string
          created_at?: string
          granted: boolean
          id?: string
          text_version: string
          user_id: string
        }
        Update: {
          consent_type?: string
          created_at?: string
          granted?: boolean
          id?: string
          text_version?: string
          user_id?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      crisis_events: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      guide_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          included_question: string | null
          reply_to: string | null
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          included_question?: string | null
          reply_to?: string | null
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          included_question?: string | null
          reply_to?: string | null
        }
        Relationships: []
      }
      library_deeper: {
        Row: {
          also_related: Json
          chooser_heading: string
          entries: Json
          reach_beyond: Json
          status: string
          topic_number: number
          version: string
          words: Json
        }
        Insert: {
          also_related?: Json
          chooser_heading?: string
          entries?: Json
          reach_beyond?: Json
          status?: string
          topic_number: number
          version?: string
          words?: Json
        }
        Update: {
          also_related?: Json
          chooser_heading?: string
          entries?: Json
          reach_beyond?: Json
          status?: string
          topic_number?: number
          version?: string
          words?: Json
        }
        Relationships: []
      }
      library_pages: {
        Row: {
          home_line: string
          level1: string
          level2: string
          level3: string
          picture: string
          scripture: Json
          sentence: string
          slug: string
          status: string
          title: string
          topic_number: number
          try_text: string
          version: string
        }
        Insert: {
          home_line: string
          level1: string
          level2: string
          level3: string
          picture: string
          scripture?: Json
          sentence: string
          slug: string
          status?: string
          title: string
          topic_number: number
          try_text: string
          version?: string
        }
        Update: {
          home_line?: string
          level1?: string
          level2?: string
          level3?: string
          picture?: string
          scripture?: Json
          sentence?: string
          slug?: string
          status?: string
          title?: string
          topic_number?: number
          try_text?: string
          version?: string
        }
        Relationships: []
      }
      library_walk: {
        Row: {
          options: Json
          question: string
          status: string
          topic_number: number
          version: string
        }
        Insert: {
          options?: Json
          question: string
          status?: string
          topic_number: number
          version?: string
        }
        Update: {
          options?: Json
          question?: string
          status?: string
          topic_number?: number
          version?: string
        }
        Relationships: []
      }
      match_calls: {
        Row: {
          calls: number
          day: string
        }
        Insert: {
          calls?: number
          day: string
        }
        Update: {
          calls?: number
          day?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_confirmed_at: string | null
          consent_reviewed_at: string | null
          consent_save: boolean
          consent_share: boolean
          created_at: string
          privacy_notice_version: string | null
          settings: Json
          user_id: string
          verse_offered_at: string | null
        }
        Insert: {
          age_confirmed_at?: string | null
          consent_reviewed_at?: string | null
          consent_save?: boolean
          consent_share?: boolean
          created_at?: string
          privacy_notice_version?: string | null
          settings?: Json
          user_id: string
          verse_offered_at?: string | null
        }
        Update: {
          age_confirmed_at?: string | null
          consent_reviewed_at?: string | null
          consent_save?: boolean
          consent_share?: boolean
          created_at?: string
          privacy_notice_version?: string | null
          settings?: Json
          user_id?: string
          verse_offered_at?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          body: string
          contact: string | null
          created_at: string
          id: string
          topic_slug: string | null
        }
        Insert: {
          body: string
          contact?: string | null
          created_at?: string
          id?: string
          topic_slug?: string | null
        }
        Update: {
          body?: string
          contact?: string | null
          created_at?: string
          id?: string
          topic_slug?: string | null
        }
        Relationships: []
      }
      spend_ledger: {
        Row: {
          day: string
          requests: number
          tokens: number
          user_id: string
        }
        Insert: {
          day?: string
          requests?: number
          tokens?: number
          user_id: string
        }
        Update: {
          day?: string
          requests?: number
          tokens?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_save: { Args: { _user_id: string }; Returns: boolean }
      change_consent: {
        Args: { _granted: boolean; _type: string; _version: string }
        Returns: undefined
      }
      record_match_call: { Args: never; Returns: number }
      reserve_chat: {
        Args: { _budget: number; _user: string }
        Returns: string
      }
      save_chat_exchange: {
        Args: { _conversation?: string; _message?: string; _reply?: string }
        Returns: string
      }
      settle_chat: {
        Args: { _id: string; _tokens: number }
        Returns: undefined
      }
      submit_guide_message: {
        Args: { _body: string; _included_question?: string; _reply_to?: string }
        Returns: string
      }
      submit_question: {
        Args: { _body: string; _topic_slug: string }
        Returns: string
      }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
