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
      admin_audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json
          id: string
          ip_address: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json
          id?: string
          ip_address?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      ai_insights: {
        Row: {
          business_id: string
          confidence_score: number
          created_at: string
          data_quality: string
          generated_at: string
          id: string
          message: string
          module: string
        }
        Insert: {
          business_id: string
          confidence_score?: number
          created_at?: string
          data_quality?: string
          generated_at?: string
          id?: string
          message: string
          module: string
        }
        Update: {
          business_id?: string
          confidence_score?: number
          created_at?: string
          data_quality?: string
          generated_at?: string
          id?: string
          message?: string
          module?: string
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          business_id: string | null
          cost_usd: number | null
          created_at: string
          error_message: string | null
          id: string
          model: string
          prompt: string
          response: string | null
          response_time_ms: number | null
          status: string
          tokens_used: number | null
          user_id: string | null
        }
        Insert: {
          business_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          model?: string
          prompt: string
          response?: string | null
          response_time_ms?: number | null
          status?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Update: {
          business_id?: string | null
          cost_usd?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          model?: string
          prompt?: string
          response?: string | null
          response_time_ms?: number | null
          status?: string
          tokens_used?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          action_url: string | null
          body: string | null
          business_id: string
          created_at: string
          details: string | null
          dismissed: boolean | null
          id: string
          impact: string | null
          resolved: boolean
          severity: string
          suggested_action: string | null
          title: string
        }
        Insert: {
          action_url?: string | null
          body?: string | null
          business_id: string
          created_at?: string
          details?: string | null
          dismissed?: boolean | null
          id?: string
          impact?: string | null
          resolved?: boolean
          severity: string
          suggested_action?: string | null
          title: string
        }
        Update: {
          action_url?: string | null
          body?: string | null
          business_id?: string
          created_at?: string
          details?: string | null
          dismissed?: boolean | null
          id?: string
          impact?: string | null
          resolved?: boolean
          severity?: string
          suggested_action?: string | null
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
          connected: boolean
          created_at: string
          id: string
          last_sync: string | null
        }
        Insert: {
          account_number?: string | null
          balance?: number | null
          bank_name: string
          business_id: string
          connected?: boolean
          created_at?: string
          id?: string
          last_sync?: string | null
        }
        Update: {
          account_number?: string | null
          balance?: number | null
          bank_name?: string
          business_id?: string
          connected?: boolean
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
      bank_transactions: {
        Row: {
          amount: number
          balance: number
          business_id: string
          category: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          reconciled: boolean
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          balance: number
          business_id: string
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          id?: string
          reconciled?: boolean
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          balance?: number
          business_id?: string
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          reconciled?: boolean
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published_at: string | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: []
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
          onboarding_completed: boolean
          onboarding_step: number
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
          onboarding_completed?: boolean
          onboarding_step?: number
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
          onboarding_completed?: boolean
          onboarding_step?: number
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
      cash_flow_trends: {
        Row: {
          business_id: string
          created_at: string
          id: string
          money_in: number
          money_out: number
          net_cash: number
          period_label: string
          period_start: string
          period_type: string
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          money_in?: number
          money_out?: number
          net_cash?: number
          period_label: string
          period_start: string
          period_type?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          money_in?: number
          money_out?: number
          net_cash?: number
          period_label?: string
          period_start?: string
          period_type?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          avg_payment_days: number | null
          business_id: string
          city: string | null
          contact_email: string | null
          contact_name: string | null
          created_at: string
          credit_risk: string | null
          gstin: string | null
          id: string
          industry: string | null
          name: string
          outstanding_amount: number
          state: string | null
          total_revenue: number
          updated_at: string
        }
        Insert: {
          avg_payment_days?: number | null
          business_id: string
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          credit_risk?: string | null
          gstin?: string | null
          id?: string
          industry?: string | null
          name: string
          outstanding_amount?: number
          state?: string | null
          total_revenue?: number
          updated_at?: string
        }
        Update: {
          avg_payment_days?: number | null
          business_id?: string
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          created_at?: string
          credit_risk?: string | null
          gstin?: string | null
          id?: string
          industry?: string | null
          name?: string
          outstanding_amount?: number
          state?: string | null
          total_revenue?: number
          updated_at?: string
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
      customers: {
        Row: {
          business_id: string
          city: string | null
          contact_person: string | null
          created_at: string
          customer_category: string | null
          customer_name: string
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean
          payment_terms_days: number | null
          phone: string | null
          state: string | null
          total_receivable: number
          updated_at: string
        }
        Insert: {
          business_id: string
          city?: string | null
          contact_person?: string | null
          created_at?: string
          customer_category?: string | null
          customer_name: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          payment_terms_days?: number | null
          phone?: string | null
          state?: string | null
          total_receivable?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          city?: string | null
          contact_person?: string | null
          created_at?: string
          customer_category?: string | null
          customer_name?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          payment_terms_days?: number | null
          phone?: string | null
          state?: string | null
          total_receivable?: number
          updated_at?: string
        }
        Relationships: []
      }
      demo_insights: {
        Row: {
          created_at: string
          data: Json
          id: string
          org_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          org_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          org_id?: string
        }
        Relationships: []
      }
      demo_organizations: {
        Row: {
          business_name: string
          challenge: string | null
          created_at: string
          demo_org_id: string
          email: string | null
          employees: string | null
          id: string
          industry: string | null
          metadata: Json
          monthly_revenue: string | null
          name: string | null
        }
        Insert: {
          business_name: string
          challenge?: string | null
          created_at?: string
          demo_org_id: string
          email?: string | null
          employees?: string | null
          id?: string
          industry?: string | null
          metadata?: Json
          monthly_revenue?: string | null
          name?: string | null
        }
        Update: {
          business_name?: string
          challenge?: string | null
          created_at?: string
          demo_org_id?: string
          email?: string | null
          employees?: string | null
          id?: string
          industry?: string | null
          metadata?: Json
          monthly_revenue?: string | null
          name?: string | null
        }
        Relationships: []
      }
      demo_transactions: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          customer: string | null
          date: string
          description: string
          gst_amount: number | null
          id: string
          invoice_number: string | null
          metadata: Json | null
          organization_id: string
          payment_method: string | null
          type: string
          updated_at: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          customer?: string | null
          date: string
          description: string
          gst_amount?: number | null
          id?: string
          invoice_number?: string | null
          metadata?: Json | null
          organization_id: string
          payment_method?: string | null
          type: string
          updated_at?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          customer?: string | null
          date?: string
          description?: string
          gst_amount?: number | null
          id?: string
          invoice_number?: string | null
          metadata?: Json | null
          organization_id?: string
          payment_method?: string | null
          type?: string
          updated_at?: string | null
          vendor?: string | null
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
      employees_demo: {
        Row: {
          business_id: string
          cost_to_company: number
          created_at: string
          department: string | null
          designation: string | null
          id: string
          joining_date: string | null
          name: string
          salary: number
          status: string
          updated_at: string
        }
        Insert: {
          business_id: string
          cost_to_company?: number
          created_at?: string
          department?: string | null
          designation?: string | null
          id?: string
          joining_date?: string | null
          name: string
          salary?: number
          status?: string
          updated_at?: string
        }
        Update: {
          business_id?: string
          cost_to_company?: number
          created_at?: string
          department?: string | null
          designation?: string | null
          id?: string
          joining_date?: string | null
          name?: string
          salary?: number
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          business_id: string
          category: string | null
          created_at: string
          date: string
          description: string | null
          due_date: string | null
          id: string
          payment_method: string | null
          payment_status: string
          subcategory: string | null
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          amount?: number
          business_id: string
          category?: string | null
          created_at?: string
          date: string
          description?: string | null
          due_date?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string
          subcategory?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          category?: string | null
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          payment_method?: string | null
          payment_status?: string
          subcategory?: string | null
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string | null
          display_name: string | null
          enabled: boolean
          flag_name: string
          id: string
          rollout_percentage: number
          target_segment: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          enabled?: boolean
          flag_name: string
          id?: string
          rollout_percentage?: number
          target_segment?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_name?: string | null
          enabled?: boolean
          flag_name?: string
          id?: string
          rollout_percentage?: number
          target_segment?: string
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
      gst_filings_demo: {
        Row: {
          business_id: string
          created_at: string
          due_date: string | null
          filed_date: string | null
          filing_type: string
          id: string
          itc_claimed: number
          net_payable: number
          period: string
          status: string
          tax_liability: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          due_date?: string | null
          filed_date?: string | null
          filing_type: string
          id?: string
          itc_claimed?: number
          net_payable?: number
          period: string
          status?: string
          tax_liability?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          due_date?: string | null
          filed_date?: string | null
          filing_type?: string
          id?: string
          itc_claimed?: number
          net_payable?: number
          period?: string
          status?: string
          tax_liability?: number
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
      integration_tokens: {
        Row: {
          access_token: string | null
          config: Json | null
          created_at: string
          expires_at: string | null
          id: string
          platform: string
          refresh_token: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_token?: string | null
          config?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          platform: string
          refresh_token?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_token?: string | null
          config?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          platform?: string
          refresh_token?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          access_token: string
          created_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          organization_id: string
          provider: string
          refresh_token: string | null
          updated_at: string | null
        }
        Insert: {
          access_token: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id: string
          provider: string
          refresh_token?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string
          provider?: string
          refresh_token?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          business_id: string
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_date: string
          invoice_number: string
          outstanding_amount: number
          paid_amount: number
          payment_date: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date: string
          invoice_number: string
          outstanding_amount?: number
          paid_amount?: number
          payment_date?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_date?: string
          invoice_number?: string
          outstanding_amount?: number
          paid_amount?: number
          payment_date?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      liquidity_metrics: {
        Row: {
          burn_rate_current: number
          business_id: string
          cash_position: number
          created_at: string
          health_score: number
          health_status: string
          id: string
          recorded_at: string
          runway_days: number
          runway_months: number
        }
        Insert: {
          burn_rate_current?: number
          business_id: string
          cash_position?: number
          created_at?: string
          health_score?: number
          health_status?: string
          id?: string
          recorded_at?: string
          runway_days?: number
          runway_months?: number
        }
        Update: {
          burn_rate_current?: number
          business_id?: string
          cash_position?: number
          created_at?: string
          health_score?: number
          health_status?: string
          id?: string
          recorded_at?: string
          runway_days?: number
          runway_months?: number
        }
        Relationships: []
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
      revenue_analytics_cache: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_name: string
          metric_value: number | null
          period: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metric_name: string
          metric_value?: number | null
          period?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_name?: string
          metric_value?: number | null
          period?: string | null
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
      social_posts: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          media_urls: string[] | null
          metrics: Json | null
          platform: string
          post_type: string | null
          recipient_count: number | null
          scheduled_at: string | null
          sent_at: string | null
          status: string
          target_audience: string | null
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metrics?: Json | null
          platform: string
          post_type?: string | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          metrics?: Json | null
          platform?: string
          post_type?: string | null
          recipient_count?: number | null
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          target_audience?: string | null
        }
        Relationships: []
      }
      subscription_history: {
        Row: {
          change_reason: string | null
          changed_at: string
          changed_by: string | null
          id: string
          new_mrr: number | null
          new_plan: string | null
          old_mrr: number | null
          old_plan: string | null
          subscription_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_mrr?: number | null
          new_plan?: string | null
          old_mrr?: number | null
          old_plan?: string | null
          subscription_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_mrr?: number | null
          new_plan?: string | null
          old_mrr?: number | null
          old_plan?: string | null
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_cycle: string
          business_id: string | null
          cancelled_at: string | null
          created_at: string
          id: string
          mrr: number
          next_billing_date: string | null
          payment_method: string | null
          payment_method_details: Json
          plan_type: string
          started_at: string
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          billing_cycle?: string
          business_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          mrr?: number
          next_billing_date?: string | null
          payment_method?: string | null
          payment_method_details?: Json
          plan_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          billing_cycle?: string
          business_id?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          mrr?: number
          next_billing_date?: string | null
          payment_method?: string | null
          payment_method_details?: Json
          plan_type?: string
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          business_id: string | null
          category: string | null
          closed_at: string | null
          created_at: string
          description: string | null
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          business_id?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          business_id?: string | null
          category?: string | null
          closed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      system_health_checks: {
        Row: {
          checked_at: string
          error_message: string | null
          id: string
          response_time_ms: number | null
          service_name: string
          status: string
        }
        Insert: {
          checked_at?: string
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          service_name: string
          status: string
        }
        Update: {
          checked_at?: string
          error_message?: string | null
          id?: string
          response_time_ms?: number | null
          service_name?: string
          status?: string
        }
        Relationships: []
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
      ticket_replies: {
        Row: {
          attachments: string[] | null
          author_id: string | null
          created_at: string
          id: string
          is_admin: boolean
          is_internal_note: boolean
          message: string
          ticket_id: string
        }
        Insert: {
          attachments?: string[] | null
          author_id?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          is_internal_note?: boolean
          message: string
          ticket_id: string
        }
        Update: {
          attachments?: string[] | null
          author_id?: string | null
          created_at?: string
          id?: string
          is_admin?: boolean
          is_internal_note?: boolean
          message?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          bank_account_id: string | null
          business_id: string
          category: string | null
          counterparty: string | null
          created_at: string
          date: string
          description: string | null
          direction: string
          id: string
          transaction_date: string | null
          transaction_time: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          bank_account_id?: string | null
          business_id: string
          category?: string | null
          counterparty?: string | null
          created_at?: string
          date: string
          description?: string | null
          direction: string
          id?: string
          transaction_date?: string | null
          transaction_time?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          bank_account_id?: string | null
          business_id?: string
          category?: string | null
          counterparty?: string | null
          created_at?: string
          date?: string
          description?: string | null
          direction?: string
          id?: string
          transaction_date?: string | null
          transaction_time?: string | null
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
      vendors: {
        Row: {
          business_id: string
          city: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          gstin: string | null
          id: string
          is_active: boolean
          payment_terms_days: number | null
          phone: string | null
          total_outstanding: number
          updated_at: string
          vendor_category: string | null
          vendor_name: string
        }
        Insert: {
          business_id: string
          city?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          payment_terms_days?: number | null
          phone?: string | null
          total_outstanding?: number
          updated_at?: string
          vendor_category?: string | null
          vendor_name: string
        }
        Update: {
          business_id?: string
          city?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          gstin?: string | null
          id?: string
          is_active?: boolean
          payment_terms_days?: number | null
          phone?: string | null
          total_outstanding?: number
          updated_at?: string
          vendor_category?: string | null
          vendor_name?: string
        }
        Relationships: []
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
      whatsapp_messages: {
        Row: {
          created_at: string
          delivered_at: string | null
          id: string
          media_url: string | null
          message_text: string
          read_at: string | null
          recipient_count: number | null
          recipient_phone: string | null
          sent_at: string | null
          sent_by: string | null
          social_post_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          media_url?: string | null
          message_text: string
          read_at?: string | null
          recipient_count?: number | null
          recipient_phone?: string | null
          sent_at?: string | null
          sent_by?: string | null
          social_post_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          id?: string
          media_url?: string | null
          message_text?: string
          read_at?: string | null
          recipient_count?: number | null
          recipient_phone?: string | null
          sent_at?: string | null
          sent_by?: string | null
          social_post_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_messages_social_post_id_fkey"
            columns: ["social_post_id"]
            isOneToOne: false
            referencedRelation: "social_posts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: { Args: { data: string }; Returns: string }
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
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "http_request"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_delete:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_get:
        | {
            Args: { uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
        SetofOptions: {
          from: "*"
          to: "http_header"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_list_curlopt: {
        Args: never
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_post:
        | {
            Args: { content: string; content_type: string; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
        | {
            Args: { data: Json; uri: string }
            Returns: Database["public"]["CompositeTypes"]["http_response"]
            SetofOptions: {
              from: "*"
              to: "http_response"
              isOneToOne: true
              isSetofReturn: false
            }
          }
      http_put: {
        Args: { content: string; content_type: string; uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
        SetofOptions: {
          from: "*"
          to: "http_response"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      http_reset_curlopt: { Args: never; Returns: boolean }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      is_admin_user: { Args: never; Returns: boolean }
      text_to_bytea: { Args: { data: string }; Returns: string }
      urlencode:
        | { Args: { data: Json }; Returns: string }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
        | {
            Args: { string: string }
            Returns: {
              error: true
            } & "Could not choose the best candidate function between: public.urlencode(string => bytea), public.urlencode(string => varchar). Try renaming the parameters or the function itself in the database so function overloading can be resolved"
          }
      zoho_exchange_code: {
        Args: { p_code: string; p_state: string }
        Returns: Json
      }
      zoho_get_auth_url: { Args: { p_organization_id: string }; Returns: Json }
      zoho_sync_transactions: {
        Args: { p_organization_id: string }
        Returns: Json
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
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
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
