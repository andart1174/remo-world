/* ════════════════════════════════════════════════════════════════════
   📲 REMO WORLD — Dynamic OpenGraph & Social Preview Edge Function (v61)
   Tailors WhatsApp, Telegram, Facebook, Discord, X & Search previews
   for ?city=, ?u=, ?guess=1, ?war=, ?challengeScore= & ?open= links.
   Strict Bilingual (EN / FR Only). Zero latency passthrough on root '/'.
   ════════════════════════════════════════════════════════════════════ */

const CITY_META = {
  montreal:    { flag: '⚜️', en: 'Montréal',        fr: 'Montréal',        code: 'MTL' },
  paris:       { flag: '🗼', en: 'Paris',           fr: 'Paris',           code: 'PAR' },
  chisinau:    { flag: '🇲🇩', en: 'Chișinău',        fr: 'Chișinău',        code: 'KIV' },
  bucharest:   { flag: '🇷🇴', en: 'Bucharest',       fr: 'Bucarest',        code: 'BUH' },
  newyork:     { flag: '🗽', en: 'New York',        fr: 'New York',        code: 'NYC' },
  tokyo:       { flag: '🏯', en: 'Tokyo',           fr: 'Tokyo',           code: 'TYO' },
  london:      { flag: '🏰', en: 'London',          fr: 'Londres',         code: 'LON' },
  dubai:       { flag: '🌆', en: 'Dubai',           fr: 'Dubaï',           code: 'DXB' },
  miami:       { flag: '🌴', en: 'Miami',           fr: 'Miami',           code: 'MIA' },
  barcelona:   { flag: '☀️', en: 'Barcelona',       fr: 'Barcelone',       code: 'BCN' },
  rome:        { flag: '🏛️', en: 'Rome',            fr: 'Rome',            code: 'ROM' },
  toronto:     { flag: '🍁', en: 'Toronto',         fr: 'Toronto',         code: 'YYZ' },
  monaco:      { flag: '🏎️', en: 'Monaco',          fr: 'Monaco',          code: 'MCM' },
  losangeles:  { flag: '🎬', en: 'Los Angeles',     fr: 'Los Angeles',     code: 'LAX' },
  seoul:       { flag: '⚡', en: 'Seoul',           fr: 'Séoul',           code: 'SEL' },
  geneva:      { flag: '⌚', en: 'Geneva',          fr: 'Genève',          code: 'GVA' },
  singapore:   { flag: '🦁', en: 'Singapore',       fr: 'Singapour',       code: 'SIN' },
  sydney:      { flag: '⛵', en: 'Sydney',          fr: 'Sydney',          code: 'SYD' },
  rio:         { flag: '🎭', en: 'Rio de Janeiro',  fr: 'Rio de Janeiro',  code: 'RIO' },
  istanbul:    { flag: '🕌', en: 'Istanbul',        fr: 'Istanbul',        code: 'IST' },
  berlin:      { flag: '🎧', en: 'Berlin',          fr: 'Berlin',          code: 'BER' },
  amsterdam:   { flag: '🚲', en: 'Amsterdam',       fr: 'Amsterdam',       code: 'AMS' },
  lisbon:      { flag: '🚋', en: 'Lisbon',          fr: 'Lisbonne',        code: 'LIS' },
  cairo:       { flag: '🔺', en: 'Cairo',           fr: 'Le Caire',        code: 'CAI' }
};

