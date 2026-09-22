page.setDefaultNavigationTimeout(90000);
page.setDefaultTimeout(45000);

const SPORTS = new Set(['tennis','padel','badminton','squash','pickleball','table-tennis']);
const sport = String(args.sport || 'tennis').toLowerCase();
if (!SPORTS.has(sport)) throw new Error(`unsupported sport: ${sport}`);
const locationSlug = String(args.location_slug || '').trim();
if (!locationSlug) throw new Error('location_slug is required (from search_locations)');
if (locationSlug.startsWith('club/')) throw new Error('location_slug must be a city slug');

const url = `https://www.anybuddyapp.com/fr/${sport}/${locationSlug}/matchs`;
const nav = await page.goto(url, { waitUntil: 'domcontentloaded' });
const httpStatus = nav ? nav.status() : null;

if (httpStatus === 404) {
  return {
    sport,
    location_slug: locationSlug,
    notFound: true,
    openMatches: null,
    openSpots: null,
    count: 0,
    matches: [],
    url: page.url().split('?')[0],
  };
}

await page.waitForFunction(() => {
  const body = document.body?.innerText || '';
  if (document.querySelector('a[href*="/fr/match/"]')) return true;
  if (/PAGE INTROUVABLE/i.test(body)) return true;
  if (/\b0\s+match/i.test(body)) return true;
  if (/Aucun match/i.test(body)) return true;
  if (location.pathname.includes('/matchs') && body.length > 400) return true;
  return false;
}, { timeout: 20000 });

const data = await page.evaluate(() => {
  const body = document.body.innerText || '';
  if (/PAGE INTROUVABLE/i.test(body)) {
    return { notFound: true, openMatches: null, openSpots: null, matches: [] };
  }

  const openMatch = body.match(/(\d+)\s+matchs?\s+ouverts?/i)?.[1];
  const openSpots = body.match(/(\d+)\s+places?\s+disponibles?/i)?.[1];
  const openMatches = openMatch != null
    ? +openMatch
    : (/Aucun match ouvert/i.test(body) ? 0 : null);
  const openSpotsN = openSpots != null
    ? +openSpots
    : (/Aucune place disponible/i.test(body) ? 0 : null);

  const matches = [];
  const seen = new Set();
  for (const a of document.querySelectorAll('a[href*="/fr/match/"]')) {
    const href = a.getAttribute('href') || '';
    const id = href.match(/\/fr\/match\/([0-9a-f-]+)/i)?.[1];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const text = (a.innerText || '').trim();
    if (!text) continue;
    const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean).filter(l => l !== '·');
    const timeLine = lines.find(l => /^\d{1,2}:\d{2}$/.test(l)) || null;
    const dateLine = lines.find(l => /\b(janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|lun\.|mar\.|mer\.|jeu\.|ven\.|sam\.|dim\.)/i.test(l)) || null;
    const whenLine = [dateLine, timeLine].filter(Boolean).join(' · ') || null;
    const players = text.match(/(\d+)\s*\/\s*(\d+)\s*joueurs?/i);
    const price = text.match(/(\d+(?:[.,]\d+)?)\s*€/);
    const venue = lines.find(l =>
      l !== timeLine && l !== dateLine && !/joueurs/i.test(l) && !/€/.test(l) && !/^\d{1,2}:\d{2}$/.test(l) && l.length > 2
    ) || null;
    const address = lines.find(l =>
      l !== venue && l !== timeLine && l !== dateLine && /\d/.test(l) && l.length > 10 && !/joueurs/i.test(l) && !/€/.test(l)
    ) || null;
    matches.push({
      id,
      url: new URL(href, location.origin).href.split('?')[0],
      when: whenLine,
      venue,
      address,
      playersFilled: players ? +players[1] : null,
      playersTotal: players ? +players[2] : null,
      priceEur: price ? parseFloat(price[1].replace(',', '.')) : null,
    });
  }
  return { notFound: false, openMatches, openSpots: openSpotsN, matches };
});

return {
  sport,
  location_slug: locationSlug,
  notFound: !!data.notFound,
  openMatches: data.openMatches,
  openSpots: data.openSpots,
  count: data.matches.length,
  matches: data.matches,
  url: page.url().split('?')[0],
};
