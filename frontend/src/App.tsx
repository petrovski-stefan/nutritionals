import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';

import Layout from './components/layout/Layout';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import routes from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1 },
  },
});

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
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
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
