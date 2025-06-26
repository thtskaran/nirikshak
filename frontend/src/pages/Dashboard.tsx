
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Server, Rocket, FileText } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();

  const dashboardItems = [
    {
      title: 'View All Models',
      description: 'Manage and monitor your deployed models',
      icon: Server,
      path: '/models',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Deploy New Model',
      description: 'Deploy models from various sources',
      icon: Rocket,
      path: '/deploy',
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Check Logs',
      description: 'View system logs and monitoring data',
      icon: FileText,
      path: '/logs',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Welcome to Nirikshak</h1>
        <p className="text-gray-400 text-lg">Your AI Model Monitoring & Management Platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.path}
              className="glass-effect border-cyan-500/20 cursor-pointer group hover:glow-cyan-strong transition-all duration-300 hover:scale-105"
              onClick={() => navigate(item.path)}
            >
              <CardContent className="p-8 text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${item.color} flex items-center justify-center group-hover:animate-pulse-glow`}>
                  <Icon size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-gray-400">{item.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
        <Card className="glass-effect border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-cyan-400">12</div>
            <div className="text-gray-400">Active Models</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-400">98.5%</div>
            <div className="text-gray-400">Uptime</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-yellow-400">1.2k</div>
            <div className="text-gray-400">Requests/Hour</div>
          </CardContent>
        </Card>
        
        <Card className="glass-effect border-cyan-500/20">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-400">45ms</div>
            <div className="text-gray-400">Avg Response</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
