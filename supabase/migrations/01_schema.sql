-- ==============================================================================
-- ROLL & DIP DIGITAL MENU — SUPABASE DATABASE SCHEMA
-- Migration: 01_schema.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. ADMIN PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 2. MENU SECTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  section_number TEXT NOT NULL, -- e.g. '01', '02', '08'
  tag TEXT,                     -- e.g. 'Signature', 'Petite Selection', 'Creamy'
  heading TEXT NOT NULL,        -- e.g. 'Freshly<br><em>Rolled</em>'
  title_plain TEXT NOT NULL,    -- e.g. 'Freshly Rolled' (for admin UI & navigation)
  introduction TEXT,            -- e.g. Section summary / subtitle
  layout_type TEXT NOT NULL DEFAULT 'layout-left', -- 'layout-left', 'layout-center', 'layout-split', 'layout-right', 'layout-balanced'
  card_classes TEXT DEFAULT 'wide',                -- e.g. 'wide', 'alt flat wide', 'alt'
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 3. MENU GROUPS TABLE (Subsections / Categories inside a section)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.menu_sections(id) ON DELETE CASCADE,
  slug TEXT,
  title TEXT NOT NULL,          -- e.g. 'Sweet Bites', 'Sweet Extras', 'Frappe', 'Soft Drinks'
  subtitle TEXT,               -- e.g. 'Finishing Touches'
  tag TEXT,                    -- e.g. 'Sweet Extras', 'Refreshing'
  display_type TEXT NOT NULL DEFAULT 'regular', -- 'regular', 'two-column', 'center-cards', 'split-left', 'split-right', 'inline-subgroup', 'pairing-cards'
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 4. MENU ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.menu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.menu_groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,            -- e.g. '(Chocolate, Caramel, Vanilla)'
  price NUMERIC(10, 2),        -- NULLABLE: some items have no price (e.g. Churros, Soda)
  currency TEXT NOT NULL DEFAULT 'LE',
  badge TEXT,                  -- e.g. 'Trendy', '♡'
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ------------------------------------------------------------------------------
-- 5. INDEXES FOR PERFORMANCE
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_menu_sections_sort ON public.menu_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_sections_active ON public.menu_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_groups_section_id ON public.menu_groups(section_id);
CREATE INDEX IF NOT EXISTS idx_menu_groups_sort ON public.menu_groups(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_group_id ON public.menu_items(group_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sort ON public.menu_items(sort_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON public.menu_items(is_active);

-- ------------------------------------------------------------------------------
-- 6. AUTOMATIC UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_sections_updated_at ON public.menu_sections;
CREATE TRIGGER set_sections_updated_at
  BEFORE UPDATE ON public.menu_sections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_groups_updated_at ON public.menu_groups;
CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON public.menu_groups
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_items_updated_at ON public.menu_items;
CREATE TRIGGER set_items_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 7. HELPER FUNCTION: CHECK IF CURRENT USER IS AN AUTHORIZED ADMIN
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- 8.1 Admin Profiles RLS
CREATE POLICY "Admins can view admin profiles"
  ON public.admin_profiles FOR SELECT
  TO authenticated
  USING (public.is_admin() OR auth.uid() = user_id);

-- 8.2 Menu Sections RLS
-- Public can read active sections
CREATE POLICY "Public can view active menu sections"
  ON public.menu_sections FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Only admins can mutate sections
CREATE POLICY "Admins can insert menu sections"
  ON public.menu_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu sections"
  ON public.menu_sections FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete menu sections"
  ON public.menu_sections FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 8.3 Menu Groups RLS
-- Public can read active groups
CREATE POLICY "Public can view active menu groups"
  ON public.menu_groups FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Only admins can mutate groups
CREATE POLICY "Admins can insert menu groups"
  ON public.menu_groups FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu groups"
  ON public.menu_groups FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete menu groups"
  ON public.menu_groups FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 8.4 Menu Items RLS
-- Public can read active items
CREATE POLICY "Public can view active menu items"
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

-- Only admins can mutate items
CREATE POLICY "Admins can insert menu items"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update menu items"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete menu items"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (public.is_admin());
