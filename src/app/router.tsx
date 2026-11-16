import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { AppLayout } from '@/app/layout/AppLayout'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { NotFoundPage } from '@/app/NotFoundPage'
import { RequireAuth, RequireStaff } from '@/app/RequireAuth'
import { AdminPage } from '@/features/admin/AdminPage'
import { AlertsPage } from '@/features/alerts/AlertsPage'
import { ArbitragePage } from '@/features/arbitrage/ArbitragePage'
import { AssistantPage } from '@/features/assistant/AssistantPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProfilePage } from '@/features/auth/ProfilePage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { CalculatorPage } from '@/features/calculator/CalculatorPage'
import { CommunityPage } from '@/features/community/CommunityPage'
import { UserProfilePage } from '@/features/community/UserProfilePage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { OffersPage } from '@/features/offers/OffersPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      {
        path: 'offers',
        element: (
          <RequireAuth
            title="Ринок доступний після входу"
            description="Сканер P2P-оголошень з фільтрами за банком, сумою й рейтингом продавця — для зареєстрованих користувачів."
          >
            <OffersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'arbitrage',
        element: (
          <RequireAuth
            title="Арбітраж доступний після входу"
            description="Міжбіржові угоди, ланцюжки й AI Score з розрахунком комісій — для зареєстрованих користувачів."
          >
            <ArbitragePage />
          </RequireAuth>
        ),
      },
      { path: 'calculator', element: <CalculatorPage /> },
      {
        path: 'assistant',
        element: (
          <RequireAuth
            title="AI-асистент доступний після входу"
            description="Асистент відповідає на питання про P2P, курси й можливості на живих даних — увійдіть, щоб почати розмову."
          >
            <AssistantPage />
          </RequireAuth>
        ),
      },
      {
        path: 'alerts',
        element: (
          <RequireAuth
            title="Сповіщення доступні після входу"
            description="Watchlist і правила сповіщень у застосунку, Telegram чи на email зберігаються у вашому акаунті."
          >
            <AlertsPage />
          </RequireAuth>
        ),
      },
      { path: 'community', element: <CommunityPage /> },
      { path: 'community/u/:username', element: <UserProfilePage /> },
      { path: 'profile', element: <ProfilePage /> },
      {
        path: 'admin',
        element: (
          <RequireStaff>
            <AdminPage />
          </RequireStaff>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
    ],
  },
]

const routerFuture = {
  v7_fetcherPersist: true,
  v7_normalizeFormMethod: true,
  v7_partialHydration: true,
  v7_relativeSplatPath: true,
  v7_skipActionErrorRevalidation: true,
} as const

export const router = createBrowserRouter(routes, { future: routerFuture })
