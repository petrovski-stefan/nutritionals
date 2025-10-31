import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../../types/users';
import { UserService } from '../../api/users';
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
        {errors && <p>{errors}</p>}
        {isLoading && <p>Loading ...</p>}
        <form onSubmit={handleLoginFormSubmit}>
          <div>
            <label>Username: </label>
            <input
              type="text"
              onChange={(e) => handleLoginCredentialsOnChange('username', e.target.value)}
              value={loginCredentials['username']}
              className="w-full rounded-2xl bg-neutral-200 p-2"
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              onChange={(e) => handleLoginCredentialsOnChange('password', e.target.value)}
              value={loginCredentials['password']}
              className="w-full rounded-2xl bg-neutral-200 p-2"
            />
          </div>

          <div className="bg-accent mx-auto my-5 w-fit cursor-pointer rounded-2xl px-4 py-2">
            <button
              type="submit"
              className="text-primary cursor-pointer text-center font-bold"
            >
              Login
            </button>
          </div>
        </form>
        <p className="text-center">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            className="text-accent"
          >
            Register!
          </Link>
        </p>
      </div>
    </div>
  );
}
