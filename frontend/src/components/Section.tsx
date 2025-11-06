import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  center?: boolean;
};

export default function Section({ children, center = true }: Props) {
  return (
    <section className={`flex w-full flex-col py-12 ${center ? 'items-center' : 'items-stretch'}`}>
      {children}
    </section>
  );
}
