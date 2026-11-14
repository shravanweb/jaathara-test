import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LoaderCircle, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react';
import { createOrder } from '../lib/restaurantApi';
import { parseSpiceText } from '../lib/groupMenuDishes';

function lineKey(item) {
  const spice = item.spicyLevel && item.spicyLevel !== '—' ? item.spicyLevel : '';
  return `${item.id || item.name}::${spice}`;
}

function defaultSpice(dish) {
  const levels = parseSpiceText(dish?.spicyLevel);
  return levels[0] || '';
}

export default function OrderModal({ open, onClose, onSuccess, onError, dishes, prefill, onPrefillConsumed }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [dishQuery, setDishQuery] = useState('');
  const consumedPrefill = useRef(null);

  const orderable = useMemo(
    () =>
      (dishes || []).filter(
        (d) => Number(d.priceValue) > 0 && d.available !== false && !d.isGroup
      ),
    [dishes]
  );

  const addLine = (item) => {
    const spicyLevel = item.spicyLevel && item.spicyLevel !== '—' ? item.spicyLevel : (item.spicyLevel === '—' ? '' : item.spicyLevel);
    const normalized = {
      id: item.id,
      name: item.name,
      price: Number(item.priceValue ?? item.price) || 0,
      qty: Math.max(1, Math.min(20, Number(item.qty) || 1)),
      spicyLevel: spicyLevel || '',
    };
    const key = lineKey(normalized);
    setLines((prev) => {
      const existing = prev.find((l) => l.key === key);
      if (existing) {
        return prev.map((l) => (l.key === key ? { ...l, qty: Math.min(20, l.qty + normalized.qty) } : l));
      }
      return [...prev, { ...normalized, key }];
    });
  };

  useEffect(() => {
    if (!open || !prefill || !prefill.name) return undefined;
    const stamp = prefill._t || `${prefill.id || prefill.name}:${prefill.spicyLevel || ''}:${prefill.qty || 1}`;
    if (consumedPrefill.current === stamp) return undefined;
    consumedPrefill.current = stamp;
    addLine(prefill);
    onPrefillConsumed?.();
    return undefined;
  }, [open, prefill]);

  const lineItems = lines.filter((l) => l.qty > 0);

  const query = dishQuery.trim().toLowerCase();
  const suggestions = query
    ? orderable
        .filter((d) => `${d.name} ${d.category || ''}`.toLowerCase().includes(query))
        .slice(0, 8)
    : [];
  const pickDish = (dish) => {
    addLine({
      id: dish.id,
      name: dish.name,
      priceValue: dish.priceValue,
      qty: 1,
      spicyLevel: defaultSpice(dish),
    });
    setDishQuery('');
  };

  const total = lineItems.reduce((sum, li) => sum + li.price * li.qty, 0);

  if (!open) return null;

  const setQty = (key, next) => {
    const qty = Math.max(0, Math.min(20, next));
    setLines((prev) => {
      if (qty < 1) return prev.filter((l) => l.key !== key);
      return prev.map((l) => (l.key === key ? { ...l, qty } : l));
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!lineItems.length) {
      setLocalError('Add at least one dish to the order.');
      return;
    }
    setSubmitting(true);
    setLocalError('');
    try {
      const result = await createOrder({
        externalId: `jaathara-web-${Date.now()}`,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),
        notes: notes.trim(),
        lineItems: lineItems.map((l) => ({
          menuItemId: l.id || undefined,
          id: l.id || undefined,
          name: l.name,
          qty: l.qty,
          price: l.price,
          spicyLevel: l.spicyLevel || undefined,
        })),
      });
      onSuccess?.(
        result.code
          ? `Order placed · ${result.code}`
          : 'Order placed — check Restaurant Admin → Orders'
      );
      setLines([]);
      onClose?.();
    } catch (err) {
      const message = err.message || 'Order failed';
      setLocalError(message);
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel modal-panel-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <div>
            <span className="eyebrow">Takeaway</span>
            <h2 id="order-title">Order Online</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="modal-form" onSubmit={submit}>
          <div className="order-picker">
            <span className="otp-label">Add dishes</span>
            <div className="order-search">
              <Search size={15} aria-hidden="true" />
              <input
                value={dishQuery}
                onChange={(e) => setDishQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (suggestions[0]) pickDish(suggestions[0]);
                  }
                }}
                placeholder="Search a dish, e.g. biryani"
                aria-label="Search dishes to add"
                autoComplete="off"
              />
              {dishQuery && (
                <button type="button" onClick={() => setDishQuery('')} aria-label="Clear search"><X size={14} /></button>
              )}
            </div>
            {query && (
              <ul className="order-suggestions" role="listbox">
                {suggestions.length ? suggestions.map((dish) => (
                  <li key={dish.id || dish.name}>
                    <button type="button" onClick={() => pickDish(dish)}>
                      <span>
                        <strong>{dish.name}</strong>
                        {dish.category && <small>{dish.category}</small>}
                      </span>
                      <em>$ {dish.priceValue}</em>
                      <Plus size={14} />
                    </button>
                  </li>
                )) : <li className="order-suggestions-empty">No dishes found</li>}
              </ul>
            )}
            {lineItems.length > 0 ? (
              <div className="order-dish-list order-cart">
                {lineItems.map((li) => (
                  <div className="order-dish-row" key={li.key}>
                    <div>
                      <strong>{li.name}</strong>
                      {li.spicyLevel ? <span className="order-line-spice">{li.spicyLevel}</span> : null}
                      <span>$ {(li.price * li.qty).toFixed(2)}</span>
                    </div>
                    <div className="qty-controls">
                      <button type="button" aria-label={`Fewer ${li.name}`} onClick={() => setQty(li.key, li.qty - 1)}>
                        {li.qty === 1 ? <Trash2 size={13} /> : <Minus size={14} />}
                      </button>
                      <span>{li.qty}</span>
                      <button type="button" aria-label={`More ${li.name}`} onClick={() => setQty(li.key, li.qty + 1)}>
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="modal-hint">No dishes added yet. Search above to add items.</p>
            )}
          </div>

          <label>
            <span>Name</span>
            <input
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Your name"
              autoComplete="name"
            />
          </label>
          <label>
            <span>Phone</span>
            <input
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="(801) 555-0123"
              autoComplete="tel"
            />
          </label>
          <label>
            <span>Delivery / pickup notes</span>
            <input
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Address or “pickup at Sandy, Utah”"
              autoComplete="street-address"
            />
          </label>
          <label>
            <span>Order notes (optional)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Allergies, delivery instructions…"
            />
          </label>

          <p className="modal-total">
            Total <strong>$ {total.toFixed(2)}</strong>
            {lineItems.length ? ` · ${lineItems.length} item(s)` : ''}
          </p>

          {localError && <p className="modal-error" role="alert">{localError}</p>}

          <button type="submit" className="btn btn-red modal-submit" disabled={submitting}>
            {submitting ? (
              <><LoaderCircle size={16} className="spin" /> Placing order…</>
            ) : (
              <><ShoppingBag size={16} /> Place order</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
