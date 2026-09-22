page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(30000);

const query = String(args.query || '').trim();
if (!query) throw new Error('query is required');
const limit = Math.min(20, Math.max(1, Number(args.limit) || 10));

await builtins.goto('https://www.anybuddyapp.com/fr', { waitUntil: 'domcontentloaded' });

const url = `https://www.anybuddyapp.com/api/search-locations?query=${encodeURIComponent(query)}&limit=${limit}`;
const res = await page.evaluate(async (u) => {
  const r = await fetch(u, { credentials: 'include' });
  if (!r.ok) throw new Error(`search-locations HTTP ${r.status}`);
  return await r.json();
}, url);

const candidates = (res.candidates || []).map((c) => ({
  name: c.name,
  type: c.type,
  slug: c.slug,
  countryCode: c.countryCode ?? null,
  city: c.city ?? null,
  lat: c.location?.lat ?? null,
  lon: c.location?.lon ?? null,
  centerId: c.centerId ?? null,
}));

return { query, candidates };
