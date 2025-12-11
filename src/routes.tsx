import Dashboard from './pages/Dashboard';
import AddWorkout from './pages/AddWorkout';
import Reports from './pages/Reports';
import Progress from './pages/Progress';
import History from './pages/History';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'الرئيسية',
    path: '/',
    element: <Dashboard />,
  },
  {
    name: 'إضافة',
    path: '/add-workout',
    element: <AddWorkout />,
    visible: false,
  },
  {
    name: 'التقارير',
    path: '/reports',
    element: <Reports />,
  },
  {
    name: 'التطور',
    path: '/progress',
    element: <Progress />,
  },
  {
    name: 'السجل',
    path: '/history',
    element: <History />,
  },
];

export default routes;
