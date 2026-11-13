import React, { useEffect, useState } from 'react';
import {
  ArrowRight, CalendarDays, ChefHat, Clock3, Instagram, Mail,
  MapPin, Menu as MenuIcon, Phone, ShoppingBag, Utensils, X, Leaf,
  Award, Users, Facebook, Youtube, Truck, Home, ConciergeBell, UtensilsCrossed, Building2, Cake, PartyPopper, Flame, HeartHandshake, Sparkles, Music, Search
} from 'lucide-react';
import emblem from './assets/jaathara-emblem.png';
import gulabJamun from './assets/gulab-jamun.png';
import heroMain from './assets/hero-main-cut.webp';
import satTandoori from './assets/sat-tandoori.jpg';
import OrderModal from './components/OrderModal';
import OrderChatWidget from './components/OrderChatWidget';
import ReserveModal from './components/ReserveModal';
import { useRestaurantMenu } from './hooks/useRestaurantMenu';
import clipBalloon from './assets/Cliparts/balloonseller-animated.svg';
import clipDappu from './assets/Cliparts/dappumusicians.webp';
import clipWheel from './assets/Cliparts/giantwheel-animated.svg';
import clipKolatam from './assets/Cliparts/kolatam-dancers.webp';
import clipMerry from './assets/Cliparts/03-merry-go-round.png';
import clipSugarcane from './assets/Cliparts/12-sugarcane-cart.png';
import clipSweetStall from './assets/Cliparts/06-sweet-stall.png';
import clipFlowerStall from './assets/Cliparts/07-flower-stall.png';
import kolamFooterA from './assets/Kolam/svg_white/13_chakra_mandala.svg';
import kolamFooterB from './assets/Kolam/svg_white/16_radial_petal.svg';
import eventFestival from './assets/event-festival.webp';
import eventTandoor from './assets/event-tandoor.webp';
import eventPrivate from './assets/event-private.webp';

const food = {
  biryani: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=1400&q=80',
  biryaniBowl: 'https://images.pexels.com/photos/12737656/pexels-photo-12737656.jpeg?auto=compress&cs=tinysrgb&w=1200',
  biryaniBrass: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=1200&q=80',
  curry: 'https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=1200',
  curryPots: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=1200&q=80',
  tandoori: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1200&q=80',
  bread: 'https://images.unsplash.com/photo-1617692855027-33b14f061079?auto=format&fit=crop&w=1200&q=80',
  restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
  thali: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=1400&q=80',
  samosa: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1000&q=80',
  spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1000&q=80',
  diningWarm: 'https://images.pexels.com/photos/260922/pexels-photo-260922.jpeg?auto=compress&cs=tinysrgb&w=1200',
  diningWhite: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=1200',
  diningServe: 'https://images.pexels.com/photos/1579739/pexels-photo-1579739.jpeg?auto=compress&cs=tinysrgb&w=1200',
  diningRoom: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=1200',
  dessert: gulabJamun
};

const specialties = [
  { name: 'Biryani', image: food.biryaniBowl, icon: 'biryani', category: 'Biryani' },
  { name: 'Tandoori', image: food.tandoori, icon: 'tandoori', category: 'Tandoori' },
  { name: 'Curries', image: food.curry, icon: 'curries', category: 'Curries' },
  { name: 'Starters', image: food.samosa, icon: 'starters', category: 'Starters' },
  { name: 'Desserts', image: food.dessert, icon: 'desserts', category: 'Desserts' }
];

/** Showcase menu used only when Restaurant Admin is not linked / empty. */
const FALLBACK_DISHES = [
  { category: 'Biryani', name: 'Hyderabadi Dum Biryani', desc: 'Fragrant basmati, dum-cooked the jathara way.', veg: false, priceValue: 380, image: food.biryani },
  { category: 'Biryani', name: 'Vegetable Dum Biryani', desc: 'Saffron rice and garden vegetables, sealed on dum.', veg: true, priceValue: 320, image: food.biryaniBrass },
  { category: 'Curries', name: 'Gongura Mamsam', desc: 'Tangy sorrel, the taste of Telangana.', veg: false, priceValue: 340, image: food.curryPots },
  { category: 'Curries', name: 'Pappu', desc: 'Slow-cooked dal, the everyday comfort of the feast.', veg: true, priceValue: 180 },
  { category: 'Tandoori', name: 'Tandoori Chicken', desc: 'Kumkuma-red, smoky and tender.', veg: false, priceValue: 360, image: food.tandoori },
  { category: 'Starters', name: 'Samosa', desc: 'Crisp festival snacks, served with chutney.', veg: true, priceValue: 80, image: food.samosa },
  { category: 'Breads', name: 'Rumali Roti', desc: 'Handkerchief-thin, straight from the tawa.', veg: true, priceValue: 40 },
  { category: 'Breads', name: 'Naan', desc: 'Leavened and baked over live coals.', veg: true, priceValue: 50, image: food.bread },
  { category: 'Breads', name: 'Sarva Pindi', desc: 'Telangana rice-flour pancake, crisp at the edges.', veg: true, priceValue: 90 },
  { category: 'Desserts', name: 'Ariselu', desc: 'A festival sweet of rice and jaggery.', veg: true, priceValue: 70 },
  { category: 'Desserts', name: 'Double ka Meetha', desc: 'Hyderabadi bread pudding, rich with saffron.', veg: true, priceValue: 120, image: food.dessert }
];

const cateringServices = [
  { icon: Building2, title: 'Corporate Catering', text: 'Office lunches, team meetings and client events, delivered hot and on time.' },
  { icon: HeartHandshake, title: 'Weddings & Sangeet', text: 'Full Telangana feasts for haldi, mehendi, sangeet and the big day.' },
  { icon: Cake, title: 'Birthdays & Parties', text: 'Family gatherings and milestone parties with crowd-favourite menus.' },
  { icon: Users, title: 'Community Gatherings', text: 'Big-batch biryani and party trays for associations, temples and get-togethers.' }
];

const cateringSteps = [
  { title: 'Share your date', text: 'Tell us the occasion, guest count and venue.' },
  { title: 'Pick your menu', text: 'Choose from our dishes or let us build a custom feast.' },
  { title: 'We cook & serve', text: 'Fresh food, trays or full service, set up on time.' }
];

const events = [
  { icon: PartyPopper, tag: 'Festivals', title: 'Festival Nights', text: 'Special menus and celebrations for Diwali, Sankranti, Ugadi, Bathukamma and Dasara.', image: eventFestival },
  { icon: Flame, tag: 'Live kitchen', title: 'Live Tandoor Evenings', text: 'Kebabs, naan and tikkas fresh off the coals, cooked right in front of you.', image: eventTandoor },
  { icon: Music, tag: 'Private hire', title: 'Private Dining & Parties', text: 'Book our hall for birthdays, anniversaries, team dinners and family functions.', image: eventPrivate }
];


const feastItems = [
  'Hyderabadi dum biryani',
  'Gongura and slow gravies',
  'Tandoori from the coals',
  'Rumali, naan and sarva pindi',
  'A festival sweet to close'
];

