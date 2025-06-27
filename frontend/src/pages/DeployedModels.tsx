import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, FileText, Search, Settings } from "lucide-react";
import ChatModal from "@/components/ChatModal";
import LogsModal from "@/components/LogsModal";
import ScanModal from "@/components/ScanModal";
import ModelSettingsModal from "@/components/ModelSettingsModal";
import api2 from "@/lib/api2";
import { formatNumber } from "@/utils/formatNumber";

export interface Deployment {
  _id: string;
  containerId: string;
  containerName: string;
  createdAt: string;
  description: string;
  endpoint: string;
  modelId: string;
  name: string;
  status: string;
  systemPrompt: string;
  temperature: number;
  updatedAt: string;
}

const DeployedModels = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedDeployment, setSelectedDeployment] =
    useState<Deployment | null>(null);
  const [modalType, setModalType] = useState<
    "chat" | "logs" | "scan" | "settings" | null
  >(null);
  const [loading, setLoading] = useState(true);

  const openModal = (
    model: Deployment,
    type: "chat" | "logs" | "scan" | "settings"
  ) => {
    setSelectedDeployment(model);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedDeployment(null);
    setModalType(null);
  };

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const res = await api2.get<Deployment[]>("/api/v1/deployments");
        setDeployments(res.data);
      } catch (error) {
        console.error("Failed to fetch deployments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeployments();
  }, []);

  const getIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case "openai":
        return "🧠";
      case "huggingface":
        return "🤗";
      case "ollama":
        return "🦄";
      default:
        return "⚙️";
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
          {deployments.map((deployment) => (
            <Card
              key={deployment._id}
              className="glass-effect border-cyan-500/20 hover:glow-cyan transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {getIcon(deployment.provider)}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {deployment.name}
                      </h3>
                      <p className="text-gray-400">
                        {deployment.provider || "Unknown Source"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      deployment.status === "DEPLOYED" ? "default" : "secondary"
                    }
                    className={
                      deployment.status === "DEPLOYED"
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }
                  >
                    {deployment.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <span className="text-gray-400">Parameters:</span>
                    <div className="text-cyan-400 font-semibold">
                      {formatNumber(deployment.parameters || 0)}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Created:</span>
                    <div className="text-green-400 font-semibold">
                      {new Date(deployment.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(deployment, "chat")}
                    className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:text-white"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Chat
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(deployment, "logs")}
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20 hover:text-white"
                  >
                    <FileText size={16} className="mr-2" />
                    Logs
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(deployment, "scan")}
                    className="border-purple-500/50 text-purple-400 hover:bg-purple-500/20 hover:text-white"
                  >
                    <Search size={16} className="mr-2" />
                    Scan
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(deployment, "settings")}
                    className="border-gray-500/50 text-gray-400 hover:bg-gray-500/20 hover:text-white"
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
      {modalType === "chat" && selectedDeployment && (
        <ChatModal model={selectedDeployment} onClose={closeModal} />
      )}
      {modalType === "logs" && selectedDeployment && (
        <LogsModal model={selectedDeployment} onClose={closeModal} />
      )}
      {modalType === "scan" && selectedDeployment && (
        <ScanModal model={selectedDeployment} onClose={closeModal} />
      )}
      {modalType === "settings" && selectedDeployment && (
        <ModelSettingsModal model={selectedDeployment} onClose={closeModal} />
      )}
    </div>
  );
};

export default DeployedModels;
