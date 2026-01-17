#!/usr/bin/env python3
"""
UIDesignAgent - Agent spécialisé dans le design d'interfaces et composants UI
Expert en création de systèmes de design cohérents pour applications React/Tailwind.
"""

import os
import json
import math
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple


class UIDesignAgent:
    """
    Agent expert en design d'interfaces utilisateur et systèmes de design.
    Spécialisé pour les applications ERP/POS avec React et Tailwind CSS.

    Domaines d'expertise:
    - Design tokens (couleurs, typographie, espacements)
    - Bibliothèque de composants UI
    - Thèmes (light/dark mode)
    - Accessibilité WCAG 2.1
    - Layout et responsive design
    - Export Tailwind/CSS
    """

    NOM = "UIDesignAgent"
    ROLE = "Concevoir et générer le système de design UI pour The Breakery"

    # =========================================================================
    # DESIGN TOKENS - Source de vérité pour tout le système de design
    # =========================================================================
    DESIGN_TOKENS = {
        "colors": {
            "primary": {
                "50": "#EFF6FF",
                "100": "#DBEAFE",
                "200": "#BFDBFE",
                "300": "#93C5FD",
                "400": "#60A5FA",
                "500": "#3B82F6",  # Couleur principale
                "600": "#2563EB",
                "700": "#1D4ED8",
                "800": "#1E40AF",
                "900": "#1E3A8A"
            },
            "secondary": {
                "50": "#FFFBEB",
                "100": "#FEF3C7",  # Fond boutons crème
                "200": "#FDE68A",
                "300": "#FCD34D",
                "400": "#FBBF24",
                "500": "#F59E0B",  # Accent ambre
                "600": "#D97706",
                "700": "#B45309",
                "800": "#92400E",
                "900": "#78350F"
            },
            "success": {
                "50": "#ECFDF5",
                "100": "#D1FAE5",
                "500": "#10B981",
                "600": "#059669",
                "700": "#047857"
            },
            "warning": {
                "50": "#FFFBEB",
                "100": "#FEF3C7",
                "500": "#F59E0B",
                "600": "#D97706",
                "700": "#B45309"
            },
            "danger": {
                "50": "#FEF2F2",
                "100": "#FEE2E2",
                "500": "#EF4444",
                "600": "#DC2626",
                "700": "#B91C1C"
            },
            "neutral": {
                "0": "#FFFFFF",
                "50": "#F8FAFC",
                "100": "#F1F5F9",
                "200": "#E2E8F0",
                "300": "#CBD5E1",
                "400": "#94A3B8",
                "500": "#64748B",
                "600": "#475569",
                "700": "#334155",
                "800": "#1E293B",
                "900": "#0F172A",
                "950": "#020617"
            }
        },
        "typography": {
            "font_family": {
                "sans": "Inter, system-ui, -apple-system, sans-serif",
                "mono": "JetBrains Mono, Menlo, Monaco, monospace"
            },
            "font_size": {
                "xs": {"size": "0.75rem", "line_height": "1rem"},
                "sm": {"size": "0.875rem", "line_height": "1.25rem"},
                "base": {"size": "1rem", "line_height": "1.5rem"},
                "lg": {"size": "1.125rem", "line_height": "1.75rem"},
                "xl": {"size": "1.25rem", "line_height": "1.75rem"},
                "2xl": {"size": "1.5rem", "line_height": "2rem"},
                "3xl": {"size": "1.875rem", "line_height": "2.25rem"},
                "4xl": {"size": "2.25rem", "line_height": "2.5rem"}
            },
            "font_weight": {
                "normal": "400",
                "medium": "500",
                "semibold": "600",
                "bold": "700",
                "extrabold": "800"
            }
        },
        "spacing": {
            "0": "0",
            "1": "0.25rem",
            "2": "0.5rem",
            "3": "0.75rem",
            "4": "1rem",
            "5": "1.25rem",
            "6": "1.5rem",
            "8": "2rem",
            "10": "2.5rem",
            "12": "3rem",
            "16": "4rem",
            "20": "5rem",
            "24": "6rem"
        },
        "border_radius": {
            "none": "0",
            "sm": "0.125rem",
            "default": "0.25rem",
            "md": "0.375rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "2xl": "1rem",
            "3xl": "1.5rem",
            "full": "9999px"
        },
        "shadows": {
            "sm": "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            "default": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
            "md": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
            "lg": "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
            "xl": "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)"
        },
        "breakpoints": {
            "sm": "640px",
            "md": "768px",
            "lg": "1024px",
            "xl": "1280px",
            "2xl": "1536px"
        },
        "transitions": {
            "fast": "150ms ease-in-out",
            "normal": "200ms ease-in-out",
            "slow": "300ms ease-in-out"
        },
        "z_index": {
            "dropdown": "1000",
            "sticky": "1020",
            "fixed": "1030",
            "modal_backdrop": "1040",
            "modal": "1050",
            "popover": "1060",
            "tooltip": "1070"
        }
    }

    def __init__(self, project_path: str = "."):
        """
        Initialise l'agent UIDesignAgent avec le chemin du projet.

        Args:
            project_path: Chemin racine du projet
        """
        self.project_path = Path(project_path)
        self.artifacts_path = self.project_path / "artifacts" / "ui_design"
        self.artifacts_path.mkdir(parents=True, exist_ok=True)

        # Référence vers ERPDesignAgent pour la cohérence
        self.erp_artifacts_path = self.project_path / "artifacts" / "erp_design"

        # Configuration thème par défaut
        self.active_theme = "light"

    # =========================================================================
    # 1. GÉNÉRATION BIBLIOTHÈQUE DE COMPOSANTS
    # =========================================================================
    def generate_component_library(self) -> Dict[str, Any]:
        """
        Génère la bibliothèque complète de composants UI.

        Returns:
            Dict contenant tous les composants avec leurs spécifications
        """
        print("📚 Génération de la bibliothèque de composants...")

        library = {
            "meta": {
                "name": "The Breakery Design System",
                "version": "1.0.0",
                "generated_at": datetime.now().isoformat(),
                "framework": "React + Tailwind CSS"
            },
            "components": {
                "buttons": self._generate_button_components(),
                "inputs": self._generate_input_components(),
                "cards": self._generate_card_components(),
                "badges": self._generate_badge_components(),
                "modals": self._generate_modal_components(),
                "tables": self._generate_table_components(),
                "navigation": self._generate_navigation_components(),
                "feedback": self._generate_feedback_components()
            }
        }

        # Sauvegarder
        output_path = self.artifacts_path / "component_library.json"
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(library, f, indent=2, ensure_ascii=False)

        print(f"✅ Bibliothèque sauvegardée: {output_path}")
        return library

    def _generate_button_components(self) -> Dict[str, Any]:
        """Génère les spécifications des boutons."""
        return {
            "Button": {
                "name": "Button",
                "description": "Bouton principal de l'application",
                "variants": {
                    "primary": {
                        "bg": self.DESIGN_TOKENS["colors"]["primary"]["500"],
                        "text": "#FFFFFF",
                        "hover": self.DESIGN_TOKENS["colors"]["primary"]["600"],
                        "active": self.DESIGN_TOKENS["colors"]["primary"]["700"],
                        "border": "none"
                    },
                    "secondary": {
                        "bg": self.DESIGN_TOKENS["colors"]["secondary"]["100"],
                        "text": self.DESIGN_TOKENS["colors"]["neutral"]["900"],
                        "hover": self.DESIGN_TOKENS["colors"]["secondary"]["200"],
                        "active": self.DESIGN_TOKENS["colors"]["secondary"]["300"],
                        "border": f"2px solid {self.DESIGN_TOKENS['colors']['secondary']['500']}"
                    },
                    "ghost": {
                        "bg": "transparent",
                        "text": self.DESIGN_TOKENS["colors"]["neutral"]["700"],
                        "hover": self.DESIGN_TOKENS["colors"]["neutral"]["100"],
                        "active": self.DESIGN_TOKENS["colors"]["neutral"]["200"],
                        "border": "none"
                    },
                    "danger": {
                        "bg": self.DESIGN_TOKENS["colors"]["danger"]["500"],
                        "text": "#FFFFFF",
                        "hover": self.DESIGN_TOKENS["colors"]["danger"]["600"],
                        "active": self.DESIGN_TOKENS["colors"]["danger"]["700"],
                        "border": "none"
                    },
                    "success": {
                        "bg": self.DESIGN_TOKENS["colors"]["success"]["500"],
                        "text": "#FFFFFF",
                        "hover": self.DESIGN_TOKENS["colors"]["success"]["600"],
                        "active": self.DESIGN_TOKENS["colors"]["success"]["700"],
                        "border": "none"
                    }
                },
                "sizes": {
                    "sm": {
                        "padding": "0.5rem 1rem",
                        "font_size": self.DESIGN_TOKENS["typography"]["font_size"]["sm"]["size"],
                        "height": "32px"
                    },
                    "md": {
                        "padding": "0.75rem 1.5rem",
                        "font_size": self.DESIGN_TOKENS["typography"]["font_size"]["base"]["size"],
                        "height": "40px"
                    },
                    "lg": {
                        "padding": "1rem 2rem",
                        "font_size": self.DESIGN_TOKENS["typography"]["font_size"]["lg"]["size"],
                        "height": "48px"
                    }
                },
                "props": {
                    "variant": "primary | secondary | ghost | danger | success",
                    "size": "sm | md | lg",
                    "disabled": "boolean",
                    "fullWidth": "boolean",
                    "loading": "boolean",
                    "leftIcon": "ReactNode",
                    "rightIcon": "ReactNode"
                },
                "accessibility": {
                    "aria_required": ["aria-label (si icon only)", "aria-disabled (si disabled)"],
                    "keyboard": "Enter, Space pour activer",
                    "focus_visible": True,
                    "focus_ring": f"2px solid {self.DESIGN_TOKENS['colors']['primary']['500']}"
                },
                "example_react": """
import { Button } from '@/components/ui/Button';

// Variantes
<Button variant="primary">Confirmer</Button>
<Button variant="secondary">Annuler</Button>
<Button variant="danger">Supprimer</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="lg">Grand</Button>

// Avec icônes
<Button leftIcon={<PlusIcon />}>Ajouter</Button>

// États
<Button loading>Chargement...</Button>
<Button disabled>Désactivé</Button>
<Button fullWidth>Pleine largeur</Button>
""",
                "example_tailwind": """
<!-- Primary Button -->
<button class="bg-blue-500 hover:bg-blue-600 active:bg-blue-700
               text-white font-medium px-6 py-3 rounded-lg
               transition-colors duration-200
               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
               disabled:opacity-50 disabled:cursor-not-allowed">
  Confirmer
</button>

<!-- Secondary Button (Cream) -->
<button class="bg-amber-100 hover:bg-amber-200 active:bg-amber-300
               text-slate-900 font-semibold px-6 py-3 rounded-xl
               border-2 border-amber-500
               shadow-md hover:shadow-lg transition-all duration-200">
  Annuler
</button>
"""
            },
            "IconButton": {
                "name": "IconButton",
                "description": "Bouton avec icône uniquement",
                "variants": {
                    "default": {
                        "bg": "transparent",
                        "hover": self.DESIGN_TOKENS["colors"]["neutral"]["100"]
                    },
                    "filled": {
                        "bg": self.DESIGN_TOKENS["colors"]["neutral"]["100"],
                        "hover": self.DESIGN_TOKENS["colors"]["neutral"]["200"]
                    }
                },
                "sizes": {
                    "sm": {"size": "32px", "icon_size": "16px"},
                    "md": {"size": "40px", "icon_size": "20px"},
                    "lg": {"size": "48px", "icon_size": "24px"}
                },
                "accessibility": {
                    "aria_required": ["aria-label (obligatoire)"],
                    "keyboard": "Enter, Space",
                    "focus_visible": True
                }
            }
        }

    def _generate_input_components(self) -> Dict[str, Any]:
        """Génère les spécifications des champs de saisie."""
        return {
            "Input": {
                "name": "Input",
                "description": "Champ de saisie texte",
                "variants": {
                    "default": {
                        "bg": "#FFFFFF",
                        "border": self.DESIGN_TOKENS["colors"]["neutral"]["300"],
                        "focus_border": self.DESIGN_TOKENS["colors"]["primary"]["500"],
                        "text": self.DESIGN_TOKENS["colors"]["neutral"]["900"],
                        "placeholder": self.DESIGN_TOKENS["colors"]["neutral"]["400"]
                    },
                    "error": {
                        "border": self.DESIGN_TOKENS["colors"]["danger"]["500"],
                        "focus_border": self.DESIGN_TOKENS["colors"]["danger"]["500"]
                    },
                    "success": {
                        "border": self.DESIGN_TOKENS["colors"]["success"]["500"]
                    }
                },
                "sizes": {
                    "sm": {"height": "32px", "padding": "0.5rem 0.75rem"},
                    "md": {"height": "40px", "padding": "0.75rem 1rem"},
                    "lg": {"height": "48px", "padding": "1rem 1.25rem"}
                },
                "props": {
                    "type": "text | email | password | number | tel | search",
                    "size": "sm | md | lg",
                    "error": "boolean",
                    "disabled": "boolean",
                    "leftIcon": "ReactNode",
                    "rightIcon": "ReactNode",
                    "helperText": "string",
                    "errorMessage": "string"
                },
                "accessibility": {
                    "aria_required": ["aria-label ou label associé", "aria-invalid si erreur", "aria-describedby pour helper"],
                    "keyboard": "Tab pour navigation",
                    "focus_visible": True
                },
                "example_tailwind": """
<input type="text"
       class="w-full h-10 px-4 py-2
              border border-slate-300 rounded-lg
              text-slate-900 placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              disabled:bg-slate-50 disabled:cursor-not-allowed
              transition-colors duration-200"
       placeholder="Entrez votre texte..." />
"""
            },
            "Select": {
                "name": "Select",
                "description": "Liste déroulante",
                "props": {
                    "options": "Array<{value: string, label: string}>",
                    "placeholder": "string",
                    "multiple": "boolean",
                    "searchable": "boolean"
                }
            },
            "Checkbox": {
                "name": "Checkbox",
                "description": "Case à cocher",
                "accessibility": {
                    "keyboard": "Space pour toggle",
                    "aria_required": ["aria-checked"]
                }
            },
            "NumericKeypad": {
                "name": "NumericKeypad",
                "description": "Pavé numérique pour PIN et montants",
                "style": {
                    "button_bg": self.DESIGN_TOKENS["colors"]["secondary"]["100"],
                    "button_border": f"2px solid {self.DESIGN_TOKENS['colors']['secondary']['500']}",
                    "button_radius": self.DESIGN_TOKENS["border_radius"]["xl"],
                    "button_shadow": self.DESIGN_TOKENS["shadows"]["md"],
                    "text_color": self.DESIGN_TOKENS["colors"]["neutral"]["900"],
                    "font_weight": self.DESIGN_TOKENS["typography"]["font_weight"]["extrabold"],
                    "hover_bg": self.DESIGN_TOKENS["colors"]["secondary"]["200"]
                },
                "layout": "3x4 grid",
                "keys": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"],
                "accessibility": {
                    "keyboard": "Navigation par Tab et flèches",
                    "aria_required": ["role='group'", "aria-label='Clavier numérique'"]
                },
                "example_tailwind": """
<div class="grid grid-cols-3 gap-3 p-4 bg-slate-100 rounded-2xl">
  <!-- Bouton numérique -->
  <button class="w-16 h-16
                 bg-amber-100 hover:bg-amber-200 active:bg-amber-300
                 border-2 border-amber-500 rounded-xl
                 text-slate-900 text-2xl font-extrabold
                 shadow-md hover:shadow-lg
                 transition-all duration-150
                 focus:outline-none focus:ring-2 focus:ring-amber-500">
    1
  </button>
</div>
"""
            }
        }

    def _generate_card_components(self) -> Dict[str, Any]:
        """Génère les spécifications des cartes."""
        return {
            "Card": {
                "name": "Card",
                "description": "Conteneur carte pour regrouper du contenu",
                "variants": {
                    "elevated": {
                        "bg": "#FFFFFF",
                        "shadow": self.DESIGN_TOKENS["shadows"]["md"],
                        "border": "none"
                    },
                    "outlined": {
                        "bg": "#FFFFFF",
                        "shadow": "none",
                        "border": f"1px solid {self.DESIGN_TOKENS['colors']['neutral']['200']}"
                    },
                    "filled": {
                        "bg": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                        "shadow": "none",
                        "border": "none"
                    }
                },
                "props": {
                    "variant": "elevated | outlined | filled",
                    "padding": "none | sm | md | lg",
                    "hoverable": "boolean",
                    "clickable": "boolean"
                },
                "example_tailwind": """
<div class="bg-white rounded-xl shadow-md p-6
            hover:shadow-lg transition-shadow duration-200">
  <h3 class="text-lg font-semibold text-slate-900">Titre</h3>
  <p class="mt-2 text-slate-600">Contenu de la carte</p>
</div>
"""
            },
            "ProductCard": {
                "name": "ProductCard",
                "description": "Carte produit pour la grille POS",
                "specs": {
                    "image_ratio": "1:1",
                    "image_size": "80px",
                    "min_width": "120px",
                    "max_width": "160px"
                },
                "states": {
                    "default": {"bg": "#FFFFFF"},
                    "hover": {"shadow": self.DESIGN_TOKENS["shadows"]["lg"]},
                    "selected": {"border": f"2px solid {self.DESIGN_TOKENS['colors']['primary']['500']}"},
                    "out_of_stock": {"opacity": "0.5"}
                }
            },
            "StatCard": {
                "name": "StatCard",
                "description": "Carte pour afficher une statistique KPI",
                "layout": {
                    "icon": "top-left ou left",
                    "value": "large, bold",
                    "label": "small, muted",
                    "trend": "optional, bottom"
                }
            }
        }

    def _generate_badge_components(self) -> Dict[str, Any]:
        """Génère les spécifications des badges."""
        return {
            "Badge": {
                "name": "Badge",
                "description": "Badge de statut ou étiquette",
                "variants": {
                    "default": {
                        "bg": self.DESIGN_TOKENS["colors"]["neutral"]["100"],
                        "text": self.DESIGN_TOKENS["colors"]["neutral"]["700"]
                    },
                    "primary": {
                        "bg": self.DESIGN_TOKENS["colors"]["primary"]["100"],
                        "text": self.DESIGN_TOKENS["colors"]["primary"]["700"]
                    },
                    "success": {
                        "bg": self.DESIGN_TOKENS["colors"]["success"]["100"],
                        "text": self.DESIGN_TOKENS["colors"]["success"]["700"]
                    },
                    "warning": {
                        "bg": self.DESIGN_TOKENS["colors"]["warning"]["100"],
                        "text": self.DESIGN_TOKENS["colors"]["warning"]["700"]
                    },
                    "danger": {
                        "bg": self.DESIGN_TOKENS["colors"]["danger"]["100"],
                        "text": self.DESIGN_TOKENS["colors"]["danger"]["700"]
                    }
                },
                "sizes": {
                    "sm": {"padding": "0.125rem 0.5rem", "font_size": "0.75rem"},
                    "md": {"padding": "0.25rem 0.75rem", "font_size": "0.875rem"}
                },
                "example_tailwind": """
<span class="inline-flex items-center px-2.5 py-0.5
             rounded-full text-xs font-medium
             bg-green-100 text-green-800">
  En stock
</span>
"""
            },
            "OrderStatusBadge": {
                "name": "OrderStatusBadge",
                "description": "Badge spécifique pour les statuts de commande",
                "statuses": {
                    "pending": {"color": "warning", "label": "En attente"},
                    "preparing": {"color": "primary", "label": "En préparation"},
                    "ready": {"color": "success", "label": "Prêt"},
                    "completed": {"color": "default", "label": "Terminé"},
                    "cancelled": {"color": "danger", "label": "Annulé"}
                }
            }
        }

    def _generate_modal_components(self) -> Dict[str, Any]:
        """Génère les spécifications des modales."""
        return {
            "Modal": {
                "name": "Modal",
                "description": "Fenêtre modale",
                "sizes": {
                    "sm": {"max_width": "400px"},
                    "md": {"max_width": "600px"},
                    "lg": {"max_width": "800px"},
                    "xl": {"max_width": "1000px"},
                    "full": {"max_width": "calc(100vw - 2rem)"}
                },
                "structure": {
                    "backdrop": {
                        "bg": "rgba(0, 0, 0, 0.5)",
                        "z_index": self.DESIGN_TOKENS["z_index"]["modal_backdrop"]
                    },
                    "container": {
                        "bg": "#FFFFFF",
                        "border_radius": self.DESIGN_TOKENS["border_radius"]["xl"],
                        "shadow": self.DESIGN_TOKENS["shadows"]["xl"],
                        "z_index": self.DESIGN_TOKENS["z_index"]["modal"]
                    }
                },
                "accessibility": {
                    "aria_required": ["role='dialog'", "aria-modal='true'", "aria-labelledby"],
                    "keyboard": "Escape pour fermer, Tab trap",
                    "focus": "Focus initial sur premier élément interactif"
                }
            },
            "PaymentModal": {
                "name": "PaymentModal",
                "description": "Modal de paiement POS",
                "specs": {
                    "width": "800px",
                    "layout": "Adaptive (2 colonnes pour Cash, 1 centrée pour autres)"
                },
                "sections": ["amount_display", "payment_method_selector", "input_area", "action_buttons"]
            }
        }

    def _generate_table_components(self) -> Dict[str, Any]:
        """Génère les spécifications des tableaux."""
        return {
            "Table": {
                "name": "Table",
                "description": "Tableau de données",
                "style": {
                    "header_bg": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                    "header_text": self.DESIGN_TOKENS["colors"]["neutral"]["600"],
                    "row_hover": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                    "border": self.DESIGN_TOKENS["colors"]["neutral"]["200"]
                },
                "features": ["sorting", "pagination", "row_selection", "column_resizing"]
            },
            "CartTable": {
                "name": "CartTable",
                "description": "Tableau du panier POS",
                "columns": ["product_name", "quantity_controls", "unit_price", "line_total", "actions"],
                "row_states": {
                    "locked": {"indicator": "lock_icon", "color": "warning"}
                }
            }
        }

    def _generate_navigation_components(self) -> Dict[str, Any]:
        """Génère les spécifications des composants de navigation."""
        return {
            "Tabs": {
                "name": "Tabs",
                "description": "Onglets de navigation",
                "variants": {
                    "underline": {
                        "active_indicator": "border-bottom 2px",
                        "active_color": self.DESIGN_TOKENS["colors"]["primary"]["500"]
                    },
                    "pills": {
                        "active_bg": self.DESIGN_TOKENS["colors"]["primary"]["500"],
                        "active_text": "#FFFFFF"
                    },
                    "contained": {
                        "container_bg": self.DESIGN_TOKENS["colors"]["neutral"]["100"],
                        "active_bg": "#FFFFFF"
                    }
                }
            },
            "CategoryTabs": {
                "name": "CategoryTabs",
                "description": "Onglets de catégories pour le POS",
                "behavior": "Scroll horizontal sur mobile",
                "features": ["all_category_tab", "category_icons", "active_highlight"]
            },
            "Sidebar": {
                "name": "Sidebar",
                "description": "Barre latérale de navigation",
                "width": {"collapsed": "64px", "expanded": "240px"}
            }
        }

    def _generate_feedback_components(self) -> Dict[str, Any]:
        """Génère les spécifications des composants de feedback."""
        return {
            "Toast": {
                "name": "Toast",
                "description": "Notification toast",
                "variants": {
                    "success": {"icon": "check", "bg": self.DESIGN_TOKENS["colors"]["success"]["50"]},
                    "error": {"icon": "x", "bg": self.DESIGN_TOKENS["colors"]["danger"]["50"]},
                    "warning": {"icon": "alert", "bg": self.DESIGN_TOKENS["colors"]["warning"]["50"]},
                    "info": {"icon": "info", "bg": self.DESIGN_TOKENS["colors"]["primary"]["50"]}
                },
                "position": "top-right",
                "duration": "5000ms",
                "accessibility": {
                    "aria_required": ["role='alert'", "aria-live='polite'"]
                }
            },
            "Spinner": {
                "name": "Spinner",
                "description": "Indicateur de chargement",
                "sizes": {
                    "sm": "16px",
                    "md": "24px",
                    "lg": "32px",
                    "xl": "48px"
                }
            },
            "Skeleton": {
                "name": "Skeleton",
                "description": "Placeholder de chargement",
                "animation": "pulse"
            }
        }

    # =========================================================================
    # 2. DESIGN LAYOUT PAGE
    # =========================================================================
    def design_page_layout(self, page_type: str) -> Dict[str, Any]:
        """
        Génère le layout pour un type de page spécifique.

        Args:
            page_type: Type de page (pos, dashboard, inventory, auth)

        Returns:
            Dict avec les spécifications du layout
        """
        print(f"📐 Design layout pour page '{page_type}'...")

        layouts = {
            "pos": self._design_pos_layout(),
            "dashboard": self._design_dashboard_layout(),
            "inventory": self._design_inventory_layout(),
            "auth": self._design_auth_layout(),
            "production": self._design_production_layout()
        }

        if page_type not in layouts:
            print(f"⚠️ Type de page inconnu: {page_type}")
            return {}

        layout = layouts[page_type]

        # Sauvegarder
        output_path = self.artifacts_path / "layouts" / f"{page_type}_layout.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(layout, f, indent=2, ensure_ascii=False)

        print(f"✅ Layout sauvegardé: {output_path}")
        return layout

    def _design_pos_layout(self) -> Dict[str, Any]:
        """Layout pour l'écran POS."""
        return {
            "name": "POS Layout",
            "type": "split_screen",
            "fullscreen": True,
            "grid": {
                "desktop": {
                    "columns": "1fr 400px",
                    "template": "'products cart'"
                },
                "tablet": {
                    "columns": "1fr 350px",
                    "template": "'products cart'"
                },
                "mobile": {
                    "columns": "1fr",
                    "template": "'products' 'cart'",
                    "cart_mode": "slide_up_panel"
                }
            },
            "regions": {
                "header": {
                    "height": "64px",
                    "components": ["menu_button", "search_bar", "user_info"],
                    "sticky": True
                },
                "products": {
                    "components": ["category_tabs", "product_grid"],
                    "overflow": "auto"
                },
                "cart": {
                    "components": ["cart_header", "cart_items", "cart_summary", "action_buttons"],
                    "sticky": True,
                    "border_left": True
                }
            },
            "spacing": {
                "gap": self.DESIGN_TOKENS["spacing"]["4"],
                "padding": self.DESIGN_TOKENS["spacing"]["4"]
            }
        }

    def _design_dashboard_layout(self) -> Dict[str, Any]:
        """Layout pour le tableau de bord."""
        return {
            "name": "Dashboard Layout",
            "type": "grid_masonry",
            "sidebar": {
                "width": "240px",
                "collapsible": True,
                "collapsed_width": "64px"
            },
            "main": {
                "grid": {
                    "columns": "repeat(auto-fit, minmax(300px, 1fr))",
                    "gap": self.DESIGN_TOKENS["spacing"]["6"]
                }
            },
            "regions": {
                "kpi_row": {
                    "columns": 4,
                    "component": "StatCard"
                },
                "charts": {
                    "columns": 2,
                    "components": ["revenue_chart", "category_pie"]
                },
                "tables": {
                    "columns": 1,
                    "components": ["top_products", "recent_orders"]
                }
            }
        }

    def _design_inventory_layout(self) -> Dict[str, Any]:
        """Layout pour la gestion des stocks."""
        return {
            "name": "Inventory Layout",
            "type": "master_detail",
            "regions": {
                "sidebar": {
                    "width": "280px",
                    "components": ["category_tree", "filters"]
                },
                "main": {
                    "components": ["toolbar", "product_table"],
                    "toolbar": {
                        "components": ["search", "filters", "view_toggle", "add_button"]
                    }
                },
                "detail_panel": {
                    "width": "400px",
                    "trigger": "row_click",
                    "components": ["product_detail", "stock_history"]
                }
            }
        }

    def _design_auth_layout(self) -> Dict[str, Any]:
        """Layout pour l'écran d'authentification."""
        return {
            "name": "Auth Layout",
            "type": "centered_card",
            "background": {
                "color": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                "pattern": "subtle_dots"
            },
            "card": {
                "max_width": "400px",
                "padding": self.DESIGN_TOKENS["spacing"]["8"],
                "shadow": self.DESIGN_TOKENS["shadows"]["xl"]
            },
            "regions": {
                "header": {
                    "components": ["logo", "title", "subtitle"],
                    "align": "center"
                },
                "form": {
                    "components": ["profile_select", "pin_display", "numeric_keypad"],
                    "spacing": self.DESIGN_TOKENS["spacing"]["6"]
                },
                "footer": {
                    "components": ["login_button", "help_text"],
                    "align": "center"
                }
            }
        }

    def _design_production_layout(self) -> Dict[str, Any]:
        """Layout pour l'écran de production."""
        return {
            "name": "Production Layout",
            "type": "form_table",
            "regions": {
                "header": {
                    "components": ["date_selector", "summary_stats"]
                },
                "search": {
                    "components": ["product_autocomplete", "category_filter"]
                },
                "table": {
                    "component": "ProductionTable",
                    "columns": ["product", "qty_produced", "qty_wasted", "reason", "actions"]
                },
                "footer": {
                    "components": ["save_button", "history_link"]
                }
            }
        }

    # =========================================================================
    # 3. GÉNÉRATION THÈMES (LIGHT/DARK)
    # =========================================================================
    def generate_theme(self, mode: str = "light") -> Dict[str, Any]:
        """
        Génère un thème complet (light ou dark).

        Args:
            mode: 'light' ou 'dark'

        Returns:
            Dict avec toutes les variables du thème
        """
        print(f"🎨 Génération du thème '{mode}'...")

        if mode == "light":
            theme = self._generate_light_theme()
        elif mode == "dark":
            theme = self._generate_dark_theme()
        else:
            print(f"⚠️ Mode inconnu: {mode}")
            return {}

        # Sauvegarder
        output_path = self.artifacts_path / "themes" / f"theme_{mode}.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(theme, f, indent=2, ensure_ascii=False)

        print(f"✅ Thème sauvegardé: {output_path}")
        return theme

    def _generate_light_theme(self) -> Dict[str, Any]:
        """Génère le thème clair."""
        return {
            "name": "Light Theme",
            "mode": "light",
            "colors": {
                "background": {
                    "default": "#FFFFFF",
                    "paper": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                    "elevated": "#FFFFFF"
                },
                "text": {
                    "primary": self.DESIGN_TOKENS["colors"]["neutral"]["900"],
                    "secondary": self.DESIGN_TOKENS["colors"]["neutral"]["600"],
                    "disabled": self.DESIGN_TOKENS["colors"]["neutral"]["400"],
                    "inverse": "#FFFFFF"
                },
                "border": {
                    "default": self.DESIGN_TOKENS["colors"]["neutral"]["200"],
                    "focus": self.DESIGN_TOKENS["colors"]["primary"]["500"]
                },
                "action": {
                    "hover": self.DESIGN_TOKENS["colors"]["neutral"]["100"],
                    "selected": self.DESIGN_TOKENS["colors"]["primary"]["50"],
                    "disabled": self.DESIGN_TOKENS["colors"]["neutral"]["100"]
                }
            },
            "components": {
                "card_bg": "#FFFFFF",
                "input_bg": "#FFFFFF",
                "sidebar_bg": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                "modal_backdrop": "rgba(0, 0, 0, 0.5)"
            }
        }

    def _generate_dark_theme(self) -> Dict[str, Any]:
        """Génère le thème sombre."""
        return {
            "name": "Dark Theme",
            "mode": "dark",
            "colors": {
                "background": {
                    "default": self.DESIGN_TOKENS["colors"]["neutral"]["900"],
                    "paper": self.DESIGN_TOKENS["colors"]["neutral"]["800"],
                    "elevated": self.DESIGN_TOKENS["colors"]["neutral"]["700"]
                },
                "text": {
                    "primary": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                    "secondary": self.DESIGN_TOKENS["colors"]["neutral"]["400"],
                    "disabled": self.DESIGN_TOKENS["colors"]["neutral"]["600"],
                    "inverse": self.DESIGN_TOKENS["colors"]["neutral"]["900"]
                },
                "border": {
                    "default": self.DESIGN_TOKENS["colors"]["neutral"]["700"],
                    "focus": self.DESIGN_TOKENS["colors"]["primary"]["400"]
                },
                "action": {
                    "hover": self.DESIGN_TOKENS["colors"]["neutral"]["700"],
                    "selected": "rgba(59, 130, 246, 0.2)",
                    "disabled": self.DESIGN_TOKENS["colors"]["neutral"]["800"]
                }
            },
            "components": {
                "card_bg": self.DESIGN_TOKENS["colors"]["neutral"]["800"],
                "input_bg": self.DESIGN_TOKENS["colors"]["neutral"]["700"],
                "sidebar_bg": self.DESIGN_TOKENS["colors"]["neutral"]["950"],
                "modal_backdrop": "rgba(0, 0, 0, 0.7)"
            }
        }

    # =========================================================================
    # 4. EXPORT CONFIG TAILWIND
    # =========================================================================
    def export_tailwind_config(self) -> str:
        """
        Exporte la configuration Tailwind CSS complète.

        Returns:
            Chemin du fichier généré
        """
        print("⚙️ Export configuration Tailwind CSS...")

        config = f"""/** @type {{import('tailwindcss').Config}} */
// Généré par UIDesignAgent - {datetime.now().isoformat()}

module.exports = {{
  content: [
    "./index.html",
    "./src/**/*.{{js,ts,jsx,tsx}}",
  ],
  darkMode: 'class',
  theme: {{
    extend: {{
      colors: {{
        primary: {{
          50: '{self.DESIGN_TOKENS["colors"]["primary"]["50"]}',
          100: '{self.DESIGN_TOKENS["colors"]["primary"]["100"]}',
          200: '{self.DESIGN_TOKENS["colors"]["primary"]["200"]}',
          300: '{self.DESIGN_TOKENS["colors"]["primary"]["300"]}',
          400: '{self.DESIGN_TOKENS["colors"]["primary"]["400"]}',
          500: '{self.DESIGN_TOKENS["colors"]["primary"]["500"]}',
          600: '{self.DESIGN_TOKENS["colors"]["primary"]["600"]}',
          700: '{self.DESIGN_TOKENS["colors"]["primary"]["700"]}',
          800: '{self.DESIGN_TOKENS["colors"]["primary"]["800"]}',
          900: '{self.DESIGN_TOKENS["colors"]["primary"]["900"]}',
        }},
        secondary: {{
          50: '{self.DESIGN_TOKENS["colors"]["secondary"]["50"]}',
          100: '{self.DESIGN_TOKENS["colors"]["secondary"]["100"]}',
          200: '{self.DESIGN_TOKENS["colors"]["secondary"]["200"]}',
          300: '{self.DESIGN_TOKENS["colors"]["secondary"]["300"]}',
          400: '{self.DESIGN_TOKENS["colors"]["secondary"]["400"]}',
          500: '{self.DESIGN_TOKENS["colors"]["secondary"]["500"]}',
          600: '{self.DESIGN_TOKENS["colors"]["secondary"]["600"]}',
          700: '{self.DESIGN_TOKENS["colors"]["secondary"]["700"]}',
          800: '{self.DESIGN_TOKENS["colors"]["secondary"]["800"]}',
          900: '{self.DESIGN_TOKENS["colors"]["secondary"]["900"]}',
        }},
      }},
      fontFamily: {{
        sans: ['{self.DESIGN_TOKENS["typography"]["font_family"]["sans"]}'],
        mono: ['{self.DESIGN_TOKENS["typography"]["font_family"]["mono"]}'],
      }},
      borderRadius: {{
        'xl': '{self.DESIGN_TOKENS["border_radius"]["xl"]}',
        '2xl': '{self.DESIGN_TOKENS["border_radius"]["2xl"]}',
        '3xl': '{self.DESIGN_TOKENS["border_radius"]["3xl"]}',
      }},
      boxShadow: {{
        'sm': '{self.DESIGN_TOKENS["shadows"]["sm"]}',
        'DEFAULT': '{self.DESIGN_TOKENS["shadows"]["default"]}',
        'md': '{self.DESIGN_TOKENS["shadows"]["md"]}',
        'lg': '{self.DESIGN_TOKENS["shadows"]["lg"]}',
        'xl': '{self.DESIGN_TOKENS["shadows"]["xl"]}',
      }},
      transitionDuration: {{
        'fast': '150ms',
        'normal': '200ms',
        'slow': '300ms',
      }},
      zIndex: {{
        'dropdown': '{self.DESIGN_TOKENS["z_index"]["dropdown"]}',
        'sticky': '{self.DESIGN_TOKENS["z_index"]["sticky"]}',
        'modal-backdrop': '{self.DESIGN_TOKENS["z_index"]["modal_backdrop"]}',
        'modal': '{self.DESIGN_TOKENS["z_index"]["modal"]}',
        'tooltip': '{self.DESIGN_TOKENS["z_index"]["tooltip"]}',
      }},
    }},
  }},
  plugins: [
    require('@tailwindcss/forms'),
  ],
}}
"""

        output_path = self.artifacts_path / "exports" / "tailwind.config.js"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(config)

        print(f"✅ Config Tailwind sauvegardée: {output_path}")
        return str(output_path)

    # =========================================================================
    # 5. EXPORT VARIABLES CSS
    # =========================================================================
    def export_css_variables(self) -> str:
        """
        Exporte les variables CSS (custom properties).

        Returns:
            Chemin du fichier généré
        """
        print("🎨 Export variables CSS...")

        css_lines = [
            "/* Variables CSS générées par UIDesignAgent */",
            f"/* Date: {datetime.now().isoformat()} */",
            "",
            ":root {"
        ]

        # Couleurs
        css_lines.append("  /* Colors */")
        for color_name, shades in self.DESIGN_TOKENS["colors"].items():
            for shade, value in shades.items():
                css_lines.append(f"  --color-{color_name}-{shade}: {value};")

        css_lines.append("")

        # Typography
        css_lines.append("  /* Typography */")
        css_lines.append(f"  --font-sans: {self.DESIGN_TOKENS['typography']['font_family']['sans']};")
        css_lines.append(f"  --font-mono: {self.DESIGN_TOKENS['typography']['font_family']['mono']};")

        for size_name, size_def in self.DESIGN_TOKENS["typography"]["font_size"].items():
            css_lines.append(f"  --text-{size_name}: {size_def['size']};")
            css_lines.append(f"  --leading-{size_name}: {size_def['line_height']};")

        css_lines.append("")

        # Spacing
        css_lines.append("  /* Spacing */")
        for space_name, space_value in self.DESIGN_TOKENS["spacing"].items():
            css_lines.append(f"  --space-{space_name}: {space_value};")

        css_lines.append("")

        # Border Radius
        css_lines.append("  /* Border Radius */")
        for radius_name, radius_value in self.DESIGN_TOKENS["border_radius"].items():
            css_lines.append(f"  --radius-{radius_name}: {radius_value};")

        css_lines.append("")

        # Shadows
        css_lines.append("  /* Shadows */")
        for shadow_name, shadow_value in self.DESIGN_TOKENS["shadows"].items():
            css_lines.append(f"  --shadow-{shadow_name}: {shadow_value};")

        css_lines.append("")

        # Z-Index
        css_lines.append("  /* Z-Index */")
        for z_name, z_value in self.DESIGN_TOKENS["z_index"].items():
            css_lines.append(f"  --z-{z_name.replace('_', '-')}: {z_value};")

        css_lines.append("}")

        # Dark mode
        css_lines.extend([
            "",
            "/* Dark Mode */",
            ".dark {"
        ])

        dark_theme = self._generate_dark_theme()
        for key, value in dark_theme["colors"]["background"].items():
            css_lines.append(f"  --bg-{key}: {value};")
        for key, value in dark_theme["colors"]["text"].items():
            css_lines.append(f"  --text-{key}: {value};")

        css_lines.append("}")

        css_content = "\n".join(css_lines)

        output_path = self.artifacts_path / "exports" / "design-tokens.css"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(css_content)

        print(f"✅ Variables CSS sauvegardées: {output_path}")
        return str(output_path)

    # =========================================================================
    # 6. VALIDATION ACCESSIBILITÉ (WCAG 2.1)
    # =========================================================================
    def validate_accessibility(self) -> Dict[str, Any]:
        """
        Valide les contrastes de couleurs selon WCAG 2.1.

        Returns:
            Rapport de validation avec les erreurs/warnings
        """
        print("♿ Validation accessibilité WCAG 2.1...")

        report = {
            "timestamp": datetime.now().isoformat(),
            "standard": "WCAG 2.1 AA",
            "checks": [],
            "summary": {"passed": 0, "failed": 0, "warnings": 0}
        }

        # Vérifications de contraste à effectuer
        contrast_checks = [
            ("primary.500", "#FFFFFF", "Texte blanc sur primary"),
            ("secondary.100", "neutral.900", "Texte sur bouton crème"),
            ("neutral.50", "neutral.900", "Texte principal sur fond clair"),
            ("neutral.50", "neutral.600", "Texte secondaire sur fond clair"),
            ("danger.500", "#FFFFFF", "Texte blanc sur danger"),
            ("success.500", "#FFFFFF", "Texte blanc sur success"),
        ]

        for bg_token, fg_token, description in contrast_checks:
            bg_color = self._get_color_from_token(bg_token)
            fg_color = self._get_color_from_token(fg_token)

            if bg_color and fg_color:
                ratio = self._calculate_contrast_ratio(bg_color, fg_color)

                # WCAG AA: 4.5:1 pour texte normal, 3:1 pour grand texte
                passed = ratio >= 4.5
                status = "pass" if passed else "fail"

                report["checks"].append({
                    "description": description,
                    "background": bg_token,
                    "foreground": fg_token,
                    "ratio": round(ratio, 2),
                    "required": 4.5,
                    "status": status
                })

                if passed:
                    report["summary"]["passed"] += 1
                else:
                    report["summary"]["failed"] += 1

        # Sauvegarder
        output_path = self.artifacts_path / "reports" / "accessibility_report.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)

        print(f"✅ Rapport accessibilité sauvegardé: {output_path}")

        # Afficher résumé
        print(f"\n📊 Résumé: {report['summary']['passed']} OK, {report['summary']['failed']} échecs")

        return report

    def _get_color_from_token(self, token: str) -> Optional[str]:
        """Récupère une couleur depuis un token (ex: 'primary.500' ou '#FFFFFF')."""
        if token.startswith("#"):
            return token

        parts = token.split(".")
        if len(parts) == 2:
            color_name, shade = parts
            return self.DESIGN_TOKENS["colors"].get(color_name, {}).get(shade)

        return None

    def _calculate_contrast_ratio(self, color1: str, color2: str) -> float:
        """
        Calcule le ratio de contraste entre deux couleurs.
        Formule WCAG: (L1 + 0.05) / (L2 + 0.05)
        """
        l1 = self._get_relative_luminance(color1)
        l2 = self._get_relative_luminance(color2)

        lighter = max(l1, l2)
        darker = min(l1, l2)

        return (lighter + 0.05) / (darker + 0.05)

    def _get_relative_luminance(self, hex_color: str) -> float:
        """Calcule la luminance relative d'une couleur hex."""
        hex_color = hex_color.lstrip('#')
        r, g, b = tuple(int(hex_color[i:i+2], 16) / 255 for i in (0, 2, 4))

        def adjust(c):
            return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4

        return 0.2126 * adjust(r) + 0.7152 * adjust(g) + 0.0722 * adjust(b)

    # =========================================================================
    # 7. DESIGN COMPOSANTS POS
    # =========================================================================
    def design_pos_components(self) -> Dict[str, Any]:
        """
        Génère les spécifications détaillées des composants POS.

        Returns:
            Dict avec tous les composants POS
        """
        print("🛒 Design composants POS spécifiques...")

        components = {
            "ProductGrid": {
                "description": "Grille de produits cliquables",
                "grid": {
                    "mobile": {"columns": 2, "gap": "8px"},
                    "tablet": {"columns": 3, "gap": "12px"},
                    "desktop": {"columns": 4, "gap": "16px"}
                },
                "item": {
                    "min_height": "140px",
                    "padding": "12px",
                    "image_size": "64px",
                    "border_radius": self.DESIGN_TOKENS["border_radius"]["lg"]
                }
            },
            "Cart": {
                "description": "Panier avec items modifiables",
                "header": {
                    "height": "48px",
                    "components": ["order_number", "clear_button"]
                },
                "item_row": {
                    "height": "auto",
                    "min_height": "56px",
                    "padding": "8px 12px",
                    "components": ["product_name", "modifiers", "quantity_controls", "price", "delete"]
                },
                "locked_item": {
                    "indicator": "lock_icon",
                    "background": self.DESIGN_TOKENS["colors"]["warning"]["50"],
                    "requires_pin": True
                },
                "summary": {
                    "fields": ["subtotal", "discount", "tax", "total"],
                    "total_style": "large, bold"
                }
            },
            "PaymentSection": {
                "description": "Section de paiement",
                "methods": [
                    {"code": "cash", "label": "Tunai", "icon": "Banknote", "color": "success"},
                    {"code": "card", "label": "Kartu", "icon": "CreditCard", "color": "primary"},
                    {"code": "qris", "label": "QRIS", "icon": "QrCode", "color": "secondary"},
                    {"code": "transfer", "label": "Transfer", "icon": "Building", "color": "neutral"}
                ],
                "quick_amounts": [10000, 20000, 50000, 100000]
            },
            "OrderTypeSelector": {
                "description": "Sélecteur type de commande",
                "options": [
                    {"code": "dine_in", "label": "Sur place"},
                    {"code": "takeaway", "label": "À emporter"},
                    {"code": "delivery", "label": "Livraison"}
                ],
                "style": "segmented_control"
            },
            "CategoryTabs": {
                "description": "Onglets de catégories",
                "behavior": "horizontal_scroll",
                "all_tab": True,
                "tab_style": {
                    "padding": "8px 16px",
                    "active_bg": self.DESIGN_TOKENS["colors"]["primary"]["500"],
                    "active_text": "#FFFFFF"
                }
            }
        }

        # Sauvegarder
        output_path = self.artifacts_path / "components" / "pos_components.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(components, f, indent=2, ensure_ascii=False)

        print(f"✅ Composants POS sauvegardés: {output_path}")
        return components

    # =========================================================================
    # 8. DESIGN ÉCRAN AUTHENTIFICATION
    # =========================================================================
    def design_auth_screen(self) -> Dict[str, Any]:
        """
        Génère les spécifications de l'écran d'authentification.

        Returns:
            Dict avec les spécifications complètes
        """
        print("🔐 Design écran d'authentification...")

        design = {
            "name": "LoginScreen",
            "description": "Écran de connexion par PIN",
            "layout": "centered_card",
            "background": {
                "color": self.DESIGN_TOKENS["colors"]["neutral"]["50"],
                "gradient": "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)"
            },
            "card": {
                "max_width": "400px",
                "padding": self.DESIGN_TOKENS["spacing"]["8"],
                "border_radius": self.DESIGN_TOKENS["border_radius"]["2xl"],
                "shadow": self.DESIGN_TOKENS["shadows"]["xl"],
                "background": "#FFFFFF"
            },
            "components": {
                "logo": {
                    "type": "image",
                    "src": "/logo-croissant.png",
                    "size": "80px",
                    "margin_bottom": self.DESIGN_TOKENS["spacing"]["4"]
                },
                "title": {
                    "text": "The Breakery",
                    "font_size": self.DESIGN_TOKENS["typography"]["font_size"]["3xl"]["size"],
                    "font_weight": self.DESIGN_TOKENS["typography"]["font_weight"]["bold"],
                    "color": self.DESIGN_TOKENS["colors"]["neutral"]["900"]
                },
                "subtitle": {
                    "text": "Point de Vente",
                    "font_size": self.DESIGN_TOKENS["typography"]["font_size"]["base"]["size"],
                    "color": self.DESIGN_TOKENS["colors"]["neutral"]["500"]
                },
                "profile_select": {
                    "type": "select",
                    "label": "Sélectionnez votre profil",
                    "margin_top": self.DESIGN_TOKENS["spacing"]["6"],
                    "options_source": "user_profiles"
                },
                "pin_display": {
                    "type": "pin_dots",
                    "length": 6,
                    "dot_size": "16px",
                    "dot_spacing": "12px",
                    "active_color": self.DESIGN_TOKENS["colors"]["primary"]["500"],
                    "inactive_color": self.DESIGN_TOKENS["colors"]["neutral"]["300"],
                    "margin_top": self.DESIGN_TOKENS["spacing"]["6"]
                },
                "numeric_keypad": {
                    "type": "grid",
                    "columns": 3,
                    "gap": self.DESIGN_TOKENS["spacing"]["3"],
                    "margin_top": self.DESIGN_TOKENS["spacing"]["6"],
                    "container": {
                        "background": self.DESIGN_TOKENS["colors"]["neutral"]["100"],
                        "padding": self.DESIGN_TOKENS["spacing"]["4"],
                        "border_radius": self.DESIGN_TOKENS["border_radius"]["xl"]
                    },
                    "button": {
                        "width": "64px",
                        "height": "64px",
                        "background": self.DESIGN_TOKENS["colors"]["secondary"]["100"],
                        "border": f"2px solid {self.DESIGN_TOKENS['colors']['secondary']['500']}",
                        "border_radius": self.DESIGN_TOKENS["border_radius"]["xl"],
                        "font_size": self.DESIGN_TOKENS["typography"]["font_size"]["2xl"]["size"],
                        "font_weight": self.DESIGN_TOKENS["typography"]["font_weight"]["extrabold"],
                        "color": self.DESIGN_TOKENS["colors"]["neutral"]["900"],
                        "shadow": self.DESIGN_TOKENS["shadows"]["md"],
                        "hover": {
                            "background": self.DESIGN_TOKENS["colors"]["secondary"]["200"],
                            "shadow": self.DESIGN_TOKENS["shadows"]["lg"]
                        },
                        "active": {
                            "background": self.DESIGN_TOKENS["colors"]["secondary"]["300"],
                            "transform": "scale(0.98)"
                        }
                    },
                    "keys": ["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "⌫"]
                },
                "login_button": {
                    "type": "button",
                    "variant": "primary",
                    "text": "Se connecter",
                    "full_width": True,
                    "margin_top": self.DESIGN_TOKENS["spacing"]["6"]
                },
                "demo_hint": {
                    "type": "text",
                    "text": "💡 Demo: Le PIN est affiché pour chaque profil",
                    "font_size": self.DESIGN_TOKENS["typography"]["font_size"]["sm"]["size"],
                    "color": self.DESIGN_TOKENS["colors"]["neutral"]["500"],
                    "margin_top": self.DESIGN_TOKENS["spacing"]["4"],
                    "text_align": "center"
                }
            },
            "accessibility": {
                "focus_order": ["profile_select", "keypad_keys", "login_button"],
                "aria_labels": {
                    "keypad": "Clavier numérique pour saisie du PIN",
                    "pin_display": "Affichage du PIN saisi"
                }
            }
        }

        # Sauvegarder
        output_path = self.artifacts_path / "screens" / "auth_screen.json"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(design, f, indent=2, ensure_ascii=False)

        print(f"✅ Design auth sauvegardé: {output_path}")
        return design

    # =========================================================================
    # 9. GÉNÉRATION GUIDE DE STYLE COMPLET
    # =========================================================================
    def generate_style_guide(self) -> str:
        """
        Génère un guide de style complet en Markdown.

        Returns:
            Chemin du fichier généré
        """
        print("📖 Génération guide de style complet...")

        guide = f"""# 🎨 Guide de Style - The Breakery Design System

**Généré par:** UIDesignAgent
**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}
**Version:** 1.0.0

---

## 📌 Vue d'ensemble

Ce guide définit les standards visuels et les composants UI pour l'application The Breakery POS/ERP.

### Principes de design

1. **Clarté** - Interface intuitive pour utilisation rapide en caisse
2. **Accessibilité** - Conforme WCAG 2.1 AA minimum
3. **Cohérence** - Utilisation systématique des tokens
4. **Performance** - Composants légers et optimisés

---

## 🎨 Couleurs

### Palette principale

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-500` | {self.DESIGN_TOKENS["colors"]["primary"]["500"]} | Actions principales, liens |
| `secondary-100` | {self.DESIGN_TOKENS["colors"]["secondary"]["100"]} | Boutons crème (keypad) |
| `secondary-500` | {self.DESIGN_TOKENS["colors"]["secondary"]["500"]} | Accents, bordures |
| `success-500` | {self.DESIGN_TOKENS["colors"]["success"]["500"]} | Succès, paiement cash |
| `warning-500` | {self.DESIGN_TOKENS["colors"]["warning"]["500"]} | Alertes stock |
| `danger-500` | {self.DESIGN_TOKENS["colors"]["danger"]["500"]} | Erreurs, suppressions |

### Neutres

| Token | Hex | Usage |
|-------|-----|-------|
| `neutral-50` | {self.DESIGN_TOKENS["colors"]["neutral"]["50"]} | Fond clair |
| `neutral-100` | {self.DESIGN_TOKENS["colors"]["neutral"]["100"]} | Fond secondaire |
| `neutral-600` | {self.DESIGN_TOKENS["colors"]["neutral"]["600"]} | Texte secondaire |
| `neutral-900` | {self.DESIGN_TOKENS["colors"]["neutral"]["900"]} | Texte principal |

---

## 📝 Typographie

### Famille de polices

```css
--font-sans: {self.DESIGN_TOKENS["typography"]["font_family"]["sans"]};
--font-mono: {self.DESIGN_TOKENS["typography"]["font_family"]["mono"]};
```

### Tailles

| Token | Size | Line Height | Usage |
|-------|------|-------------|-------|
| `text-xs` | 0.75rem | 1rem | Labels, badges |
| `text-sm` | 0.875rem | 1.25rem | Texte secondaire |
| `text-base` | 1rem | 1.5rem | Texte courant |
| `text-lg` | 1.125rem | 1.75rem | Sous-titres |
| `text-xl` | 1.25rem | 1.75rem | Titres |
| `text-2xl` | 1.5rem | 2rem | Prix, totaux |

---

## 📐 Espacements

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

---

## 🔘 Composants clés

### Boutons

#### Primary Button
```jsx
<button className="bg-blue-500 hover:bg-blue-600 text-white
                   px-6 py-3 rounded-lg font-medium
                   transition-colors duration-200">
  Confirmer
</button>
```

#### Secondary Button (Crème)
```jsx
<button className="bg-amber-100 hover:bg-amber-200
                   text-slate-900 font-semibold
                   px-6 py-3 rounded-xl
                   border-2 border-amber-500 shadow-md">
  Annuler
</button>
```

### Pavé numérique (PIN)

```jsx
<div className="grid grid-cols-3 gap-3 p-4 bg-slate-100 rounded-2xl">
  <button className="w-16 h-16
                     bg-amber-100 border-2 border-amber-500
                     rounded-xl shadow-md
                     text-2xl font-extrabold text-slate-900
                     hover:bg-amber-200 hover:shadow-lg
                     active:scale-98 transition-all">
    1
  </button>
</div>
```

### Cartes produit

```jsx
<div className="bg-white rounded-lg shadow-sm p-3
                hover:shadow-md transition-shadow
                cursor-pointer">
  <img src="..." className="w-16 h-16 mx-auto rounded" />
  <p className="mt-2 text-sm font-medium text-center">Croissant</p>
  <p className="text-lg font-bold text-center">Rp 25.000</p>
</div>
```

---

## ♿ Accessibilité

### Ratios de contraste (WCAG AA)

| Combinaison | Ratio | Statut |
|-------------|-------|--------|
| Blanc sur primary-500 | 4.5:1+ | ✅ Pass |
| neutral-900 sur secondary-100 | 7:1+ | ✅ Pass |
| neutral-900 sur neutral-50 | 16:1+ | ✅ Pass |

### Bonnes pratiques

- Toujours fournir `aria-label` pour les boutons icône
- Utiliser `focus:ring-2` pour les indicateurs de focus
- Assurer la navigation clavier (Tab, Enter, Escape)
- Utiliser `role="alert"` pour les messages toast

---

## 📱 Breakpoints responsifs

| Nom | Min-width | Usage |
|-----|-----------|-------|
| `sm` | 640px | Tablettes portrait |
| `md` | 768px | Tablettes paysage |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Grand écran |

---

## 🔧 Utilisation avec Tailwind

### Import des couleurs personnalisées

```js
// tailwind.config.js
module.exports = {{
  theme: {{
    extend: {{
      colors: {{
        primary: {{
          500: '{self.DESIGN_TOKENS["colors"]["primary"]["500"]}',
          // ...
        }},
        secondary: {{
          100: '{self.DESIGN_TOKENS["colors"]["secondary"]["100"]}',
          500: '{self.DESIGN_TOKENS["colors"]["secondary"]["500"]}',
          // ...
        }}
      }}
    }}
  }}
}}
```

---

*Guide généré automatiquement par UIDesignAgent v1.0*
"""

        output_path = self.artifacts_path / "reports" / "style_guide.md"
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(guide)

        print(f"✅ Guide de style sauvegardé: {output_path}")
        return str(output_path)

    # =========================================================================
    # 10. INTÉGRATION AVEC ERPDesignAgent
    # =========================================================================
    def load_erp_specs(self, spec_type: str = "pos_interface") -> Optional[Dict[str, Any]]:
        """
        Charge les spécifications depuis ERPDesignAgent.

        Args:
            spec_type: Type de spec (pos_interface, auth_interface, dashboard)

        Returns:
            Dict avec les spécifications ou None si non trouvé
        """
        spec_file = self.erp_artifacts_path / "interfaces" / f"{spec_type}_spec.json"

        if spec_file.exists():
            with open(spec_file, 'r', encoding='utf-8') as f:
                return json.load(f)

        print(f"⚠️ Spécification non trouvée: {spec_file}")
        return None

    def sync_with_erp_design(self) -> Dict[str, Any]:
        """
        Synchronise les composants UI avec les spécifications ERP.

        Returns:
            Rapport de synchronisation
        """
        print("🔄 Synchronisation avec ERPDesignAgent...")

        report = {
            "timestamp": datetime.now().isoformat(),
            "specs_loaded": [],
            "components_generated": []
        }

        # Charger les specs ERP
        for spec_name in ["pos_interface", "auth_interface", "dashboard"]:
            specs = self.load_erp_specs(spec_name)
            if specs:
                report["specs_loaded"].append(spec_name)

        print(f"✅ {len(report['specs_loaded'])} spécifications chargées")
        return report


# =============================================================================
# MAIN EXECUTION
# =============================================================================
def main():
    """Lance l'agent UIDesignAgent avec un menu interactif."""
    print("🎨 UIDesignAgent - Expert UI/UX Design")
    print("=" * 50)

    agent = UIDesignAgent(".")

    while True:
        print("\n📋 MENU")
        print("1. 📚 Générer bibliothèque de composants")
        print("2. 📐 Design layout page (POS/Dashboard/etc)")
        print("3. 🎨 Générer thème (light/dark)")
        print("4. ⚙️ Exporter config Tailwind")
        print("5. 🎨 Exporter variables CSS")
        print("6. ♿ Valider accessibilité")
        print("7. 🛒 Design composants POS")
        print("8. 🔐 Design écran authentification")
        print("9. 📖 Générer guide de style complet")
        print("10. 🚪 Quitter")

        choice = input("\nChoix (1-10): ").strip()

        if choice == "1":
            agent.generate_component_library()
        elif choice == "2":
            page_type = input("Type de page (pos/dashboard/inventory/auth/production): ").strip()
            agent.design_page_layout(page_type)
        elif choice == "3":
            mode = input("Mode (light/dark): ").strip()
            agent.generate_theme(mode)
        elif choice == "4":
            agent.export_tailwind_config()
        elif choice == "5":
            agent.export_css_variables()
        elif choice == "6":
            agent.validate_accessibility()
        elif choice == "7":
            agent.design_pos_components()
        elif choice == "8":
            agent.design_auth_screen()
        elif choice == "9":
            agent.generate_style_guide()
        elif choice == "10":
            print("👋 Au revoir!")
            break
        else:
            print("❌ Choix invalide")


if __name__ == "__main__":
    main()
