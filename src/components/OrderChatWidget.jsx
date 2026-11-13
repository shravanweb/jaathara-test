import React, { useEffect, useRef, useState } from 'react';
import { LoaderCircle, MessageCircle, Mic, MicOff, Send, Volume2, VolumeX, X } from 'lucide-react';
import {
  advanceChatOrder,
  buildOrderPayload,
  createEmptySession,
  STEPS,
} from '../lib/chatOrderFlow';
import { createOrder } from '../lib/restaurantApi';

function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const clean = String(text || '')
    .replace(/[•*]/g, '')
    .replace(/\n+/g, '. ')
    .slice(0, 400);
  if (!clean) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(clean);
  utter.rate = 1;
  utter.pitch = 1;
  window.speechSynthesis.speak(utter);
}

function useSpeechInput(onResult) {
  const recogRef = useRef(null);
  const [listening, setListening] = useState(false);
  const supported =
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const stop = () => {
    try {
      recogRef.current?.stop();
    } catch {
      /* ignore */
    }
    setListening(false);
  };

  const start = () => {
    if (!supported) return;
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new Ctor();
    recog.lang = 'en-IN';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) onResult(transcript);
    };
    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);
    recogRef.current = recog;
    setListening(true);
    recog.start();
  };

  useEffect(() => () => stop(), []);

  return { supported: Boolean(supported), listening, start, stop };
}

export default function OrderChatWidget({ dishes = [], onOrderPlaced, onError }) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState(createEmptySession);
  const [messages, setMessages] = useState(() => [
    {
      role: 'assistant',
      text: 'Namaste — I’m the Jaathara hostess. Ask for the menu, or tell me what you’d like to order. You can type or tap the mic.',
      actions: [
        { id: 'menu', label: 'Show menu' },
        { id: 'order', label: 'Start order' },
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [voiceOut, setVoiceOut] = useState(true);
  const voiceOutRef = useRef(true);
  const toggleVoice = () => {
    const next = !voiceOutRef.current;
    voiceOutRef.current = next;
    setVoiceOut(next);
    if (!next && typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  };
  const closeChat = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setOpen(false);
  };
  const listRef = useRef(null);

  const pushAssistant = (text, actions = []) => {
    setMessages((prev) => [...prev, { role: 'assistant', text, actions }]);
    if (voiceOutRef.current) speak(text);
  };

  const handleTurn = async (rawText, shownText) => {
    const text = String(rawText || '').trim();
    if (!text || busy) return;

    setMessages((prev) => [...prev, { role: 'user', text: shownText || text }]);
    setInput('');
    setBusy(true);

    try {
      let mapped = text;
      if (text === 'order' || /^start order$/i.test(text)) mapped = 'order';
      else if (text === 'menu' || /^show menu$/i.test(text)) mapped = 'menu';
      else if (text.startsWith('dish:')) mapped = text.slice(5);
      else if (text.startsWith('qty:')) mapped = text.slice(4);
      else if (text.startsWith('spice:')) mapped = text.slice(6);
      else if (text === 'more:no' || /^checkout$/i.test(text)) mapped = 'checkout';
      else if (text === 'confirm:yes' || /^place order$/i.test(text)) mapped = 'place order';
      else if (text === 'cancel' || /^cancel$/i.test(text)) mapped = 'cancel';
      else if (text === 'book') mapped = 'yes';

      const result = advanceChatOrder(session, mapped, dishes);
      setSession(result.session);

      if (result.readyToSubmit) {
        pushAssistant(result.reply, []);
        const payload = buildOrderPayload(result.session);
        const order = await createOrder(payload);
        const code = order.code || order.orderId || '';
        const done = createEmptySession();
        done.step = STEPS.COMPLETE;
        setSession(done);
        const confirm = code
          ? `Order placed · ${code}. You’ll see it in Restaurant Admin → Orders.`
          : 'Order placed. Check Restaurant Admin → Orders.';
        pushAssistant(confirm, [
          { id: 'order', label: 'Order again' },
          { id: 'menu', label: 'Show menu' },
        ]);
        onOrderPlaced?.(confirm);
      } else {
        pushAssistant(result.reply, result.actions || []);
      }
    } catch (err) {
      const message = err.message || 'Could not place order';
      pushAssistant(`${message}. You can try again or say Cancel.`, [
        { id: 'confirm:yes', label: 'Retry place order' },
        { id: 'cancel', label: 'Cancel' },
      ]);
      onError?.(message);
    } finally {
      setBusy(false);
    }
  };

  const speech = useSpeechInput((transcript) => {
    void handleTurn(transcript);
  });

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  return (
    <>
      {!open && (
        <button
          type="button"
          className="chat-fab"
          onClick={() => setOpen(true)}
          aria-label="Open order chat"
        >
          <MessageCircle size={22} />
          <span>Order chat</span>
        </button>
      )}

      {open && (
        <section className="chat-panel" aria-label="Order chat">
          <header className="chat-head">
            <div>
              <strong>Jaathara hostess</strong>
              <span>Chat &amp; voice orders</span>
            </div>
            <div className="chat-head-actions">
              <button
                type="button"
                className={voiceOut ? 'is-on' : ''}
                onClick={toggleVoice}
                aria-label={voiceOut ? 'Mute replies' : 'Speak replies'}
                title={voiceOut ? 'Mute replies' : 'Unmute replies'}
              >
                {voiceOut ? <Volume2 size={16} /> : <VolumeX size={16} />}
              </button>
              <button type="button" onClick={closeChat} aria-label="Close chat">
                <X size={16} />
              </button>
            </div>
          </header>

          <div className="chat-messages" ref={listRef}>
            {messages.map((msg, i) => (
              <div key={`${msg.role}-${i}`} className={`chat-bubble ${msg.role}`}>
                <p>{msg.text}</p>
                {msg.actions?.length > 0 && (
                  <div className="chat-actions">
                    {msg.actions.map((action) => (
                      <button
                        key={action.id}
                        type="button"
                        disabled={busy}
                        onClick={() => void handleTurn(action.id, action.label)}
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <form
            className="chat-composer"
            onSubmit={(e) => {
              e.preventDefault();
              void handleTurn(input);
            }}
          >
            <button
              type="button"
              className={`chat-mic${speech.listening ? ' is-live' : ''}`}
              disabled={!speech.supported || busy}
              onClick={() => (speech.listening ? speech.stop() : speech.start())}
              aria-label={speech.listening ? 'Stop listening' : 'Speak your order'}
              title={speech.supported ? 'Voice input' : 'Voice not supported in this browser'}
            >
              {speech.listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={speech.listening ? 'Listening…' : 'Type a dish or message…'}
              disabled={busy}
              aria-label="Chat message"
            />
            <button type="submit" className="chat-send" disabled={busy || !input.trim()} aria-label="Send">
              {busy ? <LoaderCircle size={16} className="spin" /> : <Send size={16} />}
            </button>
          </form>
        </section>
      )}
    </>
  );
}
