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
      alerts: {
        Row: {
          action_url: string | null
          body: string | null
          business_id: string
          created_at: string
          dismissed: boolean | null
          id: string
          severity: string
          title: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          business_id: string
          created_at?: string
          dismissed?: boolean | null
          id?: string
          severity: string
          title: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          business_id?: string
          created_at?: string
          dismissed?: boolean | null
          id?: string
          severity?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string | null
          balance: number | null
          bank_name: string
          business_id: string
          created_at: string
          id: string
          last_sync: string | null
        }
        Insert: {
          account_number?: string | null
          balance?: number | null
          bank_name: string
          business_id: string
          created_at?: string
          id?: string
          last_sync?: string | null
        }
        Update: {
          account_number?: string | null
          balance?: number | null
          bank_name?: string
          business_id?: string
          created_at?: string
          id?: string
          last_sync?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          business_name: string
          business_type: string | null
          created_at: string
          employee_count: string | null
          founding_member: boolean | null
          gstin: string | null
          id: string
          industry: string | null
          msme_udyam: string | null
          plan: string | null
          razorpay_customer_id: string | null
          state: string | null
          subscription_status: string | null
          turnover_range: string | null
          updated_at: string
        }
        Insert: {
          business_name: string
          business_type?: string | null
          created_at?: string
          employee_count?: string | null
          founding_member?: boolean | null
          gstin?: string | null
          id?: string
          industry?: string | null
          msme_udyam?: string | null
          plan?: string | null
          razorpay_customer_id?: string | null
          state?: string | null
          subscription_status?: string | null
          turnover_range?: string | null
          updated_at?: string
        }
        Update: {
          business_name?: string
          business_type?: string | null
          created_at?: string
          employee_count?: string | null
          founding_member?: boolean | null
          gstin?: string | null
          id?: string
          industry?: string | null
          msme_udyam?: string | null
          plan?: string | null
          razorpay_customer_id?: string | null
          state?: string | null
          subscription_status?: string | null
          turnover_range?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ca_activity_log: {
        Row: {
          action_type: string
          business_id: string | null
          ca_firm_id: string
          created_at: string | null
          description: string | null
          id: string
        }
        Insert: {
          action_type: string
          business_id?: string | null
          ca_firm_id: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Update: {
          action_type?: string
          business_id?: string | null
          ca_firm_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ca_activity_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ca_activity_log_ca_firm_id_fkey"
            columns: ["ca_firm_id"]
            isOneToOne: false
            referencedRelation: "ca_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      ca_client_access: {
        Row: {
          access_level: string | null
          business_id: string
          ca_firm_id: string
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
        }
        Insert: {
          access_level?: string | null
          business_id: string
          ca_firm_id: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
        }
        Update: {
          access_level?: string | null
          business_id?: string
          ca_firm_id?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_client_access_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ca_client_access_ca_firm_id_fkey"
            columns: ["ca_firm_id"]
            isOneToOne: false
            referencedRelation: "ca_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      ca_firm_members: {
        Row: {
          ca_firm_id: string
          created_at: string | null
          id: string
          invited_email: string
          role: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          ca_firm_id: string
          created_at?: string | null
          id?: string
          invited_email: string
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          ca_firm_id?: string
          created_at?: string | null
          id?: string
          invited_email?: string
          role?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_firm_members_ca_firm_id_fkey"
            columns: ["ca_firm_id"]
            isOneToOne: false
            referencedRelation: "ca_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      ca_firms: {
        Row: {
          city: string | null
          created_at: string | null
          email: string | null
          firm_name: string
          id: string
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          max_clients: number | null
          membership_number: string | null
          notification_prefs: Json | null
          phone: string | null
          plan_type: string | null
          state: string | null
          updated_at: string | null
          user_id: string
          whatsapp_phone: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          firm_name: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          max_clients?: number | null
          membership_number?: string | null
          notification_prefs?: Json | null
          phone?: string | null
          plan_type?: string | null
          state?: string | null
          updated_at?: string | null
          user_id: string
          whatsapp_phone?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          email?: string | null
          firm_name?: string
          id?: string
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          max_clients?: number | null
          membership_number?: string | null
          notification_prefs?: Json | null
          phone?: string | null
          plan_type?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      ca_notifications: {
        Row: {
          business_id: string | null
          ca_firm_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          severity: string | null
          title: string
          type: string
        }
        Insert: {
          business_id?: string | null
          ca_firm_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          severity?: string | null
          title: string
          type: string
        }
        Update: {
          business_id?: string | null
          ca_firm_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          severity?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ca_notifications_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ca_notifications_ca_firm_id_fkey"
            columns: ["ca_firm_id"]
            isOneToOne: false
            referencedRelation: "ca_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      ca_reports_log: {
        Row: {
          business_id: string | null
          ca_firm_id: string
          created_at: string | null
          file_url: string | null
          id: string
          period: string | null
          report_type: string
          sent_to: string | null
          status: string | null
        }
        Insert: {
          business_id?: string | null
          ca_firm_id: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          period?: string | null
          report_type: string
          sent_to?: string | null
          status?: string | null
        }
        Update: {
          business_id?: string | null
          ca_firm_id?: string
          created_at?: string | null
          file_url?: string | null
          id?: string
          period?: string | null
          report_type?: string
          sent_to?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ca_reports_log_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ca_reports_log_ca_firm_id_fkey"
            columns: ["ca_firm_id"]
            isOneToOne: false
            referencedRelation: "ca_firms"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_events: {
        Row: {
          business_id: string
          created_at: string
          due_date: string
          filing_name: string
          filing_type: string
          id: string
          notes: string | null
          status: string | null
          urgency: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          due_date: string
          filing_name: string
          filing_type: string
          id?: string
          notes?: string | null
          status?: string | null
          urgency?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          due_date?: string
          filing_name?: string
          filing_type?: string
          id?: string
          notes?: string | null
          status?: string | null
          urgency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_events_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      gst_itc_lines: {
        Row: {
          business_id: string
          created_at: string
          id: string
          itc_at_risk: number | null
          itc_safe: number | null
          mismatch_count: number | null
          period: string
          status: string | null
          vendor_gstin: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          itc_at_risk?: number | null
          itc_safe?: number | null
          mismatch_count?: number | null
          period: string
          status?: string | null
          vendor_gstin?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          itc_at_risk?: number | null
          itc_safe?: number | null
          mismatch_count?: number | null
          period?: string
          status?: string | null
          vendor_gstin?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gst_itc_lines_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      gst_notice_risk_scores: {
        Row: {
          business_id: string
          computed_at: string
          factors: Json | null
          id: string
          score: number
        }
        Insert: {
          business_id: string
          computed_at?: string
          factors?: Json | null
          id?: string
          score?: number
        }
        Update: {
          business_id?: string
          computed_at?: string
          factors?: Json | null
          id?: string
          score?: number
        }
        Relationships: [
          {
            foreignKeyName: "gst_notice_risk_scores_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      nidhi_briefs: {
        Row: {
          brief_date: string
          business_id: string
          content: string
          created_at: string
          delivered: boolean | null
          id: string
        }
        Insert: {
          brief_date?: string
          business_id: string
          content: string
          created_at?: string
          delivered?: boolean | null
          id?: string
        }
        Update: {
          brief_date?: string
          business_id?: string
          content?: string
          created_at?: string
          delivered?: boolean | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nidhi_briefs_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      nidhi_conversations: {
        Row: {
          business_id: string
          content: string
          created_at: string
          id: string
          language: string | null
          role: string
          user_id: string
        }
        Insert: {
          business_id: string
          content: string
          created_at?: string
          id?: string
          language?: string | null
          role: string
          user_id: string
        }
        Update: {
          business_id?: string
          content?: string
          created_at?: string
          id?: string
          language?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nidhi_conversations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payables: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          due_date: string | null
          id: string
          invoice_number: string | null
          outstanding: number | null
          paid: number | null
          status: string | null
          vendor_name: string
        }
        Insert: {
          amount?: number
          business_id: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          outstanding?: number | null
          paid?: number | null
          status?: string | null
          vendor_name: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          outstanding?: number | null
          paid?: number | null
          status?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "payables_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_records: {
        Row: {
          business_id: string
          created_at: string
          esic_due: number | null
          headcount: number | null
          id: string
          month: string
          next_payroll_date: string | null
          pf_due: number | null
          total_payroll: number | null
        }
        Insert: {
          business_id: string
          created_at?: string
          esic_due?: number | null
          headcount?: number | null
          id?: string
          month: string
          next_payroll_date?: string | null
          pf_due?: number | null
          total_payroll?: number | null
        }
        Update: {
          business_id?: string
          created_at?: string
          esic_due?: number | null
          headcount?: number | null
          id?: string
          month?: string
          next_payroll_date?: string | null
          pf_due?: number | null
          total_payroll?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_records_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          business_id: string | null
          created_at: string
          display_name: string | null
          full_name: string | null
          id: string
          language_preference: string | null
          mobile: string | null
          notification_prefs: Json | null
          role: string | null
          updated_at: string
          user_id: string
          whatsapp_phone: string | null
        }
        Insert: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          mobile?: string | null
          notification_prefs?: Json | null
          role?: string | null
          updated_at?: string
          user_id: string
          whatsapp_phone?: string | null
        }
        Update: {
          avatar_url?: string | null
          business_id?: string | null
          created_at?: string
          display_name?: string | null
          full_name?: string | null
          id?: string
          language_preference?: string | null
          mobile?: string | null
          notification_prefs?: Json | null
          role?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      receivable_chases: {
        Row: {
          chase_date: string
          id: string
          method: string | null
          notes: string | null
          receivable_id: string
        }
        Insert: {
          chase_date?: string
          id?: string
          method?: string | null
          notes?: string | null
          receivable_id: string
        }
        Update: {
          chase_date?: string
          id?: string
          method?: string | null
          notes?: string | null
          receivable_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "receivable_chases_receivable_id_fkey"
            columns: ["receivable_id"]
            isOneToOne: false
            referencedRelation: "receivables"
            referencedColumns: ["id"]
          },
        ]
      }
      receivables: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          customer_name: string
          due_date: string | null
          id: string
          invoice_date: string | null
          invoice_number: string | null
          last_chase: string | null
          outstanding: number | null
          received: number | null
          risk_score: number | null
          status: string | null
        }
        Insert: {
          amount?: number
          business_id: string
          created_at?: string
          customer_name: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          last_chase?: string | null
          outstanding?: number | null
          received?: number | null
          risk_score?: number | null
          status?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          customer_name?: string
          due_date?: string | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string | null
          last_chase?: string | null
          outstanding?: number | null
          received?: number | null
          risk_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "receivables_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          business_id: string
          created_at: string
          id: string
          parameters: Json | null
          results: Json | null
          scenario_type: string
          shared_link: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          parameters?: Json | null
          results?: Json | null
          scenario_type: string
          shared_link?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          parameters?: Json | null
          results?: Json | null
          scenario_type?: string
          shared_link?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "simulations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          business_id: string
          category: string | null
          counterparty: string | null
          created_at: string
          date: string
          description: string | null
          direction: string
          id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          business_id: string
          category?: string | null
          counterparty?: string | null
          created_at?: string
          date: string
          description?: string | null
          direction: string
          id?: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          business_id?: string
          category?: string | null
          counterparty?: string | null
          created_at?: string
          date?: string
          description?: string | null
          direction?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_gst_health: {
        Row: {
          business_id: string
          compliance_score: number | null
          created_at: string
          id: string
          last_filed: string | null
          vendor_gstin: string | null
          vendor_name: string
        }
        Insert: {
          business_id: string
          compliance_score?: number | null
          created_at?: string
          id?: string
          last_filed?: string | null
          vendor_gstin?: string | null
          vendor_name: string
        }
        Update: {
          business_id?: string
          compliance_score?: number | null
          created_at?: string
          id?: string
          last_filed?: string | null
          vendor_gstin?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_gst_health_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_business_id: { Args: never; Returns: string }
      get_user_ca_firm_id: { Args: never; Returns: string }
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
