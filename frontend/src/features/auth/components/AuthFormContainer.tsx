import type { PropsWithChildren } from 'react';

import Card from '@/components/ui/Card';

type Props = Readonly<
  PropsWithChildren & {
    title: string;
  }
>;

export default function AuthFormContainer({ title, children }: Props) {
  return (
    <Card className="w-full max-w-lg p-6 sm:p-8">
      <h1 className="text-text mb-6 text-center text-2xl font-bold">{title}</h1>
      {children}
    </Card>
  );
}
