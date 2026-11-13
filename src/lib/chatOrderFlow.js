/**
 * Lightweight chat-order state machine (Website Builder–style):
 * dish → qty → spice → more? → phone → name → address → confirm → submit
 */

export const STEPS = {
  IDLE: 'idle',
  ITEM_READY: 'item_ready',
  QTY: 'awaiting_quantity',
  SPICE: 'awaiting_spice',
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
    cart: [],
    guest: { phone: '', name: '', address: '', notes: '' },
  };
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[.!?,]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseQty(text) {
  const n = normalize(text).match(/\b(\d{1,2})\b/);
  if (n) return Math.max(1, Math.min(20, Number(n[1])));
  if (/^(one|a|an|single)$/i.test(normalize(text))) return 1;
  if (/^two$/i.test(normalize(text))) return 2;
  if (/^three$/i.test(normalize(text))) return 3;
  return null;
}

function parseSpice(text) {
  const q = normalize(text);
  if (/\b(mild|less spicy)\b/.test(q)) return 'Mild';
  if (/\b(medium|normal)\b/.test(q)) return 'Medium';
  if (/\b(hot|spicy|extra spicy)\b/.test(q)) return 'Hot';
  if (/^(no|none|skip|no spice)$/.test(q)) return '—';
  return null;
}

function looksLikePhone(text) {
  const digits = String(text || '').replace(/\D/g, '');
  return digits.length >= 10 && digits.length <= 15;
}

