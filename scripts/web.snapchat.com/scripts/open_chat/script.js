page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(45000);

const WEB_URL = 'https://www.snapchat.com/web/';
const name = String(args.name || '').trim();
if (!name) throw new Error('name is required (display name from list_chats)');

async function dismissTooManyTabs() {
  for (let i = 0; i < 4; i++) {
    const tooMany = await page.evaluate(() => /Too many tabs/i.test(document.body?.innerText || ''));
    if (!tooMany) return;
    await page.mouse.click(480, 340);
    await page.waitForTimeout(1500);
  }
}

await builtins.goto(WEB_URL, { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(2500);
await dismissTooManyTabs();

await page.waitForFunction(() => {
  return document.querySelectorAll('[role="listitem"]').length > 0
    || /Too many tabs|log in|sign in/i.test(document.body?.innerText || '');
}, { timeout: 20000 }).catch(() => {});

await dismissTooManyTabs();
await page.waitForTimeout(1500);

// Exact (case-insensitive) wins; else a single partial match; several partial → ambiguous.
const match = await page.evaluate((want) => {
  const target = want.toLowerCase();
  const rows = [...document.querySelectorAll('[role="listitem"]')]
    .map((li, index) => ({ index, label: ((li.innerText || '').trim().split(/\n+/)[0] || '').trim() }))
    .filter((r) => r.label.length >= 2);
  const available = rows.map((r) => r.label);
  const exact = rows.filter((r) => r.label.toLowerCase() === target);
  const partial = rows.filter((r) => r.label.toLowerCase() !== target && r.label.toLowerCase().includes(target));
  const hit = exact.length === 1 ? exact[0] : exact.length === 0 && partial.length === 1 ? partial[0] : null;
  if (hit) return { status: 'found', name: hit.label, index: hit.index, available };
  const candidates = (exact.length > 1 ? exact : partial).map((r) => r.label);
  return { status: candidates.length > 1 ? 'ambiguous' : 'notFound', candidates, available };
}, name);

if (match.status !== 'found') {
  return {
    opened: false,
    notFound: match.status === 'notFound',
    ambiguous: match.status === 'ambiguous',
    candidates: match.candidates,
    name,
    matchedName: null,
    available: match.available || [],
    url: page.url().split('?')[0],
  };
}

// Click the row whose name is exactly the match — hasText alone can hit a row that only mentions it.
await page
  .locator('[role="listitem"]')
  .filter({ has: page.getByText(match.name, { exact: true }) })
  .first()
  .click({ timeout: 10000 })
  .catch(() => page.locator('[role="listitem"]').nth(match.index).click({ timeout: 10000 }));

// Human-paced delay after open
await page.waitForTimeout(3000);
await dismissTooManyTabs();
await page.waitForTimeout(2000);

const after = await page.evaluate((want) => {
  const tooManyTabs = /Too many tabs/i.test(document.body?.innerText || '');
  const composer = [...document.querySelectorAll('[aria-label]')].some((el) => {
    const a = el.getAttribute('aria-label') || '';
    return /send this text/i.test(a) || new RegExp(want, 'i').test(a);
  });
  return { tooManyTabs, composerHint: composer, title: document.title || '' };
}, name);

return {
  opened: !after.tooManyTabs,
  notFound: false,
  ambiguous: false,
  name,
  matchedName: match.name,
  composerHint: !!after.composerHint,
  tooManyTabs: !!after.tooManyTabs,
  url: page.url().split('?')[0],
  title: after.title,
};
