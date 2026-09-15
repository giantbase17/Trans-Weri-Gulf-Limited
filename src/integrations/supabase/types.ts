export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      customers: {
        Row: {
          address: string | null;
          company: string | null;
          created_at: string;
          email: string | null;
          full_name: string;
          id: string;
          notes: string | null;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string | null;
          full_name: string;
          id?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          company?: string | null;
          created_at?: string;
          email?: string | null;
          full_name?: string;
          id?: string;
          notes?: string | null;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      enquiries: {
        Row: {
          assigned_to: string | null;
          company: string | null;
          created_at: string;
          customer_id: string | null;
          email: string | null;
          end_date: string | null;
          equipment_id: string | null;
          equipment_name: string | null;
          full_name: string;
          id: string;
          internal_notes: string | null;
          message: string | null;
          phone: string;
          project_location: string | null;
          reference: string;
          rental_period: string | null;
          start_date: string | null;
          status: Database["public"]["Enums"]["enquiry_status"];
          updated_at: string;
        };
        Insert: {
          assigned_to?: string | null;
          company?: string | null;
          created_at?: string;
          customer_id?: string | null;
          email?: string | null;
          end_date?: string | null;
          equipment_id?: string | null;
          equipment_name?: string | null;
          full_name: string;
          id?: string;
          internal_notes?: string | null;
          message?: string | null;
          phone: string;
          project_location?: string | null;
          reference?: string;
          rental_period?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["enquiry_status"];
          updated_at?: string;
        };
        Update: {
          assigned_to?: string | null;
          company?: string | null;
          created_at?: string;
          customer_id?: string | null;
          email?: string | null;
          end_date?: string | null;
          equipment_id?: string | null;
          equipment_name?: string | null;
          full_name?: string;
          id?: string;
          internal_notes?: string | null;
          message?: string | null;
          phone?: string;
          project_location?: string | null;
          reference?: string;
          rental_period?: string | null;
          start_date?: string | null;
          status?: Database["public"]["Enums"]["enquiry_status"];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "enquiries_customer_id_fkey";
            columns: ["customer_id"];
            isOneToOne: false;
            referencedRelation: "customers";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "enquiries_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
        ];
      };
      equipment: {
        Row: {
          available_units: number;
          brand: string | null;
          category: Database["public"]["Enums"]["equipment_category"];
          created_at: string;
          currency: string;
          daily_rate: number | null;
          description: string | null;
          featured: boolean;
          id: string;
          location: string;
          low_stock_threshold: number;
          maintenance_units: number;
          model: string | null;
          monthly_rate: number | null;
          name: string;
          primary_image_url: string | null;
          published: boolean;
          quote_only: boolean;
          rented_units: number;
          slug: string;
          specifications: Json;
          status: Database["public"]["Enums"]["availability_status"];
          total_units: number;
          updated_at: string;
          weekly_rate: number | null;
        };
        Insert: {
          available_units?: number;
          brand?: string | null;
          category?: Database["public"]["Enums"]["equipment_category"];
          created_at?: string;
          currency?: string;
          daily_rate?: number | null;
          description?: string | null;
          featured?: boolean;
          id?: string;
          location?: string;
          low_stock_threshold?: number;
          maintenance_units?: number;
          model?: string | null;
          monthly_rate?: number | null;
          name: string;
          primary_image_url?: string | null;
          published?: boolean;
          quote_only?: boolean;
          rented_units?: number;
          slug: string;
          specifications?: Json;
          status?: Database["public"]["Enums"]["availability_status"];
          total_units?: number;
          updated_at?: string;
          weekly_rate?: number | null;
        };
        Update: {
          available_units?: number;
          brand?: string | null;
          category?: Database["public"]["Enums"]["equipment_category"];
          created_at?: string;
          currency?: string;
          daily_rate?: number | null;
          description?: string | null;
          featured?: boolean;
          id?: string;
          location?: string;
          low_stock_threshold?: number;
          maintenance_units?: number;
          model?: string | null;
          monthly_rate?: number | null;
          name?: string;
          primary_image_url?: string | null;
          published?: boolean;
          quote_only?: boolean;
          rented_units?: number;
          slug?: string;
          specifications?: Json;
          status?: Database["public"]["Enums"]["availability_status"];
          total_units?: number;
          updated_at?: string;
          weekly_rate?: number | null;
        };
        Relationships: [];
      };
      equipment_images: {
        Row: {
          alt: string | null;
          created_at: string;
          equipment_id: string;
          id: string;
          sort_order: number;
          url: string;
        };
        Insert: {
          alt?: string | null;
          created_at?: string;
          equipment_id: string;
          id?: string;
          sort_order?: number;
          url: string;
        };
        Update: {
          alt?: string | null;
          created_at?: string;
          equipment_id?: string;
          id?: string;
          sort_order?: number;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "equipment_images_equipment_id_fkey";
            columns: ["equipment_id"];
            isOneToOne: false;
            referencedRelation: "equipment";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          email: string | null;
          full_name: string | null;
          id: string;
          phone: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id: string;
          phone?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          phone?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      is_staff: { Args: { _user_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "admin" | "manager" | "staff";
      availability_status:
        "available" | "rented" | "maintenance" | "unavailable";
      enquiry_status: "new" | "contacted" | "quoted" | "won" | "lost";
      equipment_category:
        | "excavators"
        | "bulldozers"
        | "wheel_loaders"
        | "motor_graders"
        | "cranes"
        | "dump_trucks"
        | "generators"
        | "others";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
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
    Enums: {
      app_role: ["admin", "manager", "staff"],
      availability_status: [
        "available",
        "rented",
        "maintenance",
        "unavailable",
      ],
      enquiry_status: ["new", "contacted", "quoted", "won", "lost"],
      equipment_category: [
        "excavators",
        "bulldozers",
        "wheel_loaders",
        "motor_graders",
        "cranes",
        "dump_trucks",
        "generators",
        "others",
      ],
    },
  },
} as const;
