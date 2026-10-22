import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'critical' | 'accent' | 'quiet';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface StyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

const base =
  'relative inline-flex items-center justify-center gap-2 rounded-full font-semibold leading-tight select-none whitespace-nowrap ' +
  'transition-[transform,background-color,box-shadow,filter,border-color] duration-150 ease-out active:scale-[0.97] ' +
  'disabled:opacity-55 disabled:active:scale-100 aria-disabled:opacity-55';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-bg text-on-brand shadow-[0_1px_0_rgb(0_0_0/0.08),0_8px_20px_-10px_rgb(255_122_26/0.9)] hover:brightness-[1.06] hover:shadow-[0_1px_0_rgb(0_0_0/0.08),0_10px_24px_-10px_rgb(255_122_26/1)]',
  secondary: 'bg-surface text-fg border border-line-strong hover:bg-surface-2 hover:border-fg/40',
  ghost: 'text-fg hover:bg-surface-2',
  quiet: 'bg-surface-2 text-fg hover:bg-line',
  critical:
    'bg-critical-bg text-on-critical shadow-[0_8px_20px_-10px_rgb(159_18_57/0.9)] hover:brightness-110',
  accent: 'bg-accent-bg text-on-accent shadow-[0_8px_20px_-12px_rgb(79_70_229/0.9)] hover:brightness-110',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm [&_svg]:size-4',
  md: 'h-11 px-5 text-[0.95rem] [&_svg]:size-[1.15rem]',
  lg: 'h-13 px-6 text-base [&_svg]:size-5',
  xl: 'min-h-16 px-7 py-3 text-lg [&_svg]:size-6 whitespace-normal text-left',
};

export function buttonClass({ variant = 'secondary', size = 'md', block = false }: StyleProps = {}, extra?: string) {
  return cn(base, variants[variant], sizes[size], block && 'w-full', extra);
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & StyleProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, block, className, type = 'button', ...rest },
  ref,
) {
  return <button ref={ref} type={type} className={buttonClass({ variant, size, block }, className)} {...rest} />;
});

type AnchorProps = AnchorHTMLAttributes<HTMLAnchorElement> & StyleProps & { external?: boolean; newTabLabel?: string };

/** A link styled as a button. External links open in a new tab with a hidden hint for screen readers. */
export function ButtonLink({ variant, size, block, className, external, newTabLabel, children, ...rest }: AnchorProps) {
  const ext = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <a className={buttonClass({ variant, size, block }, className)} {...ext} {...rest}>
      {children}
      {external && newTabLabel ? <span className="sr-only"> {newTabLabel}</span> : null}
    </a>
  );
}

type RouterLinkProps = LinkProps & StyleProps & { children: ReactNode };

export function ButtonRouterLink({ variant, size, block, className, ...rest }: RouterLinkProps) {
  return <Link className={buttonClass({ variant, size, block }, className)} {...rest} />;
}
