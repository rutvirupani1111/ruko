import type { ReactNode } from 'react';
import {
  Archive,
  ArrowLeft,
  BatteryFull,
  Camera,
  CheckCheck,
  CircleCheck,
  CircleQuestionMark,
  EllipsisVertical,
  FaceSlightlySmiling,
  FileText,
  Forward,
  Grid3x3,
  Mail,
  Mic,
  MicOff,
  Paperclip,
  Phone,
  PhoneOff,
  Reply,
  SendHorizontal,
  Signal,
  Timer,
  Trash,
  UserRound,
  Users,
  Video,
  Volume2,
  Wifi,
} from 'lucide-react';
import { formatInr, useLocale } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { FlagText, type NumberedFlag } from './FlagText';
import type { Scenario, ScenarioContent } from './scenarios';
import type { simStrings } from './strings';

type PhoneStrings = (typeof simStrings)['en']['phone'];

export interface MockProps {
  scenario: Scenario;
  content: ScenarioContent;
  flags: NumberedFlag[];
  revealed: boolean;
  t: PhoneStrings;
}

function split(flags: NumberedFlag[]) {
  return {
    sender: flags.filter((f) => f.flag.on === 'sender'),
    content: flags.filter((f) => !f.flag.on || f.flag.on === 'content'),
    pay: flags.filter((f) => f.flag.on === 'pay'),
  };
}

function initials(name: string) {
  const letters = name
    .replace(/[^\p{L}\s]/gu, ' ')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  return letters.toUpperCase();
}

/** Device chrome: rounded frame, camera island and a status bar. */
function PhoneFrame({ children, time, statusClass, label }: { children: ReactNode; time: string; statusClass: string; label: string }) {
  return (
    <figure className="phone mx-auto w-full max-w-[22.5rem]" aria-label={label}>
      <div className="relative rounded-[2.9rem] bg-[var(--frame)] p-[0.55rem] shadow-[0_34px_70px_-34px_rgb(11_16_32/0.6)]">
        <span aria-hidden="true" className="absolute top-24 -left-[3px] h-12 w-[3px] rounded-l bg-[var(--frame)]" />
        <span aria-hidden="true" className="absolute top-40 -left-[3px] h-12 w-[3px] rounded-l bg-[var(--frame)]" />
        <span aria-hidden="true" className="absolute top-32 -right-[3px] h-16 w-[3px] rounded-r bg-[var(--frame)]" />
        <div className="phone-screen relative flex min-h-[34rem] flex-col overflow-hidden rounded-[2.4rem] text-[0.95rem] leading-snug">
          <div aria-hidden="true" className={cn('relative flex h-10 shrink-0 items-center justify-between px-7 text-[0.78rem] font-semibold', statusClass)}>
            <span className="num">{time}</span>
            <span className="absolute top-2.5 left-1/2 h-[1.35rem] w-[5.6rem] -translate-x-1/2 rounded-full bg-black" />
            <span className="flex items-center gap-1 [&_svg]:size-3.5">
              <Signal strokeWidth={2.6} />
              <Wifi strokeWidth={2.6} />
              <BatteryFull strokeWidth={2.2} />
            </span>
          </div>
          {children}
        </div>
      </div>
    </figure>
  );
}

const fakeControl = 'pointer-events-none select-none';

