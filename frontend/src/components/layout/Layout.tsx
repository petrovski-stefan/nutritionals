import { type ReactNode, useLayoutEffect } from 'react';
import { NavigationType, useLocation, useNavigationType } from 'react-router-dom';

import Header from '@/components/header/Header';

import Footer from './Footer';

type Props = Readonly<{
  children: ReactNode;
}>;

export default function Layout({ children }: Props) {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  // BrowserRouter has no ScrollRestoration, so a new page kept the old page's scroll position.
  // Back/forward (POP) is left to the browser, which restores where the user was
  useLayoutEffect(() => {
    if (navigationType !== NavigationType.Pop) window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return (
    <div className="bg-surface text-text flex min-h-dvh w-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
