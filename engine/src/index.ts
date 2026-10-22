/**
 * @ruko/engine: on-device scam detection for India.
 *
 * Everything runs locally and synchronously (except hashing, which uses
 * WebCrypto). Zero runtime dependencies; works in browsers, Node 18+,
 * Web Workers and MV3 service workers.
 */
export * from './types';

export { ENGINE_VERSION } from './version';
export { analyze, detectInputKind } from './analyze';
export { severityFor } from './score';
export { extractEntities } from './entities';
export { analyzeUrl, parseUrl } from './entities/urls';
export { analyzeUpiId, parseUpiUri, upiHandleApp } from './entities/upi';
export { analyzePhone } from './entities/phones';
export { normalizeIdentifier, identifierHash, hashPrefix } from './hash';
export { sha256Hex, sha256HexSync } from './sha256';
export { CATEGORIES, CATEGORY_IDS, getCategory } from './categories';
export { HELPLINE_1930, CYBERCRIME_PORTAL, CHAKSHU_PORTAL } from './advice';
export { registrableDomain } from './domains/psl';
export { isOfficialHost, officialDomainsFor } from './official';
export { detectLanguage } from './language';
