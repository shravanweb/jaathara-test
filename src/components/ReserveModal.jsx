import React, { useEffect, useState } from 'react';
import { CalendarDays, LoaderCircle, X } from 'lucide-react';
import {
  buildReservedAt,
  createReservation,
  getAvailability,
  nextLocalDateISO,
} from '../lib/restaurantApi';

export default function ReserveModal({ open, onClose, onSuccess, onError }) {
  const [guestName, setGuestName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [partySize, setPartySize] = useState(2);
  const [date, setDate] = useState(nextLocalDateISO(1));
  const [time, setTime] = useState('19:30');
  const [notes, setNotes] = useState('');
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    if (!open) return;
    setLocalError('');
  }, [open]);

  useEffect(() => {
    if (!open || !date) return;
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      setLocalError('');
      try {
        const data = await getAvailability({ date, partySize });
        if (cancelled) return;
        const nextSlots = Array.isArray(data.slots) ? data.slots : [];
        setSlots(nextSlots);
        const firstOpen = nextSlots.find((s) => s.available !== false);
        if (firstOpen?.start || firstOpen?.time) {
          const raw = String(firstOpen.start || firstOpen.time);
          const hhmm = raw.includes('T') ? raw.slice(11, 16) : raw.slice(0, 5);
          if (hhmm) setTime(hhmm);
        }
      } catch (err) {
        if (!cancelled) {
          setSlots([]);
          setLocalError(err.message || 'Could not load availability');
        }
      } finally {
        if (!cancelled) setLoadingSlots(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, date, partySize]);

  if (!open) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setLocalError('');
    try {
      const result = await createReservation({
        guestName: guestName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        partySize: Number(partySize),
        reservedAt: buildReservedAt(date, time),
        notes: notes.trim(),
      });
      onSuccess?.(
        result.message ||
          `Table reserved${result.confirmationCode ? ` · ${result.confirmationCode}` : ''}`
      );
      onClose?.();
    } catch (err) {
      const message = err.message || 'Reservation failed';
      setLocalError(message);
      onError?.(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserve-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal-head">
          <div>
            <span className="eyebrow">Booking</span>
            <h2 id="reserve-title">Request a Table</h2>
          </div>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <form className="modal-form" onSubmit={submit}>
          <label>
            <span>Name</span>
            <input
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Guest name"
              autoComplete="name"
            />
          </label>
          <label>
            <span>Phone</span>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 …"
              autoComplete="tel"
            />
          </label>
          <label>
            <span>Email (optional)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>
          <div className="modal-row">
            <label>
              <span>Party size</span>
              <input
                type="number"
                min={1}
                max={20}
                required
                value={partySize}
                onChange={(e) => setPartySize(e.target.value)}
              />
            </label>
            <label>
              <span>Date</span>
              <input
                type="date"
                required
                min={nextLocalDateISO(0)}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              <span>Time</span>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>
          <label>
            <span>Notes (optional)</span>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Occasion, seating preference…"
            />
          </label>

          <div className="modal-slots" aria-live="polite">
            {loadingSlots ? (
              <p className="modal-hint"><LoaderCircle size={14} className="spin" /> Checking tables…</p>
            ) : slots.length > 0 ? (
              <p className="modal-hint">
                {slots.filter((s) => s.available !== false).length} open slot(s) for this date
                {slots.some((s) => s.available === false) ? ' · some times already taken' : ''}
              </p>
            ) : (
              <p className="modal-hint">Pick a date to check availability in Restaurant Admin.</p>
            )}
          </div>

          {localError && <p className="modal-error" role="alert">{localError}</p>}

          <button type="submit" className="btn btn-red modal-submit" disabled={submitting}>
            {submitting ? (
              <><LoaderCircle size={16} className="spin" /> Booking…</>
            ) : (
              <><CalendarDays size={16} /> Confirm reservation</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
