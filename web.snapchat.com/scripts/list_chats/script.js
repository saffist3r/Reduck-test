page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(30000);

const WEB_URL = 'https://www.snapchat.com/web/';
const limit = Math.min(50, Math.max(1, Number(args.limit) || 10));

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
  const text = document.body?.innerText || '';
  if (/Too many tabs/i.test(text)) return true;
  if (document.querySelectorAll('[role="listitem"]').length > 0) return true;
  if (/log in|sign in|username or email/i.test(text)) return true;
  return false;
}, { timeout: 20000 }).catch(() => {});

await dismissTooManyTabs();
await page.waitForTimeout(1000);

const data = await page.evaluate((max) => {
  const text = document.body?.innerText || '';
  if (/Too many tabs/i.test(text)) {
    return { tooManyTabs: true, loggedIn: false, chats: [] };
  }
  if (/log in|sign in|username or email/i.test(text) && !document.querySelector('[role="listitem"]')) {
    return { tooManyTabs: false, loggedIn: false, chats: [] };
  }

  const chats = [];
  const seen = new Set();
  for (const li of document.querySelectorAll('[role="listitem"]')) {
    const raw = (li.innerText || '').trim();
    if (!raw) continue;
    const lines = raw.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    // Skip empty / spotlight junk rows
    const name = lines[0] || null;
    if (!name) continue;
    if (/^[0-9.]+[MK]?$/.test(name)) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const timeLine = lines.find((l) => /^\d+[smhd]$|^just now$/i.test(l) || /·/.test(l));
    let preview = null;
    let when = null;
    if (timeLine && timeLine.includes('·')) {
      const parts = timeLine.split('·').map((p) => p.trim());
      preview = parts[0] || null;
      when = parts[1] || null;
    } else {
      preview = lines[1] && !/^\d+[smhd]$/i.test(lines[1]) ? lines[1] : (lines.find((l, idx) => idx > 0 && !/^\d+[smhd]$/i.test(l) && l !== 'View') || null);
      when = lines.find((l) => /^\d+[smhd]$/i.test(l)) || null;
      if (preview === 'View') preview = null;
    }
    const unread = /new chat|new chats|new snaps|view/i.test(raw);
    chats.push({ name, preview, when, unread });
    if (chats.length >= max) break;
  }
  return { tooManyTabs: false, loggedIn: chats.length > 0 || /Friends Feed|My AI/i.test(text), chats };
}, limit);

return {
  loggedIn: !!data.loggedIn,
  tooManyTabs: !!data.tooManyTabs,
  count: data.chats.length,
  chats: data.chats,
  url: page.url().split('?')[0],
};
