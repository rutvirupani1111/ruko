import { Link } from 'react-router';
import { common } from '@/i18n/common';
import { useT } from '@/i18n/core';
import { Mark } from './Mark';

export function Logo() {
  const t = useT(common);
  return (
    <Link to="/" className="group flex items-center gap-2.5 rounded-xl pr-1" aria-label={t.brand.homeLabel}>
      <Mark size={34} className="transition-transform duration-200 group-hover:-rotate-6 group-active:scale-95" />
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.45rem] font-extrabold tracking-tight text-fg">Ruko</span>
        <span lang="hi" className="font-deva text-[0.72rem] font-semibold text-subtle">
          रुको
        </span>
      </span>
    </Link>
  );
}
