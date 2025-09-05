import type { ReactNode } from 'react';
import Header from './header/Header';
import Footer from './Footer';

type Props = {
  children: ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
