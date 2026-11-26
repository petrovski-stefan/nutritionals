import { Route, Routes } from 'react-router-dom';

import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import QueryProvider from './context/QueryProvider';
import { ThemeProvider } from './context/ThemeContext';
import routes from './routes';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryProvider>
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
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
