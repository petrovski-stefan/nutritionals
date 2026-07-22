import type { LucideIcon } from 'lucide-react';
import { BellRing, ListChecks, ShieldCheck } from 'lucide-react';

import authIllustration from '@/assets/auth-illustration.webp';
import Badge from '@/components/ui/Badge';

type Benefit = {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
};

const benefits: Benefit[] = [
  {
    icon: ListChecks,
    title: 'Креирајте свои листи',
    description: 'Зачувајте ги суплементите што ги следите на едно место.',
  },
  {
    icon: ShieldCheck,
    title: 'Без е-пошта',
    description: 'Доволни се корисничко име и лозинка.',
  },
  {
    icon: BellRing,
    title: 'Известувања за попусти',
    description: 'Дознајте веднаш кога вашиот омилен суплемент ќе биде на попуст.',
    badge: 'Наскоро',
  },
];

export default function AuthBenefits() {
  return (
    <div className="w-full max-w-md p-4 sm:p-6">
      <img
        src={authIllustration}
        alt=""
        className="mx-auto mb-6 hidden max-h-72 w-auto object-contain lg:block"
      />
      <ul className="space-y-4">
        {benefits.map(({ icon: Icon, title, description, badge }) => (
          <li
            key={title}
            className="flex gap-3"
          >
            <Icon className="text-primary mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-text font-semibold">{title}</p>
                {badge ? <Badge>{badge}</Badge> : null}
              </div>
              <p className="text-text-muted text-sm">{description}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
