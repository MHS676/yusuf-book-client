import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './layout/AppLayout';
import { Spinner } from './components/ui/Spinner';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LibraryPage = lazy(() => import('./pages/LibraryPage'));
const ExamPage = lazy(() => import('./pages/ExamPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      { path: '/', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><HomePage /></Suspense> },
      { path: '/about', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><AboutPage /></Suspense> },
      { path: '/library', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><LibraryPage /></Suspense> },
      { path: '/exam', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><ExamPage /></Suspense> },
      { path: '/contact', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><ContactPage /></Suspense> },
      { path: '/admin', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><AdminDashboardPage /></Suspense> },
      { path: '/login', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><LoginPage /></Suspense> },
      { path: '*', element: <Suspense fallback={<div className="flex justify-center p-20"><Spinner size="lg" /></div>}><NotFoundPage /></Suspense> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
