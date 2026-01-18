#!/usr/bin/env python3
"""
ERPDesignAgent - Agent spécialisé dans la conception et l'architecture ERP/POS
Expert en design de systèmes de gestion pour boulangerie-pâtisserie.
"""

import os
import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional


class ERPDesignAgent:
    """
    Agent expert en conception et architecture de systèmes ERP/POS.
    Spécialisé dans le secteur de la boulangerie-pâtisserie.
    
    Domaines d'expertise:
    - Architecture de données (schémas BDD optimisés)
    - Interface POS (design d'interfaces de caisse)
    - Gestion des stocks (traçabilité, alertes, coûts)
    - Rapports et analytics (tableaux de bord, KPIs)
    - Workflow de production (planification, recettes, ordres de fabrication)
    """

    NOM = "ERPDesignAgent"
    ROLE = "Concevoir et architecturer le système ERP/POS The Breakery"
    
    # Configuration projet
    PROJECT_CONFIG = {
        "name": "The Breakery Lombok",
        "framework": "Antigravity",
        "database": "Supabase (PostgreSQL)",
        "target_volume": 200,  # transactions/jour
        "currency": "IDR",
        "tax_rate": 0.10,
        "languages": ["id", "en"],
        "annual_target": 6_000_000_000  # 6 milliards IDR
    }

    def __init__(self, project_path: str = "."):
        """Initialize the ERPDesignAgent with project root path."""
        self.project_path = Path(project_path)
        self.artifacts_path = self.project_path / "artifacts" / "erp_design"
        self.artifacts_path.mkdir(parents=True, exist_ok=True)
        
        # Modules ERP disponibles
        self.modules = {
            "pos": {"name": "Point de Vente", "status": "active", "priority": 1},
            "inventory": {"name": "Gestion des Stocks", "status": "active", "priority": 1},
            "production": {"name": "Production & Recettes", "status": "planned", "priority": 2},
            "purchasing": {"name": "Achats & Fournisseurs", "status": "planned", "priority": 2},
            "customers": {"name": "Clients & Fidélité", "status": "active", "priority": 1},
            "reporting": {"name": "Rapports & Analytics", "status": "active", "priority": 1},
            "hr": {"name": "RH & Planning", "status": "planned", "priority": 3},
            "accounting": {"name": "Comptabilité", "status": "planned", "priority": 3},
            "b2b": {"name": "Ventes B2B", "status": "planned", "priority": 2},
            "kds": {"name": "Kitchen Display System", "status": "planned", "priority": 2},
            "auth": {"name": "Authentification (Local PIN)", "status": "active", "priority": 1}
        }
        
        # Design patterns recommandés
        self.design_patterns = {
            "database": "Normalized Schema with Soft Deletes",
            "api": "RESTful with Supabase Edge Functions",
            "state": "Zustand + React Query",
            "ui": "Component-Based with Tailwind CSS",
            "auth": "Supabase Auth with RLS"
        }

    # =========================================================================
    # 1. ARCHITECTURE DE DONNÉES
    # =========================================================================
    def design_database_schema(self, module: str) -> Dict[str, Any]:
        """
        Conçoit le schéma de base de données pour un module spécifique.
        Génère des tables normalisées et optimisées.
        """
        print(f"🗄️ Conception schéma BDD pour module '{module}'...")
        
        schemas = {
            "pos": self._design_pos_schema(),
            "inventory": self._design_inventory_schema(),
            "production": self._design_production_schema(),
            "customers": self._design_customers_schema(),
            "purchasing": self._design_purchasing_schema(),
            "reporting": self._design_reporting_schema()
        }
        
        if module not in schemas:
            print(f"⚠️ Module '{module}' non reconnu. Modules disponibles: {list(schemas.keys())}")
            return {}
        
        schema = schemas[module]
        
        # Sauvegarder le schéma
        output_path = self.artifacts_path / "schemas" / f"{module}_schema.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(schema, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Schéma sauvegardé: {output_path}")
        return schema

    def _design_pos_schema(self) -> Dict[str, Any]:
        """Schéma pour le module Point de Vente"""
        return {
            "module": "pos",
            "description": "Gestion des ventes et transactions",
            "tables": {
                "sales": {
                    "description": "Transactions de vente",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "sale_number": "VARCHAR(50) UNIQUE NOT NULL",
                        "customer_id": "UUID REFERENCES customers(id)",
                        "user_id": "UUID REFERENCES auth.users(id) NOT NULL",
                        "subtotal": "DECIMAL(15,2) NOT NULL DEFAULT 0",
                        "tax_amount": "DECIMAL(15,2) NOT NULL DEFAULT 0",
                        "discount_amount": "DECIMAL(15,2) DEFAULT 0",
                        "total_amount": "DECIMAL(15,2) NOT NULL",
                        "payment_method": "VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'transfer', 'qris'))",
                        "payment_status": "VARCHAR(20) DEFAULT 'completed'",
                        "notes": "TEXT",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()",
                        "updated_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "indexes": [
                        "CREATE INDEX idx_sales_date ON sales(created_at DESC)",
                        "CREATE INDEX idx_sales_customer ON sales(customer_id)",
                        "CREATE INDEX idx_sales_number ON sales(sale_number)"
                    ],
                    "rls": True
                },
                "sale_items": {
                    "description": "Lignes de vente (produits vendus)",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "sale_id": "UUID REFERENCES sales(id) ON DELETE CASCADE NOT NULL",
                        "product_id": "UUID REFERENCES products(id) NOT NULL",
                        "product_name": "VARCHAR(255) NOT NULL",
                        "quantity": "DECIMAL(10,3) NOT NULL",
                        "unit_price": "DECIMAL(15,2) NOT NULL",
                        "discount_percent": "DECIMAL(5,2) DEFAULT 0",
                        "line_total": "DECIMAL(15,2) NOT NULL",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "indexes": [
                        "CREATE INDEX idx_sale_items_sale ON sale_items(sale_id)",
                        "CREATE INDEX idx_sale_items_product ON sale_items(product_id)"
                    ],
                    "rls": True
                },
                "payment_methods": {
                    "description": "Méthodes de paiement configurées",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "code": "VARCHAR(20) UNIQUE NOT NULL",
                        "name": "VARCHAR(100) NOT NULL",
                        "is_active": "BOOLEAN DEFAULT true",
                        "requires_reference": "BOOLEAN DEFAULT false",
                        "icon": "VARCHAR(50)",
                        "sort_order": "INTEGER DEFAULT 0"
                    },
                    "rls": True
                }
            },
            "functions": [
                {
                    "name": "generate_sale_number",
                    "description": "Génère un numéro de vente unique (SALE-YYYYMMDD-XXX)",
                    "returns": "VARCHAR(50)"
                },
                {
                    "name": "process_sale",
                    "description": "Traite une vente complète (atomique)",
                    "returns": "UUID"
                }
            ],
            "triggers": [
                {
                    "name": "trg_sale_update_stock",
                    "description": "Déduction automatique du stock après vente",
                    "event": "AFTER INSERT ON sale_items"
                }
            ]
        }

    def _design_inventory_schema(self) -> Dict[str, Any]:
        """Schéma pour le module Inventaire"""
        return {
            "module": "inventory",
            "description": "Gestion des stocks et produits",
            "tables": {
                "products": {
                    "description": "Catalogue des produits",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "sku": "VARCHAR(50) UNIQUE",
                        "barcode": "VARCHAR(50)",
                        "name": "VARCHAR(255) NOT NULL",
                        "name_en": "VARCHAR(255)",
                        "description": "TEXT",
                        "category_id": "UUID REFERENCES categories(id)",
                        "unit_id": "UUID REFERENCES units(id)",
                        "sell_price": "DECIMAL(15,2) NOT NULL",
                        "cost_price": "DECIMAL(15,2)",
                        "tax_included": "BOOLEAN DEFAULT true",
                        "is_active": "BOOLEAN DEFAULT true",
                        "is_sellable": "BOOLEAN DEFAULT true",
                        "is_stockable": "BOOLEAN DEFAULT true",
                        "image_url": "TEXT",
                        "sort_order": "INTEGER DEFAULT 0",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()",
                        "updated_at": "TIMESTAMPTZ DEFAULT NOW()",
                        "deleted_at": "TIMESTAMPTZ"
                    },
                    "indexes": [
                        "CREATE INDEX idx_products_category ON products(category_id)",
                        "CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true",
                        "CREATE INDEX idx_products_sku ON products(sku)"
                    ],
                    "rls": True
                },
                "categories": {
                    "description": "Catégories de produits",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "name": "VARCHAR(100) NOT NULL",
                        "name_en": "VARCHAR(100)",
                        "parent_id": "UUID REFERENCES categories(id)",
                        "color": "VARCHAR(20)",
                        "icon": "VARCHAR(50)",
                        "sort_order": "INTEGER DEFAULT 0",
                        "is_active": "BOOLEAN DEFAULT true"
                    },
                    "rls": True
                },
                "stock_levels": {
                    "description": "Niveaux de stock par produit/entrepôt",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "product_id": "UUID REFERENCES products(id) NOT NULL",
                        "warehouse_id": "UUID REFERENCES warehouses(id) NOT NULL",
                        "quantity": "DECIMAL(15,3) NOT NULL DEFAULT 0",
                        "reserved_quantity": "DECIMAL(15,3) DEFAULT 0",
                        "minimum_stock": "DECIMAL(15,3) DEFAULT 10",
                        "maximum_stock": "DECIMAL(15,3)",
                        "reorder_point": "DECIMAL(15,3) DEFAULT 5",
                        "updated_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "indexes": [
                        "CREATE UNIQUE INDEX idx_stock_product_warehouse ON stock_levels(product_id, warehouse_id)",
                        "CREATE INDEX idx_stock_low ON stock_levels(quantity) WHERE quantity < minimum_stock"
                    ],
                    "rls": True
                },
                "stock_movements": {
                    "description": "Historique des mouvements de stock",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "product_id": "UUID REFERENCES products(id) NOT NULL",
                        "warehouse_id": "UUID REFERENCES warehouses(id) NOT NULL",
                        "movement_type": "VARCHAR(30) NOT NULL",
                        "quantity": "DECIMAL(15,3) NOT NULL",
                        "quantity_before": "DECIMAL(15,3)",
                        "quantity_after": "DECIMAL(15,3)",
                        "reference_type": "VARCHAR(50)",
                        "reference_id": "UUID",
                        "notes": "TEXT",
                        "user_id": "UUID REFERENCES auth.users(id)",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "indexes": [
                        "CREATE INDEX idx_movements_product ON stock_movements(product_id)",
                        "CREATE INDEX idx_movements_date ON stock_movements(created_at DESC)",
                        "CREATE INDEX idx_movements_type ON stock_movements(movement_type)"
                    ],
                    "rls": True
                },
                "warehouses": {
                    "description": "Entrepôts/Emplacements de stockage",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "code": "VARCHAR(20) UNIQUE NOT NULL",
                        "name": "VARCHAR(100) NOT NULL",
                        "address": "TEXT",
                        "is_default": "BOOLEAN DEFAULT false",
                        "is_active": "BOOLEAN DEFAULT true"
                    },
                    "rls": True
                },
                "units": {
                    "description": "Unités de mesure",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "code": "VARCHAR(10) UNIQUE NOT NULL",
                        "name": "VARCHAR(50) NOT NULL",
                        "name_en": "VARCHAR(50)"
                    },
                    "rls": True
                }
            },
            "views": [
                {
                    "name": "v_stock_alerts",
                    "description": "Produits avec stock bas",
                    "query": "SELECT p.*, sl.quantity, sl.minimum_stock FROM products p JOIN stock_levels sl ON p.id = sl.product_id WHERE sl.quantity <= sl.reorder_point"
                },
                {
                    "name": "v_product_stock",
                    "description": "Vue consolidée produits + stock",
                    "query": "SELECT p.*, COALESCE(SUM(sl.quantity), 0) as total_stock FROM products p LEFT JOIN stock_levels sl ON p.id = sl.product_id GROUP BY p.id"
                }
            ]
        }

    def _design_production_schema(self) -> Dict[str, Any]:
        """Schéma pour le module Production"""
        return {
            "module": "production",
            "description": "Gestion de la production et des recettes",
            "tables": {
                "recipes": {
                    "description": "Recettes de fabrication",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "product_id": "UUID REFERENCES products(id) NOT NULL",
                        "name": "VARCHAR(255) NOT NULL",
                        "yield_quantity": "DECIMAL(10,3) NOT NULL",
                        "yield_unit_id": "UUID REFERENCES units(id)",
                        "preparation_time": "INTEGER",
                        "cooking_time": "INTEGER",
                        "instructions": "TEXT",
                        "is_active": "BOOLEAN DEFAULT true",
                        "version": "INTEGER DEFAULT 1",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()",
                        "updated_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "rls": True
                },
                "recipe_ingredients": {
                    "description": "Ingrédients des recettes",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "recipe_id": "UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL",
                        "ingredient_id": "UUID REFERENCES products(id) NOT NULL",
                        "quantity": "DECIMAL(15,4) NOT NULL",
                        "unit_id": "UUID REFERENCES units(id)",
                        "notes": "TEXT",
                        "sort_order": "INTEGER DEFAULT 0"
                    },
                    "rls": True
                },
                "production_orders": {
                    "description": "Ordres de fabrication",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "order_number": "VARCHAR(50) UNIQUE NOT NULL",
                        "recipe_id": "UUID REFERENCES recipes(id) NOT NULL",
                        "planned_quantity": "DECIMAL(10,3) NOT NULL",
                        "actual_quantity": "DECIMAL(10,3)",
                        "status": "VARCHAR(20) DEFAULT 'planned'",
                        "planned_date": "DATE NOT NULL",
                        "started_at": "TIMESTAMPTZ",
                        "completed_at": "TIMESTAMPTZ",
                        "assigned_to": "UUID REFERENCES auth.users(id)",
                        "notes": "TEXT",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "indexes": [
                        "CREATE INDEX idx_prod_orders_date ON production_orders(planned_date)",
                        "CREATE INDEX idx_prod_orders_status ON production_orders(status)"
                    ],
                    "rls": True
                }
            },
            "functions": [
                {
                    "name": "calculate_recipe_cost",
                    "description": "Calcule le coût de revient d'une recette",
                    "returns": "DECIMAL(15,2)"
                },
                {
                    "name": "consume_ingredients",
                    "description": "Consomme les ingrédients lors d'une production",
                    "returns": "BOOLEAN"
                }
            ]
        }

    def _design_customers_schema(self) -> Dict[str, Any]:
        """Schéma pour le module Clients"""
        return {
            "module": "customers",
            "description": "Gestion des clients et fidélité",
            "tables": {
                "customers": {
                    "description": "Base clients",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "code": "VARCHAR(20) UNIQUE",
                        "name": "VARCHAR(255) NOT NULL",
                        "email": "VARCHAR(255)",
                        "phone": "VARCHAR(50)",
                        "address": "TEXT",
                        "customer_type": "VARCHAR(20) DEFAULT 'retail'",
                        "loyalty_points": "INTEGER DEFAULT 0",
                        "total_purchases": "DECIMAL(15,2) DEFAULT 0",
                        "notes": "TEXT",
                        "is_active": "BOOLEAN DEFAULT true",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()",
                        "updated_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "indexes": [
                        "CREATE INDEX idx_customers_phone ON customers(phone)",
                        "CREATE INDEX idx_customers_type ON customers(customer_type)"
                    ],
                    "rls": True
                },
                "loyalty_transactions": {
                    "description": "Historique des points fidélité",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "customer_id": "UUID REFERENCES customers(id) NOT NULL",
                        "transaction_type": "VARCHAR(20) NOT NULL",
                        "points": "INTEGER NOT NULL",
                        "reference_type": "VARCHAR(50)",
                        "reference_id": "UUID",
                        "notes": "TEXT",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "rls": True
                }
            },
            "rules": {
                "points_calculation": "1 point = 1000 IDR dépensés",
                "redemption_threshold": 100,
                "redemption_discount": 0.10
            }
        }

    def _design_purchasing_schema(self) -> Dict[str, Any]:
        """Schéma pour le module Achats"""
        return {
            "module": "purchasing",
            "description": "Gestion des achats et fournisseurs",
            "tables": {
                "suppliers": {
                    "description": "Fournisseurs",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "code": "VARCHAR(20) UNIQUE",
                        "name": "VARCHAR(255) NOT NULL",
                        "contact_name": "VARCHAR(255)",
                        "email": "VARCHAR(255)",
                        "phone": "VARCHAR(50)",
                        "address": "TEXT",
                        "payment_terms": "VARCHAR(100)",
                        "notes": "TEXT",
                        "is_active": "BOOLEAN DEFAULT true",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "rls": True
                },
                "purchase_orders": {
                    "description": "Commandes d'achat",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "order_number": "VARCHAR(50) UNIQUE NOT NULL",
                        "supplier_id": "UUID REFERENCES suppliers(id) NOT NULL",
                        "status": "VARCHAR(20) DEFAULT 'draft'",
                        "order_date": "DATE NOT NULL",
                        "expected_date": "DATE",
                        "received_date": "DATE",
                        "subtotal": "DECIMAL(15,2) NOT NULL DEFAULT 0",
                        "tax_amount": "DECIMAL(15,2) DEFAULT 0",
                        "total_amount": "DECIMAL(15,2) NOT NULL DEFAULT 0",
                        "notes": "TEXT",
                        "created_by": "UUID REFERENCES auth.users(id)",
                        "created_at": "TIMESTAMPTZ DEFAULT NOW()"
                    },
                    "rls": True
                },
                "purchase_order_items": {
                    "description": "Lignes de commande d'achat",
                    "columns": {
                        "id": "UUID PRIMARY KEY DEFAULT gen_random_uuid()",
                        "purchase_order_id": "UUID REFERENCES purchase_orders(id) ON DELETE CASCADE",
                        "product_id": "UUID REFERENCES products(id) NOT NULL",
                        "quantity_ordered": "DECIMAL(15,3) NOT NULL",
                        "quantity_received": "DECIMAL(15,3) DEFAULT 0",
                        "unit_price": "DECIMAL(15,2) NOT NULL",
                        "line_total": "DECIMAL(15,2) NOT NULL"
                    },
                    "rls": True
                }
            }
        }

    def _design_reporting_schema(self) -> Dict[str, Any]:
        """Schéma pour le module Reporting"""
        return {
            "module": "reporting",
            "description": "Vues et fonctions pour le reporting",
            "views": [
                {
                    "name": "v_daily_sales",
                    "description": "Résumé des ventes par jour",
                    "columns": ["date", "total_sales", "total_revenue", "total_tax", "avg_ticket"]
                },
                {
                    "name": "v_product_performance",
                    "description": "Performance des produits (quantité vendue, CA)",
                    "columns": ["product_id", "product_name", "qty_sold", "revenue", "margin"]
                },
                {
                    "name": "v_hourly_sales",
                    "description": "Ventes par heure (pour analyse affluence)",
                    "columns": ["hour", "day_of_week", "avg_sales", "avg_revenue"]
                },
                {
                    "name": "v_inventory_valuation",
                    "description": "Valorisation du stock",
                    "columns": ["product_id", "quantity", "cost_price", "total_value"]
                }
            ],
            "kpis": {
                "daily": ["total_revenue", "transaction_count", "avg_ticket", "items_sold"],
                "weekly": ["revenue_trend", "top_products", "low_stock_items"],
                "monthly": ["revenue_vs_target", "profit_margin", "inventory_turnover"]
            }
        }

    # =========================================================================
    # 2. DESIGN INTERFACE POS
    # =========================================================================
    def design_pos_interface(self) -> Dict[str, Any]:
        """
        Conçoit la structure de l'interface POS.
        Retourne les spécifications des écrans et composants.
        """
        print("💻 Conception interface POS...")
        
        design = {
            "module": "pos_interface",
            "description": "Spécifications de l'interface Point de Vente",
            "layout": {
                "type": "split_screen",
                "left_panel": {
                    "width": "60%",
                    "components": ["CategoryTabs", "ProductGrid"]
                },
                "right_panel": {
                    "width": "40%",
                    "components": ["Cart", "PaymentSection", "CustomerInfo"]
                }
            },
            "screens": {
                "main_pos": {
                    "route": "/pos",
                    "description": "Écran principal de caisse",
                    "components": [
                        {
                            "name": "CategoryTabs",
                            "type": "tabs",
                            "behavior": "Filtre les produits par catégorie",
                            "features": ["scroll_horizontal", "active_highlight", "all_products_tab"]
                        },
                        {
                            "name": "ProductGrid",
                            "type": "grid",
                            "columns": {"mobile": 2, "tablet": 3, "desktop": 4},
                            "behavior": "Grille des produits cliquables",
                            "features": [
                                "image_thumbnail",
                                "price_display",
                                "stock_badge",
                                "quick_add_to_cart",
                                "search_filter"
                            ]
                        },
                        {
                            "name": "Cart",
                            "type": "list",
                            "behavior": "Panier avec modification quantités",
                            "features": [
                                "quantity_controls",
                                "item_removal",
                                "price_per_item",
                                "line_total",
                                "discount_input"
                            ]
                        },
                        {
                            "name": "CartSummary",
                            "type": "summary",
                            "behavior": "Récapitulatif avec TVA",
                            "fields": ["subtotal", "tax_10%", "discount", "total"]
                        },
                        {
                            "name": "PaymentButtons",
                            "type": "button_group",
                            "options": [
                                {"code": "cash", "label": "Tunai", "icon": "💵"},
                                {"code": "card", "label": "Kartu", "icon": "💳"},
                                {"code": "qris", "label": "QRIS", "icon": "📱"},
                                {"code": "transfer", "label": "Transfer", "icon": "🏦"}
                            ]
                        }
                    ]
                },
                "login_screen": {
                    "route": "/login",
                    "description": "Écran d'authentification par PIN local",
                    "components": [
                        {
                            "name": "AppLogo",
                            "type": "image",
                            "asset": "croissant_logo.png",
                            "style": "centered, large"
                        },
                        {
                            "name": "AppTitle",
                            "type": "heading",
                            "text": "The Breakery",
                            "style": "dark_blue, bold, large"
                        },
                        {
                            "name": "AppSubtitle",
                            "type": "text",
                            "text": "Point de Vente",
                            "style": "gray, medium"
                        },
                        {
                            "name": "ProfileSelector",
                            "type": "dropdown",
                            "label": "Sélectionnez votre profil",
                            "options": ["Admin (admin)", "Vendeur (vendeur)", "Boulanger (boulanger)"]
                        },
                        {
                            "name": "PINDisplay",
                            "type": "pin_indicator",
                            "length": 6,
                            "style": "dots, reflective"
                        },
                        {
                            "name": "NumericKeypad",
                            "type": "keypad",
                            "style": "cream_buttons, dark_icons",
                            "special_keys": ["Clear (C)", "Backspace (Icon)"]
                        },
                        {
                            "name": "LoginButton",
                            "type": "button",
                            "text": "Se connecter",
                            "style": "full_width, primary_blue"
                        }
                    ]
                },
                "payment_modal": {
                    "route": None,
                    "description": "Modal de finalisation paiement (Adaptive Layout: 2 columns for Cash, 1 centered column for others)",
                    "specs": {
                        "width": "800px",
                        "layout": "Adaptive Grid",
                        "equitable_spacing": True
                    },
                    "components": [
                        {
                            "name": "CashPayment",
                            "type": "form",
                            "fields": ["amount_received", "quick_amounts"],
                            "calculation": "change_due"
                        },
                        {
                            "name": "CardPayment",
                            "type": "form",
                            "fields": ["reference_number", "card_type"]
                        },
                        {
                            "name": "ReceiptPreview",
                            "type": "preview",
                            "actions": ["print", "email", "skip"]
                        }
                    ]
                },
                "hold_orders": {
                    "route": "/pos/hold",
                    "description": "Commandes en attente",
                    "features": ["list_held_orders", "resume_order", "cancel_order"]
                }
            },
            "keyboard_shortcuts": {
                "F1": "Aide",
                "F2": "Recherche produit",
                "F3": "Client fidélité",
                "F4": "Mettre en attente",
                "F5": "Rafraîchir",
                "F8": "Paiement Cash",
                "F9": "Paiement Carte",
                "Esc": "Annuler/Fermer"
            },
            "responsive_breakpoints": {
                "mobile": "< 640px",
                "tablet": "640px - 1024px",
                "desktop": "> 1024px"
            },
            "performance_targets": {
                "product_load": "< 500ms",
                "add_to_cart": "< 100ms",
                "checkout": "< 2s"
            }
        }
        
        # Sauvegarder
        output_path = self.artifacts_path / "interfaces" / "pos_interface_spec.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(design, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Spécifications POS sauvegardées: {output_path}")
        return design

    def design_auth_interface(self) -> Dict[str, Any]:
        """
        Conçoit l'interface d'authentification (Login / PIN).
        Inspiré par le design épuré avec clavier crème.
        """
        print("🔐 Conception interface Authentification PIN...")
        
        design = {
            "module": "auth_interface",
            "description": "Spécifications de l'écran de connexion par PIN",
            "visual_identity": {
                "font_family": "Inter, sans-serif",
                "primary_color": "#3B82F6",  # Blue
                "text_primary": "#0F172A",    # Slate-900 (High-contrast)
                "text_secondary": "#475569",  # Slate-600
                "keypad_bg": "#F1F5F9",       # Light slate container
                "button_bg": "#FEF3C7",       # Warm cream/yellow
                "button_border": "#F59E0B",   # Amber-500 (Strong border)
                "keypad_text": "#0F172A"      # Slate-900 for numbers
            },
            "elements": [
                {
                    "id": "header",
                    "type": "vertical_stack",
                    "items": ["Logo (Croissant)", "Title (The Breakery)", "Subtitle (Point de Vente)"],
                    "spacing": "small"
                },
                {
                    "id": "profile_selection",
                    "type": "select_field",
                    "label": "Sélectionnez votre profil",
                    "style": "minimalist"
                },
                {
                    "id": "pin_entry",
                    "type": "pin_grid",
                    "slots": 6,
                    "behavior": "Masked dots"
                },
                {
                    "id": "numpad",
                    "type": "grid",
                    "layout": "3x4",
                    "keys": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "DeleteIcon"],
                    "style": {
                        "button_bg": "#FEF3C7",
                        "button_radius": "12px",
                        "button_border": "2px solid #F59E0B",
                        "button_shadow": "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
                        "font_weight": "800",
                        "text_color": "#0F172A",
                        "hover_bg": "#FDE68A"
                    }
                },
                {
                    "id": "submit_action",
                    "type": "action_button",
                    "label": "Se connecter",
                    "color": "blue",
                    "width": "full"
                }
            ],
            "messages": {
                "demo_hint": "💡 Demo: PIN pour tous les utilisateurs = leur code affiché"
            }
        }

        # Sauvegarder
        output_path = self.artifacts_path / "interfaces" / "auth_interface_spec.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(design, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Spécifications Auth sauvegardées: {output_path}")
        return design

    # =========================================================================
    # 3. WORKFLOW DE PRODUCTION
    # =========================================================================
    def design_production_workflow(self) -> Dict[str, Any]:
        """
        Conçoit le workflow de production pour la boulangerie.
        """
        print("🏭 Conception workflow production...")
        
        workflow = {
            "module": "production_workflow",
            "description": "Workflow de production boulangerie",
            "states": {
                "planned": {
                    "label": "Planifié",
                    "color": "blue",
                    "next_states": ["in_progress", "cancelled"]
                },
                "in_progress": {
                    "label": "En cours",
                    "color": "yellow",
                    "next_states": ["completed", "on_hold"]
                },
                "on_hold": {
                    "label": "En pause",
                    "color": "orange",
                    "next_states": ["in_progress", "cancelled"]
                },
                "completed": {
                    "label": "Terminé",
                    "color": "green",
                    "next_states": [],
                    "final": True
                },
                "cancelled": {
                    "label": "Annulé",
                    "color": "red",
                    "next_states": [],
                    "final": True
                }
            },
            "daily_process": [
                {
                    "step": 1,
                    "time": "04:00",
                    "action": "Vérifier planification du jour",
                    "agent": "Responsable production"
                },
                {
                    "step": 2,
                    "time": "04:15",
                    "action": "Sortir ingrédients (picking)",
                    "agent": "Boulanger"
                },
                {
                    "step": 3,
                    "time": "04:30",
                    "action": "Démarrer production (pétrissage)",
                    "agent": "Boulanger"
                },
                {
                    "step": 4,
                    "time": "Variable",
                    "action": "Cuisson",
                    "agent": "Boulanger"
                },
                {
                    "step": 5,
                    "time": "06:00",
                    "action": "Enregistrer production terminée",
                    "agent": "Responsable production"
                },
                {
                    "step": 6,
                    "time": "06:30",
                    "action": "Mise en rayon / stock boutique",
                    "agent": "Vendeur"
                }
            ],
            "automations": [
                {
                    "trigger": "Production terminée",
                    "action": "Ajouter produits finis au stock",
                    "type": "automatic"
                },
                {
                    "trigger": "Stock bas détecté",
                    "action": "Suggérer ordre de production",
                    "type": "notification"
                },
                {
                    "trigger": "Début production",
                    "action": "Réserver ingrédients",
                    "type": "automatic"
                }
            ],
            "kds_integration": {
                "display_info": [
                    "Nom du produit",
                    "Quantité à produire",
                    "Recette (étapes)",
                    "Temps estimé",
                    "Priorité"
                ],
                "actions": ["Démarrer", "Pause", "Terminer", "Problème"]
            }
        }
        
        # Sauvegarder
        output_path = self.artifacts_path / "workflows" / "production_workflow.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(workflow, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Workflow production sauvegardé: {output_path}")
        return workflow

    def design_production_interface(self) -> Dict[str, Any]:
        """
        Conçoit l'interface de saisie de production.
        """
        print("🏭 Conception interface production...")

        design = {
            "module": "production_interface",
            "description": "Interface de saisie de production journalière",
            "components": [
                {
                    "name": "ProductSearch",
                    "type": "autocomplete",
                    "specs": {
                        "width": "large (w-96+)",
                        "behavior": "Instant search with keyboard navigation",
                        "display": "Rich result (Icon + Name + Category + Stock)",
                        "shortcuts": ["ArrowDown", "ArrowUp", "Enter"]
                    }
                },
                {
                    "name": "ProductionTable",
                    "type": "data_grid",
                    "columns": ["Product", "Produced Qty", "Waste Qty", "Waste Reason", "Actions"],
                    "features": ["Inline editing", "Tab navigation"]
                }
            ]
        }
        
        # Sauvegarder
        output_path = self.artifacts_path / "interfaces" / "production_interface_spec.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(design, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Spécifications interface production sauvegardées: {output_path}")
        return design

    # =========================================================================
    # 4. DESIGN DASHBOARD & KPIs
    # =========================================================================
    def design_dashboard(self) -> Dict[str, Any]:
        """
        Conçoit le tableau de bord et les KPIs.
        """
        print("📊 Conception Dashboard & KPIs...")
        
        dashboard = {
            "module": "dashboard",
            "description": "Tableau de bord principal",
            "widgets": {
                "daily_summary": {
                    "type": "stats_cards",
                    "position": "top",
                    "cards": [
                        {"metric": "Ventes aujourd'hui", "field": "total_revenue", "format": "currency"},
                        {"metric": "Transactions", "field": "transaction_count", "format": "number"},
                        {"metric": "Ticket moyen", "field": "avg_ticket", "format": "currency"},
                        {"metric": "Produits vendus", "field": "items_sold", "format": "number"}
                    ]
                },
                "revenue_chart": {
                    "type": "line_chart",
                    "title": "Évolution CA (7 jours)",
                    "data_source": "v_daily_sales",
                    "x_axis": "date",
                    "y_axis": "total_revenue"
                },
                "sales_by_category": {
                    "type": "pie_chart",
                    "title": "Répartition par catégorie",
                    "data_source": "sales_by_category"
                },
                "top_products": {
                    "type": "table",
                    "title": "Top 5 Produits",
                    "columns": ["rank", "product_name", "qty_sold", "revenue"],
                    "limit": 5
                },
                "stock_alerts": {
                    "type": "alert_list",
                    "title": "Alertes Stock",
                    "data_source": "v_stock_alerts",
                    "severity_colors": {
                        "critical": "red",
                        "warning": "orange",
                        "info": "blue"
                    }
                },
                "monthly_target": {
                    "type": "progress_bar",
                    "title": "Objectif mensuel",
                    "target": 500_000_000,
                    "current": "current_month_revenue"
                },
                "hourly_traffic": {
                    "type": "bar_chart",
                    "title": "Affluence par heure",
                    "data_source": "v_hourly_sales"
                }
            },
            "refresh_interval": 30,
            "filters": ["date_range", "category", "payment_method"],
            "export_options": ["pdf", "excel", "csv"]
        }
        
        # Sauvegarder
        output_path = self.artifacts_path / "interfaces" / "dashboard_spec.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(dashboard, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Spécifications Dashboard sauvegardées: {output_path}")
        return dashboard

    # =========================================================================
    # 5. GÉNÉRATION MIGRATION SQL
    # =========================================================================
    def generate_migration_sql(self, module: str) -> str:
        """
        Génère le fichier SQL de migration pour un module.
        """
        print(f"📝 Génération migration SQL pour '{module}'...")
        
        schema = self.design_database_schema(module)
        if not schema:
            return ""
        
        sql_lines = [
            f"-- Migration: {module} module",
            f"-- Generated by ERPDesignAgent on {datetime.now().isoformat()}",
            f"-- Description: {schema.get('description', '')}",
            "",
            "-- ============================================",
            f"-- MODULE: {module.upper()}",
            "-- ============================================",
            ""
        ]
        
        # Generate CREATE TABLE statements
        tables = schema.get("tables", {})
        for table_name, table_def in tables.items():
            sql_lines.append(f"-- Table: {table_name}")
            sql_lines.append(f"-- {table_def.get('description', '')}")
            sql_lines.append(f"CREATE TABLE IF NOT EXISTS {table_name} (")
            
            columns = table_def.get("columns", {})
            col_statements = []
            for col_name, col_def in columns.items():
                col_statements.append(f"  {col_name} {col_def}")
            
            sql_lines.append(",\n".join(col_statements))
            sql_lines.append(");")
            sql_lines.append("")
            
            # Indexes
            for idx in table_def.get("indexes", []):
                sql_lines.append(idx + ";")
            sql_lines.append("")
            
            # RLS
            if table_def.get("rls"):
                sql_lines.append(f"ALTER TABLE {table_name} ENABLE ROW LEVEL SECURITY;")
                sql_lines.append(f"""
CREATE POLICY "Enable all for authenticated users" ON {table_name}
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);
""")
            sql_lines.append("")
        
        sql_content = "\n".join(sql_lines)
        
        # Sauvegarder
        output_path = self.artifacts_path / "migrations" / f"{module}_migration.sql"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(sql_content)
        
        print(f"✅ Migration SQL sauvegardée: {output_path}")
        return str(output_path)

    # =========================================================================
    # 6. RAPPORT COMPLET DE DESIGN
    # =========================================================================
    def generate_design_report(self) -> str:
        """
        Génère un rapport complet de design ERP/POS.
        """
        print("📋 Génération rapport de design complet...")
        
        report = f"""# 🏗️ Rapport de Design ERP/POS - The Breakery Lombok

**Généré par:** ERPDesignAgent  
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}

---

## 📊 Vue d'ensemble du projet

| Paramètre | Valeur |
|-----------|--------|
| Nom du projet | {self.PROJECT_CONFIG['name']} |
| Framework | {self.PROJECT_CONFIG['framework']} |
| Base de données | {self.PROJECT_CONFIG['database']} |
| Volume cible | {self.PROJECT_CONFIG['target_volume']} transactions/jour |
| Devise | {self.PROJECT_CONFIG['currency']} |
| Taux TVA | {self.PROJECT_CONFIG['tax_rate']*100}% |
| Objectif annuel | {self.PROJECT_CONFIG['annual_target']:,} IDR |

---

## 📦 Modules ERP

| Module | Nom | Statut | Priorité |
|--------|-----|--------|----------|
"""
        for code, info in self.modules.items():
            status_icon = "✅" if info["status"] == "active" else "🔜" if info["status"] == "planned" else "⏸️"
            report += f"| {code} | {info['name']} | {status_icon} {info['status']} | P{info['priority']} |\n"
        
        report += f"""
---

## 🎨 Patterns de design

| Aspect | Pattern utilisé |
|--------|-----------------|
"""
        for aspect, pattern in self.design_patterns.items():
            report += f"| {aspect.replace('_', ' ').title()} | {pattern} |\n"
        
        report += """
---

## 🗄️ Architecture de données

### Tables principales par module

"""
        # Generate schemas for main modules
        for module in ["pos", "inventory", "customers"]:
            schema = self.design_database_schema(module)
            if schema:
                report += f"#### {module.upper()}\n\n"
                for table_name in schema.get("tables", {}).keys():
                    report += f"- `{table_name}`\n"
                report += "\n"
        
        report += """
---

## 💻 Interface POS

### Layout
- Type: Split Screen (60% produits / 40% panier)
- Responsive: Mobile, Tablet, Desktop

### Raccourcis clavier
| Touche | Action |
|--------|--------|
| F1 | Aide |
| F2 | Recherche produit |
| F3 | Client fidélité |
| F8 | Paiement Cash |
| F9 | Paiement Carte |
| Esc | Annuler |

---

## 🔐 Authentification (PIN Local)

### Composants de l'écran
- **Logo**: Croissant
- **Titre**: The Breakery
- **Profils**: Dropdown (Admin, Vendeur, Boulanger)
- **PIN**: Indicateur 6 points
- **Clavier**: Pavé numérique Haute-Visibilité (Boutons: #FEF3C7, Bordure: #F59E0B, Texte: #0F172A)
- **Design**: Coins arrondis (12px), ombre prononcée et bordure de 2px pour une visibilité garantie sur tout écran.
- **Bouton**: Se connecter (Bleu, Pleine largeur)

---

## 🏭 Workflow Production

### États des ordres de fabrication

```
[Planifié] → [En cours] → [Terminé]
     ↓           ↓
[Annulé]    [En pause]
```

### Automatisations
1. ✅ Stock automatiquement mis à jour après production
2. 🔔 Notification si stock bas détecté
3. 🔒 Réservation ingrédients au démarrage

---

## 📈 KPIs et Reporting

### KPIs quotidiens
- Chiffre d'affaires
- Nombre de transactions
- Ticket moyen
- Produits vendus

### KPIs hebdomadaires
- Tendance CA
- Top produits
- Alertes stock

### KPIs mensuels
- CA vs Objectif
- Marge bénéficiaire
- Rotation des stocks

---

## ✅ Prochaines étapes

1. **Phase 1 (Semaine 1-2)**
   - Finaliser schémas BDD
   - Implémenter migrations
   - Développer API de base

2. **Phase 2 (Semaine 3-4)**
   - Interface POS
   - Gestion inventaire
   - Tests intégration

3. **Phase 3 (Semaine 5-6)**
   - Dashboard analytics
   - Module production
   - Optimisations

---

*Rapport généré automatiquement par ERPDesignAgent v1.0*
"""
        
        # Sauvegarder
        output_path = self.artifacts_path / "reports" / "erp_design_report.md"
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(report)
        
        print(f"✅ Rapport de design sauvegardé: {output_path}")
        return str(output_path)

    # =========================================================================
    # 7. SUGGEST CONSISTENT APPROACH (pour intégration avec ContextAgent)
    # =========================================================================
    def suggest_implementation(self, task_description: str) -> Dict[str, Any]:
        """
        Suggère l'approche d'implémentation pour une tâche donnée.
        """
        print(f"💡 Analyse de la tâche: {task_description[:50]}...")
        
        suggestion = {
            "task": task_description,
            "analysis": {},
            "recommendations": [],
            "related_modules": [],
            "estimated_complexity": "medium"
        }
        
        task_lower = task_description.lower()
        
        # Détection des modules concernés
        if any(w in task_lower for w in ["vente", "pos", "caisse", "paiement"]):
            suggestion["related_modules"].append("pos")
            suggestion["recommendations"].append("Utiliser le schéma POS existant")
            
        if any(w in task_lower for w in ["stock", "inventaire", "produit"]):
            suggestion["related_modules"].append("inventory")
            suggestion["recommendations"].append("Implémenter les vues stock_levels et stock_movements")
            
        if any(w in task_lower for w in ["production", "recette", "fabrication"]):
            suggestion["related_modules"].append("production")
            suggestion["recommendations"].append("Suivre le workflow de production défini")
            
        if any(w in task_lower for w in ["client", "fidélité", "loyalty"]):
            suggestion["related_modules"].append("customers")
            suggestion["recommendations"].append("Intégrer le système de points (1pt = 1000 IDR)")
            
        if any(w in task_lower for w in ["rapport", "dashboard", "statistique", "kpi"]):
            suggestion["related_modules"].append("reporting")
            suggestion["recommendations"].append("Utiliser les vues matérialisées pour les performances")
        
        # Estimation complexité
        if len(suggestion["related_modules"]) > 2:
            suggestion["estimated_complexity"] = "high"
        elif len(suggestion["related_modules"]) == 0:
            suggestion["estimated_complexity"] = "unknown"
        
        return suggestion