const reviews = [
  { initials: 'RK', name: 'Ramesh K.', text: 'The muggulu at the door and the biryani on the table — it felt like walking into a Telangana jathara.' },
  { initials: 'PM', name: 'Priya M.', text: 'Loved the gongura and the tandoori starters. Service was warm, portions generous, colours everywhere.' }
];

const heroSlides = [
  {
    src: heroMain,
    alt: 'Hyderabadi dum biryani in a copper kadai, with chicken, saffron rice and a copper bowl of salan',
    name: 'Hyderabadi Dum Biryani',
    position: '68% 46%'
  },
  {
    src: food.curryPots,
    alt: 'Copper bowls of slow-cooked curry',
    name: 'Gongura Mamsam',
    position: '58% 48%'
  },
  {
    src: food.thali,
    alt: 'A festival thali of rice, curries and breads',
    name: 'Festival Thali',
    position: '52% 46%'
  },
  {
    src: gulabJamun,
    alt: 'Gulab jamun in syrup with almond flakes',
    name: 'Gulab Jamun',
    position: '50% 44%'
  }
];

const features = [
  { icon: ConciergeBell, title: 'Traditional Recipes', lines: ['Traditional', 'Recipes'] },
  { icon: Leaf, title: 'Fresh & Quality Ingredients', lines: ['Fresh & Quality', 'Ingredients'] },
  { icon: ChefHat, title: 'Experienced Chefs', lines: ['Experienced', 'Chefs'] },
  { icon: Award, title: 'Family Friendly Ambience', lines: ['Family Friendly', 'Ambience'] }
];

const services = [
  { icon: Home, title: 'Dine-In', sub: 'Restaurant' },
  { icon: Truck, title: 'Takeaway', sub: '& Delivery' },
  { icon: UtensilsCrossed, title: 'Catering', sub: 'Services' },
  { icon: Users, title: 'Private', sub: 'Events' }
];

function MangoLeaf({ id, flip, colors }) {
  return (
    <svg className={`mango-leaf ${flip ? 'flip' : ''}`} viewBox="0 0 40 86" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={colors[0]} />
          <stop offset="50%" stopColor={colors[1]} />
          <stop offset="100%" stopColor={colors[2]} />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} d="M20 3c7 8 16 20 14 40-1 14-7 28-12 38-1.2 2.2-3.4 2-4.2-.2C12 66 4 50 3 32 2 16 8 8 20 3z" />
      <path d="M20 8c-.4 18-.2 38 1.2 66" fill="none" stroke="#f3e7a2" strokeWidth="0.7" opacity="0.7" />
    </svg>
  );
}

function Thoranam() {
  const shades = [
    ['#e7f08a', '#5aaa3a', '#2c7a34'],
    ['#d2e46a', '#4e9836', '#1f6830'],
    ['#f0f4a0', '#7cb84a', '#3d8c3c'],
    ['#c6dc62', '#3f8c38', '#1b5c2c'],
    ['#deec78', '#5a9e3a', '#266e32']
  ];
  return (
    <div className="thoranam" aria-hidden="true">
      <span className="thoranam-cord" />
      {Array.from({ length: 40 }).map((_, i) => (
        <span key={i} className="thoranam-drop" style={{ animationDelay: `${(i % 9) * 0.14}s` }}>
          <span className="thoranam-tilt" style={{ transform: `rotate(${((i * 11) % 7) - 3}deg)` }}>
            <MangoLeaf id={`leaf-${i}`} flip={i % 2 === 0} colors={shades[i % shades.length]} />
          </span>
        </span>
      ))}
    </div>
  );
}

function TempleBell({ className = '' }) {
  const gid = `bellg-${className || 'x'}`;
  return (
    <svg className={`temple-bell ${className}`} viewBox="0 0 52 80" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0.2" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#F8E19A" />
          <stop offset="40%" stopColor="#E8B42A" />
          <stop offset="100%" stopColor="#A66C0A" />
        </linearGradient>
      </defs>
      <line x1="26" y1="0" x2="26" y2="11" stroke="#B8860B" strokeWidth="1.8" />
      <circle cx="26" cy="12" r="2.6" fill="#F6D36B" stroke="#8A5A08" strokeWidth="0.7" />
      <path fill={`url(#${gid})`} stroke="#8A5A08" strokeWidth="0.6" d="M16 20c0-5 4.5-8 10-8s10 3 10 8c8 2 10 8 10 16 0 12-8 20-20 20S6 48 6 36c0-8 2-14 10-16z" />
      <path d="M10 36h32" stroke="#FFF3C0" strokeWidth="0.9" opacity="0.5" />
      <path d="M8 46c6 3 12 4 18 4s12-1 18-4" fill="none" stroke="#8A5A08" strokeWidth="0.7" opacity="0.45" />
      <ellipse cx="26" cy="55" rx="18" ry="3.5" fill="#8A5A08" opacity="0.35" />
      <path d="M26 56v7" stroke="#B8860B" strokeWidth="1.8" />
      <circle cx="26" cy="67" r="4.2" fill="#F6D36B" stroke="#8A5A08" strokeWidth="0.9" />
    </svg>
  );
}

function LotusRule({ light = false }) {
  return (
    <div className={`lotus-rule ${light ? 'light' : ''}`} aria-hidden="true">
      <span />
      <svg viewBox="0 0 56 28" fill="currentColor">
        <path d="M28 26c-3-8-12-11-18-8 6-10 12-14 18-18 6 4 12 8 18 18-6-3-15 0-18 8z" opacity="0.95" />
        <path d="M28 26c0-10-5-16 0-24 5 8 0 14 0 24z" />
        <path d="M16 20c4-2 8-2 12 2 4-4 8-4 12-2-6-8-12-10-12-10s-6 2-12 10z" opacity="0.75" />
      </svg>
      <span />
    </div>
  );
}

