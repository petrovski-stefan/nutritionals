import AuthFormContainer from '@/features/auth/components/AuthFormContainer';
import AuthLayout from '@/features/auth/components/AuthLayout';
import AuthPrompt from '@/features/auth/components/AuthPrompt';
import RegisterForm from '@/features/auth/components/RegisterForm';

export default function Register() {
  return (
    <AuthLayout>
      <AuthFormContainer title="Регистрација">
        <RegisterForm />
        <AuthPrompt type="register" />
      </AuthFormContainer>
    </AuthLayout>
  );
}
