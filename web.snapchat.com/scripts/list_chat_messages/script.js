page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(45000);

const WEB_URL = 'https://www.snapchat.com/web/';
const limit = Math.min(50, Math.max(1, Number(args.limit) || 20));
const name = args.name != null ? String(args.name).trim() : '';

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

let openedName = null;
let notFound = false;

if (name) {
  const match = await page.evaluate((want) => {
    const target = want.toLowerCase();
    for (const li of document.querySelectorAll('[role="listitem"]')) {
      const lines = (li.innerText || '').trim().split(/\n+/).map((l) => l.trim()).filter(Boolean);
      const rowName = (lines[0] || '').toLowerCase();
      if (!rowName || rowName.length < 2) continue;
      if (rowName === target || rowName.includes(target)) {
        return { found: true, name: lines[0] };
      }
    }
    return { found: false };
  }, name);

  if (!match.found) {
    return {
      opened: false,
      notFound: true,
      name,
      count: 0,
      messages: [],
      note: 'chat not found in list',
      url: page.url().split('?')[0],
    };
  }
  openedName = match.name;
  await page.locator('[role="listitem"]').filter({ hasText: match.name }).first().click({ timeout: 10000 }).catch(async () => {
    await page.evaluate((want) => {
      const target = want.toLowerCase();
      const li = [...document.querySelectorAll('[role="listitem"]')].find((el) => {
        const n = ((el.innerText || '').trim().split(/\n+/)[0] || '').toLowerCase();
        return n.length >= 2 && (n === target || n.includes(target));
      });
      (li?.querySelector('[role="button"]') || li)?.click();
    }, match.name);
  });
  await page.waitForTimeout(3500);
  await dismissTooManyTabs();
  await page.waitForTimeout(2000);
}

const scraped = await page.evaluate((max) => {
  const tooManyTabs = /Too many tabs/i.test(document.body?.innerText || '');
  if (tooManyTabs) return { tooManyTabs: true, messages: [], note: 'blocked by single-tab modal' };

  const skip = /^(Click the Camera|Create Bitmoji|Search|View|My AI|Team Snapchat|Friends Feed|Received|New Chat|New Chats|install the Desktop|Oops|Close Chat|Say Hi|Okay|SEPTEMBER|to always have access)/i;
  const messages = [];
  const seen = new Set();

  // Prefer leaf text nodes that look like chat bubbles
  for (const el of document.querySelectorAll('div, span, p')) {
    if (el.children.length > 0) continue;
    const t = (el.innerText || '').trim();
    if (t.length < 2 || t.length > 500) continue;
    if (skip.test(t)) continue;
    if (/^\d+[smhd]$/i.test(t)) continue;
    if (/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(t)) continue;
    if (/^[0-9.]+[MK]?$/.test(t)) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    messages.push({ text: t, from: null, when: null, type: 'text' });
    if (messages.length >= max) break;
  }

  const composer = [...document.querySelectorAll('[aria-label]')].some((el) =>
    /send this text/i.test(el.getAttribute('aria-label') || ''),
  );

  return {
    tooManyTabs: false,
    messages,
    composerHint: composer,
    note: messages.length === 0
      ? 'no text bubbles visible (Web UI may show camera pane / virtualized history)'
      : null,
  };
}, limit);

return {
  opened: !scraped.tooManyTabs && (name ? !notFound : true),
  notFound: false,
  name: openedName || name || null,
  count: scraped.messages.length,
  messages: scraped.messages,
  composerHint: !!scraped.composerHint,
  tooManyTabs: !!scraped.tooManyTabs,
  note: scraped.note,
  url: page.url().split('?')[0],
};
