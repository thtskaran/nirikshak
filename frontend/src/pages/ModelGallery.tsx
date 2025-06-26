import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Star, Download, Users } from 'lucide-react';
import DeploymentModal from '@/components/DeploymentModal';
import { toast } from '@/components/ui/sonner';

const ModelGallery = () => {
  const [selectedModel, setSelectedModel] = useState<any>(null);
  const [showDeployModal, setShowDeployModal] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState('');
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [deploymentError, setDeploymentError] = useState(false);

  const models = [
    {
      id: 1,
      name: 'GPT-4',
      source: 'OpenAI',
      icon: '🧠',
      description: 'Most capable GPT model with improved reasoning',
      rating: 4.9,
      downloads: '1.2M',
      tags: ['Text Generation', 'Reasoning', 'Code'],
      defaultPrompt: 'You are GPT-4, a helpful AI assistant created by OpenAI.'
    },
    {
      id: 2,
      name: 'Claude-3 Sonnet',
      source: 'Anthropic',
      icon: '🎭',
      description: 'Balanced model with strong reasoning capabilities',
      rating: 4.8,
      downloads: '850K',
      tags: ['Reasoning', 'Analysis', 'Writing'],
      defaultPrompt: 'You are Claude, an AI assistant created by Anthropic.'
    },
    {
      id: 3,
      name: 'Llama 2 70B',
      source: 'Hugging Face',
      icon: '🦙',
      description: 'Open-source large language model by Meta',
      rating: 4.7,
      downloads: '2.1M',
      tags: ['Open Source', 'Text Generation', 'Chat'],
      defaultPrompt: 'You are Llama 2, a helpful, respectful and honest assistant.'
    },
    {
      id: 4,
      name: 'Mistral 7B Instruct',
      source: 'Hugging Face',
      icon: '🌪️',
      description: 'Efficient instruction-following model',
      rating: 4.6,
      downloads: '1.8M',
      tags: ['Instruction Following', 'Efficient', 'Multilingual'],
      defaultPrompt: 'You are Mistral 7B, an AI assistant designed to follow instructions carefully.'
    },
    {
      id: 5,
      name: 'CodeLlama 34B',
      source: 'Hugging Face',
      icon: '💻',
      description: 'Specialized model for code generation and understanding',
      rating: 4.8,
      downloads: '950K',
      tags: ['Code Generation', 'Programming', 'Debug'],
      defaultPrompt: 'You are CodeLlama, an AI coding assistant. Help users with programming tasks.'
    },
    {
      id: 6,
      name: 'DALL-E 3',
      source: 'OpenAI',
      icon: '🎨',
      description: 'Advanced image generation model',
      rating: 4.9,
      downloads: '750K',
      tags: ['Image Generation', 'Art', 'Creative'],
      defaultPrompt: 'Generate detailed, creative images based on text descriptions.'
    }
  ];

  const openDeployModal = (model: any) => {
    setSelectedModel(model);
    setCustomPrompt(model.defaultPrompt);
    setShowDeployModal(true);
  };

  const handleDeploy = () => {
    setShowDeployModal(false);
    setIsDeploying(true);
    setDeploymentSuccess(false);
    setDeploymentError(false);
    
    const steps = [
      'Deploying Model with New System Prompt...',
      'Building Secure Container...',
      'Deployment in Progress...'
    ];
    
    let currentStep = 0;
    
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setDeploymentStep(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
        
        // Simulate random success/failure
        const isSuccess = Math.random() > 0.3;
        
        if (isSuccess) {
          setDeploymentStep('Deployment Successful!');
          setDeploymentSuccess(true);
          toast.success('Model deployed successfully!');
          setTimeout(() => {
            setIsDeploying(false);
            setDeploymentSuccess(false);
            setSelectedModel(null);
          }, 2000);
        } else {
          setIsDeploying(false);
          setDeploymentError(true);
          toast.error('Deployment failed. Please try again.');
        }
      }
    }, 1500);
  };

  const generatePromptSuggestion = () => {
    const suggestions = [
      'You are an expert assistant specialized in providing detailed, accurate responses with clear explanations.',
      'You are a helpful AI that thinks step-by-step and provides well-structured answers.',
      'You are a professional consultant who provides actionable insights and recommendations.',
    ];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    setCustomPrompt(randomSuggestion);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Model Gallery</h1>
        <p className="text-gray-400">Discover and deploy pre-trained models</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {models.map((model) => (
          <Card key={model.id} className="glass-effect border-cyan-500/20 hover:glow-cyan transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{model.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{model.name}</h3>
                    <p className="text-sm text-cyan-400">{model.source}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-yellow-400">
                  <Star size={16} fill="currentColor" />
                  <span className="text-sm">{model.rating}</span>
                </div>
              </div>

              <p className="text-gray-300 text-sm mb-4">{model.description}</p>

              <div className="flex items-center space-x-4 mb-4 text-sm text-gray-400">
                <div className="flex items-center space-x-1">
                  <Download size={14} />
                  <span>{model.downloads}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {model.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-gray-700 text-gray-300">
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
                <span className="text-2xl">{selectedModel.icon}</span>
                <span>Deploy {selectedModel.name}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <Card className="glass-effect border-cyan-500/20">
                <CardContent className="p-4">
                  <h4 className="text-white font-semibold mb-2">Model Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Source:</span>
                      <div className="text-cyan-400">{selectedModel.source}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Rating:</span>
                      <div className="text-yellow-400 flex items-center space-x-1">
                        <Star size={14} fill="currentColor" />
                        <span>{selectedModel.rating}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Downloads:</span>
                      <div className="text-green-400">{selectedModel.downloads}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-semibold">System Prompt</h4>
                  <Button
                    onClick={generatePromptSuggestion}
                    variant="outline"
                    size="sm"
                    className="text-purple-400 border-purple-500/50 hover:bg-purple-500/20"
                  >
                    <Sparkles size={16} className="mr-2" />
                    AI Suggestion
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
