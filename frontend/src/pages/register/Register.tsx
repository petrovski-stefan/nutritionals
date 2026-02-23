import { useState, type FormEvent } from 'react';
import type { RegisterCredentials } from '../../types/user';
import { UserService } from '../../api/user';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import REGISTER_TEXT from '../../locale/register';

const defaultCredentials = {
  username: '',
  password: '',
  confirmPassword: '',
};

type Error = keyof (typeof REGISTER_TEXT)['errors'];

export default function Register() {
  const [credentials, setCredentials] = useState<RegisterCredentials>(defaultCredentials);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<null | Error>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleCredentialsOnChange = (key: keyof RegisterCredentials, value: string) => {
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

    if (credentials['password'] !== credentials['confirmPassword']) {
      setError('passwordsDoNotMatchError');
      setIsLoading(false);
      return;
    }

    if (credentials['password'].length < 8) {
      setError('weakPasswordError');
      setIsLoading(false);
      return;
    }

    const response = await UserService.register(credentials);

    if (response.status) {
      setIsLoading(false);
      login(response.data.username, response.data.access);
      navigate('/');
    } else {
      setIsLoading(false);
      setError(response.errors_type as Error);
    }
  };

  return (
    <div className="mt-5 flex h-1/2 items-center justify-center">
      <div className="w-5/6 px-2 py-4 md:w-1/4">
        {error && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-center text-red-700">
            {REGISTER_TEXT['errors'][error]}
          </div>
        )}

        <form
          onSubmit={handleFormSubmit}
          className="space-y-5"
        >
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">
              {REGISTER_TEXT['form']['username']}
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => handleCredentialsOnChange('username', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder={REGISTER_TEXT['form']['usernamePlaceholder']}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">
              {REGISTER_TEXT['form']['password']}
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => handleCredentialsOnChange('password', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder={REGISTER_TEXT['form']['passwordPlaceholder']}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">
              {REGISTER_TEXT['form']['repeatPassword']}
            </label>
            <input
              type="password"
              value={credentials.confirmPassword}
              onChange={(e) => handleCredentialsOnChange('confirmPassword', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder={REGISTER_TEXT['form']['repeatPasswordPlaceholder']}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 w-full rounded-2xl py-3 font-bold text-white transition disabled:opacity-70"
          >
            {isLoading
              ? REGISTER_TEXT['form']['registerButtonLoading']
              : REGISTER_TEXT['form']['registerButton']}
          </button>
        </form>
        <p className="text-dark/70 mt-6 text-center text-sm">
          <span>{REGISTER_TEXT['hasAccount']}</span>
          <Link
            to="/login"
            className="text-accent font-medium hover:underline"
          >
            {REGISTER_TEXT['loginLink']}
          </Link>
        </p>
      </div>
    </div>
  );
}
