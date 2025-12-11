import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, TrendingUp, History } from 'lucide-react';
import routes from '@/routes';

const Navigation = () => {
  const location = useLocation();
  const visibleRoutes = routes.filter((route) => route.visible !== false);

  const getIcon = (path: string) => {
    switch (path) {
      case '/':
        return Home;
      case '/reports':
        return BarChart3;
      case '/progress':
        return TrendingUp;
      case '/history':
        return History;
      default:
        return Home;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        {visibleRoutes.map((route) => {
          const Icon = getIcon(route.path);
          const isActive = location.pathname === route.path;

          return (
            <Link
              key={route.path}
              to={route.path}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 ${isActive ? 'text-primary' : ''}`} />
              <span className={`text-xs font-medium ${isActive ? 'text-primary' : ''}`}>{route.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;
