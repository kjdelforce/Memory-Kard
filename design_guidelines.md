{
  "product": {
    "name": "PS Collectors Hub (PS Shelf)",
    "visual_personality": [
      "premium PlayStation-like dark UI",
      "glass panels over deep navy",
      "electric-blue focus + subtle glow",
      "dense content, generous spacing",
      "PWA-feeling: sticky bars, bottom tabs, fast micro-interactions"
    ],
    "audience": "PlayStation collectors & gamers (18–45) tracking PS1→PS5 + PSP/PS Vita libraries; mobile-first with desktop power users",
    "success_actions": [
      "Search IGDB and add games",
      "Maintain collection statuses",
      "Curate wishlist priorities",
      "Share public profile + stats",
      "Discover other collectors"
    ]
  },

  "strict_rules": {
    "dark_mode_only": true,
    "no_light_mode": true,
    "no_transparent_body_background": true,
    "mobile_first": "Must look perfect at 390px iPhone width; support 320px → 2560px",
    "tap_targets": "Minimum 44px",
    "data_testid": "All interactive + key informational elements MUST include data-testid (kebab-case, role-based)",
    "images": "Use native <img loading=\"lazy\"> with explicit width/height to prevent CLS",
    "gradients": {
      "rule": "Follow global GRADIENT RESTRICTION RULE appended at end; additionally: keep gradients extremely subtle and only as section accents (<=20% viewport).",
      "note": "This product is dark-only; prefer solid ps-navy/ps-dark with vignette + noise."
    }
  },

  "design_tokens": {
    "colors": {
      "ps-navy": "#00060F",
      "ps-dark": "#000D1A",
      "ps-blue": "#003087",
      "ps-blue-light": "#0070D1",
      "ps-blue-glow": "#1A6FFF",
      "ps-white": "#F0F4FF",
      "status-playing": "#0070D1",
      "status-completed": "#00B050",
      "status-owned": "#9B59B6",
      "status-wishlist": "#F39C12",
      "status-dropped": "#E74C3C",
      "semantic": {
        "bg": "ps-navy",
        "panel": "ps-dark",
        "text": "ps-white",
        "muted_text": "rgba(240,244,255,0.72)",
        "faint_text": "rgba(240,244,255,0.55)",
        "border": "rgba(0,112,209,0.20)",
        "border_strong": "rgba(26,111,255,0.45)",
        "focus_ring": "ps-blue-light",
        "danger": "status-dropped",
        "success": "status-completed",
        "warning": "status-wishlist"
      }
    },

    "typography": {
      "google_fonts": [
        "Rajdhani:400,500,600,700",
        "Inter:400,500,600",
        "Orbitron:500,600,700"
      ],
      "font_usage": {
        "headings_display": "Rajdhani",
        "body_ui": "Inter",
        "platform_badges_and_stat_numbers_only": "Orbitron"
      },
      "scale": {
        "h1": "text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight",
        "h2": "text-base md:text-lg font-semibold",
        "body": "text-sm sm:text-base leading-relaxed",
        "small": "text-xs sm:text-sm",
        "label": "text-xs font-medium tracking-wide"
      },
      "letter_spacing": {
        "rajdhani_headings": "tracking-[0.01em]",
        "orbitron_numbers": "tracking-[0.06em]",
        "uppercase_badges": "tracking-[0.12em]"
      }
    },

    "radius": {
      "card": "16px",
      "pill": "999px",
      "control": "12px"
    },

    "shadows": {
      "glass": "0 4px 24px rgba(0,6,15,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
      "lift": "0 10px 30px rgba(0,6,15,0.75)",
      "glow": "0 0 0 1px rgba(26,111,255,0.35), 0 0 24px rgba(26,111,255,0.18)"
    },

    "glass_card_pattern": {
      "background": "rgba(0,13,26,0.7)",
      "backdrop_filter": "blur(12px)",
      "border": "1px solid rgba(0,112,209,0.2)",
      "border_radius": "16px",
      "box_shadow": "0 4px 24px rgba(0,6,15,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
    },

    "spacing": {
      "page_padding": "px-4 sm:px-6 lg:px-8",
      "section_gap": "gap-6 sm:gap-8",
      "card_padding": "p-4 sm:p-5",
      "dense_row": "gap-2",
      "touch_target": "min-h-[44px] min-w-[44px]"
    }
  },

  "tailwind_config_snippet": {
    "note": "Add to tailwind.config.js theme.extend. Keep palette fixed; do not introduce new brand colors.",
    "code": "// tailwind.config.js\nexport default {\n  theme: {\n    extend: {\n      colors: {\n        'ps-navy': '#00060F',\n        'ps-dark': '#000D1A',\n        'ps-blue': '#003087',\n        'ps-blue-light': '#0070D1',\n        'ps-blue-glow': '#1A6FFF',\n        'ps-white': '#F0F4FF',\n        'status-playing': '#0070D1',\n        'status-completed': '#00B050',\n        'status-owned': '#9B59B6',\n        'status-wishlist': '#F39C12',\n        'status-dropped': '#E74C3C',\n      },\n      fontFamily: {\n        display: ['Rajdhani', 'system-ui', 'sans-serif'],\n        sans: ['Inter', 'system-ui', 'sans-serif'],\n        orbitron: ['Orbitron', 'system-ui', 'sans-serif'],\n      },\n      boxShadow: {\n        glass: '0 4px 24px rgba(0,6,15,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',\n        lift: '0 10px 30px rgba(0,6,15,0.75)',\n        glow: '0 0 0 1px rgba(26,111,255,0.35), 0 0 24px rgba(26,111,255,0.18)',\n      },\n      borderRadius: {\n        ps: '16px',\n      },\n      keyframes: {\n        shimmer: {\n          '0%': { transform: 'translateX(-100%)' },\n          '100%': { transform: 'translateX(100%)' },\n        },\n        floatSlow: {\n          '0%, 100%': { transform: 'translateY(0px)' },\n          '50%': { transform: 'translateY(-14px)' },\n        },\n        glowPulse: {\n          '0%, 100%': { boxShadow: '0 0 0 1px rgba(26,111,255,0.25), 0 0 18px rgba(26,111,255,0.12)' },\n          '50%': { boxShadow: '0 0 0 1px rgba(26,111,255,0.45), 0 0 28px rgba(26,111,255,0.22)' },\n        },\n      },\n      animation: {\n        shimmer: 'shimmer 1.25s ease-in-out infinite',\n        floatSlow: 'floatSlow 8s ease-in-out infinite',\n        glowPulse: 'glowPulse 2.4s ease-in-out infinite',\n      },\n    },\n  },\n};"
  },

  "global_css_additions": {
    "files_to_update": ["/app/frontend/src/index.css", "/app/frontend/src/App.css"],
    "index_css": {
      "google_fonts_import": "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');",
      "base_overrides": [
        "Force body background to ps-navy (no transparency).",
        "Set default font to Inter; headings use Rajdhani via utility classes.",
        "Add subtle vignette + noise overlay using pseudo-element (non-interactive).",
        "Custom scrollbar: thin, ps-blue-light thumb on ps-dark track."
      ],
      "css": "/* Add at top of index.css (before @tailwind) if allowed by build; otherwise place after @tailwind directives */\n@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@500;600;700&family=Rajdhani:wght@400;500;600;700&display=swap');\n\n:root {\n  --ps-navy: #00060F;\n  --ps-dark: #000D1A;\n  --ps-blue: #003087;\n  --ps-blue-light: #0070D1;\n  --ps-blue-glow: #1A6FFF;\n  --ps-white: #F0F4FF;\n\n  --status-playing: #0070D1;\n  --status-completed: #00B050;\n  --status-owned: #9B59B6;\n  --status-wishlist: #F39C12;\n  --status-dropped: #E74C3C;\n\n  --glass-bg: rgba(0,13,26,0.7);\n  --glass-border: rgba(0,112,209,0.2);\n  --glass-shadow: 0 4px 24px rgba(0,6,15,0.6), inset 0 1px 0 rgba(255,255,255,0.05);\n  --glass-blur: blur(12px);\n\n  --focus-ring: 0 0 0 3px rgba(0,112,209,0.35);\n}\n\nhtml, body {\n  height: 100%;\n}\n\nbody {\n  margin: 0;\n  font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif;\n  background: var(--ps-navy);\n  color: var(--ps-white);\n  overflow-x: hidden;\n}\n\n/* Vignette + subtle noise (no transparent body backgrounds) */\nbody::before {\n  content: '';\n  position: fixed;\n  inset: 0;\n  pointer-events: none;\n  background:\n    radial-gradient(1200px 700px at 50% -10%, rgba(26,111,255,0.10), transparent 55%),\n    radial-gradient(900px 600px at 10% 20%, rgba(0,112,209,0.08), transparent 60%),\n    radial-gradient(900px 600px at 90% 30%, rgba(0,48,135,0.10), transparent 60%),\n    radial-gradient(1200px 900px at 50% 120%, rgba(0,0,0,0.55), transparent 55%);\n  opacity: 1;\n  z-index: 0;\n}\n\n/* Optional: CSS noise via repeating-radial-gradient (cheap) */\nbody::after {\n  content: '';\n  position: fixed;\n  inset: 0;\n  pointer-events: none;\n  background-image: repeating-radial-gradient(circle at 0 0, rgba(240,244,255,0.03) 0, rgba(240,244,255,0.03) 1px, transparent 1px, transparent 3px);\n  opacity: 0.18;\n  mix-blend-mode: overlay;\n  z-index: 0;\n}\n\n#root {\n  position: relative;\n  z-index: 1;\n}\n\n/* Scrollbar */\n* {\n  scrollbar-width: thin;\n  scrollbar-color: rgba(0,112,209,0.55) rgba(0,13,26,0.9);\n}\n*::-webkit-scrollbar {\n  width: 10px;\n}\n*::-webkit-scrollbar-track {\n  background: rgba(0,13,26,0.9);\n}\n*::-webkit-scrollbar-thumb {\n  background: rgba(0,112,209,0.55);\n  border-radius: 999px;\n  border: 2px solid rgba(0,13,26,0.9);\n}\n*::-webkit-scrollbar-thumb:hover {\n  background: rgba(26,111,255,0.65);\n}\n\n/* Utilities */\n.glass {\n  background: var(--glass-bg);\n  backdrop-filter: var(--glass-blur);\n  -webkit-backdrop-filter: var(--glass-blur);\n  border: 1px solid var(--glass-border);\n  border-radius: 16px;\n  box-shadow: var(--glass-shadow);\n}\n\n.glass-strong {\n  background: rgba(0,13,26,0.82);\n  backdrop-filter: blur(14px);\n  -webkit-backdrop-filter: blur(14px);\n  border: 1px solid rgba(26,111,255,0.35);\n  border-radius: 16px;\n  box-shadow: var(--glass-shadow), 0 0 0 1px rgba(26,111,255,0.12);\n}\n\n.ps-focus {\n  outline: none;\n  box-shadow: var(--focus-ring);\n}\n\n.ps-button {\n  border-radius: 12px;\n  background: var(--ps-blue-light);\n  color: var(--ps-white);\n  box-shadow: 0 10px 24px rgba(0,112,209,0.18);\n}\n\n.ps-button:hover {\n  background: #0A7BE0;\n}\n\n.ps-button-ghost {\n  border-radius: 12px;\n  background: rgba(0,13,26,0.35);\n  border: 1px solid rgba(0,112,209,0.25);\n  color: var(--ps-white);\n}\n\n.ps-button-ghost:hover {\n  border-color: rgba(26,111,255,0.45);\n  background: rgba(0,13,26,0.55);\n}\n\n.ps-pill {\n  border-radius: 999px;\n  border: 1px solid rgba(0,112,209,0.22);\n  background: rgba(0,13,26,0.55);\n}\n\n.skeleton {\n  position: relative;\n  overflow: hidden;\n  background: rgba(0,13,26,0.95);\n  border: 1px solid rgba(0,112,209,0.12);\n}\n\n.skeleton::after {\n  content: '';\n  position: absolute;\n  inset: 0;\n  transform: translateX(-100%);\n  background: linear-gradient(90deg, transparent, rgba(26,111,255,0.10), transparent);\n  animation: shimmer 1.25s ease-in-out infinite;\n}\n\n@keyframes shimmer {\n  0% { transform: translateX(-100%); }\n  100% { transform: translateX(100%); }\n}\n\n::selection {\n  background: rgba(0,112,209,0.35);\n  color: var(--ps-white);\n}"
    },
    "app_css": {
      "note": "Remove CRA starter styles; keep App.css minimal or delete usage. Do NOT center align app container.",
      "recommended": "/* App.css should not impose layout. Prefer Tailwind + index.css utilities. */\n"
    }
  },

  "layout_system": {
    "navigation": {
      "mobile": {
        "pattern": "BottomTabBar fixed with safe-area padding; content has bottom padding to avoid overlap.",
        "height": "h-16 + pb-[env(safe-area-inset-bottom)]",
        "tabs": ["Dashboard", "Search", "Collection", "Wishlist", "Profile"],
        "spec": {
          "container": "fixed bottom-0 left-0 right-0 z-50 glass-strong",
          "inner": "mx-auto max-w-screen-sm px-3",
          "item": "flex flex-col items-center justify-center gap-1 min-h-[44px] min-w-[44px]",
          "active": "text-ps-white; icon stroke ps-blue-glow; small underline dot",
          "inactive": "text-[rgba(240,244,255,0.65)] hover:text-ps-white"
        }
      },
      "desktop": {
        "pattern": "Fixed left Sidebar 240px; main content scrolls.",
        "width": "w-[240px]",
        "spec": {
          "container": "fixed left-0 top-0 bottom-0 z-40 glass-strong",
          "brand_area": "h-16 px-4 flex items-center gap-3 border-b border-[rgba(0,112,209,0.18)]",
          "nav_item": {
            "base": "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium",
            "hover": "hover:bg-[rgba(0,112,209,0.10)] hover:border-[rgba(26,111,255,0.25)]",
            "active": "bg-[rgba(0,112,209,0.16)] border border-[rgba(26,111,255,0.35)] shadow-glow"
          }
        }
      }
    },

    "page_container": {
      "desktop_with_sidebar": "pl-0 lg:pl-[240px]",
      "max_width": "max-w-screen-2xl",
      "padding": "px-4 sm:px-6 lg:px-8",
      "vertical_rhythm": "py-6 sm:py-8"
    },

    "grids": {
      "game_grid": "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4",
      "collector_grid": "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
      "dashboard_columns": "grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6"
    },

    "sticky_bars": {
      "search_page": "Sticky glass search bar at top with blur; keep z-30; add top padding for iOS safe area if needed.",
      "game_detail_action_bar": "Sticky bottom action bar on mobile; sticky right/side on desktop within hero section."
    }
  },

  "motion_system": {
    "library": "Framer Motion (already installed)",
    "page_transitions": {
      "pattern": "fade + 16px upward slide",
      "variants": {
        "initial": "{ opacity: 0, y: 16 }",
        "animate": "{ opacity: 1, y: 0 }",
        "exit": "{ opacity: 0, y: 16 }"
      },
      "transition": "{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }"
    },
    "grid_stagger": "staggerChildren: 0.05s per card; child enters opacity 0->1 and y 10->0",
    "modals": {
      "mobile": "slide-up sheet (Drawer/Sheet) with spring",
      "desktop": "scale(0.98)->1 + fade with backdrop blur"
    },
    "gamecard_hover": "translateY(-4px) + scale(1.02) + glow border",
    "stat_countup": "Count-up animation for numbers (Orbitron) when visible (IntersectionObserver)"
  },

  "component_path": {
    "shadcn_primary": {
      "buttons": "/app/frontend/src/components/ui/button.jsx",
      "card": "/app/frontend/src/components/ui/card.jsx",
      "badge": "/app/frontend/src/components/ui/badge.jsx",
      "tabs": "/app/frontend/src/components/ui/tabs.jsx",
      "dialog": "/app/frontend/src/components/ui/dialog.jsx",
      "drawer": "/app/frontend/src/components/ui/drawer.jsx",
      "sheet": "/app/frontend/src/components/ui/sheet.jsx",
      "input": "/app/frontend/src/components/ui/input.jsx",
      "select": "/app/frontend/src/components/ui/select.jsx",
      "dropdown": "/app/frontend/src/components/ui/dropdown-menu.jsx",
      "scroll_area": "/app/frontend/src/components/ui/scroll-area.jsx",
      "skeleton": "/app/frontend/src/components/ui/skeleton.jsx",
      "slider": "/app/frontend/src/components/ui/slider.jsx",
      "switch": "/app/frontend/src/components/ui/switch.jsx",
      "avatar": "/app/frontend/src/components/ui/avatar.jsx",
      "tooltip": "/app/frontend/src/components/ui/tooltip.jsx",
      "sonner": "/app/frontend/src/components/ui/sonner.jsx"
    },
    "custom_components_to_build": [
      "src/components/navigation/Sidebar.js",
      "src/components/navigation/BottomTabBar.js",
      "src/components/games/GameCard.js",
      "src/components/games/AddToCollectionModal.js (uses Drawer on mobile, Dialog on desktop)",
      "src/components/states/EmptyState.js",
      "src/components/states/ErrorState.js",
      "src/components/states/SkeletonGameCard.js",
      "src/components/dashboard/StatPill.js",
      "src/components/dashboard/CurrentlyPlayingStrip.js",
      "src/components/visual/FloatingPSSymbols.js",
      "src/components/profile/AvatarRing.js",
      "src/components/charts/PsChartsTheme.js"
    ]
  },

  "core_components_specs": {
    "glass_panel": {
      "usage": "ALL cards/panels use .glass (or .glass-strong for nav).",
      "tailwind": "bg-[rgba(0,13,26,0.7)] backdrop-blur-[12px] border border-[rgba(0,112,209,0.2)] rounded-[16px] shadow-glass"
    },

    "buttons": {
      "primary": {
        "use": "Main CTAs: Add to Collection, Save, Sign In",
        "classes": "ps-button min-h-[44px] px-4 py-2 font-medium",
        "focus": "focus-visible:ps-focus",
        "data_testid_examples": [
          "data-testid=\"auth-submit-button\"",
          "data-testid=\"add-to-collection-save-button\""
        ]
      },
      "secondary_ghost": {
        "use": "Wishlist, secondary actions",
        "classes": "ps-button-ghost min-h-[44px] px-4 py-2",
        "focus": "focus-visible:ps-focus"
      },
      "icon": {
        "use": "Heart, grid/list toggle",
        "classes": "ps-pill min-h-[44px] min-w-[44px] flex items-center justify-center",
        "hover": "hover:border-[rgba(26,111,255,0.45)]"
      }
    },

    "GameCard": {
      "layout": "Cover (aspect ratio 3/4) + title/year + rating + platform badges; hover overlay with 2 actions.",
      "default": {
        "container": "glass group relative overflow-hidden",
        "cover": "rounded-[12px] overflow-hidden bg-ps-dark",
        "title": "font-display text-base font-semibold leading-tight",
        "meta": "text-xs text-[rgba(240,244,255,0.65)]",
        "badges": "font-orbitron text-[10px] uppercase tracking-[0.12em]"
      },
      "hover": {
        "motion": "translateY(-4px) scale(1.02)",
        "overlay": "absolute inset-0 bg-[rgba(0,6,15,0.55)] opacity-0 group-hover:opacity-100 transition-opacity",
        "cta_row": "absolute inset-x-3 bottom-3 flex gap-2",
        "glow": "group-hover:shadow-glow"
      },
      "actions": {
        "primary": "Add to Collection (ps-button)",
        "secondary": "Wishlist (ps-button-ghost)"
      },
      "data_testid": {
        "card": "game-card",
        "add": "game-card-add-button",
        "wishlist": "game-card-wishlist-button",
        "open": "game-card-open-link"
      }
    },

    "StatPill": {
      "use": "Dashboard quick stats row",
      "container": "glass px-3 py-2 flex items-center justify-between gap-3",
      "label": "text-xs text-[rgba(240,244,255,0.65)]",
      "value": "font-orbitron text-sm",
      "accent": "left border strip 2px in ps-blue-light or status color",
      "data_testid": "dashboard-stat-pill"
    },

    "StatusPills": {
      "use": "Collection filters + AddToCollection modal",
      "pill": "ps-pill px-3 py-2 text-xs font-medium",
      "active": "border-[rgba(26,111,255,0.45)] shadow-glow",
      "colors": {
        "Playing": "bg-[rgba(0,112,209,0.14)] border-[rgba(0,112,209,0.35)]",
        "Completed": "bg-[rgba(0,176,80,0.14)] border-[rgba(0,176,80,0.35)]",
        "Owned": "bg-[rgba(155,89,182,0.14)] border-[rgba(155,89,182,0.35)]",
        "Wishlist": "bg-[rgba(243,156,18,0.14)] border-[rgba(243,156,18,0.35)]",
        "Dropped": "bg-[rgba(231,76,60,0.14)] border-[rgba(231,76,60,0.35)]"
      }
    },

    "Sidebar": {
      "sections": ["Main", "Library", "Community", "Settings"],
      "items": [
        "Dashboard",
        "Search",
        "Collection",
        "Wishlist",
        "Platforms",
        "Explore",
        "Settings"
      ],
      "footer": "Profile mini-card with avatar ring + username + quick link",
      "data_testid": {
        "nav": "sidebar-nav",
        "item": "sidebar-nav-item"
      }
    },

    "BottomTabBar": {
      "spec": "Frosted glass bar with 5 tabs; active tab shows glow dot + icon glow.",
      "data_testid": {
        "bar": "bottom-tab-bar",
        "item": "bottom-tab-item"
      }
    },

    "AddToCollectionModal": {
      "mobile": {
        "component": "Drawer (shadcn) or Sheet",
        "header": "Game cover thumb + title + year",
        "body": "Platform selector (PS-only), status pills, rating slider 1–10, notes textarea, hours played input",
        "footer": "Save primary + Cancel ghost",
        "data_testid": "add-to-collection-drawer"
      },
      "desktop": {
        "component": "Dialog (shadcn)",
        "width": "max-w-[720px]",
        "data_testid": "add-to-collection-dialog"
      }
    },

    "SearchBarSticky": {
      "container": "sticky top-0 z-30 glass-strong px-3 py-3",
      "input": "bg-transparent border border-[rgba(0,112,209,0.22)] rounded-xl min-h-[44px]",
      "data_testid": {
        "input": "search-input",
        "platform_filter": "search-platform-filter",
        "sort": "search-sort"
      }
    },

    "EmptyState": {
      "visual": "PS controller SVG illustration (inline SVG) with faint ps-blue-light glow",
      "copy": "Friendly, collector tone; always include a relevant CTA",
      "container": "glass p-6 text-center",
      "cta": "Primary button (Find Games / Search IGDB)",
      "data_testid": "empty-state"
    },

    "ErrorState": {
      "container": "glass p-5 border border-[rgba(231,76,60,0.55)]",
      "title": "font-display text-lg",
      "cta": "Try Again (primary)",
      "data_testid": "error-state"
    },

    "LoadingStates": {
      "skeleton_cards": "Use shadcn Skeleton + .skeleton shimmer overlay; match GameCard layout (cover block + 2 text lines + badge row)",
      "data_testid": "skeleton-game-card"
    },

    "FloatingPSSymbols": {
      "landing_only": true,
      "symbols": ["X", "O", "Square", "Triangle"],
      "opacity": "3–5%",
      "motion": "slow drift + slight rotation; parallax on mouse (desktop) and device tilt optional",
      "colors": {
        "X": "#0070D1",
        "O": "#E74C3C",
        "Square": "#9B59B6",
        "Triangle": "#00B050"
      },
      "implementation": "Canvas optional; prefer simple absolutely-positioned SVGs with CSS keyframes to keep perf high.",
      "data_testid": "floating-ps-symbols"
    }
  },

  "recharts_theme": {
    "palette_mapping": {
      "primary": "#0070D1",
      "glow": "#1A6FFF",
      "gridline": "rgba(240,244,255,0.08)",
      "axis": "rgba(240,244,255,0.55)",
      "tooltip_bg": "rgba(0,13,26,0.92)",
      "tooltip_border": "rgba(0,112,209,0.25)",
      "status": {
        "playing": "#0070D1",
        "completed": "#00B050",
        "owned": "#9B59B6",
        "wishlist": "#F39C12",
        "dropped": "#E74C3C"
      }
    },
    "styling_rules": [
      "Use thin strokes (strokeWidth 2) and rounded corners where possible.",
      "Avoid heavy fills; if needed, use low opacity (0.12–0.18).",
      "Tooltips are glass panels; keep text Inter, numbers Orbitron.",
      "Hide chart modules entirely until games exist (zero-state)."
    ]
  },

  "page_by_page": {
    "/": {
      "layout": "Hero + feature bento + social proof; FloatingPSSymbols behind content.",
      "hero": {
        "title": "Rajdhani bold; short, confident",
        "subtitle": "Inter; max-w-prose; muted",
        "cta": "Sign Up primary + Explore ghost",
        "note": "Keep gradients minimal; rely on vignette/noise + glow accents."
      }
    },
    "/auth/signup": {
      "desktop": "Split-screen: left brand panel (glass) + right form; avoid heavy imagery.",
      "mobile": "Full-screen form with top brand mark.",
      "form": "Use shadcn Form + Input; show inline errors; primary submit.",
      "data_testid": ["signup-email-input", "signup-password-input", "signup-submit-button"]
    },
    "/auth/login": {
      "same_as": "/auth/signup",
      "data_testid": ["login-email-input", "login-password-input", "login-submit-button"]
    },
    "/dashboard": {
      "layout": "Welcome header (avatar ring + date) + stat pills row + currently playing strip + recent additions + genre quick links; charts hidden until games exist.",
      "empty": "Show EmptyState with Find Games CTA; keep stat pills but show 0 with Orbitron.",
      "data_testid": ["dashboard-welcome", "dashboard-stat-pill", "dashboard-find-games-cta"]
    },
    "/search": {
      "layout": "Sticky SearchBar + filters row + infinite grid.",
      "grid": "2 cols mobile → 5 cols wide desktop",
      "perf": "Debounce search; lazy load images; infinite scroll sentinel.",
      "data_testid": ["search-input", "search-results-grid", "search-load-more-sentinel"]
    },
    "/game/:id": {
      "layout": "Blurred hero backdrop from cover; cover+info; screenshots gallery with lightbox; similar games row.",
      "sticky_action": "Mobile bottom sticky action bar; desktop sticky within right column.",
      "data_testid": ["game-detail-add-button", "game-detail-wishlist-button", "game-detail-favorite-button"]
    },
    "/collection": {
      "layout": "Status filter tabs + grid/list toggle + sort + client-side search + stats bar.",
      "empty": "PS controller illustration + Find Games CTA.",
      "data_testid": ["collection-status-tabs", "collection-grid-toggle", "collection-search-input"]
    },
    "/wishlist": {
      "layout": "Priority tabs High/Medium/Low; each row has move-to-collection + delete.",
      "empty": "EmptyState with Search CTA.",
      "data_testid": ["wishlist-priority-tabs", "wishlist-move-to-collection-button"]
    },
    "/profile/:username": {
      "layout": "Public header with avatar ring + stats row; tabs Collection/Stats; charts use PS palette.",
      "data_testid": ["public-profile-header", "public-profile-tabs"]
    },
    "/settings": {
      "layout": "Tabs: Profile/Account/Privacy/Danger Zone; each tab is a glass panel form.",
      "danger_zone": "Red border panel; destructive actions require AlertDialog confirmation.",
      "data_testid": ["settings-tabs", "settings-delete-account-button"]
    },
    "/explore": {
      "layout": "Search by username + collector cards grid; desktop right sidebar: Trending This Week.",
      "data_testid": ["explore-search-input", "collector-card"]
    },
    "/platforms": {
      "layout": "Platform selector cards with era-toned glows (within palette: use ps-blue-glow outer shadow only). Click loads top games.",
      "data_testid": ["platform-card", "platform-top-games-grid"]
    }
  },

  "image_urls": {
    "note": "Covers/screenshots come from IGDB CDN (images.igdb.com). No external stock imagery required.",
    "categories": [
      {
        "category": "empty_state_illustration",
        "description": "Inline SVG PS controller (custom). Use faint ps-blue-light glow and 3–5% opacity background symbols.",
        "urls": []
      },
      {
        "category": "landing_background_symbols",
        "description": "SVG shapes (X/O/Square/Triangle) generated in-app; no external URLs.",
        "urls": []
      }
    ]
  },

  "libraries_and_integrations": {
    "already_installed": ["framer-motion", "recharts", "lucide-react", "sonner", "tailwindcss", "react-router-dom"],
    "recommended_small_additions": [
      {
        "name": "react-intersection-observer (optional)",
        "why": "Trigger stat count-up and lazy animations when visible",
        "install": "npm i react-intersection-observer",
        "usage": "Use useInView() to start Orbitron count-up when StatBlock enters viewport."
      }
    ]
  },

  "instructions_to_main_agent": {
    "critical": [
      "Replace default shadcn CSS variables in index.css with PS tokens; do not rely on :root light theme values.",
      "Remove CRA starter App.css centering styles; do not center align containers.",
      "All cards/panels must use the glass card pattern (no exceptions).",
      "Implement mobile BottomTabBar + desktop Sidebar exactly; ensure safe-area-inset-bottom padding.",
      "Implement empty states everywhere (library starts empty on signup).",
      "Use Framer Motion transitions and specified hover/overlay behaviors.",
      "Every interactive element and key info must have data-testid."
    ],
    "implementation_notes": [
      "Prefer shadcn components from /src/components/ui; do not use raw HTML dropdown/calendar/toast.",
      "Use <img loading=\"lazy\" width height> for IGDB images to prevent CLS.",
      "Avoid universal transitions; only transition opacity/background-color/border-color/shadow where needed."
    ]
  },

  "append_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>\n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
