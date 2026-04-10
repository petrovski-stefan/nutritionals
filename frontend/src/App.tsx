import { Route, Routes } from 'react-router-dom';

import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import routes from './routes';

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          {routes.map(({ linkText, path, element }) => (
            <Route
              key={linkText}
              path={path}
              element={element}
            />
          ))}
        </Routes>
      </Layout>
    </AuthProvider>
  );
}

export default App;
