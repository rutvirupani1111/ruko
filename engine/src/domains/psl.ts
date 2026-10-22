/**
 * Bundled public-suffix subset. Covers every `.in` second level, common
 * multi-part country suffixes, and the free-hosting platforms scammers use
 * (so `sbi-kyc.web.app` is its own site, not part of `web.app`).
 */

const IN_SECOND_LEVEL =
  'co net org gen firm ind gov nic ac edu res mil ernet int bank fin 5g 6g ai am bihar biz business ca cn com ' +
  'coop cs delhi dr er gujarat info internet io me pg post pro travel tv uk up us';

const COUNTRY_MULTI =
  'co.uk org.uk me.uk ltd.uk plc.uk net.uk ac.uk gov.uk nhs.uk com.au net.au org.au edu.au gov.au co.nz org.nz ' +
  'com.br com.cn net.cn org.cn gov.cn com.sg edu.sg gov.sg com.my com.pk net.pk org.pk gov.pk com.bd gov.bd ' +
  'com.np gov.np co.za co.jp ne.jp or.jp com.hk com.tw com.mx com.ar com.tr co.id or.id go.id co.ke com.ng gov.ng ' +
  'com.ph com.vn com.kh co.th in.th com.sa gov.sa com.eg com.lk gov.lk co.ae com.ru com.ua co.kr or.kr com.qa ' +
  'com.kw com.om com.bh co.il co.tz co.ug com.gh com.mm';

/** Platforms where anyone can publish a site under a subdomain. */
const HOSTING =
  'web.app firebaseapp.com firebasestorage.app vercel.app now.sh netlify.app netlify.com pages.dev workers.dev ' +
  'github.io gitlab.io herokuapp.com onrender.com glitch.me repl.co replit.app replit.dev ngrok.io ngrok-free.app ' +
  'ngrok.app ngrok-free.dev ngrok.dev loca.lt trycloudflare.com r2.dev blogspot.com blogspot.in wordpress.com ' +
  'wixsite.com wixstudio.io weebly.com 000webhostapp.com azurewebsites.net cloudfront.net appspot.com surge.sh ' +
  'fly.dev railway.app up.railway.app webflow.io framer.website framer.app canva.site my.canva.site notion.site ' +
  'square.site business.site godaddysites.com mystrikingly.com duckdns.org ddns.net hopto.org zapto.org serveo.net ' +
  's3.amazonaws.com amazonaws.com translate.goog web.core.windows.net blob.core.windows.net storage.googleapis.com ' +
  'dweb.link ipfs.io w3s.link carrd.co tilda.ws jimdosite.com yolasite.com webnode.page firebaseio.com ' +
  'pythonanywhere.com vercel.sh onrender.app deno.dev ngrok.pizza github.dev codeberg.page';

const SUFFIXES = new Set<string>();
const HOSTING_SET = new Set<string>();

function init(): void {
  if (SUFFIXES.size > 0) return;
  for (const l of IN_SECOND_LEVEL.split(' ')) SUFFIXES.add(l + '.in');
  for (const s of COUNTRY_MULTI.split(' ')) SUFFIXES.add(s);
  for (const s of HOSTING.split(' ')) {
    SUFFIXES.add(s);
    HOSTING_SET.add(s);
  }
}

export interface DomainParts {
  /** Public suffix, e.g. `co.in`, `com`, `web.app`. */
  suffix: string;
  /** Registrable domain (suffix plus one label), e.g. `sbi.co.in`. Equals the host for bare suffixes and IPs. */
  registrable: string;
  /** Labels in front of the registrable domain, e.g. `retail.` part, without the trailing dot. */
  subdomain: string;
  /** The label directly in front of the suffix, e.g. `sbi` in `sbi.co.in`. */
  label: string;
  /** Last label, e.g. `in`. */
  tld: string;
  /** The suffix is a free hosting platform. */
  hosting: boolean;
}

/** Split a lowercase host into its public suffix, registrable domain and subdomain. */
export function splitHost(host: string): DomainParts {
  init();
  const h = host.replace(/\.+$/, '');
  const labels = h.split('.');
  const tld = labels[labels.length - 1] ?? '';
  let suffixLen = 1;
  // Longest matching multi-label suffix wins (up to 3 labels: my.canva.site, s3.amazonaws.com).
  for (let n = Math.min(3, labels.length); n >= 2; n--) {
    const cand = labels.slice(labels.length - n).join('.');
    if (SUFFIXES.has(cand)) {
      suffixLen = n;
      break;
    }
  }
  const suffix = labels.slice(labels.length - suffixLen).join('.');
  if (labels.length <= suffixLen) {
    return { suffix, registrable: h, subdomain: '', label: labels[0] ?? '', tld, hosting: HOSTING_SET.has(suffix) };
  }
  const label = labels[labels.length - suffixLen - 1] ?? '';
  const registrable = label + '.' + suffix;
  const subdomain = labels.slice(0, labels.length - suffixLen - 1).join('.');
  return { suffix, registrable, subdomain, label, tld, hosting: HOSTING_SET.has(suffix) };
}

/** Registrable domain of a host (lowercased). */
export function registrableDomain(host: string): string {
  return splitHost(host.toLowerCase()).registrable;
}
