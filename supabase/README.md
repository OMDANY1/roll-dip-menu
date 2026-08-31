# Supabase Setup Guide for Roll & Dip Menu

This guide details how to set up Supabase for the Roll & Dip digital menu, apply migrations, enable Row Level Security (RLS), and provision the initial administrator account.

---

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and log in to your account.
2. Create a new project named `roll-dip-menu`.
3. Save your **Database Password** securely.
4. Copy your project credentials from **Project Settings > API**:
   - `Project URL` (e.g. `https://xyzcompany.supabase.co`)
   - `anon public` key (public key safe for browser use)

---

## 2. Run Database Migrations

Open the **SQL Editor** in your Supabase dashboard:

1. **Step 1 — Run Schema Migration**:
   - Copy the contents of [`01_schema.sql`](./migrations/01_schema.sql) and paste it into the SQL Editor.
   - Click **Run**.
   - This creates tables (`admin_profiles`, `menu_sections`, `menu_groups`, `menu_items`), performance indexes, `updated_at` triggers, and Row Level Security policies.

2. **Step 2 — Run Production Seed Migration**:
   - Copy the contents of [`02_seed.sql`](./migrations/02_seed.sql) and paste it into the SQL Editor.
   - Click **Run**.
   - This seeds all 8 sections, 11 groups, and 57 menu items with exact prices and descriptions.

---

## 3. Create the Initial Admin User

1. In Supabase Dashboard, navigate to **Authentication > Users**.
2. Click **Add user** > **Create user**.
3. Enter an admin email (e.g., `admin@rollanddip.com`) and a strong password. Check **Auto Confirm User?** to true.
4. Click **Create user**.
5. Copy the newly created user's **User UID** (e.g. `d8b5...-....`).
6. Navigate back to **SQL Editor** and run:
   ```sql
   INSERT INTO public.admin_profiles (user_id, email)
   VALUES ('<PASTE_USER_UID_HERE>', 'admin@rollanddip.com');
   ```

---

## 4. Secure Authentication Settings

1. In Supabase Dashboard, go to **Authentication > Providers > Email**.
2. Under **Sign Up**, disable **Allow new users to sign up** (set to OFF). This prevents unauthorized public visitors from creating accounts.
3. Only invited or manually provisioned administrators will have dashboard access.

---

## 5. Configure Client Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in your project URL and anon key.
3. For local browser development or production Vercel hosting, supply the environment variables in your Vercel project settings or through `vercel-deploy/public/js/supabase-client.js`.
