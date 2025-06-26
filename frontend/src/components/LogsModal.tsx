import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, Download, Sparkles, ChevronDown, ChevronRight } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useState, useEffect } from 'react';
import LogAnalysisModal from './LogAnalysisModal';
import api2 from '@/lib/api2';

interface LogsModalProps {
  model: any;
  onClose: () => void;
}

interface LogEntry {
  _id: string;
  deploymentId: string;
  requestSample: string;
  responseSample: string;
  sCode?: string;
  timestamp: string;
  verdict: 'SAFE' | 'UNSAFE';
}

const LogsModal = ({ model, onClose }: LogsModalProps) => {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchLogs = async () => {
      if (!model?._id) {
        setError('Model ID not found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Use the correct logs endpoint
        const response = await api2.get(`/api/v1/logs/${model._id}`);
        
        if (response.data && Array.isArray(response.data.logs)) {
          setLogs(response.data.logs);
        } else if (response.data && Array.isArray(response.data)) {
          setLogs(response.data);
        } else {
          setLogs([]);
        }
      } catch (err: any) {
        console.error('Failed to fetch logs:', err);
        if (err.response?.status === 404) {
          setError('Logs endpoint not available for this deployment');
          // Set some mock data to show the UI works
          setLogs([
            { 
              timestamp: new Date().toISOString(), 
              level: 'INFO', 
              message: 'Logs endpoint not yet implemented on server',
              source: 'frontend'
            }
          ]);
        } else {
          setError(err.response?.data?.message || 'Failed to fetch logs');
          setLogs([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [model?._id]);

  const getVerdictColor = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case 'SAFE': return 'text-green-400 bg-green-500/20';
      case 'UNSAFE': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const toggleLogExpansion = (logId: string) => {
    const newExpanded = new Set(expandedLogs);
    if (newExpanded.has(logId)) {
      newExpanded.delete(logId);
    } else {
      newExpanded.add(logId);
    }
    setExpandedLogs(newExpanded);
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const downloadLogs = async () => {
    try {
      // Try the download endpoint with correct path
      let response;
      try {
        response = await api2.get(`/api/v1/logs/${model._id}/download`, {
          responseType: 'blob'
        });
      } catch (downloadErr: any) {
        if (downloadErr.response?.status === 404) {
          // Fallback: create a text file from current logs
          const logText = logs.map(log => 
            `[${log.timestamp}] ${log.level}: ${log.message}${log.source ? ` (Source: ${log.source})` : ''}`
          ).join('\n');
          
          const blob = new Blob([logText], { type: 'text/plain' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${model.name}-logs-${new Date().toISOString().split('T')[0]}.txt`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          toast.success('Logs downloaded successfully');
          return;
        }
        throw downloadErr;
      }
      
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${model.name}-logs-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Logs downloaded successfully');
    } catch (err) {
      console.error('Failed to download logs:', err);
      toast.error('Failed to download logs');
    }
  };

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] bg-gray-900 border-cyan-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <span>Logs - {model.name}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalysis(true)}
                className="ml-auto border-purple-500/50 text-purple-400 hover:bg-purple-500/20"
              >
                <Sparkles size={16} className="mr-2" />
                AI Analysis
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadLogs}
                disabled={loading || logs.length === 0}
                className="border-green-500/50 text-green-400 hover:bg-green-500/20"
              >
                <Download size={16} className="mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`/logs/${model._id}`, '_blank')}
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
              >
                <ExternalLink size={16} className="mr-2" />
                View Full Logs
              </Button>
            </div>

            {/* Logs Content */}
            <div className="bg-black/40 rounded-lg p-4 max-h-96 overflow-y-auto font-mono text-sm">
              {loading ? (
                <div className="text-gray-400 text-center py-8">
                  Loading logs...
                </div>
              ) : error ? (
                <div className="text-red-400 text-center py-8">
                  Error: {error}
                </div>
              ) : logs.length === 0 ? (
                <div className="text-gray-400 text-center py-8">
                  No logs available for this deployment
                </div>
              ) : (
                <div className="space-y-3">
                  {logs.map((log, index) => {
                    const isExpanded = expandedLogs.has(log._id);
                    return (
                      <div key={log._id || index} className="border border-gray-700/30 rounded-lg p-3 bg-gray-800/20">
                        {/* Header */}
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleLogExpansion(log._id)}>
                          {isExpanded ? (
                            <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />
                          ) : (
                            <ChevronRight size={16} className="text-gray-400 flex-shrink-0" />
                          )}
                          <span className="text-gray-500 text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                          <span className={`font-semibold text-xs px-2 py-1 rounded ${getVerdictColor(log.verdict)}`}>
                            {log.verdict || 'UNKNOWN'}
                          </span>
                          {log.sCode && (
                            <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                              {log.sCode}
                            </span>
                          )}
                          <span className="text-gray-400 text-xs flex-1 truncate">
                            Request: {truncateText(log.requestSample || 'No request data', 50)}
                          </span>
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-3 space-y-3 border-t border-gray-700/30 pt-3">
                            {/* Request */}
                            <div>
                              <div className="text-blue-400 text-xs font-semibold mb-1">REQUEST:</div>
                              <div className="text-gray-300 text-sm bg-gray-900/50 p-2 rounded border-l-2 border-blue-500/50">
                                {log.requestSample || 'No request data'}
                              </div>
                            </div>

                            {/* Response */}
                            <div>
                              <div className="text-green-400 text-xs font-semibold mb-1">RESPONSE:</div>
                              <div className="text-gray-300 text-sm bg-gray-900/50 p-2 rounded border-l-2 border-green-500/50 max-h-40 overflow-y-auto">
                                <pre className="whitespace-pre-wrap font-sans">
                                  {log.responseSample || 'No response data'}
                                </pre>
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-gray-500">Log ID:</span>
                                <span className="text-gray-300 ml-2 font-mono">{log._id}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Deployment ID:</span>
                                <span className="text-gray-300 ml-2 font-mono">{log.deploymentId}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Log Statistics */}
            {!loading && !error && logs.length > 0 && (
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{logs.length}</div>
                  <div className="text-sm text-gray-400">Total Logs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">
                    {logs.filter(log => log.verdict?.toUpperCase() === 'UNSAFE').length}
                  </div>
                  <div className="text-sm text-gray-400">Unsafe</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {logs.filter(log => log.verdict?.toUpperCase() === 'SAFE').length}
                  </div>
                  <div className="text-sm text-gray-400">Safe</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-400">
                    {logs.filter(log => log.sCode).length}
                  </div>
                  <div className="text-sm text-gray-400">With S-Code</div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {showAnalysis && (
        <LogAnalysisModal
          logs={logs}
          model={model}
          onClose={() => setShowAnalysis(false)}
        />
      )}
    </>
  );
};

export default LogsModal;