function escAttr(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export default async (request, context) => {
  try {
    const url = new URL(request.url);
    if (!url.search || url.search === '?') {
      return context.next();
    }

    const p = url.searchParams;
    const isFr = p.get('lang') === 'fr';
    const userParam = (p.get('u') || '').trim().slice(0, 40);
    const cityKey = (p.get('city') || '').trim().toLowerCase();
    const isGuess = p.has('guess') || p.get('open') === 'guess';
    const isWar = p.has('war');
    const score = (p.get('challengeScore') || '').trim().slice(0, 12);
    const challenger = (p.get('challenger') || 'Citizen').trim().slice(0, 32);
    const openTool = (p.get('open') || '').trim().toLowerCase();

    let ogTitle = '';
    let ogDesc = '';

    if (userParam) {
      const handle = userParam.startsWith('@') ? userParam : `@${userParam}`;
      ogTitle = isFr
        ? `🪪 Passeport Citoyen 4D de ${handle} | REMO World`
        : `🪪 ${handle} — Official 4D Citizen Passport & Showcase | REMO World`;
      ogDesc = isFr
        ? `Découvrez le passeport officiel, les cartes 4D et les moments publiés par ${handle} sur REMO World.`
        : `View ${handle}'s official Citizen Passport, collectible 4D City Cards, and published moments on REMO World.`;
    } else if (score) {
      ogTitle = isFr
        ? `🕹️ Défi Arcade : ${challenger} a marqué ${score} pts sur REMO World !`
        : `🕹️ Arcade Challenge: ${challenger} scored ${score} pts on REMO World!`;
      ogDesc = isFr
        ? `Pouvez-vous battre ce record en direct dans votre navigateur et remporter +15 Pièces d’Or ?`
        : `Tap to play instantly in your browser — beat ${score} pts to claim #1 and win +15 Gold Coins!`;
    } else if (isGuess) {
      ogTitle = isFr
        ? `🕵️ Deviner la Ville ! Pouvez-vous identifier cette photo mystère ? (+10 🪙)`
        : `🕵️ Guess My City! Can you identify this Mystery City photo? (+10 🪙)`;
      ogDesc = isFr
        ? `Testez votre sens géographique sur REMO World et gagnez +10 Pièces d’Or instantanément !`
        : `Tap to solve this real citizen mystery city challenge on REMO World and win +10 Gold Coins!`;
    } else if (isWar) {
      ogTitle = isFr
        ? `⚡ Guerre des Villes en Direct — Défendez votre métropole sur REMO World !`
        : `⚡ Live City Clicker War — Tap to boost your city right now on REMO World!`;
      ogDesc = isFr
        ? `Rejoignez le duel urbain en temps réel en 1 clic et aidez votre ville à remporter la Coupe !`
        : `Join the real-time cross-city pulse battle in 1 click and earn Gold Coins for your home city!`;
    } else if (openTool === 'radio') {
      ogTitle = isFr
        ? `📻 REMO World Radio 2.0 — 38 Stations Mondiales & Lofi Sans Pub`
        : `📻 REMO World Radio 2.0 — 38 Free Live City & Lofi Stations`;
      ogDesc = isFr
        ? `Écoutez 38 radios du monde en direct gratuitement et gagnez +5 Pièces d’Or toutes les 10 minutes.`
        : `Stream 38 live world city & Lofi stations free in your browser and earn +5 Gold Coins every 10 minutes.`;
    } else if (openTool === 'beatpad') {
      ogTitle = isFr
        ? `🎛️ Studio Beat-Pad 4D — Créez & Remixez un Beat en Ligne Gratuitement`
        : `🎛️ REMO Beat-Pad 4D — Free Online 8-Step Synth & Drum Sequencer`;
      ogDesc = isFr
        ? `Composez une boucle musicale 4×8 directement dans votre navigateur et partagez-la avec le monde.`
        : `Compose and remix 4×8 WebAudio synth beats directly in your browser on REMO World (+10 🪙).`;
    } else if (openTool === 'boardingpass') {
      ogTitle = isFr
        ? `🎫 Billet d’Embarquement 4D (Story 9:16) — Générateur Gratuit REMO World`
        : `🎫 Free 4D Holographic Boarding Pass Generator (9:16 Story) — REMO World`;
      ogDesc = isFr
        ? `Générez votre billet de vol cyber 9:16 entre 24 villes du monde pour TikTok, Instagram & WhatsApp.`
        : `Create and download your custom 9:16 4D Boarding Pass between 24 world cities for Stories & WhatsApp.`;
    } else if (cityKey && CITY_META[cityKey]) {
      const c = CITY_META[cityKey];
      const cname = isFr ? c.fr : c.en;
      ogTitle = isFr
        ? `${c.flag} ${cname} (${c.code}) — Radio Live, Citoyens & Hub 4D | REMO World`
        : `${c.flag} ${cname} (${c.code}) — Live City Radio, Citizens & 4D Hub | REMO World`;
      ogDesc = isFr
        ? `Explorez ${cname} en direct sur REMO World : radio locale gratuite, citoyens en ligne et Passeport 4D (+25 🪙).`
        : `Explore ${cname} live on REMO World: free city radio, active citizens, live weather & +25 Gold Coins welcome bonus.`;
    }

    if (!ogTitle) {
      return context.next();
    }

    const response = await context.next();
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return response;
    }

    let html = await response.text();
    const safeTitle = escAttr(ogTitle);
    const safeDesc = escAttr(ogDesc);
    const safeUrl = escAttr(url.toString());

    html = html
      .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
      .replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${safeTitle}">`)
      .replace(/<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${safeDesc}">`)
      .replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${safeUrl}">`)
      .replace(/<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${safeTitle}">`)
      .replace(/<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${safeDesc}">`);

    const headers = new Headers(response.headers);
    headers.delete('content-length');
    return new Response(html, { status: response.status, headers });
  } catch (_err) {
    return context.next();
  }
};
