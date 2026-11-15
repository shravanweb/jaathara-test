/**
 * Chat-order state machine:
 * category → dish → (protein → style?) → spice → qty → more? → phone → name → address → confirm
 * Grouped dishes (Manchurian, Fried Rice, etc.) use the same grouping as the website menu.
 */

import { displayCategoryName, sortCategories } from './categoryOrder.js';
import { groupMenuDishes, parseSpiceText, normStyle } from './groupMenuDishes.js';
import { selectOptionLabel } from './optionLabel.js';
import { youWillEarnLabel } from './loyalty';

export const STEPS = {
  IDLE: 'idle',
  BROWSE: 'browse',
  ITEM_READY: 'item_ready',
  PROTEIN: 'awaiting_protein',
  STYLE: 'awaiting_style',
  SPICE: 'awaiting_spice',
  QTY: 'awaiting_quantity',
  MORE: 'awaiting_anything_else',
  PHONE: 'awaiting_phone',
  NAME: 'awaiting_name',
  ADDRESS: 'awaiting_address',
  CONFIRM: 'awaiting_order_confirm',
  COMPLETE: 'complete',
};

export function createEmptySession() {
  return {
    step: STEPS.IDLE,
    pendingItem: null,
    pendingGroup: null,
    pendingProtein: '',
    pendingStyle: '',
    pendingQty: null,
    cart: [],
    guest: { phone: '', name: '', address: '', notes: '' },
    menuConfig: null,
  };
}

