
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, Sparkles } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useState } from 'react';
import LogAnalysisModal from './LogAnalysisModal';

interface LogsModalProps {
  model: any;
  onClose: () => void;
}

const LogsModal = ({ model, onClose }: LogsModalProps) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);

  const logs = [
    { timestamp: '2024-01-15 10:30:25', level: 'INFO', message: 'Model inference completed successfully' },
    { timestamp: '2024-01-15 10:29:18', level: 'DEBUG', message: 'Processing input tokens: 45' },
    { timestamp: '2024-01-15 10:29:15', level: 'INFO', message: 'New request received from client' },
    { timestamp: '2024-01-15 10:28:42', level: 'WARN', message: 'High memory usage detected: 85%' },
    { timestamp: '2024-01-15 10:27:33', level: 'INFO', message: 'Model warm-up completed' },
    { timestamp: '2024-01-15 10:25:11', level: 'ERROR', message: 'Timeout error in downstream service' },
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-400';
      case 'WARN': return 'text-yellow-400';
      case 'INFO': return 'text-blue-400';
      case 'DEBUG': return 'text-gray-400';
      default: return 'text-gray-300';
    }
  };

  const handleOpenNewTab = () => {
    const logData = logs.map(log => `${log.timestamp} [${log.level}] ${log.message}`).join('\n');
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    URL.revokeObjectURL(url);
    toast.success('Logs opened in new tab');
  };

  const handleDownloadLogs = () => {
    const logData = logs.map(log => `${log.timestamp} [${log.level}] ${log.message}`).join('\n');
    const blob = new Blob([logData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model.name}-logs-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Logs downloaded successfully');
  };

  const handleAnalyzeWithAI = () => {
    toast.info('Select a log entry to analyze with AI');
    setShowAnalysis(true);
  };

  const handleLogSelect = (log: any) => {
    if (showAnalysis) {
      setSelectedLog(log);
    }
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
    setSelectedLog(null);
  };

  const handleBackToLogs = () => {
    setSelectedLog(null);
  };

  if (selectedLog) {
    return (
      <LogAnalysisModal
        log={selectedLog}
        onClose={handleCloseAnalysis}
        onBack={handleBackToLogs}
      />
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-cyan-500/20 max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <span className="text-xl">{model.icon}</span>
              <span>Logs - {model.name}</span>
            </span>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleOpenNewTab}
                className="text-cyan-400 border-cyan-500/50 hover:bg-cyan-500/20"
              >
                <ExternalLink size={16} className="mr-2" />
                Open in New Tab
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadLogs}
                className="text-green-400 border-green-500/50 hover:bg-green-500/20"
              >
                <Download size={16} className="mr-2" />
                Download Logs
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {showAnalysis && (
            <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3">
              <p className="text-purple-300 text-sm">
                <Sparkles size={16} className="inline mr-2" />
                AI Analysis Mode: Click on any log entry to get detailed analysis
              </p>
            </div>
          )}
          
          <div className="h-96 overflow-y-auto space-y-2 p-4 bg-gray-900/50 rounded-lg font-mono text-sm">
            {logs.map((log, index) => (
              <div 
                key={index} 
                className={`flex space-x-4 p-2 rounded transition-all duration-200 ${
                  showAnalysis 
                    ? 'hover:bg-purple-800/30 cursor-pointer border-l-2 border-transparent hover:border-purple-500' 
                    : 'hover:bg-gray-800/30'
                }`}
                onClick={() => handleLogSelect(log)}
              >
                <span className="text-gray-500 whitespace-nowrap">{log.timestamp}</span>
                <span className={`font-semibold whitespace-nowrap ${getLevelColor(log.level)}`}>
                  [{log.level}]
                </span>
                <span className="text-gray-300">{log.message}</span>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center">
            <Button 
              onClick={handleAnalyzeWithAI}
              className="bg-purple-500 hover:bg-purple-600 text-white glow-cyan"
              disabled={showAnalysis}
            >
              <Sparkles size={16} className="mr-2" />
              {showAnalysis ? 'Analysis Mode Active' : 'Analyze with AI'}
            </Button>
            {showAnalysis && (
              <Button 
                variant="outline"
                onClick={() => setShowAnalysis(false)}
                className="text-gray-400 border-gray-500/50 hover:bg-gray-500/20"
              >
                Exit Analysis Mode
              </Button>
            )}
            <span className="text-gray-400 text-sm">
              Showing {logs.length} recent entries
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogsModal;
