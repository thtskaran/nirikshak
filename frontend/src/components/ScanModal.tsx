import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Edit, Import, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import CircularProgress from './CircularProgress';

interface ScanModalProps {
  model: any;
  onClose: () => void;
}

const ScanModal = ({ model, onClose }: ScanModalProps) => {
  const [scanComplete, setScanComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState('You are an expert AI assistant specialized in providing accurate, well-structured responses. Always verify information and provide sources when possible. Be concise yet comprehensive.');

  const startScan = () => {
    setIsScanning(true);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);
          toast.success('Scan completed successfully!');
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleDownloadLogs = () => {
    const logData = `Scan Report for ${model.name}\n\nPerformance: 87%\nSecurity: 73%\nOverall Status: Good\n\nDetailed analysis...`;
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name}-scan-logs.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Scan logs downloaded');
  };

  const handleDownloadReport = () => {
    toast.info('Generating PDF report...');
    setTimeout(() => {
      const reportData = `Scan Report for ${model.name} - Generated on ${new Date().toLocaleDateString()}`;
      const blob = new Blob([reportData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${model.name}-scan-report.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF report downloaded');
    }, 2000);
  };

  const handleEdit = () => {
    setIsEditingPrompt(true);
  };

  const handleSavePrompt = () => {
    setIsEditingPrompt(false);
    toast.success('Prompt updated successfully!');
  };

  const handleImport = () => {
    setIsImporting(true);
    const steps = [
      'Importing Changes...',
      'Redeploying...',
      'Propagating Changes...',
      'Success!'
    ];
    
    let currentStep = 0;
    const stepInterval = setInterval(() => {
      if (currentStep < steps.length) {
        setImportStep(steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(stepInterval);
        setTimeout(() => {
          setIsImporting(false);
          setImportStep('');
          toast.success('Changes imported and deployed successfully!');
        }, 1000);
      }
    }, 1500);
  };

  if (!scanComplete) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="glass-effect border-cyan-500/20 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center space-x-2">
              <span className="text-xl">{model.icon}</span>
              <span>Scan Results - {model.name}</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="glass-effect border-cyan-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Model Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Source:</span>
                    <span className="text-white">{model.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="text-green-400">{model.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Requests/Hour:</span>
                    <span className="text-cyan-400">{model.requests}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span className="text-green-400">{model.uptime}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-effect border-cyan-500/20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Scan Information</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Estimated Time:</span>
                    <div className="text-cyan-400 text-xl font-semibold">~3 minutes</div>
                  </div>
                  <div className="text-gray-300 text-sm">
                    This scan will analyze your model's performance, security vulnerabilities, 
                    and provide optimization suggestions.
                  </div>
                  
                  {isScanning && (
                    <div className="space-y-2">
                      <Progress value={scanProgress} className="w-full" />
                      <div className="text-center text-cyan-400">Scanning... {scanProgress}%</div>
                    </div>
                  )}
                  
                  <Button
                    onClick={startScan}
                    disabled={isScanning}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white glow-cyan"
                  >
                    {isScanning ? 'Scanning...' : 'Start Scan'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-cyan-500/20 max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="text-xl">{model.icon}</span>
              <span>Scan Results - {model.name}</span>
            </span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadLogs}
                className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20"
              >
                <Download size={16} className="mr-2" />
                Download Logs
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadReport}
                className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20"
              >
                <Download size={16} className="mr-2" />
                Download Report
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary with Circular Progress */}
          <Card className="glass-effect border-cyan-500/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <CheckCircle className="text-green-400 mr-2" size={20} />
                Scan Summary
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Overall Status:</span>
                  <span className="text-green-400 font-semibold">Good</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 my-6">
                  <div className="flex justify-center">
                    <CircularProgress 
                      percentage={87} 
                      color="#10B981"
                      label="Performance"
                      size={100}
                    />
                  </div>
                  <div className="flex justify-center">
                    <CircularProgress 
                      percentage={73} 
                      color="#F59E0B"
                      label="Security"
                      size={100}
                    />
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-green-400">
                    <CheckCircle size={16} className="mr-2" />
                    No critical vulnerabilities found
                  </div>
                  <div className="flex items-center text-yellow-400">
                    <AlertTriangle size={16} className="mr-2" />
                    2 optimization opportunities
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompts */}
          <Card className="glass-effect border-cyan-500/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Prompt Optimization</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Current Prompt:</h4>
                  <div className="bg-gray-800/50 p-3 rounded text-sm text-gray-300">
                    You are a helpful AI assistant. Answer questions accurately and concisely.
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-semibold text-gray-300 mb-2">Suggested Prompt:</h4>
                  {isEditingPrompt ? (
                    <Textarea
                      value={suggestedPrompt}
                      onChange={(e) => setSuggestedPrompt(e.target.value)}
                      className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-100 min-h-32"
                    />
                  ) : (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 p-3 rounded text-sm text-cyan-100">
                      {suggestedPrompt}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  {isEditingPrompt ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditingPrompt(false)}
                        className="text-gray-400 border-gray-500/50 hover:bg-gray-500/20"
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleSavePrompt}
                        size="sm" 
                        className="bg-cyan-500 hover:bg-cyan-600 text-white"
                      >
                        Save Changes
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleEdit}
                        className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20"
                      >
                        <Edit size={16} className="mr-2" />
                        Edit
                      </Button>
                      <Button 
                        onClick={handleImport}
                        disabled={isImporting}
                        size="sm" 
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Import size={16} className="mr-2" />
                        {isImporting ? importStep : 'Import Changes'}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanModal;
