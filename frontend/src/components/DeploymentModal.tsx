
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';

interface DeploymentModalProps {
  isOpen: boolean;
  step: string;
  isSuccess?: boolean;
  isError?: boolean;
  onClose: () => void;
}

const DeploymentModal = ({ isOpen, step, isSuccess, isError, onClose }: DeploymentModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-cyan-500/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            {isSuccess ? 'Deployment Complete!' : isError ? 'Deployment Failed' : 'Deploying Model'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center space-y-6 py-6">
          {isSuccess ? (
            <CheckCircle size={64} className="text-green-400" />
          ) : isError ? (
            <AlertTriangle size={64} className="text-red-400" />
          ) : (
            <Loader2 size={64} className="text-cyan-400 animate-spin" />
          )}
          
          <div className="text-center">
            <div className="text-white text-lg font-semibold mb-2">{step}</div>
            {!isSuccess && !isError && (
              <div className="text-gray-400 text-sm">Please wait while we deploy your model...</div>
            )}
          </div>
          
          {!isSuccess && !isError && (
            <div className="w-full">
              <Progress value={33} className="w-full" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentModal;
