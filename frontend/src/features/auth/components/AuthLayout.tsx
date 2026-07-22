import type { PropsWithChildren } from 'react';

import AuthBenefits from './AuthBenefits';

type Props = Readonly<PropsWithChildren>;

export default function AuthLayout({ children }: Props) {
  return (
    <div className="mx-auto grid w-full max-w-7xl items-center gap-6 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-2">
      <div className="flex w-full justify-center lg:justify-center">{children}</div>
      <div className="flex w-full justify-center lg:justify-start">
        <AuthBenefits />
      </div>
    </div>
  );
}
