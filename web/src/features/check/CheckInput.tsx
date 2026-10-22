import { useId, useRef, useState, type ClipboardEvent, type DragEvent, type Ref } from 'react';
import { ChevronRight, ClipboardPaste, ImageUp, LoaderCircle, ScanQrCode, ShieldCheck, X } from 'lucide-react';
import type { Source } from '@ruko/engine';
import { Button } from '@/components/ui/Button';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { MAX_ANALYSED_CHARS } from './useAnalysis';
import { checkStrings } from './strings';

export interface OcrState {
  active: boolean;
  stage: 'preparing' | 'reading';
  progress: number;
}

interface CheckInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onPasteClick: () => void;
  onScanQr: () => void;
  onImage: (file: File) => void;
  onCancelOcr: () => void;
  ocr: OcrState | null;
  message: { text: string; tone: 'info' | 'error' } | null;
  source: Source;
  onSourceChange: (s: Source) => void;
  sender: string;
  onSenderChange: (s: string) => void;
  textareaRef?: Ref<HTMLTextAreaElement>;
}

const SOURCES: Source[] = ['manual', 'whatsapp', 'sms', 'email', 'call', 'web', 'qr'];

export function CheckInput(props: CheckInputProps) {
  const t = useT(checkStrings);
  const id = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const { value, ocr } = props;

  const onPaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith('image/'));
    if (file) {
      e.preventDefault();
      props.onImage(file);
    }
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = Array.from(e.dataTransfer?.files ?? []).find((f) => f.type.startsWith('image/'));
    if (file) props.onImage(file);
    else {
      const text = e.dataTransfer?.getData('text/plain');
      if (text) props.onChange(text);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-[1.6rem] border bg-surface shadow-card transition-[border-color,box-shadow] duration-200 focus-within:border-brand-bg focus-within:shadow-[0_0_0_4px_rgb(255_122_26/0.18)]',
        dragging ? 'border-brand-bg border-dashed' : 'border-line-strong/70',
      )}
      onDragOver={(e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <label htmlFor={`${id}-input`} className="flex items-center justify-between gap-3 px-5 pt-4 text-sm font-semibold text-fg">
        {t.input.label}
        <span className="inline-flex items-center gap-1 text-xs font-medium text-safe">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          <span className="hidden min-[400px]:inline">{t.input.hint}</span>
        </span>
      </label>
      <textarea
        id={`${id}-input`}
        ref={props.textareaRef}
        value={value}
        onChange={(e) => props.onChange(e.target.value)}
        onPaste={onPaste}
        placeholder={t.input.placeholder}
        rows={5}
        spellCheck={false}
        autoCapitalize="off"
        autoComplete="off"
        aria-describedby={`${id}-hint`}
        className="block max-h-[50dvh] min-h-36 w-full resize-none bg-transparent px-5 pt-2 pb-3 text-[1.06rem] leading-relaxed text-fg outline-none [field-sizing:content] placeholder:text-subtle"
        data-testid="check-input"
      />
      <p id={`${id}-hint`} className="sr-only">
        {t.input.hint}
      </p>
      {value ? (
        <div className="flex justify-end px-3 pb-2">
          <Button variant="ghost" size="sm" onClick={props.onClear} data-testid="clear-input">
            <X aria-hidden="true" />
            {t.input.clear}
          </Button>
        </div>
      ) : null}

      {dragging ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-[1.6rem] bg-brand-tint/90 text-center font-semibold text-fg">
          {t.input.dropHere}
        </div>
      ) : null}

      {ocr?.active ? (
        <div className="mx-5 mb-3 rounded-2xl bg-surface-2 p-3" role="status">
          <div className="flex items-center gap-2 text-sm font-medium">
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin text-brand" />
            <span className="flex-1">{ocr.stage === 'reading' ? t.ocr.reading : t.ocr.preparing}</span>
            <button type="button" onClick={props.onCancelOcr} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
              {t.ocr.cancel}
            </button>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            {ocr.stage === 'reading' ? (
              <div className="h-full rounded-full bg-brand-bg transition-[width] duration-200" style={{ width: `${Math.round(ocr.progress * 100)}%` }} />
            ) : (
              <div className="progress-indeterminate h-full w-full" />
            )}
          </div>
          {ocr.stage === 'preparing' ? <p className="mt-2 text-xs leading-relaxed text-muted">{t.ocr.firstTime}</p> : null}
        </div>
      ) : null}

      {props.message ? (
        <p
          role={props.message.tone === 'error' ? 'alert' : 'status'}
          className={cn('mx-5 mb-3 text-sm leading-relaxed', props.message.tone === 'error' ? 'text-danger' : 'text-muted')}
        >
          {props.message.text}
        </p>
      ) : null}

      {value.length > MAX_ANALYSED_CHARS ? <p className="mx-5 mb-3 text-xs text-caution">{t.input.truncated}</p> : null}

      <div className="grid grid-cols-3 gap-2 border-t border-line px-3 py-3 sm:flex sm:flex-wrap sm:px-4">
        {[
          { label: t.input.paste, Icon: ClipboardPaste, onClick: props.onPasteClick, disabled: false },
          { label: t.input.scanQr, Icon: ScanQrCode, onClick: props.onScanQr, disabled: false },
          { label: t.input.screenshot, Icon: ImageUp, onClick: () => fileRef.current?.click(), disabled: !!ocr?.active },
        ].map(({ label, Icon, onClick, disabled }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-2xl bg-surface-2 px-2 text-[0.8rem] leading-tight font-semibold text-fg transition-[background-color,transform] duration-150 hover:bg-line active:scale-[0.97] disabled:opacity-55 sm:h-10 sm:flex-row sm:gap-2 sm:rounded-full sm:px-4 sm:text-sm"
          >
            <Icon aria-hidden="true" className="size-5 sm:size-4" />
            <span className="text-center">{label}</span>
          </button>
        ))}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) props.onImage(file);
            e.target.value = '';
          }}
          data-testid="screenshot-input"
        />
      </div>

      <details className="group border-t border-line">
        <summary className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-muted hover:text-fg">
          <ChevronRight aria-hidden="true" className="size-4 text-brand transition-transform duration-200 group-open:rotate-90" />
          {t.details.toggle}
        </summary>
        <div className="space-y-4 px-5 pb-5">
          <fieldset>
            <legend className="mb-2 text-sm font-semibold text-fg">{t.details.source}</legend>
            <div className="flex flex-wrap gap-2">
              {SOURCES.map((s) => (
                <label
                  key={s}
                  className={cn(
                    'cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--focus)]',
                    props.source === s ? 'border-fg bg-fg text-bg' : 'border-line-strong text-fg hover:bg-surface-2',
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-source`}
                    value={s}
                    checked={props.source === s}
                    onChange={() => props.onSourceChange(s)}
                    className="sr-only"
                  />
                  {t.details.sources[s]}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor={`${id}-sender`} className="mb-1 block text-sm font-semibold text-fg">
              {t.details.sender}
            </label>
            <input
              id={`${id}-sender`}
              value={props.sender}
              onChange={(e) => props.onSenderChange(e.target.value)}
              placeholder="VM-HDFCBK"
              autoComplete="off"
              aria-describedby={`${id}-sender-hint`}
              className="h-11 w-full rounded-xl border border-line-strong bg-field px-3 text-fg outline-none focus:border-brand-bg"
            />
            <p id={`${id}-sender-hint`} className="mt-1 text-xs text-subtle">
              {t.details.senderHint}
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}
