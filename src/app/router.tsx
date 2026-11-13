import { createBrowserRouter, type RouteObject } from 'react-router-dom'

import { AppLayout } from '@/app/layout/AppLayout'
import { AuthLayout } from '@/app/layout/AuthLayout'
import { NotFoundPage } from '@/app/NotFoundPage'
import { AlertsPage } from '@/features/alerts/AlertsPage'
import { ArbitragePage } from '@/features/arbitrage/ArbitragePage'
import { AssistantPage } from '@/features/assistant/AssistantPage'
import { GoogleCallbackPage } from '@/features/auth/GoogleCallbackPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { ProfilePage } from '@/features/auth/ProfilePage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { CalculatorPage } from '@/features/calculator/CalculatorPage'
import { CommunityPage } from '@/features/community/CommunityPage'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { OffersPage } from '@/features/offers/OffersPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'offers', element: <OffersPage /> },
      { path: 'arbitrage', element: <ArbitragePage /> },
      { path: 'calculator', element: <CalculatorPage /> },
      { path: 'assistant', element: <AssistantPage /> },
      { path: 'alerts', element: <AlertsPage /> },
      { path: 'community', element: <CommunityPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'auth/google/callback', element: <GoogleCallbackPage /> },
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
