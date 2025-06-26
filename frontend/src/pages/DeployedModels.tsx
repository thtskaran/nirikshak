import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, FileText, Search, Settings } from 'lucide-react';
import ChatModal from '@/components/ChatModal';
import LogsModal from '@/components/LogsModal';
import ScanModal from '@/components/ScanModal';
import ModelSettingsModal from '@/components/ModelSettingsModal';
import api2 from "@/lib/api2";

const DeployedModels = () => {
  const [models, setModels] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [modalType, setModalType] = useState<'chat' | 'logs' | 'scan' | 'settings' | null>(null);
  const [loading, setLoading] = useState(true);

  const openModal = (model: any, type: 'chat' | 'logs' | 'scan' | 'settings') => {
    setSelectedModel(model);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedModel(null);
    setModalType(null);
  };

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const res = await api2.get('/api/v1/deployments');
        setModels(res.data);
      } catch (error) {
        console.error('Failed to fetch deployments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeployments();
  }, []);

  const getIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case 'openai': return '🧠';
      case 'huggingface': return '🤗';
      case 'ollama': return '🦄';
      default: return '⚙️';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Deployed Models</h1>
        <p className="text-gray-400">Manage and monitor your active models</p>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading models...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {models.map((model) => (
            <Card key={model._id} className="glass-effect border-cyan-500/20 hover:glow-cyan transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{getIcon(model.provider)}</div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{model.name}</h3>
                      <p className="text-gray-400">{model.provider || 'Unknown Source'}</p>
                    </div>
                  </div>
                  <Badge
                    variant={model.status === 'DEPLOYED' ? 'default' : 'secondary'}
                    className={model.status === 'DEPLOYED' ? 'bg-green-500' : 'bg-gray-500'}
                  >
                    {model.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-gray-400">Requests:</span>
                    <div className="text-cyan-400 font-semibold">~</div> {/* Placeholder */}
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <div className="text-green-400 font-semibold">
                      {new Date(model.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(model, 'chat')}
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Chat
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(model, 'logs')}
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                  >
                    <FileText size={16} className="mr-2" />
                    Logs
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(model, 'scan')}
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
                  >
                    <Search size={16} className="mr-2" />
                    Scan
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(model, 'settings')}
                    className="border-gray-500/50 text-gray-400 hover:bg-gray-500/20"
                  >
                    <Settings size={16} className="mr-2" />
                    Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {modalType === 'chat' && selectedModel && <ChatModal model={selectedModel} onClose={closeModal} />}
      {modalType === 'logs' && selectedModel && <LogsModal model={selectedModel} onClose={closeModal} />}
      {modalType === 'scan' && selectedModel && <ScanModal model={selectedModel} onClose={closeModal} />}
      {modalType === 'settings' && selectedModel && <ModelSettingsModal model={selectedModel} onClose={closeModal} />}
    </div>
  );
};

export default DeployedModels;
