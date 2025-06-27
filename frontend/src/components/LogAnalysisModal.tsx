
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

interface LogAnalysisModalProps {
  log: {
    timestamp: string;
    level: string;
    message: string;
  } | null;
  onClose: () => void;
  onBack: () => void;
}

const LogAnalysisModal = ({ log, onClose, onBack }: LogAnalysisModalProps) => {
  if (!log) return null;

  const getAnalysisData = (logLevel: string, message: string) => {
    switch (logLevel) {
      case 'ERROR':
        return {
          severity: 'High',
          impact: 'Service Disruption',
          recommendation: 'Immediate action required. Check downstream service connectivity and implement retry mechanism.',
          details: 'This error indicates a timeout in the downstream service which can cause request failures and impact user experience.',
          icon: <XCircle className="text-red-400" size={24} />,
          color: 'border-red-500/50 bg-red-500/10'
        };
      case 'WARN':
        return {
          severity: 'Medium',
          impact: 'Performance Degradation',
          recommendation: 'Monitor memory usage closely. Consider scaling up resources or optimizing memory-intensive operations.',
          details: 'High memory usage detected. This could lead to slower response times and potential service instability if left unchecked.',
          icon: <AlertTriangle className="text-yellow-400" size={24} />,
          color: 'border-yellow-500/50 bg-yellow-500/10'
        };
      case 'INFO':
        return {
          severity: 'Low',
          impact: 'Normal Operation',
          recommendation: 'No action required. This indicates normal system operation and successful request processing.',
          details: 'Standard operational log indicating successful completion of model inference or system initialization.',
          icon: <CheckCircle className="text-green-400" size={24} />,
          color: 'border-green-500/50 bg-green-500/10'
        };
      default:
        return {
          severity: 'Low',
          impact: 'Debug Information',
          recommendation: 'Debug information for development purposes. Monitor for patterns that might indicate issues.',
          details: 'Detailed debug information useful for troubleshooting and understanding system behavior.',
          icon: <Info className="text-blue-400" size={24} />,
          color: 'border-blue-500/50 bg-blue-500/10'
        };
    }
  };

  const analysis = getAnalysisData(log.level, log.message);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-cyan-500/20 max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="text-cyan-400 hover:bg-cyan-500/20"
              >
                <ArrowLeft size={16} />
              </Button>
              <span>AI Log Analysis</span>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Log Entry */}
          <div className={`p-4 rounded-lg border ${analysis.color}`}>
            <div className="flex items-start space-x-3">
              {analysis.icon}
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Badge variant="outline" className={`text-${log.level === 'ERROR' ? 'red' : log.level === 'WARN' ? 'yellow' : log.level === 'INFO' ? 'blue' : 'gray'}-400`}>
                    {log.level}
                  </Badge>
                  <span className="text-gray-400 text-sm">{log.timestamp}</span>
                </div>
                <p className="text-white font-mono text-sm">{log.message}</p>
              </div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="glass-effect p-4 rounded-lg">
                <h3 className="text-cyan-400 font-semibold mb-2">Severity Level</h3>
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant="outline" 
                    className={`${analysis.severity === 'High' ? 'text-red-400 border-red-500/50' : 
                      analysis.severity === 'Medium' ? 'text-yellow-400 border-yellow-500/50' : 
                      'text-green-400 border-green-500/50'}`}
                  >
                    {analysis.severity}
                  </Badge>
                </div>
              </div>

              <div className="glass-effect p-4 rounded-lg">
                <h3 className="text-cyan-400 font-semibold mb-2">Potential Impact</h3>
                <p className="text-gray-300 text-sm">{analysis.impact}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="glass-effect p-4 rounded-lg">
                <h3 className="text-cyan-400 font-semibold mb-2">Detailed Analysis</h3>
                <p className="text-gray-300 text-sm">{analysis.details}</p>
              </div>

              <div className="glass-effect p-4 rounded-lg">
                <h3 className="text-cyan-400 font-semibold mb-2">AI Recommendation</h3>
                <p className="text-gray-300 text-sm">{analysis.recommendation}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onBack}
              className="text-gray-400 border-gray-500/50 hover:bg-gray-500/20"
            >
              Back to Logs
            </Button>
            <Button
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
              onClick={onClose}
            >
              Close Analysis
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LogAnalysisModal;
