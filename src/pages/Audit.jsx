import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp } from "../utils/animations";
import { useLang } from "../context/LanguageContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Rejtett oldal — nav-ban NEM látszik
// Közvetlen URL: /audit

const PAGESPEED_URL = "/api/pagespeed";

// Ezeket a Lighthouse "opportunity" auditokat naplózzuk a /api/notify hívásban
// (a saját nyomon követéshez) — a felületen nem jelenik meg belőlük semmi.
const OPPORTUNITY_KEYS = [
  "render-blocking-resources",
  "unused-javascript",
  "unused-css-rules",
  "uses-optimized-images",
  "uses-webp-images",
  "uses-text-compression",
  "offscreen-images",
  "uses-responsive-images",
  "efficient-animated-content",
  "uses-rel-preconnect",
  "uses-long-cache-ttl",
  "dom-size",
  "mainthread-work-breakdown",
];

const SIGNATURE = "Üdvözlettel:\nKörmendi Richárd\nWebfejlesztő\n+36301480917\nrichardkormendi.com";

// Ismeretlen feladótól jövő hideg levélnél a bemutatkozás hiánya gyanússá
// teheti az egészet — ez megy a megszólítás után, minden sablonban.
const INTRO = "Körmendi Richárd vagyok, digitális projektmenedzser és webfejlesztő.";

// Halk, nem direktbe tolakodó utalás arra, hogy vadonatúj oldalt is vállalok —
// minden kimenő üzenet végén ott van, P.s.-ként, nem a fő szövegben.
const PS_NEW_SITE = "P.s.: Ha esetleg egy vadonatúj weboldal is szóba jöhetne a javítás helyett, azt is szívesen vállalom: richardkormendi.com/hire?lang=hu&utm_source=audit_ps";

// ── Iparág-specifikus üzleti hatás — 2026-08-17, ÚJ ─────────────────────────
// User kérésére: a High-Ticket/sürgősségi iparágaknál (egészségügy-esztétika,
// prémium otthon/építőipar, sürgősségi szolgáltatók) a technikai hibát NEM
// technikai nyelven írjuk le, hanem közvetlen bevételkiesésre/elveszett
// hirdetési kattintásra fordítjuk — ez a célcsoport nem IT-s, a technikai
// súlyt nem érzi, a pénzügyi súlyt igen. A `hasGoogleAds` paraméter csak
// akkor ad konkrét "hirdetésből érkező látogató" hivatkozást, ha TÉNYLEG
// találtunk Google Ads konverziókövetést a HTML-ben (lásd api/pagespeed.js)
// — nem feltételezünk hirdetést, ha nincs rá bizonyíték.
// FONTOS, 2026-08-18-i javítás: ezek a szövegek CSAK a következményt írják
// le, a KONKRÉT tényt (mi pontosan elavult/lassú) mostantól a
// getConcreteReason() adja hozzá elé — korábban ezek a szövegek maguk is egy
// generikus tény-állítással kezdődtek ("elavult vagy nem biztonságos a
// weboldal technikai háttere" / "mobilon nehezen kattintható... gomb"), ami
// (a) sosem árulta el, MI konkrétan elavult (userkérdés volt: napelemoazis.hu
// esetén ez WordPress 5.2.21, egy 2019-es alapváltozat), és (b) néha
// pontatlan is volt — pl. a "hívás gomb" szöveg akkor is bejött, ha valójában
// a lassú betöltés (mobileslow) volt az ok, nem egy törött gomb.
// 2026-08-18-i MÁSODIK javítás: a `security` eredetileg EGY szöveg volt
// tier-enként, ami mindig azt állította, hogy a látogató "bizalmatlanná
// válik" / "azonnal elriad" a hibától. Ez 3 típusnál (nohttps,
// httpnotenforced, phperrors) igaz — ott a látogató TÉNYLEG lát valamit
// (böngésző-figyelmeztetés vagy nyers hibaüzenet). DE 4 típusnál (phpeol,
// angulareol, wpcoreeol, jqueryold) ez FALS: a látogató fizikailag nem látja
// a szerver PHP-verzióját vagy a WordPress alapváltozat-számát, tehát nem
// "bizalmatlanná válik" tőle — ezt a user vetette fel jogosan
// (napelemoazis.hu, WP 5.2.21 kapcsán: "miért lenne bizalmatlan? fogalma
// nincs róla a megrendelőnek"). Ezeknél a valódi, védhető kockázat az, hogy
// a rejtett sebezhetőség miatt MEGNŐ az esélye, hogy az oldalt feltörik vagy
// leállítják — ami már tényleg látható lesz, csak nem a mai napon. A gdpr
// megint más: az nem hack-kockázat, hanem jogi/hatósági kockázat, aminek
// szintén semmi köze ahhoz, hogy a látogató észreveszi-e.
const BUSINESS_IMPACT = {
  medaesthetic: {
    mobile: (hasAds) => `${hasAds ? "mivel Google Ads-en hirdetnek, a fizetett kattintásokból érkező érdeklődők egy része" : "az érdeklődők egy része"} még mielőtt megkeresné Önöket, egyszerűen a következő, könnyebben elérhető klinikára vált`,
    security: {
      visible: (hasAds) => `ezt minden látogató azonnal látja (böngésző-figyelmeztetés vagy hibaüzenet formájában) — egy egészségügyi/esztétikai döntésnél pont a bizalom a legfontosabb szempont, és sokan emiatt fordulnak el, mielőtt egyáltalán megkeresnék Önöket${hasAds ? ", Google Ads esetén ez a kattintásonkénti költséget is emeli" : ""}`,
      hidden:  () => `ez a látogatóknak közvetlenül nem látszik, de jelentősen megnöveli annak esélyét, hogy az oldalt feltörik vagy leállítják — és az már nagyon is látható lesz, pont akkor, amikor egy érdeklődő éppen keresné Önöket`,
      gdpr:    () => `ez GDPR-szempontból kockázatos, és bármikor bejelentés vagy hatósági ellenőrzés tárgya lehet — függetlenül attól, hogy a látogatók ezt egyáltalán észreveszik-e`,
    },
    tracking: () => `vagyis fogalmuk sincs, a hirdetési költésük ténylegesen megkeresést hoz-e, vagy csak elszivárog`,
  },
  premiumhome: {
    mobile: (hasAds) => `egy generálkivitelezőt vagy napelem-/hőszivattyú-telepítőt keresők jellemzően több helyről kérnek párhuzamosan ajánlatot, és ${hasAds ? "egy hirdetésből érkező látogató" : "aki ezt tapasztalja"} könnyen a gyorsabban elérhető versenytárstól kér inkább ajánlatot`,
    security: {
      visible: (hasAds) => `ezt minden látogató azonnal látja (böngésző-figyelmeztetés vagy hibaüzenet formájában) — egy magasabb értékű megrendelésnél (napelem, teljes felújítás) ez azonnal bizalmatlanná teszi az ajánlatkérőt${hasAds ? ", Google Ads esetén rontja a hirdetés minőségi mutatóját is" : ""}`,
      hidden:  () => `ez a látogatóknak közvetlenül nem látszik, de jelentősen megnöveli annak esélyét, hogy az oldalt feltörik vagy leállítják — és onnantól minden hirdetési kattintás egy hibás vagy hackelt oldalra érkezik, amíg észre nem veszik`,
      gdpr:    () => `ez GDPR-szempontból kockázatos, és bármikor bejelentés vagy hatósági ellenőrzés tárgya lehet — függetlenül attól, hogy a látogatók ezt egyáltalán észreveszik-e`,
    },
    tracking: () => `nem látják, mely forrás hozza a ténylegesen megtérülő ajánlatkéréseket`,
  },
  emergency: {
    mobile: () => `sürgősségi helyzetben (dugulás, defekt, kizárás) másodpercek számítanak, és aki ezt tapasztalja, egyszerűen a következő találatot vagy hirdetést hívja fel`,
    security: {
      visible: () => `ezt minden látogató azonnal látja — sürgősségi helyzetben az amúgy is bizalmatlan érdeklődőt ez azonnal elriaszthatja, mielőtt egyáltalán hívna`,
      hidden:  () => `ez a látogatóknak közvetlenül nem látszik, de jelentősen megnöveli annak esélyét, hogy az oldal leáll vagy feltörik — és ha ez pont egy sürgősségi helyzet közepén történik, elveszítik azt a hívást, aminek a legjobban kellett volna eljutnia Önökhöz`,
      gdpr:    () => `ez GDPR-szempontból kockázatos, és bármikor bejelentés vagy hatósági ellenőrzés tárgya lehet — függetlenül attól, hogy a látogatók ezt egyáltalán észreveszik-e`,
    },
    tracking: () => `nem látják, melyik csatorna hozza ténylegesen a hívásokat`,
  },
};

