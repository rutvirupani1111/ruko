import { CircleCheck, Info, ShieldAlert, Siren, TriangleAlert } from 'lucide-react';
import type { Severity } from '@ruko/engine';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { cn } from '@/lib/cn';
import { severityTone } from './severity';

const icons = { safe: CircleCheck, low: Info, medium: TriangleAlert, high: ShieldAlert, critical: Siren } as const;

export function SeverityChip({ severity, size = 'md', className }: { severity: Severity; size?: 'sm' | 'md'; className?: string }) {
  const t = useT(common);
  const Icon = icons[severity];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-xs [&_svg]:size-3.5' : 'px-3 py-1 text-sm [&_svg]:size-4',
        severityTone[severity].chip,
        className,
      )}
      data-severity={severity}
    >
      <Icon aria-hidden="true" strokeWidth={2.4} />
      {t.severity[severity]}
    </span>
  );
}
