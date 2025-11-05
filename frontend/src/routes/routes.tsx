import Home from '../pages/home/Home';
import Search from '../pages/search/Search';
import SmartSearch from '../pages/smart-search/SmartSearch';
import About from '../pages/about/About';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
import type { ReactElement } from 'react';
import AuthGuard from '../components/AuthGuard';
import MyLists from '../pages/MyLists';

type Route = {
  linkText: string;
  path: string;
  element: ReactElement;
  showInHeaderMode: 'show' | 'hide' | 'showIfAuthOnly' | 'showIfNotAuthOnly';
};

const routes: Array<Route> = [
  {
    linkText: 'Home',
    path: '/',
    element: <Home />,
    showInHeaderMode: 'show',
  },
  {
    linkText: 'Search',
    path: '/search',
    element: <Search />,
    showInHeaderMode: 'show',
  },
  {
    linkText: 'Smart Search',
    path: '/smart-search',
    element: <SmartSearch />,
    showInHeaderMode: 'show',
  },
  {
    linkText: 'About',
    path: '/about',
    element: <About />,
    showInHeaderMode: 'show',
  },
  {
    linkText: 'Login',
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
    linkText: 'Join us',
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
    linkText: 'My lists',
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