// A kritikus bullet-típusokat 3 üzleti-hatás kategóriába soroljuk — a
// legerősebb (mobil UX) élvez elsőbbséget, mert ez a legkonkrétabb, legjobban
// átélhető veszteség ennél a célcsoportnál.
const MOBILE_IMPACT_TYPES   = ["mobilebroken", "mobileslow", "noviewport", "flash"];
const SECURITY_IMPACT_TYPES = ["nohttps", "httpnotenforced", "phpeol", "angulareol", "wpcoreeol", "jqueryold", "phperrors", "gdpr"];
// Ezeknél a típusoknál a látogató TÉNYLEG lát valamit (böngésző-
// figyelmeztetés vagy nyers hibaüzenet) — a többi security-típus a szerver/
// keretrendszer háttérben van, a látogató számára láthatatlan.
const VISIBLE_SECURITY_TYPES = ["nohttps", "httpnotenforced", "phperrors"];
function pickImpactCategory(types) {
  if (types.some(t => MOBILE_IMPACT_TYPES.includes(t)))   return "mobile";
  if (types.some(t => SECURITY_IMPACT_TYPES.includes(t))) return "security";
  if (types.includes("deadga"))                            return "tracking";
  return null;
}
// FONTOS: ugyanazt a típust kell választania, mint amit getConcreteReason()
// használ a konkrét tény-mondathoz — különben a konkrét tény (pl. "nincs
// kikényszerítve a HTTPS") és a hozzá fűzött következmény-mondat (pl. egy
// GDPR-höz illő szöveg) nem illene össze. 2026-08-18-i eset mutatta meg ezt:
// dugulas-viz-villany.com-nál EGYSZERRE jött ki httpNotEnforced ÉS gdpr —
// a régi "gdpr mindig elsőbbséget élvez" szabály itt épp a rossz kombinációt
// adta volna (HTTPS-tény + GDPR-következmény).
function getSecurityConsequenceKind(types) {
  const type = types.find(t => SECURITY_IMPACT_TYPES.includes(t));
  if (type === "gdpr") return "gdpr";
  return VISIBLE_SECURITY_TYPES.includes(type) ? "visible" : "hidden";
}

// A rövid sablonhoz kell egy KONKRÉT, rövid tény-töredék (nem a hosszú,
// részletes `bullets`-beli mondat — az túl hosszú lenne a 4-6 mondatos
// elvhez), amit a business-impact mondat elé illesztünk, hogy sose maradjon
// homályos, MI pontosan a gond.
const SECURITY_REASON = {
  nohttps:         () => "nincs biztonságos (HTTPS) kapcsolatuk",
  httpnotenforced: () => "a biztonságos (HTTPS) verziójuk nincs kikényszerítve",
  phpeol:          (checks) => `elavult, nem támogatott PHP-verziót (${checks.phpVersion}) futtatnak`,
  angulareol:      () => "egy 2022 óta nem támogatott keretrendszert (AngularJS) használnak",
  wpcoreeol:       (checks) => `egy régóta nem frissített WordPress-alapváltozatot (${checks.wpVersion}) futtatnak`,
  jqueryold:       (checks) => `egy elavult JavaScript-könyvtárat (jQuery ${checks.jqueryVersion}) használnak`,
  phperrors:       () => "nyilvánosan látszik egy PHP-hibaüzenet az oldalukon",
  gdpr:            () => "látogatókövetést futtatnak süti-hozzájárulási felület nélkül",
};
const MOBILE_REASON = {
  mobilebroken: () => "mobilon nehezen használható az oldal",
  mobileslow:   (checks, mobileScore) => `mobilon nagyon lassan tölt be az oldal (${mobileScore}/100 pont)`,
  noviewport:   () => "az oldal nincs mobilra optimalizálva",
  flash:        () => "Flash-alapú tartalom van rajta, amit a böngészők évek óta nem futtatnak",
};

function getConcreteReason(types, category, checks, mobileScore) {
  if (category === "mobile") {
    const type = types.find(t => MOBILE_IMPACT_TYPES.includes(t));
    return type ? MOBILE_REASON[type](checks, mobileScore) : null;
  }
  if (category === "security") {
    const type = types.find(t => SECURITY_IMPACT_TYPES.includes(t));
    return type ? SECURITY_REASON[type](checks) : null;
  }
  if (category === "tracking") {
    return "a régi Google Analytics-kódjuk (ga.js) 2023 óta nem gyűjt adatot";
  }
  return null;
}

// Kérdés/engedély-kérés jellegű CTA a direkt eladás helyett — a cél csak egy
// VÁLASZ kiváltása ("igen"), nem azonnali elköteleződés. Ez a "no-brainer
// offer" elv: minél kisebb a kért lépés, annál nagyobb az esély a válaszra.
// 2026-08-17 óta ez az EGYETLEN CTA a teljes rendszerben — korábban volt egy
// külön "beszéljünk telefonon" CTA_CALL a nem-High-Ticket sablonoknál
// (generikus kritikus-hiba lista, chatbot/AI Act pitch, "nincs weboldal"
// pitch, "nem elérhető" pitch), de a user kérésére ez lecserélődött erre,
// konzisztencia kedvéért — lásd getStandaloneChatbotMessage, getCriticalIssue,
// getNoWebsitePitch, getUnreachableMessage.
const CTA_QUESTION = 'Küldhetek egy rövid, kb. 1 perces videót vagy összefoglalót arról, pontosan mit látok? Ha igen, csak annyit írjon vissza: "igen, küldje".';

// Legördülő a kézi felülbíráláshoz — ugyanaz a minta, mint a chatbot-
// kategóriánál: ha a title-alapú automatikus felismerés némán elhasal (pl.
// bot-védelem), itt kézzel kiválasztható a helyes iparág-tier.
const INDUSTRY_TIER_OPTIONS = [
  { value: "", label: "— Nincs High-Ticket/sürgősségi iparág —" },
  { value: "medaesthetic", label: "Egészségügy / esztétika (plasztika, lézerklinika, prémium fogászat)" },
  { value: "premiumhome",  label: "Prémium otthon / építőipar (kivitelező, napelem, hőszivattyú)" },
  { value: "emergency",    label: "Sürgősségi szolgáltató (duguláselhárítás, autómentés, zárszerviz)" },
];

// ── Chatbot-vonatkozású találatok — mindkettő KÜLÖN kategória marad a ────────
// kritikus-hiba listától, mert az egyik jogi jellegű, a másik csak egy ötlet,
// és ezek szándékosan nem keverednek a "valós kockázat" bullet-felsorolással.
//
// 1) VAN chatbot, de nincs AI-jelzés rajta — 2026. augusztus 2. óta aktívan
//    érvényesített EU AI Act előírás, valós bírságkockázattal (arányosítva
//    KKV-knál is). FONTOS KORLÁT: a hasAiDisclosure csak a kezdő HTML-t nézi,
//    sok widget csak megnyitás után írja ki a jelzést — MINDIG nézd meg
//    kézzel (kattints a chatre) is, mielőtt ezt kiküldöd egy ügyfélnek.
// 2) NINCS chatbot, de a cégtípus indokolná (fogászat, webshop stb.) — ez
//    tisztán fejlesztési ötlet, nem hiba, nem jogi kockázat.
const CHATBOT_CATEGORY_TEXT = {
  dental:     "Fogászati/orvosi rendelőknél sok a hasonló, ismétlődő kérdés (nyitvatartás, árak, időpont-elérhetőség) — egy chatbot ezeket automatikusan megválaszolná, és este vagy hétvégén is fogadná az érdeklődőket, amikor Önök épp nem érnek rá.",
  medical:    "Orvosi rendelőknél sok a hasonló, ismétlődő kérdés (nyitvatartás, árak, időpont-elérhetőség) — egy chatbot ezeket automatikusan megválaszolná, és este vagy hétvégén is fogadná az érdeklődőket, amikor Önök épp nem érnek rá.",
  beauty:     "Szépségipari vállalkozásoknál sok a hasonló kérdés (árak, elérhető időpontok, szolgáltatások) — egy chatbot ezeket automatikusan kezelné, este és hétvégén is.",
  restaurant: "Éttermeknél/vendéglátásban sok az ismétlődő kérdés (nyitvatartás, asztalfoglalás, allergén infó) — egy chatbot ezeket automatikusan megválaszolná, akár csúcsidőben is.",
  webshop:    "Webshopoknál a vásárlók gyakran ugyanazokat a kérdéseket teszik fel (szállítás, visszaküldés, elérhetőség) — egy chatbot ezeket azonnal megválaszolná, ami a kosárelhagyást is csökkentheti.",
};

