import { useId, type ReactNode } from 'react';

/** Accessible on/off switch with a visible label and optional hint. */
export function Toggle({
  checked,
  onChange,
  label,
  hint,
  disabled,
  testId,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: ReactNode;
  hint?: ReactNode;
  disabled?: boolean;
  testId?: string;
}) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <label htmlFor={id} className="block text-[15px] font-semibold leading-snug">
          {label}
        </label>
        {hint ? (
          <p id={`${id}-hint`} className="mt-0.5 text-[13px] leading-relaxed text-[var(--muted)]">
            {hint}
          </p>
        ) : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        disabled={disabled}
        data-testid={testId}
        onClick={() => onChange(!checked)}
        className={`relative mt-0.5 inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition-colors duration-150 disabled:opacity-50 ${
          checked ? 'border-saffron bg-saffron' : 'border-[var(--border)] bg-[var(--surface-2)]'
        }`}
      >
        <span
          aria-hidden="true"
          className={`inline-block h-5 w-5 rounded-full shadow transition-transform duration-150 ${
            checked ? 'translate-x-[22px] bg-ink' : 'translate-x-[3px] bg-white'
          }`}
        />
      </button>
    </div>
  );
}
