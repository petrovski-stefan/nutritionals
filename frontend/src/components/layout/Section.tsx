import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  center?: boolean;
};

export default function Section({ children, center = true }: Props) {
  return (
    <section
      className={`flex w-full flex-col px-3 py-12 md:px-0 ${center ? 'items-center' : 'items-stretch'}`}
    >
      {children}
    </section>
  );
}
