import type { LucideIcon } from 'lucide-react';
import {
  BadgePercent,
  Bug,
  CardSim,
  ChartCandlestick,
  CircleQuestionMark,
  Fish,
  Gavel,
  Gift,
  HandCoins,
  Headset,
  HeartCrack,
  IdCard,
  KeyRound,
  Landmark,
  Package,
  QrCode,
  ReceiptIndianRupee,
  ReceiptText,
  ScanEye,
  ScreenShare,
  Undo2,
  VenetianMask,
  Webcam,
  BriefcaseBusiness,
  ZapOff,
} from 'lucide-react';
import type { ScamCategory } from '@ruko/engine';
import { cn } from '@/lib/cn';

export type ArtTone = 'saffron' | 'indigo' | 'rose' | 'emerald' | 'amber' | 'sky';

export const CATEGORY_ART: Record<ScamCategory, { Icon: LucideIcon; tone: ArtTone }> = {
  digital_arrest: { Icon: Gavel, tone: 'rose' },
  kyc_update: { Icon: IdCard, tone: 'saffron' },
  upi_collect: { Icon: HandCoins, tone: 'indigo' },
  qr_receive: { Icon: QrCode, tone: 'amber' },
  fake_refund: { Icon: Undo2, tone: 'sky' },
  job_task: { Icon: BriefcaseBusiness, tone: 'emerald' },
  investment: { Icon: ChartCandlestick, tone: 'indigo' },
  lottery_prize: { Icon: Gift, tone: 'amber' },
  loan_app: { Icon: ReceiptIndianRupee, tone: 'rose' },
  sextortion: { Icon: Webcam, tone: 'rose' },
  otp_theft: { Icon: KeyRound, tone: 'saffron' },
  fake_support: { Icon: Headset, tone: 'sky' },
  courier_parcel: { Icon: Package, tone: 'amber' },
  utility_disconnect: { Icon: ZapOff, tone: 'saffron' },
  reward_points: { Icon: BadgePercent, tone: 'emerald' },
  tax_refund: { Icon: ReceiptText, tone: 'indigo' },
  govt_scheme: { Icon: Landmark, tone: 'emerald' },
  malicious_app: { Icon: Bug, tone: 'rose' },
  remote_access: { Icon: ScreenShare, tone: 'sky' },
  impersonation: { Icon: VenetianMask, tone: 'indigo' },
  romance: { Icon: HeartCrack, tone: 'rose' },
  sim_swap: { Icon: CardSim, tone: 'amber' },
  phishing_link: { Icon: Fish, tone: 'sky' },
  lookalike_domain: { Icon: ScanEye, tone: 'saffron' },
  other: { Icon: CircleQuestionMark, tone: 'indigo' },
};

/** Static class lists per tone (Tailwind needs literal class names). */
const toneStyles: Record<ArtTone, { bg: string; blob: string; bar: string; icon: string }> = {
  saffron: { bg: 'bg-[#FFE9D6] dark:bg-[#33200f]', blob: 'bg-[#FF7A1A]', bar: 'bg-[#0B1020]', icon: 'text-[#B93D06] dark:text-[#FF9348]' },
  indigo: { bg: 'bg-[#E6E7FF] dark:bg-[#1b1f4a]', blob: 'bg-[#4F46E5]', bar: 'bg-[#0B1020]', icon: 'text-[#4338CA] dark:text-[#AAB6FF]' },
  rose: { bg: 'bg-[#FDE2E8] dark:bg-[#3a1322]', blob: 'bg-[#E11D48]', bar: 'bg-[#0B1020]', icon: 'text-[#BE123C] dark:text-[#FF8197]' },
  emerald: { bg: 'bg-[#DDF4EA] dark:bg-[#0f2c27]', blob: 'bg-[#10B981]', bar: 'bg-[#0B1020]', icon: 'text-[#046C4E] dark:text-[#3DDBA3]' },
  amber: { bg: 'bg-[#FCEFCF] dark:bg-[#30250f]', blob: 'bg-[#F59E0B]', bar: 'bg-[#0B1020]', icon: 'text-[#92400E] dark:text-[#FBC046]' },
  sky: { bg: 'bg-[#DDEFFC] dark:bg-[#0f2638]', blob: 'bg-[#0EA5E9]', bar: 'bg-[#0B1020]', icon: 'text-[#0369A1] dark:text-[#7DD3FC]' },
};

/**
 * A small composed illustration for each scam type: a tinted panel, a colour
 * blob, the brand's pause bars and the category icon on a paper disc.
 */
export function CategoryArt({ id, size = 'md', className }: { id: ScamCategory; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const art = CATEGORY_ART[id] ?? CATEGORY_ART.other;
  const s = toneStyles[art.tone];
  const Icon = art.Icon;
  const dims = size === 'lg' ? 'h-48 sm:h-56' : size === 'sm' ? 'h-24' : 'h-32';
  const disc = size === 'lg' ? 'size-24 sm:size-28 [&_svg]:size-11 sm:[&_svg]:size-14' : size === 'sm' ? 'size-12 [&_svg]:size-6' : 'size-16 [&_svg]:size-8';
  return (
    <div aria-hidden="true" className={cn('relative isolate overflow-hidden', dims, s.bg, className)}>
      <span className={cn('absolute -right-6 -bottom-10 size-32 rounded-full opacity-25', s.blob, size === 'lg' && 'size-56 -right-10 -bottom-20')} />
      <span className={cn('absolute -top-6 left-[18%] h-24 w-3 rotate-[24deg] rounded-full opacity-[0.08]', s.bar, size === 'lg' && 'h-40 w-5')} />
      <span className={cn('absolute -top-6 left-[calc(18%+1.4rem)] h-24 w-3 rotate-[24deg] rounded-full opacity-[0.08]', s.bar, size === 'lg' && 'left-[calc(18%+2.2rem)] h-40 w-5')} />
      <span className={cn('absolute top-3 right-4 size-2 rounded-full opacity-40', s.blob)} />
      <span className={cn('absolute bottom-4 left-5 size-1.5 rounded-full opacity-40', s.blob)} />
      <span className="absolute inset-0 grid place-items-center">
        <span className={cn('grid place-items-center rounded-full bg-paper shadow-[0_10px_30px_-12px_rgb(11_16_32/0.45)] dark:bg-ink', disc, s.icon)}>
          <Icon strokeWidth={1.9} />
        </span>
      </span>
    </div>
  );
}
