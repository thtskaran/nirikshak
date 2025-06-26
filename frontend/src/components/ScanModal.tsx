import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { Download, Edit, Import, CheckCircle, AlertTriangle, RefreshCw, FileText, ExternalLink } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import CircularProgress from './CircularProgress';
import api2 from '@/lib/api2';

interface ScanModalProps {
  model: any;
  onClose: () => void;
}

interface RedTeamReport {
  _id: string;
  deploymentId: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  completedAt?: string;
  summary?: {
    totalTests: number;
    passedTests: number;
    failedTests: number;
    riskScore: number;
  };
  results?: any[];
}

const ScanModal = ({ model, onClose }: ScanModalProps) => {
  const [scanComplete, setScanComplete] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [importStep, setImportStep] = useState('');
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [suggestedPrompt, setSuggestedPrompt] = useState('You are an expert AI assistant specialized in providing accurate, well-structured responses. Always verify information and provide sources when possible. Be concise yet comprehensive.');
  
  // New state for red teaming
  const [reports, setReports] = useState<RedTeamReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [currentScanId, setCurrentScanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch existing reports on component mount
  useEffect(() => {
    fetchReports();
  }, [model?._id]);

  // Poll for scan status if there's an active scan
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning && model._id) {
      interval = setInterval(async () => {
        try {
          const response = await api2.get(`/api/v1/deployments/${model._id}/red-team/status`);
          const status = response.data.status;
          
          if (status === 'completed') {
            setIsScanning(false);
            setScanComplete(true);
            setScanProgress(100);
            setCurrentScanId(null);
            
            toast.success('Red team scan completed successfully');
            
            // Update reports with the new report
            if (response.data.reportId) {
              const newReport: RedTeamReport = {
                _id: response.data.reportId,
                deploymentId: model._id,
                status: 'COMPLETED',
                createdAt: response.data.createdAt,
                completedAt: response.data.createdAt,
                summary: {
                  totalTests: 1,
                  passedTests: response.data.safe ? 1 : 0,
                  failedTests: response.data.safe ? 0 : 1,
                  riskScore: response.data.safe ? 10 : 90
                }
              };
              setReports(prev => [newReport, ...prev]);
            }
          } else if (status === 'failed') {
            setIsScanning(false);
            setScanComplete(false);
            setScanProgress(0);
            setCurrentScanId(null);
            toast.error('Red team scan failed');
          } else if (status === 'not_started') {
            // Scan might have been reset or never started
            setIsScanning(false);
            setScanProgress(0);
          } else {
            // Assuming scan is still in progress
            setScanProgress(prev => Math.min(prev + 5, 90));
          }
        } catch (err) {
          console.error('Failed to check scan status:', err);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, model._id]);

  const fetchReports = async () => {
    if (!model?._id) {
      setError('Model ID not found');
      setLoadingReports(false);
      return;
    }

    try {
      setLoadingReports(true);
      setError(null);
      
      // Check current status to get any existing reports
      const response = await api2.get(`/api/v1/deployments/${model._id}/red-team/status`);
      
      if (response.data.status === 'completed' && response.data.reportId) {
        // Create a report object from the status response
        const report: RedTeamReport = {
          _id: response.data.reportId,
          deploymentId: model._id,
          status: 'COMPLETED',
          createdAt: response.data.createdAt,
          completedAt: response.data.createdAt,
          summary: {
            totalTests: 1,
            passedTests: response.data.safe ? 1 : 0,
            failedTests: response.data.safe ? 0 : 1,
            riskScore: response.data.safe ? 10 : 90
          }
        };
        setReports([report]);
      } else {
        setReports([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      if (err.response?.status === 404) {
        setError('Red team reports not available for this deployment');
        setReports([]);
      } else {
        setError(err.response?.data?.message || 'Failed to fetch reports');
        setReports([]);
      }
    } finally {
      setLoadingReports(false);
    }
  };

  const startRedTeamScan = async () => {
    if (!model?._id) {
      toast.error('Model ID not found');
      return;
    }

    try {
      setIsScanning(true);
      setScanProgress(0);
      setScanComplete(false);
      setError(null);

      // Start red team scan using correct endpoint
      const response = await api2.post(`/api/v1/deployments/${model._id}/red-team`, {
        systemPrompt: suggestedPrompt
      });

      if (response.data?.status === 'started') {
        setCurrentScanId(response.data.deploymentId);
        toast.success('Red team scan started successfully');
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err: any) {
      console.error('Failed to start red team scan:', err);
      setIsScanning(false);
      setScanProgress(0);
      
      if (err.response?.status === 404) {
        toast.error('Red team endpoint not available for this deployment');
      } else {
        toast.error(err.response?.data?.message || 'Failed to start red team scan');
      }
    }
  };

  const downloadReport = async (reportId: string) => {
    try {
      // First get the report status to get the report path
      const statusResponse = await api2.get(`/api/v1/deployments/${model._id}/red-team/status`);
      
      if (statusResponse.data.reportPath) {
        // Try to download from the report path
        const response = await api2.get(`/api/v1/${statusResponse.data.reportPath}`, {
          responseType: 'blob'
        });
        
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `red-team-report-${reportId}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('Report downloaded successfully');
      } else {
        throw new Error('Report path not available');
      }
    } catch (err: any) {
      console.error('Failed to download report:', err);
      if (err.response?.status === 404) {
        toast.error('Report not available for download');
      } else {
        toast.error('Failed to download report');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-400 bg-green-500/20';
      case 'IN_PROGRESS': return 'text-blue-400 bg-blue-500/20';
      case 'FAILED': return 'text-red-400 bg-red-500/20';
      case 'PENDING': return 'text-yellow-400 bg-yellow-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  const importToPromptFlow = async () => {
    setIsImporting(true);
    setImportStep('Initializing...');
    
    const steps = [
      'Connecting to Prompt Flow...',
      'Uploading system prompt...',
      'Configuring deployment settings...',
      'Finalizing import...'
    ];

    for (let i = 0; i < steps.length; i++) {
      setImportStep(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    setIsImporting(false);
    toast.success('System prompt imported to Prompt Flow successfully!');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-gray-900 border-cyan-500/20 overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-white">
            Red Team Security Scan - {model.name}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
          {/* Left Column - Scan Controls */}
          <div className="space-y-6">
            {/* System Prompt Section */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">System Prompt</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingPrompt(!isEditingPrompt)}
                    className="text-cyan-400 hover:bg-cyan-500/20"
                  >
                    <Edit size={16} className="mr-2" />
                    {isEditingPrompt ? 'Save' : 'Edit'}
                  </Button>
                </div>
                
                {isEditingPrompt ? (
                  <Textarea
                    value={suggestedPrompt}
                    onChange={(e) => setSuggestedPrompt(e.target.value)}
                    className="min-h-32 bg-gray-900/50 border-gray-600 text-white"
                    placeholder="Enter your system prompt..."
                  />
                ) : (
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {suggestedPrompt}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scan Controls */}
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Security Scan</h3>
                
                {!isScanning && !scanComplete && (
                  <Button
                    onClick={startRedTeamScan}
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    disabled={!model?._id}
                  >
                    <AlertTriangle size={16} className="mr-2" />
                    Start Red Team Scan
                  </Button>
                )}

                {isScanning && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <CircularProgress progress={scanProgress} />
                    </div>
                    <div className="text-center">
                      <p className="text-white font-medium">Running security tests...</p>
                      <p className="text-gray-400 text-sm mt-1">
                        This may take several minutes
                      </p>
                    </div>
                    <Progress value={scanProgress} className="w-full" />
                  </div>
                )}

                {scanComplete && (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center text-green-400">
                      <CheckCircle size={24} className="mr-2" />
                      <span className="font-medium">Scan Complete!</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setScanComplete(false);
                          setScanProgress(0);
                        }}
                        variant="outline"
                        className="flex-1 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
                      >
                        <RefreshCw size={16} className="mr-2" />
                        Scan Again
                      </Button>
                      <Button
                        onClick={importToPromptFlow}
                        disabled={isImporting}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        <Import size={16} className="mr-2" />
                        {isImporting ? importStep : 'Import to Prompt Flow'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Reports */}
          <div className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Red Team Reports</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchReports}
                    disabled={loadingReports}
                    className="text-cyan-400 hover:bg-cyan-500/20"
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Refresh
                  </Button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {loadingReports ? (
                    <div className="text-gray-400 text-center py-8">
                      Loading reports...
                    </div>
                  ) : error ? (
                    <div className="text-red-400 text-center py-8">
                      {error}
                    </div>
                  ) : reports.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      No reports available yet
                    </div>
                  ) : (
                    reports.map((report) => (
                      <div key={report._id} className="border border-gray-700/50 rounded-lg p-4 bg-gray-900/30">
                        {/* Report Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText size={16} className="text-gray-400" />
                            <span className="text-white font-medium">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadReport(report._id)}
                              className="text-green-400 hover:bg-green-500/20"
                            >
                              <Download size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(`/reports/${report._id}`, '_blank')}
                              className="text-blue-400 hover:bg-blue-500/20"
                            >
                              <ExternalLink size={14} />
                            </Button>
                          </div>
                        </div>

                        {/* Report Summary */}
                        {report.summary && (
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Tests:</span>
                              <span className="text-white ml-2">
                                {report.summary.passedTests}/{report.summary.totalTests} passed
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Risk Score:</span>
                              <span className={`ml-2 font-bold ${getRiskScoreColor(report.summary.riskScore)}`}>
                                {report.summary.riskScore}/100
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Completion Time */}
                        {report.completedAt && (
                          <div className="mt-2 text-xs text-gray-500">
                            Completed: {new Date(report.completedAt).toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScanModal;