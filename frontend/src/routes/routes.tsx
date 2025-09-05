import Home from '../pages/Home';
import Search from '../pages/Search';
import SmartSearch from '../pages/SmartSearch';
import About from '../pages/About';

const routes = [
  { linkText: 'Home', path: '/', element: <Home />, showInMenu: true },
  { linkText: 'Search', path: '/search', element: <Search />, showInMenu: true },
  { linkText: 'Smart Search', path: '/smart-search', element: <SmartSearch />, showInMenu: true },
  { linkText: 'About', path: '/about', element: <About />, showInMenu: true },
];

export default routes;
