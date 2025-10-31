import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import routes from './routes/routes';
import { AuthProvider } from './context/AuthContext';

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
