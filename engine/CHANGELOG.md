# Changelog

## 0.1.0 (2026-10-23)

First release (not published).

- `analyze()` for messages, links, UPI IDs, `upi://` links, phone numbers and emails, with
  English and Hindi verdicts, signals with spans, entity mini-verdicts and advice.
- 24 scam categories with rules in English, Hindi and Hinglish; reassuring signals for genuine
  OTP SMS, DLT sender headers, transaction alerts, official links and safety notices.
- URL analysis: brand registry, lookalike detection, public suffix subset, free hosting,
  shorteners, IPs, risky TLDs, APK downloads.
- UPI handle registry and `upi://` parsing; Indian phone kinds; amount extraction.
- `CATEGORIES` encyclopedia in English and Hindi.
- `normalizeIdentifier`, `identifierHash`, `hashPrefix`, `sha256Hex`, `sha256HexSync`.
- Additive type changes: optional `UrlFinding.impersonationKind`, `officialDomain`,
  `knownGood`, `download`; optional `Verdict.inputKind`.
