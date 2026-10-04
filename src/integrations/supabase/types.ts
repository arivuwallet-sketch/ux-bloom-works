export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      audit_requests: {
        Row: {
          budget_range: string | null;
          company: string | null;
          created_at: string;
          email: string;
          id: string;
          message: string | null;
          name: string;
          product_type: string;
          product_url: string | null;
        };
        Insert: {
          budget_range?: string | null;
          company?: string | null;
          created_at?: string;
          email: string;
          id?: string;
          message?: string | null;
          name: string;
          product_type: string;
          product_url?: string | null;
        };
        Update: {
          budget_range?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string;
          id?: string;
          message?: string | null;
          name?: string;
          product_type?: string;
          product_url?: string | null;
        };
        Relationships: [];
      };
      credit_purchases: {
        Row: {
          amount: number;
          cf_payment_id: string | null;
          created_at: string;
          credits: number;
          currency: string;
          id: string;
          order_id: string;
          pack_id: string;
          paid_at: string | null;
          status: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          cf_payment_id?: string | null;
          created_at?: string;
          credits: number;
          currency: string;
          id?: string;
          order_id: string;
          pack_id: string;
          paid_at?: string | null;
          status?: string;
          user_id: string;
        };
        Update: {
          amount?: number;
          cf_payment_id?: string | null;
          created_at?: string;
          credits?: number;
          currency?: string;
          id?: string;
          order_id?: string;
          pack_id?: string;
          paid_at?: string | null;
          status?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      project_design_plans: {
        Row: {
          created_at: string;
          dependency_graph: Json;
          error: string | null;
          plan: Json;
          project_id: string;
          source_signature: string;
          status: string;
          style_signature: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          dependency_graph?: Json;
          error?: string | null;
          plan?: Json;
          project_id: string;
          source_signature: string;
          status?: string;
          style_signature: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          dependency_graph?: Json;
          error?: string | null;
          plan?: Json;
          project_id?: string;
          source_signature?: string;
          status?: string;
          style_signature?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_design_plans_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_files: {
        Row: {
          content: string | null;
          created_at: string;
          id: string;
          name: string;
          project_id: string;
          redesign_error: string | null;
          redesigned_content: string | null;
          size_bytes: number | null;
          source: string;
          status: string;
          storage_path: string | null;
          target_style: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          content?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          project_id: string;
          redesign_error?: string | null;
          redesigned_content?: string | null;
          size_bytes?: number | null;
          source?: string;
          status?: string;
          storage_path?: string | null;
          target_style?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          content?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          project_id?: string;
          redesign_error?: string | null;
          redesigned_content?: string | null;
          size_bytes?: number | null;
          source?: string;
          status?: string;
          storage_path?: string | null;
          target_style?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_seo_files: {
        Row: {
          created_at: string;
          error: string | null;
          project_file_id: string;
          project_id: string;
          seo_content: string | null;
          source_signature: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          error?: string | null;
          project_file_id: string;
          project_id: string;
          seo_content?: string | null;
          source_signature: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          error?: string | null;
          project_file_id?: string;
          project_id?: string;
          seo_content?: string | null;
          source_signature?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_seo_files_project_file_id_fkey";
            columns: ["project_file_id"];
            isOneToOne: true;
            referencedRelation: "project_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "project_seo_files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_seo_plans: {
        Row: {
          audit_after: Json | null;
          audit_before: Json;
          created_at: string;
          error: string | null;
          plan: Json;
          project_id: string;
          score_after: number | null;
          score_before: number | null;
          source_mode: string;
          source_signature: string;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          audit_after?: Json | null;
          audit_before?: Json;
          created_at?: string;
          error?: string | null;
          plan?: Json;
          project_id: string;
          score_after?: number | null;
          score_before?: number | null;
          source_mode?: string;
          source_signature: string;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          audit_after?: Json | null;
          audit_before?: Json;
          created_at?: string;
          error?: string | null;
          plan?: Json;
          project_id?: string;
          score_after?: number | null;
          score_before?: number | null;
          source_mode?: string;
          source_signature?: string;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_seo_plans_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_unlocks: {
        Row: {
          created_at: string;
          project_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          project_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          project_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_unlocks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          notes: string | null;
          product_type: string;
          status: string;
          style_mode: string;
          target_style: string | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          notes?: string | null;
          product_type?: string;
          status?: string;
          style_mode?: string;
          target_style?: string | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          product_type?: string;
          status?: string;
          style_mode?: string;
          target_style?: string | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      redesign_chats: {
        Row: {
          content: string;
          created_at: string;
          file_name: string | null;
          id: string;
          project_id: string;
          role: string;
          user_id: string;
        };
        Insert: {
          content: string;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          project_id: string;
          role: string;
          user_id: string;
        };
        Update: {
          content?: string;
          created_at?: string;
          file_name?: string | null;
          id?: string;
          project_id?: string;
          role?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "redesign_chats_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      user_credits: {
        Row: {
          balance: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          balance?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          balance?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      fulfill_credit_purchase: {
        Args: { _cf_payment_id: string; _order_id: string };
        Returns: boolean;
      };
      unlock_project: { Args: { _project_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