export function WhatsAppMock({ scenario: s, content: c, flags, revealed, t }: MockProps) {
  const f = split(flags);
  const tone = s.isScam ? 'danger' : 'safe';
  const name = c.senderName ?? s.sender.display;
  const unknown = !s.sender.contact && !s.sender.group;
  return (
    <PhoneFrame time={s.time} statusClass="bg-[var(--top)] text-[var(--top-fg)]" label={t.mockLabel(t.channels.whatsapp)}>
      <div className="mock-wa flex flex-1 flex-col bg-[var(--chat)]">
        <div className="flex shrink-0 items-center gap-2 bg-[var(--top)] px-2.5 pb-2.5 text-[var(--top-fg)]">
          <ArrowLeft aria-hidden="true" className="size-5 shrink-0" />
          <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-full bg-white/25 text-sm font-bold">
            {s.sender.group ? <Users className="size-5" /> : unknown ? <UserRound className="size-5" /> : initials(name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">
              <FlagText text={name} flags={f.sender} revealed={revealed} tone={tone} />
            </p>
            <p className="truncate text-[0.72rem] text-[var(--top-sub)]">{c.senderSub ?? (s.sender.contact ? t.online : unknown ? t.notContact : '')}</p>
          </div>
          <span aria-hidden="true" className="flex items-center gap-3.5 pr-1 [&_svg]:size-5">
            <Video />
            <Phone />
            <EllipsisVertical />
          </span>
        </div>

        <div className="wa-wallpaper flex flex-1 flex-col gap-1.5 px-3 py-3">
          <span className="mx-auto mb-1 rounded-lg bg-[var(--in)] px-2.5 py-1 text-[0.72rem] font-medium text-[var(--meta)] shadow-sm">{t.today}</span>
          {unknown ? (
            <div className="mx-auto mb-2 w-[88%] rounded-xl bg-[var(--sys)] px-3 py-2.5 text-center text-[0.8rem] text-[var(--sys-fg)] shadow-sm">
              {s.sender.profile ? <p className="font-semibold">~{s.sender.profile}</p> : null}
              <p className="num">{s.sender.display}</p>
              <p className="mt-0.5">{t.notContact}</p>
              <div className={cn('mt-2 grid grid-cols-2 gap-2 text-[0.78rem] font-semibold', fakeControl)} aria-hidden="true">
                <span className="rounded-full border border-current/30 py-1">{t.block}</span>
                <span className="rounded-full border border-current/30 py-1">{t.add}</span>
              </div>
            </div>
          ) : null}

          {(c.messages ?? []).map((m, i) => (
            <div key={i} className="bubble bubble-tail relative mr-10 max-w-[86%] self-start rounded-lg rounded-tl-none bg-[var(--in)] px-2.5 pt-1.5 pb-1 text-[var(--in-fg)] shadow-[0_1px_0.5px_rgb(11_16_32/0.13)]">
              {m.type === 'text' && m.author ? <p className="text-[0.78rem] font-semibold text-[var(--author)]">{m.author}</p> : null}
              {m.type === 'text' ? (
                <p className="break-words whitespace-pre-wrap">
                  <FlagText text={m.text} flags={f.content} revealed={revealed} tone={tone} />
                </p>
              ) : m.type === 'receipt' ? (
                <div className="my-1 w-52 overflow-hidden rounded-md border border-black/10 bg-white text-[#111b21]">
                  <div className="flex items-center gap-2 bg-[#e7f8ef] px-3 py-2">
                    <CircleCheck aria-hidden="true" className="size-5 text-[#0f9d58]" />
                    <span className="text-sm font-semibold">
                      <FlagText text={m.title} flags={f.content} revealed={revealed} tone={tone} />
                    </span>
                  </div>
                  <div className="px-3 py-2.5">
                    <p className="num text-2xl font-bold">{m.amount}</p>
                    <p className="mt-0.5 text-[0.72rem] text-[#667781]">{t.receipt} · Ref 6283 1049 7712</p>
                  </div>
                </div>
              ) : (
                <div className="my-1 flex w-56 items-center gap-2.5 rounded-md bg-black/5 px-2.5 py-2 dark:bg-white/5">
                  <span className="grid size-10 shrink-0 place-items-center rounded bg-[#e11d48] text-[0.62rem] font-bold text-white">APK</span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      <FlagText text={m.name} flags={f.content} revealed={revealed} tone={tone} />
                    </span>
                    <span className="block text-[0.72rem] text-[var(--meta)]">
                      {t.file} · {m.size}
                    </span>
                  </span>
                  <FileText aria-hidden="true" className="ml-auto size-4 shrink-0 text-[var(--meta)]" />
                </div>
              )}
              <p className="num mt-0.5 text-right text-[0.66rem] text-[var(--meta)]">{s.time}</p>
            </div>
          ))}
        </div>

        <div aria-hidden="true" className={cn('flex shrink-0 items-center gap-2 bg-[var(--bar)] px-2 py-2', fakeControl)}>
          <div className="flex h-10 flex-1 items-center gap-2.5 rounded-full bg-[var(--field)] px-3 text-[var(--meta)] [&_svg]:size-5">
            <FaceSlightlySmiling />
            <span className="flex-1 text-sm">{t.message}</span>
            <Paperclip />
            <Camera />
          </div>
          <span className="grid size-10 place-items-center rounded-full bg-[var(--send)] text-white">
            <Mic className="size-5" />
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function SmsMock({ scenario: s, content: c, flags, revealed, t }: MockProps) {
  const f = split(flags);
  const tone = s.isScam ? 'danger' : 'safe';
  const name = c.senderName ?? s.sender.display;
  const isHeader = /^[A-Z]{2}-[A-Z0-9]{3,9}$/.test(s.sender.display);
  return (
    <PhoneFrame time={s.time} statusClass="bg-[var(--top)] text-[var(--top-fg)]" label={t.mockLabel(t.channels.sms)}>
      <div className="mock-sms flex flex-1 flex-col bg-[var(--chat)] text-[var(--in-fg)]">
        <div className="flex shrink-0 items-center gap-3 border-b border-black/5 bg-[var(--top)] px-3 pb-3 text-[var(--top-fg)] dark:border-white/5">
          <ArrowLeft aria-hidden="true" className="size-5 shrink-0" />
          <span aria-hidden="true" className={cn('grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold text-white', isHeader ? 'bg-[#1a73e8]' : 'bg-[#7c4dff]')}>
            {isHeader ? name.slice(3, 4) : <UserRound className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="num truncate font-semibold">
              <FlagText text={name} flags={f.sender} revealed={revealed} tone={tone} />
            </p>
            {isHeader ? <p className="text-[0.72rem] text-[var(--top-sub)]">{t.business}</p> : null}
          </div>
          <span aria-hidden="true" className="flex items-center gap-4 [&_svg]:size-5">
            <Phone />
            <EllipsisVertical />
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2 px-3 py-4">
          <span className="mx-auto mb-2 text-[0.72rem] font-medium text-[var(--meta)]">
            {t.today} · <span className="num">{s.time}</span>
          </span>
          {(c.messages ?? []).map((m, i) =>
            m.type === 'text' ? (
              <div key={i} className="bubble max-w-[86%] self-start rounded-[1.3rem] rounded-bl-md bg-[var(--in)] px-3.5 py-2.5">
                <p className="break-words whitespace-pre-wrap">
                  <FlagText text={m.text} flags={f.content} revealed={revealed} tone={tone} />
                </p>
              </div>
            ) : null,
          )}
        </div>
        <div aria-hidden="true" className={cn('flex shrink-0 items-center gap-2 px-3 py-2.5', fakeControl)}>
          <div className="flex h-11 flex-1 items-center gap-3 rounded-full bg-[var(--field)] px-4 text-sm text-[var(--meta)]">
            <span className="flex-1">{t.textMessage}</span>
          </div>
          <SendHorizontal className="size-5 text-[var(--send)]" />
        </div>
      </div>
    </PhoneFrame>
  );
}

export function EmailMock({ scenario: s, content: c, flags, revealed, t }: MockProps) {
  const f = split(flags);
  const tone = s.isScam ? 'danger' : 'safe';
  const name = c.senderName ?? s.sender.display;
  return (
    <PhoneFrame time={s.time} statusClass="bg-[var(--top)] text-[var(--top-fg)]" label={t.mockLabel(t.channels.email)}>
      <div className="mock-mail flex flex-1 flex-col bg-[var(--chat)] text-[var(--top-fg)]">
        <div aria-hidden="true" className="flex shrink-0 items-center gap-5 px-4 pb-2 text-[var(--top-sub)] [&_svg]:size-5">
          <ArrowLeft />
          <span className="ml-auto" />
          <Archive />
          <Trash />
          <Mail />
          <EllipsisVertical />
        </div>
        <div className="flex-1 px-4 pb-5">
          <h3 className="mt-2 text-[1.15rem] leading-snug">
            <FlagText text={c.subject ?? ''} flags={f.content} revealed={revealed} tone={tone} />{' '}
            <span className="ml-1 inline-block rounded bg-[var(--chip)] px-1.5 py-0.5 align-middle text-[0.68rem] text-[var(--top-sub)]">{t.inbox}</span>
          </h3>
          <div className="mt-4 flex items-start gap-3">
            <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-[#c2410c] font-bold text-white">
              {initials(name).slice(0, 1) || 'M'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-baseline gap-2">
                <span className="truncate font-semibold">{name}</span>
                <span className="num shrink-0 text-[0.72rem] text-[var(--meta)]">{s.time}</span>
              </p>
              <p className="truncate text-[0.78rem] text-[var(--meta)]">
                <FlagText text={s.sender.email ?? ''} flags={f.sender} revealed={revealed} tone={tone} />
              </p>
              <p className="text-[0.72rem] text-[var(--meta)]">{t.toMe}</p>
            </div>
          </div>
          <div className="mt-4 space-y-3 text-[0.93rem] leading-relaxed">
            {(c.body ?? []).map((p, i) => (
              <p key={i} className="break-words">
                <FlagText text={p} flags={f.content} revealed={revealed} tone={tone} />
              </p>
            ))}
          </div>
          {c.cta ? (
            <span aria-hidden="true" className={cn('mt-5 inline-block rounded-full bg-[var(--cta)] px-5 py-2.5 text-sm font-semibold text-[var(--cta-fg)]', fakeControl)}>
              {c.cta}
            </span>
          ) : null}
          <div aria-hidden="true" className={cn('mt-6 flex gap-2 border-t border-[var(--line)] pt-4', fakeControl)}>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm">
              <Reply className="size-4" />
              {t.reply}
            </span>
            <span className="flex items-center gap-1.5 rounded-full border border-[var(--line)] px-4 py-2 text-sm">
              <Forward className="size-4" />
              {t.forward}
            </span>
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function CallMock({ scenario: s, content: c, flags, revealed, t }: MockProps) {
  const f = split(flags);
  const tone = s.isScam ? 'danger' : 'safe';
  return (
    <PhoneFrame time={s.time} statusClass="bg-[#172036] text-white" label={t.mockLabel(t.channels.call)}>
      <div className="mock-call flex flex-1 flex-col text-[var(--top-fg)]" style={{ background: 'var(--chat)' }}>
        <div className="flex flex-col items-center px-5 pt-4 pb-3 text-center">
          <span aria-hidden="true" className="grid size-16 place-items-center rounded-full bg-white/10">
            <UserRound className="size-8" />
          </span>
          <p className="num mt-3 text-[1.35rem] font-semibold tracking-wide">
            <FlagText text={c.senderName ?? s.sender.display} flags={f.sender} revealed={revealed} tone={tone} />
          </p>
          {c.senderSub ? <p className="num mt-0.5 text-[0.8rem] text-[var(--top-sub)]">{c.senderSub}</p> : null}
        </div>
        <p className="px-4 text-[0.68rem] font-semibold tracking-[0.14em] text-[var(--meta)] uppercase">{t.transcript}</p>
        <div className="flex flex-1 flex-col gap-2 px-3 pt-2 pb-4">
          {(c.lines ?? []).map((line, i) => (
            <div
              key={i}
              className={cn(
                'bubble relative max-w-[86%] rounded-2xl px-3 py-2',
                line.who === 'caller' ? 'self-start rounded-tl-sm bg-[var(--in)] text-[var(--in-fg)]' : 'self-end rounded-tr-sm bg-[var(--out)] text-[var(--out-fg)]',
              )}
            >
              <p className="mb-0.5 text-[0.66rem] font-bold tracking-wide uppercase opacity-70">{line.who === 'caller' ? t.caller : t.you}</p>
              <p className="break-words">
                <FlagText text={line.text} flags={f.content} revealed={revealed} tone={tone} />
              </p>
            </div>
          ))}
        </div>
        <div aria-hidden="true" className={cn('grid shrink-0 grid-cols-4 gap-2 px-5 pt-2 pb-6 text-center text-[0.66rem] text-[var(--meta)]', fakeControl)}>
          {[
            { Icon: MicOff, label: t.mute },
            { Icon: Grid3x3, label: t.keypad },
            { Icon: Volume2, label: t.speaker },
          ].map(({ Icon, label }) => (
            <span key={label} className="flex flex-col items-center gap-1">
              <span className="grid size-12 place-items-center rounded-full bg-white/10 text-white">
                <Icon className="size-5" />
              </span>
              {label}
            </span>
          ))}
          <span className="flex flex-col items-center gap-1">
            <span className="grid size-12 place-items-center rounded-full bg-[#e11d48] text-white">
              <PhoneOff className="size-5" />
            </span>
            {t.endCall}
          </span>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function PaymentMock({ scenario: s, content: c, flags, revealed, t }: MockProps) {
  const f = split(flags);
  const { locale } = useLocale();
  const tone = s.isScam ? 'danger' : 'safe';
  const payFlag = revealed ? f.pay[0] : undefined;
  return (
    <PhoneFrame time={s.time} statusClass="bg-[var(--top)] text-[var(--top-fg)]" label={t.mockLabel(t.channels.payment)}>
      <div className="mock-pay flex flex-1 flex-col bg-[var(--chat)] text-[var(--card-fg)]">
        <div className="flex shrink-0 items-center gap-3 bg-[var(--top)] px-4 pb-4 text-[var(--top-fg)]">
          <ArrowLeft aria-hidden="true" className="size-5" />
          <p className="flex-1 font-semibold">{t.paymentRequest}</p>
          <CircleQuestionMark aria-hidden="true" className="size-5 opacity-80" />
        </div>
        <div className="flex flex-1 flex-col px-4 py-5">
          <div className="rounded-2xl bg-[var(--card)] p-5 text-center shadow-[0_10px_30px_-18px_rgb(30_10_60/0.5)]">
            <span aria-hidden="true" className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--note)] text-lg font-bold text-[var(--accent)]">
              {initials(s.sender.display).slice(0, 2)}
            </span>
            <p className="mt-3 text-[0.72rem] tracking-wide text-[var(--meta)] uppercase">{t.requestFrom}</p>
            <p className="mt-0.5 text-[1.08rem] font-semibold">
              <FlagText text={s.sender.display} flags={f.sender} revealed={revealed} tone={tone} />
            </p>
            <p className="text-[0.82rem] text-[var(--meta)]">
              <FlagText text={s.sender.vpa ?? ''} flags={f.sender} revealed={revealed} tone={tone} />
            </p>
            {s.sender.contact ? (
              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-[var(--note)] px-2.5 py-0.5 text-[0.72rem] font-semibold text-[var(--accent)]">
                <CheckCheck aria-hidden="true" className="size-3.5" />
                {t.inContacts}
              </p>
            ) : null}
            <p className="mt-4 text-[0.72rem] tracking-wide text-[var(--meta)] uppercase">{t.requested}</p>
            <p className="num font-display text-[2.4rem] leading-tight font-extrabold">{formatInr(s.amount ?? 0, locale)}</p>
            <p className="mx-auto mt-3 max-w-[16rem] rounded-xl bg-[var(--note)] px-3 py-2 text-[0.9rem] leading-snug">
              “<FlagText text={c.note ?? ''} flags={f.content} revealed={revealed} tone={tone} />”
            </p>
            <p className="mt-3 flex items-center justify-center gap-1 text-[0.72rem] text-[var(--meta)]">
              <Timer aria-hidden="true" className="size-3.5" />
              {t.expires}
            </p>
          </div>
          <div aria-hidden="true" className={cn('mt-auto grid grid-cols-2 gap-3 pt-6', fakeControl)}>
            <span className="grid h-12 place-items-center rounded-xl border-2 border-[var(--accent)] font-semibold text-[var(--accent)]">{t.decline}</span>
            <span
              className={cn(
                'relative grid h-12 place-items-center rounded-xl bg-[var(--accent)] font-semibold text-[var(--accent-fg)]',
                payFlag && (tone === 'danger' ? 'ring-4 ring-[#e11d48] ring-offset-2 ring-offset-[var(--chat)]' : 'ring-4 ring-[#10b981] ring-offset-2 ring-offset-[var(--chat)]'),
              )}
            >
              {t.pay}
              {payFlag ? (
                <span className={cn('flag-n pop-in absolute -top-2.5 -right-2.5 text-base', tone === 'safe' && 'flag-n-safe')}>{payFlag.n}</span>
              ) : null}
            </span>
          </div>
          <p aria-hidden="true" className="mt-4 text-center text-[0.68rem] font-semibold tracking-[0.2em] text-[var(--meta)]">
            PAYAPP · UPI
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}

export function PhoneMock(props: MockProps) {
  switch (props.scenario.channel) {
    case 'whatsapp':
      return <WhatsAppMock {...props} />;
    case 'sms':
      return <SmsMock {...props} />;
    case 'email':
      return <EmailMock {...props} />;
    case 'call':
      return <CallMock {...props} />;
    case 'payment':
      return <PaymentMock {...props} />;
  }
}
