page.setDefaultNavigationTimeout(90000);
page.setDefaultTimeout(45000);

const SPORTS = new Set(['tennis','padel','badminton','squash','pickleball','table-tennis']);
const clubSlug = String(args.club_slug || '').trim().replace(/^club\//, '');
if (!clubSlug) throw new Error('club_slug is required');
const sport = args.sport ? String(args.sport).toLowerCase() : null;
if (sport && !SPORTS.has(sport)) throw new Error(`unsupported sport: ${sport}`);

const path = sport
  ? `/fr/club/${clubSlug}/${sport}`
  : `/fr/club/${clubSlug}`;
await builtins.goto(`https://www.anybuddyapp.com${path}`, { waitUntil: 'domcontentloaded' });

await page.waitForFunction(() => {
  return [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => {
    try { return JSON.parse(s.textContent)?.['@type'] === 'SportsActivityLocation'; }
    catch { return false; }
  });
}, { timeout: 30000 });

const club = await page.evaluate(() => {
  const scripts = [...document.querySelectorAll('script[type="application/ld+json"]')]
    .map(s => { try { return JSON.parse(s.textContent); } catch { return null; } })
    .filter(Boolean);
  const loc = scripts.find(x => x['@type'] === 'SportsActivityLocation');
  if (!loc) throw new Error('SportsActivityLocation JSON-LD not found');

  const slug = (loc.url || location.pathname).match(/\/club\/([^/?#]+)/)?.[1] || null;
  const offer = loc.makesOffer || null;
  const body = document.body.innerText;
  const terrains = body.match(/Terrains\s*\n\s*(\d+)/i)?.[1];
  const knownSports = new Set(['tennis','padel','badminton','squash','pickleball','table-tennis']);
  const sportsOnPage = [...new Set(
    [...document.querySelectorAll('a[href*="/fr/club/"]')]
      .map(a => (a.getAttribute('href') || '').match(/\/fr\/club\/[^/]+\/([a-z0-9-]+)/)?.[1])
      .filter(s => s && knownSports.has(s))
  )];

  return {
    slug,
    name: loc.name || null,
    description: loc.description || null,
    url: loc.url || location.href.split('?')[0],
    image: Array.isArray(loc.image) ? loc.image[0] : (loc.image || null),
    logo: loc.logo || null,
    address: loc.address?.streetAddress || null,
    city: loc.address?.addressLocality || null,
    postalCode: loc.address?.postalCode || null,
    country: loc.address?.addressCountry || null,
    lat: loc.geo?.latitude ?? null,
    lon: loc.geo?.longitude ?? null,
    rating: loc.aggregateRating?.ratingValue ?? null,
    reviewCount: loc.aggregateRating?.reviewCount ?? null,
    priceRange: loc.priceRange || null,
    lowPriceEur: offer?.lowPrice ?? null,
    highPriceEur: offer?.highPrice ?? null,
    currency: offer?.priceCurrency || null,
    courtCount: terrains ? +terrains : null,
    sports: sportsOnPage,
  };
});

return { club, sport: sport || null, url: page.url().split('?')[0] };