function matchMenuItem(text, dishes) {
  const q = normalize(text);
  if (!q || !dishes?.length) return null;

  const scored = dishes
    .map((dish) => {
      const name = normalize(dish.name);
      if (!name) return null;
      if (q === name || q.includes(name) || name.includes(q)) {
        return { dish, score: 100 + name.length };
      }
      const tokens = name.split(' ').filter((t) => t.length > 2);
      const hits = tokens.filter((t) => q.includes(t)).length;
      if (hits >= Math.min(2, tokens.length) || (tokens.length === 1 && hits === 1)) {
        return { dish, score: hits * 20 + name.length };
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.dish || null;
}

function isYes(text) {
  return /^(yes|yeah|yep|yup|y|ok|okay|sure|confirm|place order|place the order)$/i.test(
    normalize(text)
  );
}

function isNoMore(text) {
  return /^(no|nope|nah|n|nothing|done|that's all|thats all|continue|review|checkout|place order)$/i.test(
    normalize(text)
  );
}

function isCancel(text) {
  return /^(cancel|stop|start over|reset|never ?mind)$/i.test(normalize(text));
}

function cartTotal(cart) {
  return cart.reduce((sum, line) => sum + Number(line.price) * Number(line.qty), 0);
}

function formatCart(cart) {
  if (!cart.length) return 'Your cart is empty.';
  const lines = cart.map(
    (l) =>
      `• ${l.name}${l.spicyLevel && l.spicyLevel !== '—' ? ` (${l.spicyLevel})` : ''} × ${l.qty} — $ ${l.price * l.qty}`
  );
  lines.push(`Total: $ ${cartTotal(cart).toFixed(0)}`);
  return lines.join('\n');
}

function pushCart(session, item, qty, spicyLevel) {
  const existing = session.cart.find(
    (l) => l.name === item.name && (l.spicyLevel || '—') === (spicyLevel || '—')
  );
  if (existing) {
    existing.qty += qty;
  } else {
    session.cart.push({
      id: item.id,
      name: item.name,
      price: Number(item.priceValue) || 0,
      qty,
      spicyLevel: spicyLevel || '—',
    });
  }
}

/**
 * @returns {{ session, reply, actions?, readyToSubmit? }}
 */
export function advanceChatOrder(sessionIn, userText, dishes) {
  const session = structuredClone(sessionIn || createEmptySession());
  const text = String(userText || '').trim();
  const actions = [];

  if (!text) {
    return { session, reply: 'Say a dish name, or tap Order to begin.', actions };
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

  // Quick intents from chips / free text
  if (/^(menu|show menu|view menu|what.?s on the menu)$/i.test(normalize(text))) {
    const cats = [...new Set((dishes || []).map((d) => d.category).filter(Boolean))];
    const preview = (dishes || [])
      .slice(0, 8)
      .map((d) => `• ${d.name} — $ ${d.priceValue}`)
      .join('\n');
    return {
      session,
      reply: `Here’s a taste of our menu${cats.length ? ` (${cats.slice(0, 4).join(', ')})` : ''}:\n${preview || 'Menu is loading from Restaurant Admin…'}\n\nSay a dish name to order.`,
      actions: (dishes || []).slice(0, 4).map((d) => ({ id: `dish:${d.name}`, label: d.name })),
    };
  }

  if (session.step === STEPS.IDLE || session.step === STEPS.COMPLETE) {
    if (/^(hi|hello|hey|order|start|i want to order)$/i.test(normalize(text))) {
      session.step = STEPS.IDLE;
      return {
        session,
        reply: 'Welcome to Jaathara. What would you like to order? Say a dish name, or tap Show menu.',
        actions: [
          { id: 'menu', label: 'Show menu' },
          ...(dishes || []).slice(0, 3).map((d) => ({ id: `dish:${d.name}`, label: d.name })),
        ],
      };
    }
    const dish = matchMenuItem(text, dishes);
    if (dish) {
      session.pendingItem = dish;
      session.step = STEPS.ITEM_READY;
      return {
        session,
        reply: `${dish.name} — $ ${dish.priceValue}${dish.desc ? `\n${dish.desc}` : ''}\n\nWould you like to order this?`,
        actions: [
          { id: 'book', label: 'Order now' },
          { id: 'menu', label: 'Other dishes' },
        ],
      };
    }
    return {
      session,
      reply: 'Tell me a dish from our menu (for example “Hyderabadi Dum Biryani”), or tap Show menu.',
      actions: [{ id: 'menu', label: 'Show menu' }],
    };
  }

  if (session.step === STEPS.ITEM_READY) {
    if (isYes(text) || /^(order now|book|add)$/i.test(normalize(text))) {
      session.step = STEPS.QTY;
      return { session, reply: `How many ${session.pendingItem.name}?`, actions: [
        { id: 'qty:1', label: '1' },
        { id: 'qty:2', label: '2' },
        { id: 'qty:3', label: '3' },
      ] };
    }
    const other = matchMenuItem(text, dishes);
    if (other) {
      session.pendingItem = other;
      return {
        session,
        reply: `Switched to ${other.name} — $ ${other.priceValue}. Order this?`,
        actions: [{ id: 'book', label: 'Order now' }],
      };
    }
    session.step = STEPS.QTY;
    return { session, reply: `How many ${session.pendingItem.name}?` };
  }

  if (session.step === STEPS.QTY) {
    const qty = parseQty(text) || (isYes(text) ? 1 : null);
    if (!qty) return { session, reply: 'Please reply with a number (1–20).' };
    session.pendingQty = qty;
    session.step = STEPS.SPICE;
    return {
      session,
      reply: 'Spice level?',
      actions: [
        { id: 'spice:Mild', label: 'Mild' },
        { id: 'spice:Medium', label: 'Medium' },
        { id: 'spice:Hot', label: 'Hot' },
        { id: 'spice:—', label: 'No preference' },
      ],
    };
  }

  if (session.step === STEPS.SPICE) {
    const spice = parseSpice(text) || (text.length < 12 ? text : null) || '—';
    pushCart(session, session.pendingItem, session.pendingQty || 1, spice);
    session.pendingItem = null;
    session.pendingQty = null;
    session.step = STEPS.MORE;
    return {
      session,
      reply: `${formatCart(session.cart)}\n\nAnything else?`,
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
        reply: `${formatCart(session.cart)}\n\nWhat’s your phone number?`,
      };
    }
    const dish = matchMenuItem(text, dishes);
    if (dish) {
      session.pendingItem = dish;
      session.step = STEPS.QTY;
      return {
        session,
        reply: `Adding ${dish.name} — $ ${dish.priceValue}. How many?`,
        actions: [
          { id: 'qty:1', label: '1' },
          { id: 'qty:2', label: '2' },
        ],
      };
    }
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
      reply: `${formatCart(session.cart)}\n\n${session.guest.name} · ${session.guest.phone}\n${session.guest.address}\n\nPlace this order?`,
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
      name: l.name,
      qty: l.qty,
      price: l.price,
      spicyLevel: l.spicyLevel,
    })),
  };
}
