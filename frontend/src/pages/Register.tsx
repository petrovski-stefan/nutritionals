import AuthPrompt from '../features/auth/components/AuthPrompt';
import AuthLayout from '../features/auth/components/Layout';
import RegisterForm from '../features/auth/components/RegisterForm';

export default function Register() {
  return (
    <AuthLayout title="Регистрација">
      <RegisterForm />
      <AuthPrompt type="register" />
    </AuthLayout>
  );
}
