import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Pill, 
  Utensils, 
  Dumbbell, 
  Plane, 
  Video, 
  Settings, 
  LogOut,
  Activity
} from 'lucide-react';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/medications', icon: Pill, label: 'Medications' },
    { path: '/nutrition', icon: Utensils, label: 'Nutrition' },
    { path: '/workouts', icon: Dumbbell, label: 'Workouts' },
    { path: '/travel', icon: Plane, label: 'Travel' },
    { path: '/tele-consultation', icon: Video, label: 'Tele-Consultation' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-cyan-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg" data-testid="sidebar">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-blue-500 to-teal-500 p-2 rounded-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text" data-testid="sidebar-title">OneBioCircle</h1>
              <p className="text-xs text-gray-500" data-testid="sidebar-user-name">{user?.name}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2" data-testid="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                variant="ghost"
                className={`w-full justify-start space-x-3 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-50 to-teal-50 text-blue-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                data-testid={`sidebar-${item.label.toLowerCase().replace(/[^a-z]+/g, '-')}`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start space-x-3 text-red-600 hover:bg-red-50"
            data-testid="sidebar-logout"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto" data-testid="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
