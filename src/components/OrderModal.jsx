import React, { useMemo, useState } from 'react';
import { LoaderCircle, Minus, Plus, ShoppingBag, X } from 'lucide-react';
import { createOrder } from '../lib/restaurantApi';

export default function OrderModal({ open, onClose, onSuccess, onError, dishes }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [qtyByName, setQtyByName] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const orderable = useMemo(
    () =>
      (dishes || []).filter(
        (d) => Number(d.priceValue) > 0 && d.available !== false
      ),
    [dishes]
  );

  const lineItems = useMemo(
    () =>
      orderable
        .map((dish) => {
          const qty = Number(qtyByName[dish.name] || 0);
          if (qty < 1) return null;
          return {
            name: dish.name,
            qty,
            price: Number(dish.priceValue),
          };
        })
        .filter(Boolean),
    [orderable, qtyByName]
  );

  const total = lineItems.reduce((sum, li) => sum + li.price * li.qty, 0);

  if (!open) return null;

  const setQty = (name, next) => {
    setQtyByName((prev) => ({
      ...prev,
      [name]: Math.max(0, Math.min(20, next)),
    }));
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
        lineItems,
      });
      onSuccess?.(
        result.code
          ? `Order placed · ${result.code}`
          : 'Order placed — check Restaurant Admin → Orders'
      );
      setQtyByName({});
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
          <div className="order-dish-list">
            {orderable.map((dish) => {
              const qty = Number(qtyByName[dish.name] || 0);
              return (
                <div className="order-dish-row" key={dish.name}>
                  <div>
                    <strong>{dish.name}</strong>
                    <span>$ {dish.priceValue}</span>
                  </div>
                  <div className="qty-controls">
                    <button type="button" aria-label={`Fewer ${dish.name}`} onClick={() => setQty(dish.name, qty - 1)}>
                      <Minus size={14} />
                    </button>
                    <span>{qty}</span>
                    <button type="button" aria-label={`More ${dish.name}`} onClick={() => setQty(dish.name, qty + 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
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
              placeholder="+91 …"
              autoComplete="tel"
            />
          </label>
          <label>
            <span>Delivery / pickup notes</span>
            <input
              value={customerAddress}
              onChange={(e) => setCustomerAddress(e.target.value)}
              placeholder="Address or “pickup at ECIL”"
              autoComplete="street-address"
            />
          </label>
          <label>
            <span>Order notes (optional)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Spice level, allergies…"
            />
          </label>

          <p className="modal-total">
            Total <strong>$ {total.toFixed(0)}</strong>
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
