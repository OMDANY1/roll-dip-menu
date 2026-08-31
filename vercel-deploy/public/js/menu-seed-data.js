/**
 * ROLL & DIP — STATIC MENU SEED DATA
 * Fallback dataset for instant zero-shift rendering and offline resilience.
 * Exactly matches initial production database state.
 */
window.ROLL_DIP_SEED_DATA = [
  {
    slug: 'freshly-rolled',
    section_number: '01',
    tag: 'Signature',
    heading: 'Freshly<br><em>Rolled</em>',
    title_plain: 'Freshly Rolled',
    introduction: 'Full-size rolls with the core flavors first, followed by richer toppings and seasonal-style finishes.',
    layout_type: 'layout-left',
    card_classes: 'wide',
    sort_order: 1,
    is_active: true,
    groups: [
      {
        slug: 'freshly-rolled-main',
        title: 'Freshly Rolled',
        display_type: 'two-column',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Classic Cinnamon', description: null, price: 90, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Caramel Pecan', description: null, price: 130, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Chocolate', description: null, price: 110, currency: 'LE', badge: null, sort_order: 3, is_active: true },
          { name: 'Kinder / Lotus / Pistachio', description: null, price: 125, currency: 'LE', badge: null, sort_order: 4, is_active: true },
          { name: 'Ferrero Roll', description: null, price: 125, currency: 'LE', badge: null, sort_order: 5, is_active: true },
          { name: 'Mix Berries & Strawberry', description: null, price: 110, currency: 'LE', badge: null, sort_order: 6, is_active: true },
          { name: 'Salted Caramel', description: null, price: 100, currency: 'LE', badge: null, sort_order: 7, is_active: true },
          { name: 'Apple Cinnamon Pie Roll', description: null, price: 115, currency: 'LE', badge: null, sort_order: 8, is_active: true },
          { name: 'Oreo Roll', description: null, price: 115, currency: 'LE', badge: null, sort_order: 9, is_active: true },
          { name: 'Coffee Roll', description: null, price: 100, currency: 'LE', badge: null, sort_order: 10, is_active: true },
          { name: 'Cheezy Roll', description: null, price: 130, currency: 'LE', badge: 'Trendy', sort_order: 11, is_active: true },
          { name: 'Peanut Butter', description: null, price: 125, currency: 'LE', badge: null, sort_order: 12, is_active: true },
          { name: 'Honey Cream Roll', description: null, price: 110, currency: 'LE', badge: null, sort_order: 13, is_active: true }
        ]
      }
    ]
  },
  {
    slug: 'mini-rolls',
    section_number: '02',
    tag: 'Petite Selection',
    heading: '<em>Mini</em> Rolls',
    title_plain: 'Mini Rolls',
    introduction: 'Smaller boxes for sharing, tasting, or building a mixed treat set.',
    layout_type: 'layout-center',
    card_classes: 'alt flat wide',
    sort_order: 2,
    is_active: true,
    groups: [
      {
        slug: 'mini-rolls-main',
        title: 'Mini Rolls',
        display_type: 'center-cards',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Classic Selection', description: null, price: 190, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Special Selection', description: null, price: 240, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Signature Selection', description: null, price: 270, currency: 'LE', badge: null, sort_order: 3, is_active: true }
        ]
      }
    ]
  },
  {
    slug: 'sweet-bites',
    section_number: '03',
    tag: 'Light Indulgence',
    heading: 'Sweet<br><em>Bites</em>',
    title_plain: 'Sweet Bites',
    introduction: 'Quick sweet sides and extra dips to finish the tray.',
    layout_type: 'layout-split',
    card_classes: 'wide',
    sort_order: 3,
    is_active: true,
    groups: [
      {
        slug: 'sweet-bites-main',
        title: 'Sweet Bites',
        subtitle: null,
        tag: null,
        display_type: 'split-left',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Churros', description: null, price: null, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Cookie Dough', description: null, price: 70, currency: 'LE', badge: null, sort_order: 2, is_active: true }
        ]
      },
      {
        slug: 'sweet-extras',
        title: 'Sweet Extras',
        subtitle: 'Finishing Touches',
        tag: 'Sweet Extras',
        display_type: 'split-right',
        sort_order: 2,
        is_active: true,
        items: [
          { name: 'Cream Cheese Lotus', description: null, price: 25, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Chocolate Pistachio', description: null, price: 25, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Nuts Pecan', description: null, price: 30, currency: 'LE', badge: null, sort_order: 3, is_active: true }
        ]
      }
    ]
  },
  {
    slug: 'better-together',
    section_number: '04',
    tag: 'Curated Pairings',
    heading: '<em>Better</em><br>Together',
    title_plain: 'Better Together',
    introduction: 'House pairings that keep the cinnamon, coffee, and cream flavors balanced.',
    layout_type: 'layout-right',
    card_classes: 'alt',
    sort_order: 4,
    is_active: true,
    groups: [
      {
        slug: 'pairings',
        title: 'Pairings',
        display_type: 'pairing-cards',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Classic Cinnamon & Latte', description: null, price: 145, currency: 'LE', badge: '♡', sort_order: 1, is_active: true },
          { name: 'Classic Cinnamon & Ice Latte', description: null, price: 145, currency: 'LE', badge: '♡', sort_order: 2, is_active: true }
        ]
      }
    ]
  },
  {
    slug: 'warm-cups',
    section_number: '05',
    tag: 'Hot Brews',
    heading: '<em>Warm</em> Cups',
    title_plain: 'Warm Cups',
    introduction: 'Classic espresso drinks, softer milk cups, and cinnamon-forward favorites.',
    layout_type: 'layout-center',
    card_classes: 'wide',
    sort_order: 5,
    is_active: true,
    groups: [
      {
        slug: 'warm-cups-main',
        title: 'Warm Cups',
        display_type: 'center-cards',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Latte', description: null, price: 70, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Espresso', description: null, price: 35, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Macchiato', description: null, price: 50, currency: 'LE', badge: null, sort_order: 3, is_active: true },
          { name: 'Cappuccino', description: null, price: 65, currency: 'LE', badge: null, sort_order: 4, is_active: true },
          { name: 'Americano', description: null, price: 55, currency: 'LE', badge: null, sort_order: 5, is_active: true },
          { name: 'Mocha', description: null, price: 70, currency: 'LE', badge: null, sort_order: 6, is_active: true },
          { name: 'White Mocha', description: null, price: 70, currency: 'LE', badge: null, sort_order: 7, is_active: true },
          { name: 'Flat White', description: null, price: 70, currency: 'LE', badge: null, sort_order: 8, is_active: true },
          { name: 'Spanish Latte', description: null, price: 90, currency: 'LE', badge: null, sort_order: 9, is_active: true },
          { name: 'Cortado', description: null, price: 75, currency: 'LE', badge: null, sort_order: 10, is_active: true },
          { name: 'Cinnamon Latte', description: null, price: 75, currency: 'LE', badge: null, sort_order: 11, is_active: true }
        ]
      }
    ]
  },
  {
    slug: 'sparkling-cups',
    section_number: '06',
    tag: 'Effervescent',
    heading: 'Sparkling<br><em>Cups</em>',
    title_plain: 'Sparkling Cups',
    introduction: 'Bright cold drinks for a lighter finish.',
    layout_type: 'layout-split',
    card_classes: 'alt wide',
    sort_order: 6,
    is_active: true,
    groups: [
      {
        slug: 'sparkling-cups-main',
        title: 'Sparkling Cups',
        subtitle: null,
        tag: null,
        display_type: 'split-left',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Mojito', description: null, price: 60, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Blue Steel', description: null, price: 60, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Cherry Cola', description: null, price: 60, currency: 'LE', badge: null, sort_order: 3, is_active: true }
        ]
      },
      {
        slug: 'soft-drinks',
        title: 'Soft Drinks',
        subtitle: 'Soft Drinks',
        tag: 'Refreshing',
        display_type: 'split-right',
        sort_order: 2,
        is_active: true,
        items: [
          { name: 'Water', description: null, price: 10, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'RedBull', description: null, price: 70, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Soda', description: null, price: null, currency: 'LE', badge: null, sort_order: 3, is_active: true }
        ]
      }
    ]
  },
  {
    slug: 'cold-cups',
    section_number: '07',
    tag: 'Chilled Brews',
    heading: 'Cold<br><em>Cups</em>',
    title_plain: 'Cold Cups',
    introduction: 'Iced espresso drinks and creamy frappes for a colder cinnamon-roll pairing.',
    layout_type: 'layout-left',
    card_classes: 'wide',
    sort_order: 7,
    is_active: true,
    groups: [
      {
        slug: 'cold-cups-main',
        title: 'Cold Cups',
        subtitle: null,
        tag: null,
        display_type: 'two-column',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Ice Cinnamon Latte', description: null, price: 75, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Ice Latte', description: null, price: 70, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Ice Mocha', description: null, price: 75, currency: 'LE', badge: null, sort_order: 3, is_active: true },
          { name: 'Ice White Mocha', description: null, price: 85, currency: 'LE', badge: null, sort_order: 4, is_active: true },
          { name: 'Iced Caramel Macchiato', description: null, price: 75, currency: 'LE', badge: null, sort_order: 5, is_active: true },
          { name: 'Iced Americano', description: null, price: 65, currency: 'LE', badge: null, sort_order: 6, is_active: true },
          { name: 'Iced Salted Caramel', description: null, price: 85, currency: 'LE', badge: null, sort_order: 7, is_active: true },
          { name: 'Iced Spanish Latte', description: null, price: 90, currency: 'LE', badge: null, sort_order: 8, is_active: true }
        ]
      },
      {
        slug: 'frappe',
        title: 'Frappe',
        subtitle: null,
        tag: null,
        display_type: 'inline-subgroup',
        sort_order: 2,
        is_active: true,
        items: [
          { name: 'Caramel', description: null, price: 75, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Chocolate', description: null, price: 75, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Vanilla', description: null, price: 75, currency: 'LE', badge: null, sort_order: 3, is_active: true },
          { name: 'Lotus', description: null, price: 80, currency: 'LE', badge: null, sort_order: 4, is_active: true },
          { name: 'Frappuccino', description: null, price: 85, currency: 'LE', badge: null, sort_order: 5, is_active: true }
        ]
      }
    ]
  },
  {
    slug: 'milkshakes',
    section_number: '08',
    tag: 'Creamy',
    heading: 'Milk<br><em>Shakes</em>',
    title_plain: 'Milk Shakes',
    introduction: 'Rich, creamy shakes crafted with signature flavors and indulgent toppings.',
    layout_type: 'layout-balanced',
    card_classes: 'wide',
    sort_order: 8,
    is_active: true,
    groups: [
      {
        slug: 'milkshakes-main',
        title: 'Milk Shakes',
        subtitle: null,
        tag: null,
        display_type: 'regular',
        sort_order: 1,
        is_active: true,
        items: [
          { name: 'Classic', description: '(Chocolate, Caramel, Vanilla)', price: 70, currency: 'LE', badge: null, sort_order: 1, is_active: true },
          { name: 'Signature Shake', description: '(Cinnamon Shake)', price: 75, currency: 'LE', badge: null, sort_order: 2, is_active: true },
          { name: 'Special Shake', description: '(Pistachio, Lotus)', price: 85, currency: 'LE', badge: null, sort_order: 3, is_active: true },
          { name: 'Mix Berries', description: null, price: 90, currency: 'LE', badge: null, sort_order: 4, is_active: true }
        ]
      }
    ]
  }
];
