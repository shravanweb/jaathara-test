const GROUPED_CATEGORIES = {
  'Fried Rice': { base: 'Fried Rice', desc: 'Aromatic rice stir-fried with fresh vegetables and Indo-Chinese flavours.' },
  // A couple of egg noodle items are named "Egg Fried Rice" in admin, so Noodles also accepts that name.
  Noodles: { base: 'Hakka Noodles', match: 'Hakka Noodles|Fried Rice', desc: 'Wok-tossed Hakka noodles with crisp vegetables and bold Indo-Chinese sauces.' },
  'Manchurian Special': { base: 'Manchurian', proteinOnly: true, desc: 'Crisp-fried and tossed in a tangy Indo-Chinese Manchurian sauce.' },
  Chilli: { base: 'Chilli', proteinOnly: true, desc: 'Wok-tossed in a spicy chilli sauce, made to order.' },
  Karampodi: { base: 'Karampodi', proteinOnly: true, desc: 'Tossed with fiery Andhra karampodi, made to order.' },
  Karvepaku: { base: 'Karvepaku', proteinOnly: true, desc: 'Tempered with curry leaves, made to order.' },
  'Cashew Sauce': { base: 'Cashew Sauce', proteinOnly: true, desc: 'Tossed in a rich cashew sauce, made to order.' },
  'Ghee Roast': { base: 'Ghee Roast', proteinOnly: true, desc: 'Roasted in ghee with roast spices, made to order.' },
  'Pepper Fry': { base: 'Pepper Fry', proteinOnly: true, desc: 'Peppery and wok-fried, made to order.' },
};

const STYLE_ORDER = ['Regular', 'Schezwan', 'Street Style'];
const PROTEIN_ORDER = ['Veg', 'Gobi', 'Egg', 'Paneer', 'Chicken', 'Fish', 'Shrimp', 'Prawn', 'Lamb', 'Goat'];

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function titleCaseWords(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** "Veg Veg Manchurian" -> "Veg Manchurian" */
function collapseDuplicateLeadingWords(name) {
  return String(name || '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(\S+)(?:\s+\1)+\b/i, '$1');
}

function groupedCategoryConfig(category) {
  const raw = String(category || '').trim().toLowerCase();
  if (!raw) return null;
  const entries = Object.entries(GROUPED_CATEGORIES);
  const exact = entries.find(([key]) => key.toLowerCase() === raw);
  if (exact) return exact[1];
  const stripped = raw.replace(/\s+specials?$/, '').trim();
  if (stripped && stripped !== raw) {
    const byKey = entries.find(
      ([key, cfg]) => key.toLowerCase() === stripped || String(cfg.base).toLowerCase() === stripped,
    );
    if (byKey) return byKey[1];
  }
  return null;
}

function normStyle(raw) {
  if (/street/i.test(raw)) return 'Street Style';
  if (/schez/i.test(raw)) return 'Schezwan';
  if (/regular/i.test(raw)) return 'Regular';
  return '';
}

function parseSpiceText(text) {
  return String(text || '').split(',').map((t) => {
    const v = t.trim().toLowerCase().replace(/\s+/g, ' ');
    if (v === 'mild') return 'Mild';
    if (v === 'medium') return 'Medium';
    if (v === 'spicy' || v === 'hot') return 'Spicy';
    if (v.startsWith('extra')) return 'Extra Spicy';
    return '';
  }).filter(Boolean);
}


function variantImage(variants, protein, style, fallback) {
  const has = (v) => Boolean(v && v.image);
  const exact = variants.find((v) => has(v) && (!protein || v.protein === protein) && (!style || v.style === style));
  if (exact) return exact.image;
  if (protein) {
    const byProtein = variants.find((v) => has(v) && v.protein === protein);
    if (byProtein) return byProtein.image;
  }
  if (style) {
    const byStyle = variants.find((v) => has(v) && v.style === style);
    if (byStyle) return byStyle.image;
  }
  return fallback || variants.find((v) => has(v))?.image || '';
}

function addGroupedVariant(groups, out, d, cfg, protein, style) {
  const key = String(d.category || '').trim().toLowerCase();
  let g = groups[key];
  if (!g) {
    g = {
      isGroup: true,
      id: `group-${d.category}`,
      name: cfg.base,
      category: d.category,
      desc: cfg.desc,
      image: '',
      variants: [],
      spiceLevels: [],
    };
    groups[key] = g;
    out.push(g);
  }
  if (!g.image && d.image) g.image = d.image;
  if (!g.spiceLevels.length) g.spiceLevels = parseSpiceText(d.spicyLevel);
  g.variants.push({ protein, style, price: d.priceValue, veg: d.veg, image: d.image || '', item: d });
}

function groupMenuDishes(list) {
  const out = [];
  const groups = {};
  (list || []).forEach((d) => {
    const cfg = groupedCategoryConfig(d.category);
    if (cfg) {
      const n = collapseDuplicateLeadingWords(d.name);
      if (cfg.proteinOnly) {
        const base = cfg.match || cfg.base;
        const re = new RegExp(`^(.*?)\\s+(${escapeRegExp(base)})\\s*$`, 'i');
        const m = n.match(re);
        if (m && m[1].trim()) {
          const protein = titleCaseWords(m[1].trim());
          addGroupedVariant(groups, out, d, cfg, protein, '');
          return;
        }
      } else {
        const re = new RegExp(`^(.*?)\\s*(?:${cfg.match || cfg.base})\\s*[–—-]?\\s*(.*)$`, 'i');
        const m = n.match(re);
        const style = m ? normStyle(m[2]) : '';
        if (m && style && m[1]) {
          const protein = m[1].trim().toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
          addGroupedVariant(groups, out, d, cfg, protein, style);
          return;
        }
      }
    }
    out.push(d);
  });
  Object.values(groups).forEach((g) => {
    const ord = (arr, order) => [...new Set(arr)].sort((a, b) => (order.indexOf(a) + 1 || 99) - (order.indexOf(b) + 1 || 99));
    g.styles = ord(g.variants.map((v) => v.style).filter(Boolean), STYLE_ORDER);
    g.proteins = ord(g.variants.map((v) => v.protein), PROTEIN_ORDER);
    g.fromPrice = (style) => Math.min(...g.variants.filter((v) => !style || v.style === style).map((v) => v.price));
    g.priceForProtein = (protein) => {
      const prices = g.variants.filter((v) => v.protein === protein).map((v) => v.price);
      return prices.length ? Math.min(...prices) : g.fromPrice();
    };
    g.imageFor = (protein, style) => variantImage(g.variants, protein, style, g.image);
    const firstWithImage = g.variants.find((v) => v.image);
    g.defaultProtein = (firstWithImage && firstWithImage.protein) || g.proteins[0] || '';
    if (!g.image) g.image = g.variants.find((v) => v.image)?.image || '';
  });
  return out;
}

export {
  GROUPED_CATEGORIES,
  STYLE_ORDER,
  PROTEIN_ORDER,
  collapseDuplicateLeadingWords,
  groupedCategoryConfig,
  groupMenuDishes,
  normStyle,
  parseSpiceText,
  variantImage,
};
