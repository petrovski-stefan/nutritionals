import { NavLink, useLocation } from 'react-router-dom';

type Props = Readonly<{
  type: 'login' | 'register';
}>;

export default function AuthPrompt({ type }: Props) {
  const location = useLocation();

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
    <p className="text-text-muted mt-6 text-center text-sm">
      <span>{message}</span>
      <NavLink
        to={to}
        state={location.state as unknown}
        className="text-accent focus-visible:outline-accent rounded font-medium hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {actionText}
      </NavLink>
    </p>
  );
}