function getChatbotFinding(checks = {}) {
  if (checks.hasChatbot === true && checks.hasAiDisclosure === false) {
    const nameRef = checks.chatbotName ? ` (${checks.chatbotName})` : "";
    return {
      kind: "aiact",
      text: `Azt látom, hogy van chatbot a weboldalukon${nameRef}, de nem találtam rajta egyértelmű jelzést arra, hogy a látogató mesterséges intelligenciával beszélget. 2026. augusztus 2. óta ez az EU AI Act aktívan érvényesített előírása — kötelező jelezni, ha valaki AI-val, nem élő emberrel kommunikál, és a hiánya már ténylegesen bírságolható. A javítás technikailag egyszerű, de a kockázat valós és aktuális.`,
      subject: "EU AI Act megfelelőségi hiányosság a weboldalukon",
    };
  }
  if (checks.hasChatbot === false && checks.businessCategory && CHATBOT_CATEGORY_TEXT[checks.businessCategory]) {
    return { kind: "opportunity", text: CHATBOT_CATEGORY_TEXT[checks.businessCategory], subject: "Egy fejlesztési ötlet a weboldalukhoz" };
  }
  return null;
}

// Legördülő menü opciói a kézi felülbíráláshoz — arra az esetre, amikor a
// cégtípus-felismerés némán elhasal (pl. a célszerver blokkolja a szerver-
// oldali lekérésünket, ahogy a blue-dent.hu-nál is történt: a szerver egy
// "Hitelesítés / Verification" oldalt adott vissza a valódi tartalom helyett).
// A fogászat/orvosi van legfelül, mert ez volt a mai nap legerősebb,
// legtöbbször validált kategória — de bármelyik kiválasztható.
const CHATBOT_CATEGORY_OPTIONS = [
  { value: "", label: "— Nincs chatbot-ajánlás —" },
  { value: "dental", label: "Fogászat / orvosi rendelő (ajánlott)" },
  { value: "medical", label: "Egyéb orvosi rendelő" },
  { value: "beauty", label: "Szépségipar (fodrász, kozmetika)" },
  { value: "restaurant", label: "Étterem / vendéglátás" },
  { value: "webshop", label: "Webshop" },
];

// Kézi felülbírálás mindig elsőbbséget élvez az automatikus felismeréssel
// szemben — ha ki van választva egy kategória, azt használjuk, különben az
// automatikus getChatbotFinding eredményét.
function resolveChatbotFinding(checks, manualCategory) {
  if (manualCategory && CHATBOT_CATEGORY_TEXT[manualCategory]) {
    return { kind: "opportunity", text: CHATBOT_CATEGORY_TEXT[manualCategory], subject: "Egy fejlesztési ötlet a weboldalukhoz" };
  }
  return getChatbotFinding(checks);
}

// Csak akkor hívjuk, ha NINCS kritikus hiba — a "nincs kritikus hiba"
// képernyőn egy gombra kattintva generálódik, nem automatikusan.
function getStandaloneChatbotMessage(finding, domain) {
  const siteRef = domain ? ` (${domain})` : "";
  const opener = finding.kind === "aiact"
    ? "bár klasszikus technikai hibát nem találtam rajta, van egy jogi jellegű észrevételem a chatbotjukkal kapcsolatban"
    : "bár kritikus hibát nem találtam rajta, van egy fejlesztési ötletem, amit érdemesnek találtam megosztani";
  const message = `Tisztelt Hölgyem/Uram!\n\n${INTRO} Megnéztem a weboldalukat${siteRef}, és ${opener}: ${finding.text} ${CTA_QUESTION}\n\n${SIGNATURE}`;
  return { message, subject: finding.subject };
}

// ── "Hirdet, de a lemorzsolódó látogatókat nem gyűjti be" — 2026-08-18, ÚJ ──
// Szándékosan NEM kézi dropdown dönti el, kire vonatkozik — a user explicit
// kérése volt, hogy ne kelljen találgatnia. Ehelyett egy DETERMINISZTIKUS
// jelet nézünk: ha az auditált URL-ben ott van egy Google Ads kattintás-
// azonosító (gclid/gad_campaignid/gbraid/wbraid/gad_source), az önmagában
// bizonyítja, hogy a cég ténylegesen fut Google Ads kampányt — ezt a Google
// csak akkor fűzi a linkhez, ha valaki tényleg egy hirdetésre kattintott.
// Pont így találta meg Richárd is ezeket a cégeket (a saját, valós
// kattintásából másolt linket illesztette be az audit mezőbe) — a jel tehát
// mindig ott van, amikor releváns, nem kell kézzel bejelölni semmit.
const AD_CLICK_PARAM_PATTERN = /[?&](gclid|gad_campaignid|gad_source|gbraid|wbraid)=/i;

// Csak akkor hívjuk, ha NINCS kritikus hiba ÉS az URL-ben van hirdetés-jel —
// lásd a fenti komment. Tudatosan NEM állítunk konkrét %-os statisztikát
// (pl. "95-97% elmegy ajánlatkérés nélkül") — ez cégenként eltérő, nincs
// mögötte saját mérési adatunk, csak egy általános, védhető állítást teszünk.
function getAdCaptureMessage(domain) {
  const siteRef = domain ? ` (${domain})` : "";
  const message = `Tisztelt Hölgyem/Uram!\n\n${INTRO} Megnéztem a weboldalukat${siteRef}, és bár kritikus hibát nem találtam rajta, van egy észrevételem, ami a hirdetési költésükhöz kapcsolódik: azt látom, hogy Google Ads-en hirdetnek. A legtöbb PPC-kutatás szerint a fizetett hirdetésre kattintók túlnyomó többsége nem kér azonnal ajánlatot, csak elmegy — és az a kattintás visszahozhatatlanul elveszik. Egy erre betanított AI chat-asszisztens ezeket a bizonytalan látogatókat is meg tudná szólítani, és be tudná gyűjteni az elérhetőségüket, mielőtt elmennének. ${CTA_QUESTION}\n\n${SIGNATURE}`;
  return { message, subject: "Elveszhetnek a hirdetésből érkező, bizonytalan látogatók" };
}

