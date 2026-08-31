/**
 * Automated Test Suite for Roll & Dip Menu Data & Assets
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Starting Roll & Dip Test Suite...\n');

// 1. Test Seed Data
const seedPath = path.resolve(__dirname, '../js/menu-seed-data.js');
assert.ok(fs.existsSync(seedPath), 'menu-seed-data.js must exist');
const seedContent = fs.readFileSync(seedPath, 'utf8');

// Evaluate seed data in sandbox
const sandbox = {};
const fn = new Function('window', seedContent);
sandbox.window = {};
fn(sandbox.window);

const seedData = sandbox.window.ROLL_DIP_SEED_DATA;
assert.ok(Array.isArray(seedData), 'ROLL_DIP_SEED_DATA must be an array');
assert.strictEqual(seedData.length, 8, 'Must have exactly 8 menu sections');

// Test Sections
const sectionSlugs = seedData.map(s => s.slug);
assert.deepStrictEqual(sectionSlugs, [
  'freshly-rolled',
  'mini-rolls',
  'sweet-bites',
  'better-together',
  'warm-cups',
  'sparkling-cups',
  'cold-cups',
  'milkshakes'
], 'Sections must match exact expected slugs');

// Count Groups and Items
let groupCount = 0;
let itemCount = 0;
const nullablePriceItems = [];

seedData.forEach(section => {
  assert.ok(section.section_number, `Section ${section.slug} must have a section_number`);
  assert.ok(section.heading, `Section ${section.slug} must have a heading`);
  assert.ok(section.title_plain, `Section ${section.slug} must have a title_plain`);
  assert.ok(Array.isArray(section.groups), `Section ${section.slug} must have groups array`);

  section.groups.forEach(group => {
    groupCount++;
    assert.ok(group.title, `Group in ${section.slug} must have a title`);
    assert.ok(Array.isArray(group.items), `Group ${group.title} must have items array`);

    group.items.forEach(item => {
      itemCount++;
      assert.ok(item.name, 'Item must have a name');
      if (item.price === null) {
        nullablePriceItems.push(item.name);
      } else {
        assert.ok(typeof item.price === 'number', `Item ${item.name} price must be number or null`);
      }
    });
  });
});

assert.strictEqual(groupCount, 11, 'Must have exactly 11 groups');
assert.strictEqual(itemCount, 57, 'Must have exactly 57 menu items');
assert.ok(nullablePriceItems.includes('Churros'), 'Churros must have nullable price (null)');
assert.ok(nullablePriceItems.includes('Soda'), 'Soda must have nullable price (null)');

console.log('✅ Menu Structure Verified: 8 sections, 11 groups, 57 items');
console.log('✅ Nullable Prices Verified:', nullablePriceItems);

// 2. Test Milk Shakes Layout Fix
const milkshakesSec = seedData.find(s => s.slug === 'milkshakes');
assert.ok(milkshakesSec, 'Milkshakes section must exist');
assert.strictEqual(milkshakesSec.layout_type, 'layout-balanced', 'Milkshakes must use layout-balanced');
assert.strictEqual(milkshakesSec.section_number, '08', 'Milkshakes must be section 08');

console.log('✅ Milk Shakes layout-balanced configuration verified');

// 3. Test Assets
const logoPath = path.resolve(__dirname, '../assets/logo.png');
const qrPath = path.resolve(__dirname, '../assets/qr.png');
assert.ok(fs.existsSync(logoPath), 'logo.png must exist');
assert.ok(fs.existsSync(qrPath), 'qr.png must exist');
assert.ok(fs.statSync(logoPath).size > 10000, 'logo.png must be non-empty valid image');
assert.ok(fs.statSync(qrPath).size > 10000, 'qr.png must be non-empty valid image');

console.log('✅ Decoded PNG Assets Verified (logo.png, qr.png)');

// 4. Test SQL Migrations
const schemaPath = path.resolve(__dirname, '../supabase/migrations/01_schema.sql');
const seedSqlPath = path.resolve(__dirname, '../supabase/migrations/02_seed.sql');
assert.ok(fs.existsSync(schemaPath), '01_schema.sql must exist');
assert.ok(fs.existsSync(seedSqlPath), '02_seed.sql must exist');

const schemaSql = fs.readFileSync(schemaPath, 'utf8');
assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.admin_profiles'), 'Must define admin_profiles');
assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.menu_sections'), 'Must define menu_sections');
assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.menu_groups'), 'Must define menu_groups');
assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.menu_items'), 'Must define menu_items');
assert.ok(schemaSql.includes('ENABLE ROW LEVEL SECURITY'), 'Must enable RLS');

console.log('✅ Supabase Migrations & RLS DDL Verified');

// 5. Test Public & Admin HTML Files
const publicHtmlPath = path.resolve(__dirname, '../index.html');
const adminHtmlPath = path.resolve(__dirname, '../admin/index.html');
assert.ok(fs.existsSync(publicHtmlPath), 'index.html must exist at repository root');
assert.ok(fs.existsSync(adminHtmlPath), 'admin/index.html must exist');

const publicHtml = fs.readFileSync(publicHtmlPath, 'utf8');
assert.ok(publicHtml.includes('href="#milkshakes"'), 'Navigation must include link to #milkshakes');
assert.ok(publicHtml.includes('id="main-menu"'), 'Must have dynamic main-menu container');

const adminHtml = fs.readFileSync(adminHtmlPath, 'utf8');
assert.ok(adminHtml.includes('id="auth-section"'), 'Admin must have auth view');
assert.ok(adminHtml.includes('id="admin-section"'), 'Admin must have dashboard view');
assert.ok(adminHtml.includes('id="item-modal"'), 'Admin must have item modal');

console.log('✅ HTML Markup & Nav Links Verified');

console.log('\n🎉 ALL AUTOMATED TESTS PASSED SUCCESSFULLY!\n');
