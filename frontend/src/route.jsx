import App from './App.jsx';
import { SignupForm } from './signupForm';
import { LoginForm } from './loginForm';
import { UserProfile } from './userProfile';

export const routes = [
    {
        path: '/',
        element: <App />,
    },
    {
        path: '/loginForm',
        element: <LoginForm />,
    },
    {
        path: '/signupForm',
        element: <SignupForm />,
    },
    {
        path: '/userProfile',
        element: <UserProfile />,
    },
];
