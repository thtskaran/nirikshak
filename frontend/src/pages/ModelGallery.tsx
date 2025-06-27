import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Star, Download, Users } from "lucide-react";
import DeploymentModal from "@/components/DeploymentModal";
import { toast } from "@/components/ui/sonner";
import api1 from "@/lib/api1";
import { useEffect } from "react";
import { formatNumber } from "@/utils/formatNumber";
import llmapi from "@/lib/llmapi";
import api2 from "@/lib/api2";
import { Input } from "@/components/ui/input";

type Model = {
  _id: string;
  name: string;
  provider: string;
  icon?: string;
  tags: string[];
  parameters: number;
  createdAt: string;
  updatedAt: string;
};

type ModelDepProps = {
  modelId: string;
  name: string;
  description?: string;
  systemPrompt: string;
  temperature: number;
};

const ModelGallery = () => {
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState("");
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [deploymentError, setDeploymentError] = useState(false);
  const [isAISuggesting, setIsAISuggesting] = useState(false);
  const [depName, setDepName] = useState("");
  const [depDescription, setDepDescription] = useState("");
  const [temperature, setTemperature] = useState(0.7);

  const iconMap: { [key: string]: string } = {
    ollama: "🦙",
    huggingFace: "🤗",
    openAI: "🧠",
    deepseek: "🔍",
    anthropic: "🎭",
    mistral: "🌪️",
    default: "🤖",
  };

  const [models, setModels] = useState<Model[]>([]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await api1.get<Model[]>("/api/models");
        setModels(response.data);
      } catch (err: unknown) {
        console.error(err);
      }
    };
    fetchModels();
  }, []);

  const openDeployModal = (model: Model) => {
    setSelectedModel(model);
    setCustomPrompt(
      `You are ${
        model.name
      }, an expert assistant specialized in ${model.tags.join(
        ", "
      )}. Provide detailed, accurate responses with clear explanations.`
    );
    setShowDeployModal(true);
  };

  const handleDeploy = async () => {
    api2.post("api/v1/deployments", {
      modelId: selectedModel?._id,
      name: depName,
      description: depDescription,
      systemPrompt: customPrompt,
      temperature,
    });
    setShowDeployModal(false);
    setIsDeploying(true);
    setDeploymentSuccess(false);
    setDeploymentError(false);

    const steps = [
      "Deploying Model with New System Prompt...",
      "Building Secure Container...",
      "Deployment in Progress...",
    ];

    let currentStep = 0;

    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setDeploymentStep(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(stepInterval);

        // Simulate random success/failure
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
          setDeploymentStep("Deployment Successful!");
          setDeploymentSuccess(true);
          toast.success("Model deployed successfully!");
          setTimeout(() => {
            setIsDeploying(false);
            setDeploymentSuccess(false);
            setSelectedModel(null);
          }, 2500);
        } else {
          setIsDeploying(false);
          setDeploymentError(true);
          toast.error("Deployment failed. Please try again.");
        }
      }
    }, 6667);
  };

  const generatePromptSuggestion = async () => {
    if (!customPrompt) {
      toast.error(
        "Please enter a custom prompt before generating suggestions."
      );
      return;
    }
    setIsAISuggesting(true);
    try {
      const response = await llmapi.post("/api/chat", {
        model: "llama3",
        messages: [
          {
            role: "system",
            content:
              'You generate high-quality system prompts that guide LLM behavior clearly, safely. Respond only with a JSON object: { "result": "...generated system prompt" } and nothing else.',
          },
          {
            role: "user",
            content: `Rewrite the existing system prompt by enhancing its clarity and effectiveness. Existing System Prompt: ${customPrompt}. Output format: { "result": "..." } only.`,
          },
        ],
        format: {
          type: "object",
          properties: {
            result: {
              type: "string",
            },
          },
          required: ["result"],
        },
        stream: false,
        options: {
          temperature: 0.6,
          top_p: 0.9,
          max_tokens: 600,
        },
      });

      const content = response.data.message.content;
      const parsed = JSON.parse(content);
      setCustomPrompt(parsed.result);
    } catch (error) {
      console.error("Error calling Ollama:", error.message);
      const suggestions = [
        "You are an expert assistant specialized in providing detailed, accurate responses with clear explanations.",
        "You are a helpful AI that thinks step-by-step and provides well-structured answers.",
        "You are a professional consultant who provides actionable insights and recommendations.",
      ];
      const randomSuggestion =
        suggestions[Math.floor(Math.random() * suggestions.length)];
      setCustomPrompt(randomSuggestion);
    }

    setIsAISuggesting(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Model Gallery</h1>
        <p className="text-gray-400">Discover and deploy pre-trained models</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card
            key={model._id}
            className="glass-effect border-cyan-500/20 hover:glow-cyan transition-all duration-300 hover:scale-105"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">
                    {model.icon ? (
                      <img
                        src={model.icon}
                        alt={model.name}
                        className="size-10"
                      />
                    ) : (
                      iconMap[model.provider] || iconMap.Default
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {model.name}
                    </h3>
                    <p className="text-sm text-cyan-400">{model.provider}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm"></span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">
                {formatNumber(model.parameters)} parameters
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {model.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-gray-700 text-gray-300"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button
                onClick={() => openDeployModal(model)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white glow-cyan"
              >
                Deploy Model
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deploy Modal */}
      {showDeployModal && selectedModel && (
        <Dialog open={showDeployModal} onOpenChange={setShowDeployModal}>
          <DialogContent className="glass-effect border-cyan-500/20 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center space-x-2">
                <span className="text-2xl">
                  {selectedModel?.icon ? (
                    <img
                      src={selectedModel.icon}
                      alt={selectedModel.name}
                      className="size-10"
                    />
                  ) : (
                    iconMap[selectedModel.provider] || iconMap.Default
                  )}
                </span>

                <span>Deploy {selectedModel.name}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <Card className="glass-effect border-cyan-500/20">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">
                    Model Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Provider:</span>
                      <div className="text-cyan-400">
                        {selectedModel.provider}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Parameters:</span>
                      <div className="text-cyan-400">
                        {formatNumber(selectedModel.parameters)} params
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* take deployment name as Inut */}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Deployment Name
                  </label>
                  <Input
                    value={depName}
                    onChange={(e) => setDepName(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white"
                    placeholder="Enter deployment name"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">System Prompt</h4>
                  <Button
                    onClick={generatePromptSuggestion}
                    variant="outline"
                    size="sm"
                    className="text-white hover:text-white bg-purple-500/50 hover:bg-purple-600/50 w-36"
                    disabled={isAISuggesting}
                  >
                    {isAISuggesting ? (
                      <Sparkles size={16} className={`mr-2 animate-pulse`} />
                    ) : (
                      <Sparkles size={16} className={`mr-2`} />
                    )}

                    {isAISuggesting ? "Suggesting..." : "AI Suggestion"}
                  </Button>
                </div>

                <Textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white min-h-32"
                  placeholder="Enter system prompt for the model..."
                />
              </div>

              <div className="flex space-x-4">
                <Button
                  onClick={() => setShowDeployModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeploy}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white glow-cyan"
                >
                  Deploy Model
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Deployment Progress Modal */}
      <DeploymentModal
        isOpen={isDeploying}
        step={deploymentStep}
        isSuccess={deploymentSuccess}
        isError={deploymentError}
        onClose={() => {
          setIsDeploying(false);
          setDeploymentError(false);
          setDeploymentSuccess(false);
        }}
      />
    </div>
  );
};

export default ModelGallery;
