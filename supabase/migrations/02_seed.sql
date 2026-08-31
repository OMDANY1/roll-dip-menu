-- ==============================================================================
-- ROLL & DIP DIGITAL MENU — INITIAL PRODUCTION SEED
-- Migration: 02_seed.sql
-- Exact 8 sections, 11 groups, and 57 items extracted from production
-- ==============================================================================

DO $$
DECLARE
  v_sec_freshly_rolled UUID;
  v_sec_mini_rolls UUID;
  v_sec_sweet_bites UUID;
  v_sec_better_together UUID;
  v_sec_warm_cups UUID;
  v_sec_sparkling_cups UUID;
  v_sec_cold_cups UUID;
  v_sec_milkshakes UUID;

  v_grp_id UUID;
BEGIN
  -- Clear existing data if re-seeding
  TRUNCATE TABLE public.menu_items, public.menu_groups, public.menu_sections CASCADE;

  -- ----------------------------------------------------------------------------
  -- SECTION 01: Freshly Rolled
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'freshly-rolled',
    '01',
    'Signature',
    'Freshly<br><em>Rolled</em>',
    'Freshly Rolled',
    'Full-size rolls with the core flavors first, followed by richer toppings and seasonal-style finishes.',
    'layout-left',
    'wide',
    1,
    true
  ) RETURNING id INTO v_sec_freshly_rolled;

  -- Group: Freshly Rolled
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_freshly_rolled,
    'freshly-rolled-main',
    'Freshly Rolled',
    NULL,
    NULL,
    'two-column',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Classic Cinnamon', NULL, 90, 'LE', NULL, 1, true),
    (v_grp_id, 'Caramel Pecan', NULL, 130, 'LE', NULL, 2, true),
    (v_grp_id, 'Chocolate', NULL, 110, 'LE', NULL, 3, true),
    (v_grp_id, 'Kinder / Lotus / Pistachio', NULL, 125, 'LE', NULL, 4, true),
    (v_grp_id, 'Ferrero Roll', NULL, 125, 'LE', NULL, 5, true),
    (v_grp_id, 'Mix Berries & Strawberry', NULL, 110, 'LE', NULL, 6, true),
    (v_grp_id, 'Salted Caramel', NULL, 100, 'LE', NULL, 7, true),
    (v_grp_id, 'Apple Cinnamon Pie Roll', NULL, 115, 'LE', NULL, 8, true),
    (v_grp_id, 'Oreo Roll', NULL, 115, 'LE', NULL, 9, true),
    (v_grp_id, 'Coffee Roll', NULL, 100, 'LE', NULL, 10, true),
    (v_grp_id, 'Cheezy Roll', NULL, 130, 'LE', 'Trendy', 11, true),
    (v_grp_id, 'Peanut Butter', NULL, 125, 'LE', NULL, 12, true),
    (v_grp_id, 'Honey Cream Roll', NULL, 110, 'LE', NULL, 13, true);

  -- ----------------------------------------------------------------------------
  -- SECTION 02: Mini Rolls
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'mini-rolls',
    '02',
    'Petite Selection',
    '<em>Mini</em> Rolls',
    'Mini Rolls',
    'Smaller boxes for sharing, tasting, or building a mixed treat set.',
    'layout-center',
    'alt flat wide',
    2,
    true
  ) RETURNING id INTO v_sec_mini_rolls;

  -- Group: Mini Rolls
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_mini_rolls,
    'mini-rolls-main',
    'Mini Rolls',
    NULL,
    NULL,
    'center-cards',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Classic Selection', NULL, 190, 'LE', NULL, 1, true),
    (v_grp_id, 'Special Selection', NULL, 240, 'LE', NULL, 2, true),
    (v_grp_id, 'Signature Selection', NULL, 270, 'LE', NULL, 3, true);

  -- ----------------------------------------------------------------------------
  -- SECTION 03: Sweet Bites
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'sweet-bites',
    '03',
    'Light Indulgence',
    'Sweet<br><em>Bites</em>',
    'Sweet Bites',
    'Quick sweet sides and extra dips to finish the tray.',
    'layout-split',
    'wide',
    3,
    true
  ) RETURNING id INTO v_sec_sweet_bites;

  -- Group: Sweet Bites
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_sweet_bites,
    'sweet-bites-main',
    'Sweet Bites',
    NULL,
    NULL,
    'split-left',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Churros', NULL, NULL, 'LE', NULL, 1, true),
    (v_grp_id, 'Cookie Dough', NULL, 70, 'LE', NULL, 2, true);

  -- Group: Sweet Extras
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_sweet_bites,
    'sweet-extras',
    'Sweet Extras',
    'Finishing Touches',
    'Sweet Extras',
    'split-right',
    2,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Cream Cheese Lotus', NULL, 25, 'LE', NULL, 1, true),
    (v_grp_id, 'Chocolate Pistachio', NULL, 25, 'LE', NULL, 2, true),
    (v_grp_id, 'Nuts Pecan', NULL, 30, 'LE', NULL, 3, true);

  -- ----------------------------------------------------------------------------
  -- SECTION 04: Better Together
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'better-together',
    '04',
    'Curated Pairings',
    '<em>Better</em><br>Together',
    'Better Together',
    'House pairings that keep the cinnamon, coffee, and cream flavors balanced.',
    'layout-right',
    'alt',
    4,
    true
  ) RETURNING id INTO v_sec_better_together;

  -- Group: Pairings
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_better_together,
    'pairings',
    'Pairings',
    NULL,
    NULL,
    'pairing-cards',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Classic Cinnamon & Latte', NULL, 145, 'LE', '♡', 1, true),
    (v_grp_id, 'Classic Cinnamon & Ice Latte', NULL, 145, 'LE', '♡', 2, true);

  -- ----------------------------------------------------------------------------
  -- SECTION 05: Warm Cups
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'warm-cups',
    '05',
    'Hot Brews',
    '<em>Warm</em> Cups',
    'Warm Cups',
    'Classic espresso drinks, softer milk cups, and cinnamon-forward favorites.',
    'layout-center',
    'wide',
    5,
    true
  ) RETURNING id INTO v_sec_warm_cups;

  -- Group: Warm Cups
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_warm_cups,
    'warm-cups-main',
    'Warm Cups',
    NULL,
    NULL,
    'center-cards',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Latte', NULL, 70, 'LE', NULL, 1, true),
    (v_grp_id, 'Espresso', NULL, 35, 'LE', NULL, 2, true),
    (v_grp_id, 'Macchiato', NULL, 50, 'LE', NULL, 3, true),
    (v_grp_id, 'Cappuccino', NULL, 65, 'LE', NULL, 4, true),
    (v_grp_id, 'Americano', NULL, 55, 'LE', NULL, 5, true),
    (v_grp_id, 'Mocha', NULL, 70, 'LE', NULL, 6, true),
    (v_grp_id, 'White Mocha', NULL, 70, 'LE', NULL, 7, true),
    (v_grp_id, 'Flat White', NULL, 70, 'LE', NULL, 8, true),
    (v_grp_id, 'Spanish Latte', NULL, 90, 'LE', NULL, 9, true),
    (v_grp_id, 'Cortado', NULL, 75, 'LE', NULL, 10, true),
    (v_grp_id, 'Cinnamon Latte', NULL, 75, 'LE', NULL, 11, true);

  -- ----------------------------------------------------------------------------
  -- SECTION 06: Sparkling Cups
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'sparkling-cups',
    '06',
    'Effervescent',
    'Sparkling<br><em>Cups</em>',
    'Sparkling Cups',
    'Bright cold drinks for a lighter finish.',
    'layout-split',
    'alt wide',
    6,
    true
  ) RETURNING id INTO v_sec_sparkling_cups;

  -- Group: Sparkling Cups
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_sparkling_cups,
    'sparkling-cups-main',
    'Sparkling Cups',
    NULL,
    NULL,
    'split-left',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Mojito', NULL, 60, 'LE', NULL, 1, true),
    (v_grp_id, 'Blue Steel', NULL, 60, 'LE', NULL, 2, true),
    (v_grp_id, 'Cherry Cola', NULL, 60, 'LE', NULL, 3, true);

  -- Group: Soft Drinks
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_sparkling_cups,
    'soft-drinks',
    'Soft Drinks',
    'Soft Drinks',
    'Refreshing',
    'split-right',
    2,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Water', NULL, 10, 'LE', NULL, 1, true),
    (v_grp_id, 'RedBull', NULL, 70, 'LE', NULL, 2, true),
    (v_grp_id, 'Soda', NULL, NULL, 'LE', NULL, 3, true);

  -- ----------------------------------------------------------------------------
  -- SECTION 07: Cold Cups
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'cold-cups',
    '07',
    'Chilled Brews',
    'Cold<br><em>Cups</em>',
    'Cold Cups',
    'Iced espresso drinks and creamy frappes for a colder cinnamon-roll pairing.',
    'layout-left',
    'wide',
    7,
    true
  ) RETURNING id INTO v_sec_cold_cups;

  -- Group: Cold Cups
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_cold_cups,
    'cold-cups-main',
    'Cold Cups',
    NULL,
    NULL,
    'two-column',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Ice Cinnamon Latte', NULL, 75, 'LE', NULL, 1, true),
    (v_grp_id, 'Ice Latte', NULL, 70, 'LE', NULL, 2, true),
    (v_grp_id, 'Ice Mocha', NULL, 75, 'LE', NULL, 3, true),
    (v_grp_id, 'Ice White Mocha', NULL, 85, 'LE', NULL, 4, true),
    (v_grp_id, 'Iced Caramel Macchiato', NULL, 75, 'LE', NULL, 5, true),
    (v_grp_id, 'Iced Americano', NULL, 65, 'LE', NULL, 6, true),
    (v_grp_id, 'Iced Salted Caramel', NULL, 85, 'LE', NULL, 7, true),
    (v_grp_id, 'Iced Spanish Latte', NULL, 90, 'LE', NULL, 8, true);

  -- Group: Frappe
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_cold_cups,
    'frappe',
    'Frappe',
    NULL,
    NULL,
    'inline-subgroup',
    2,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Caramel', NULL, 75, 'LE', NULL, 1, true),
    (v_grp_id, 'Chocolate', NULL, 75, 'LE', NULL, 2, true),
    (v_grp_id, 'Vanilla', NULL, 75, 'LE', NULL, 3, true),
    (v_grp_id, 'Lotus', NULL, 80, 'LE', NULL, 4, true),
    (v_grp_id, 'Frappuccino', NULL, 85, 'LE', NULL, 5, true);

  -- ----------------------------------------------------------------------------
  -- SECTION 08: Milk Shakes
  -- ----------------------------------------------------------------------------
  INSERT INTO public.menu_sections (
    slug, section_number, tag, heading, title_plain, introduction, layout_type, card_classes, sort_order, is_active
  ) VALUES (
    'milkshakes',
    '08',
    'Creamy',
    'Milk<br><em>Shakes</em>',
    'Milk Shakes',
    'Rich, creamy shakes crafted with signature flavors and indulgent toppings.',
    'layout-balanced',
    'wide',
    8,
    true
  ) RETURNING id INTO v_sec_milkshakes;

  -- Group: Milk Shakes
  INSERT INTO public.menu_groups (
    section_id, slug, title, subtitle, tag, display_type, sort_order, is_active
  ) VALUES (
    v_sec_milkshakes,
    'milkshakes-main',
    'Milk Shakes',
    NULL,
    NULL,
    'regular',
    1,
    true
  ) RETURNING id INTO v_grp_id;

  INSERT INTO public.menu_items (
    group_id, name, description, price, currency, badge, sort_order, is_active
  ) VALUES
    (v_grp_id, 'Classic', '(Chocolate, Caramel, Vanilla)', 70, 'LE', NULL, 1, true),
    (v_grp_id, 'Signature Shake', '(Cinnamon Shake)', 75, 'LE', NULL, 2, true),
    (v_grp_id, 'Special Shake', '(Pistachio, Lotus)', 85, 'LE', NULL, 3, true),
    (v_grp_id, 'Mix Berries', NULL, 90, 'LE', NULL, 4, true);

END $$;
