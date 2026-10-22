import { AtSign, Globe, MessageCircle, MousePointerClick, PencilLine, Phone, QrCode, Smartphone, type LucideIcon } from 'lucide-react';
import type { AppKey } from '../shared/i18n/app';
import type { HistorySource } from '../shared/history';

export const SOURCE_META: Record<HistorySource, { label: AppKey; icon: LucideIcon }> = {
  whatsapp: { label: 'sourceWhatsapp', icon: MessageCircle },
  email: { label: 'sourceEmail', icon: AtSign },
  web: { label: 'sourceWeb', icon: Globe },
  manual: { label: 'sourceManual', icon: PencilLine },
  context: { label: 'sourceContext', icon: MousePointerClick },
  sms: { label: 'sourceSms', icon: Smartphone },
  qr: { label: 'sourceQr', icon: QrCode },
  call: { label: 'sourceCall', icon: Phone },
};

export const SAMPLES = {
  scam: {
    en: 'Dear customer, your SBI YONO account will be blocked today. Your KYC is pending. Update KYC and PAN now at http://sbi-kyc-update.top/login or call +91 98111 22233.',
    hi: 'प्रिय ग्राहक, आपका SBI खाता आज ब्लॉक हो जाएगा। आपका KYC पेंडिंग है। अभी KYC अपडेट करें http://sbi-kyc-update.top/login पर या +91 98111 22233 पर कॉल करें।',
  },
  safe: {
    en: 'Your OTP for the transaction of Rs 499.00 at AMAZON is 482913. Valid for 10 minutes. Do not share your OTP with anyone. - HDFC Bank',
    hi: 'AMAZON पर Rs 499.00 के लेनदेन के लिए आपका OTP 482913 है। यह 10 मिनट तक मान्य है। अपना OTP किसी के साथ साझा न करें। - HDFC Bank',
  },
} as const;
