import AuthFormContainer from '@/features/auth/components/AuthFormContainer';
import AuthLayout from '@/features/auth/components/AuthLayout';
import AuthPrompt from '@/features/auth/components/AuthPrompt';
import LoginForm from '@/features/auth/components/LoginForm';

export default function Login() {
  return (
    <AuthLayout>
      <AuthFormContainer title="Најава">
        <LoginForm />
        <AuthPrompt type="login" />
      </AuthFormContainer>
    </AuthLayout>
  );
}