function Mandala({ className = '' }) {
  return (
    <svg className={`mandala ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <circle cx="100" cy="100" r="28" />
        <circle cx="100" cy="100" r="48" />
        <circle cx="100" cy="100" r="68" />
        <circle cx="100" cy="100" r="86" />
        {Array.from({ length: 16 }).map((_, i) => {
          const a = (i * Math.PI) / 8;
          const x1 = 100 + Math.cos(a) * 28;
          const y1 = 100 + Math.sin(a) * 28;
          const x2 = 100 + Math.cos(a) * 86;
          const y2 = 100 + Math.sin(a) * 86;
          const mx = 100 + Math.cos(a + 0.2) * 56;
          const my = 100 + Math.sin(a + 0.2) * 56;
          return <path key={i} d={`M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`} />;
        })}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4 + Math.PI / 8;
          const x = 100 + Math.cos(a) * 58;
          const y = 100 + Math.sin(a) * 58;
          return <circle key={`d${i}`} cx={x.toFixed(1)} cy={y.toFixed(1)} r="3.2" fill="currentColor" stroke="none" />;
        })}
      </g>
    </svg>
  );
}

function LotusMandala({ className = '' }) {
  const P = (r, a) => [100 + Math.cos(a) * r, 100 + Math.sin(a) * r].map((n) => n.toFixed(2)).join(' ');
  const petals = (n, r1, r2, spread, bulge, offset = 0) =>
    Array.from({ length: n }).map((_, i) => {
      const a = (i * 2 * Math.PI) / n + offset;
      const s = (Math.PI / n) * spread;
      return `M ${P(r1, a - s)} Q ${P(r2 * bulge, a - s * 0.9)} ${P(r2, a)} Q ${P(r2 * bulge, a + s * 0.9)} ${P(r1, a + s)}`;
    }).join(' ');
  const dots = (n, r, offset = 0) =>
    Array.from({ length: n }).map((_, i) => {
      const a = (i * 2 * Math.PI) / n + offset;
      return <circle key={`${r}-${i}`} cx={(100 + Math.cos(a) * r).toFixed(2)} cy={(100 + Math.sin(a) * r).toFixed(2)} r={r > 80 ? 1.1 : 1.4} />;
    });
  const step = Math.PI / 24;
  return (
    <svg className={`lotus-mandala ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinejoin="round">
        <path d={petals(24, 78, 98, 0.9, 0.86, step)} strokeWidth="0.7" />
        <path d={petals(24, 78, 92, 0.55, 0.9, step)} strokeWidth="0.45" />
        <path d={petals(16, 58, 82, 0.92, 0.82)} strokeWidth="0.8" fill="currentColor" fillOpacity="0.06" />
        <path d={petals(16, 60, 76, 0.55, 0.88)} strokeWidth="0.45" />
        <circle cx="100" cy="100" r="58" strokeWidth="0.7" />
        <circle cx="100" cy="100" r="55" strokeWidth="0.35" strokeDasharray="1.2 1.6" />
        <path d={petals(12, 34, 54, 0.95, 0.8, Math.PI / 12)} strokeWidth="0.8" fill="currentColor" fillOpacity="0.08" />
        <path d={petals(12, 36, 48, 0.5, 0.85, Math.PI / 12)} strokeWidth="0.4" />
        <circle cx="100" cy="100" r="34" strokeWidth="0.7" />
        <path d={petals(8, 16, 32, 0.9, 0.8)} strokeWidth="0.75" fill="currentColor" fillOpacity="0.1" />
        <circle cx="100" cy="100" r="15" strokeWidth="0.7" />
        <circle cx="100" cy="100" r="9" strokeWidth="0.5" strokeDasharray="1 1.4" />
        <circle cx="100" cy="100" r="3.2" fill="currentColor" stroke="none" />
      </g>
      <g fill="currentColor">
        {dots(48, 99.2)}
        {dots(24, 86, step)}
        {dots(16, 62, Math.PI / 16)}
        {dots(12, 40)}
      </g>
    </svg>
  );
}

function Palms({ className = '' }) {
  return (
    <svg className={`palms ${className}`} viewBox="0 0 180 220" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round">
        <path d="M86 210 V96" />
        <path d="M86 100 C60 90 36 68 22 42" />
        <path d="M86 100 C70 80 58 50 54 22" />
        <path d="M86 100 C96 72 92 42 80 16" />
        <path d="M86 100 C112 86 140 70 164 56" />
        <path d="M86 100 C110 78 128 48 136 22" />
        <path d="M118 210 V130" />
        <path d="M118 132 C132 120 152 108 168 100" />
        <path d="M118 132 C128 112 136 90 132 70" />
        <path d="M118 132 C108 114 102 90 108 68" />
        <path d="M30 210 C48 198 70 196 86 210" />
        <path d="M14 200 C28 192 40 194 48 204" />
      </g>
    </svg>
  );
}

function Charminar({ className = '' }) {
  return (
    <svg className={`charminar ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
        <path d="M28 188 V96 H48 V112 H72 V78 H128 V112 H152 V96 H172 V188" />
        <path d="M72 78 Q100 18 128 78" />
        <path d="M86 78 Q100 48 114 78" />
        <rect x="80" y="118" width="40" height="28" />
        <path d="M90 146 V172 H110 V146" />
        <path d="M80 172 H120" />
        <circle cx="38" cy="88" r="11" />
        <circle cx="162" cy="88" r="11" />
        <path d="M38 77 V68 M162 77 V68" />
        <path d="M32 68 h12 M156 68 h12" />
        <path d="M16 188 H184" />
        <path d="M48 96 H72 M128 96 H152" />
        <path d="M60 168 Q78 148 96 168 M104 168 Q122 148 140 168" />
        <path d="M36 112 h16 M148 112 h16" />
      </g>
    </svg>
  );
}


function OrnateMandala({ className = '' }) {
  const petals = Array.from({ length: 16 }, (_, i) => {
    const a = (i * 22.5 * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const x = 100 + c * 62;
    const y = 100 + s * 62;
    return (
      <ellipse
        key={i}
        cx={x}
        cy={y}
        rx="16"
        ry="28"
        transform={`rotate(${i * 22.5} ${x} ${y})`}
      />
    );
  });
  return (
    <svg className={`ornate-mandala ${className}`} viewBox="0 0 200 200" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.05">
        <circle cx="100" cy="100" r="22" />
        <circle cx="100" cy="100" r="38" />
        <circle cx="100" cy="100" r="86" />
        <circle cx="100" cy="100" r="96" />
        {petals}
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={100 + Math.cos(a) * 22}
              y1={100 + Math.sin(a) * 22}
              x2={100 + Math.cos(a) * 86}
              y2={100 + Math.sin(a) * 86}
            />
          );
        })}
        {Array.from({ length: 16 }).map((_, i) => {
          const a = ((i + 0.5) * Math.PI) / 8;
          return <circle key={`d${i}`} cx={100 + Math.cos(a) * 96} cy={100 + Math.sin(a) * 96} r="2.2" fill="currentColor" stroke="none" />;
        })}
      </g>
    </svg>
  );
}

function Diya({ className = '' }) {
  const gid = `diyag-${className || 'x'}`;
  return (
    <svg className={`diya ${className}`} viewBox="0 0 72 70" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#F8E19A" />
          <stop offset="50%" stopColor="#E8B42A" />
          <stop offset="100%" stopColor="#A66C0A" />
        </linearGradient>
      </defs>
      <g className="flame">
        <ellipse cx="36" cy="20" rx="8" ry="16" fill="#FFB347" />
        <ellipse cx="36" cy="22" rx="4.2" ry="10" fill="#FFF3C0" />
      </g>
      <path fill={`url(#${gid})`} stroke="#8A5A08" strokeWidth="0.8" d="M8 48c8-10 16-14 28-14s20 4 28 14c-6 6-16 10-28 10S14 54 8 48z" />
      <ellipse cx="36" cy="50" rx="26" ry="6" fill={`url(#${gid})`} stroke="#8A5A08" strokeWidth="0.6" />
      <ellipse cx="36" cy="47" rx="10" ry="3" fill="#FFF3C0" opacity="0.55" />
    </svg>
  );
}

function MandapamFrame() {
  const lotuses = Array.from({ length: 7 }, (_, i) => 145 + i * 35);
  const bells = [170, 250, 330];
  const garland = Array.from({ length: 13 }, (_, i) => {
    const t = i / 12;
    return { x: 118 + t * 264, y: 202 + Math.sin(t * Math.PI) * 20, r: 5 + (i % 2) };
  });
  return (
    <svg className="mandapam-frame" viewBox="0 0 500 560" aria-hidden="true">
      <defs>
        <linearGradient id="mpGoldV" x1="0" y1="0" x2="0.15" y2="1">
          <stop offset="0%" stopColor="#FFF3C0" />
          <stop offset="35%" stopColor="#E8B42A" />
          <stop offset="100%" stopColor="#8A5A08" />
        </linearGradient>
        <linearGradient id="mpGoldH" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8A5A08" />
          <stop offset="50%" stopColor="#F6D36B" />
          <stop offset="100%" stopColor="#8A5A08" />
        </linearGradient>
        <linearGradient id="mpShine" x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0%" stopColor="#FFF8D8" />
          <stop offset="100%" stopColor="#C99220" />
        </linearGradient>
      </defs>
      {/* Filled pediment */}
      <path
        d="M108 168 Q250 18 392 168 L392 178 L108 178 Z"
        fill="url(#mpGoldH)"
        stroke="#8A5A08"
        strokeWidth="1.1"
      />
      <path d="M128 168 Q250 44 372 168" fill="none" stroke="#FFF3C0" strokeWidth="1.4" opacity="0.8" />
      <path d="M148 168 Q250 64 352 168" fill="none" stroke="#8A5A08" strokeWidth="0.8" opacity="0.45" />
      {/* Apex kalasham */}
      <g transform="translate(250, 22)">
        <ellipse cx="0" cy="22" rx="18" ry="10" fill="url(#mpGoldV)" stroke="#8A5A08" strokeWidth="0.8" />
        <path d="M-14 20 Q0 -4 14 20" fill="url(#mpShine)" stroke="#8A5A08" strokeWidth="0.7" />
        <path d="M-6 4 Q-14 -10 -4 -18" fill="#E8B42A" stroke="#8A5A08" strokeWidth="0.5" />
        <path d="M6 4 Q14 -10 4 -18" fill="#E8B42A" stroke="#8A5A08" strokeWidth="0.5" />
        <path d="M0 -2 C-7 -26 7 -26 0 -40" fill="none" stroke="#C99220" strokeWidth="1.6" />
        <path d="M-8 -36 Q0 -52 8 -36 Q0 -30 -8 -36" fill="#F6D36B" stroke="#8A5A08" strokeWidth="0.6" />
        <circle cx="0" cy="-42" r="3.4" fill="#FFF3C0" stroke="#8A5A08" strokeWidth="0.5" />
      </g>
      {/* Lintel */}
      <rect x="106" y="164" width="288" height="32" fill="url(#mpGoldH)" stroke="#8A5A08" strokeWidth="1" />
      <rect x="112" y="169" width="276" height="22" fill="none" stroke="#FFF3C0" strokeWidth="0.9" opacity="0.75" />
      {lotuses.map((x) => (
        <g key={x} transform={`translate(${x}, 180)`}>
          <ellipse cx="0" cy="0" rx="8" ry="10" fill="#7A2A14" stroke="#8A5A08" strokeWidth="0.5" />
          <path d="M0-8 Q-4-1 0 7 Q4-1 0-8" fill="#F6D36B" />
          <ellipse cx="0" cy="-1" rx="2.4" ry="3" fill="#FFF3C0" />
        </g>
      ))}
      {/* Pillars */}
      {[0, 1].map((side) => {
        const x = side === 0 ? 58 : 406;
        return (
          <g key={side}>
            <rect x={x} y="188" width="36" height="318" fill="url(#mpGoldV)" stroke="#8A5A08" strokeWidth="0.9" />
            <rect x={x + 5} y="196" width="5" height="302" fill="#FFF8D8" opacity="0.32" />
            <rect x={x + 26} y="210" width="2" height="280" fill="#8A5A08" opacity="0.18" />
            {[208, 278, 358, 438, 496].map((y) => (
              <g key={y}>
                <rect x={x - 5} y={y} width="46" height="9" rx="1" fill="url(#mpGoldH)" stroke="#8A5A08" strokeWidth="0.55" />
                <path d={`M${x - 3} ${y + 4.5} H${x + 39}`} stroke="#FFF3C0" strokeWidth="0.5" opacity="0.55" />
              </g>
            ))}
            {/* lotus capital */}
            <path d={`M${x - 12} 198 Q${x + 18} 148 ${x + 48} 198 Z`} fill="url(#mpShine)" stroke="#8A5A08" strokeWidth="0.8" />
            <path d={`M${x - 4} 198 Q${x + 18} 168 ${x + 40} 198`} fill="none" stroke="#8A5A08" strokeWidth="0.6" opacity="0.5" />
            <rect x={x - 4} y="188" width="44" height="9" fill="url(#mpGoldH)" stroke="#8A5A08" strokeWidth="0.5" />
            {/* kalasham */}
            <g transform={`translate(${x + 18}, 152)`}>
              <ellipse cx="0" cy="10" rx="11" ry="7" fill="url(#mpGoldV)" stroke="#8A5A08" strokeWidth="0.6" />
              <path d="M-8 8 Q0 -6 8 8" fill="url(#mpShine)" stroke="#8A5A08" strokeWidth="0.5" />
              <path d="M0 -4 C-5 -18 5 -18 0 -26" fill="none" stroke="#C99220" strokeWidth="1.2" />
              <circle cx="0" cy="-26" r="2.3" fill="#FFF3C0" stroke="#8A5A08" strokeWidth="0.45" />
            </g>
            {/* stepped base */}
            <rect x={x - 8} y="504" width="52" height="12" rx="1.5" fill="url(#mpGoldH)" stroke="#8A5A08" strokeWidth="0.7" />
            <rect x={x - 14} y="515" width="64" height="12" rx="1.5" fill="url(#mpGoldV)" stroke="#8A5A08" strokeWidth="0.7" />
          </g>
        );
      })}
      {/* Inner opening moulding */}
      <rect x="108" y="206" width="284" height="298" fill="none" stroke="url(#mpGoldH)" strokeWidth="5" />
      <rect x="114" y="212" width="272" height="286" fill="none" stroke="#FFF3C0" strokeWidth="1" opacity="0.65" />
      {/* Marigold garland */}
      {garland.map((g, i) => (
        <g key={i}>
          {i < garland.length - 1 && (
            <line
              x1={g.x} y1={g.y} x2={garland[i + 1].x} y2={garland[i + 1].y}
              stroke="#8A5A08" strokeWidth="1.1"
            />
          )}
          <circle cx={g.x} cy={g.y} r={g.r} fill="#E8940A" stroke="#8A5A08" strokeWidth="0.5" />
          <circle cx={g.x - 1} cy={g.y - 1} r={g.r * 0.4} fill="#FFE08A" />
        </g>
      ))}
      {/* Hanging bells */}
      {bells.map((x) => (
        <g key={x} fill="url(#mpGoldV)" stroke="#8A5A08" strokeWidth="0.55">
          <line x1={x} y1="196" x2={x} y2="214" stroke="#B8860B" strokeWidth="1.1" />
          <path d={`M${x - 7} 214 c0 8 4 13 7 13s7-5 7-13`} />
          <circle cx={x} cy="230" r="2.6" />
        </g>
      ))}
    </svg>
  );
}

function MarigoldPetals() {
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: 10 }).map((_, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${6 + (i * 9.5) % 90}%`,
            '--delay': `${i * 1.15}s`,
            '--dur': `${10 + (i % 5) * 2}s`,
            '--scale': 0.7 + (i % 4) * 0.18,
            '--rot': `${i * 32}deg`
          }}
        />
      ))}
    </div>
  );
}

function TempleBorder({ position = 'top' }) {
  return (
    <div className={`temple-border temple-border-${position}`} aria-hidden="true">
      <span className="tb-bands" />
      <svg className="tb-motifs" viewBox="0 0 1200 28" preserveAspectRatio="xMidYMid meet">
        {Array.from({ length: 24 }).map((_, i) => (
          <g key={i} transform={`translate(${25 + i * 50}, 14)`}>
            <ellipse cx="0" cy="0" rx="8" ry="10" fill="#E8B42A" stroke="#8A5A08" strokeWidth="0.6" />
            <ellipse cx="0" cy="-1" rx="3" ry="4" fill="#FFF3C0" />
            <path d="M-11 0 L-6 0 M6 0 L11 0" stroke="#E8B42A" strokeWidth="1.2" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function DietMark({ veg }) {
  const label = veg ? 'Vegetarian' : 'Non-vegetarian';
  return (
    <span className={`diet ${veg ? 'veg' : 'nonveg'}`} title={label} aria-label={label}>
      <i />
    </span>
  );
}

function SectionHeading({ eyebrow, title, light = false }) {
  return (
    <div className={`section-heading ${light ? 'light' : ''}`}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      <LotusRule light={light} />
    </div>
  );
}

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]'));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      els.forEach((el) => el.classList.add('is-visible'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [menuQuery, setMenuQuery] = useState('');
  const [notice, setNotice] = useState('');
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [reserveOpen, setReserveOpen] = useState(false);
  const {
    dishes,
    categoryTabs,
    specials,
    status: menuStatus,
    error: menuError,
    isLive: menuLive,
  } = useRestaurantMenu([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const specialCards = React.useMemo(() => {
    if (specials.length >= 8) return specials;
    const ranked = [...dishes].filter((d) => d.available !== false).sort((a, b) => Number(b.ordersCount || 0) - Number(a.ordersCount || 0));
    const withImage = ranked.filter((d) => d.image);
    return (withImage.length >= 5 ? withImage : ranked).slice(0, 8).map((d) => ({ name: d.name, note: d.desc || d.description || '', image: d.image, veg: d.veg, priceValue: d.priceValue }));
  }, [specials, dishes]);
  useReveal();

  const navItems = [
    { label: 'Home', id: 'home' },
    { label: 'Menu', id: 'menu' },
    { label: 'About Us', id: 'about' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Catering', id: 'catering' },
    { label: 'Events', id: 'events' },
    { label: 'Contact', id: 'contact' }
  ];

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return undefined;
    const id = window.setInterval(() => {
      setHeroIndex((index) => (index + 1) % heroSlides.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        setOrderOpen(false);
        setReserveOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const locked = mobileOpen || orderOpen || reserveOpen;
    document.body.style.overflow = locked ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, orderOpen, reserveOpen]);

  const openOrder = () => {
    setMobileOpen(false);
    setOrderOpen(true);
  };

  const openReserve = () => {
    setMobileOpen(false);
    setReserveOpen(true);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const map = { feast: 'menu', specials: 'menu', specialties: 'menu', reserve: 'contact' };
    const ids = ['home', 'specialties', 'celebrate', 'gallery', 'about', 'feast', 'menu', 'specials', 'catering', 'events', 'reserve', 'contact'];
    const onScroll = () => {
      const y = window.scrollY + 130;
      let current = 'home';
      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= y) current = map[id] || id;
      });
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const goTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const showNotice = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 3400);
  };

  const openCategory = (name) => {
    setActiveCategory(name);
    goTo('menu');
  };

  const menuSearch = menuQuery.trim().toLowerCase();
  const visibleDishes = dishes.filter((dish) => {
    if (menuSearch) {
      const hay = `${dish.name || ''} ${dish.desc || dish.description || ''} ${dish.category || ''}`.toLowerCase();
      return hay.includes(menuSearch);
    }
    return activeCategory === 'All' || dish.category === activeCategory;
  });

  // Keep category tab valid when live menu categories change.
  useEffect(() => {
    if (!categoryTabs.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [categoryTabs, activeCategory]);

  return (
    <>
      <a className="skip-link" href="#home">Skip to content</a>

      <div className="topbar">
        <div className="container topbar-inner">
          <div className="top-links">
            <Utensils size={12} />
            <button type="button" onClick={() => goTo('home')}>Dine-In</button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goTo('reserve')}>Takeaway</button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goTo('catering')}>Catering</button>
            <span className="pipe">|</span>
            <button type="button" onClick={() => goTo('catering')}>Events</button>
          </div>
          <div className="top-meta">
            <span><MapPin size={12} /> Sandy, Utah</span>
            <span><Clock3 size={12} /> 11:00 AM – 11:00 PM</span>
            <span className="top-social">
              <a href="#contact" aria-label="Instagram"><Instagram size={13} /></a>
              <a href="#contact" aria-label="Facebook"><Facebook size={13} /></a>
              <a href="#contact" aria-label="YouTube"><Youtube size={13} /></a>
            </span>
          </div>
        </div>
      </div>

      <div className="festival-crown">
        <Thoranam />
      </div>

      <header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
        <div className="container nav-wrap">
          <div className="brand-cluster">
            <TempleBell className="bell-left" />
            <button className="brand" onClick={() => goTo('home')} aria-label="Jaathara home">
              <img src={emblem} alt="Jaathara Indian Cuisine — Let's celebrate Indian food" />
            </button>
          </div>
          <nav
            id="site-nav"
            className={mobileOpen ? 'nav-links open' : 'nav-links'}
            aria-label="Main navigation"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => goTo(item.id)}
                className={activeSection === item.id ? 'is-active' : ''}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                {item.label}
              </button>
            ))}
            <button
              className="mobile-order"
              onClick={openOrder}
            >
              <ShoppingBag size={16} /> Order Online
            </button>
          </nav>
          <div className="nav-actions">
            <a className="nav-phone" href="tel:+13856148117"><Phone size={15} /> +1 (385) 614-8117</a>
            <button
              className="order-btn"
              onClick={openOrder}
            >
              <ShoppingBag size={16} /> Order Online
            </button>
            <button
              className="menu-toggle"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              aria-expanded={mobileOpen}
              aria-controls="site-nav"
            >
              {mobileOpen ? <X /> : <MenuIcon />}
            </button>
            <TempleBell className="bell-right" />
          </div>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <LotusMandala className="hero-mandala hero-mandala-top" />
          <LotusMandala className="hero-mandala hero-mandala-bottom" />
          <div className="hero-grain" aria-hidden="true" />
          <div className="hero-photo" data-hero-photo="a">
            <div className="hero-photo-inner">
              {heroSlides.map((slide, index) => (
                <img
                  key={slide.name}
                  src={slide.src}
                  alt={index === heroIndex ? slide.alt : ''}
                  aria-hidden={index === heroIndex ? undefined : true}
                  className={index === heroIndex ? 'is-active' : undefined}
                  style={{ objectPosition: slide.position }}
                  width="1400"
                  height="933"
                />
              ))}
            </div>
            <div className="hero-photo-fade" aria-hidden="true" />
            <div className="hero-photo-glow" aria-hidden="true" />
            <div className="hero-photo-tag">
              <span>Signature</span>
              <strong key={heroSlides[heroIndex].name}>{heroSlides[heroIndex].name}</strong>
            </div>
          </div>
          <MarigoldPetals />
          <TempleBorder position="top" />
          <div className="container hero-grid">
            <div className="hero-copy">
              <span className="hero-kicker">Authentic Indian Cuisine</span>
              <h1>Jaathara</h1>
              <div className="hero-subtitle">Indian Cuisine</div>
              <p className="hero-tagline">A Feast of Authentic Indian Flavors</p>
              <p className="hero-lead">
                Authentic Telangana and Hyderabadi flavours, cooked fresh every day and served with the joy of a village jathara, right here in Sandy, Utah.
              </p>
              <LotusRule light />
              <div className="hero-buttons">
                <button className="btn btn-gold" onClick={() => goTo('menu')}>
                  <Utensils size={16} /> View Menu <ArrowRight size={15} />
                </button>
                <button className="btn btn-outline-gold" onClick={openReserve}>
                  <CalendarDays size={16} /> Reserve a Table
                </button>
              </div>
              <div className="hero-trust">
                <span><MapPin size={13} /> Sandy, Utah</span>
                <span className="dot" />
                <span><Clock3 size={13} /> Open 11:00 AM – 11:00 PM, daily</span>
              </div>
            </div>
          </div>
          <div className="container hero-pills-wrap">
            <div className="feature-pills" data-reveal>
              {features.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="feature-pill" key={item.title}>
                    <Icon strokeWidth={1.6} />
                    <span>{item.lines[0]}<br />{item.lines[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="specialties section-pad" id="specialties">
          <div className="container">
            <SectionHeading eyebrow="From our jathara kitchen" title="Explore Our Specialties" />
            <div className="specialty-grid">
              {specialties.map((item, i) => (
                <button
                  type="button"
                  className="specialty-card"
                  key={item.name}
                  onClick={() => openCategory(item.category)}
                  data-reveal
                  style={{ transitionDelay: `${i * 0.07}s` }}
                >
                  <div className="specialty-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="specialty-label">
                    <h3>{item.name}</h3>
                    <span className="specialty-link">View dishes <ArrowRight size={14} /></span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="celebrate" id="celebrate">
          <LotusMandala className="celebrate-mandala celebrate-mandala-left" />
          <LotusMandala className="celebrate-mandala celebrate-mandala-right" />
          <div className="celebrate-leaves" aria-hidden="true" />
          <div className="container celebrate-inner">
            <div className="celebrate-copy" data-reveal>
              <h2>Dine, Celebrate &amp;<br />Make It a <em>Jaathara!</em></h2>
              <p>Perfect for family dinners, get-togethers, corporate events &amp; special occasions.</p>
            </div>
            <div className="celebrate-services" data-reveal>
              {services.map((item) => {
                const Icon = item.icon;
                return (
                  <div className="service-item" key={item.title}>
                    <Icon strokeWidth={1.5} />
                    <strong>{item.title}<br />{item.sub}</strong>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="gallery section-pad" id="gallery">
          <img src={clipMerry} alt="" aria-hidden="true" className="gallery-clip gallery-clip-tl" />
          <img src={clipSugarcane} alt="" aria-hidden="true" className="gallery-clip gallery-clip-br" />
          <div className="container">
            <SectionHeading eyebrow="Moments from the jathara" title="Our Gallery" />
            <div className="gallery-mosaic" data-reveal>
              <figure className="g-a"><img src={food.biryani} alt="Hyderabadi dum biryani" loading="lazy" /><figcaption><small>Chef's Pride</small>The Royal Biryani Handi</figcaption></figure>
              <figure className="g-b"><img src={food.diningServe} alt="Service in the dining room" loading="lazy" /><figcaption><small>Interiors</small>Heritage Corner</figcaption></figure>
              <figure className="g-c"><img src={food.samosa} alt="Golden samosas with chutney" loading="lazy" /><figcaption><small>Starters</small>Festival Snacks</figcaption></figure>
              <figure className="g-d"><img src={food.diningWarm} alt="Warm evening dining room" loading="lazy" /><figcaption><small>Ambience</small>An Evening at the Feast</figcaption></figure>
              <figure className="g-e"><img src={food.tandoori} alt="Tandoori kebabs on the grill" loading="lazy" /><figcaption><small>Tandoor</small>From the Coals</figcaption></figure>
              <figure className="g-f"><img src={food.diningRoom} alt="Restaurant dining room" loading="lazy" /><figcaption><small>Dine-in</small>A Seat at Jaathara</figcaption></figure>
              <figure className="g-g"><img src={food.thali} alt="Festival thali with roti and curries" loading="lazy" /><figcaption><small>Thali</small>The Festival Feast</figcaption></figure>
              <figure className="g-h"><img src={food.restaurant} alt="Jaathara dining room" loading="lazy" /><figcaption><small>Our Space</small>The Hall</figcaption></figure>
            </div>
          </div>
        </section>
        <section className="about section-pad" id="about">
          <Charminar className="ornament charminar-about" />
          <div className="container about-grid">
            <div className="about-photo" data-reveal>
              <img src={food.restaurant} alt="Jaathara dining room" />
              <span className="photo-tag">Sandy · Utah</span>
            </div>
            <div className="about-copy" data-reveal="right">
              <span className="eyebrow">Our story</span>
              <h2>About Jaathara</h2>
              <LotusRule />
              <p>
                At Jaathara Indian Cuisine, we bring the rich and diverse flavors of India to your table.
                From timeless classics to regional specialties, every dish is prepared with authentic recipes,
                fresh ingredients, and a passion for great food.
              </p>
              <p className="about-aside">
                A Telangana jathara of pasupu, kumkuma and authentic flavours — a hall dressed for celebration,
                and a kitchen that cooks as if the fair were in full swing.
              </p>
              <button className="btn btn-red" onClick={() => goTo('contact')}>
                Know More <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="feast section-pad" id="feast">
          <img className="clip feast-clip feast-clip-tr" src={clipSweetStall} alt="" aria-hidden="true" loading="lazy" />
          <img className="clip feast-clip feast-clip-bl" src={clipFlowerStall} alt="" aria-hidden="true" loading="lazy" />
          <div className="container feast-grid">
            <div className="feast-photo" data-reveal>
              <img src={food.thali} alt="Jaathara festival thali with roti, dal and curries" />
            </div>
            <div className="feast-copy" data-reveal="right">
              <span className="eyebrow">The table, laid for celebration</span>
              <h2>The Festival Feast</h2>
              <LotusRule />
              <p>
                A Jaathara thali is a jathara in miniature: dum biryani, gongura, tandoori from the coals,
                breads still warm, and a festival sweet to close the meal. It is food meant to be passed
                around a long table.
              </p>
              <ul className="feast-list">
                {feastItems.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <button className="btn btn-red" onClick={openReserve}>
                <CalendarDays size={16} /> Reserve a Table
              </button>
            </div>
          </div>
        </section>

        <section className="menu-section section-pad" id="menu">
          <img className="clip clip-tr clip-balloon" src={clipBalloon} alt="" aria-hidden="true" loading="lazy" />
          <Mandala className="ornament mandala-tl faint" />
          <div className="container">
            <SectionHeading eyebrow="From the jathara kitchen" title="Explore Our Menu" />
            {categoryTabs.length > 1 && <div className="menu-filters" role="tablist" aria-label="Menu categories">
              {categoryTabs.map((cat) => (
                <button
                  key={cat}
                  role="tab"
                  aria-selected={!menuSearch && activeCategory === cat}
                  className={!menuSearch && activeCategory === cat ? 'is-active' : ''}
                  onClick={() => { setActiveCategory(cat); setMenuQuery(''); }}
                >
                  {cat}
                </button>
              ))}
            </div>}
            {dishes.length > 0 && (
              <div className="menu-toolbar">
                <p className="menu-count">
                  <strong>{menuSearch ? 'Search results' : activeCategory === 'All' ? 'All dishes' : activeCategory}</strong>
                  <span>{visibleDishes.length} {visibleDishes.length === 1 ? 'item' : 'items'}</span>
                </p>
                <div className="menu-search">
                <Search size={18} aria-hidden="true" />
                <input
                  type="search"
                  value={menuQuery}
                  onChange={(e) => setMenuQuery(e.target.value)}
                  placeholder="Search dishes"
                  aria-label="Search the menu"
                />
                {menuQuery && (
                  <button type="button" onClick={() => setMenuQuery('')} aria-label="Clear search"><X size={16} /></button>
                )}
              </div>
              </div>
            )}
            {menuStatus === 'loading' && (
              <p className="menu-footnote" role="status">Loading menu…</p>
            )}
            {menuSearch && visibleDishes.length === 0 && (
              <p className="menu-footnote" role="status">No dishes match "{menuQuery.trim()}". Try another name.</p>
            )}
            <div className="menu-list">
              {visibleDishes.map((dish) => (
                <article className="dish" key={dish.id || dish.name}>
                  <div className={`dish-thumb${dish.image ? '' : ' is-placeholder'}`}>
                    {dish.image ? <img src={dish.image} alt="" /> : <span className="thumb-lotus" aria-hidden="true" />}
                  </div>
                  <div className="dish-body">
                    <div className="dish-row">
                      <DietMark veg={dish.veg} />
                      <h3>{dish.name}</h3>
                      <span className="dish-rule" aria-hidden="true" />
                      <span className="dish-price">
                        <span className="price-value">$ {dish.priceValue}</span>
                      </span>
                    </div>
                    <p>{dish.desc || dish.description}</p>
                  </div>
                </article>
              ))}
            </div>
            <p className="menu-footnote">
              {!menuLive && menuStatus !== 'loading' && 'Our menu is being updated. Please check back soon or call us to order.'}
              {activeCategory !== 'All' && (
                <>
                  {' '}
                  <button type="button" className="text-link" onClick={() => setActiveCategory('All')}>
                    View the full menu <ArrowRight size={14} />
                  </button>
                </>
              )}
            </p>
          </div>
        </section>

        {specialCards.length > 0 && (
        <section className="specials section-pad" id="specials">
          <div className="container">
            <SectionHeading eyebrow="Handpicked for you" title="Jathara Specials" />
            <p className="specials-lead" data-reveal>Handpicked plates that taste like a temple fair in full colour.</p>
            <div className="special-marquee"><div className="special-cards special-track">
              {[...specialCards, ...specialCards].map((item, i) => (
                <article className="special-card" key={`${item.name}-${i}`} aria-hidden={i >= specialCards.length ? true : undefined}>
                  <div className="special-image">
                    {item.image
                      ? <img src={item.image} alt={item.name} />
                      : <span className="thumb-lotus" aria-hidden="true" />}
                    <DietMark veg={item.veg} />
                  </div>
                  <h3>{item.name}</h3>
                  <p>{item.note}</p>
                  <span className="dish-price special-price">
                    <span className="price-value">$ {item.priceValue}</span>
                  </span>
                </article>
              ))}
            </div></div>
          </div>
        </section>
        )}

        <section className="catering-section section-pad" id="catering">
          <div className="container">
            <SectionHeading eyebrow="Catering by Jaathara" title="Catering for Every Celebration" />
            <p className="section-lead-center" data-reveal>From office lunches to wedding feasts, we bring the jathara kitchen to your venue.</p>
            <div className="catering-grid">
              <div className="catering-feature" data-reveal style={{ '--cat-bg': `url(${food.thali})` }}>
                <span className="catering-kicker">Custom menus</span>
                <h3>Authentic jathara flavours, served at your celebration</h3>
                <ul className="catering-points">
                  <li><ChefHat size={16} /> Menus planned with our chefs</li>
                  <li><Truck size={16} /> Drop-off trays or full service</li>
                  <li><Leaf size={16} /> Veg, non-veg and satvik options</li>
                </ul>
                <div className="catering-actions">
                  <a className="btn btn-gold" href="tel:+13856148117"><Phone size={16} /> Call for a Quote</a>
                  <a className="btn btn-ghost-light" href="mailto:jaatharautah@gmail.com?subject=Catering%20enquiry"><Mail size={16} /> Email Us</a>
                </div>
              </div>
              <div className="catering-services">
                {cateringServices.map(({ icon: Icon, title, text }) => (
                  <article className="catering-card" key={title} data-reveal>
                    <span className="catering-ico"><Icon size={22} /></span>
                    <h4>{title}</h4>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
            <ol className="catering-steps" data-reveal>
              {cateringSteps.map((step, i) => (
                <li key={step.title}>
                  <span className="step-num">{i + 1}</span>
                  <div><strong>{step.title}</strong><p>{step.text}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="events-section section-pad" id="events">
          <img className="clip clip-tr" src={clipWheel} alt="" aria-hidden="true" loading="lazy" />
          <div className="container">
            <SectionHeading eyebrow="Celebrate with us" title="Events at Jaathara" />
            <p className="section-lead-center" data-reveal>Festival nights, live kitchens and private parties, all with the colour of a village jathara.</p>
            <div className="events-grid">
              {events.map(({ icon: Icon, tag, title, text, image }) => (
                <article className="event-card" key={title} data-reveal>
                  <div className="event-image">
                    <img src={image} alt={title} loading="lazy" />
                    <span className="event-tag"><Icon size={14} /> {tag}</span>
                  </div>
                  <div className="event-body">
                    <h4>{title}</h4>
                    <p>{text}</p>
                    <a className="event-link" href="#reserve">Enquire now <ArrowRight size={14} /></a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="testimonials section-pad">
          <img className="clip clip-br" src={clipKolatam} alt="" aria-hidden="true" loading="lazy" />
          <div className="container testimonial-wrap">
            <div className="testimonial-title" data-reveal>
              <span className="eyebrow">Kind words</span>
              <h2>What Our <em>Guests Say</em></h2>
              <LotusRule />
            </div>
            {reviews.map((review) => (
              <blockquote className="quote-card" key={review.initials} data-reveal>
                <span className="quote-mark" aria-hidden="true">“</span>
                <p>{review.text}</p>
                <footer className="quote-person">
                  <span className="avatar" aria-hidden="true">{review.initials}</span>
                  <div>
                    <strong>{review.name}</strong>
                    <small>Guest</small>
                  </div>
                  <span className="stars" aria-label="Five stars">★★★★★</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </section>

        <section className="cta-band section-pad" id="reserve">
          <div className="container cta-grid">
            <div className="cta-card cta-order" data-reveal style={{ '--cta-bg': `url(${heroMain})` }}>
              <span className="eyebrow">The jathara, at home</span>
              <h2>Takeaway &amp; <em>Delivery</em></h2>
              <p>Enjoy the jathara at home {'\u2014'} biryani, curries and festival sweets, packed fresh from our kitchen.</p>
              <ul className="cta-tags">
                <li>Biryani</li>
                <li>Curries</li>
                <li>Tandoori</li>
                <li>Sweets</li>
              </ul>
              <button
                className="btn btn-gold"
                onClick={openOrder}
              >
                <ShoppingBag size={16} /> Order Online <ArrowRight size={15} />
              </button>
            </div>
            <div className="cta-card cta-reserve" data-reveal="right">
              <span className="eyebrow">A seat at the feast</span>
              <h2>Reserve a <em>Table</em></h2>
              <p>Family meals, celebrations and catering for gatherings {'\u2014'} book an evening at Jaathara.</p>
              <ul className="cta-info">
                <li><span className="cta-ico"><Phone size={16} /></span><div><small>Call us</small><a href="tel:+13856148117">+1 (385) 614-8117</a></div></li>
                <li><span className="cta-ico"><Clock3 size={16} /></span><div><small>Open daily</small><b>11:00 AM {'\u2013'} 11:00 PM</b></div></li>
                <li><span className="cta-ico"><MapPin size={16} /></span><div><small>Visit us</small><b>9460 S Union Square, Suite 104, Sandy, UT</b></div></li>
              </ul>
              <div className="reserve-actions">
                <a className="btn btn-red" href="tel:+13856148117">
                  <Phone size={16} /> Call to Reserve
                </a>
                <button
                  className="btn btn-outline"
                  onClick={openReserve}
                >
                  <CalendarDays size={16} /> Request a Table
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="contact">
        <div className="footer-trim" aria-hidden="true" />
        <img className="footer-kolam footer-kolam-left" src={kolamFooterA} alt="" aria-hidden="true" />
        <img className="footer-kolam footer-kolam-right" src={kolamFooterB} alt="" aria-hidden="true" />
        <div className="container footer-cta">
          <div>
            <span className="footer-cta-kicker">Planning a celebration?</span>
            <h3>Let Jaathara cater your next event</h3>
          </div>
          <div className="footer-cta-actions">
            <a className="btn btn-gold" href="tel:+13856148117"><Phone size={16} /> +1 (385) 614-8117</a>
            <a className="btn btn-ghost-light" href="mailto:jaatharautah@gmail.com?subject=Catering%20enquiry"><Mail size={16} /> Get a Quote</a>
          </div>
        </div>
        <div className="container footer-main footer-main-wide">
          <div className="footer-brand">
            <img src={emblem} alt="Jaathara emblem" />
            <p>Authentic Indian cuisine, cooked fresh daily and served with festival warmth in Sandy, Utah.</p>
            <div className="footer-social">
              <a href="#contact" aria-label="Instagram"><Instagram size={16} /></a>
              <a href="#contact" aria-label="Facebook"><Facebook size={16} /></a>
              <a href="#contact" aria-label="YouTube"><Youtube size={16} /></a>
            </div>
          </div>
          <div className="footer-col">
            <h3>Explore</h3>
            <nav className="footer-links">
              <a href="#home">Home</a>
              <a href="#menu">Menu</a>
              <a href="#specials">Jathara Specials</a>
              <a href="#about">About Us</a>
              <a href="#gallery">Gallery</a>
              <a href="#reserve">Reservations</a>
            </nav>
          </div>
          <div className="footer-col">
            <h3>Catering</h3>
            <nav className="footer-links">
              <a href="#catering">Corporate Catering</a>
              <a href="#catering">Weddings & Sangeet</a>
              <a href="#catering">Birthdays & Parties</a>
              <a href="#catering">Community Gatherings</a>
              <a href="#catering">Party Trays</a>
            </nav>
          </div>
          <div className="footer-col">
            <h3>Events</h3>
            <nav className="footer-links">
              <a href="#events">Festival Nights</a>
              <a href="#events">Live Tandoor Evenings</a>
              <a href="#events">Private Dining</a>
              <a href="#events">Hall Booking</a>
            </nav>
          </div>
          <div className="footer-col">
            <h3>Get in Touch</h3>
            <p className="footer-row"><MapPin size={16} /><span>9460 S Union Square, Suite 104<br />Sandy, UT 84070</span></p>
            <a className="footer-row" href="tel:+13856148117"><Phone size={16} /><span>+1 (385) 614-8117</span></a>
            <a className="footer-row" href="mailto:jaatharautah@gmail.com"><Mail size={16} /><span>jaatharautah@gmail.com</span></a>
            <p className="footer-row"><Clock3 size={16} /><span>Mon {'\u2013'} Sun, 11:00 AM {'\u2013'} 11:00 PM</span></p>
            <a className="footer-map" href="https://www.google.com/maps/search/?api=1&query=9460+S+Union+Square+Suite+104+Sandy+UT+84070" target="_blank" rel="noreferrer">Get directions <ArrowRight size={14} /></a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="container">
            <span>{'\u00a9'} 2026 Jaathara Indian Cuisine. All rights reserved.</span>
            <span className="footer-legal"><a href="#privacy-policy">Privacy Policy</a><a href="#terms">Terms &amp; Conditions</a></span>
          </div>
        </div>
      </footer>
      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        onSuccess={showNotice}
        onError={showNotice}
        dishes={dishes}
      />
      <ReserveModal
        open={reserveOpen}
        onClose={() => setReserveOpen(false)}
        onSuccess={showNotice}
        onError={showNotice}
      />
      <OrderChatWidget
        dishes={dishes}
        onOrderPlaced={showNotice}
        onError={showNotice}
      />
      {notice && <div className="toast" role="status">{notice}</div>}
    </>
  );
}

export default App;
