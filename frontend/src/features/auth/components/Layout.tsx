import type { PropsWithChildren } from 'react';

import Card from '../../../components/ui/Card';

type Props = Readonly<
  PropsWithChildren & {
    title: string;
  }
>;

export default function AuthLayout({ title, children }: Props) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <h1 className="text-text mb-6 text-center text-2xl font-bold">{title}</h1>
        {children}
      </Card>
    </div>
  );
}
