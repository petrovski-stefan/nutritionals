import Home from '../pages/home/Home';
import Search from '../pages/search/Search';
import SmartSearch from '../pages/smart-search/SmartSearch';
import About from '../pages/About';
import Login from '../pages/login/Login';
import Register from '../pages/register/Register';
import type { ReactElement } from 'react';
import AuthGuard from '../components/AuthGuard';

type Route = {
  linkText: string;
  path: string;
  element: ReactElement;
  showInHeader: boolean;
};

const routes: Array<Route> = [
  {
    linkText: 'Home',
    path: '/',
    element: <Home />,
    showInHeader: true,
  },
  {
    linkText: 'Search',
    path: '/search',
    element: <Search />,
    showInHeader: true,
  },
  {
    linkText: 'Smart Search',
    path: '/smart-search',
    element: <SmartSearch />,
    showInHeader: true,
  },
  {
    linkText: 'About',
    path: '/about',
    element: <About />,
    showInHeader: true,
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
    showInHeader: false,
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
    showInHeader: true,
  },
];

export default routes;
