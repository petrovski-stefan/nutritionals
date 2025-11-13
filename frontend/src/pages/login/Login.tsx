import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../../types/user';
import { UserService } from '../../api/user';
import { useAuthContext } from '../../context/AuthContext';

const loginCredentialsInitialValue = {
  username: '',
  password: '',
};

export default function Login() {
  const [loginCredentials, setLoginCredentials] = useState<LoginCredentials>(
    loginCredentialsInitialValue
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<null | string>(null);

  const { login } = useAuthContext();

  const navigate = useNavigate();

  const handleLoginCredentialsOnChange = (key: keyof LoginCredentials, value: string) => {
    setErrors(null);
    setLoginCredentials({ ...loginCredentials, [key]: value });
  };

  const handleLoginFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const response = await UserService.login(loginCredentials);

    if (response.status) {
      setIsLoading(false);
      login(loginCredentials.username, response.data.access);
      navigate('/');
    } else {
      setIsLoading(false);
      setErrors(response.errors_type);
    }
  };

  return (
    <div className="mt-5 flex h-1/2 items-center justify-center">
      <div className="w-1/4 px-2 py-4">
        {errors && (
          <div className="mb-4 rounded-lg bg-red-100 px-4 py-2 text-center text-red-700">
            {errors}
          </div>
        )}

        <form
          onSubmit={handleLoginFormSubmit}
          className="space-y-5"
        >
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">Username</label>
            <input
              type="text"
              value={loginCredentials.username}
              onChange={(e) => handleLoginCredentialsOnChange('username', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder="Enter your username"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">Password</label>
            <input
              type="password"
              value={loginCredentials.password}
              onChange={(e) => handleLoginCredentialsOnChange('password', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 w-full rounded-2xl py-3 font-bold text-white transition disabled:opacity-70"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p className="text-dark/70 mt-6 text-center text-sm">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-accent font-medium hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
