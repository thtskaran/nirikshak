import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import DeploymentModal from '@/components/DeploymentModal';
import api2 from '@/lib/api2';
import { useNavigate } from 'react-router-dom';

interface Model {
  _id: string;
  name: string;
  provider: string;
  parameters: string;
  tags: string[];
  createdAt: string;
}

const DeployModels = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState('');
  const [deploymentError, setDeploymentError] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);
  const [models, setModels] = useState<Model[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [deploymentName, setDeploymentName] = useState('');
  const [deploymentDescription, setDeploymentDescription] = useState('');
  
  // Settings state - keep only relevant ones
  const [temperature, setTemperature] = useState([0.7]);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant...');

  const navigate = useNavigate();

  // Fetch models from API
  useEffect(() => {
    const fetchModels = async () => {
      try {
        setIsLoadingModels(true);
        const response = await api2.get('/api/v1/models');
        setModels(response.data);
      } catch (error) {
        console.error('Failed to fetch models:', error);
        toast.error('Failed to load models');
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
  }, []);

  const handleDeploy = async () => {
    if (!selectedModel) {
      toast.error('Please select a model to deploy');
      return;
    }

    if (!deploymentName.trim()) {
      toast.error('Please enter a deployment name');
      return;
    }

    setIsDeploying(true);
    setDeploymentError(false);
    setDeploymentSuccess(false);

    // Realistic deployment steps
    const deploymentSteps = [
      'Initializing deployment process...',
      'Connecting to Docker daemon...',
      'Pulling official Ollama image...',
      'Creating secure container environment...',
      'Downloading model files...',
      'Configuring model parameters...',
      'Starting container instance...',
      'Provisioning resources...',
      'Verifying deployment health...',
      'Finalizing configuration...'
    ];

    try {
      const deploymentData = {
        modelId: selectedModel,
        name: deploymentName,
        description: deploymentDescription,
        systemPrompt: systemPrompt,
        temperature: temperature[0]
      };

      // Simulate step-by-step deployment
      for (let i = 0; i < deploymentSteps.length; i++) {
        setDeploymentStep(deploymentSteps[i]);
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      }

      setDeploymentStep('Creating deployment...');
      const response = await api2.post('/api/v1/deployments', deploymentData);
      
      setDeploymentStep('Deployment Successful!');
      setDeploymentSuccess(true);
      toast.success(`Model deployed successfully! Container: ${response.data.containerName}`);
      
      setTimeout(() => {
        setIsDeploying(false);
        setDeploymentSuccess(false);
        setDeploymentStep('');
        navigate('/deployed-models'); // Navigate to deployed models page
      }, 2000);
    } catch (error: any) {
      console.error('Deployment failed:', error);
      setIsDeploying(false);
      setDeploymentStep('');
      setDeploymentError(true);
      toast.error(error.response?.data?.message || 'Deployment failed');
    }
  };

  const handleRedeploy = () => {
    setDeploymentError(false);
    setShowErrorDetails(false);
    handleDeploy();
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Deploy Models</h1>
        <p className="text-gray-400">Configure and deploy your AI models from Ollama</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model Selection */}
        <Card className="glass-effect border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Choose Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-300">Select Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel} disabled={isLoadingModels}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white mt-2">
                  <SelectValue placeholder={isLoadingModels ? "Loading models..." : "Choose a model..."} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {models.map((model) => (
                    <SelectItem key={model._id} value={model._id} className="text-white">
                      {model.name} ({model.parameters}) - {model.provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-gray-300">Deployment Name</Label>
              <Input
                value={deploymentName}
                onChange={(e) => setDeploymentName(e.target.value)}
                placeholder="Enter deployment name..."
                className="bg-gray-800/50 border-gray-600 text-white mt-2"
              />
            </div>

            <div>
              <Label className="text-gray-300">Description (Optional)</Label>
              <Textarea
                value={deploymentDescription}
                onChange={(e) => setDeploymentDescription(e.target.value)}
                placeholder="Describe the purpose of this deployment..."
                className="bg-gray-800/50 border-gray-600 text-white mt-2"
              />
            </div>
            
            <Button 
              onClick={handleDeploy}
              disabled={isDeploying || !selectedModel || isLoadingModels}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white glow-cyan"
            >
              {isLoadingModels ? 'Loading Models...' : 'Deploy Model'}
            </Button>

            {/* Error Section */}
            {deploymentError && (
              <div className="mt-6 space-y-4">
                <Collapsible open={showErrorDetails} onOpenChange={setShowErrorDetails}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle size={20} />
                      <span>Deployment Error Details</span>
                    </div>
                    {showErrorDetails ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-4 bg-gray-900/50 border border-red-500/20 rounded-lg">
                    <div className="text-sm text-gray-300 font-mono">
                      <div className="text-red-400">Error: Container build failed</div>
                      <div className="text-gray-400 mt-2">
                        - Memory allocation exceeded<br/>
                        - Invalid system prompt configuration<br/>
                        - Network timeout during model download
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={handleRedeploy}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white"
                  >
                    Redeploy
                  </Button>
                  <Button
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                  >
                    View System Prompt Issue
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card className="glass-effect border-cyan-500/20">
          <CardHeader>
            <CardTitle className="text-white">Configuration Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-300">Temperature: {temperature[0]}</Label>
              <p className="text-sm text-gray-400 mb-2">Controls randomness in responses (0.0 = deterministic, 1.0 = very creative)</p>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">System Prompt</Label>
              <p className="text-sm text-gray-400 mb-2">Define the AI's behavior and personality</p>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white mt-2 min-h-32"
                placeholder="You are a helpful AI assistant..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

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



export default DeployModels;
