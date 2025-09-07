import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function Section({ children }: Props) {
  return <section className="mx-auto flex-col py-12 text-center">{children}</section>;
}
