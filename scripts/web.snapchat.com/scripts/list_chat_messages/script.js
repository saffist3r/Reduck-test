page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(45000);

const WEB_URL = 'https://www.snapchat.com/web/';
const limit = Math.min(50, Math.max(1, Number(args.limit) || 20));
const name = args.name != null ? String(args.name).trim() : '';
const since = args.since != null ? String(args.since).trim() : '';

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

if (name) {
  // Exact (case-insensitive) wins; else a single partial match; several partial → ambiguous.
  const match = await page.evaluate((want) => {
    const target = want.toLowerCase();
    const rows = [...document.querySelectorAll('[role="listitem"]')]
      .map((li, index) => ({ index, label: ((li.innerText || '').trim().split(/\n+/)[0] || '').trim() }))
      .filter((r) => r.label.length >= 2);
    const exact = rows.filter((r) => r.label.toLowerCase() === target);
    const partial = rows.filter((r) => r.label.toLowerCase() !== target && r.label.toLowerCase().includes(target));
    const hit = exact.length === 1 ? exact[0] : exact.length === 0 && partial.length === 1 ? partial[0] : null;
    if (hit) return { status: 'found', name: hit.label, index: hit.index };
    const candidates = (exact.length > 1 ? exact : partial).map((r) => r.label);
    return { status: candidates.length > 1 ? 'ambiguous' : 'notFound', candidates };
  }, name);

  if (match.status !== 'found') {
    return {
      opened: false,
      notFound: match.status === 'notFound',
      ambiguous: match.status === 'ambiguous',
      candidates: match.candidates,
      name,
      count: 0,
      messages: [],
      note: match.status === 'ambiguous' ? 'several chats match; pass the exact name' : 'chat not found in list',
      url: page.url().split('?')[0],
    };
  }
  openedName = match.name;
  await page
    .locator('[role="listitem"]')
    .filter({ has: page.getByText(match.name, { exact: true }) })
    .first()
    .click({ timeout: 10000 })
    .catch(() => page.locator('[role="listitem"]').nth(match.index).click({ timeout: 10000 }));
  await page.waitForTimeout(3500);
  await dismissTooManyTabs();
  await page.waitForTimeout(2000);
}

const scraped = await page.evaluate(({ max, sinceText, chatName }) => {
  const tooManyTabs = /Too many tabs/i.test(document.body?.innerText || '');
  if (tooManyTabs) return { tooManyTabs: true, messages: [], note: 'blocked by single-tab modal' };

  const skip = /^(Click the Camera|Create Bitmoji|Search|View|My AI|Team Snapchat|Friends Feed|Received|New Chat|New Chats|install the Desktop|Oops|Close Chat|Say Hi|Okay|to always have access|Drag & drop|Call$|Delivered|Opened|Sending|Sent$)/i;
  const dateLine = /^(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER|TODAY|YESTERDAY)\b/;
  // Snapchat labels each message group with the sender in caps ("ME", "FATMA BOUZID");
  // system lines are caps too but longer ("YOU CREATED THE GROUP …").
  const senderLine = (t) =>
    t === t.toUpperCase() && /[A-Z]/.test(t) && t.split(/\s+/).length <= 3 && !/[.!?,:]/.test(t) && !/^YOU\b/.test(t);

  const all = [];
  const seen = new Set();
  let from = null;

  const header = String(chatName || '').toLowerCase();
  // Group chats show member name tags ("saffist3r", "Fatma") by the composer: drop bare chat names / first names.
  const nameTags = new Set();
  for (const li of document.querySelectorAll('[role="listitem"]')) {
    const label = ((li.innerText || '').trim().split(/\n+/)[0] || '').trim().toLowerCase();
    if (label.length < 2) continue;
    nameTags.add(label);
    nameTags.add(label.split(/\s+/)[0]);
  }
  for (const el of document.querySelectorAll('div, span, p')) {
    if (el.children.length > 0) continue;
    if (el.closest('[role="listitem"]')) continue;
    const t = (el.innerText || '').trim();
    if (t.length < 2 || t.length > 500) continue;
    if (skip.test(t) || dateLine.test(t)) continue;
    if (/^\d+[smhd]$/i.test(t)) continue;
    if (/^\d{1,2}:\d{2}\s*(AM|PM)?$/i.test(t)) continue;
    if (/^[0-9.]+[MK]?$/.test(t)) continue;
    if (/^YOU [A-Z ]+/.test(t) && t === t.toUpperCase()) continue;
    // Sender labels ("FATMA BOUZID") are caps and can equal a chat name, so read them before the name filters.
    if (senderLine(t)) {
      from = t === 'ME' ? 'me' : t;
      continue;
    }
    if (header && t.toLowerCase() === header) continue;
    if (nameTags.has(t.toLowerCase())) continue;
    const key = `${from}|${t}`;
    if (seen.has(key)) continue;
    seen.add(key);
    all.push({ text: t, from, when: null, type: 'text' });
  }

  let list = all;
  let sinceFound = null;
  if (sinceText) {
    const needle = sinceText.toLowerCase();
    let last = -1;
    all.forEach((m, i) => {
      if (m.text.toLowerCase().includes(needle)) last = i;
    });
    sinceFound = last >= 0;
    list = last >= 0 ? all.slice(last + 1) : [];
  }
  const messages = list.slice(-max);

  const composer = [...document.querySelectorAll('[aria-label]')].some((el) =>
    /send this text/i.test(el.getAttribute('aria-label') || ''),
  );

  let note = null;
  if (sinceText && !sinceFound) note = 'since text not found in the visible history';
  else if (messages.length === 0) {
    note = sinceText
      ? 'no messages after the since text'
      : 'no text bubbles visible (Web UI may show camera pane / virtualized history)';
  }

  return { tooManyTabs: false, messages, composerHint: composer, sinceFound, note };
}, { max: limit, sinceText: since, chatName: openedName });

return {
  opened: !scraped.tooManyTabs,
  notFound: false,
  ambiguous: false,
  name: openedName || name || null,
  count: scraped.messages.length,
  messages: scraped.messages,
  ...(since ? { since, sinceFound: !!scraped.sinceFound } : {}),
  composerHint: !!scraped.composerHint,
  tooManyTabs: !!scraped.tooManyTabs,
  note: scraped.note,
  url: page.url().split('?')[0],
};
