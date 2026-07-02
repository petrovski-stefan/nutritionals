import type { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <div className="mt-5 flex h-1/2 items-center justify-center">
      <div className="w-5/6 px-2 py-4 md:w-1/4">{children}</div>
    </div>
  );
}
