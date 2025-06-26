
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/sonner';

interface ModelSettingsModalProps {
  model: any;
  onClose: () => void;
}

const ModelSettingsModal = ({ model, onClose }: ModelSettingsModalProps) => {
  const [temperature, setTemperature] = useState([0.7]);
  const [topP, setTopP] = useState([0.9]);
  const [topK, setTopK] = useState(40);
  const [maxTokens, setMaxTokens] = useState(2048);
  const [rateLimit, setRateLimit] = useState(100);
  const [systemPrompt, setSystemPrompt] = useState('You are a helpful AI assistant...');

  const handleSave = () => {
    toast.success('Model settings updated successfully!');
    console.log('Saving settings:', {
      temperature: temperature[0],
      topP: topP[0],
      topK,
      maxTokens,
      rateLimit,
      systemPrompt
    });
    onClose();
  };

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
            <CardHeader>
              <CardTitle className="text-white text-lg">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="text-xs text-gray-400 mt-1">Controls randomness in responses</p>
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
                  <p className="text-xs text-gray-400 mt-1">Nucleus sampling parameter</p>
                </div>
                
                <div>
                  <Label className="text-gray-300">Top K</Label>
                  <Input
                    type="number"
                    value={topK}
                    onChange={(e) => setTopK(Number(e.target.value))}
                    className="bg-gray-800/50 border-gray-600 text-white mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">Limits token choices to top K</p>
                </div>
                
                <div>
                  <Label className="text-gray-300">Max Token Limit</Label>
                  <Input
                    type="number"
                    value={maxTokens}
                    onChange={(e) => setMaxTokens(Number(e.target.value))}
                    className="bg-gray-800/50 border-gray-600 text-white mt-2"
                  />
                  <p className="text-xs text-gray-400 mt-1">Maximum response length</p>
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300">Rate Limit (requests/minute)</Label>
                <Input
                  type="number"
                  value={rateLimit}
                  onChange={(e) => setRateLimit(Number(e.target.value))}
                  className="bg-gray-800/50 border-gray-600 text-white mt-2"
                />
                <p className="text-xs text-gray-400 mt-1">Maximum requests per minute</p>
              </div>
              
              <div>
                <Label className="text-gray-300">System Prompt</Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  className="bg-gray-800/50 border-gray-600 text-white mt-2 min-h-32"
                  placeholder="Enter system prompt for the model..."
                />
                <p className="text-xs text-gray-400 mt-1">Instructions that guide the model's behavior</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white glow-cyan"
            >
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModelSettingsModal;
