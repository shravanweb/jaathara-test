/** Excel menu category order. Matching is case-insensitive; unknown categories go last. */
const CATEGORY_ORDER = [
  'Soups',
  'Appetizers',
  'Manchurian Special',
  'Chilli Special',
  'Karampodi Special',
  'Karvepaku (Curry Leaves)',
  'Cashew Sauce',
  'Ghee Roast',
  'Pepper Fry',
  'Tandoori',
  'Dosas',
  'Pasta',
  'Veg Entrees',
  'Egg Entrees',
  'Chicken Entrees',
  'Goat Entrees',
  'Lamb Entrees',
  'Seafood Entrees',
  'Biryani',
  'Fried Rice',
  'Noodles',
  'Kids Menu',
  'Breads',
  'Desserts',
  'Beverages',
];

const ALIASES = {
  "dosa": "dosas",
  "dosa ( savory crepe )": "dosas",
  "dosa (savory crepe)": "dosas",
  "biryani's": "biryani",
  "biryanis": "biryani",
  "veg biryani's": "biryani",
  "veg biryanis": "biryani",
  "egg biryani": "biryani",
  "chicken biryani's": "biryani",
  "chicken biryanis": "biryani",
  "goat biryani": "biryani",
  "lamb biryani": "biryani",
  "shrimp biryani's": "biryani",
  "shrimp biryanis": "biryani",
  "street style fried rice": "fried rice",
  "street style noodles": "noodles",
};

function categoryKey(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ');
}

const ORDER_INDEX = new Map();
CATEGORY_ORDER.forEach((label, i) => {
  ORDER_INDEX.set(categoryKey(label), i);
});

function canonicalCategoryKey(name) {
  const key = categoryKey(name);
  return ALIASES[key] || key;
}

function categoryRank(name) {
  const key = canonicalCategoryKey(name);
  const direct = ORDER_INDEX.get(key);
  if (direct != null) return direct;
  // "MANCHURIAN SPECIAL" already keys to "manchurian special"
  return CATEGORY_ORDER.length + 1;
}

function sortCategories(categories) {
  return [...new Set((categories || []).filter(Boolean))].sort((a, b) => {
    const d = categoryRank(a) - categoryRank(b);
    if (d) return d;
    return String(a).localeCompare(String(b));
  });
}

function sortMenuItems(items) {
  return [...(items || [])].sort((a, b) => {
    const d = categoryRank(a.category) - categoryRank(b.category);
    if (d) return d;
    return String(a.name || '').localeCompare(String(b.name || ''));
  });
}

function titleCaseCategory(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase());
}

/** Official Excel label when known, otherwise title case (e.g. "MANCHURIAN SPECIAL" → "Manchurian Special"). */
function displayCategoryName(name) {
  const key = canonicalCategoryKey(name);
  const official = CATEGORY_ORDER.find((label) => categoryKey(label) === key);
  if (official) return official;
  return titleCaseCategory(name);
}

export {
  CATEGORY_ORDER,
  categoryKey,
  categoryRank,
  canonicalCategoryKey,
  displayCategoryName,
  sortCategories,
  sortMenuItems,
};
