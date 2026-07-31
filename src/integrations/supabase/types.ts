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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      commissions: {
        Row: {
          amount: number
          created_at: string
          from_user_id: string | null
          id: string
          note: string | null
          order_id: string | null
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_user_id?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_user_id?: string | null
          id?: string
          note?: string | null
          order_id?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          payment_method: string | null
          payment_screenshot_url: string | null
          processed_at: string | null
          product_id: string
          status: string
          upi_reference: string | null
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          processed_at?: string | null
          product_id: string
          status?: string
          upi_reference?: string | null
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_screenshot_url?: string | null
          processed_at?: string | null
          product_id?: string
          status?: string
          upi_reference?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_settings: {
        Row: {
          admin_charge: number
          daily_pair_cap: number
          id: number
          min_withdrawal: number
          monthly_repurchase: boolean
          payment_account_name: string
          qr_image_path: string
          qr_image_url: string
          refund_days: number
          tds_percent: number
          updated_at: string
          upi_id: string
          withdrawal_days: number
        }
        Insert: {
          admin_charge?: number
          daily_pair_cap?: number
          id?: number
          min_withdrawal?: number
          monthly_repurchase?: boolean
          payment_account_name?: string
          qr_image_path?: string
          qr_image_url?: string
          refund_days?: number
          tds_percent?: number
          updated_at?: string
          upi_id?: string
          withdrawal_days?: number
        }
        Update: {
          admin_charge?: number
          daily_pair_cap?: number
          id?: number
          min_withdrawal?: number
          monthly_repurchase?: boolean
          payment_account_name?: string
          qr_image_path?: string
          qr_image_url?: string
          refund_days?: number
          tds_percent?: number
          updated_at?: string
          upi_id?: string
          withdrawal_days?: number
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          direct_commission: number
          id: string
          image_url: string | null
          mrp: number
          name: string
          pair_bonus: number
          status: string
          stock: number
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          direct_commission?: number
          id?: string
          image_url?: string | null
          mrp: number
          name: string
          pair_bonus?: number
          status?: string
          stock?: number
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          direct_commission?: number
          id?: string
          image_url?: string | null
          mrp?: number
          name?: string
          pair_bonus?: number
          status?: string
          stock?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          kyc_status: string
          parent_id: string | null
          phone: string | null
          position: string | null
          referral_code: string
          sponsor_id: string | null
          upi_id: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          is_active?: boolean
          kyc_status?: string
          parent_id?: string | null
          phone?: string | null
          position?: string | null
          referral_code: string
          sponsor_id?: string | null
          upi_id?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          kyc_status?: string
          parent_id?: string | null
          phone?: string | null
          position?: string | null
          referral_code?: string
          sponsor_id?: string | null
          upi_id?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tree_stats: {
        Row: {
          left_count: number
          matched_pairs: number
          pairs_day: string
          pairs_today: number
          right_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          left_count?: number
          matched_pairs?: number
          pairs_day?: string
          pairs_today?: number
          right_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          left_count?: number
          matched_pairs?: number
          pairs_day?: string
          pairs_today?: number
          right_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          direct_income: number
          pair_income: number
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          direct_income?: number
          pair_income?: number
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          direct_income?: number
          pair_income?: number
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          net_amount: number
          processed_at: string | null
          status: string
          tds_amount: number
          upi_id: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          net_amount?: number
          processed_at?: string | null
          status?: string
          tds_amount?: number
          upi_id: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          net_amount?: number
          processed_at?: string | null
          status?: string
          tds_amount?: number
          upi_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      get_my_direct_team: {
        Args: never
        Returns: {
          created_at: string
          full_name: string
          id: string
          is_active: boolean
          member_position: string
          referral_code: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      process_order_approval: {
        Args: { _order_id: string }
        Returns: undefined
      }
      process_withdrawal_approval: {
        Args: { _withdrawal_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "member"
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
    Enums: {
      app_role: ["admin", "member"],
    },
  },
} as const
