page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(45000);

const WEB_URL = 'https://www.snapchat.com/web/';
const fileKey = 'image.png';
const hasImage = !!files?.[fileKey];

const chatName = String(args.name || '').trim();
const text = String(args.text || '').trim();
if (!text && !hasImage) throw new Error('send_message needs text and/or image.png');

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

// The My AI disclaimer is a terms prompt: never click through it on the user's behalf.
async function hasMyAiDisclaimer() {
  return page.evaluate(() =>
    /Here's what you need to know|before you use My AI/i.test(document.body?.innerText || ''),
  );
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

  // Writes only act on an exact (case-insensitive) name: partial matches are suggestions, never targets.
  const match = await page.evaluate((targetRaw) => {
    const target = String(targetRaw || '').toLowerCase().trim();
    const rows = [...document.querySelectorAll('[role="listitem"]')]
      .map((li, index) => ({ index, label: ((li.innerText || '').trim().split(/\n+/)[0] || '').trim() }))
      .filter((r) => r.label.length >= 2);
    const available = rows.map((r) => r.label);
    const exact = rows.filter((r) => r.label.toLowerCase() === target);
    if (exact.length === 1) {
      return { status: 'found', matchedName: exact[0].label, index: exact[0].index, available };
    }
    if (exact.length > 1) return { status: 'ambiguous', candidates: exact.map((r) => r.label), available };
    const candidates = rows.filter((r) => r.label.toLowerCase().includes(target)).map((r) => r.label);
    return { status: 'notFound', candidates, available };
  }, want);

  if (match.status !== 'found') {
    return {
      ok: false,
      delivered: false,
      opened: false,
      notFound: match.status === 'notFound',
      ambiguous: match.status === 'ambiguous',
      candidates: match.candidates,
      name: want,
      available: match.available || [],
      error:
        match.status === 'ambiguous'
          ? 'several chats have this exact name; not sending'
          : match.candidates.length
            ? `no chat named exactly "${want}" (did you mean: ${match.candidates.join(', ')}?)`
            : 'chat not found',
    };
  }

  // Click the row whose name is exactly the match — hasText alone can hit a row that only mentions it.
  await page
    .locator('[role="listitem"]')
    .filter({ has: page.getByText(match.matchedName, { exact: true }) })
    .first()
    .click({ timeout: 10000 })
    .catch(() => page.locator('[role="listitem"]').nth(match.index).click({ timeout: 10000 }));

  await page.waitForTimeout(3000);
  await dismissTooManyTabs();
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
}

if (await hasMyAiDisclaimer()) {
  return {
    ...openMeta,
    ok: false,
    clicked: false,
    delivered: false,
    error: 'my_ai_disclaimer: accept it manually in Snapchat first, or use another chat',
  };
}

// Another Snapchat tab can re-trigger "Too many tabs" after the chat opens.
async function waitForComposer(timeoutMs) {
  const composer = page.locator('input[type=file][name=uploadImages]');
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await dismissTooManyTabs();
    const ready = await composer
      .waitFor({ state: 'attached', timeout: 3000 })
      .then(() => true)
      .catch(() => false);
    if (ready) return true;
  }
  return false;
}

const composerReady = await waitForComposer(20000);
if (!composerReady) {
  return {
    ...openMeta,
    ok: false,
    clicked: false,
    delivered: false,
    error: 'composer not found (no uploadImages input; chat may show the camera pane)',
  };
}

if (hasImage) {
  await builtins.uploadFile('input[type=file][name=uploadImages]', fileKey);
  await page.waitForTimeout(2000);
}

const textbox = page.getByRole('textbox').last();
if (text) {
  if (!(await textbox.count())) {
    return {
      ...openMeta,
      ok: false,
      clicked: false,
      delivered: false,
      error: 'chat textbox not found',
    };
  }
  await builtins.paste([{ kind: 'role', body: 'textbox' }, { kind: 'last' }], text);
  await page.waitForTimeout(500);
}

function readChatRow(label) {
  const rows = [...document.querySelectorAll('[role="listitem"]')];
  const pick = label
    ? rows.filter(
        (r) =>
          ((r.innerText || '').trim().split(/\n+/)[0] || '').trim().toLowerCase() ===
          String(label).toLowerCase(),
      )
    : rows.slice(0, 1);
  return pick.map((r) => (r.innerText || '').replace(/\s+/g, ' ').trim()).join(' | ');
}

// A previous send can leave "Delivered · 20s" on the row: require the row to change.
const rowBefore = await page.evaluate(readChatRow, openMeta.matchedName);

// Enter sends text and/or the staged image preview.
// Do NOT click "Send this text to MyAI" (sidebar shortcut) — that opens My AI / modal.
let clicked = false;
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

const isRecentDelivered = (row) =>
  /\b(Delivered|Sent)\b/i.test(row) && /just now|\b\d{1,2}s\b/i.test(row);

async function waitRow(mode, timeout) {
  return page
    .waitForFunction(
      ({ label, before, mode: m }) => {
        const rows = [...document.querySelectorAll('[role="listitem"]')];
        const pick = label
          ? rows.filter(
              (r) =>
                ((r.innerText || '').trim().split(/\n+/)[0] || '').trim().toLowerCase() ===
                String(label).toLowerCase(),
            )
          : rows.slice(0, 1);
        const now = pick.map((r) => (r.innerText || '').replace(/\s+/g, ' ').trim()).join(' | ');
        if (m === 'changed') return now !== before;
        return (
          !/Sending/i.test(now) &&
          /\b(Delivered|Sent)\b/i.test(now) &&
          /just now|\b\d{1,2}s\b/i.test(now)
        );
      },
      { label: openMeta.matchedName, before: rowBefore, mode },
      { timeout },
    )
    .then(() => true)
    .catch(() => false);
}

// Delivery: the chat row changes (e.g. "Sending…"), then shows "Delivered/Sent · just now|Ns".
// Text + image go out as two messages, so re-check after a pause in case the image is still sending.
let delivered = false;
if (clicked) {
  const changed = await waitRow('changed', 8000);
  let recent = await waitRow('recent', 20000);
  if (recent) {
    await page.waitForTimeout(1500);
    recent = await waitRow('recent', 20000);
  }
  delivered = recent && (changed || !isRecentDelivered(rowBefore));
}

const snippet = await page.evaluate(() => (document.body.innerText || '').slice(-700));

return {
  ok: delivered,
  clicked,
  delivered,
  sentText: !!text,
  sentImage: hasImage,
  ...(delivered ? {} : { error: clicked ? 'send not confirmed (no Delivered row)' : 'send control not found' }),
  snippet,
  opened: openMeta.opened,
  notFound: openMeta.notFound,
  name: openMeta.name,
  matchedName: openMeta.matchedName || null,
};
