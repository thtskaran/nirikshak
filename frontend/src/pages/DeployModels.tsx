
import { useState } from 'react';
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

const DeployModels = () => {
  const [selectedModel, setSelectedModel] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState('');
  const [deploymentError, setDeploymentError] = useState(false);
  const [deploymentSuccess, setDeploymentSuccess] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const [showAdditionalSettings, setShowAdditionalSettings] = useState(false);
  
  // Settings state
  const [temperature, setTemperature] = useState([0.7]);
  const [topP, setTopP] = useState([0.9]);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant...');

  const ollamaModels = [
    { id: 'llama2', name: 'Llama 2 7B' },
    { id: 'mistral', name: 'Mistral 7B' },
    { id: 'codellama', name: 'Code Llama 7B' },
    { id: 'neural-chat', name: 'Neural Chat 7B' },
    { id: 'orca-mini', name: 'Orca Mini 3B' },
    { id: 'vicuna', name: 'Vicuna 7B' },
  ];

  const handleDeploy = () => {
    if (!selectedModel) {
      toast.error('Please select a model to deploy');
      return;
    }

    setIsDeploying(true);
    setDeploymentError(false);
    setDeploymentSuccess(false);
    const steps = [
      'Uploading Model...',
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
            setDeploymentStep('');
          }, 2000);
        } else {
          setIsDeploying(false);
          setDeploymentStep('');
          setDeploymentError(true);
          toast.error('Deployment failed. Please check the error details.');
        }
      }
    }, 1500);
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
            <CardTitle className="text-white">Choose Model from Ollama</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-300">Select Ollama Model</Label>
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white mt-2">
                  <SelectValue placeholder="Choose a model..." />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {ollamaModels.map((model) => (
                    <SelectItem key={model.id} value={model.id} className="text-white">
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={handleDeploy}
              disabled={isDeploying || !selectedModel}
              className="w-full bg-cyan-500 hover:bg-cyan-600 text-white glow-cyan"
            >
              Deploy Model
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
            <CardTitle className="text-white">Additional Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-gray-300">Temperature: {temperature[0]}</Label>
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
              <Label className="text-gray-300">Top P: {topP[0]}</Label>
              <Slider
                value={topP}
                onValueChange={setTopP}
                max={1}
                min={0}
                step={0.1}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Top K</Label>
              <Input
                type="number"
                value={topK}
                onChange={(e) => setTopK(Number(e.target.value))}
                className="bg-gray-800/50 border-gray-600 text-white mt-2"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">Max Token Limit</Label>
              <Input
                type="number"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="bg-gray-800/50 border-gray-600 text-white mt-2"
              />
            </div>
            
            <div>
              <Label className="text-gray-300">System Prompt</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="bg-gray-800/50 border-gray-600 text-white mt-2 min-h-32"
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
