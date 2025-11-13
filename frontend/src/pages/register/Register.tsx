import { useState, type FormEvent } from 'react';
import type { RegisterCredentials } from '../../types/user';
import { UserService } from '../../api/user';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';

const registerCredentialsInitialValue = {
  username: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const [registerCredentials, setRegisterCredentials] = useState<RegisterCredentials>(
    registerCredentialsInitialValue
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<null | string>(null);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const handleRegisterCredentialsOnChange = (key: keyof RegisterCredentials, value: string) => {
    setRegisterCredentials({ ...registerCredentials, [key]: value });
  };

  const handleRegisterFormSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setErrors(null);
    setIsLoading(true);
    const response = await UserService.register(registerCredentials);

    if (response.status) {
      setIsLoading(false);
      login(response.data.username, response.data.access);
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
          onSubmit={handleRegisterFormSubmit}
          className="space-y-5"
        >
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">Username</label>
            <input
              type="text"
              value={registerCredentials.username}
              onChange={(e) => handleRegisterCredentialsOnChange('username', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder="Enter your username"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">Password</label>
            <input
              type="password"
              value={registerCredentials.password}
              onChange={(e) => handleRegisterCredentialsOnChange('password', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-dark mb-2 font-medium">Confirm password</label>
            <input
              type="password"
              value={registerCredentials.confirmPassword}
              onChange={(e) => handleRegisterCredentialsOnChange('confirmPassword', e.target.value)}
              className="border-dark/30 focus:ring-accent focus:border-accent rounded-2xl border px-4 py-3 transition focus:ring-2 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-accent hover:bg-accent/90 w-full rounded-2xl py-3 font-bold text-white transition disabled:opacity-70"
          >
            {isLoading ? 'Registering ...' : 'Register'}
          </button>
        </form>
        <p className="text-dark/70 mt-6 text-center text-sm">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-accent font-medium hover:underline"
          >
            Login!
          </Link>
        </p>
      </div>
    </div>
  );
}