# =============================================================================
# MAIN EXECUTION
# =============================================================================
def main():
    """Run the ERP Design Agent and generate artifacts."""
    print("🎨 ERPDesignAgent - Concepteur ERP/POS")
    print("=" * 50)
    
    # Create agent
    agent = ERPDesignAgent(".")
    
    while True:
        print("\n📋 MENU")
        print("1. 🗄️ Design schéma BDD (module)")
        print("2. 💻 Design interface POS")
        print("3. 🏭 Design workflow production")
        print("4. 📊 Design dashboard")
        print("5. 📝 Générer migration SQL")
        print("6. 📋 Générer rapport complet")
        print("7. 🔐 Design interface Authentification")
        print("8. 💡 Suggérer implémentation")
        print("9. 🚪 Quitter")
        
        choice = input("\nChoix (1-9): ").strip()
        
        if choice == "1":
            module = input("Module (pos/inventory/production/customers/purchasing/reporting): ").strip()
            agent.design_database_schema(module)
        elif choice == "2":
            agent.design_pos_interface()
        elif choice == "3":
            agent.design_production_workflow()
        elif choice == "4":
            agent.design_dashboard()
        elif choice == "5":
            module = input("Module: ").strip()
            agent.generate_migration_sql(module)
        elif choice == "6":
            agent.generate_design_report()
        elif choice == "7":
            agent.design_auth_interface()
        elif choice == "8":
            task = input("Description de la tâche: ").strip()
            result = agent.suggest_implementation(task)
            print(json.dumps(result, indent=2, ensure_ascii=False))
        elif choice == "9":
            print("👋 Au revoir!")
            break


if __name__ == "__main__":
    main()
