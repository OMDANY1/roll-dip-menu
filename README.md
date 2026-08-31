# Roll & Dip — Digital Menu & Admin Dashboard

Artisan Cinnamon Rolls & Café digital menu with real-time administration powered by Supabase and hosted on Vercel.

---

## Features

- **Data-Driven Menu**: Dynamic rendering backed by Supabase PostgreSQL database with embedded baseline resilience.
- **Admin Portal (`/admin`)**: Secure, responsive management dashboard for authorized administrators:
  - Add, edit, and delete menu items
  - Modify prices, descriptions, and badges (e.g. `Trendy`, `♡`)
  - Toggle item visibility (`is_active` true/false) without deleting
  - Reorder items with instant persistence
- **Milk Shakes Layout Solution (`layout-balanced`)**: Seamlessly integrated inside the main 1100px content wrapper with balanced centered panel styling and navigation anchor.
- **Row Level Security (RLS)**: Public read-only access for visible items; mutations strictly locked to verified administrators.
- **Zero-Flash Hydration**: Instant initial paint using compiled fallback seed data, updating seamlessly when live data changes.

---

## Directory Structure

```
├── .env.example                     # Environment variables template
├── .gitignore                       # Git ignore configuration
├── README.md                        # Project documentation
├── supabase/
│   ├── migrations/
│   │   ├── 01_schema.sql            # PostgreSQL schema, triggers, and RLS policies
│   │   └── 02_seed.sql              # Complete seed data for 8 sections, 11 groups, 57 items
│   └── README.md                    # Database & initial admin setup guide
├── vercel-deploy/
│   ├── vercel.json                  # Vercel static build & routing rules
│   └── public/
│       ├── index.html               # Public menu entry point
│       ├── assets/
│       │   ├── logo.png             # Roll & Dip logo
│       │   └── qr.png               # Social QR code
│       ├── css/
│       │   ├── style.css            # Public menu stylesheet (includes layout-balanced)
│       │   └── admin.css            # Admin dashboard stylesheet
│       ├── js/
│       │   ├── supabase-client.js   # Supabase client initialization & API queries
│       │   ├── menu-seed-data.js    # Embedded fallback seed dataset
│       │   ├── app.js               # Public menu renderer & animations
│       │   └── admin.js             # Admin dashboard controller
│       └── admin/
│           └── index.html           # Admin dashboard entry point
└── tests/
    └── data-transform.test.js       # Automated test suite
```

---

## Getting Started

### 1. Database Setup

Follow the detailed instructions in [`supabase/README.md`](supabase/README.md) to:
1. Create a Supabase project.
2. Run `01_schema.sql` and `02_seed.sql` in the SQL Editor.
3. Provision your initial admin user in `public.admin_profiles`.

### 2. Local Preview

Start any static HTTP server from `vercel-deploy/public`:

```bash
# Example with Node.js built-in / npx serve / python
npx serve vercel-deploy/public -p 3000
```

- Public Menu: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin`

---

## Automated Tests

Run the data transformation and seed validation suite:

```bash
node tests/data-transform.test.js
```