// ── Kritikus hiba detektálás ─────────────────────────────────────────────────
// Csak ezek a dolgok számítanak "kritikusnak" — ezek indokolják önmagukban a
// hideg megkeresést. Minden más (meta leírás, schema, analytics stb.) mostantól
// nem jelenik meg sehol — a tool kizárólag arra való, hogy kiszűrje, van-e
// egyáltalán mit írni.
// FONTOS: ha TÖBB kritikus hiba is fennáll egyszerre, mindegyik bekerül az
// üzenetbe — nem csak az első találat (korábban ez volt a hiba).
function getCriticalIssue(mobileScore, desktopScore, checks = {}, domain = "", manualChatbotCategory = "", manualIndustryTier = "") {
  // Ha a Lighthouse elhasalt (lásd lighthouseFailed az API válaszban), a
  // pontszámok null-ok lehetnek — null < 40 JS-ben igazra értékelődne ki
  // (0-ra kényszerülne), ezért csak akkor nézzük a mobil-alapú találatokat,
  // ha tényleg van valós szám.
  const scoresAvailable = typeof mobileScore === "number" && typeof desktopScore === "number";
  const bigGap          = scoresAvailable && (desktopScore - mobileScore) > 30;
  const noHttps         = checks.https === false;
  const httpNotEnforced = checks.httpNotEnforced === true;
  const phpEol          = checks.phpEol === true;
  const angularEol      = checks.isAngularJs === true;
  const wpCoreEol       = checks.wpCoreEol === true;
  const jqueryVeryOld   = checks.jqueryVeryOld === true;
  const phpErrorsExposed = checks.phpErrorsExposed === true;
  const deadGoogleAnalytics = checks.deadGoogleAnalytics === true;
  const hasFlash        = checks.hasFlash === true;
  const missingViewport = checks.missingViewport === true;
  const gdprConsentMissing = checks.gdprConsentMissing === true;
  // PHP 7.x-ről 8-ra váltani jellemzően csak szerverbeállítás + apró javítás —
  // valódi frissítési út van. PHP 5.x-nél viszont a kód szinte biztos, hogy a
  // rég megszűnt mysql_* függvényeket használja, ami PHP 7+ alatt egyáltalán
  // nem fut le — ott a "javítás" a gyakorlatban ugyanaz, mint egy új oldal.
  const phpMajor        = checks.phpVersion ? parseInt(checks.phpVersion, 10) : null;
  const phpVeryOld      = phpEol && phpMajor !== null && phpMajor < 7;
  // A jQuery-verzió önmagában cserélhető lenne, de itt nem erről van szó: egy
  // 2010-2012-es verziószám azt jelzi, hogy a TELJES oldal (design, kód,
  // minden) évtizede érintetlen — ez ugyanolyan "cseréljük le" jel, mint az
  // AngularJS vagy a nagyon régi PHP.
  const needsRebuild    = angularEol || phpVeryOld || jqueryVeryOld || hasFlash || missingViewport;
  const mobileBroken    = bigGap && mobileScore < 55;
  // Ha mobileBroken is fennáll, azt mutatjuk — a kettő ugyanazt a tünetet írja
  // le más szögből, kettő együtt redundáns lenne.
  const mobileTrulySlow = scoresAvailable && !mobileBroken && mobileScore < 40;

  const types = [];
  const bullets = [];

  if (noHttps) {
    types.push("nohttps");
    bullets.push("nem biztonságos kapcsolaton tölt be — az oldalon beküldött adatok (pl. egy kapcsolat-űrlap) titkosítatlanul utaznak, bárki elolvashatja őket útközben egy közös hálózaton, és a böngészők is \"Nem biztonságos\" figyelmeztetést mutatnak minden látogatónak");
  }
  if (httpNotEnforced) {
    types.push("httpnotenforced");
    bullets.push("van biztonságos (https) verziójuk, de nincs kikényszerítve — aki csak beírja a domaint vagy egy régi linket nyit meg (pl. nyomtatott anyagból), titkosítatlan kapcsolaton landol");
  }
  if (phpEol) {
    types.push("phpeol");
    bullets.push(`a szerver elavult PHP-verziót (${checks.phpVersion}) futtat, amihez már nem érkezik biztonsági frissítés — ha ma találnak benne egy rést, az sosem lesz javítva, és pont az ilyen oldalakat keresik célzottan a feltörésre szakosodott automatizált eszközök`);
  }
  if (angularEol) {
    types.push("angulareol");
    bullets.push("a weboldal felülete egy elavult keretrendszert (AngularJS) használ, amit 2022 januárja óta nem támogat és nem javít a gyártó — ha ma találnak benne egy rést, az sosem lesz javítva, és pont az ilyen elavult keretrendszereket keresik célzottan a feltörésre szakosodott automatizált eszközök");
  }
  if (wpCoreEol) {
    types.push("wpcoreeol");
    bullets.push(`a weboldal egy régóta nem frissített WordPress-alapváltozatot (${checks.wpVersion}) futtat — a WordPress alapból automatikusan frissítene, tehát ez évek óta nem történt meg, ami azt jelenti, hogy évek óta ismert biztonsági résekkel fut, amiket pont az ilyen elhanyagolt oldalak ellen szoktak célzottan kihasználni`);
  }
  if (jqueryVeryOld) {
    types.push("jqueryold");
    bullets.push(`a weboldal egy elavult JavaScript-könyvtárat (jQuery ${checks.jqueryVersion}) használ, aminek már 2016 óta nincs érdemi fejlesztése — ez önmagában is jelzi, hogy a teljes oldal jó eséllyel egy évtizede nem lett érdemben frissítve, sem technikailag, sem dizájnban`);
  }
  if (phpErrorsExposed) {
    types.push("phperrors");
    bullets.push("nyilvánosan látszik rajta egy PHP-hibaüzenet, ami a szerver belső fájlrendszerének elérési útját is elárulja — ez tényleges információszivárgás, amit egy támadó felhasználhat a rendszer feltérképezésére, és emellett is nagyon nem professzionális benyomást kelt a látogatóknak");
  }
  if (deadGoogleAnalytics) {
    types.push("deadga");
    bullets.push("a régi, klasszikus Google Analytics-kódot (ga.js) használják, amit a Google 2023. július 1-én véglegesen leállított — vagyis évek óta nem gyűlik semmilyen valós látogatottsági adat, holott azt hihetik, hogy mérik a forgalmukat");
  }
  if (hasFlash) {
    types.push("flash");
    bullets.push("van rajta Flash-alapú tartalom, amit minden böngésző 2020 vége óta véglegesen kivezetett — ez a tartalom ma senkinek nem jelenik meg, garantáltan");
  }
  if (missingViewport) {
    types.push("noviewport");
    bullets.push("hiányzik róla a mobil-nézetért felelős alapbeállítás (viewport), ami azt jelenti, hogy az oldal garantáltan nem reszponzív — ez erős jele annak, hogy a teljes oldal a mobil-first kor (kb. 2012) előtt készült");
  }
  if (gdprConsentMissing) {
    types.push("gdpr");
    bullets.push("látogatókövető kódot (pl. Google Analytics) futtat, de sem süti-hozzájárulási felületet, sem adatvédelmi tájékoztatóra mutató linket nem találtam rajta — ez GDPR-szempontból kockázatos, és bármikor bejelentés vagy ellenőrzés tárgya lehet");
  }
  if (mobileBroken) {
    types.push("mobilebroken");
    bullets.push("asztali gépen jól néz ki, de mobilon sajnos nehézkes a használata — ma már az érdeklődők nagy része telefonon keres, és ez sok látogatót eltérít, mielőtt még kapcsolatba lépnének");
  } else if (mobileTrulySlow) {
    types.push("mobileslow");
    bullets.push(`mobilon igen lassan tölt be — a Google mérése szerint ${mobileScore}/100 pont, ami azt jelenti, hogy egy átlagos kapcsolaton az oldal betöltése több másodpercet vesz igénybe`);
  }

  const chatbotFinding = resolveChatbotFinding(checks, manualChatbotCategory);

  // Ha nincs kritikus hiba, a chatbot-találatot NEM ide keverjük — az a "nincs
  // kritikus hiba" képernyőn jelenik meg, külön, gombra kattintva generált
  // üzenetként (lásd getStandaloneChatbotMessage). Itt csak akkor van dolgunk,
  // ha VAN legalább egy kritikus bullet is.
  if (bullets.length === 0) return null;

  // ── High-Ticket/sürgősségi rövid, üzleti-hatás sablon ───────────────────
  // Ha van iparág-tier (automatikus vagy kézi felülbírálás) ÉS a talált
  // hibák közül legalább egy besorolható üzleti-hatás kategóriába, EGY rövid,
  // 4-6 mondatos, kérdés-CTA-s levelet küldünk a klasszikus, technikai
  // bullet-lista helyett — ez a user explicit kérése (2026-08-17): ez a
  // célcsoport nem IT-s, a technikai részletezés nem hoz választ, a
  // konkrét, pénzben kifejezett veszteség viszont igen.
  const industryTier = manualIndustryTier || checks.industryTier || null;
  const impactCategory = industryTier ? pickImpactCategory(types) : null;
  if (industryTier && impactCategory && BUSINESS_IMPACT[industryTier]?.[impactCategory]) {
    const concreteReason = getConcreteReason(types, impactCategory, checks, mobileScore);
    // A "security" kategórián belül 3 alszöveg van (visible/hidden/gdpr) —
    // lásd a BUSINESS_IMPACT feletti komment, miért nem egyetlen szöveg ez.
    const consequenceText = impactCategory === "security"
      ? BUSINESS_IMPACT[industryTier].security[getSecurityConsequenceKind(types)](!!checks.hasGoogleAds)
      : BUSINESS_IMPACT[industryTier][impactCategory](!!checks.hasGoogleAds);
    const impactText = concreteReason ? `${concreteReason} — ${consequenceText}` : consequenceText;
    const shortSiteRef = domain ? ` (${domain})` : "";
    // A jogi/compliance jellegű chatbot-találat (AI Act) egy önálló, komoly
    // kockázat — ez SOSEM maradhat ki csendben, még a rövid sablonból se
    // (2026-08-18-i hiba volt: energoptimo.hu-nál elnyelte a mobil-hiba
    // ága). A puha "fejlesztési ötlet" (opportunity) viszont marad kint a
    // rövid ágból, hogy ne hízzon el a levél minden dental/medaesthetic
    // lead-nél, ahol amúgy sincs chatbot.
    const shortChatbotParagraph = chatbotFinding?.kind === "aiact"
      ? `\n\nEmellett egy jogi jellegű észrevételem is van a chatbotjukkal kapcsolatban: ${chatbotFinding.text}`
      : "";
    const message = `Tisztelt Hölgyem/Uram!\n\n${INTRO} Megnéztem a weboldalukat${shortSiteRef}, és azt találtam, hogy ${impactText}.${shortChatbotParagraph} ${CTA_QUESTION}\n\n${SIGNATURE}`;
    const subject = impactCategory === "mobile"
      ? "Elveszhetnek a hirdetésből érkező érdeklődők"
      : impactCategory === "security"
      ? "Bizalmi kockázat a weboldalukon"
      : "Nem mérik, mit hoz a hirdetési költésük";
    return { types, message, subject };
  }

  const siteRef = domain ? ` (${domain})` : "";
  const closing = bullets.length === 1
    ? (needsRebuild ? "Szívesen segítek ezt modern, biztonságos felületre cserélni." : "Szívesen segítek rendbe tenni ezt.")
    : (needsRebuild ? "Szívesen segítek ezeket modern, biztonságos felületre cserélni." : "Szívesen segítek rendbe tenni ezeket.");
  const body = bullets.length === 1
    ? `Tisztelt Hölgyem/Uram!\n\n${INTRO} Megnéztem a weboldalukat${siteRef}, és azt látom, hogy ${bullets[0]}. Úgy gondolom, hogy ez valós kockázatot jelent, ezért gondoltam, hogy jelezném Önök felé. ${closing}`
    : `Tisztelt Hölgyem/Uram!\n\n${INTRO} Megnéztem a weboldalukat${siteRef}, és pár dolgot találtam, amit érdemes lenne tudniuk:\n\n${bullets.map(b => `• ${b.charAt(0).toUpperCase()}${b.slice(1)}.`).join("\n")}\n\nÚgy gondolom, hogy ezek valós kockázatot jelentenek, ezért gondoltam, hogy jelezném Önök felé. ${closing}`;

  // A chatbot-vonatkozású találat (ha van) külön bekezdésként jön a kritikus
  // rész UTÁN — szándékosan nem kerül be a felsorolásba, hogy világos maradjon:
  // az egyik valós kockázat, a másik jogi észrevétel vagy csak egy lehetőség.
  const chatbotParagraph = !chatbotFinding ? "" : chatbotFinding.kind === "aiact"
    ? `\n\nEmellett egy másik, jogi jellegű észrevételem is van a chatbotjukkal kapcsolatban: ${chatbotFinding.text}`
    : `\n\nEmellett van egy fejlesztési ötletem is — ez nem hiba, csak lehetőség, amit érdemesnek találtam megemlíteni: ${chatbotFinding.text}`;

  const message = `${body}${chatbotParagraph} ${CTA_QUESTION}\n\n${SIGNATURE}\n\n${PS_NEW_SITE}`;

  // Tárgy: biztonsági jellegű, ha https/php/info-szivárgás érintett, mobil-jellegű,
  // ha a reszponzivitás/teljesítmény érintett, egyébként egy semleges tárgy.
  const hasSecurityIssue = types.some(t => ["nohttps", "httpnotenforced", "phpeol", "angulareol", "wpcoreeol", "jqueryold", "phperrors", "gdpr"].includes(t));
  const hasMobileIssue   = types.some(t => ["mobilebroken", "mobileslow", "noviewport", "flash"].includes(t));
  const subject = hasSecurityIssue && hasMobileIssue
    ? "Pár fontos észrevétel a weboldalukhoz"
    : hasSecurityIssue
    ? "Biztonsági észrevétel a weboldalukhoz"
    : hasMobileIssue
    ? "Weboldal-észrevétel — mobil felhasználói élmény"
    : "Weboldal-észrevétel — érdemes ránézni";

  return { types, message, subject };
}

