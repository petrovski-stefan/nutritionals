import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../../types/user';
import { UserService } from '../../api/user';
import { useAuthContext } from '../../context/AuthContext';
import LOGIN_TEXT from '../../locale/login';

const defaultCredentials = {
  username: '',
  password: '',
};

type Error = keyof (typeof LOGIN_TEXT)['errors'];

export default function Login() {
  const [credentials, setCredentials] = useState<LoginCredentials>(defaultCredentials);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);

  const { login } = useAuthContext();

  const navigate = useNavigate();

  const handleCredentialsOnChange = (key: keyof LoginCredentials, value: string) => {
    setError(null);
    setCredentials({ ...credentials, [key]: value });
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setError(null);
    setIsLoading(true);

    if (Object.values(credentials).filter((value) => value === '').length > 0) {
      setError('requiredFieldsEmptyError');
      setIsLoading(false);
      return;
    }

    try {
      const response = await UserService.login(credentials);

      if (response.status) {
        login(credentials.username, response.data.access);
        navigate('/');
      } else {
        setError(response.errors_type as Error);
      }
    } catch (error) {
      setError('unexpectedError');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-5 flex h-1/2 items-center justify-center">
      <div className="w-1/4 px-2 py-4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-center text-red-700">
            {LOGIN_TEXT['errors'][error]}
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="space-y-5"
        >
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">{LOGIN_TEXT['form']['username']}</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => handleCredentialsOnChange('username', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder={LOGIN_TEXT['form']['usernamePlaceholder']}
            />
          </div>

          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">{LOGIN_TEXT['form']['password']}</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleCredentialsOnChange('password', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder={LOGIN_TEXT['form']['passwordPlaceholder']}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 w-full rounded-2xl py-3 font-bold text-white transition disabled:opacity-70"
          >
            {isLoading
              ? LOGIN_TEXT['form']['loginButtonLoading']
              : LOGIN_TEXT['form']['loginButton']}
          </button>
        </form>
        <p className="text-dark/70 mt-6 text-center text-sm">
          {LOGIN_TEXT['noAccount']}
          <Link
            to="/register"
            className="text-accent font-medium hover:underline"
          >
            {LOGIN_TEXT['registerLink']}
          </Link>
        </p>
      </div>
    </div>
  );
}
