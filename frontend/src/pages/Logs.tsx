
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronRight } from 'lucide-react';

const Logs = () => {
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const logs = [
    {
      id: 1,
      timestamp: '2024-01-15 10:30:25',
      model: 'GPT-3.5 Turbo',
      level: 'INFO',
      shortMessage: 'Model inference completed successfully',
      fullMessage: 'Model inference completed successfully for request ID: req_123456. Processing time: 245ms, tokens processed: 45, output tokens: 32. Memory usage: 512MB.',
      requestId: 'req_123456'
    },
    {
      id: 2,
      timestamp: '2024-01-15 10:29:18',
      model: 'LLaMA-2-7B',
      level: 'DEBUG',
      shortMessage: 'Processing input tokens: 45',
      fullMessage: 'Processing input tokens: 45. Input validation passed. Token limit check: OK. Context window utilized: 12%. Estimated processing time: 180ms.',
      requestId: 'req_123455'
    },
    {
      id: 3,
      timestamp: '2024-01-15 10:28:42',
      model: 'Mistral-7B',
      level: 'WARN',
      shortMessage: 'High memory usage detected: 85%',
      fullMessage: 'High memory usage detected: 85% (6.8GB/8GB). This may impact performance. Consider scaling up resources or optimizing model parameters. Current active requests: 12.',
      requestId: 'req_123454'
    },
    {
      id: 4,
      timestamp: '2024-01-15 10:25:11',
      model: 'Custom-BERT',
      level: 'ERROR',
      shortMessage: 'Timeout error in downstream service',
      fullMessage: 'Timeout error in downstream service after 30s. Service: token-validator. Error: Connection timeout. Request will be retried. Retry attempt: 1/3. Next retry in: 5s.',
      requestId: 'req_123453'
    },
    {
      id: 5,
      timestamp: '2024-01-15 10:20:33',
      model: 'GPT-3.5 Turbo',
      level: 'INFO',
      shortMessage: 'Model deployment successful',
      fullMessage: 'Model deployment successful. Version: v1.2.3, Container ID: cont_789, Health check: PASSED, Memory allocated: 4GB, CPU cores: 2. Ready to serve requests.',
      requestId: 'dep_789012'
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'bg-red-500';
      case 'WARN': return 'bg-yellow-500';
      case 'INFO': return 'bg-blue-500';
      case 'DEBUG': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const toggleExpand = (logId: number) => {
    setExpandedLog(expandedLog === logId ? null : logId);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">System Logs</h1>
        <p className="text-gray-400">Monitor system events and model activities</p>
      </div>

      <div className="space-y-4">
        {logs.map((log) => (
          <Card key={log.id} className="glass-effect border-cyan-500/20 hover:glow-cyan transition-all duration-300">
            <CardContent className="p-0">
              <div
                className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                onClick={() => toggleExpand(log.id)}
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {expandedLog === log.id ? (
                      <ChevronDown size={16} className="text-cyan-400" />
                    ) : (
                      <ChevronRight size={16} className="text-cyan-400" />
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-400 font-mono whitespace-nowrap">
                    {log.timestamp}
                  </div>
                  
                  <div className="text-sm text-cyan-400 min-w-0">
                    {log.model}
                  </div>
                  
                  <Badge className={`${getLevelColor(log.level)} text-white text-xs`}>
                    {log.level}
                  </Badge>
                  
                  <div className="text-sm text-gray-300 truncate flex-1">
                    {log.shortMessage}
                  </div>
                </div>
              </div>
              
              {expandedLog === log.id && (
                <div className="border-t border-gray-700 p-4 bg-gray-900/30 animate-accordion-down">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-300 mb-2">Full Message:</h4>
                      <div className="bg-gray-800/50 p-3 rounded text-sm text-gray-300 font-mono">
                        {log.fullMessage}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <span className="text-gray-400">Request ID:</span>
                        <span className="text-cyan-400 ml-2 font-mono">{log.requestId}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Model:</span>
                        <span className="text-white ml-2">{log.model}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Logs;
