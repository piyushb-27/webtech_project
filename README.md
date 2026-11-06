# Estora

**A real estate management dashboard for property listings and deals.**

Estora brings property details, owner information, and deal tracking into one responsive interface, with a teal theme and an animated landing page.

## Features

- **Property management:** Add, edit, and delete listings with location, category, owner, area, bedrooms, bathrooms, furnishing, and pricing details.
- **Search and filters:** Find properties using search, listing type, and category filters.
- **Deal tracking:** Create deals, record payment methods, and switch between pending and completed statuses.
- **Dashboard summaries:** View property and deal counts at a glance.
- **Responsive interface:** Mobile-friendly layouts, keyboard focus indicators, reduced-motion support, and a compact fixed credit footer.
- **Supabase integration:** Store and retrieve property and deal records from a hosted PostgreSQL database.

## Technology

| Layer | Tools |
| --- | --- |
| Frontend | React 19, JavaScript, CSS |
| Routing | React Router 7 |
| Build tooling | Vite 8 |
| Database client | Supabase JavaScript SDK |
| Code quality | ESLint |
| Typography and icons | Inter, Manrope, Material Symbols |

## Run locally

### Requirements

- Node.js 20.19+ within the 20.x release line, or Node.js 22.12 or later.
- npm.
- A Supabase project with the application's database tables and access policies configured.

### 1. Install dependencies

From the project directory:

```bash
npm ci
```

### 2. Configure Supabase

Create a `.env` file in the project root:

```dotenv
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The application reads these values in `src/lib/supabase.js`. Restart the development server after changing them.

Use the browser-safe anonymous key, never a service-role key. Vite exposes variables prefixed with `VITE_` to the browser, so database access must be controlled through Supabase policies. The `.env` file is ignored by Git.

### 3. Prepare the database

The application expects these tables and relationships:

- `property_categories`: Listing categories with `category_id` and `name`.
- `properties`: Property records keyed by `property_id`, linked to `property_categories` through `category_id`.
- `deals`: Deal records keyed by `deal_id`, linked to `properties` through `property_id`, with payment method and deal status fields.

The property deletion flow also attempts to clean up related records in `payments` and `commission_logs`.

A complete database schema migration is not currently included. Configure the schema and appropriate access policies before using the management screens.

The local `seed_data.sql` script provides sample listings and deals for Ahmedabad, Mumbai, and Delhi. It assumes the base tables already exist and alters some deal constraints. **It truncates existing property and deal data, including cascading dependent records; use it only with a disposable demo database.**

### 4. Start the application

```bash
npm run dev
```

Open the local URL printed by Vite.

## Pages

| Route | Purpose |
| --- | --- |
| `/` | Animated landing page with links to the management screens |
| `/properties` | Property listings, search, filters, and listing forms |
| `/deals` | Deal ledger, status filters, and deal creation |

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run the repository's ESLint checks |

The production build succeeds. Repository-wide lint currently reports existing issues in the local `.agent` tooling and unused variables in `src/pages/Deals.jsx`.

## Project structure

```text
webtech_project/
├── public/                 # Public images and favicon
├── src/
│   ├── assets/             # Image assets
│   ├── components/         # Shared navigation
│   ├── lib/supabase.js      # Supabase client configuration
│   ├── pages/              # Landing, Properties, and Deals
│   ├── App.jsx             # Routes and shared footer
│   ├── App.css             # Shared UI refinements
│   ├── index.css           # Theme and global styles
│   └── main.jsx            # React entry point
├── index.html
├── package.json
├── seed_data.sql           # Local demo-data script
└── vite.config.js
```

## Deployment

Set both Supabase environment variables in the hosting provider's build environment, then run `npm run build` and serve the generated `dist/` directory. Configure the host to serve `index.html` for application routes so direct visits to `/properties` and `/deals` work with browser routing.

## Contributors

Made by **Vandita Nawani (24BIT167)** and **Piyush Bajaj (24BIT181)**.