// ── Csak Facebook-oldal, nincs önálló weboldal ───────────────────────────────
// Ez nem az URL-auditból jön (nincs mit auditálni) — kézzel talált lead-ekhez,
// ahol a cégnek csak Facebook-jelenléte van. Nem "javítás", hanem egyértelműen
// új weboldal a pitch, szóval nincs benne PS_NEW_SITE (az redundáns lenne).
function getNoWebsitePitch(businessName = "", deadDomain = "") {
  const nameRef = businessName.trim() ? ` (${businessName.trim()})` : "";
  const domain = deadDomain.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  // Ha van egy halott domain, amit a Facebook oldaluk linkel, ez sokkal
  // konkrétabb, kínosabb (tehát erősebb) nyitás, mint az általános "nincs
  // önálló weboldaluk" — mutatja, hogy tényleg alaposan megnézted őket.
  const opener = domain
    ? `Megnéztem a Facebook oldalukat${nameRef}, és észrevettem, hogy van rajta egy link a weboldalukra (${domain}), de az jelenleg egyáltalán nem érhető el — aki megpróbál rákattintani, nem talál semmit.`
    : `Megnéztem a Facebook oldalukat${nameRef}, és azt látom, hogy jelenleg nincs önálló weboldaluk.`;
  const message = `Tisztelt Hölgyem/Uram!\n\n${INTRO} ${opener} Úgy gondolom, hogy ez valós lehetőséget jelent Önöknek, mégpedig a következők miatt:\n\n• Akik Google-ban keresnek rájuk, nem találják meg Önöket — egy Facebook-oldal sokkal gyengébben szerepel a keresésben, mint egy saját weboldal.\n• A Facebook-oldal nem az Önöké — bármikor korlátozhatja az elérést, megváltoztathatja az algoritmust, vagy akár le is tilthatja az oldalt, és ezen Önöknek nincs befolyásuk.\n• Sok érdeklődő bizalmatlanabb egy olyan céggel szemben, akinek nincs saját weboldala.\n\nSzívesen segítek felépíteni egy modern, gyors és ügyfélszerzésre optimalizált weboldalt. ${CTA_QUESTION}\n\n${SIGNATURE}`;
  const subject = domain
    ? "Weboldal-lehetőség — a Facebook oldalukon lévő link nem működik"
    : "Weboldal-lehetőség — jelenleg csak Facebook oldaluk van";
  return { message, subject };
}

// ── Oldal nem érhető el ──────────────────────────────────────────────────────
// FONTOS: "nem érhető el" gyakran nem azt jelenti, hogy az oldal tényleg le
// van állva — sokszor a https-tanúsítvány van rossz domainre kiállítva
// (megosztott tárhely, sosem cserélt default cert), és emiatt blokkolja
// minden böngésző a kapcsolatot. Ez egy sokkal konkrétabb, erősebb találat,
// mint az általános "nem töltött be" — külön szöveget kap.
function getUnreachableMessage(domain, tlsError) {
  const domainRef = domain ? ` (${domain})` : "";
  if (tlsError) {
    return {
      explanation: "Ez nem feltétlenül azt jelenti, hogy az oldal teljesen üzemen kívül van — a biztonságos (https) kapcsolatuk tanúsítványával van probléma, emiatt minden böngésző blokkolja a hozzáférést. Ez önmagában is elég erős, konkrét ok a megkeresésre.",
      subject: "SSL-tanúsítvány hiba a weboldalukon",
      message: `Tisztelt Hölgyem/Uram!\n\n${INTRO} Megnéztem a weboldalukat${domainRef}, és azt találtam, hogy a biztonságos (https) verziójuk el van rontva${tlsError === "hostname_mismatch" ? " — a tanúsítvány egy másik domainre van kiállítva, nem az Önökére" : ""}. Emiatt aki a böngészőjében rákattint vagy beírja a https-es címüket, egy ijesztő "Nem biztonságos kapcsolat" hibaüzenetet kap, amit a legtöbb látogató be sem enged. Úgy gondolom, hogy ez valós kockázatot jelent, mert sok érdeklődő pont emiatt fordulhat el Önöktől anélkül, hogy egyáltalán látnák az oldalt. ${CTA_QUESTION}\n\n${SIGNATURE}\n\n${PS_NEW_SITE}`,
    };
  }
  return {
    explanation: "Ez önmagában is kritikus hiba, és erős ok a megkeresésre — lehet, hogy csak nálad nem töltött be, ellenőrizd az URL-t; de ha valóban nem elérhető az oldal, ez önmagában véve is elég a hideg megkereséshez.",
    subject: "A weboldal nem töltött be",
    message: `Tisztelt Hölgyem/Uram!\n\n${INTRO} Rá akartam nézni a weboldalukra${domainRef}, de sajnos nem sikerült betöltenie — vagy nagyon lassú, vagy éppen nem elérhető. Úgy gondolom, hogy ez valós kockázatot jelent, mert minden érdeklődő, aki most Önökre keres, valószínűleg ugyanezt tapasztalja. Szívesen segítek, hogy ez ne fordulhasson elő. ${CTA_QUESTION}\n\n${SIGNATURE}\n\n${PS_NEW_SITE}`,
  };
}

