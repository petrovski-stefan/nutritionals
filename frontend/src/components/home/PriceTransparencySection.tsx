import { CheckIcon } from 'lucide-react';

import Section from '@/components/layout/Section';

import SectionCtaLink from './SectionCtaLink';

const BENEFITS = ['Повеќе транспарентност', 'Подобра информација', 'Поефикасно купување'] as const;

export default function PriceTransparencySection() {
  return (
    <Section center={true}>
      <div className="flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          Транспарентност на цените
        </p>

        <h2 className="text-text text-xl font-semibold sm:text-2xl">
          Не е секогаш јасно дали една промоција е навистина поволна
        </h2>

        <p className="text-text-muted text-base">
          Затоа ги следиме цените во сите поддржани аптеки. За секој производ ги прикажуваме сите
          понуди една до друга со цел за да видите дали најголемото намалување навистина значи и
          најниска цена.
        </p>

        <ul className="mt-2 flex flex-col gap-2 sm:flex-row sm:gap-6">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="text-text flex items-center justify-center gap-2 text-sm font-medium"
            >
              <CheckIcon
                aria-hidden="true"
                className="text-primary h-4 w-4 shrink-0"
              />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-2">
          <SectionCtaLink to="/compare">Спореди цени</SectionCtaLink>
        </div>
      </div>
    </Section>
  );
}
