import type { RuleModule } from './types';

/**
 * Lookalike domains are mostly detected from the links themselves (see
 * entities/urls.ts). This rule catches the message-level mismatch: the text
 * names a brand but the link goes to a domain that brand does not own.
 */
export const lookalikeDomain: RuleModule = {
  cues: {},
  rules: [
    {
      id: 'look.brand_link_mismatch', cat: 'lookalike_domain', w: 35, all: ['@brand_mismatch'],
      en: ["The link doesn't belong to the company named", 'The message talks about one company, but the link goes to a website that company does not own.'],
      hi: ['लिंक उस कंपनी का नहीं है जिसका नाम लिया गया', 'मैसेज में एक कंपनी का नाम है, पर लिंक ऐसी वेबसाइट का है जो उस कंपनी की नहीं है।'],
    },
  ],
};
