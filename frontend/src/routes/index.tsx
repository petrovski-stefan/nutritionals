import type { ReactElement } from 'react';

import AuthGuard from '../features/auth/components/AuthGuard';
import About from '../pages/About';
import ComparePrices from '../pages/ComparePrices';
import Home from '../pages/Home';
import HowToUse from '../pages/HowToUse';
import Login from '../pages/Login';
import MyLists from '../pages/MyLists';
import Register from '../pages/Register';
import SmartSearch from '../pages/SmartSearch';

type Route = {
  linkText: string;
  path: string;
  element: ReactElement;
  showInHeaderMode: 'show' | 'hide' | 'showIfAuthOnly' | 'showIfNotAuthOnly';
};

const routes: Route[] = [
  {
    linkText: 'Почетна',
    path: '/',
    element: <Home />,
    showInHeaderMode: 'show',
  },
  {
    linkText: 'Спореди цени',
    path: '/compare',
    element: <ComparePrices />,
    showInHeaderMode: 'show',
  },
  {
    linkText: 'Паметно пребарување',
    path: '/smart-search',
    element: <SmartSearch />,
    showInHeaderMode: 'show',
  },
  {
    linkText: 'За нас',
    path: '/about',
    element: <About />,
    showInHeaderMode: 'hide',
  },

  {
    linkText: 'Упатство за користење',
    path: '/how-to-use',
    element: <HowToUse />,
    showInHeaderMode: 'hide',
  },
  {
    linkText: 'Најави се',
    path: '/login',
    element: (
      <AuthGuard
        mode="guestOnly"
        redirectTo="/"
      >
        <Login />
      </AuthGuard>
    ),
    showInHeaderMode: 'hide',
  },
  {
    linkText: 'Приклучи се',
    path: '/register',
    element: (
      <AuthGuard
        mode="guestOnly"
        redirectTo="/"
      >
        <Register />
      </AuthGuard>
    ),
    showInHeaderMode: 'showIfNotAuthOnly',
  },
  {
    linkText: 'Мои листи',
    path: '/my-lists',
    element: (
      <AuthGuard
        mode="private"
        redirectTo="/register"
      >
        <MyLists />
      </AuthGuard>
    ),
    showInHeaderMode: 'showIfAuthOnly',
  },
];

export default routes;
