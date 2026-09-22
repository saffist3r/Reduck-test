page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(45000);

const WEB_URL = 'https://www.snapchat.com/web/';
const fileKey = 'image.png';
if (!files[fileKey]) throw new Error('missing file input image.png');

const chatName = String(args.name || '').trim();
const caption = String(args.caption || '').trim();

async function dismissTooManyTabs() {
  for (let i = 0; i < 4; i++) {
    const tooMany = await page.evaluate(() =>
      /Too many tabs/i.test(document.body?.innerText || ''),
    );
    if (!tooMany) return;
    await page.mouse.click(480, 340);
    await page.waitForTimeout(1500);
  }
}

async function dismissMyAiModal() {
  for (let i = 0; i < 3; i++) {
    const hit = await page.evaluate(() => {
      const text = document.body?.innerText || '';
      if (!/Here's what you need to know|before you use My AI/i.test(text)) {
        return false;
      }
      const dialog = document.querySelector('[role="dialog"]');
      const scope = dialog || document.body;
      const btns = [...scope.querySelectorAll('button, [role="button"]')];
      const prefer = btns.find((b) =>
        /got it|continue|accept|agree|i understand|ok\b/i.test(
          `${b.innerText || ''} ${b.getAttribute('aria-label') || ''}`,
        ),
      );
      if (prefer) {
        prefer.click();
        return 'prefer';
      }
      if (dialog) {
        const dbtns = [...dialog.querySelectorAll('button, [role="button"]')];
        if (dbtns.length) {
          dbtns[dbtns.length - 1].click();
          return 'dialog-last';
        }
      }
      return false;
    });
    if (!hit) return;
    await page.waitForTimeout(1200);
  }
}

async function openChatByName(want) {
  await builtins.goto(WEB_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await dismissTooManyTabs();

  await page.waitForFunction(() => {
    return (
      document.querySelectorAll('[role="listitem"]').length > 0 ||
      /Too many tabs|log in|sign in/i.test(document.body?.innerText || '')
    );
  }, { timeout: 20000 }).catch(() => {});

  await dismissTooManyTabs();
  await page.waitForTimeout(1500);

  const match = await page.evaluate((targetRaw) => {
    const target = String(targetRaw || '').toLowerCase().trim();
    if (!target) return { found: false, available: [] };
    const items = [...document.querySelectorAll('[role="listitem"]')];
    const available = [];
    let best = null;
    for (const el of items) {
      const lines = (el.innerText || '')
        .trim()
        .split(/\n+/)
        .map((l) => l.trim())
        .filter(Boolean);
      const label = lines[0] || '';
      if (label.length >= 2) available.push(label);
      const low = label.toLowerCase();
      if (low === target || low.includes(target)) {
        best = { label, index: items.indexOf(el) };
        if (low === target) break;
      }
    }
    return best
      ? { found: true, matchedName: best.label, index: best.index, available }
      : { found: false, available };
  }, want);

  if (!match.found) {
    return {
      ok: false,
      opened: false,
      notFound: true,
      name: want,
      available: match.available || [],
      error: 'chat not found',
    };
  }

  // Prefer row click via hasText (same as open_chat) — raw nth click can hit the camera icon.
  await page
    .locator('[role="listitem"]')
    .filter({ hasText: match.matchedName })
    .first()
    .click({ timeout: 10000 })
    .catch(async () => {
      await page.evaluate((targetLabel) => {
        const target = String(targetLabel || '').toLowerCase();
        const li = [...document.querySelectorAll('[role="listitem"]')].find((el) => {
          const n = ((el.innerText || '').trim().split(/\n+/)[0] || '').toLowerCase();
          return n.length >= 2 && (n === target || n.includes(target));
        });
        const btn = li?.querySelector('[role="button"]') || li;
        btn?.click();
      }, match.matchedName);
    });

  await page.waitForTimeout(3000);
  await dismissTooManyTabs();
  await dismissMyAiModal();
  await page.waitForTimeout(1000);

  return {
    ok: true,
    opened: true,
    notFound: false,
    name: want,
    matchedName: match.matchedName,
  };
}

let openMeta = {
  opened: null,
  notFound: null,
  matchedName: null,
  name: chatName || null,
};
if (chatName) {
  const opened = await openChatByName(chatName);
  if (!opened.ok) return opened;
  openMeta = opened;
} else {
  await dismissMyAiModal();
  await page.waitForTimeout(500);
}

await builtins.waitFor('input[type=file][name=uploadImages]', 'attached');
await builtins.uploadFile('input[type=file][name=uploadImages]', fileKey);
await page.waitForTimeout(2000);

if (caption) {
  const box = page.getByRole('textbox').last();
  if (await box.count()) {
    await builtins.paste(box, caption);
    await page.waitForTimeout(500);
  }
}

// After upload, the composer shows a preview + blue send arrow.
// Do NOT click "Send this text to MyAI" (sidebar shortcut) — that opens My AI / modal.
let clicked = false;
const textbox = page.getByRole('textbox').last();
if (await textbox.count()) {
  await textbox.click({ timeout: 5000 }).catch(() => {});
  await builtins.pressKey('Enter');
  clicked = true;
}

if (!clicked) {
  const send = page.locator('button');
  const n = await send.count();
  let best = -1;
  let bestX = -1;
  for (let i = 0; i < n; i++) {
    const el = send.nth(i);
    const label = (await el.getAttribute('aria-label')) || '';
    if (/myai|my ai/i.test(label)) continue;
    const box = await el.boundingBox().catch(() => null);
    if (!box || box.y < 500 || box.width < 20) continue;
    if (box.x > bestX) {
      bestX = box.x;
      best = i;
    }
  }
  if (best >= 0) {
    await send.nth(best).click();
    clicked = true;
  }
}

await page.waitForTimeout(3000);
const snippet = await page.evaluate(() => (document.body.innerText || '').slice(-700));
const deliveredHint = /Delivered|Opened|just now|\d+s/i.test(snippet);

return {
  ok: clicked || deliveredHint,
  clicked,
  snippet,
  opened: openMeta.opened,
  notFound: openMeta.notFound,
  name: openMeta.name,
  matchedName: openMeta.matchedName || null,
};
