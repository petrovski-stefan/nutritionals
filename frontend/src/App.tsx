import { Route, Routes } from 'react-router-dom';

import Layout from './components/Layout';
import routes from './routes/routes';

function App() {
  return (
    <Layout>
      <Routes>
        {routes.map((route) => (
          <Route {...route}>{route.linkText}</Route>
        ))}
      </Routes>
    </Layout>
  );
}

export default App;
