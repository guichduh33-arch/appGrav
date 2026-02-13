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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: unknown
          module: string
          new_values: Json | null
          old_values: Json | null
          session_id: string | null
          severity: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          module: string
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: unknown
          module?: string
          new_values?: Json | null
          old_values?: Json | null
          session_id?: string | null
          severity?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "user_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      b2b_customer_price_lists: {
        Row: {
          created_at: string | null
          customer_id: string
          id: string
          price_list_id: string
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          id?: string
          price_list_id: string
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          id?: string
          price_list_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_customer_price_lists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_customer_price_lists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "b2b_customer_price_lists_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "b2b_customer_price_lists_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "b2b_price_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_deliveries: {
        Row: {
          actual_date: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          delivery_address: string | null
          delivery_number: string
          driver_name: string | null
          id: string
          notes: string | null
          order_id: string
          received_by: string | null
          scheduled_date: string | null
          signature_url: string | null
          status: string | null
          updated_at: string | null
          vehicle_info: string | null
        }
        Insert: {
          actual_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          delivery_address?: string | null
          delivery_number: string
          driver_name?: string | null
          id?: string
          notes?: string | null
          order_id: string
          received_by?: string | null
          scheduled_date?: string | null
          signature_url?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_info?: string | null
        }
        Update: {
          actual_date?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          delivery_address?: string | null
          delivery_number?: string
          driver_name?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          received_by?: string | null
          scheduled_date?: string | null
          signature_url?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_info?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "b2b_deliveries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "b2b_deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "b2b_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_order_history: {
        Row: {
          action_type: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          metadata: Json | null
          new_status: string | null
          order_id: string
          previous_status: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          order_id: string
          previous_status?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          order_id?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "b2b_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_order_items: {
        Row: {
          created_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          notes: string | null
          order_id: string
          product_id: string
          product_name: string
          product_sku: string | null
          quantity: number
          total: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_id: string
          product_id: string
          product_name: string
          product_sku?: string | null
          quantity: number
          total: number
          unit?: string | null
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "b2b_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      b2b_orders: {
        Row: {
          amount_due: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          delivered_at: string | null
          delivery_date: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          internal_notes: string | null
          invoice_generated_at: string | null
          invoice_number: string | null
          invoice_url: string | null
          notes: string | null
          order_date: string
          order_number: string
          paid_amount: number | null
          paid_at: string | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          status: Database["public"]["Enums"]["b2b_status"] | null
          stock_deducted: boolean | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          amount_due?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          delivered_at?: string | null
          delivery_date?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          internal_notes?: string | null
          invoice_generated_at?: string | null
          invoice_number?: string | null
          invoice_url?: string | null
          notes?: string | null
          order_date?: string
          order_number: string
          paid_amount?: number | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["b2b_status"] | null
          stock_deducted?: boolean | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          amount_due?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          delivered_at?: string | null
          delivery_date?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          internal_notes?: string | null
          invoice_generated_at?: string | null
          invoice_number?: string | null
          invoice_url?: string | null
          notes?: string | null
          order_date?: string
          order_number?: string
          paid_amount?: number | null
          paid_at?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: Database["public"]["Enums"]["b2b_status"] | null
          stock_deducted?: boolean | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "b2b_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      b2b_payments: {
        Row: {
          account_number: string | null
          amount: number
          bank_name: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          id: string
          notes: string | null
          order_id: string
          payment_date: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_number: string
          reference_number: string | null
        }
        Insert: {
          account_number?: string | null
          amount: number
          bank_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          id?: string
          notes?: string | null
          order_id: string
          payment_date?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_number: string
          reference_number?: string | null
        }
        Update: {
          account_number?: string | null
          amount?: number
          bank_name?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_date?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_number?: string
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "b2b_payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "b2b_payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "b2b_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_price_list_items: {
        Row: {
          created_at: string | null
          id: string
          min_quantity: number | null
          price: number
          price_list_id: string
          product_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          min_quantity?: number | null
          price: number
          price_list_id: string
          product_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          min_quantity?: number | null
          price?: number
          price_list_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "b2b_price_list_items_price_list_id_fkey"
            columns: ["price_list_id"]
            isOneToOne: false
            referencedRelation: "b2b_price_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_price_list_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      b2b_price_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      business_hours: {
        Row: {
          break_end: string | null
          break_start: string | null
          close_time: string | null
          created_at: string | null
          day_of_week: number
          id: string
          is_closed: boolean | null
          is_open: boolean | null
          open_time: string | null
          updated_at: string | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          close_time?: string | null
          created_at?: string | null
          day_of_week: number
          id?: string
          is_closed?: boolean | null
          is_open?: boolean | null
          open_time?: string | null
          updated_at?: string | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          close_time?: string | null
          created_at?: string | null
          day_of_week?: number
          id?: string
          is_closed?: boolean | null
          is_open?: boolean | null
          open_time?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          color: string | null
          created_at: string | null
          dispatch_station:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_raw_material: boolean | null
          name: string
          show_in_pos: boolean | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          dispatch_station?:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_raw_material?: boolean | null
          name: string
          show_in_pos?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          dispatch_station?:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_raw_material?: boolean | null
          name?: string
          show_in_pos?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      customer_categories: {
        Row: {
          auto_discount_enabled: boolean | null
          auto_discount_percentage: number | null
          auto_discount_threshold: number | null
          color: string | null
          created_at: string
          description: string | null
          discount_percentage: number | null
          icon: string | null
          id: string
          is_active: boolean
          is_default: boolean | null
          loyalty_enabled: boolean
          name: string
          points_multiplier: number | null
          points_per_amount: number | null
          price_modifier_type: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          auto_discount_enabled?: boolean | null
          auto_discount_percentage?: number | null
          auto_discount_threshold?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          loyalty_enabled?: boolean
          name: string
          points_multiplier?: number | null
          points_per_amount?: number | null
          price_modifier_type?: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          auto_discount_enabled?: boolean | null
          auto_discount_percentage?: number | null
          auto_discount_threshold?: number | null
          color?: string | null
          created_at?: string
          description?: string | null
          discount_percentage?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_default?: boolean | null
          loyalty_enabled?: boolean
          name?: string
          points_multiplier?: number | null
          points_per_amount?: number | null
          price_modifier_type?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          category_id: string | null
          company_name: string | null
          created_at: string | null
          credit_limit: number | null
          customer_type: Database["public"]["Enums"]["customer_type"] | null
          date_of_birth: string | null
          email: string | null
          id: string
          is_active: boolean | null
          last_visit_at: string | null
          lifetime_points: number | null
          loyalty_points: number | null
          loyalty_qr_code: string | null
          loyalty_tier: string | null
          membership_number: string | null
          name: string
          notes: string | null
          payment_terms: Database["public"]["Enums"]["payment_terms"] | null
          phone: string | null
          points_expiry_date: string | null
          preferred_language: string | null
          tax_id: string | null
          total_spent: number | null
          total_visits: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          category_id?: string | null
          company_name?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          date_of_birth?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_visit_at?: string | null
          lifetime_points?: number | null
          loyalty_points?: number | null
          loyalty_qr_code?: string | null
          loyalty_tier?: string | null
          membership_number?: string | null
          name: string
          notes?: string | null
          payment_terms?: Database["public"]["Enums"]["payment_terms"] | null
          phone?: string | null
          points_expiry_date?: string | null
          preferred_language?: string | null
          tax_id?: string | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          category_id?: string | null
          company_name?: string | null
          created_at?: string | null
          credit_limit?: number | null
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          date_of_birth?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          last_visit_at?: string | null
          lifetime_points?: number | null
          loyalty_points?: number | null
          loyalty_qr_code?: string | null
          loyalty_tier?: string | null
          membership_number?: string | null
          name?: string
          notes?: string | null
          payment_terms?: Database["public"]["Enums"]["payment_terms"] | null
          phone?: string | null
          points_expiry_date?: string | null
          preferred_language?: string | null
          tax_id?: string | null
          total_spent?: number | null
          total_visits?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "customer_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      display_content: {
        Row: {
          content: Json
          content_type: string
          created_at: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          content: Json
          content_type: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      display_promotions: {
        Row: {
          background_color: string | null
          created_at: string | null
          days_of_week: number[] | null
          description: string | null
          display_duration: number | null
          end_date: string | null
          end_time: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          priority: number | null
          start_date: string | null
          start_time: string | null
          subtitle: string | null
          text_color: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          display_duration?: number | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date?: string | null
          start_time?: string | null
          subtitle?: string | null
          text_color?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          days_of_week?: number[] | null
          description?: string | null
          display_duration?: number | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          priority?: number | null
          start_date?: string | null
          start_time?: string | null
          subtitle?: string | null
          text_color?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_en: string | null
          body_fr: string | null
          body_id: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_fr: string
          name_id: string
          subject_en: string | null
          subject_fr: string | null
          subject_id: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          body_en?: string | null
          body_fr?: string | null
          body_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_fr: string
          name_id: string
          subject_en?: string | null
          subject_fr?: string | null
          subject_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          body_en?: string | null
          body_fr?: string | null
          body_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_fr?: string
          name_id?: string
          subject_en?: string | null
          subject_fr?: string | null
          subject_id?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      floor_plan_items: {
        Row: {
          capacity: number | null
          color: string | null
          created_at: string | null
          current_order_id: string | null
          floor: number | null
          height: number | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          item_type: string
          metadata: Json | null
          name: string
          rotation: number | null
          shape: string | null
          table_number: string | null
          updated_at: string | null
          width: number | null
          x_position: number | null
          y_position: number | null
          zone: string | null
        }
        Insert: {
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          current_order_id?: string | null
          floor?: number | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          item_type?: string
          metadata?: Json | null
          name: string
          rotation?: number | null
          shape?: string | null
          table_number?: string | null
          updated_at?: string | null
          width?: number | null
          x_position?: number | null
          y_position?: number | null
          zone?: string | null
        }
        Update: {
          capacity?: number | null
          color?: string | null
          created_at?: string | null
          current_order_id?: string | null
          floor?: number | null
          height?: number | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          item_type?: string
          metadata?: Json | null
          name?: string
          rotation?: number | null
          shape?: string | null
          table_number?: string | null
          updated_at?: string | null
          width?: number | null
          x_position?: number | null
          y_position?: number | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "floor_plan_items_current_order_id_fkey"
            columns: ["current_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      internal_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          created_by: string | null
          expected_date: string | null
          from_location_id: string | null
          from_section_id: string | null
          id: string
          notes: string | null
          received_by: string | null
          received_date: string | null
          responsible_person: string | null
          status: Database["public"]["Enums"]["transfer_status"] | null
          to_location_id: string | null
          to_section_id: string | null
          total_items: number | null
          total_value: number | null
          transfer_date: string | null
          transfer_number: string
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_date?: string | null
          from_location_id?: string | null
          from_section_id?: string | null
          id?: string
          notes?: string | null
          received_by?: string | null
          received_date?: string | null
          responsible_person?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_location_id?: string | null
          to_section_id?: string | null
          total_items?: number | null
          total_value?: number | null
          transfer_date?: string | null
          transfer_number: string
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          created_by?: string | null
          expected_date?: string | null
          from_location_id?: string | null
          from_section_id?: string | null
          id?: string
          notes?: string | null
          received_by?: string | null
          received_date?: string | null
          responsible_person?: string | null
          status?: Database["public"]["Enums"]["transfer_status"] | null
          to_location_id?: string | null
          to_section_id?: string | null
          total_items?: number | null
          total_value?: number | null
          transfer_date?: string | null
          transfer_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transfers_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transfers_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transfers_approved_by"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_transfers_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transfers_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transfers_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_transfers_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transfers_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_transfers_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "internal_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_transfers_from_section_id_fkey"
            columns: ["from_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_transfers_to_section_id_fkey"
            columns: ["to_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_count_items: {
        Row: {
          count_id: string
          counted_at: string | null
          counted_by: string | null
          counted_quantity: number | null
          created_at: string | null
          difference: number | null
          id: string
          notes: string | null
          product_id: string
          system_quantity: number
          unit_cost: number | null
        }
        Insert: {
          count_id: string
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string | null
          difference?: number | null
          id?: string
          notes?: string | null
          product_id: string
          system_quantity: number
          unit_cost?: number | null
        }
        Update: {
          count_id?: string
          counted_at?: string | null
          counted_by?: string | null
          counted_quantity?: number | null
          created_at?: string | null
          difference?: number | null
          id?: string
          notes?: string | null
          product_id?: string
          system_quantity?: number
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_count_items_counted_by"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_count_items_counted_by"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_count_items_counted_by"
            columns: ["counted_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "inventory_count_items_count_id_fkey"
            columns: ["count_id"]
            isOneToOne: false
            referencedRelation: "inventory_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_count_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_count_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_count_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "inventory_count_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      inventory_counts: {
        Row: {
          count_date: string
          count_number: string
          created_at: string | null
          created_by: string | null
          id: string
          location_id: string | null
          notes: string | null
          section_id: string | null
          status: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          count_date?: string
          count_number: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          section_id?: string | null
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          count_date?: string
          count_number?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          location_id?: string | null
          notes?: string | null
          section_id?: string | null
          status?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_inventory_counts_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_counts_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_counts_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_inventory_counts_validated_by"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_counts_validated_by"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_inventory_counts_validated_by"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "inventory_counts_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_counts_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      kds_order_queue: {
        Row: {
          bumped_at: string | null
          bumped_by: string | null
          created_at: string | null
          id: string
          order_id: string
          priority: number | null
          station_type: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          bumped_at?: string | null
          bumped_by?: string | null
          created_at?: string | null
          id?: string
          order_id: string
          priority?: number | null
          station_type: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          bumped_at?: string | null
          bumped_by?: string | null
          created_at?: string | null
          id?: string
          order_id?: string
          priority?: number | null
          station_type?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kds_order_queue_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      kds_stations: {
        Row: {
          categories: string[] | null
          created_at: string | null
          device_id: string | null
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          station_type: string
          updated_at: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          station_type: string
          updated_at?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          device_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          station_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lan_messages: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          created_at: string | null
          expires_at: string | null
          from_device_id: string
          id: string
          is_broadcast: boolean | null
          message_type: string
          payload: Json
          to_device_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          from_device_id: string
          id?: string
          is_broadcast?: boolean | null
          message_type: string
          payload: Json
          to_device_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          created_at?: string | null
          expires_at?: string | null
          from_device_id?: string
          id?: string
          is_broadcast?: boolean | null
          message_type?: string
          payload?: Json
          to_device_id?: string | null
        }
        Relationships: []
      }
      lan_nodes: {
        Row: {
          capabilities: Json | null
          created_at: string | null
          device_id: string
          device_name: string | null
          device_type: string
          id: string
          ip_address: unknown
          is_hub: boolean | null
          last_heartbeat: string | null
          port: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string | null
          device_id: string
          device_name?: string | null
          device_type: string
          id?: string
          ip_address?: unknown
          is_hub?: boolean | null
          last_heartbeat?: string | null
          port?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          created_at?: string | null
          device_id?: string
          device_name?: string | null
          device_type?: string
          id?: string
          ip_address?: unknown
          is_hub?: boolean | null
          last_heartbeat?: string | null
          port?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      loyalty_redemptions: {
        Row: {
          applied_at: string | null
          created_at: string
          customer_id: string
          expires_at: string | null
          id: string
          loyalty_transaction_id: string | null
          order_id: string | null
          points_used: number
          redeemed_at: string
          reward_id: string
          status: string
        }
        Insert: {
          applied_at?: string | null
          created_at?: string
          customer_id: string
          expires_at?: string | null
          id?: string
          loyalty_transaction_id?: string | null
          order_id?: string | null
          points_used: number
          redeemed_at?: string
          reward_id: string
          status?: string
        }
        Update: {
          applied_at?: string | null
          created_at?: string
          customer_id?: string
          expires_at?: string | null
          id?: string
          loyalty_transaction_id?: string | null
          order_id?: string | null
          points_used?: number
          redeemed_at?: string
          reward_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_loyalty_transaction_id_fkey"
            columns: ["loyalty_transaction_id"]
            isOneToOne: false
            referencedRelation: "loyalty_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "loyalty_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_rewards: {
        Row: {
          created_at: string
          description: string | null
          discount_value: number | null
          id: string
          image_url: string | null
          is_active: boolean
          min_order_amount: number | null
          min_tier: string | null
          name: string
          points_required: number
          product_id: string | null
          quantity_available: number | null
          quantity_redeemed: number | null
          reward_type: string
          sort_order: number | null
          updated_at: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_value?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_order_amount?: number | null
          min_tier?: string | null
          name: string
          points_required: number
          product_id?: string | null
          quantity_available?: number | null
          quantity_redeemed?: number | null
          reward_type: string
          sort_order?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_value?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_order_amount?: number | null
          min_tier?: string | null
          name?: string
          points_required?: number
          product_id?: string | null
          quantity_available?: number | null
          quantity_redeemed?: number | null
          reward_type?: string
          sort_order?: number | null
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "loyalty_rewards_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      loyalty_tiers: {
        Row: {
          birthday_bonus_points: number | null
          color: string | null
          created_at: string
          discount_percentage: number | null
          free_delivery: boolean | null
          icon: string | null
          id: string
          is_active: boolean
          min_lifetime_points: number
          name: string
          points_multiplier: number | null
          priority_support: boolean | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          birthday_bonus_points?: number | null
          color?: string | null
          created_at?: string
          discount_percentage?: number | null
          free_delivery?: boolean | null
          icon?: string | null
          id?: string
          is_active?: boolean
          min_lifetime_points: number
          name: string
          points_multiplier?: number | null
          priority_support?: boolean | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          birthday_bonus_points?: number | null
          color?: string | null
          created_at?: string
          discount_percentage?: number | null
          free_delivery?: boolean | null
          icon?: string | null
          id?: string
          is_active?: boolean
          min_lifetime_points?: number
          name?: string
          points_multiplier?: number | null
          priority_support?: boolean | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_transactions: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string
          description: string | null
          discount_applied: number | null
          id: string
          multiplier: number | null
          order_amount: number | null
          order_id: string | null
          points: number
          points_balance_after: number
          points_rate: number | null
          reference_number: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id: string
          description?: string | null
          discount_applied?: number | null
          id?: string
          multiplier?: number | null
          order_amount?: number | null
          order_id?: string | null
          points: number
          points_balance_after: number
          points_rate?: number | null
          reference_number?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string | null
          discount_applied?: number | null
          id?: string
          multiplier?: number | null
          order_amount?: number | null
          order_id?: string | null
          points?: number
          points_balance_after?: number
          points_rate?: number | null
          reference_number?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_loyalty_transactions_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_loyalty_transactions_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_loyalty_transactions_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "loyalty_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
        ]
      }
      order_items: {
        Row: {
          combo_id: string | null
          combo_selections: Json | null
          created_at: string | null
          dispatch_station:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          id: string
          is_locked: boolean | null
          item_status: Database["public"]["Enums"]["item_status"] | null
          modifiers: Json | null
          modifiers_total: number | null
          notes: string | null
          order_id: string
          prepared_at: string | null
          prepared_by: string | null
          product_id: string | null
          product_name: string
          product_sku: string | null
          quantity: number
          selected_variants: Json | null
          sent_to_kitchen_at: string | null
          served_at: string | null
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          combo_id?: string | null
          combo_selections?: Json | null
          created_at?: string | null
          dispatch_station?:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          id?: string
          is_locked?: boolean | null
          item_status?: Database["public"]["Enums"]["item_status"] | null
          modifiers?: Json | null
          modifiers_total?: number | null
          notes?: string | null
          order_id: string
          prepared_at?: string | null
          prepared_by?: string | null
          product_id?: string | null
          product_name: string
          product_sku?: string | null
          quantity?: number
          selected_variants?: Json | null
          sent_to_kitchen_at?: string | null
          served_at?: string | null
          total_price: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          combo_id?: string | null
          combo_selections?: Json | null
          created_at?: string | null
          dispatch_station?:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          id?: string
          is_locked?: boolean | null
          item_status?: Database["public"]["Enums"]["item_status"] | null
          modifiers?: Json | null
          modifiers_total?: number | null
          notes?: string | null
          order_id?: string
          prepared_at?: string | null
          prepared_by?: string | null
          product_id?: string | null
          product_name?: string
          product_sku?: string | null
          quantity?: number
          selected_variants?: Json | null
          sent_to_kitchen_at?: string | null
          served_at?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_order_items_prepared_by"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_prepared_by"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_order_items_prepared_by"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          cash_received: number | null
          change_given: number | null
          completed_at: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          discount_amount: number | null
          discount_manager_id: string | null
          discount_reason: string | null
          discount_requires_manager: boolean | null
          discount_type: Database["public"]["Enums"]["discount_type"] | null
          discount_value: number | null
          id: string
          is_offline: boolean | null
          offline_id: string | null
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"] | null
          payment_details: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          points_discount: number | null
          points_earned: number | null
          points_used: number | null
          pos_session_id: string | null
          session_id: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number | null
          synced_at: string | null
          table_number: string | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cash_received?: number | null
          change_given?: number | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          discount_manager_id?: string | null
          discount_reason?: string | null
          discount_requires_manager?: boolean | null
          discount_type?: Database["public"]["Enums"]["discount_type"] | null
          discount_value?: number | null
          id?: string
          is_offline?: boolean | null
          offline_id?: string | null
          order_number: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          payment_details?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          points_discount?: number | null
          points_earned?: number | null
          points_used?: number | null
          pos_session_id?: string | null
          session_id?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          synced_at?: string | null
          table_number?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          cash_received?: number | null
          change_given?: number | null
          completed_at?: string | null
          created_at?: string | null
          customer_id?: string | null
          customer_name?: string | null
          discount_amount?: number | null
          discount_manager_id?: string | null
          discount_reason?: string | null
          discount_requires_manager?: boolean | null
          discount_type?: Database["public"]["Enums"]["discount_type"] | null
          discount_value?: number | null
          id?: string
          is_offline?: boolean | null
          offline_id?: string | null
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          payment_details?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          points_discount?: number | null
          points_earned?: number | null
          points_used?: number | null
          pos_session_id?: string | null
          session_id?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          synced_at?: string | null
          table_number?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_orders_cancelled_by"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_cancelled_by"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_cancelled_by"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_orders_discount_manager"
            columns: ["discount_manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_discount_manager"
            columns: ["discount_manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_discount_manager"
            columns: ["discount_manager_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_orders_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_orders_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "orders_pos_session_id_fkey"
            columns: ["pos_session_id"]
            isOneToOne: false
            referencedRelation: "pos_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_pos_session_id_fkey"
            columns: ["pos_session_id"]
            isOneToOne: false
            referencedRelation: "view_session_summary"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pos_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "view_session_summary"
            referencedColumns: ["session_id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          code: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string | null
          name_en: string
          name_fr: string
          name_id: string
          payment_type: string
          requires_reference: boolean | null
          settings: Json | null
          sort_order: number | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string | null
          name_en: string
          name_fr: string
          name_id: string
          payment_type: string
          requires_reference?: boolean | null
          settings?: Json | null
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string | null
          name_en?: string
          name_fr?: string
          name_id?: string
          payment_type?: string
          requires_reference?: boolean | null
          settings?: Json | null
          sort_order?: number | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_sensitive: boolean | null
          module: string
          name_en: string
          name_fr: string
          name_id: string
        }
        Insert: {
          action: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          module: string
          name_en: string
          name_fr: string
          name_id: string
        }
        Update: {
          action?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_sensitive?: boolean | null
          module?: string
          name_en?: string
          name_fr?: string
          name_id?: string
        }
        Relationships: []
      }
      pos_sessions: {
        Row: {
          actual_cash: number | null
          actual_edc: number | null
          actual_qris: number | null
          cash_difference: number | null
          closed_at: string | null
          closed_by: string | null
          closed_by_name: string | null
          closing_cash: number | null
          closing_cash_details: Json | null
          counted_cash: number | null
          created_at: string | null
          difference_reason: string | null
          edc_difference: number | null
          expected_cash: number | null
          expected_edc: number | null
          expected_qris: number | null
          id: string
          manager_id: string | null
          manager_validated: boolean | null
          notes: string | null
          opened_at: string | null
          opened_by: string | null
          opening_cash: number | null
          opening_cash_details: Json | null
          qris_difference: number | null
          session_number: string
          status: Database["public"]["Enums"]["session_status"] | null
          terminal_id: string | null
          terminal_id_str: string | null
          tips_card: number | null
          tips_cash: number | null
          total_card_sales: number | null
          total_cash_sales: number | null
          total_discounts: number | null
          total_edc_sales: number | null
          total_orders: number | null
          total_qris_sales: number | null
          total_refunds: number | null
          total_sales: number | null
          transaction_count: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_cash?: number | null
          actual_edc?: number | null
          actual_qris?: number | null
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closed_by_name?: string | null
          closing_cash?: number | null
          closing_cash_details?: Json | null
          counted_cash?: number | null
          created_at?: string | null
          difference_reason?: string | null
          edc_difference?: number | null
          expected_cash?: number | null
          expected_edc?: number | null
          expected_qris?: number | null
          id?: string
          manager_id?: string | null
          manager_validated?: boolean | null
          notes?: string | null
          opened_at?: string | null
          opened_by?: string | null
          opening_cash?: number | null
          opening_cash_details?: Json | null
          qris_difference?: number | null
          session_number: string
          status?: Database["public"]["Enums"]["session_status"] | null
          terminal_id?: string | null
          terminal_id_str?: string | null
          tips_card?: number | null
          tips_cash?: number | null
          total_card_sales?: number | null
          total_cash_sales?: number | null
          total_discounts?: number | null
          total_edc_sales?: number | null
          total_orders?: number | null
          total_qris_sales?: number | null
          total_refunds?: number | null
          total_sales?: number | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_cash?: number | null
          actual_edc?: number | null
          actual_qris?: number | null
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closed_by_name?: string | null
          closing_cash?: number | null
          closing_cash_details?: Json | null
          counted_cash?: number | null
          created_at?: string | null
          difference_reason?: string | null
          edc_difference?: number | null
          expected_cash?: number | null
          expected_edc?: number | null
          expected_qris?: number | null
          id?: string
          manager_id?: string | null
          manager_validated?: boolean | null
          notes?: string | null
          opened_at?: string | null
          opened_by?: string | null
          opening_cash?: number | null
          opening_cash_details?: Json | null
          qris_difference?: number | null
          session_number?: string
          status?: Database["public"]["Enums"]["session_status"] | null
          terminal_id?: string | null
          terminal_id_str?: string | null
          tips_card?: number | null
          tips_cash?: number | null
          total_card_sales?: number | null
          total_cash_sales?: number | null
          total_discounts?: number | null
          total_edc_sales?: number | null
          total_orders?: number | null
          total_qris_sales?: number | null
          total_refunds?: number | null
          total_sales?: number | null
          transaction_count?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_pos_sessions_closed_by"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_closed_by"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_closed_by"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_manager"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_opened_by"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_opened_by"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_pos_sessions_opened_by"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "pos_sessions_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "pos_terminals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      pos_terminals: {
        Row: {
          allowed_payment_methods: string[] | null
          auto_logout_timeout: number | null
          created_at: string | null
          default_order_type: string | null
          default_printer_id: string | null
          device_id: string
          floor_plan_id: string | null
          id: string
          is_hub: boolean | null
          kds_station: string | null
          kitchen_printer_id: string | null
          location: string | null
          mode: string | null
          status: string | null
          terminal_name: string
          updated_at: string | null
        }
        Insert: {
          allowed_payment_methods?: string[] | null
          auto_logout_timeout?: number | null
          created_at?: string | null
          default_order_type?: string | null
          default_printer_id?: string | null
          device_id: string
          floor_plan_id?: string | null
          id?: string
          is_hub?: boolean | null
          kds_station?: string | null
          kitchen_printer_id?: string | null
          location?: string | null
          mode?: string | null
          status?: string | null
          terminal_name: string
          updated_at?: string | null
        }
        Update: {
          allowed_payment_methods?: string[] | null
          auto_logout_timeout?: number | null
          created_at?: string | null
          default_order_type?: string | null
          default_printer_id?: string | null
          device_id?: string
          floor_plan_id?: string | null
          id?: string
          is_hub?: boolean | null
          kds_station?: string | null
          kitchen_printer_id?: string | null
          location?: string | null
          mode?: string | null
          status?: string | null
          terminal_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      printer_configurations: {
        Row: {
          connection_string: string | null
          connection_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          paper_width: number | null
          printer_type: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          connection_string?: string | null
          connection_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          paper_width?: number | null
          printer_type: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          connection_string?: string | null
          connection_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          paper_width?: number | null
          printer_type?: string
          settings?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      product_category_prices: {
        Row: {
          created_at: string | null
          custom_price: number
          customer_category_id: string
          id: string
          is_active: boolean | null
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_price: number
          customer_category_id: string
          id?: string
          is_active?: boolean | null
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_price?: number
          customer_category_id?: string
          id?: string
          is_active?: boolean | null
          product_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_category_prices_customer_category_id_fkey"
            columns: ["customer_category_id"]
            isOneToOne: false
            referencedRelation: "customer_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_combo_group_items: {
        Row: {
          created_at: string | null
          group_id: string
          id: string
          is_default: boolean | null
          price_adjustment: number | null
          product_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          group_id: string
          id?: string
          is_default?: boolean | null
          price_adjustment?: number | null
          product_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          group_id?: string
          id?: string
          is_default?: boolean | null
          price_adjustment?: number | null
          product_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_combo_group_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_combo_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_combo_groups: {
        Row: {
          combo_id: string
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          max_selections: number | null
          min_selections: number | null
          name: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          combo_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          combo_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          name?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_combo_groups_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "product_combos"
            referencedColumns: ["id"]
          },
        ]
      }
      product_combo_items: {
        Row: {
          combo_id: string
          created_at: string | null
          id: string
          is_optional: boolean | null
          product_id: string
          quantity: number
        }
        Insert: {
          combo_id: string
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          product_id: string
          quantity?: number
        }
        Update: {
          combo_id?: string
          created_at?: string | null
          id?: string
          is_optional?: boolean | null
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "product_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_combos: {
        Row: {
          available_at_pos: boolean | null
          combo_price: number
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
          available_at_pos?: boolean | null
          combo_price: number
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
          available_at_pos?: boolean | null
          combo_price?: number
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
      product_modifiers: {
        Row: {
          category_id: string | null
          created_at: string | null
          group_name: string
          group_required: boolean | null
          group_sort_order: number | null
          group_type: Database["public"]["Enums"]["modifier_group_type"] | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          materials: Record<string, unknown>[] | null
          option_icon: string | null
          option_id: string
          option_label: string
          option_sort_order: number | null
          price_adjustment: number | null
          product_id: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          group_name: string
          group_required?: boolean | null
          group_sort_order?: number | null
          group_type?: Database["public"]["Enums"]["modifier_group_type"] | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          materials?: Record<string, unknown>[] | null
          option_icon?: string | null
          option_id: string
          option_label: string
          option_sort_order?: number | null
          price_adjustment?: number | null
          product_id?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          group_name?: string
          group_required?: boolean | null
          group_sort_order?: number | null
          group_type?: Database["public"]["Enums"]["modifier_group_type"] | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          materials?: Record<string, unknown>[] | null
          option_icon?: string | null
          option_id?: string
          option_label?: string
          option_sort_order?: number | null
          price_adjustment?: number | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_modifiers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_modifiers_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "view_category_sales"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_sections: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          product_id: string
          section_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          product_id: string
          section_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          product_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_sections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_uoms: {
        Row: {
          barcode: string | null
          conversion_factor: number
          created_at: string | null
          id: string
          is_active: boolean | null
          is_base_uom: boolean | null
          is_purchase_uom: boolean | null
          is_sale_uom: boolean | null
          price_override: number | null
          product_id: string
          uom_code: string
          uom_name: string
          updated_at: string | null
        }
        Insert: {
          barcode?: string | null
          conversion_factor?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_base_uom?: boolean | null
          is_purchase_uom?: boolean | null
          is_sale_uom?: boolean | null
          price_override?: number | null
          product_id: string
          uom_code: string
          uom_name: string
          updated_at?: string | null
        }
        Update: {
          barcode?: string | null
          conversion_factor?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_base_uom?: boolean | null
          is_purchase_uom?: boolean | null
          is_sale_uom?: boolean | null
          price_override?: number | null
          product_id?: string
          uom_code?: string
          uom_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_uoms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_uoms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_uoms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_uoms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_uoms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_uoms_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_variant_materials: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          material_ids: string[]
          product_id: string
          quantity: number
          updated_at: string | null
          variant_key: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_ids?: string[]
          product_id: string
          quantity?: number
          updated_at?: string | null
          variant_key: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_ids?: string[]
          product_id?: string
          quantity?: number
          updated_at?: string | null
          variant_key?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variant_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variant_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variant_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variant_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_variant_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      production_records: {
        Row: {
          created_at: string | null
          id: string
          materials_consumed: boolean | null
          notes: string | null
          product_id: string
          production_date: string
          production_id: string
          quantity_produced: number
          quantity_waste: number | null
          section_id: string | null
          staff_id: string | null
          staff_name: string | null
          stock_updated: boolean | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          materials_consumed?: boolean | null
          notes?: string | null
          product_id: string
          production_date?: string
          production_id: string
          quantity_produced: number
          quantity_waste?: number | null
          section_id?: string | null
          staff_id?: string | null
          staff_name?: string | null
          stock_updated?: boolean | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          materials_consumed?: boolean | null
          notes?: string | null
          product_id?: string
          production_date?: string
          production_id?: string
          quantity_produced?: number
          quantity_waste?: number | null
          section_id?: string | null
          staff_id?: string | null
          staff_name?: string | null
          stock_updated?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_production_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_production_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_production_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          available_for_sale: boolean | null
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          current_stock: number | null
          deduct_ingredients: boolean | null
          deleted_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_made_to_order: boolean | null
          min_stock_level: number | null
          name: string
          pos_visible: boolean | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          retail_price: number | null
          section_id: string | null
          sku: string
          unit: string | null
          updated_at: string | null
          wholesale_price: number | null
        }
        Insert: {
          available_for_sale?: boolean | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          deduct_ingredients?: boolean | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_made_to_order?: boolean | null
          min_stock_level?: number | null
          name: string
          pos_visible?: boolean | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          retail_price?: number | null
          section_id?: string | null
          sku: string
          unit?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Update: {
          available_for_sale?: boolean | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          deduct_ingredients?: boolean | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_made_to_order?: boolean | null
          min_stock_level?: number | null
          name?: string
          pos_visible?: boolean | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          retail_price?: number | null
          section_id?: string | null
          sku?: string
          unit?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "view_category_sales"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "products_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_free_products: {
        Row: {
          created_at: string | null
          free_product_id: string
          id: string
          promotion_id: string
          quantity: number | null
        }
        Insert: {
          created_at?: string | null
          free_product_id: string
          id?: string
          promotion_id: string
          quantity?: number | null
        }
        Update: {
          created_at?: string | null
          free_product_id?: string
          id?: string
          promotion_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_free_products_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_products: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          product_id: string | null
          promotion_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          promotion_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          id?: string
          product_id?: string | null
          promotion_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "view_category_sales"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_products_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_usage: {
        Row: {
          customer_id: string | null
          discount_amount: number
          id: string
          order_id: string | null
          promotion_id: string
          used_at: string | null
        }
        Insert: {
          customer_id?: string | null
          discount_amount: number
          id?: string
          order_id?: string | null
          promotion_id: string
          used_at?: string | null
        }
        Update: {
          customer_id?: string | null
          discount_amount?: number
          id?: string
          order_id?: string | null
          promotion_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promotion_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_b2b_performance"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "promotion_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "view_customer_insights"
            referencedColumns: ["customer_id"]
          },
          {
            foreignKeyName: "promotion_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_usage_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          buy_quantity: number | null
          code: string
          created_at: string | null
          current_uses: number | null
          days_of_week: number[] | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          end_date: string | null
          get_quantity: number | null
          id: string
          is_active: boolean | null
          is_stackable: boolean | null
          max_uses_per_customer: number | null
          max_uses_total: number | null
          min_purchase_amount: number | null
          min_quantity: number | null
          name: string
          priority: number | null
          promotion_type: string
          start_date: string | null
          time_end: string | null
          time_start: string | null
          updated_at: string | null
        }
        Insert: {
          buy_quantity?: number | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          days_of_week?: number[] | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          is_stackable?: boolean | null
          max_uses_per_customer?: number | null
          max_uses_total?: number | null
          min_purchase_amount?: number | null
          min_quantity?: number | null
          name: string
          priority?: number | null
          promotion_type: string
          start_date?: string | null
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
        }
        Update: {
          buy_quantity?: number | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          days_of_week?: number[] | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          end_date?: string | null
          get_quantity?: number | null
          id?: string
          is_active?: boolean | null
          is_stackable?: boolean | null
          max_uses_per_customer?: number | null
          max_uses_total?: number | null
          min_purchase_amount?: number | null
          min_quantity?: number | null
          name?: string
          priority?: number | null
          promotion_type?: string
          start_date?: string | null
          time_end?: string | null
          time_start?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      purchase_order_items: {
        Row: {
          created_at: string | null
          description: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          line_total: number
          product_id: string
          product_name: string | null
          purchase_order_id: string
          quantity: number
          quantity_received: number | null
          quantity_returned: number | null
          tax_rate: number | null
          unit: string | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          line_total: number
          product_id: string
          product_name?: string | null
          purchase_order_id: string
          quantity: number
          quantity_received?: number | null
          quantity_returned?: number | null
          tax_rate?: number | null
          unit?: string | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          line_total?: number
          product_id?: string
          product_name?: string | null
          purchase_order_id?: string
          quantity?: number
          quantity_received?: number | null
          quantity_returned?: number | null
          tax_rate?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          created_at: string | null
          created_by: string | null
          discount_amount: number | null
          discount_percentage: number | null
          expected_delivery_date: string | null
          expense_type: Database["public"]["Enums"]["expense_type"] | null
          id: string
          notes: string | null
          order_date: string
          payment_date: string | null
          payment_status: string | null
          po_number: string
          received_by: string | null
          status: Database["public"]["Enums"]["po_status"] | null
          subtotal: number | null
          supplier_id: string
          tax_amount: number | null
          tax_rate: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expected_delivery_date?: string | null
          expense_type?: Database["public"]["Enums"]["expense_type"] | null
          id?: string
          notes?: string | null
          order_date?: string
          payment_date?: string | null
          payment_status?: string | null
          po_number: string
          received_by?: string | null
          status?: Database["public"]["Enums"]["po_status"] | null
          subtotal?: number | null
          supplier_id: string
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string | null
          created_by?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          expected_delivery_date?: string | null
          expense_type?: Database["public"]["Enums"]["expense_type"] | null
          id?: string
          notes?: string | null
          order_date?: string
          payment_date?: string | null
          payment_status?: string | null
          po_number?: string
          received_by?: string | null
          status?: Database["public"]["Enums"]["po_status"] | null
          subtotal?: number | null
          supplier_id?: string
          tax_amount?: number | null
          tax_rate?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_po_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_po_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_po_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_po_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_po_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_po_received_by"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "purchase_orders_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      receipt_templates: {
        Row: {
          created_at: string | null
          custom_css: string | null
          footer_content: string | null
          header_content: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          show_cashier_name: boolean | null
          show_company_info: boolean | null
          show_customer_info: boolean | null
          show_logo: boolean | null
          show_loyalty_points: boolean | null
          show_payment_method: boolean | null
          show_tax_details: boolean | null
          template_type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_css?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          show_cashier_name?: boolean | null
          show_company_info?: boolean | null
          show_customer_info?: boolean | null
          show_logo?: boolean | null
          show_loyalty_points?: boolean | null
          show_payment_method?: boolean | null
          show_tax_details?: boolean | null
          template_type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_css?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          show_cashier_name?: boolean | null
          show_company_info?: boolean | null
          show_customer_info?: boolean | null
          show_logo?: boolean | null
          show_loyalty_points?: boolean | null
          show_payment_method?: boolean | null
          show_tax_details?: boolean | null
          template_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      recipes: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          material_id: string
          product_id: string
          quantity: number
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_id: string
          product_id: string
          quantity: number
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          material_id?: string
          product_id?: string
          quantity?: number
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          permission_id: string
          role_id: string
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id: string
          role_id: string
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          permission_id?: string
          role_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_role_permissions_granted_by"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_role_permissions_granted_by"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_role_permissions_granted_by"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          hierarchy_level: number | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name_en: string
          name_fr: string
          name_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name_en: string
          name_fr: string
          name_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          hierarchy_level?: number | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name_en?: string
          name_fr?: string
          name_id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      section_stock: {
        Row: {
          created_at: string | null
          id: string
          last_counted_at: string | null
          last_counted_by: string | null
          max_quantity: number | null
          min_quantity: number | null
          product_id: string
          quantity: number
          section_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          last_counted_at?: string | null
          last_counted_by?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          product_id: string
          quantity?: number
          section_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          last_counted_at?: string | null
          last_counted_by?: string | null
          max_quantity?: number | null
          min_quantity?: number | null
          product_id?: string
          quantity?: number
          section_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_stock_last_counted_by_fkey"
            columns: ["last_counted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_stock_last_counted_by_fkey"
            columns: ["last_counted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_stock_last_counted_by_fkey"
            columns: ["last_counted_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          name: string
          section_type: string | null
          slug: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name: string
          section_type?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          name?: string
          section_type?: string | null
          slug?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sections_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sections_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      sequence_tracker: {
        Row: {
          last_date: string
          last_value: number
          sequence_name: string
        }
        Insert: {
          last_date?: string
          last_value?: number
          sequence_name: string
        }
        Update: {
          last_date?: string
          last_value?: number
          sequence_name?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          category_id: string | null
          created_at: string | null
          default_value: Json | null
          description_en: string | null
          description_fr: string | null
          description_id: string | null
          id: string
          is_readonly: boolean | null
          is_sensitive: boolean | null
          is_system: boolean | null
          key: string
          name_en: string
          name_fr: string
          name_id: string
          requires_restart: boolean | null
          sort_order: number | null
          updated_at: string | null
          updated_by: string | null
          validation_rules: Json | null
          value: Json
          value_type: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          default_value?: Json | null
          description_en?: string | null
          description_fr?: string | null
          description_id?: string | null
          id?: string
          is_readonly?: boolean | null
          is_sensitive?: boolean | null
          is_system?: boolean | null
          key: string
          name_en: string
          name_fr: string
          name_id: string
          requires_restart?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
          validation_rules?: Json | null
          value?: Json
          value_type?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          default_value?: Json | null
          description_en?: string | null
          description_fr?: string | null
          description_id?: string | null
          id?: string
          is_readonly?: boolean | null
          is_sensitive?: boolean | null
          is_system?: boolean | null
          key?: string
          name_en?: string
          name_fr?: string
          name_id?: string
          requires_restart?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
          updated_by?: string | null
          validation_rules?: Json | null
          value?: Json
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "settings_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      settings_categories: {
        Row: {
          code: string
          created_at: string | null
          description_en: string | null
          description_fr: string | null
          description_id: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name_en: string
          name_fr: string
          name_id: string
          required_permission: string | null
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en: string
          name_fr: string
          name_id: string
          required_permission?: string | null
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description_en?: string | null
          description_fr?: string | null
          description_id?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name_en?: string
          name_fr?: string
          name_id?: string
          required_permission?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      settings_history: {
        Row: {
          change_reason: string | null
          changed_at: string | null
          changed_by: string | null
          id: string
          ip_address: unknown
          new_value: Json | null
          old_value: Json | null
          setting_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          setting_id: string
        }
        Update: {
          change_reason?: string | null
          changed_at?: string | null
          changed_by?: string | null
          id?: string
          ip_address?: unknown
          new_value?: Json | null
          old_value?: Json | null
          setting_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "settings_history_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "settings"
            referencedColumns: ["id"]
          },
        ]
      }
      settings_profiles: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          profile_type: string | null
          settings_snapshot: Json | null
          terminal_settings_snapshot: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          profile_type?: string | null
          settings_snapshot?: Json | null
          terminal_settings_snapshot?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          profile_type?: string | null
          settings_snapshot?: Json | null
          terminal_settings_snapshot?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_settings_profiles_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_settings_profiles_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_settings_profiles_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "settings_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settings_profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      sound_assets: {
        Row: {
          category: string
          code: string
          created_at: string | null
          file_path: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          file_path?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
        }
        Relationships: []
      }
      stock_locations: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          location_type: Database["public"]["Enums"]["location_type"] | null
          name: string
          parent_id: string | null
          section_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          location_type?: Database["public"]["Enums"]["location_type"] | null
          name: string
          parent_id?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          location_type?: Database["public"]["Enums"]["location_type"] | null
          name?: string
          parent_id?: string | null
          section_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_locations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_locations_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          batch_number: string | null
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          expiry_date: string | null
          from_location_id: string | null
          from_section_id: string | null
          id: string
          movement_id: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
          staff_id: string | null
          stock_after: number
          stock_before: number
          supplier_id: string | null
          to_location_id: string | null
          to_section_id: string | null
          unit_cost: number | null
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          expiry_date?: string | null
          from_location_id?: string | null
          from_section_id?: string | null
          id?: string
          movement_id: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          staff_id?: string | null
          stock_after: number
          stock_before: number
          supplier_id?: string | null
          to_location_id?: string | null
          to_section_id?: string | null
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          expiry_date?: string | null
          from_location_id?: string | null
          from_section_id?: string | null
          id?: string
          movement_id?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
          staff_id?: string | null
          stock_after?: number
          stock_before?: number
          supplier_id?: string | null
          to_location_id?: string | null
          to_section_id?: string | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_movements_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_movements_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_movements_staff"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "stock_movements_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_from_section_id_fkey"
            columns: ["from_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_to_section_id_fkey"
            columns: ["to_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          address_line1: string | null
          address_line2: string | null
          bank_account: string | null
          bank_name: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          payment_terms: Database["public"]["Enums"]["payment_terms"] | null
          phone: string | null
          postal_code: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account?: string | null
          bank_name?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          payment_terms?: Database["public"]["Enums"]["payment_terms"] | null
          phone?: string | null
          postal_code?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          address_line1?: string | null
          address_line2?: string | null
          bank_account?: string | null
          bank_name?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          payment_terms?: Database["public"]["Enums"]["payment_terms"] | null
          phone?: string | null
          postal_code?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_conflicts: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          local_data: Json | null
          remote_data: Json | null
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          local_data?: Json | null
          remote_data?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          local_data?: Json | null
          remote_data?: Json | null
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sync_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sync_conflicts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      sync_devices: {
        Row: {
          capabilities: Json | null
          created_at: string | null
          device_id: string
          device_name: string | null
          device_type: Database["public"]["Enums"]["sync_device_type"]
          id: string
          last_sync_at: string | null
          status: string | null
          sync_version: number | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string | null
          device_id: string
          device_name?: string | null
          device_type: Database["public"]["Enums"]["sync_device_type"]
          id?: string
          last_sync_at?: string | null
          status?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          created_at?: string | null
          device_id?: string
          device_name?: string | null
          device_type?: Database["public"]["Enums"]["sync_device_type"]
          id?: string
          last_sync_at?: string | null
          status?: string | null
          sync_version?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          created_at: string | null
          device_id: string
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          max_retries: number | null
          operation: string
          payload: Json | null
          priority: number | null
          processed_at: string | null
          retry_count: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          operation: string
          payload?: Json | null
          priority?: number | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          max_retries?: number | null
          operation?: string
          payload?: Json | null
          priority?: number | null
          processed_at?: string | null
          retry_count?: number | null
          status?: string | null
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          applies_to: Json | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          is_inclusive: boolean | null
          name: string | null
          name_en: string
          name_fr: string
          name_id: string
          rate: number
          updated_at: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          applies_to?: Json | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_inclusive?: boolean | null
          name?: string | null
          name_en: string
          name_fr: string
          name_id: string
          rate: number
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          applies_to?: Json | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          is_inclusive?: boolean | null
          name?: string | null
          name_en?: string
          name_fr?: string
          name_id?: string
          rate?: number
          updated_at?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      terminal_settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          terminal_id: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          terminal_id: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          terminal_id?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: [
          {
            foreignKeyName: "terminal_settings_terminal_id_fkey"
            columns: ["terminal_id"]
            isOneToOne: false
            referencedRelation: "pos_terminals"
            referencedColumns: ["id"]
          },
        ]
      }
      transfer_items: {
        Row: {
          created_at: string | null
          id: string
          notes: string | null
          product_id: string
          quantity_received: number | null
          quantity_requested: number
          quantity_sent: number | null
          transfer_id: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id: string
          quantity_received?: number | null
          quantity_requested: number
          quantity_sent?: number | null
          transfer_id: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          notes?: string | null
          product_id?: string
          quantity_received?: number | null
          quantity_requested?: number
          quantity_sent?: number | null
          transfer_id?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "internal_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_granted: boolean | null
          permission_id: string
          reason: string | null
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_id: string
          reason?: string | null
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_granted?: boolean | null
          permission_id?: string
          reason?: string | null
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_permissions_granted_by"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_permissions_granted_by"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_permissions_granted_by"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          can_access_reports: boolean | null
          can_apply_discount: boolean | null
          can_cancel_order: boolean | null
          created_at: string | null
          created_by: string | null
          display_name: string | null
          email: string | null
          employee_code: string | null
          failed_login_attempts: number | null
          first_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          last_name: string | null
          locked_until: string | null
          must_change_password: boolean | null
          name: string
          password_changed_at: string | null
          phone: string | null
          pin_code: string | null
          pin_hash: string | null
          preferred_language: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          timezone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          can_access_reports?: boolean | null
          can_apply_discount?: boolean | null
          can_cancel_order?: boolean | null
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          email?: string | null
          employee_code?: string | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          locked_until?: string | null
          must_change_password?: boolean | null
          name: string
          password_changed_at?: string | null
          phone?: string | null
          pin_code?: string | null
          pin_hash?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          can_access_reports?: boolean | null
          can_apply_discount?: boolean | null
          can_cancel_order?: boolean | null
          created_at?: string | null
          created_by?: string | null
          display_name?: string | null
          email?: string | null
          employee_code?: string | null
          failed_login_attempts?: number | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          locked_until?: string | null
          must_change_password?: boolean | null
          name?: string
          password_changed_at?: string | null
          phone?: string | null
          pin_code?: string | null
          pin_hash?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_profiles_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_profiles_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_profiles_created_by"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "fk_user_profiles_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_profiles_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_profiles_updated_by"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          is_primary: boolean | null
          role_id: string
          user_id: string
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_primary?: boolean | null
          role_id: string
          user_id: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          is_primary?: boolean | null
          role_id?: string
          user_id?: string
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_roles_assigned_by"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_assigned_by"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_roles_assigned_by"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          device_name: string | null
          device_type: string | null
          end_reason: string | null
          ended_at: string | null
          id: string
          ip_address: unknown
          last_activity_at: string | null
          session_token: string
          session_token_hash: string | null
          started_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          device_name?: string | null
          device_type?: string | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          session_token: string
          session_token_hash?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          device_name?: string | null
          device_type?: string | null
          end_reason?: string | null
          ended_at?: string | null
          id?: string
          ip_address?: unknown
          last_activity_at?: string | null
          session_token?: string
          session_token_hash?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles_safe"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
    }
    Views: {
      active_products: {
        Row: {
          available_for_sale: boolean | null
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          current_stock: number | null
          deduct_ingredients: boolean | null
          deleted_at: string | null
          description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          is_made_to_order: boolean | null
          min_stock_level: number | null
          name: string | null
          pos_visible: boolean | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          retail_price: number | null
          section_id: string | null
          sku: string | null
          unit: string | null
          updated_at: string | null
          wholesale_price: number | null
        }
        Insert: {
          available_for_sale?: boolean | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          deduct_ingredients?: boolean | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_made_to_order?: boolean | null
          min_stock_level?: number | null
          name?: string | null
          pos_visible?: boolean | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          retail_price?: number | null
          section_id?: string | null
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Update: {
          available_for_sale?: boolean | null
          category_id?: string | null
          cost_price?: number | null
          created_at?: string | null
          current_stock?: number | null
          deduct_ingredients?: boolean | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          is_made_to_order?: boolean | null
          min_stock_level?: number | null
          name?: string | null
          pos_visible?: boolean | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          retail_price?: number | null
          section_id?: string | null
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "view_category_sales"
            referencedColumns: ["category_id"]
          },
          {
            foreignKeyName: "products_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles_safe: {
        Row: {
          auth_user_id: string | null
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          email: string | null
          employee_code: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          last_name: string | null
          name: string | null
          phone: string | null
          preferred_language: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          employee_code?: string | null
          first_name?: string | null
          id?: string | null
          is_active?: boolean | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          auth_user_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          email?: string | null
          employee_code?: string | null
          first_name?: string | null
          id?: string | null
          is_active?: boolean | null
          last_name?: string | null
          name?: string | null
          phone?: string | null
          preferred_language?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      view_b2b_performance: {
        Row: {
          avg_order_value: number | null
          company_name: string | null
          customer_id: string | null
          customer_name: string | null
          last_order_date: string | null
          total_orders: number | null
          total_outstanding: number | null
          total_paid: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      view_category_sales: {
        Row: {
          avg_item_value: number | null
          category_id: string | null
          category_name: string | null
          color: string | null
          icon: string | null
          items_sold: number | null
          order_count: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      view_customer_insights: {
        Row: {
          avg_order_value: number | null
          category_name: string | null
          customer_id: string | null
          customer_name: string | null
          customer_type: Database["public"]["Enums"]["customer_type"] | null
          days_since_last_visit: number | null
          last_visit_at: string | null
          lifetime_points: number | null
          loyalty_points: number | null
          loyalty_tier: string | null
          total_spent: number | null
          total_visits: number | null
        }
        Relationships: []
      }
      view_daily_kpis: {
        Row: {
          avg_order_value: number | null
          cancelled_orders: number | null
          card_sales: number | null
          cash_sales: number | null
          completed_orders: number | null
          edc_sales: number | null
          qris_sales: number | null
          report_date: string | null
          total_discounts: number | null
          total_orders: number | null
          total_revenue: number | null
          total_tax: number | null
          unique_customers: number | null
        }
        Relationships: []
      }
      view_hourly_sales: {
        Row: {
          avg_order_value: number | null
          hour_of_day: number | null
          order_count: number | null
          sale_date: string | null
          total_sales: number | null
        }
        Relationships: []
      }
      view_inventory_valuation: {
        Row: {
          category_name: string | null
          cost_price: number | null
          current_stock: number | null
          min_stock_level: number | null
          name: string | null
          product_id: string | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          retail_price: number | null
          sku: string | null
          stock_status: string | null
          stock_value_cost: number | null
          stock_value_retail: number | null
          unit: string | null
        }
        Relationships: []
      }
      view_kds_queue_status: {
        Row: {
          avg_wait_seconds: number | null
          order_count: number | null
          station_type: string | null
          status: string | null
        }
        Relationships: []
      }
      view_order_type_distribution: {
        Row: {
          avg_order_value: number | null
          order_count: number | null
          order_type: Database["public"]["Enums"]["order_type"] | null
          report_date: string | null
          total_revenue: number | null
        }
        Relationships: []
      }
      view_payment_method_stats: {
        Row: {
          avg_amount: number | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          report_date: string | null
          total_amount: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      view_product_sales: {
        Row: {
          avg_unit_price: number | null
          category_name: string | null
          cost_price: number | null
          current_price: number | null
          gross_profit: number | null
          order_count: number | null
          product_id: string | null
          product_name: string | null
          sku: string | null
          total_quantity: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      view_production_summary: {
        Row: {
          product_id: string | null
          product_name: string | null
          production_batches: number | null
          production_date: string | null
          section_name: string | null
          total_produced: number | null
          total_waste: number | null
        }
        Relationships: []
      }
      view_section_stock_details: {
        Row: {
          id: string | null
          last_counted_at: string | null
          max_quantity: number | null
          min_quantity: number | null
          product_id: string | null
          product_name: string | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          quantity: number | null
          section_code: string | null
          section_id: string | null
          section_name: string | null
          section_type: string | null
          sku: string | null
          stock_status: string | null
          unit: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "active_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_inventory_valuation"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_sales"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_production_summary"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_stock_alerts"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "section_stock_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      view_session_summary: {
        Row: {
          cash_difference: number | null
          closed_at: string | null
          closed_by_name: string | null
          closing_cash: number | null
          difference_reason: string | null
          expected_cash: number | null
          opened_at: string | null
          opened_by_name: string | null
          opening_cash: number | null
          session_id: string | null
          session_number: string | null
          status: Database["public"]["Enums"]["session_status"] | null
          total_card_sales: number | null
          total_cash_sales: number | null
          total_discounts: number | null
          total_orders: number | null
          total_qris_sales: number | null
          total_refunds: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      view_staff_performance: {
        Row: {
          avg_order_value: number | null
          cancelled_orders: number | null
          orders_processed: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          staff_id: string | null
          staff_name: string | null
          total_discounts_given: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      view_stock_alerts: {
        Row: {
          alert_level: string | null
          category_name: string | null
          current_stock: number | null
          min_stock_level: number | null
          product_id: string | null
          product_name: string | null
          quantity_needed: number | null
          sku: string | null
          unit: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_loyalty_points: {
        Args: {
          p_created_by?: string
          p_customer_id: string
          p_order_amount: number
          p_order_id: string
        }
        Returns: number
      }
      close_shift: {
        Args: {
          p_actual_cash: number
          p_actual_edc: number
          p_actual_qris: number
          p_closed_by: string
          p_notes?: string
          p_session_id: string
        }
        Returns: Json
      }
      finalize_inventory_count: {
        Args: { count_uuid: string }
        Returns: boolean
      }
      get_current_user_profile_id: { Args: never; Returns: string }
      get_customer_product_price: {
        Args: { p_customer_category_slug: string; p_product_id: string }
        Returns: number
      }
      get_ingredient_deduction_section: {
        Args: { p_consuming_section_id: string; p_ingredient_id: string }
        Returns: string
      }
      get_next_daily_sequence: {
        Args: { p_date?: string; p_sequence_name: string }
        Returns: number
      }
      get_settings_by_category: {
        Args: { p_category_code: string }
        Returns: {
          category_id: string | null
          created_at: string | null
          default_value: Json | null
          description_en: string | null
          description_fr: string | null
          description_id: string | null
          id: string
          is_readonly: boolean | null
          is_sensitive: boolean | null
          is_system: boolean | null
          key: string
          name_en: string
          name_fr: string
          name_id: string
          requires_restart: boolean | null
          sort_order: number | null
          updated_at: string | null
          updated_by: string | null
          validation_rules: Json | null
          value: Json
          value_type: string
        }[]
        SetofOptions: {
          from: "*"
          to: "settings"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_terminal_open_shifts: {
        Args: { p_terminal_id: string }
        Returns: {
          created_at: string
          expected_cash: number
          expected_edc: number
          expected_qris: number
          id: string
          notes: string
          opened_at: string
          opening_cash: number
          session_number: string
          status: string
          terminal_id: string
          total_sales: number
          transaction_count: number
          updated_at: string
          user_id: string
          user_name: string
        }[]
      }
      get_user_open_shift: {
        Args: { p_user_id: string }
        Returns: {
          created_at: string
          expected_cash: number
          expected_edc: number
          expected_qris: number
          id: string
          notes: string
          opened_at: string
          opening_cash: number
          session_number: string
          status: string
          terminal_id: string
          total_sales: number
          transaction_count: number
          updated_at: string
          user_id: string
          user_name: string
        }[]
      }
      get_user_permissions: {
        Args: { p_user_id: string }
        Returns: {
          is_granted: boolean
          is_sensitive: boolean
          permission_action: string
          permission_code: string
          permission_module: string
          source: string
        }[]
      }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      open_shift: {
        Args: {
          p_notes?: string
          p_opening_cash: number
          p_terminal_id: string
        }
        Returns: Json
      }
      redeem_loyalty_points: {
        Args: {
          p_created_by?: string
          p_customer_id: string
          p_description?: string
          p_order_id?: string
          p_points: number
        }
        Returns: boolean
      }
      register_lan_node: {
        Args: {
          p_device_id: string
          p_device_name?: string
          p_device_type?: string
          p_ip_address?: string
          p_is_hub?: boolean
          p_port?: number
        }
        Returns: string
      }
      reset_category_settings: {
        Args: { p_category_code: string }
        Returns: number
      }
      reset_setting: { Args: { p_key: string }; Returns: boolean }
      set_user_pin: {
        Args: { p_pin: string; p_user_id: string }
        Returns: boolean
      }
      update_lan_node_heartbeat: {
        Args: { p_device_id: string }
        Returns: boolean
      }
      update_setting: {
        Args: { p_key: string; p_reason?: string; p_value: Json }
        Returns: boolean
      }
      update_settings_bulk: { Args: { p_settings: Json }; Returns: number }
      user_has_permission: {
        Args: { p_permission_code: string; p_user_id: string }
        Returns: boolean
      }
      verify_user_pin: {
        Args: { p_pin: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      audit_severity: "info" | "warning" | "critical"
      b2b_status:
        | "draft"
        | "confirmed"
        | "processing"
        | "ready"
        | "delivered"
        | "completed"
        | "cancelled"
      customer_type: "retail" | "wholesale"
      discount_type: "percentage" | "fixed" | "free"
      dispatch_station: "barista" | "kitchen" | "display" | "none"
      expense_type: "cogs" | "general"
      item_status: "new" | "preparing" | "ready" | "served"
      lan_node_status: "online" | "offline" | "connecting"
      location_type: "main_warehouse" | "section" | "kitchen" | "storage"
      modifier_group_type: "single" | "multiple"
      movement_type:
        | "purchase"
        | "production_in"
        | "production_out"
        | "sale_pos"
        | "sale_b2b"
        | "adjustment_in"
        | "adjustment_out"
        | "waste"
        | "transfer_in"
        | "transfer_out"
        | "transfer"
        | "ingredient"
      order_status:
        | "new"
        | "preparing"
        | "ready"
        | "served"
        | "completed"
        | "cancelled"
      order_type: "dine_in" | "takeaway" | "delivery" | "b2b"
      payment_method: "cash" | "card" | "qris" | "edc" | "split" | "transfer"
      payment_status: "unpaid" | "partial" | "paid"
      payment_terms: "cod" | "net15" | "net30" | "net60"
      po_status: "draft" | "sent" | "partial" | "received" | "cancelled"
      product_type: "finished" | "semi_finished" | "raw_material"
      session_status: "open" | "closed"
      sync_device_type: "pos" | "kds" | "display" | "mobile"
      transfer_status:
        | "draft"
        | "pending"
        | "in_transit"
        | "received"
        | "cancelled"
      user_role:
        | "admin"
        | "manager"
        | "cashier"
        | "server"
        | "barista"
        | "kitchen"
        | "backoffice"
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
      audit_severity: ["info", "warning", "critical"],
      b2b_status: [
        "draft",
        "confirmed",
        "processing",
        "ready",
        "delivered",
        "completed",
        "cancelled",
      ],
      customer_type: ["retail", "wholesale"],
      discount_type: ["percentage", "fixed", "free"],
      dispatch_station: ["barista", "kitchen", "display", "none"],
      expense_type: ["cogs", "general"],
      item_status: ["new", "preparing", "ready", "served"],
      lan_node_status: ["online", "offline", "connecting"],
      location_type: ["main_warehouse", "section", "kitchen", "storage"],
      modifier_group_type: ["single", "multiple"],
      movement_type: [
        "purchase",
        "production_in",
        "production_out",
        "sale_pos",
        "sale_b2b",
        "adjustment_in",
        "adjustment_out",
        "waste",
        "transfer_in",
        "transfer_out",
        "transfer",
        "ingredient",
      ],
      order_status: [
        "new",
        "preparing",
        "ready",
        "served",
        "completed",
        "cancelled",
      ],
      order_type: ["dine_in", "takeaway", "delivery", "b2b"],
      payment_method: ["cash", "card", "qris", "edc", "split", "transfer"],
      payment_status: ["unpaid", "partial", "paid"],
      payment_terms: ["cod", "net15", "net30", "net60"],
      po_status: ["draft", "sent", "partial", "received", "cancelled"],
      product_type: ["finished", "semi_finished", "raw_material"],
      session_status: ["open", "closed"],
      sync_device_type: ["pos", "kds", "display", "mobile"],
      transfer_status: [
        "draft",
        "pending",
        "in_transit",
        "received",
        "cancelled",
      ],
      user_role: [
        "admin",
        "manager",
        "cashier",
        "server",
        "barista",
        "kitchen",
        "backoffice",
      ],
    },
  },
} as const
