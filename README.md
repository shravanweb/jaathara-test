# Jaathara Indian Cuisine

A premium, festival-inspired restaurant landing page for Jaathara Indian Cuisine in ECIL, Hyderabad. Built with React, Vite and plain CSS.

The design follows a light cream, kumkuma-red and turmeric-gold Telangana jathara — mango-leaf thoranam, temple bells, gold mandalas, Charminar and palm watermarks — centred on food, in a high-end restaurant style.

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (default port **5174**). Restaurant Server should be running on `http://127.0.0.1:4000`.

## Production build

```bash
npm run build
npm run preview
```

---

## Connect to Restaurant Admin (no website .env)

Orders and reservations use **Restaurant Admin settings only**. There is no ingest secret on this site.

```
Jaathara Website  →  Restaurant Server /api/public/website/jaathara/*
                              ↑
              Admin → Settings → Website Connection slug = jaathara
```

### Steps

1. Open **Restaurant Admin**.
2. Create / open the Jaathara restaurant.
3. Add **Menus** (categories, items, prices, images) — these sync to the website.
4. Set hours and tables (needed for reservations).
5. **Settings → Website Connection** → set slug to **`jaathara`** (must match `SITE_SLUG` in `src/config.js`).
6. Save until you see **Linked: jaathara**.
7. On this site:
   - Menu section loads live items from Admin
   - **Order chat** (bottom-right) — chat + mic, Website Builder–style → Admin **Orders**
   - **Order Online** form → same Admin **Orders** path (`chat_widget`)
   - **Request a Table** → Admin **Reservations**

If Admin is not linked, the API returns:  
`No restaurant linked to website site slug "jaathara"`.

### Public API used by Jaathara

| Action | Endpoint |
|--------|----------|
| Menu sync | `GET /api/public/website/jaathara/menu` |
| Place order (form or chat) | `POST /api/public/website/jaathara/orders` |
| Availability | `GET /api/public/website/jaathara/availability` |
| Reserve table | `POST /api/public/website/jaathara/reservations` |

### Chat + voice orders

Floating **Order chat** widget (`OrderChatWidget`):

1. Guest asks for menu or names a dish  
2. Qty → spice → add more?  
3. Phone → name → address  
4. Place order → Restaurant Admin **Orders**

Mic = browser speech recognition; speaker toggle = spoken replies. Full kiosk “Meera” voice is separate (Admin pairing token).

**Connecting any other third-party site:** see  
[`Restaurant-Server/docs/THIRD_PARTY_WEBSITE.md`](../Restaurant-Server/docs/THIRD_PARTY_WEBSITE.md)  
(or the same file in the Restaurant-Server repo).

### Config in code (not secrets)

`src/config.js`:

- `SITE_SLUG` — must match Admin Website Connection
- `RESTAURANT_API_URL` — `http://127.0.0.1:4000` in dev, `https://restaurantapi.d3e.studio` in production

### Kiosk (optional)

Separate from the website slug: Admin → **Kiosk Hostess** → pairing token.

---

## Sample content

Replace before launch:

- Phone number (`+91 98765 43210`) and email (`hello@jaathara.com`) in `src/App.jsx`
- Street address (currently listed as ECIL, Hyderabad, Telangana, India)
- Menu `priceValue` amounts in `src/App.jsx` (sample placeholders for ordering)
- Stock photography (Unsplash, Pexels, and a Wikimedia Commons gulab jamun photograph — not the restaurant's own)
- Instagram, Facebook and YouTube links (they currently point to `#contact`)

The supplied Jaathara emblem is included at `src/assets/jaathara-emblem.png`.

Display type is **Rozha One** (headings site-wide), with **Cinzel** for kickers and **Cormorant Garamond** for italic taglines and quotes, paired with **Outfit** for body text.
