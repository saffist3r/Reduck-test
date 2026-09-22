page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(30000);

const WEB_URL = 'https://www.snapchat.com/web/';

async function dismissTooManyTabs() {
  for (let i = 0; i < 4; i++) {
    const tooMany = await page.evaluate(() => /Too many tabs/i.test(document.body?.innerText || ''));
    if (!tooMany) return;
    await page.mouse.click(480, 340);
    await page.waitForTimeout(1500);
  }
}

async function ensureWeb() {
  await builtins.goto(WEB_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await dismissTooManyTabs();
}

await ensureWeb();

const state = await page.evaluate(() => {
  const text = document.body?.innerText || '';
  const tooManyTabs = /Too many tabs/i.test(text);
  const loginHints = /log in|sign in|username or email|use phone number/i.test(text);
  const hasChatList = document.querySelectorAll('[role="listitem"]').length > 0
    || /Friends Feed|My AI|Team Snapchat/i.test(text);
  const loggedIn = !tooManyTabs && hasChatList && !loginHints;

  let displayName = null;
  let username = null;
  const title = document.title || '';
  // Title often "(N) Snapchat" when logged in
  if (/Snapchat/i.test(title) && loggedIn) {
    displayName = 'Snapchat user';
  }

  return {
    loggedIn,
    tooManyTabs,
    loginHints,
    username,
    displayName: loggedIn ? displayName : null,
    title,
    url: location.href.split('?')[0],
  };
});

if (state.tooManyTabs) {
  await dismissTooManyTabs();
  const again = await page.evaluate(() => {
    const text = document.body?.innerText || '';
    const hasChatList = document.querySelectorAll('[role="listitem"]').length > 0;
    const loginHints = /log in|sign in|username or email/i.test(text);
    return {
      loggedIn: hasChatList && !loginHints && !/Too many tabs/i.test(text),
      url: location.href.split('?')[0],
      title: document.title || '',
    };
  });
  return {
    loggedIn: again.loggedIn,
    username: null,
    displayName: again.loggedIn ? 'Snapchat user' : null,
    tooManyTabs: !again.loggedIn,
    url: again.url,
    title: again.title,
  };
}

return {
  loggedIn: !!state.loggedIn,
  username: state.username,
  displayName: state.displayName,
  tooManyTabs: false,
  url: state.url,
  title: state.title,
};
