import Home from '../pages/home/Home';
import Search from '../pages/search/Search';
import SmartSearch from '../pages/smart-search/SmartSearch';
import About from '../pages/about/About';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
import type { ReactElement } from 'react';
import AuthGuard from '../components/AuthGuard';
import MyLists from '../pages/mylists/MyLists';
import HowToUse from '../pages/how-to-use/HowToUse';

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
    element: <Search />,
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
