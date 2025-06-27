import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import api2 from "@/lib/api2";
import { Sparkles } from "lucide-react";
import llmapi from "@/lib/llmapi";
import { Deployment } from "@/pages/DeployedModels";

interface ModelSettingsModalProps {
  model: Deployment;
  onClose: () => void;
  onUpdate?: (updatedModel: Deployment) => void;
}

const ModelSettingsModal = ({
  model,
  onClose,
  onUpdate,
}: ModelSettingsModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [rateLimit, setRateLimit] = useState(100);
  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant..."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingData, setIsFetchingData] = useState(true);
  const [isAISuggesting, setIsAISuggesting] = useState(false);

  // Fetch fresh deployment data on mount
  useEffect(() => {
    fetchDeploymentData();
  }, [model?._id]);

  const fetchDeploymentData = async () => {
    if (!model?._id) {
      setIsFetchingData(false);
      return;
    }

    try {
      setIsFetchingData(true);
      const response = await api2.get(`/api/v1/deployments/${model._id}`);

      if (response.data) {
        const deployment = response.data;
        setName(deployment.name || model.name || "");
        setDescription(deployment.description || model.description || "");
        setTemperature([deployment.temperature || 0.7]);
        setMaxTokens(deployment.maxTokens || 2048);
        setRateLimit(deployment.rateLimit || 100);
        setSystemPrompt(
          deployment.systemPrompt || "You are a helpful AI assistant..."
        );
      }
    } catch (error: any) {
      console.error("Failed to fetch deployment data:", error);
      // Fallback to model props if API fails
      setName(model?.name || "");
      setDescription(model?.description || "");
      setTemperature([model?.temperature || 0.7]);
      setMaxTokens(model?.maxTokens || 2048);
      setRateLimit(model?.rateLimit || 100);
      setSystemPrompt(
        model?.systemPrompt || "You are a helpful AI assistant..."
      );
    } finally {
      setIsFetchingData(false);
    }
  };

  const handleSave = async () => {
    if (!model?._id) {
      toast.error("Model ID not found");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
        temperature: temperature[0],
      };

      const response = await api2.patch(
        `/api/v1/deployments/${model._id}`,
        payload
      );

      if (response.data?.deployment) {
        console.log(
          "Deployment updated successfully:",
          response.data.deployment
        );
        // Notify parent component of the update
        if (onUpdate) {
          onUpdate(response.data.deployment);
        }
      }

      toast.success("Model settings updated successfully!");
      onClose();
    } catch (error: any) {
      console.error("Failed to save settings:", error);
      toast.error(
        error.response?.data?.message || "Failed to update model settings"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generatePromptSuggestion = async () => {
    if (!systemPrompt.trim()) {
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
            content: `Rewrite the existing system prompt by enhancing its clarity and effectiveness. Existing System Prompt: '${systemPrompt.trim()}'. Output format: { "result": "..." } only.`,
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
      setSystemPrompt(parsed.result);
    } catch (error) {
      console.error("Error calling Ollama:", error.message);
      const suggestions = [
        "You are an expert assistant specialized in providing detailed, accurate responses with clear explanations.",
        "You are a helpful AI that thinks step-by-step and provides well-structured answers.",
        "You are a professional consultant who provides actionable insights and recommendations.",
      ];
      const randomSuggestion =
        suggestions[Math.floor(Math.random() * suggestions.length)];
      setSystemPrompt(randomSuggestion);
    }

    setIsAISuggesting(false);
  };

  // Show loading state while fetching data
  if (isFetchingData) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="glass-effect border-cyan-500/20 max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <span className="text-xl">{model.icon}</span>
              <span>Settings - {model.name}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading deployment settings...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-cyan-500/20 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <span className="text-xl">{model.icon}</span>
            <span>Settings - {model.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="glass-effect border-cyan-500/20">
            <CardHeader className="p-0 m-0">
              <CardTitle className="text-white text-lg hidden">
                Model Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-gray-300">Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white mt-2"
                    placeholder="Enter deployment name"
                  />
                  <p className="text-xs text-gray-400 mt-1">Deployment name</p>
                </div>

                <div>
                  <Label className="text-gray-300">Description</Label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="bg-gray-800/50 border-gray-600 text-white mt-2"
                    placeholder="Enter deployment description"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Brief description of the deployment
                  </p>
                </div>

                <div>
                  <Label className="text-gray-300">
                    Temperature: {temperature[0]}
                  </Label>
                  <Slider
                    value={temperature}
                    onValueChange={setTemperature}
                    max={1}
                    min={0}
                    step={0.1}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Controls randomness in responses
                  </p>
                </div>

                <div>
                  <Label className="text-gray-300">Max Token Limit</Label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="bg-gray-800/50 border-gray-600 text-white mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Maximum response length
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">
                  Rate Limit (requests/minute)
                </Label>
                <Input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="bg-gray-800/50 border-gray-600 text-white mt-2"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Maximum requests per minute
                </p>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <Label className="text-gray-300">System Prompt</Label>
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
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white mt-2 min-h-32"
                  placeholder="Enter system prompt for the model..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Instructions that guide the model's behavior
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white glow-cyan"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSettingsModal;
