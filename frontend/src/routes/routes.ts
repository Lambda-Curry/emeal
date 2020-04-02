import { DashboardPage } from '../pages/DashboardPage';
import { PublicLayout } from '../layout/PublicLayout';
import { PrivateLayout } from '../layout/PrivateLayout';
import { LoginPage } from '../pages/LoginPage';
import { SignupPage } from '../pages/SignupPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ProfilePage } from '../pages/ProfilePage';
import { DesignPage } from '../pages/DesignPage';
import { ComponentType } from 'react';

interface RouteConfig {
  path: string;
  component: ComponentType;
  exact: boolean;
}

interface EmealRoutes {
  public: RouteConfig[];
  private: RouteConfig[];
}

export const emealLayouts = {
  public: PublicLayout,
  private: PrivateLayout
};

export const routes: EmealRoutes = {
  public: [
    {
      path: '/login',
      component: LoginPage,
      exact: true
    },
    {
      path: '/signup',
      component: SignupPage,
      exact: true
    },
    {
      path: '/reset-password',
      component: ForgotPasswordPage,
      exact: true
    }
  ],
  private: [
    {
      path: '/',
      component: DashboardPage,
      exact: true
    },
    {
      path: '/profile',
      component: ProfilePage,
      exact: true
    },
    {
      path: '/design',
      component: DesignPage,
      exact: true
    }
  ]
};