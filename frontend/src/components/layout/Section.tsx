import type { ReactNode } from 'react';

type Props = Readonly<{
  children: ReactNode;
  center?: boolean;
  title?: string;
}>;

export default function Section({ children, center = true, title }: Props) {
  return (
    <section
      className={`flex w-full flex-col px-4 py-8 sm:px-6 sm:py-12 ${center ? 'items-center' : 'items-stretch'}`}
    >
      {title && (
        <h2 className="text-text mb-6 text-center text-xl font-semibold sm:text-2xl">{title}</h2>
      )}
      {children}
    </section>
  );
}