function spiceEnabled(session) {
  return !session?.menuConfig || session.menuConfig.showSpice !== false;
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[.!?,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseQty(text) {
  const raw = String(text || '');
  const fromPrefix = raw.match(/^qty:\s*(\d{1,2})\b/i);
  const n = (fromPrefix ? fromPrefix[1] : null) || normalize(text).match(/\b(\d{1,2})\b/)?.[1];
  if (n) return Math.max(1, Math.min(20, Number(n)));
  if (/^(one|a|an|single)$/i.test(normalize(text))) return 1;
  if (/^two$/i.test(normalize(text))) return 2;
  if (/^three$/i.test(normalize(text))) return 3;
  return null;
}

function spiceLevelsFor(item, session) {
  if (session && !spiceEnabled(session)) return [];
  if (!item) return [];
  if (item.isGroup && Array.isArray(item.spiceLevels) && item.spiceLevels.length) return item.spiceLevels;
  if (item.spiceLevels?.length) return item.spiceLevels;
  return parseSpiceText(item.spicyLevel || item.spicy || '');
}

function parseSpice(text, allowed) {
  const q = normalize(String(text || '').replace(/^spice:/i, ''));
  const list = (allowed && allowed.length ? allowed : ['Mild', 'Medium', 'Spicy', 'Extra Spicy', 'Hot']).filter(Boolean);
  if (/^(no|none|skip|no spice|no preference|—|-)$/.test(q)) return '—';
  const exact = list.find((level) => normalize(level) === q);
  if (exact) return exact;
  // Prefer the longest label so "extra spicy" does not collapse to "spicy".
  const ranked = [...list].sort((a, b) => normalize(b).length - normalize(a).length);
  const hit = ranked.find((level) => q.includes(normalize(level)));
  if (hit) return hit;
  if (/\b(less spicy)\b/.test(q) && list.includes('Mild')) return 'Mild';
  if (/\b(normal)\b/.test(q) && list.includes('Medium')) return 'Medium';
  if (/\b(hot)\b/.test(q)) return list.find((l) => /extra|hot|spicy/i.test(l)) || null;
  return null;
}

function looksLikePhone(text) {
  const digits = String(text || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

const SEARCH_STOP = new Set(['show','me','all','the','your','any','have','you','want','some','item','items','list','please','what','which','types','type','of','get','can','give','see','options','menu','order','like','i']);

function singular(w) {
  return w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w;
}

function searchWords(text) {
  return normalize(String(text || '').replace(/^(dish|cat|protein|style):/i, ''))
    .split(' ')
    .map(singular)
    .filter((w) => w.length > 2 && !SEARCH_STOP.has(w));
}

export function prepareChatMenu(dishes) {
  const items = groupMenuDishes(dishes || []);
  const categories = sortCategories([...new Set(items.map((d) => d.category).filter(Boolean))]);
  return { items, categories };
}

function haystack(entry) {
  if (!entry) return '';
  if (entry.isGroup) {
    const bits = (entry.variants || []).map((v) => `${v.protein || ''} ${v.style || ''} ${v.item?.name || ''}`).join(' ');
    return normalize(`${entry.name} ${entry.category || ''} ${displayCategoryName(entry.category)} ${bits}`);
  }
  return normalize(`${entry.name} ${entry.category || ''} ${displayCategoryName(entry.category)}`);
}

function searchMenu(text, catalog) {
  const words = searchWords(text);
  if (!words.length || !catalog?.length) return [];
  return catalog.filter((entry) => {
    const hay = haystack(entry);
    return words.every((w) => hay.includes(w));
  });
}

function inferProtein(text, group) {
  if (!group?.proteins?.length) return '';
  const q = normalize(String(text || '').replace(/^(dish|protein):/i, ''));
  const hits = group.proteins.filter((p) => {
    const key = normalize(p);
    return q === key || q.includes(key) || new RegExp(`\\b${key}\\b`).test(q);
  });
  return hits.length === 1 ? hits[0] : '';
}

function inferStyle(text, group) {
  if (!group?.styles?.length) return '';
  const q = normalize(String(text || '').replace(/^style:/i, ''));
  const fromNorm = normStyle(q);
  if (fromNorm && group.styles.includes(fromNorm)) return fromNorm;
  const hits = group.styles.filter((s) => q === normalize(s) || q.includes(normalize(s)));
  return hits.length === 1 ? hits[0] : '';
}

function findById(catalog, id) {
  if (!id) return null;
  return (catalog || []).find((d) => d.id === id) || null;
}

function matchMenuItem(text, catalog) {
  const raw = String(text || '').replace(/^dish:/i, '').trim();
  if (!raw || !catalog?.length) return null;
  const byId = findById(catalog, raw);
  if (byId) {
    return { entry: byId, protein: inferProtein(raw, byId), style: inferStyle(raw, byId) };
  }
  const q = normalize(raw);

  for (const entry of catalog) {
    if (entry.isGroup) {
      const exactVar = (entry.variants || []).find((v) => normalize(v.item?.name) === q);
      if (exactVar) return { entry, protein: exactVar.protein, style: exactVar.style || '' };
    } else if (normalize(entry.name) === q) {
      return { entry };
    }
  }

  const named = catalog.filter((entry) => {
    const name = normalize(entry.name);
    return name && (q === name || q.includes(name) || name.includes(q));
  });
  if (named.length === 1) {
    const entry = named[0];
    return { entry, protein: inferProtein(raw, entry), style: inferStyle(raw, entry) };
  }

  const searched = searchMenu(raw, catalog);
  if (searched.length === 1) {
    const entry = searched[0];
    return { entry, protein: inferProtein(raw, entry), style: inferStyle(raw, entry) };
  }
  return null;
}

function toPendingGroup(group) {
  return {
    isGroup: true,
    id: group.id,
    name: group.name,
    category: group.category,
    desc: group.desc || group.description || '',
    spiceLevels: spiceLevelsFor(group),
    proteins: group.proteins || [],
    styles: group.styles || [],
    variants: (group.variants || []).map((v) => ({
      protein: v.protein,
      style: v.style || '',
      price: Number(v.price) || 0,
      veg: Boolean(v.veg),
      image: v.image || v.item?.image || '',
      itemId: v.item?.id || '',
      itemName: v.item?.name || `${v.protein} ${group.name}`.trim(),
    })),
  };
}

function variantOf(group, protein, style) {
  if (!group) return null;
  const hasStyles = (group.styles || []).length > 0;
  const exact = (group.variants || []).find(
    (v) => v.protein === protein && (!hasStyles || v.style === style),
  );
  if (exact) return exact;
  return (group.variants || []).find((v) => v.protein === protein) || null;
}

function imageForPending(group, protein, style) {
  const exact = variantOf(group, protein, style);
  if (exact?.image) return exact.image;
  const byProtein = (group.variants || []).find((v) => v.protein === protein && v.image);
  if (byProtein) return byProtein.image;
  return (group.variants || []).find((v) => v.image)?.image || '';
}

function priceForProtein(group, protein) {
  const prices = (group.variants || []).filter((v) => v.protein === protein).map((v) => v.price);
  return prices.length ? Math.min(...prices) : Math.min(...(group.variants || []).map((v) => v.price || 0));
}

function fromPrice(group) {
  const prices = (group.variants || []).map((v) => v.price).filter((n) => Number.isFinite(n));
  return prices.length ? Math.min(...prices) : 0;
}

function money(n) {
  return `$ ${Number(n || 0).toFixed(2)}`;
}

function dishAction(entry) {
  if (entry.isGroup) {
    return {
      id: `dish:${entry.id}`,
      label: entry.name,
      price: fromPrice(entry).toFixed(2),
      image: entry.image || entry.variants?.find((v) => v.image)?.image || entry.variants?.find((v) => v.item?.image)?.item?.image || '',
      veg: (entry.variants || []).every((v) => v.veg) ? true : undefined,
    };
  }
  return {
    id: `dish:${entry.id || entry.name}`,
    label: entry.name,
    price: Number(entry.priceValue || 0).toFixed(2),
    image: entry.image || '',
    veg: entry.veg === true ? true : undefined,
  };
}

function categoryActions(categories) {
  return (categories || []).map((c) => ({
    id: `cat:${c}`,
    label: displayCategoryName(c),
  }));
}

function dishesInCategory(catalog, category) {
  const key = normalize(category);
  return (catalog || []).filter((d) => normalize(d.category) === key);
}

function matchCategory(text, categories) {
  const raw = String(text || '').replace(/^cat:/i, '').trim();
  if (!raw) return null;
  const q = normalize(raw);
  const exact = (categories || []).find(
    (c) => normalize(c) === q || normalize(displayCategoryName(c)) === q,
  );
  if (exact) return exact;
  const hits = (categories || []).filter((c) => {
    const label = normalize(displayCategoryName(c));
    return label.includes(q) || q.includes(label);
  });
  return hits.length === 1 ? hits[0] : null;
}

function proteinActions(group) {
  return (group.proteins || []).map((protein) => ({
    id: `protein:${protein}`,
    label: protein,
    price: priceForProtein(group, protein).toFixed(2),
    veg: (group.variants || []).filter((v) => v.protein === protein).every((v) => v.veg),
    image: imageForPending(group, protein, ''),
  }));
}

function styleActions(group, protein) {
  return (group.styles || []).map((style) => {
    const v = variantOf(group, protein, style);
    return {
      id: `style:${style}`,
      label: style,
      price: (v?.price || priceForProtein(group, protein)).toFixed(2),
      image: imageForPending(group, protein, style),
      veg: v ? Boolean(v.veg) : undefined,
    };
  });
}

function spiceActions(levels) {
  const icons = ['🌶️', '🌶️🌶️', '🌶️🌶️🌶️', '🌶️🌶️🌶️🌶️'];
  const list = (levels || []).filter((l) => l && l !== '—');
  const actions = list.map((level, i) => ({
    id: `spice:${level}`,
    label: `${level} ${icons[Math.min(i, icons.length - 1)]}`,
  }));
  actions.push({ id: 'spice:—', label: 'No preference' });
  return actions;
}

function qtyActions() {
  return [
    { id: 'qty:1', label: '1' },
    { id: 'qty:2', label: '2' },
    { id: 'qty:3', label: '3' },
  ];
}

function isYes(text) {
  return /^(yes|yeah|yep|yup|y|ok|okay|sure|confirm|place order|place the order|order now|book|add)$/i.test(
    normalize(text),
  );
}

function isNoMore(text) {
  return /^(no|nope|nah|n|nothing|done|that's all|thats all|continue|review|checkout|place order)$/i.test(
    normalize(text),
  );
}

function isCancel(text) {
  return /^(cancel|stop|start over|reset|never ?mind)$/i.test(normalize(text));
}

function isMenuIntent(text) {
  return /^(menu|show menu|view menu|what.?s on the menu|other dishes|add more)$/i.test(normalize(text));
}

function isCheckoutLocked(step) {
  return step === STEPS.PHONE || step === STEPS.NAME || step === STEPS.ADDRESS || step === STEPS.CONFIRM;
}

function cartTotal(cart) {
  return cart.reduce((sum, line) => sum + Number(line.price) * Number(line.qty), 0);
}

function formatCart(cart, menuConfig) {
  if (!cart.length) return 'Your cart is empty.';
  const lines = cart.map(
    (l) =>
      `• ${l.name}${l.spicyLevel && l.spicyLevel !== '—' ? ` (${l.spicyLevel})` : ''} × ${l.qty} — $ ${(Number(l.price) * Number(l.qty)).toFixed(2)}`,
  );
  lines.push(`Total: $ ${cartTotal(cart).toFixed(2)}`);
  const earn = youWillEarnLabel(cartTotal(cart), menuConfig);
  if (earn) lines.push(earn);
  return lines.join('\n');
}

function pushCart(session, item, qty, spicyLevel) {
  const existing = session.cart.find(
    (l) => l.id === item.id && l.name === item.name && (l.spicyLevel || '—') === (spicyLevel || '—'),
  );
  if (existing) {
    existing.qty += qty;
  } else {
    session.cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.priceValue ?? item.price) || 0,
      qty,
      spicyLevel: spicyLevel || '—',
    });
  }
}

function resolvedCartItem(session) {
  const group = session.pendingGroup;
  if (group) {
    const variant = variantOf(group, session.pendingProtein, session.pendingStyle);
    if (!variant) return null;
    return {
      id: variant.itemId,
      name: variant.itemName,
      priceValue: variant.price,
      image: variant.image,
    };
  }
  return session.pendingItem;
}

function menuBrowseReply(catalog, categories) {
  return {
    reply: `Our menu, in this order. Tap a category, or type a dish name (for example “chicken manchurian”).`,
    actions: categoryActions(categories),
    listStyle: 'dishes',
  };
}

function categoryDishReply(catalog, category) {
  const rows = dishesInCategory(catalog, category);
  const label = displayCategoryName(category);
  if (!rows.length) {
    return { reply: `No dishes in ${label} just now. Pick another category.`, actions: categoryActions(prepareChatMenu([]).categories), listStyle: 'dishes' };
  }
  return {
    reply: `${label} — pick a dish:`,
    actions: rows.map(dishAction),
    listStyle: 'dishes',
  };
}

function proteinReply(group, session) {
  const from = fromPrice(group);
  return {
    reply: `${group.name} - starting at ${money(from)}.${group.desc ? `\n${group.desc}` : ''}\n\n${selectOptionLabel(session?.menuConfig?.variants?.label)}:`,
    actions: proteinActions(group),
    listStyle: 'dishes',
  };
}

function styleReply(group, protein) {
  return {
    reply: `${protein} ${group.name} — which style?`,
    actions: styleActions(group, protein),
    listStyle: 'dishes',
  };
}

function spiceReply(levels, itemName) {
  return {
    reply: `Spice level for ${itemName}?`,
    actions: spiceActions(levels),
  };
}

function qtyReply(itemName) {
  return {
    reply: `How many ${itemName}?`,
    actions: qtyActions(),
  };
}

function afterVariantChosen(session) {
  const item = resolvedCartItem(session);
  if (!item) {
    return { session, reply: 'I could not match that option. Please pick again.', actions: proteinActions(session.pendingGroup || { proteins: [] }), listStyle: 'dishes' };
  }
  const levels = spiceLevelsFor(session.pendingGroup, session);
  if (levels.length) {
    session.step = STEPS.SPICE;
    return { session, ...spiceReply(levels, item.name) };
  }
  session.step = STEPS.QTY;
  return { session, ...qtyReply(item.name) };
}

function beginGroup(session, group, protein, style) {
  session.pendingItem = null;
  session.pendingGroup = toPendingGroup(group);
  session.pendingProtein = protein || '';
  session.pendingStyle = style || '';
  session.pendingQty = null;
  const g = session.pendingGroup;
  if (!session.pendingProtein) {
    session.step = STEPS.PROTEIN;
    return { session, ...proteinReply(g, session) };
  }
  if ((g.styles || []).length && !session.pendingStyle) {
    session.pendingStyle = inferStyle(style, g);
    if (!session.pendingStyle) {
      session.step = STEPS.STYLE;
      return { session, ...styleReply(g, session.pendingProtein) };
    }
  }
  return afterVariantChosen(session);
}

function beginRegular(session, dish, { confirmFirst = true } = {}) {
  session.pendingGroup = null;
  session.pendingProtein = '';
  session.pendingStyle = '';
  session.pendingQty = null;
  session.pendingItem = {
    id: dish.id,
    name: dish.name,
    priceValue: Number(dish.priceValue) || 0,
    desc: dish.desc || dish.description || '',
    image: dish.image || '',
    veg: Boolean(dish.veg),
    spicyLevel: dish.spicyLevel || dish.spicy || '',
    spiceLevels: spiceLevelsFor(dish),
  };
  if (confirmFirst) {
    session.step = STEPS.ITEM_READY;
    return {
      session,
      reply: `${dish.name} — ${money(dish.priceValue)}${session.pendingItem.desc ? `\n${session.pendingItem.desc}` : ''}\n\nWould you like to order this?`,
      actions: [
        { id: 'book', label: 'Order now' },
        { id: 'menu', label: 'Other dishes' },
      ],
    };
  }
  session.step = STEPS.QTY;
  return { session, ...qtyReply(dish.name) };
}

function beginEntry(session, match, { confirmFirst } = {}) {
  if (!match?.entry) return null;
  if (match.entry.isGroup) {
    return beginGroup(session, match.entry, match.protein, match.style);
  }
  return beginRegular(session, match.entry, { confirmFirst: confirmFirst !== false });
}

/**
 * @returns {{ session, reply, actions?, listStyle?, readyToSubmit? }}
 */
export function advanceChatOrder(sessionIn, userText, dishes, menuConfig) {
  const session = structuredClone(sessionIn || createEmptySession());
  if (menuConfig !== undefined) session.menuConfig = menuConfig;
  const text = String(userText || '').trim();
  const { items: catalog, categories } = prepareChatMenu(dishes);

  if (!text) {
    return { session, reply: 'Say a dish name, or tap Show menu.', actions: [{ id: 'menu', label: 'Show menu' }] };
  }

  if (isCancel(text)) {
    const cleared = createEmptySession();
    return {
      session: cleared,
      reply: 'Order cancelled. Tell me a dish whenever you’re ready, or ask to see the menu.',
      actions: [
        { id: 'menu', label: 'Show menu' },
        { id: 'order', label: 'Start order' },
      ],
    };
  }

  if (isMenuIntent(text) && !isCheckoutLocked(session.step)) {
    if (session.step === STEPS.ITEM_READY || session.step === STEPS.PROTEIN || session.step === STEPS.STYLE || session.step === STEPS.SPICE || session.step === STEPS.QTY) {
      if (!session.cart.length) {
        session.step = STEPS.IDLE;
        session.pendingItem = null;
        session.pendingGroup = null;
      } else {
        session.step = STEPS.MORE;
        session.pendingItem = null;
        session.pendingGroup = null;
      }
    }
    return { session, ...menuBrowseReply(catalog, categories) };
  }

  if (text.toLowerCase().startsWith('cat:') && !isCheckoutLocked(session.step)) {
    const category = matchCategory(text, categories);
    if (!category) {
      return { session, reply: 'I could not find that category. Pick one from the list.', actions: categoryActions(categories), listStyle: 'dishes' };
    }
    if (!session.cart.length && (session.step === STEPS.IDLE || session.step === STEPS.COMPLETE || session.step === STEPS.BROWSE)) {
      session.step = STEPS.BROWSE;
    }
    return { session, ...categoryDishReply(catalog, category) };
  }

  const handlePick = (confirmFirst) => {
    const match = matchMenuItem(text, catalog);
    if (match) return beginEntry(session, match, { confirmFirst });
    const multi = searchMenu(text, catalog);
    if (multi.length >= 2) {
      return {
        session,
        reply: `We have ${multi.length} options for “${String(text).replace(/^dish:/i, '').trim()}”. Tap one to order:`,
        actions: multi.map(dishAction),
        listStyle: 'dishes',
      };
    }
    const category = matchCategory(text, categories);
    if (category) return { session, ...categoryDishReply(catalog, category) };
    return null;
  };

  if (session.step === STEPS.IDLE || session.step === STEPS.COMPLETE || session.step === STEPS.BROWSE) {
    if (/^(hi|hello|hey|order|start|start order|i want to order)$/i.test(normalize(text))) {
      session.step = STEPS.IDLE;
      return {
        session,
        reply: 'Welcome to Jaathara. What would you like to order? Say a dish name, or tap Show menu.',
        actions: [
          { id: 'menu', label: 'Show menu' },
          ...categories.slice(0, 4).map((c) => ({ id: `cat:${c}`, label: displayCategoryName(c) })),
        ],
      };
    }
    const picked = handlePick(true);
    if (picked) return picked;
    return {
      session,
      reply: 'Tell me a dish from our menu (for example “Gobi Manchurian”), or tap Show menu.',
      actions: [{ id: 'menu', label: 'Show menu' }],
    };
  }

  if (session.step === STEPS.PROTEIN) {
    const group = session.pendingGroup;
    let protein = String(text).replace(/^protein:/i, '').trim();
    if (protein) {
      const exact = (group.proteins || []).find((p) => normalize(p) === normalize(protein));
      protein = exact || inferProtein(text, group);
    }
    if (!protein) {
      const switched = handlePick(false);
      if (switched) return switched;
      return { session, reply: selectOptionLabel(session?.menuConfig?.variants?.label) + '.', actions: proteinActions(group), listStyle: 'dishes' };
    }
    session.pendingProtein = protein;
    if ((group.styles || []).length) {
      session.step = STEPS.STYLE;
      return { session, ...styleReply(group, protein) };
    }
    return afterVariantChosen(session);
  }

  if (session.step === STEPS.STYLE) {
    const group = session.pendingGroup;
    let style = String(text).replace(/^style:/i, '').trim();
    const exact = (group.styles || []).find((s) => normalize(s) === normalize(style));
    style = exact || inferStyle(text, group);
    if (!style) {
      const switched = handlePick(false);
      if (switched) return switched;
      return { session, reply: 'Please pick a style.', actions: styleActions(group, session.pendingProtein), listStyle: 'dishes' };
    }
    session.pendingStyle = style;
    return afterVariantChosen(session);
  }

  if (session.step === STEPS.ITEM_READY) {
    if (isYes(text) || /^(order now|book|add)$/i.test(normalize(text))) {
      session.step = STEPS.QTY;
      return { session, ...qtyReply(session.pendingItem.name) };
    }
    const switched = handlePick(true);
    if (switched) return switched;
    session.step = STEPS.QTY;
    return { session, ...qtyReply(session.pendingItem.name) };
  }

  if (session.step === STEPS.SPICE) {
    const levels = spiceLevelsFor(session.pendingGroup || session.pendingItem, session);
    const spice = parseSpice(text, levels) || (normalize(text).startsWith('spice:') ? '—' : null);
    if (!spice) {
      return { session, reply: 'Please pick a spice level.', actions: spiceActions(levels) };
    }
    // Grouped dishes ask spice before quantity.
    if (session.pendingGroup) {
      session.pendingSpice = spice;
      session.step = STEPS.QTY;
      const item = resolvedCartItem(session);
      return { session, ...qtyReply(item?.name || 'that') };
    }
    // Regular dishes already have a quantity.
    pushCart(session, session.pendingItem, session.pendingQty || 1, spice);
    session.pendingItem = null;
    session.pendingQty = null;
    session.step = STEPS.MORE;
    return {
      session,
      reply: `${formatCart(session.cart, session.menuConfig)}\n\nAnything else?`,
      actions: [
        { id: 'more:no', label: 'Checkout' },
        { id: 'menu', label: 'Add more' },
      ],
    };
  }

  if (session.step === STEPS.QTY) {
    const qty = parseQty(text) || (isYes(text) ? 1 : null);
    if (!qty) return { session, reply: 'Please reply with a number (1–20).', actions: qtyActions() };

    // Grouped dishes already asked spice before qty. Regular dishes ask spice after qty (existing flow).
    if (session.pendingGroup) {
      const item = resolvedCartItem(session);
      if (!item) return { session, reply: selectOptionLabel(session?.menuConfig?.variants?.label) + ' first.', actions: proteinActions(session.pendingGroup), listStyle: 'dishes' };
      pushCart(session, item, qty, session.pendingSpice || '—');
      session.pendingItem = null;
      session.pendingGroup = null;
      session.pendingProtein = '';
      session.pendingStyle = '';
      session.pendingQty = null;
      session.pendingSpice = null;
      session.step = STEPS.MORE;
      return {
        session,
        reply: `${formatCart(session.cart, session.menuConfig)}\n\nAnything else?`,
        actions: [
          { id: 'more:no', label: 'Checkout' },
          { id: 'menu', label: 'Add more' },
        ],
      };
    }

    session.pendingQty = qty;
    const levels = spiceLevelsFor(session.pendingItem, session);
    if (levels.length) {
      session.step = STEPS.SPICE;
      return { session, ...spiceReply(levels, session.pendingItem.name) };
    }
    pushCart(session, session.pendingItem, qty, '—');
    session.pendingItem = null;
    session.pendingQty = null;
    session.step = STEPS.MORE;
    return {
      session,
      reply: `${formatCart(session.cart, session.menuConfig)}\n\nAnything else?`,
      actions: [
        { id: 'more:no', label: 'Checkout' },
        { id: 'menu', label: 'Add more' },
      ],
    };
  }

  if (session.step === STEPS.MORE) {
    if (isNoMore(text) || /checkout|review/i.test(normalize(text))) {
      session.step = STEPS.PHONE;
      return {
        session,
        reply: `${formatCart(session.cart, session.menuConfig)}\n\nWhat’s your phone number?`,
      };
    }
    const picked = handlePick(false);
    if (picked) return picked;
    return {
      session,
      reply: 'Say another dish name, or tap Checkout when you’re ready.',
      actions: [
        { id: 'more:no', label: 'Checkout' },
        { id: 'menu', label: 'Show menu' },
      ],
    };
  }

  if (session.step === STEPS.PHONE) {
    if (!looksLikePhone(text)) {
      return { session, reply: 'Please share a valid phone number (10+ digits).' };
    }
    session.guest.phone = text.replace(/\s+/g, ' ').trim();
    session.step = STEPS.NAME;
    return { session, reply: 'And your name?' };
  }

  if (session.step === STEPS.NAME) {
    if (text.length < 2) return { session, reply: 'Please enter your name.' };
    session.guest.name = text;
    session.step = STEPS.ADDRESS;
    return {
      session,
      reply: 'Delivery address, or type “pickup” for takeaway at our Sandy, Utah restaurant.',
    };
  }

  if (session.step === STEPS.ADDRESS) {
    if (text.length < 3) return { session, reply: 'Please enter an address or “pickup”.' };
    session.guest.address = /pickup|takeaway|collect/i.test(text) ? 'Pickup at Sandy, Utah' : text;
    session.step = STEPS.CONFIRM;
    return {
      session,
      reply: `${formatCart(session.cart, session.menuConfig)}\n\n${session.guest.name} · ${session.guest.phone}\n${session.guest.address}\n\nPlace this order?`,
      actions: [
        { id: 'confirm:yes', label: 'Place order' },
        { id: 'cancel', label: 'Cancel' },
      ],
    };
  }

  if (session.step === STEPS.CONFIRM) {
    if (isYes(text) || /place order/i.test(normalize(text))) {
      return {
        session,
        reply: 'Placing your order with the restaurant…',
        readyToSubmit: true,
      };
    }
    if (isCancel(text) || /^no$/i.test(normalize(text))) {
      const cleared = createEmptySession();
      return { session: cleared, reply: 'Okay — order not placed. Say a dish when you’re ready.' };
    }
    return {
      session,
      reply: 'Reply Place order to confirm, or Cancel to stop.',
      actions: [
        { id: 'confirm:yes', label: 'Place order' },
        { id: 'cancel', label: 'Cancel' },
      ],
    };
  }

  return {
    session,
    reply: 'I’m here to take your order. Say a dish name or tap Show menu.',
    actions: [{ id: 'menu', label: 'Show menu' }],
  };
}

export function buildOrderPayload(session) {
  return {
    externalId: `jaathara-chat-${Date.now()}`,
    customerName: session.guest.name,
    customerPhone: session.guest.phone,
    customerAddress: session.guest.address,
    notes: session.guest.notes || 'Ordered via website chat',
    lineItems: session.cart.map((l) => ({
      menuItemId: l.id || undefined,
      id: l.id || undefined,
      name: l.name,
      qty: l.qty,
      price: l.price,
      spicyLevel: l.spicyLevel,
    })),
  };
}

export { displayCategoryName };
