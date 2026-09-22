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

const match = await page.evaluate((want) => {
  const target = want.toLowerCase();
  const items = [...document.querySelectorAll('[role="listitem"]')];
  for (const li of items) {
    const raw = (li.innerText || '').trim();
    const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const rowName = (lines[0] || '').toLowerCase();
    if (!rowName || rowName.length < 2) continue;
    // Match exact or row contains query — never query.contains(row) (empty/short rows false-positive)
    if (rowName === target || rowName.includes(target)) {
      return { found: true, name: lines[0], raw: raw.slice(0, 200) };
    }
  }
  return { found: false, name: null, available: items.map((li) => {
    const lines = (li.innerText || '').trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
    return lines[0] || null;
  }).filter(Boolean) };
}, name);

if (!match.found) {
  return {
    opened: false,
    notFound: true,
    name,
    matchedName: null,
    available: match.available || [],
    url: page.url().split('?')[0],
  };
}

await page.locator('[role="listitem"]').filter({ hasText: match.name }).first().click({ timeout: 10000 }).catch(async () => {
  await page.evaluate((want) => {
    const target = want.toLowerCase();
    const li = [...document.querySelectorAll('[role="listitem"]')].find((el) => {
      const n = ((el.innerText || '').trim().split(/\n+/)[0] || '').toLowerCase();
      return n.length >= 2 && (n === target || n.includes(target));
    });
    const btn = li?.querySelector('[role="button"]') || li;
    btn?.click();
  }, match.name);
});

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
  name,
  matchedName: match.name,
  composerHint: !!after.composerHint,
  tooManyTabs: !!after.tooManyTabs,
  url: page.url().split('?')[0],
  title: after.title,
};
