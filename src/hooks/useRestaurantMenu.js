import { useEffect, useMemo, useRef, useState } from 'react';
import { getMenu } from '../lib/restaurantApi';

/**
 * Loads live menu from Restaurant Server (Admin → Menus).
 * Falls back to the static showcase menu until the site slug is linked.
 */
export function useRestaurantMenu(fallbackDishes = []) {
  const fallbackRef = useRef(fallbackDishes);
  fallbackRef.current = fallbackDishes;

  const [items, setItems] = useState(fallbackDishes);
  const [categories, setCategories] = useState([]);
  const [restaurantName, setRestaurantName] = useState('');
  const [status, setStatus] = useState('loading'); // loading | live | fallback
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStatus('loading');
      setError('');
      try {
        const data = await getMenu();
        if (cancelled) return;
        if (!data.items?.length) {
          setItems(fallbackRef.current);
          setCategories([]);
          setStatus('fallback');
          setError('No menu items in Restaurant Admin yet — showing sample dishes.');
          return;
        }
        setItems(data.items);
        setCategories(data.categories || []);
        setRestaurantName(data.restaurantName || '');
        setStatus('live');
      } catch (err) {
        if (cancelled) return;
        setItems(fallbackRef.current);
        setCategories([]);
        setStatus('fallback');
        setError(err.message || 'Could not load restaurant menu');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryTabs = useMemo(() => {
    const fromLive = categories.length
      ? categories
      : [...new Set(items.map((d) => d.category).filter(Boolean))];
    return ['All', ...fromLive];
  }, [categories, items]);

  const specials = useMemo(() => {
    const ranked = [...items]
      .filter((d) => d.available !== false)
      .sort((a, b) => Number(b.ordersCount || 0) - Number(a.ordersCount || 0));
    const withImage = ranked.filter((d) => d.image);
    const pick = (withImage.length >= 3 ? withImage : ranked).slice(0, 3);
    return pick.map((d) => ({
      name: d.name,
      note: d.desc || d.description || '',
      image: d.image,
      veg: d.veg,
      priceValue: d.priceValue,
    }));
  }, [items]);

  return {
    dishes: items,
    categoryTabs,
    specials,
    restaurantName,
    status,
    error,
    isLive: status === 'live',
  };
}
