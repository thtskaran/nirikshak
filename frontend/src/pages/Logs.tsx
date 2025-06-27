import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';
import api2 from '@/lib/api2';

type Deployment = {
  _id: string;
  name: string;
  status: string;
  createdAt: string;
  description?: string;
  systemPrompt?: string;
  temperature?: number;
  endpoint?: string;
  containerName?: string;
  containerId?: string;
  modelId?: string;
  // ...other fields...
};

type LogEntry = {
  _id: string;
  deploymentId: string;
  requestSample: string;
  responseSample: string;
  verdict: 'SAFE' | 'UNSAFE' | string;
  sCode?: string | null;
  createdAt: string;
  // Attach all relevant deployment fields for display
  deploymentName?: string;
  deploymentStatus?: string;
  deploymentCreatedAt?: string;
  deploymentDescription?: string;
  deploymentSystemPrompt?: string;
  deploymentTemperature?: number;
  deploymentEndpoint?: string;
  deploymentContainerName?: string;
  deploymentContainerId?: string;
  deploymentModelId?: string;
};

const Logs = () => {
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch deployments and logs
  useEffect(() => {
    const fetchAllLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const deploymentsRes = await api2.get('/api/v1/deployments');
        const deployments: Deployment[] = deploymentsRes.data || [];
        const logsPromises = deployments.map(async (dep) => {
          try {
            const logsRes = await api2.get(`/api/v1/logs/${dep._id}`);
            const logsArr: LogEntry[] = Array.isArray(logsRes.data)
              ? logsRes.data
              : logsRes.data?.logs || [];
            // Attach all relevant deployment fields for display
            return logsArr.map(l => ({
              ...l,
              deploymentName: dep.name,
              deploymentStatus: dep.status,
              deploymentCreatedAt: dep.createdAt,
              deploymentDescription: dep.description,
              deploymentSystemPrompt: dep.systemPrompt,
              deploymentTemperature: dep.temperature,
              deploymentEndpoint: dep.endpoint,
              deploymentContainerName: dep.containerName,
              deploymentContainerId: dep.containerId,
              deploymentModelId: dep.modelId,
            }));
          } catch {
            return [];
          }
        });
        const allLogsNested = await Promise.all(logsPromises);
        // Flatten and sort by createdAt descending
        const allLogs: LogEntry[] = allLogsNested.flat().sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setLogs(allLogs);
      } catch (err: any) {
        setError('Failed to fetch logs');
        setLogs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllLogs();
  }, []);

  const getLevelColor = (verdict: string) => {
    switch (verdict?.toUpperCase()) {
      case 'UNSAFE': return 'bg-red-500';
      case 'SAFE': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleExpand = (logId: string) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">System Logs</h1>
        <p className="text-gray-400">Monitor system events and model activities</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading logs...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : logs.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No logs found.</div>
        ) : (
          logs.map((log) => (
            <Card key={log._id} className="glass-effect border-cyan-500/20 hover:glow-cyan transition-all duration-300">
              <CardContent className="p-0">
                <div
                  className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                  onClick={() => toggleExpand(log._id)}
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="flex items-center space-x-2">
                      {expandedLog === log._id ? (
                        <ChevronDown size={16} className="text-cyan-400" />
                      ) : (
                        <ChevronRight size={16} className="text-cyan-400" />
                      )}
                    </div>
                    <div className="text-sm text-gray-400 font-mono whitespace-nowrap">
                      {/* Use the same date logic as LogsModal */}
                      {(() => {
                        let dateStr = log.createdAt;
                        // fallback to timestamp if present (for compatibility)
                        if (!dateStr && (log as any).timestamp) dateStr = (log as any).timestamp;
                        let dateObj = dateStr ? new Date(dateStr) : null;
                        return dateObj && !isNaN(dateObj.getTime())
                          ? dateObj.toLocaleString()
                          : 'Invalid Date';
                      })()}
                    </div>
                    <div className="text-sm text-cyan-400 min-w-0 truncate max-w-[160px]">
                      {log.deploymentName || log.deploymentId}
                    </div>
                    <Badge className={`${getLevelColor(log.verdict)} text-white text-xs`}>
                      {log.verdict}
                    </Badge>
                    {log.sCode && (
                      <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
                        {log.sCode}
                      </span>
                    )}
                    <div className="text-sm text-gray-300 truncate flex-1">
                      {log.requestSample ? log.requestSample.slice(0, 60) : ''}
                    </div>
                  </div>
                </div>
                {expandedLog === log._id && (
                  <div className="border-t border-gray-700 p-4 bg-gray-900/30 animate-accordion-down">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Request:</h4>
                        <div className="bg-gray-800/50 p-3 rounded text-sm text-gray-300 font-mono">
                          {log.requestSample || 'No request data'}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-2">Response:</h4>
                        <div className="bg-gray-800/50 p-3 rounded text-sm text-gray-300 font-mono">
                          {log.responseSample || 'No response data'}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Log ID:</span>
                          <span className="text-cyan-400 ml-2 font-mono">{log._id}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Deployment:</span>
                          <Badge variant="secondary" className="ml-2">{log.deploymentName || log.deploymentId}</Badge>
                        </div>
                        <div>
                          <span className="text-gray-400">Deployment Created:</span>
                          <span className="text-green-400 ml-2 font-mono">
                            {log.deploymentCreatedAt && !isNaN(Date.parse(log.deploymentCreatedAt))
                              ? new Date(log.deploymentCreatedAt).toLocaleString()
                              : 'Unknown'}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <Badge variant={log.deploymentStatus === 'DEPLOYED' ? 'default' : 'secondary'} className={log.deploymentStatus === 'DEPLOYED' ? 'bg-green-500 ml-2' : 'bg-gray-500 ml-2'}>
                            {log.deploymentStatus || ''}
                          </Badge>
                        </div>
                        {log.sCode && (
                          <div>
                            <span className="text-gray-400">S-Code:</span>
                            <span className="text-orange-400 ml-2 font-mono">{log.sCode}</span>
                          </div>
                        )}
                      </div>
                      {/* Deployment details: left info, right system prompt */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs mt-4">
                        {/* Left: model id, endpoint, temp, container name/id */}
                        <div className="space-y-2">
                          {log.deploymentModelId && (
                            <div>
                              <span className="text-gray-400">Model ID:</span>
                              <span className="text-gray-300 ml-2">{log.deploymentModelId}</span>
                            </div>
                          )}
                          {log.deploymentEndpoint && (
                            <div>
                              <span className="text-gray-400">Endpoint:</span>
                              <span className="text-gray-300 ml-2">{log.deploymentEndpoint}</span>
                            </div>
                          )}
                          {log.deploymentTemperature !== undefined && (
                            <div>
                              <span className="text-gray-400">Temperature:</span>
                              <span className="text-gray-300 ml-2">{log.deploymentTemperature}</span>
                            </div>
                          )}
                          {log.deploymentContainerName && (
                            <div>
                              <span className="text-gray-400">Container Name:</span>
                              <span className="text-gray-300 ml-2">{log.deploymentContainerName}</span>
                            </div>
                          )}
                          {log.deploymentContainerId && (
                            <div>
                              <span className="text-gray-400">Container ID:</span>
                              <span className="text-gray-300 ml-2">{log.deploymentContainerId}</span>
                            </div>
                          )}
                        </div>
                        {/* Right: system prompt */}
                        <div>
                          {log.deploymentSystemPrompt && (
                            <>
                              <span className="text-gray-400">System Prompt:</span>
                              <div className="bg-gray-800/50 border border-cyan-700/30 rounded-lg p-2 mt-1 text-gray-300 font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {log.deploymentSystemPrompt}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Logs;
