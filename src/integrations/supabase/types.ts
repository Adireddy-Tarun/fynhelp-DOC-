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
      auth_link_events: {
        Row: {
          created_at: string
          description: string | null
          error_code: string | null
          flow: string
          id: string
          reason: string
          route: string | null
          source: string
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          error_code?: string | null
          flow?: string
          id?: string
          reason: string
          route?: string | null
          source?: string
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          error_code?: string | null
          flow?: string
          id?: string
          reason?: string
          route?: string | null
          source?: string
          user_agent?: string | null
        }
        Relationships: []
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
      ca_access_requests: {
        Row: {
          access_level: string
          business_id: string | null
          ca_firm_id: string
          created_at: string
          id: string
          message: string | null
          responded_at: string | null
          responded_by: string | null
          status: string
          target_email: string | null
          target_gstin: string
          updated_at: string
        }
        Insert: {
          access_level?: string
          business_id?: string | null
          ca_firm_id: string
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          target_email?: string | null
          target_gstin: string
          updated_at?: string
        }
        Update: {
          access_level?: string
          business_id?: string | null
          ca_firm_id?: string
          created_at?: string
          id?: string
          message?: string | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          target_email?: string | null
          target_gstin?: string
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
      ca_report_schedules: {
        Row: {
          ca_firm_id: string
          clients: Json | null
          created_at: string
          day_of_month: number | null
          delivery: Json | null
          frequency: string
          id: string
          is_active: boolean | null
          last_generated_at: string | null
          next_generation_at: string | null
          report_name: string | null
          report_type: string
          scope: string | null
          updated_at: string
        }
        Insert: {
          ca_firm_id: string
          clients?: Json | null
          created_at?: string
          day_of_month?: number | null
          delivery?: Json | null
          frequency: string
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          next_generation_at?: string | null
          report_name?: string | null
          report_type: string
          scope?: string | null
          updated_at?: string
        }
        Update: {
          ca_firm_id?: string
          clients?: Json | null
          created_at?: string
          day_of_month?: number | null
          delivery?: Json | null
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          next_generation_at?: string | null
          report_name?: string | null
          report_type?: string
          scope?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      ca_reports_log: {
        Row: {
          business_id: string | null
          ca_firm_id: string
          created_at: string | null
          file_path: string | null
          file_size: number | null
          file_url: string | null
          generated_by_user_id: string | null
          id: string
          period: string | null
          period_end: string | null
          period_start: string | null
          report_name: string | null
          report_type: string
          sent_to: string | null
          status: string | null
        }
        Insert: {
          business_id?: string | null
          ca_firm_id: string
          created_at?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          generated_by_user_id?: string | null
          id?: string
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          report_name?: string | null
          report_type: string
          sent_to?: string | null
          status?: string | null
        }
        Update: {
          business_id?: string | null
          ca_firm_id?: string
          created_at?: string | null
          file_path?: string | null
          file_size?: number | null
          file_url?: string | null
          generated_by_user_id?: string | null
          id?: string
          period?: string | null
          period_end?: string | null
          period_start?: string | null
          report_name?: string | null
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
      callback_requests: {
        Row: {
          created_at: string
          id: string
          name: string | null
          notes: string | null
          phone: string
          source: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          phone: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          notes?: string | null
          phone?: string
          source?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
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
      csv_uploads: {
        Row: {
          business_id: string
          created_at: string
          error_message: string | null
          file_hash: string | null
          file_name: string
          file_size: number
          id: string
          max_date: string | null
          min_date: string | null
          row_count: number
          status: string
          upload_type: string
          uploaded_by: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          error_message?: string | null
          file_hash?: string | null
          file_name: string
          file_size?: number
          id?: string
          max_date?: string | null
          min_date?: string | null
          row_count?: number
          status?: string
          upload_type: string
          uploaded_by?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          error_message?: string | null
          file_hash?: string | null
          file_name?: string
          file_size?: number
          id?: string
          max_date?: string | null
          min_date?: string | null
          row_count?: number
          status?: string
          upload_type?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      early_access_requests: {
        Row: {
          created_at: string
          email: string
          id: string
          requested_module: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          requested_module: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          requested_module?: string
          user_id?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          created_at: string
          ctc_annual: number | null
          date_of_exit: string | null
          date_of_joining: string | null
          department: string | null
          designation: string | null
          email: string | null
          esic_number: string | null
          id: string
          metadata: Json | null
          name: string
          org_id: string
          pf_number: string | null
          salary_monthly: number | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          ctc_annual?: number | null
          date_of_exit?: string | null
          date_of_joining?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          esic_number?: string | null
          id?: string
          metadata?: Json | null
          name: string
          org_id: string
          pf_number?: string | null
          salary_monthly?: number | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          ctc_annual?: number | null
          date_of_exit?: string | null
          date_of_joining?: string | null
          department?: string | null
          designation?: string | null
          email?: string | null
          esic_number?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          org_id?: string
          pf_number?: string | null
          salary_monthly?: number | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      gst_filings: {
        Row: {
          acknowledgement_number: string | null
          arn_number: string | null
          business_id: string
          created_at: string
          due_date: string
          filed_date: string | null
          filing_period: string
          id: string
          input_tax_credit: number | null
          notes: string | null
          output_tax: number | null
          return_type: string
          status: string
          tax_payable: number | null
          taxable_sales: number | null
          updated_at: string
        }
        Insert: {
          acknowledgement_number?: string | null
          arn_number?: string | null
          business_id: string
          created_at?: string
          due_date: string
          filed_date?: string | null
          filing_period: string
          id?: string
          input_tax_credit?: number | null
          notes?: string | null
          output_tax?: number | null
          return_type: string
          status?: string
          tax_payable?: number | null
          taxable_sales?: number | null
          updated_at?: string
        }
        Update: {
          acknowledgement_number?: string | null
          arn_number?: string | null
          business_id?: string
          created_at?: string
          due_date?: string
          filed_date?: string | null
          filing_period?: string
          id?: string
          input_tax_credit?: number | null
          notes?: string | null
          output_tax?: number | null
          return_type?: string
          status?: string
          tax_payable?: number | null
          taxable_sales?: number | null
          updated_at?: string
        }
        Relationships: []
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
      payroll_snapshots: {
        Row: {
          business_id: string
          created_at: string
          employee_count: number | null
          esic_total: number | null
          id: string
          month: string
          pf_total: number | null
          processed_date: string | null
          tds_total: number | null
          total_deductions: number | null
          total_gross: number | null
          total_net: number | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          employee_count?: number | null
          esic_total?: number | null
          id?: string
          month: string
          pf_total?: number | null
          processed_date?: string | null
          tds_total?: number | null
          total_deductions?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          employee_count?: number | null
          esic_total?: number | null
          id?: string
          month?: string
          pf_total?: number | null
          processed_date?: string | null
          tds_total?: number | null
          total_deductions?: number | null
          total_gross?: number | null
          total_net?: number | null
          updated_at?: string
        }
        Relationships: []
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
      realtime_event_log: {
        Row: {
          business_id: string | null
          ca_firm_id: string | null
          channel_name: string
          context: Json
          emitted_by: string | null
          event_type: string
          handler_status: string
          id: string
          occurred_at: string
          row_id: string | null
          schema_name: string
          table_name: string
        }
        Insert: {
          business_id?: string | null
          ca_firm_id?: string | null
          channel_name: string
          context?: Json
          emitted_by?: string | null
          event_type: string
          handler_status?: string
          id?: string
          occurred_at?: string
          row_id?: string | null
          schema_name?: string
          table_name: string
        }
        Update: {
          business_id?: string | null
          ca_firm_id?: string | null
          channel_name?: string
          context?: Json
          emitted_by?: string | null
          event_type?: string
          handler_status?: string
          id?: string
          occurred_at?: string
          row_id?: string | null
          schema_name?: string
          table_name?: string
        }
        Relationships: []
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
      resources: {
        Row: {
          created_at: string
          description: string
          file_path: string | null
          file_url: string | null
          format: string
          icon_path: string | null
          icon_url: string | null
          id: string
          is_published: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          file_path?: string | null
          file_url?: string | null
          format?: string
          icon_path?: string | null
          icon_url?: string | null
          id: string
          is_published?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          file_path?: string | null
          file_url?: string | null
          format?: string
          icon_path?: string | null
          icon_url?: string | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      roadmap_stops: {
        Row: {
          color: string
          created_at: string
          description: string
          emoji: string
          href: string
          id: string
          name: string
          side: string
          sort_order: number
          status: string
          stop_number: number
          updated_at: string
          widget: string
          x_pct: number
          y_pct: number
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string
          emoji?: string
          href?: string
          id?: string
          name: string
          side?: string
          sort_order?: number
          status?: string
          stop_number: number
          updated_at?: string
          widget?: string
          x_pct?: number
          y_pct?: number
        }
        Update: {
          color?: string
          created_at?: string
          description?: string
          emoji?: string
          href?: string
          id?: string
          name?: string
          side?: string
          sort_order?: number
          status?: string
          stop_number?: number
          updated_at?: string
          widget?: string
          x_pct?: number
          y_pct?: number
        }
        Relationships: []
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
      tds_filings: {
        Row: {
          acknowledgement_number: string | null
          business_id: string
          challan_number: string | null
          created_at: string
          due_date: string
          filed_date: string | null
          form_type: string
          id: string
          notes: string | null
          quarter: string
          status: string
          total_tds_deducted: number | null
          total_tds_deposited: number | null
          updated_at: string
        }
        Insert: {
          acknowledgement_number?: string | null
          business_id: string
          challan_number?: string | null
          created_at?: string
          due_date: string
          filed_date?: string | null
          form_type: string
          id?: string
          notes?: string | null
          quarter: string
          status?: string
          total_tds_deducted?: number | null
          total_tds_deposited?: number | null
          updated_at?: string
        }
        Update: {
          acknowledgement_number?: string | null
          business_id?: string
          challan_number?: string | null
          created_at?: string
          due_date?: string
          filed_date?: string | null
          form_type?: string
          id?: string
          notes?: string | null
          quarter?: string
          status?: string
          total_tds_deducted?: number | null
          total_tds_deposited?: number | null
          updated_at?: string
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      waitlist: {
        Row: {
          company_name: string
          company_size: string
          company_type: string
          created_at: string
          email: string
          id: string
          is_converted: boolean
          location: string
          name: string
          phone: string
          position: number
          updated_at: string
        }
        Insert: {
          company_name: string
          company_size: string
          company_type: string
          created_at?: string
          email: string
          id?: string
          is_converted?: boolean
          location: string
          name: string
          phone: string
          position: number
          updated_at?: string
        }
        Update: {
          company_name?: string
          company_size?: string
          company_type?: string
          created_at?: string
          email?: string
          id?: string
          is_converted?: boolean
          location?: string
          name?: string
          phone?: string
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      waitlist_signups: {
        Row: {
          business_name: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          source: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          source?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_waitlist_status: {
        Args: { _email: string }
        Returns: {
          email_exists: boolean
          total_count: number
        }[]
      }
      get_user_business_id: { Args: never; Returns: string }
      get_user_ca_firm_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "moderator"
        | "user"
        | "super_admin"
        | "ops_admin"
        | "support_agent"
        | "analyst"
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
      app_role: [
        "admin",
        "moderator",
        "user",
        "super_admin",
        "ops_admin",
        "support_agent",
        "analyst",
      ],
    },
  },
} as const
