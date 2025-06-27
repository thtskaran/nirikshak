
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Menu, X, Home, Rocket, Server, FileText, Image } from 'lucide-react';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/deploy', label: 'Deploy Models', icon: Rocket },
    { path: '/models', label: 'Deployed Models', icon: Server },
    { path: '/logs', label: 'Logs', icon: FileText },
    { path: '/gallery', label: 'Model Gallery', icon: Image },
  ];

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0F1117] flex w-full">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 glass-effect border-r border-cyan-500/20 overflow-hidden`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-cyan-400 mb-8">Nirikshak</h1>
          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-cyan-500/20 text-cyan-400 glow-cyan' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-cyan-400'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="glass-effect border-b border-cyan-500/20 p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-cyan-400 hover:bg-cyan-500/20"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            size="sm"
            className="text-red-400 hover:bg-red-500/20 flex items-center space-x-2"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
