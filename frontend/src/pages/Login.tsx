import AuthPrompt from '../features/auth/components/AuthPrompt';
import AuthLayout from '../features/auth/components/Layout';
import LoginForm from '../features/auth/components/LoginForm';

export default function Login() {
  return (
    <AuthLayout title="Најава">
      <LoginForm />
      <AuthPrompt type="login" />
    </AuthLayout>
  );
}
