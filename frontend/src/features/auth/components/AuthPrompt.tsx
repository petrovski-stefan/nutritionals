import { NavLink } from 'react-router-dom';

type Props = Readonly<{
  type: 'login' | 'register';
}>;

export default function AuthPrompt({ type }: Props) {
  const config = {
    login: {
      message: 'Немате отворено корисничка сметка? ',
      actionText: 'Регистрирај се.',
      to: '/register',
    },
    register: {
      message: 'Имате отворено корисничка сметка? ',
      actionText: 'Најави се.',
      to: '/login',
    },
  };

  const { message, actionText, to } = config[type];

  return (
    <p className="text-dark/70 mt-6 text-center text-sm">
      <span>{message}</span>
      <NavLink
        to={to}
        className="text-accent font-medium hover:underline"
      >
        {actionText}
      </NavLink>
    </p>
  );
}
