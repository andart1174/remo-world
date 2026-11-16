#!/usr/bin/env node
/**
 * REMO World Automated Regression & Integrity Suite
 * Run: node scripts/verify-app.js
 */
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { execFileSync } = require('child_process');
const assert = require('assert');

const ROOT = path.resolve(__dirname, '..');
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');

function runSyntaxChecks() {
  const jsFiles = fs.readdirSync(path.join(ROOT, 'js'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => path.join('js', f));
  jsFiles.push('sw.js');
  for (const rel of jsFiles) {
    execFileSync(process.execPath, ['--check', path.join(ROOT, rel)], { stdio: 'pipe' });
  }
  console.log(`PASS: Syntax check OK across ${jsFiles.length} JS files.`);
}

function runCssBalanceCheck() {
  const css = read('css/remo-core.css');
  let depth = 0;
  for (const ch of css) {
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    assert.ok(depth >= 0, 'Negative CSS brace depth');
  }
  assert.strictEqual(depth, 0, `Unbalanced CSS braces: depth=${depth}`);
  console.log('PASS: css/remo-core.css brace balance === 0.');
}

function runVersionAudit() {
  const sw = read('sw.js');
  const idx = read('index.html');
  const adm = read('admin.html');
  const mSw = sw.match(/const\s+CACHE_NAME\s*=\s*['"]remo-pwa-v(\d+)['"]/);
  assert.ok(mSw, 'Missing CACHE_NAME in sw.js');
  const ver = mSw[1];
  const coreAssetPattern = /(?:css\/remo-core\.css|js\/remo-[a-z-]+\.js)\?v=(\d+)/g;
  const badIdx = [...idx.matchAll(coreAssetPattern)].filter((m) => m[1] !== ver).map((m) => m[0]);
  const badAdm = [...adm.matchAll(coreAssetPattern)].filter((m) => m[1] !== ver).map((m) => m[0]);
  const badSw = [...sw.matchAll(coreAssetPattern)].filter((m) => m[1] !== ver).map((m) => m[0]);
  assert.deepStrictEqual(badIdx, [], `Mismatched versions in index.html: ${badIdx}`);
  assert.deepStrictEqual(badAdm, [], `Mismatched versions in admin.html: ${badAdm}`);
  assert.deepStrictEqual(badSw, [], `Mismatched versions in sw.js: ${badSw}`);
  console.log(`PASS: All cache/asset versions synchronized at v=${ver}.`);
}

function runAppLauncherAudit() {
  const idx = read('index.html');
  const comms = read('js/remo-social-comms.js');
  const start = idx.indexOf('id="appLauncherModal"');
  const end = idx.indexOf('id="gamesHubModal"');
  assert.ok(start > 0 && end > start, 'Missing appLauncherModal block in index.html');
  const block = idx.slice(start, end);
  const onclicks = [...block.matchAll(/onclick="([^"]+)"/g)].map((m) => m[1]);
  const fns = new Set();
  onclicks.forEach((oc) => {
    for (const m of oc.matchAll(/([a-zA-Z0-9_]+)\s*\(/g)) {
      if (m[1] !== 'if') fns.add(m[1]);
    }
  });
  const allJs = fs.readdirSync(path.join(ROOT, 'js'))
    .filter((f) => f.endsWith('.js'))
    .map((f) => read(path.join('js', f)))
    .join('\n');
  const missing = [...fns].filter((fn) => !new RegExp(`(function\\s+${fn}\\b|window\\.${fn}\\s*=)`).test(allJs));
  assert.deepStrictEqual(missing, [], `Missing #appLauncherModal functions: ${missing}`);

  const closeFnMatch = comms.match(/function closeAppLauncherModal\(\)\s*\{[\s\S]*?\n\}/);
  assert.ok(closeFnMatch, 'Missing closeAppLauncherModal');
  assert.ok(!closeFnMatch[0].includes('viewId'), 'closeAppLauncherModal must not reference undefined viewId!');
  console.log(`PASS: #appLauncherModal handlers (${fns.size}) & closeAppLauncherModal clean.`);
}

function runI18nAudit() {
  const i18nSrc = read('js/remo-i18n.js');
  const idx = read('index.html');
  let curLang = 'en';
  const sandbox = {
    window: { dispatchEvent: () => {} },
    CustomEvent: function (t, o) { this.type = t; this.detail = o && o.detail; },
    localStorage: { getItem: () => curLang, setItem: (_k, v) => { curLang = v; } },
    navigator: { language: 'en' },
    document: { querySelectorAll: () => [], getElementById: () => null, documentElement: {} }
  };
  vm.runInNewContext(i18nSrc, sandbox);
  const i18n = sandbox.REMO_I18N || sandbox.window.REMO_I18N;
  const htmlKeys = [...new Set([...idx.matchAll(/data-i18n=["']([^"']+)["']/g)].map((m) => m[1]))];
  i18n.setLang('en');
  const missingEn = htmlKeys.filter((k) => !i18n.t(k) || i18n.t(k) === k);
  i18n.setLang('fr');
  const missingFr = htmlKeys.filter((k) => !i18n.t(k) || i18n.t(k) === k);
  assert.deepStrictEqual(missingEn, [], `Missing EN translations: ${missingEn}`);
  assert.deepStrictEqual(missingFr, [], `Missing FR translations: ${missingFr}`);
  console.log(`PASS: All ${htmlKeys.length} data-i18n keys verified in EN & FR.`);
}

async function runStoreSimulations() {
  const storeSrc = read('js/remo-store.js');
  const ls = {};
  const sb = {
    console, setTimeout, clearTimeout,
    window: { addEventListener: () => {}, dispatchEvent: () => {}, location: { search: '' } },
    document: { addEventListener: () => {}, getElementById: () => null },
    navigator: { language: 'en' },
    localStorage: {
      getItem: (k) => (k in ls ? ls[k] : null),
      setItem: (k, v) => { ls[k] = String(v); },
      removeItem: (k) => { delete ls[k]; }
    },
    CustomEvent: function (t, o) { this.type = t; this.detail = o && o.detail; },
    BroadcastChannel: function () { return { postMessage: () => {} }; },
    firebase: null,
    REMO_CITIES: []
  };
  vm.runInNewContext(storeSrc + '; this.__STORE = REMO_STORE;', sb);
  const STORE = sb.__STORE;

  // 1. Auth UID alignment & stale Firebase-session clearing
  STORE._fbAuthResolved = true;
  STORE.fbAuth = { currentUser: { uid: 'abc123', email: 'amd111@gmail.com', emailVerified: true } };
  STORE.state.users = [{ uid: 'u_legacy_999', email: 'amd111@gmail.com', role: 'citizen', name: 'AMD111' }];
  ls[STORE.USER_KEY] = 'u_legacy_999';
  const curU = STORE.getCurrentUser();
  assert.strictEqual(curU.fbUid, 'abc123');
  assert.strictEqual(STORE.getCloudAuthorUid(curU), 'u_fb_abc123', 'authorUid must match u_fb_<fbUid>');

  // If Firebase signs out cleanly after auth resolved, zombie session must be cleared
  STORE.fbAuth = { currentUser: null };
  ls[STORE.USER_KEY] = 'u_fb_abc123';
  STORE.state.users.push({ uid: 'u_fb_abc123', fbUid: 'abc123', role: 'citizen', name: 'Test' });
  assert.strictEqual(STORE.getCurrentUser(), null, 'Signed-out Firebase user must not stay active');

  // 2. syncPostToCloud failure preservation & size guard
  STORE.fbAuth = { currentUser: { uid: 'abc123', email: 'amd111@gmail.com', emailVerified: true } };
  STORE.fbDb = {
    collection: () => ({
      doc: () => ({
        set: async () => {
          const err = new Error('Missing or insufficient permissions');
          err.code = 'permission-denied';
          throw err;
        }
      })
    })
  };
  const failedPost = { id: 'post_fail_1', uid: 'u_legacy_999', createdAt: Date.now() - 60000, caption_en: 'Hello' };
  const syncRes = await STORE.syncPostToCloud(failedPost);
  assert.strictEqual(syncRes.ok, false);
  assert.strictEqual(syncRes.code, 'permission-denied');
  assert.ok(failedPost._cloudSyncError.includes('permission-denied'));

  STORE._ensureCloudPostPaginationState();
  STORE.state.posts = [failedPost];
  STORE._rebuildStatePostsFromCloudMaps(true);
  assert.ok(STORE.state.posts.some((p) => p.id === 'post_fail_1'), 'Unsynced failed post must NOT be silently wiped!');

  const oversizedPost = { id: 'post_big', uid: 'u_fb_abc123', createdAt: Date.now(), mediaUrl: 'x'.repeat(960000) };
  const bigRes = await STORE.syncPostToCloud(oversizedPost);
  assert.strictEqual(bigRes.ok, false);
  assert.strictEqual(bigRes.code, 'doc-too-large');

  // 3. Sort & cursor pagination over 95 mocked cloud docs
  const now = Date.now();
  const dbDocs = [];
  for (let i = 0; i < 95; i++) {
    dbDocs.push({
      id: 'post_' + (100000 - i),
      data: {
        id: 'post_' + (100000 - i),
        uid: 'u1',
        createdAt: now - i * 60000,
        pinned: i === 90,
        boosted: i === 85 || i === 70,
        boostedAt: i === 85 ? now - 5000 : (i === 70 ? now - 20000 : 0),
        boostedUntil: (i === 85 || i === 70) ? now + 3600000 : 0
      }
    });
  }
  STORE.state.posts = [];
  STORE.fbDb = {
    collection: () => ({
      doc: (id) => ({
        get: async () => {
          const hit = dbDocs.find((d) => d.id === id);
          return { exists: Boolean(hit), data: () => (hit ? Object.assign({}, hit.data) : null) };
        }
      }),
      orderBy: () => ({
        startAfter: (cursorDoc) => {
          const startIdx = dbDocs.findIndex((d) => d.id === cursorDoc.id) + 1;
          return {
            limit: (lim) => ({
              get: async () => {
                const slice = dbDocs.slice(startIdx, startIdx + lim);
                const wrapped = slice.map((d) => ({ id: d.id, data: () => Object.assign({}, d.data) }));
                return { empty: wrapped.length === 0, docs: wrapped, forEach: (fn) => wrapped.forEach(fn) };
              }
            })
          };
        }
      })
    })
  };
  dbDocs.slice(0, 40).forEach((d) => STORE._cloudLiveTopPostsMap.set(d.id, Object.assign({}, d.data)));
  STORE._cloudPinnedPostsMap.set(dbDocs[90].id, Object.assign({}, dbDocs[90].data));
  STORE._cloudBoostedPostsMap.set(dbDocs[85].id, Object.assign({}, dbDocs[85].data));
  STORE._cloudBoostedPostsMap.set(dbDocs[70].id, Object.assign({}, dbDocs[70].data));
  STORE._postsLastCursorDoc = { id: dbDocs[39].id };
  STORE.hasMoreCloudPosts = true;
  STORE.loadingOlderCloudPosts = false;
  STORE._rebuildStatePostsFromCloudMaps(true);

  const topIds = Array.from(STORE.state.posts.slice(0, 4).map((p) => p.id));
  assert.strictEqual(JSON.stringify(topIds), JSON.stringify([dbDocs[90].id, dbDocs[85].id, dbDocs[70].id, dbDocs[0].id]));
  await STORE.loadOlderCloudPosts(30);
  await STORE.loadOlderCloudPosts(30);
  assert.strictEqual(STORE.state.posts.length, 95);
  assert.strictEqual(STORE.hasMoreCloudPosts, false);
  STORE._flushLocalSave();
  assert.strictEqual(JSON.parse(ls[STORE.KEY]).posts.length, 80);

  // 4. Verify Before/After & Carousel don't duplicate inline base64 dataUrl into mediaUrl
  const comms = read('js/remo-social-comms.js');
  assert.ok(!comms.includes("mediaType = 'before_after';\n    mediaUrl = mediaUrls[0];"), 'before_after must not blindly duplicate base64 mediaUrl');
  assert.ok(comms.includes("'city_score'"), 'city_score must be in singlePostOrNonFeedReasons');

  // 5. Verify firestore.rules isNotBanned guards missing banned key & syncUserToCloud defaults banned: false
  const rules = read('firestore.rules');
  const bannedGuardMatches = rules.match(/!\('banned'\s+in\s+get\(/g) || [];
  assert.ok(bannedGuardMatches.length >= 2, 'isNotBanned() must check !("banned" in get(...).data) for both uid and u_fb_uid');
  assert.ok(storeSrc.includes('cleanUser.banned = false;'), 'syncUserToCloud must include banned: false for non-banned citizens');
  const headers = read('_headers');
  assert.ok(headers.includes('/index.html') && headers.includes('/sw.js') && headers.includes('no-cache'), '_headers must configure no-cache for index.html and sw.js');

  console.log('PASS: REMO_STORE auth alignment, error preservation, size guard, pagination & Firestore rules verified.');
}

function runCleanStageLayoutAudit() {
  const idx = read('index.html');
  const css = read('css/remo-core.css');
  const comms = read('js/remo-social-comms.js');

  const requiredDomIds = [
    'remoWelcomeHeroStrip', 'livePresenceStrip', 'feedCitySpotlightBar', 'worldSpotlightBar',
    'feedModeChips', 'moreFeedFiltersWrap', 'cleanFeedPulseToggle', 'wspotMiniNum1Btn',
    'rightCityCupList', 'rightQuickWarBox', 'rightPromoInput', 'remoPostsGrid',
    'desktopStageRail', 'desktopFeedModeSwitch', 'mobileFeedSearchDrawer', 'remoQuickGuideModal',
    'cleanFeedOnlineDrawer', 'cleanFeedPulseDrawer', 'stageOnboardingHint'
  ];
  for (const id of requiredDomIds) {
    assert.ok(idx.includes(`id="${id}"`), `Missing preserved/stage DOM id="${id}" in index.html`);
  }

  const requiredWindowFns = [
    'setDesktopFeedMode', 'setDesktopRightTab', 'toggleDesktopRightRail',
    'toggleFeedPresenceDrawer', 'toggleMobileFeedSearchBar', 'clearAndCloseMobileSearch',
    'handleFeedSearchInput', 'openRemoQuickGuideModal', 'closeRemoQuickGuideModal',
    'dismissStageOnboardingHint', 'stepDesktopStagePost', 'syncDesktopStageRail',
    'syncDesktopStageLayoutUI', 'toggleTkCaptionExpand', 'toggleTkWidgetTray'
  ];
  for (const fn of requiredWindowFns) {
    assert.ok(new RegExp(`function\\s+${fn}\\b`).test(comms), `Missing function ${fn} in js/remo-social-comms.js`);
    assert.ok(comms.includes(`window.${fn} =`), `Missing window.${fn} export in js/remo-social-comms.js`);
  }

  assert.ok(css.includes('body.desktop-stage-active'), 'Missing desktop-stage-active styles in css/remo-core.css');
  assert.ok(css.includes('#view-feed.active .tiktok-overlay-info'), 'Missing restored mobile .tiktok-overlay-info styles');
  assert.ok(!css.includes('.filter-row::-webkit-scrollbar {\n    display: block !important;'), 'Desktop filter-row must keep scrollbars hidden');
  assert.ok(!/\#view-feed\.active\s+\#moreFeedFiltersWrap\s*\{\s*display:\s*none\s*!important;/i.test(css), 'Mobile #moreFeedFiltersWrap must not be hardcoded display:none !important');
  assert.ok(css.includes('justify-content: flex-start !important;') && css.includes('touch-action: pan-x !important;'), 'Missing mobile horizontal scroll & flex-start header-right rules');
  assert.ok(css.includes('overflow-y: auto !important;') && css.includes('backdrop-filter: none !important;'), 'Missing mobile modal scroll & GPU backdrop-filter safety rules');
  assert.ok(comms.includes('window.closeTopFeedDrawers =') && comms.includes("pointer: coarse"), 'Missing closeTopFeedDrawers & touch scroll guard');
  assert.ok(comms.includes('class="tiktok-overlay-info"') && comms.includes('class="sheet-quick-tools-grid"'), 'Missing clean card overlay & sheet quick tools');

  console.log(`PASS: Clean Stage & Mobile TikTok UI layout (${requiredDomIds.length} IDs, ${requiredWindowFns.length} window handlers) verified.`);
}

(async () => {
  runSyntaxChecks();
  runCssBalanceCheck();
  runVersionAudit();
  runAppLauncherAudit();
  runI18nAudit();
  runCleanStageLayoutAudit();
  await runStoreSimulations();
  console.log('ALL REGRESSION CHECKS PASSED.');
})().catch((err) => {
  console.error('VERIFICATION FAILED:', err);
  process.exit(1);
});
