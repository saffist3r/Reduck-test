page.setDefaultNavigationTimeout(90000);
page.setDefaultTimeout(45000);

const SPORTS = new Set(['tennis','padel','badminton','squash','pickleball','table-tennis']);
const sport = String(args.sport || 'tennis').toLowerCase();
if (!SPORTS.has(sport)) throw new Error(`unsupported sport: ${sport}`);
const locationSlug = String(args.location_slug || '').trim();
if (!locationSlug) throw new Error('location_slug is required (from search_locations)');
if (locationSlug.startsWith('club/')) throw new Error('location_slug must be a city slug (e.g. paris-75000-fr); use get_club for a club');
const pageNum = Math.max(1, Number(args.page) || 1);
const date = args.date ? String(args.date).trim() : null;
if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('date must be YYYY-MM-DD');

let path = `/fr/${sport}/${locationSlug}`;
if (pageNum > 1) path += `/page/${pageNum}`;
const qs = date ? `?date=${encodeURIComponent(date)}` : '';
const url = `https://www.anybuddyapp.com${path}${qs}#terrains-disponibles`;

await builtins.goto(url, { waitUntil: 'domcontentloaded' });

// Open listings if the city landing CTA is still showing
const needsOpen = await page.evaluate(() => {
  const hasList = [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
    try {
      const j = JSON.parse(s.textContent);
      return j && j['@type'] === 'ItemList' && j.itemListElement?.[0]?.item?.['@type'] === 'SportsActivityLocation';
    } catch { return false; }
  });
  if (hasList) return false;
  const btn = [...document.querySelectorAll('a,button')].find(el => /terrains disponibles/i.test(el.innerText || ''));
  if (btn) { btn.click(); return true; }
  return false;
});
await page.waitForFunction(() => {
  return [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
    try {
      const j = JSON.parse(s.textContent);
      return j && j['@type'] === 'ItemList' && j.itemListElement?.[0]?.item?.['@type'] === 'SportsActivityLocation';
    } catch { return false; }
  });
}, { timeout: 30000 });

const data = await page.evaluate(({ sport }) => {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => { try { return JSON.parse(s.textContent); } catch { return null; } })
    .filter(Boolean);
  const ld = scripts.find(x => x['@type'] === 'ItemList' && x.itemListElement?.[0]?.item?.['@type'] === 'SportsActivityLocation');
  if (!ld) throw new Error('club ItemList JSON-LD not found — location_slug may be invalid');

  const body = document.body.innerText;
  const pageMatch = body.match(/Page\s+(\d+)\s+sur\s+(\d+)/i);
  const clubsMatch = body.match(/(\d+)\s+clubs?/i);

  const slotBySlug = new Map();
  for (const a of document.querySelectorAll('a[href*="/fr/club/"]')) {
    const href = a.getAttribute('href') || '';
    const m = href.match(/\/fr\/club\/([^/?#]+)/);
    if (!m) continue;
    const slug = m[1];
    if (slotBySlug.has(slug)) continue;
    const name = (a.innerText || '').trim();
    if (!name || /^Voir\b/i.test(name)) continue;
    let card = a.parentElement;
    let chosen = null;
    for (let i = 0; i < 12 && card; i++) {
      const t = card.innerText || '';
      const slugsInCard = new Set(
        [...card.querySelectorAll('a[href*="/fr/club/"]')]
          .map(x => (x.getAttribute('href') || '').match(/\/fr\/club\/([^/?#]+)/)?.[1])
          .filter(Boolean)
      );
      if (slugsInCard.size > 1) break;
      if (t.includes('€') && /\d{1,2}:\d{2}/.test(t) && slugsInCard.size === 1) {
        chosen = card;
        break;
      }
      card = card.parentElement;
    }
    const text = (chosen?.innerText || '').trim();
    const slots = [];
    const slotRe = /(\d{1,2}:\d{2})\s*[\n\r]+\s*(\d+)\s*€\s*[\n\r]+\s*(\d+)\s*min/g;
    let sm;
    while ((sm = slotRe.exec(text)) && slots.length < 40) {
      slots.push({ time: sm[1], priceEur: +sm[2], durationMin: +sm[3] });
    }
    const dist = text.match(/(\d+(?:[.,]\d+)?)\s*km/i)?.[1];
    slotBySlug.set(slug, {
      slots,
      distanceKm: dist ? parseFloat(dist.replace(',', '.')) : null,
    });
  }

  const clubs = (ld.itemListElement || []).map((el) => {
    const item = el.item || {};
    const slug = (item.url || item['@id'] || '').match(/\/club\/([^/?#]+)/)?.[1] || null;
    const extra = slug ? slotBySlug.get(slug) : null;
    const priceRange = item.priceRange || null;
    const fromPriceEur = priceRange ? parseInt(String(priceRange).replace(/[^0-9]/g, ''), 10) : null;
    return {
      slug,
      name: item.name || null,
      url: item.url || (slug ? `https://www.anybuddyapp.com/fr/club/${slug}/${sport}` : null),
      address: item.address?.streetAddress || null,
      city: item.address?.addressLocality || null,
      country: item.address?.addressCountry || null,
      lat: item.geo?.latitude ?? null,
      lon: item.geo?.longitude ?? null,
      rating: item.aggregateRating?.ratingValue ?? null,
      reviewCount: item.aggregateRating?.reviewCount ?? null,
      fromPriceEur: Number.isFinite(fromPriceEur) ? fromPriceEur : null,
      image: item.image || null,
      distanceKm: extra?.distanceKm ?? null,
      slots: extra?.slots || [],
    };
  }).filter(c => c.slug);

  return {
    totalClubs: clubsMatch ? +clubsMatch[1] : null,
    page: pageMatch ? { current: +pageMatch[1], total: +pageMatch[2] } : { current: 1, total: 1 },
    clubs,
  };
}, { sport });

return {
  sport,
  location_slug: locationSlug,
  date,
  page: data.page.current,
  totalPages: data.page.total,
  totalClubs: data.totalClubs,
  count: data.clubs.length,
  clubs: data.clubs,
  url: page.url(),
};
