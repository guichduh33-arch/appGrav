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
        ]
      }
      b2b_deliveries: {
        Row: {
          actual_date: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_address: string | null
          delivery_number: string | null
          driver_name: string | null
          id: string
          notes: string | null
          order_id: string
          received_by: string | null
          scheduled_date: string | null
          signature_url: string | null
          status: string
          updated_at: string
          vehicle_info: string | null
        }
        Insert: {
          actual_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_number?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          order_id: string
          received_by?: string | null
          scheduled_date?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string
          vehicle_info?: string | null
        }
        Update: {
          actual_date?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_number?: string | null
          driver_name?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          received_by?: string | null
          scheduled_date?: string | null
          signature_url?: string | null
          status?: string
          updated_at?: string
          vehicle_info?: string | null
        }
        Relationships: []
      }
      b2b_delivery_items: {
        Row: {
          created_at: string
          delivery_id: string
          id: string
          notes: string | null
          order_item_id: string
          quantity_delivered: number
        }
        Insert: {
          created_at?: string
          delivery_id: string
          id?: string
          notes?: string | null
          order_item_id: string
          quantity_delivered: number
        }
        Update: {
          created_at?: string
          delivery_id?: string
          id?: string
          notes?: string | null
          order_item_id?: string
          quantity_delivered?: number
        }
        Relationships: [
          {
            foreignKeyName: "b2b_delivery_items_delivery_id_fkey"
            columns: ["delivery_id"]
            isOneToOne: false
            referencedRelation: "b2b_deliveries"
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
        Relationships: []
      }
      b2b_order_items: {
        Row: {
          created_at: string | null
          discount_percent: number | null
          id: string
          order_id: string
          product_id: string
          product_name: string
          product_sku: string | null
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          order_id: string
          product_id: string
          product_name: string
          product_sku?: string | null
          quantity: number
          total: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount_percent?: number | null
          id?: string
          order_id?: string
          product_id?: string
          product_name?: string
          product_sku?: string | null
          quantity?: number
          total?: number
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "b2b_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_orders: {
        Row: {
          amount_due: number
          amount_paid: number
          created_at: string | null
          created_by: string | null
          customer_id: string
          delivered_at: string | null
          delivery_address: string | null
          delivery_date: string | null
          delivery_notes: string | null
          discount_amount: number | null
          discount_percent: number | null
          discount_type: string | null
          discount_value: number | null
          due_date: string | null
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
          payment_terms: string | null
          requested_delivery_date: string | null
          status: string | null
          stock_deducted: boolean | null
          subtotal: number | null
          tax_amount: number | null
          tax_rate: number | null
          total: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount_due?: number
          amount_paid?: number
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string | null
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
          payment_terms?: string | null
          requested_delivery_date?: string | null
          status?: string | null
          stock_deducted?: boolean | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          amount_due?: number
          amount_paid?: number
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          delivered_at?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_notes?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          discount_type?: string | null
          discount_value?: number | null
          due_date?: string | null
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
          payment_terms?: string | null
          requested_delivery_date?: string | null
          status?: string | null
          stock_deducted?: boolean | null
          subtotal?: number | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "b2b_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "b2b_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "b2b_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      b2b_payments: {
        Row: {
          amount: number
          bank_name: string | null
          created_at: string
          customer_id: string | null
          id: string
          notes: string | null
          order_id: string
          payment_date: string
          payment_method: string
          payment_number: string | null
          received_by: string | null
          reference_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          bank_name?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_id: string
          payment_date?: string
          payment_method: string
          payment_number?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          bank_name?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          payment_date?: string
          payment_method?: string
          payment_number?: string | null
          received_by?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string
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
      customer_category_prices: {
        Row: {
          category_id: string
          created_at: string
          custom_price: number
          id: string
          is_active: boolean
          product_id: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          custom_price: number
          id?: string
          is_active?: boolean
          product_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          custom_price?: number
          id?: string
          is_active?: boolean
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_category_prices_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "customer_categories"
            referencedColumns: ["id"]
          },
        ]
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
          created_at: string
          decoration_type: string | null
          height: number | null
          id: string
          number: string | null
          section: string | null
          shape: string
          status: string | null
          type: string
          updated_at: string
          width: number | null
          x: number
          y: number
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          decoration_type?: string | null
          height?: number | null
          id?: string
          number?: string | null
          section?: string | null
          shape: string
          status?: string | null
          type: string
          updated_at?: string
          width?: number | null
          x?: number
          y?: number
        }
        Update: {
          capacity?: number | null
          created_at?: string
          decoration_type?: string | null
          height?: number | null
          id?: string
          number?: string | null
          section?: string | null
          shape?: string
          status?: string | null
          type?: string
          updated_at?: string
          width?: number | null
          x?: number
          y?: number
        }
        Relationships: []
      }
      internal_transfers: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_by_name: string | null
          created_at: string
          from_location_id: string
          id: string
          notes: string | null
          received_at: string | null
          received_by: string | null
          received_by_name: string | null
          requested_at: string | null
          requested_by: string | null
          requested_by_name: string | null
          responsible_person: string
          shipped_at: string | null
          status: string
          to_location_id: string
          total_items: number | null
          total_value: number | null
          transfer_date: string
          transfer_number: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          created_at?: string
          from_location_id: string
          id?: string
          notes?: string | null
          received_at?: string | null
          received_by?: string | null
          received_by_name?: string | null
          requested_at?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          responsible_person: string
          shipped_at?: string | null
          status?: string
          to_location_id: string
          total_items?: number | null
          total_value?: number | null
          transfer_date?: string
          transfer_number: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          created_at?: string
          from_location_id?: string
          id?: string
          notes?: string | null
          received_at?: string | null
          received_by?: string | null
          received_by_name?: string | null
          requested_at?: string | null
          requested_by?: string | null
          requested_by_name?: string | null
          responsible_person?: string
          shipped_at?: string | null
          status?: string
          to_location_id?: string
          total_items?: number | null
          total_value?: number | null
          transfer_date?: string
          transfer_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "internal_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "internal_transfers_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "internal_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["location_id"]
          },
          {
            foreignKeyName: "internal_transfers_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "stock_locations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_count_items: {
        Row: {
          actual_stock: number | null
          created_at: string | null
          id: string
          inventory_count_id: string
          notes: string | null
          product_id: string
          system_stock: number
          unit: string | null
          updated_at: string | null
          variance: number | null
        }
        Insert: {
          actual_stock?: number | null
          created_at?: string | null
          id?: string
          inventory_count_id: string
          notes?: string | null
          product_id: string
          system_stock: number
          unit?: string | null
          updated_at?: string | null
          variance?: number | null
        }
        Update: {
          actual_stock?: number | null
          created_at?: string | null
          id?: string
          inventory_count_id?: string
          notes?: string | null
          product_id?: string
          system_stock?: number
          unit?: string | null
          updated_at?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_count_items_inventory_count_id_fkey"
            columns: ["inventory_count_id"]
            isOneToOne: false
            referencedRelation: "inventory_counts"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_counts: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          count_number: string
          created_at: string | null
          id: string
          notes: string | null
          started_at: string | null
          started_by: string | null
          status: Database["public"]["Enums"]["inventory_count_status"] | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          count_number: string
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["inventory_count_status"] | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          count_number?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          started_at?: string | null
          started_by?: string | null
          status?: Database["public"]["Enums"]["inventory_count_status"] | null
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
        Relationships: []
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
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string | null
          dispatch_station:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          id: string
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
          sent_to_kitchen_at: string | null
          served_at: string | null
          total_price: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dispatch_station?:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          id?: string
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
          sent_to_kitchen_at?: string | null
          served_at?: string | null
          total_price: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dispatch_station?:
            | Database["public"]["Enums"]["dispatch_station"]
            | null
          id?: string
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
          sent_to_kitchen_at?: string | null
          served_at?: string | null
          total_price?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
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
          order_number: string
          order_type: Database["public"]["Enums"]["order_type"] | null
          payment_details: Json | null
          payment_method: Database["public"]["Enums"]["payment_method"] | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          points_discount: number | null
          points_earned: number | null
          points_used: number | null
          session_id: string | null
          staff_id: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          subtotal: number | null
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
          order_number: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          payment_details?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          points_discount?: number | null
          points_earned?: number | null
          points_used?: number | null
          session_id?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
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
          order_number?: string
          order_type?: Database["public"]["Enums"]["order_type"] | null
          payment_details?: Json | null
          payment_method?: Database["public"]["Enums"]["payment_method"] | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          points_discount?: number | null
          points_earned?: number | null
          points_used?: number | null
          session_id?: string | null
          staff_id?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          subtotal?: number | null
          table_number?: string | null
          tax_amount?: number | null
          tax_rate?: number | null
          total?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
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
            foreignKeyName: "orders_discount_manager_id_fkey"
            columns: ["discount_manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_discount_manager_id_fkey"
            columns: ["discount_manager_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "orders_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pos_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
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
          name_en: string
          name_fr: string
          name_id: string
          payment_type: string
          requires_reference: boolean | null
          settings: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name_en: string
          name_fr: string
          name_id: string
          payment_type: string
          requires_reference?: boolean | null
          settings?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name_en?: string
          name_fr?: string
          name_id?: string
          payment_type?: string
          requires_reference?: boolean | null
          settings?: Json | null
          sort_order?: number | null
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
      po_items: {
        Row: {
          created_at: string | null
          id: string
          po_id: string
          product_id: string
          quantity_ordered: number
          quantity_received: number | null
          total: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          po_id: string
          product_id: string
          quantity_ordered: number
          quantity_received?: number | null
          total: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          po_id?: string
          product_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          total?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "po_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "po_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "po_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "po_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      pos_sessions: {
        Row: {
          actual_cash: number | null
          actual_edc: number | null
          actual_qris: number | null
          cash_difference: number | null
          closed_at: string | null
          closed_by: string | null
          closing_cash: number | null
          closing_cash_details: Json | null
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
          tips_card: number | null
          tips_cash: number | null
          total_card_sales: number | null
          total_cash_sales: number | null
          total_discounts: number | null
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
          closing_cash?: number | null
          closing_cash_details?: Json | null
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
          tips_card?: number | null
          tips_cash?: number | null
          total_card_sales?: number | null
          total_cash_sales?: number | null
          total_discounts?: number | null
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
          closing_cash?: number | null
          closing_cash_details?: Json | null
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
          tips_card?: number | null
          tips_cash?: number | null
          total_card_sales?: number | null
          total_cash_sales?: number | null
          total_discounts?: number | null
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
            foreignKeyName: "pos_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "pos_sessions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sessions_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "pos_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pos_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
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
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
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
          customer_category_id: string
          id: string
          is_active: boolean | null
          price: number
          product_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_category_id: string
          id?: string
          is_active?: boolean | null
          price: number
          product_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_category_id?: string
          id?: string
          is_active?: boolean | null
          price?: number
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_category_prices_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_combo_group_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_combo_groups: {
        Row: {
          combo_id: string
          created_at: string | null
          group_name: string
          group_type: string
          id: string
          is_required: boolean | null
          max_selections: number | null
          min_selections: number | null
          sort_order: number | null
        }
        Insert: {
          combo_id: string
          created_at?: string | null
          group_name: string
          group_type?: string
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          sort_order?: number | null
        }
        Update: {
          combo_id?: string
          created_at?: string | null
          group_name?: string
          group_type?: string
          id?: string
          is_required?: boolean | null
          max_selections?: number | null
          min_selections?: number | null
          sort_order?: number | null
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_modifiers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_sections: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          product_id: string
          section_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          product_id: string
          section_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          product_id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      product_stocks: {
        Row: {
          id: string
          product_id: string | null
          quantity: number | null
          section_id: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          product_id?: string | null
          quantity?: number | null
          section_id?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string | null
          quantity?: number | null
          section_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_stocks_section_id_fkey"
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
          is_consumption_unit: boolean | null
          is_purchase_unit: boolean | null
          is_stock_opname_unit: boolean | null
          product_id: string
          unit_name: string
        }
        Insert: {
          barcode?: string | null
          conversion_factor: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_consumption_unit?: boolean | null
          is_purchase_unit?: boolean | null
          is_stock_opname_unit?: boolean | null
          product_id: string
          unit_name: string
        }
        Update: {
          barcode?: string | null
          conversion_factor?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_consumption_unit?: boolean | null
          is_purchase_unit?: boolean | null
          is_stock_opname_unit?: boolean | null
          product_id?: string
          unit_name?: string
        }
        Relationships: []
      }
      production_records: {
        Row: {
          created_at: string | null
          created_by: string | null
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
          created_by?: string | null
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
          created_by?: string | null
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
            foreignKeyName: "production_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
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
          default_producing_section_id: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          min_stock_level: number | null
          name: string
          pos_visible: boolean | null
          preferred_purchase_unit_id: string | null
          preferred_recipe_unit_id: string | null
          preferred_stock_unit_id: string | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          retail_price: number | null
          shelf_life_days: number | null
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
          default_producing_section_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock_level?: number | null
          name: string
          pos_visible?: boolean | null
          preferred_purchase_unit_id?: string | null
          preferred_recipe_unit_id?: string | null
          preferred_stock_unit_id?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          retail_price?: number | null
          shelf_life_days?: number | null
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
          default_producing_section_id?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          min_stock_level?: number | null
          name?: string
          pos_visible?: boolean | null
          preferred_purchase_unit_id?: string | null
          preferred_recipe_unit_id?: string | null
          preferred_stock_unit_id?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          retail_price?: number | null
          shelf_life_days?: number | null
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
            foreignKeyName: "products_default_producing_section_id_fkey"
            columns: ["default_producing_section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_preferred_purchase_unit_id_fkey"
            columns: ["preferred_purchase_unit_id"]
            isOneToOne: false
            referencedRelation: "product_uoms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_preferred_recipe_unit_id_fkey"
            columns: ["preferred_recipe_unit_id"]
            isOneToOne: false
            referencedRelation: "product_uoms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_preferred_stock_unit_id_fkey"
            columns: ["preferred_stock_unit_id"]
            isOneToOne: false
            referencedRelation: "product_uoms"
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_free_products_free_product_id_fkey"
            columns: ["free_product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
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
      purchase_order_history: {
        Row: {
          action_type: string
          changed_by: string | null
          created_at: string
          description: string
          id: string
          metadata: Json | null
          new_status: string | null
          previous_status: string | null
          purchase_order_id: string
        }
        Insert: {
          action_type: string
          changed_by?: string | null
          created_at?: string
          description: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          purchase_order_id: string
        }
        Update: {
          action_type?: string
          changed_by?: string | null
          created_at?: string
          description?: string
          id?: string
          metadata?: Json | null
          new_status?: string | null
          previous_status?: string | null
          purchase_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_history_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_order_items: {
        Row: {
          created_at: string
          description: string | null
          discount_amount: number
          discount_percentage: number | null
          id: string
          line_total: number
          notes: string | null
          product_id: string | null
          product_name: string
          purchase_order_id: string
          quantity: number
          quantity_received: number
          quantity_returned: number
          tax_rate: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_percentage?: number | null
          id?: string
          line_total: number
          notes?: string | null
          product_id?: string | null
          product_name: string
          purchase_order_id: string
          quantity: number
          quantity_received?: number
          quantity_returned?: number
          tax_rate?: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_amount?: number
          discount_percentage?: number | null
          id?: string
          line_total?: number
          notes?: string | null
          product_id?: string | null
          product_name?: string
          purchase_order_id?: string
          quantity?: number
          quantity_received?: number
          quantity_returned?: number
          tax_rate?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "purchase_order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
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
      purchase_order_returns: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          purchase_order_id: string
          purchase_order_item_id: string
          quantity_returned: number
          reason: string
          reason_details: string | null
          refund_amount: number | null
          return_date: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          purchase_order_id: string
          purchase_order_item_id: string
          quantity_returned: number
          reason: string
          reason_details?: string | null
          refund_amount?: number | null
          return_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          purchase_order_id?: string
          purchase_order_item_id?: string
          quantity_returned?: number
          reason?: string
          reason_details?: string | null
          refund_amount?: number | null
          return_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_returns_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_returns_purchase_order_item_id_fkey"
            columns: ["purchase_order_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          actual_delivery_date: string | null
          created_at: string
          created_by: string | null
          discount_amount: number
          discount_percentage: number | null
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          payment_date: string | null
          payment_status: string
          po_number: string
          status: string
          subtotal: number
          supplier_id: string
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          discount_percentage?: number | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          payment_date?: string | null
          payment_status?: string
          po_number: string
          status: string
          subtotal?: number
          supplier_id: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          discount_percentage?: number | null
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          payment_date?: string | null
          payment_status?: string
          po_number?: string
          status?: string
          subtotal?: number
          supplier_id?: string
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      reporting_stock_snapshots: {
        Row: {
          created_at: string | null
          id: string
          low_stock_count: number | null
          out_of_stock_count: number | null
          snapshot_date: string
          total_items_count: number | null
          total_value_cost: number | null
          total_value_retail: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          low_stock_count?: number | null
          out_of_stock_count?: number | null
          snapshot_date?: string
          total_items_count?: number | null
          total_value_cost?: number | null
          total_value_retail?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          low_stock_count?: number | null
          out_of_stock_count?: number | null
          snapshot_date?: string
          total_items_count?: number | null
          total_value_cost?: number | null
          total_value_retail?: number | null
        }
        Relationships: []
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
      section_items: {
        Row: {
          id: string
          last_updated_at: string | null
          product_id: string
          quantity: number
          section_id: string
        }
        Insert: {
          id?: string
          last_updated_at?: string | null
          product_id: string
          quantity?: number
          section_id: string
        }
        Update: {
          id?: string
          last_updated_at?: string | null
          product_id?: string
          quantity?: number
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "storage_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      sections: {
        Row: {
          created_at: string
          id: string
          is_production_point: boolean | null
          is_sales_point: boolean | null
          is_warehouse: boolean | null
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_production_point?: boolean | null
          is_sales_point?: boolean | null
          is_warehouse?: boolean | null
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          is_production_point?: boolean | null
          is_sales_point?: boolean | null
          is_warehouse?: boolean | null
          name?: string
          slug?: string
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
            foreignKeyName: "settings_history_setting_id_fkey"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "settings"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_locations: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_type: string
          name: string
          responsible_person: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_type: string
          name: string
          responsible_person?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_type?: string
          name?: string
          responsible_person?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string | null
          created_by: string | null
          created_by_name: string | null
          from_location_id: string | null
          from_section_id: string | null
          id: string
          movement_id: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes: string | null
          product_id: string
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          staff_id: string | null
          stock_after: number
          stock_before: number
          to_location_id: string | null
          to_section_id: string | null
          total_cost: number | null
          unit: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          from_location_id?: string | null
          from_section_id?: string | null
          id?: string
          movement_id: string
          movement_type: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          product_id: string
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          staff_id?: string | null
          stock_after: number
          stock_before: number
          to_location_id?: string | null
          to_section_id?: string | null
          total_cost?: number | null
          unit?: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          created_by_name?: string | null
          from_location_id?: string | null
          from_section_id?: string | null
          id?: string
          movement_id?: string
          movement_type?: Database["public"]["Enums"]["movement_type"]
          notes?: string | null
          product_id?: string
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          staff_id?: string | null
          stock_after?: number
          stock_before?: number
          to_location_id?: string | null
          to_section_id?: string | null
          total_cost?: number | null
          unit?: string
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_from_location_id_fkey"
            columns: ["from_location_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["location_id"]
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
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
          {
            foreignKeyName: "stock_movements_to_location_id_fkey"
            columns: ["to_location_id"]
            isOneToOne: false
            referencedRelation: "stock_balances"
            referencedColumns: ["location_id"]
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
      storage_sections: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          postal_code: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          postal_code?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          component: string | null
          created_at: string | null
          id: string
          ip_address: unknown
          message: string
          meta: Json | null
          severity: string
          source: string
          stack_trace: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          message: string
          meta?: Json | null
          severity: string
          source: string
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component?: string | null
          created_at?: string | null
          id?: string
          ip_address?: unknown
          message?: string
          meta?: Json | null
          severity?: string
          source?: string
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "system_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
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
      transfer_items: {
        Row: {
          created_at: string
          id: string
          line_total: number | null
          notes: string | null
          product_id: string
          quantity_received: number | null
          quantity_requested: number
          quantity_shipped: number | null
          transfer_id: string
          unit: string
          unit_cost: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          line_total?: number | null
          notes?: string | null
          product_id: string
          quantity_received?: number | null
          quantity_requested: number
          quantity_shipped?: number | null
          transfer_id: string
          unit?: string
          unit_cost?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number | null
          notes?: string | null
          product_id?: string
          quantity_received?: number | null
          quantity_requested?: number
          quantity_shipped?: number | null
          transfer_id?: string
          unit?: string
          unit_cost?: number | null
        }
        Relationships: [
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "transfer_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
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
            foreignKeyName: "user_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
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
          role: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
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
          role?: Database["public"]["Enums"]["user_role"]
          timezone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
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
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
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
          started_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      stock_balances: {
        Row: {
          cost_price: number | null
          current_stock: number | null
          location_code: string | null
          location_id: string | null
          location_name: string | null
          location_type: string | null
          product_id: string | null
          product_name: string | null
          sku: string | null
          stock_unit: string | null
          stock_value: number | null
        }
        Relationships: []
      }
      view_daily_kpis: {
        Row: {
          avg_basket_value: number | null
          date: string | null
          net_revenue: number | null
          total_discount: number | null
          total_orders: number | null
          total_revenue: number | null
          total_tax: number | null
        }
        Relationships: []
      }
      view_inventory_valuation: {
        Row: {
          total_items_in_stock: number | null
          total_skus: number | null
          total_valuation_cost: number | null
          total_valuation_retail: number | null
        }
        Relationships: []
      }
      view_payment_method_stats: {
        Row: {
          payment_method: string | null
          report_date: string | null
          total_revenue: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      view_product_performance: {
        Row: {
          category_name: string | null
          product_id: string | null
          product_name: string | null
          quantity_sold: number | null
          revenue_generated: number | null
          sku: string | null
          times_ordered: number | null
        }
        Relationships: []
      }
      view_product_with_sections: {
        Row: {
          available_for_sale: boolean | null
          category_id: string | null
          cost_price: number | null
          created_at: string | null
          current_stock: number | null
          description: string | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          min_stock_level: number | null
          name: string | null
          pos_visible: boolean | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          retail_price: number | null
          sections: Json | null
          shelf_life_days: number | null
          sku: string | null
          unit: string | null
          updated_at: string | null
          wholesale_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      view_production_by_section: {
        Row: {
          category_icon: string | null
          category_name: string | null
          created_at: string | null
          created_by: string | null
          id: string | null
          materials_consumed: boolean | null
          notes: string | null
          product_id: string | null
          product_name: string | null
          product_sku: string | null
          production_date: string | null
          production_id: string | null
          quantity_produced: number | null
          quantity_waste: number | null
          section_id: string | null
          section_name: string | null
          staff_id: string | null
          staff_name: string | null
          stock_updated: boolean | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
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
            referencedRelation: "stock_balances"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_performance"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "production_records_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "view_product_with_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_records_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "view_staff_performance"
            referencedColumns: ["staff_id"]
          },
        ]
      }
      view_sales_heatmap: {
        Row: {
          day_of_week: number | null
          hour_of_day: number | null
          order_count: number | null
          total_revenue: number | null
        }
        Relationships: []
      }
      view_session_discrepancies: {
        Row: {
          cash_difference: number | null
          closed_at: string | null
          closing_cash: number | null
          expected_cash: number | null
          opened_at: string | null
          session_number: string | null
          severity: string | null
          staff_name: string | null
        }
        Relationships: []
      }
      view_staff_performance: {
        Row: {
          avg_ticket_size: number | null
          orders_with_discount: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          staff_id: string | null
          staff_name: string | null
          total_orders: number | null
          total_sales: number | null
        }
        Relationships: []
      }
      view_stock_waste: {
        Row: {
          category_name: string | null
          loss_value_at_cost: number | null
          loss_value_at_retail: number | null
          product_name: string | null
          reason: string | null
          waste_date: string | null
          waste_events: number | null
          waste_quantity: number | null
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
      calculate_combo_total_price: {
        Args: { p_combo_id: string; p_selected_items: string[] }
        Returns: number
      }
      calculate_loyalty_points: {
        Args: { order_total: number }
        Returns: number
      }
      can_access_backoffice: { Args: never; Returns: boolean }
      can_access_kds: { Args: never; Returns: boolean }
      can_access_pos: { Args: never; Returns: boolean }
      capture_daily_stock_snapshot: { Args: never; Returns: string }
      check_promotion_validity: {
        Args: {
          p_customer_id?: string
          p_promotion_id: string
          p_purchase_amount?: number
        }
        Returns: {
          is_valid: boolean
          reason: string
        }[]
      }
      check_reporting_access: { Args: never; Returns: boolean }
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
        Args: { count_uuid: string; user_uuid: string }
        Returns: boolean
      }
      generate_session_number: { Args: never; Returns: string }
      get_applicable_promotions: {
        Args: {
          p_category_ids: string[]
          p_customer_id?: string
          p_product_ids: string[]
          p_subtotal?: number
        }
        Returns: {
          discount_amount: number
          discount_percentage: number
          priority: number
          promotion_code: string
          promotion_id: string
          promotion_name: string
          promotion_type: string
        }[]
      }
      get_combo_with_groups: { Args: { p_combo_id: string }; Returns: Json }
      get_current_user_profile: {
        Args: never
        Returns: {
          auth_user_id: string
          can_access_reports: boolean
          can_apply_discount: boolean
          can_cancel_order: boolean
          id: string
          role: string
        }[]
      }
      get_customer_price: {
        Args: { p_customer_id: string; p_product_id: string }
        Returns: number
      }
      get_customer_product_price: {
        Args: { p_customer_id?: string; p_product_id: string }
        Returns: number
      }
      get_reporting_dashboard_summary: {
        Args: { end_date: string; start_date: string }
        Returns: Json
      }
      get_sales_analytics: {
        Args: { end_date: string; start_date: string; trunc_interval?: string }
        Returns: {
          avg_order_value: number
          order_count: number
          period: string
          total_sales: number
        }[]
      }
      get_sales_comparison: {
        Args: {
          current_end: string
          current_start: string
          previous_end: string
          previous_start: string
        }
        Returns: {
          avg_basket: number
          net_revenue: number
          period_label: string
          total_revenue: number
          transaction_count: number
        }[]
      }
      get_setting: { Args: { p_key: string }; Returns: Json }
      get_settings_by_category: {
        Args: { p_category_code: string }
        Returns: {
          is_sensitive: boolean
          key: string
          name_en: string
          name_fr: string
          name_id: string
          validation_rules: Json
          value: Json
          value_type: string
        }[]
      }
      get_terminal_open_shifts: {
        Args: { p_terminal_id: string }
        Returns: {
          actual_cash: number | null
          actual_edc: number | null
          actual_qris: number | null
          cash_difference: number | null
          closed_at: string | null
          closed_by: string | null
          closing_cash: number | null
          closing_cash_details: Json | null
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
          tips_card: number | null
          tips_cash: number | null
          total_card_sales: number | null
          total_cash_sales: number | null
          total_discounts: number | null
          total_orders: number | null
          total_qris_sales: number | null
          total_refunds: number | null
          total_sales: number | null
          transaction_count: number | null
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "pos_sessions"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_top_products: {
        Args: { end_date?: string; limit_count?: number; start_date?: string }
        Returns: {
          product_name: string
          quantity_sold: number
          sku: string
          total_revenue: number
        }[]
      }
      get_user_open_shift: {
        Args: { p_user_id: string }
        Returns: {
          actual_cash: number | null
          actual_edc: number | null
          actual_qris: number | null
          cash_difference: number | null
          closed_at: string | null
          closed_by: string | null
          closing_cash: number | null
          closing_cash_details: Json | null
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
          tips_card: number | null
          tips_cash: number | null
          total_card_sales: number | null
          total_cash_sales: number | null
          total_discounts: number | null
          total_orders: number | null
          total_qris_sales: number | null
          total_refunds: number | null
          total_sales: number | null
          transaction_count: number | null
          updated_at: string | null
          user_id: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "pos_sessions"
          isOneToOne: false
          isSetofReturn: true
        }
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
      get_user_primary_role: {
        Args: { p_user_id: string }
        Returns: {
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
        SetofOptions: {
          from: "*"
          to: "roles"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_profile_id: { Args: never; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      hash_pin: { Args: { p_pin: string }; Returns: string }
      is_admin: { Args: { p_user_id: string }; Returns: boolean }
      is_admin_or_manager: { Args: never; Returns: boolean }
      is_super_admin: { Args: { p_user_id: string }; Returns: boolean }
      open_shift: {
        Args: {
          p_notes?: string
          p_opening_cash: number
          p_terminal_id?: string
          p_user_id: string
        }
        Returns: Json
      }
      process_production: {
        Args: { production_uuid: string }
        Returns: boolean
      }
      record_promotion_usage: {
        Args: {
          p_customer_id: string
          p_discount_amount: number
          p_order_id: string
          p_promotion_id: string
        }
        Returns: undefined
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
      reset_category_settings: {
        Args: { p_category_code: string }
        Returns: number
      }
      reset_setting: { Args: { p_key: string }; Returns: boolean }
      set_user_pin: {
        Args: { p_pin: string; p_updated_by?: string; p_user_id: string }
        Returns: boolean
      }
      transfer_stock: {
        Args: {
          p_from_section_id: string
          p_product_id: string
          p_quantity: number
          p_to_section_id: string
        }
        Returns: boolean
      }
      update_setting: {
        Args: { p_key: string; p_reason?: string; p_value: Json }
        Returns: boolean
      }
      update_settings_bulk: { Args: { p_settings: Json }; Returns: number }
      user_has_any_role: {
        Args: { required_roles: string[] }
        Returns: boolean
      }
      user_has_permission: {
        Args: { p_permission_code: string; p_user_id: string }
        Returns: boolean
      }
      user_has_role: { Args: { required_role: string }; Returns: boolean }
      verify_manager_pin: {
        Args: { pin_input: string }
        Returns: {
          is_valid: boolean
          user_id: string
          user_name: string
        }[]
      }
      verify_user_pin: {
        Args: { p_pin: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      audit_severity: "info" | "warning" | "critical"
      customer_type: "retail" | "wholesale"
      discount_type: "percentage" | "fixed" | "free"
      dispatch_station: "barista" | "kitchen" | "display" | "none"
      expense_type: "cogs" | "general"
      inventory_count_status: "draft" | "completed" | "cancelled"
      item_status: "new" | "preparing" | "ready" | "served"
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
        | "transfer"
      order_status:
        | "new"
        | "preparing"
        | "ready"
        | "served"
        | "completed"
        | "cancelled"
      order_type: "dine_in" | "takeaway" | "delivery" | "b2b"
      payment_method: "cash" | "card" | "qris" | "split" | "transfer"
      payment_status: "unpaid" | "partial" | "paid"
      payment_terms: "cod" | "net15" | "net30" | "net60"
      po_status: "draft" | "sent" | "partial" | "received" | "cancelled"
      product_type: "finished" | "semi_finished" | "raw_material"
      session_status: "open" | "closed"
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
      customer_type: ["retail", "wholesale"],
      discount_type: ["percentage", "fixed", "free"],
      dispatch_station: ["barista", "kitchen", "display", "none"],
      expense_type: ["cogs", "general"],
      inventory_count_status: ["draft", "completed", "cancelled"],
      item_status: ["new", "preparing", "ready", "served"],
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
        "transfer",
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
      payment_method: ["cash", "card", "qris", "split", "transfer"],
      payment_status: ["unpaid", "partial", "paid"],
      payment_terms: ["cod", "net15", "net30", "net60"],
      po_status: ["draft", "sent", "partial", "received", "cancelled"],
      product_type: ["finished", "semi_finished", "raw_material"],
      session_status: ["open", "closed"],
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
