import { useState, type FormEvent } from 'react';
import type { RegisterCredentials } from '../../types/users';
import { UserService } from '../../api/users';
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
      <div>
        <h1 className="text-accent text-center">Register / Join us</h1>
        {errors && <p>{errors}</p>}
        {isLoading && <p>Loading ...</p>}
        <form onSubmit={handleRegisterFormSubmit}>
          <div>
            <label>Username: </label>
            <input
              type="text"
              onChange={(e) => handleRegisterCredentialsOnChange('username', e.target.value)}
              value={registerCredentials['username']}
              className="w-full rounded-2xl bg-neutral-200 p-2"
            />
          </div>
          <div>
            <label>Password: </label>
            <input
              type="password"
              onChange={(e) => handleRegisterCredentialsOnChange('password', e.target.value)}
              value={registerCredentials['password']}
              className="w-full rounded-2xl bg-neutral-200 p-2"
            />
          </div>
          <div>
            <label>Confirm password: </label>
            <input
              type="password"
              onChange={(e) => handleRegisterCredentialsOnChange('confirmPassword', e.target.value)}
              value={registerCredentials['confirmPassword']}
              className="w-full rounded-2xl bg-neutral-200 p-2"
            />
          </div>

          <div className="bg-accent mx-auto my-5 w-fit cursor-pointer rounded-2xl px-4 py-2">
            <button
              type="submit"
              className="text-primary cursor-pointer text-center font-bold"
            >
              Register
            </button>
          </div>
        </form>
        <p className="text-center">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="text-accent"
          >
            Login!
          </Link>
        </p>
      </div>
    </div>
  );
}