// ── Főkomponens ──────────────────────────────────────────────────────────────
export default function Audit() {
  const { lang } = useLang();
  const hu = lang === "hu";

  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const [errorTlsError, setErrorTlsError] = useState(null);
  const [results, setResults] = useState(null);
  const [copied, setCopied] = useState(false);
  const [proposalStatus, setProposalStatus] = useState("idle"); // idle | loading | done | error
  const [proposalLink, setProposalLink]     = useState(null);
  const [proposalCopied, setProposalCopied] = useState(false);
  const [fbBusinessName, setFbBusinessName] = useState("");
  const [fbDeadDomain, setFbDeadDomain] = useState("");
  const [fbCopied, setFbCopied] = useState(false);
  const [chatbotPitchRevealed, setChatbotPitchRevealed] = useState(false);
  const [chatbotCopied, setChatbotCopied] = useState(false);
  const [manualChatbotCategory, setManualChatbotCategory] = useState("");
  const [manualIndustryTier, setManualIndustryTier] = useState("");

  const handleCopyFb = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setFbCopied(true);
      setTimeout(() => setFbCopied(false), 2500);
    }).catch(() => {});
  };

  const handleCopyChatbot = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setChatbotCopied(true);
      setTimeout(() => setChatbotCopied(false), 2500);
    }).catch(() => {});
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handleGenerateProposal = async () => {
    if (!results) return;
    setProposalStatus("loading");
    setProposalLink(null);
    try {
      const res = await fetch("/api/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: results.url,
          mobileScore:  results.mobile.score,
          desktopScore: results.desktop.score,
          checks: results.checks,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Hiba");
      const fullLink = `https://richardkormendi.com${json.path}`;
      setProposalLink(fullLink);
      setProposalStatus("done");
    } catch {
      setProposalStatus("error");
    }
  };

  const handleCopyProposal = () => {
    if (!proposalLink) return;
    navigator.clipboard.writeText(proposalLink).then(() => {
      setProposalCopied(true);
      setTimeout(() => setProposalCopied(false), 2500);
    }).catch(() => {});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = "https://" + cleanUrl;
    setStatus("loading");
    setResults(null);
    setManualChatbotCategory("");
    setManualIndustryTier("");
    setChatbotPitchRevealed(false);
    setErrorTlsError(null);
    try {
      const res = await fetch(`${PAGESPEED_URL}?url=${encodeURIComponent(cleanUrl)}`);
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorTlsError(json?.tlsError || null);
        throw new Error(json?.detail || json?.error || `HTTP ${res.status}`);
      }
      const { mobile, desktop } = json;
      // A Lighthouse néha elhasal (pl. bot-védelem blokkolja), miközben a
      // saját közvetlen fetch-ünk (checks) sikeres — ilyenkor mobile/desktop
      // null-ok lehetnek, de a HTML-alapú kritikus hibák még mindig érvényesek.
      const parse = (data) => {
        if (!data) return { score: null, issues: [] };
        const audits = data.lighthouseResult?.audits || {};
        const score = Math.round((data.lighthouseResult?.categories?.performance?.score || 0) * 100);
        const issues = OPPORTUNITY_KEYS
          .map(k => ({ key: k, audit: audits[k] }))
          .filter(({ audit: a }) => a && a.score !== null && a.score < 1)
          .sort((a, b) => a.audit.score - b.audit.score)
          .slice(0, 8);
        return { score, issues };
      };

      const mobileData  = parse(mobile);
      const desktopData = parse(desktop);
      setResults({ mobile: mobileData, desktop: desktopData, url: cleanUrl, checks: json.checks || {}, lighthouseFailed: !!json.lighthouseFailed, previousAuditAt: json.previousAuditAt || null });
      setStatus("done");

      // Értesítés + audit log mentése — fire-and-forget, nem blokkolja az UI-t
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cleanUrl,
          mobileScore:  mobileData.score,
          desktopScore: desktopData.score,
          issues: mobileData.issues.map(({ key, audit: a }) => ({ key, score: a?.score ?? null })),
          checks: json.checks || {},
        }),
      }).catch(() => {}); // silent fail — az audit eredmény fontos, a log nem blokkolhat
    } catch (err) {
      setErrorDetail(err.message || "");
      setStatus("error");
    }
  };

  const resultDomain = results ? (() => { try { return new URL(results.url).hostname; } catch { return ""; } })() : "";
  const critical = results ? getCriticalIssue(results.mobile.score, results.desktop.score, results.checks, resultDomain, manualChatbotCategory, manualIndustryTier) : null;
  const outreachMsg = critical?.message || null;
  const outreachSubject = critical?.subject || null;
  // Csak akkor releváns, ha NINCS kritikus hiba — ott jelenik meg gombbal.
  const standaloneChatbotFinding = results && !critical ? resolveChatbotFinding(results.checks, manualChatbotCategory) : null;
  // Az URL-ben lévő gclid/gad_campaignid stb. deterministikusan bizonyítja,
  // hogy a cég hirdet — ez erősebb, konkrétabb érv, mint az általános
  // "jó lenne egy chatbot" ötlet, ezért felülírja azt. A jogi/compliance
  // kockázatot (aiact) viszont SOSEM írja felül — az mindig elsőbbséget élvez.
  const cameFromAdClick = results ? AD_CLICK_PARAM_PATTERN.test(results.url) : false;
  const secondaryFinding = standaloneChatbotFinding?.kind === "aiact"
    ? standaloneChatbotFinding
    : cameFromAdClick
    ? { kind: "adcapture" }
    : standaloneChatbotFinding;
  const secondaryPitch = !secondaryFinding ? null
    : secondaryFinding.kind === "adcapture"
    ? getAdCaptureMessage(resultDomain)
    : getStandaloneChatbotMessage(secondaryFinding, resultDomain);
  const fbPitch = getNoWebsitePitch(fbBusinessName, fbDeadDomain);
  const unreachableDomain = url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
  const unreachablePitch = getUnreachableMessage(unreachableDomain, errorTlsError);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a", background: "#fff", minHeight: "100vh" }}>
      <div className="audit-navbar"><Navbar /></div>

      {/* ── Hero ── */}
      <section className="audit-hero" style={{ background: "#fff", padding: "9rem 2rem 5rem", textAlign: "center", borderBottom: "1px solid #e8e8e8" }}>
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "1.5rem" }}>
            {hu ? "Ingyenes eszköz" : "Free tool"}
          </p>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, lineHeight: 1.1, marginBottom: "1rem", color: "#1a1a1a" }}>
            {hu ? "Weboldal audit" : "Website audit"}
          </h1>
          <p style={{ fontSize: "1rem", color: "#888", lineHeight: 1.7, maxWidth: "480px", margin: "0 auto 3rem" }}>
            {hu
              ? "Írd be bármelyik weboldal URL-jét — megmutatjuk, mi lassítja és hogyan lehet javítani."
              : "Enter any website URL — we'll show you what's slowing it down and how to fix it."}
          </p>
          <form onSubmit={handleSubmit} style={{ maxWidth: "560px", margin: "0 auto" }}>
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <input
                type="text" value={url} onChange={e => setUrl(e.target.value)}
                placeholder={hu ? "pl. pelda.hu vagy https://pelda.hu" : "e.g. example.com"}
                required
                style={{
                  flex: "1 1 260px", padding: "0.95rem 1.25rem",
                  background: "#fff", border: "1px solid #ddd", borderRadius: "4px",
                  color: "#1a1a1a", fontSize: "0.95rem", fontFamily: "inherit", outline: "none",
                }}
              />
              <button type="submit" disabled={status === "loading"}
                style={{
                  padding: "0.95rem 2rem",
                  background: status === "loading" ? "#f0f0f0" : "#1a1a1a",
                  color: status === "loading" ? "#999" : "#fff",
                  border: "none", borderRadius: "4px", fontSize: "0.9rem", fontWeight: 600,
                  letterSpacing: "0.05em", cursor: status === "loading" ? "not-allowed" : "pointer",
                  fontFamily: "inherit", transition: "all 0.2s", whiteSpace: "nowrap",
                }}>
                {status === "loading" ? (hu ? "Elemzés..." : "Analyzing...") : (hu ? "Audit →" : "Run audit →")}
              </button>
            </div>
            {status === "error" && (
              <div style={{ marginTop: "1.5rem", textAlign: "left", maxWidth: "480px", marginLeft: "auto", marginRight: "auto" }}>
                <p style={{ fontSize: "0.85rem", color: "#e74c3c", fontWeight: 600 }}>
                  {hu
                    ? (errorTlsError ? "SSL-tanúsítvány hiba — a https verzió el van rontva." : "Az oldal nem töltött be / nem elérhető.")
                    : "The page didn't load / isn't reachable."}
                  {errorDetail ? <span style={{ display: "block", fontSize: "0.75rem", color: "#aaa", marginTop: "0.25rem", fontWeight: 400 }}>{errorDetail}</span> : null}
                </p>
                <p style={{ fontSize: "0.8rem", color: "#999", lineHeight: 1.6, marginTop: "0.6rem" }}>
                  {hu
                    ? unreachablePitch.explanation
                    : "This alone is a critical issue and a strong reason to reach out — double-check the URL first, but if the site is genuinely unreachable, that's reason enough on its own."}
                </p>
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button onClick={() => handleCopy(hu ? unreachablePitch.subject : "The website didn't load")} style={{
                    padding: "0.5rem 1.25rem",
                    background: "transparent",
                    color: "#555", border: "1px solid #ddd", borderRadius: "4px",
                    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.2s",
                  }}>
                    {hu ? "Tárgy másolása" : "Copy subject"}
                  </button>
                  <button onClick={() => handleCopy(hu
                    ? unreachablePitch.message
                    : "Hi! I tried to look at your website, but it didn't load — either very slow or currently unreachable. That's a real problem, since anyone searching for you right now is likely hitting the same issue. Happy to help make sure that doesn't happen."
                  )} style={{
                    padding: "0.5rem 1.25rem",
                    background: copied ? "#0cce6b" : "#1a1a1a",
                    color: "#fff", border: "none", borderRadius: "4px",
                    fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "background 0.2s",
                  }}>
                    {copied ? (hu ? "✓ Másolva!" : "✓ Copied!") : (hu ? "Üzenet másolása" : "Copy message")}
                  </button>
                </div>
              </div>
            )}
          </form>
        </motion.div>
      </section>

      {/* ── Csak Facebook oldal, nincs weboldal ── */}
      <section style={{ padding: "3rem 2rem", background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
        <div style={{ maxWidth: "640px", margin: "0 auto" }}>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
            📘 Csak Facebook oldaluk van?
          </p>
          <p style={{ fontSize: "0.85rem", color: "#999", lineHeight: 1.6, marginBottom: "1.25rem" }}>
            Ha kézzel találtál egy céget, akinek nincs önálló weboldala, csak Facebook-jelenléte — itt generálhatsz nekik egy kész üzenetet, URL nélkül.
          </p>
          <input
            type="text" value={fbBusinessName} onChange={e => setFbBusinessName(e.target.value)}
            placeholder="Cégnév (opcionális, csak a személyre szabáshoz)"
            style={{
              width: "100%", padding: "0.75rem 1rem", marginBottom: "0.75rem",
              background: "#fff", border: "1px solid #ddd", borderRadius: "4px",
              color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <input
            type="text" value={fbDeadDomain} onChange={e => setFbDeadDomain(e.target.value)}
            placeholder="Halott domain, ha a Facebook oldalukon linkelnek egy nem működő weboldalt (opcionális)"
            style={{
              width: "100%", padding: "0.75rem 1rem", marginBottom: "1.25rem",
              background: "#fff", border: "1px solid #ddd", borderRadius: "4px",
              color: "#1a1a1a", fontSize: "0.9rem", fontFamily: "inherit", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <div style={{ padding: "1.5rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", borderLeft: "4px solid #1a1a1a" }}>
            <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.4rem" }}>
              Tárgy
            </p>
            <p style={{ fontSize: "0.88rem", color: "#333", marginBottom: "1rem" }}>
              {fbPitch.subject}
            </p>
            <p style={{ fontSize: "0.9rem", color: "#333", lineHeight: 1.8, marginBottom: "1.25rem", fontStyle: "italic", whiteSpace: "pre-line" }}>
              "{fbPitch.message}"
            </p>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <button onClick={() => handleCopyFb(fbPitch.subject)}
                style={{
                  padding: "0.55rem 1.25rem", background: "#fff",
                  color: fbCopied ? "#0cce6b" : "#1a1a1a",
                  border: "1px solid #1a1a1a", borderRadius: "4px",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "color 0.2s",
                }}>
                {fbCopied ? "✓ Másolva!" : "Tárgy másolása"}
              </button>
              <button onClick={() => handleCopyFb(fbPitch.message)}
                style={{
                  padding: "0.55rem 1.25rem",
                  background: fbCopied ? "#0cce6b" : "#1a1a1a",
                  color: "#fff", border: "none", borderRadius: "4px",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "background 0.2s",
                }}>
                {fbCopied ? "✓ Másolva!" : "Üzenet másolása"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Töltés ── */}
      <AnimatePresence>
        {status === "loading" && (
          <motion.div className="audit-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ textAlign: "center", padding: "6rem 2rem", background: "#fafafa" }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              style={{ width: "32px", height: "32px", border: "3px solid #e8e8e8", borderTopColor: "#1a1a1a", borderRadius: "50%", margin: "0 auto 1.5rem" }}
            />
            <p style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "0.5rem" }}>
              {hu ? "Elemzés folyamatban..." : "Analysing your website..."}
            </p>
            <p style={{ fontSize: "0.85rem", color: "#aaa" }}>
              {hu ? "Ez kb. 15–20 másodpercet vesz igénybe" : "This usually takes 15–20 seconds"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Eredmény ── */}
      <AnimatePresence>
        {status === "done" && results && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            {critical ? (
              <section style={{ padding: "5rem 2rem", background: "#f7f6f3" }}>
                <div style={{ maxWidth: "640px", margin: "0 auto" }}>
                  <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <p style={{ fontSize: "0.75rem", letterSpacing: "0.15em", color: "#999", textTransform: "uppercase", marginBottom: results.lighthouseFailed || results.previousAuditAt ? "0.5rem" : "2rem" }}>
                      {results.url}
                    </p>
                    {results.previousAuditAt && (
                      <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#b3261e", background: "#fdecea", border: "2px solid #f5b7b1", borderRadius: "6px", padding: "0.9rem 1.25rem", marginBottom: "1.5rem" }}>
                        ⚠️ Ezt a domaint már megkerested korábban — {new Date(results.previousAuditAt).toLocaleString("hu-HU", { timeZone: "Europe/Budapest", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    {results.lighthouseFailed && (
                      <p style={{ fontSize: "0.78rem", color: "#c98a00", background: "#fff8ea", border: "1px solid #f0dfb0", borderRadius: "4px", padding: "0.6rem 0.9rem", marginBottom: "1.5rem", lineHeight: 1.5 }}>
                        ⚠️ A Google Lighthouse-elemzés nem sikerült ezúttal (a szerver válaszolt, csak az elemzés hasalt el — pl. bot-védelem miatt) — ezért a mobil-teljesítmény alapú találatok most nem futottak, csak a HTTPS/PHP/WordPress/AngularJS-alapú ellenőrzések.
                      </p>
                    )}

                    {/* ── Másolható üzenet ── */}
                    <div style={{ padding: "2rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", borderLeft: "4px solid #1a1a1a" }}>
                      <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.5rem" }}>
                        📋 Másolható üzenet
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "1rem", lineHeight: 1.5 }}>
                        LinkedIn-en vagy emailben küldheted el — nem hivatkozik eszközre, nem kér semmit:
                      </p>
                      <div style={{ marginBottom: "0.75rem", padding: "0.75rem 1rem", background: "#f7f6f3", borderRadius: "6px" }}>
                        <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.08em", color: "#999", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                          High-Ticket/sürgősségi iparág kézi felülbírálása (rövid, üzleti-hatás alapú levelet generál a technikai lista helyett)
                        </label>
                        <select value={manualIndustryTier} onChange={e => setManualIndustryTier(e.target.value)}
                          style={{ width: "100%", padding: "0.5rem 0.6rem", fontSize: "0.85rem", fontFamily: "inherit", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", color: "#333" }}>
                          {INDUSTRY_TIER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ marginBottom: "1.25rem", padding: "0.75rem 1rem", background: "#f7f6f3", borderRadius: "6px" }}>
                        <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.08em", color: "#999", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                          Chatbot-ajánlás kézi felülbírálása (ha az automatikus felismerés nem talált semmit)
                        </label>
                        <select value={manualChatbotCategory} onChange={e => setManualChatbotCategory(e.target.value)}
                          style={{ width: "100%", padding: "0.5rem 0.6rem", fontSize: "0.85rem", fontFamily: "inherit", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", color: "#333" }}>
                          {CHATBOT_CATEGORY_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      {outreachSubject && (
                        <>
                          <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                            Tárgy
                          </p>
                          <p style={{ fontSize: "0.88rem", color: "#333", marginBottom: "1rem" }}>
                            {outreachSubject}
                          </p>
                        </>
                      )}
                      <p style={{ fontSize: "0.92rem", color: "#333", lineHeight: 1.8, marginBottom: "1.25rem", fontStyle: "italic", whiteSpace: "pre-line" }}>
                        "{outreachMsg}"
                      </p>
                      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                        {outreachSubject && (
                          <button onClick={() => handleCopy(outreachSubject)}
                            style={{
                              padding: "0.55rem 1.25rem",
                              background: "#fff",
                              color: copied ? "#0cce6b" : "#1a1a1a",
                              border: "1px solid #1a1a1a", borderRadius: "4px",
                              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                              fontFamily: "inherit", transition: "color 0.2s",
                            }}>
                            {copied ? "✓ Másolva!" : "Tárgy másolása"}
                          </button>
                        )}
                        <button onClick={() => handleCopy(outreachMsg)}
                          style={{
                            padding: "0.55rem 1.25rem",
                            background: copied ? "#0cce6b" : "#1a1a1a",
                            color: "#fff", border: "none", borderRadius: "4px",
                            fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                            fontFamily: "inherit", transition: "background 0.2s",
                          }}>
                          {copied ? "✓ Másolva!" : "Üzenet másolása"}
                        </button>
                      </div>
                    </div>

                    {/* ── Ajánlat generálása ── */}
                    <div style={{ marginTop: "1.5rem", padding: "1.75rem 2rem", background: "#fff",
                      borderRadius: "8px", border: "1px solid #e8e8e8" }}>
                      <p style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                        📄 Ajánlat generálása
                      </p>
                      <p style={{ fontSize: "0.8rem", color: "#999", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                        Egy kattintás — kész, küldhető link az ügyfélnek. Tartalmazza a problémákat, a megoldást és az árat.
                      </p>
                      {proposalStatus === "idle" && (
                        <button onClick={handleGenerateProposal}
                          style={{ padding: "0.65rem 1.5rem", background: "#1a1a1a", color: "#fff",
                            border: "none", borderRadius: "6px", fontSize: "0.85rem", fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit" }}>
                          Ajánlat generálása →
                        </button>
                      )}
                      {proposalStatus === "loading" && (
                        <p style={{ fontSize: "0.85rem", color: "#999" }}>Generálás folyamatban...</p>
                      )}
                      {proposalStatus === "error" && (
                        <p style={{ fontSize: "0.85rem", color: "#ff4e42" }}>Hiba történt, próbáld újra.</p>
                      )}
                      {proposalStatus === "done" && proposalLink && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                            <a href={proposalLink} target="_blank" rel="noopener noreferrer"
                              style={{ fontSize: "0.85rem", color: "#1a1a1a", fontWeight: 600,
                                wordBreak: "break-all", textDecoration: "underline" }}>
                              {proposalLink}
                            </a>
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button onClick={handleCopyProposal}
                              style={{ padding: "0.55rem 1.25rem",
                                background: proposalCopied ? "#0cce6b" : "#1a1a1a",
                                color: "#fff", border: "none", borderRadius: "4px",
                                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer",
                                fontFamily: "inherit", transition: "background 0.2s" }}>
                              {proposalCopied ? "✓ Másolva!" : "Link másolása"}
                            </button>
                            <button onClick={() => { setProposalStatus("idle"); setProposalLink(null); }}
                              style={{ padding: "0.55rem 1.25rem", background: "transparent",
                                color: "#999", border: "1px solid #e8e8e8", borderRadius: "4px",
                                fontSize: "0.8rem", cursor: "pointer", fontFamily: "inherit" }}>
                              Új ajánlat
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </section>
            ) : (
              <section style={{ padding: "6rem 2rem", background: "#f7f6f3" }}>
                <div style={{ maxWidth: "640px", margin: "0 auto", textAlign: "center" }}>
                  <motion.div variants={fadeUp} initial="hidden" animate="visible">
                    <p style={{ fontSize: "2.2rem", marginBottom: "1rem" }}>✅</p>
                    <h2 style={{ fontSize: "clamp(1.3rem, 3vw, 1.8rem)", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.75rem" }}>
                      {hu ? "Nem találtunk kritikus hibát" : "No critical issue found"}
                    </h2>
                    <p style={{ fontSize: "0.9rem", color: "#888", lineHeight: 1.7 }}>
                      {hu
                        ? "Ezen az oldalon nincs elég erős, önmagában is megálló ok a megkeresésre."
                        : "There's no issue on this site strong enough on its own to justify reaching out."}
                    </p>
                    {results.previousAuditAt && (
                      <p style={{ fontSize: "1.05rem", fontWeight: 700, color: "#b3261e", background: "#fdecea", border: "2px solid #f5b7b1", borderRadius: "6px", padding: "0.9rem 1.25rem", marginTop: "1.25rem", textAlign: "left" }}>
                        ⚠️ Ezt a domaint már megkerested korábban — {new Date(results.previousAuditAt).toLocaleString("hu-HU", { timeZone: "Europe/Budapest", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    )}
                    {results.lighthouseFailed && (
                      <p style={{ fontSize: "0.78rem", color: "#c98a00", background: "#fff8ea", border: "1px solid #f0dfb0", borderRadius: "4px", padding: "0.6rem 0.9rem", marginTop: "1.25rem", lineHeight: 1.5, textAlign: "left" }}>
                        ⚠️ A Google Lighthouse-elemzés nem sikerült ezúttal — a mobil-teljesítmény alapú találatok nem futottak le, csak a HTTPS/PHP/WordPress/AngularJS-alapú ellenőrzések. Ha bizonytalan vagy, próbáld újra később.
                      </p>
                    )}
                    <div style={{ marginTop: "1.5rem", textAlign: "left" }}>
                      <label style={{ display: "block", fontSize: "0.7rem", letterSpacing: "0.08em", color: "#999", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                        Chatbot-ajánlás kézi felülbírálása (ha az automatikus felismerés nem talált semmit)
                      </label>
                      <select value={manualChatbotCategory} onChange={e => setManualChatbotCategory(e.target.value)}
                        style={{ width: "100%", padding: "0.5rem 0.6rem", fontSize: "0.85rem", fontFamily: "inherit", border: "1px solid #ddd", borderRadius: "4px", background: "#fff", color: "#333" }}>
                        {CHATBOT_CATEGORY_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                      <p style={{ fontSize: "0.72rem", color: "#bbb", marginTop: "0.4rem", lineHeight: 1.5 }}>
                        Ezt csak akkor kell állítanod, ha a cégtípus nem egyértelmű az oldal címéből — a hirdetés-alapú ajánlás (lásd lent, ha releváns) mindig automatikus, ahhoz nem kell semmit kiválasztanod.
                      </p>
                    </div>
                    {secondaryFinding && (
                      <div style={{ marginTop: "1rem", textAlign: "left" }}>
                        <p style={{ fontSize: "0.85rem", color: "#4a3d66", lineHeight: 1.6, background: "#f4f0fb", border: "1px solid #ddd0f0", borderRadius: "6px", padding: "0.8rem 1.1rem" }}>
                          {secondaryFinding.kind === "aiact"
                            ? "⚖️ Viszont van chatbotjuk AI-jelzés nélkül — ez EU AI Act szempontból érdemes megkeresésre."
                            : secondaryFinding.kind === "adcapture"
                            ? "📈 Viszont a linkjükön látszik, hogy hirdetnek — a lemorzsolódó látogatókat egy AI chat-asszisztens megfoghatná."
                            : "💬 Viszont úgy látom, nekik tényleg hasznos lenne egy chatbot."}
                        </p>
                        {!chatbotPitchRevealed ? (
                          <button onClick={() => setChatbotPitchRevealed(true)} style={{
                            marginTop: "0.75rem", padding: "0.55rem 1.25rem", background: "#4a3d66", color: "#fff",
                            border: "none", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 600,
                            cursor: "pointer", fontFamily: "inherit",
                          }}>
                            {secondaryFinding.kind === "aiact" ? "AI Act-levél generálása" : secondaryFinding.kind === "adcapture" ? "Lead-megtartó levél generálása" : "Chatbot-ajánlólevél generálása"} →
                          </button>
                        ) : (
                          <div style={{ marginTop: "1rem", padding: "1.5rem", background: "#fff", borderRadius: "8px", border: "1px solid #e8e8e8", borderLeft: "4px solid #4a3d66" }}>
                            <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", color: "#bbb", textTransform: "uppercase", marginBottom: "0.4rem" }}>
                              Tárgy
                            </p>
                            <p style={{ fontSize: "0.88rem", color: "#333", marginBottom: "1rem" }}>
                              {secondaryPitch.subject}
                            </p>
                            <p style={{ fontSize: "0.92rem", color: "#333", lineHeight: 1.8, marginBottom: "1.25rem", fontStyle: "italic", whiteSpace: "pre-line" }}>
                              "{secondaryPitch.message}"
                            </p>
                            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                              <button onClick={() => handleCopyChatbot(secondaryPitch.subject)} style={{
                                padding: "0.55rem 1.25rem", background: "#fff",
                                color: chatbotCopied ? "#0cce6b" : "#4a3d66",
                                border: "1px solid #4a3d66", borderRadius: "4px",
                                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                              }}>
                                {chatbotCopied ? "✓ Másolva!" : "Tárgy másolása"}
                              </button>
                              <button onClick={() => handleCopyChatbot(secondaryPitch.message)} style={{
                                padding: "0.55rem 1.25rem",
                                background: chatbotCopied ? "#0cce6b" : "#4a3d66",
                                color: "#fff", border: "none", borderRadius: "4px",
                                fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                              }}>
                                {chatbotCopied ? "✓ Másolva!" : "Üzenet másolása"}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                </div>
              </section>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="audit-footer"><Footer /></div>
    </div>
  );
}
