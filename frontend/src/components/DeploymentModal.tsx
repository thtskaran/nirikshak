import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

interface DeploymentModalProps {
  isOpen: boolean;
  step: string;
  isSuccess?: boolean;
  isError?: boolean;
  onClose: () => void;
}

const DeploymentModal = ({
  isOpen,
  step,
  isSuccess,
  isError,
  onClose,
}: DeploymentModalProps) => {
  const getProgressValue = () => {
    if (isSuccess) return 100;
    if (isError) return 0;

    // Calculate progress based on deployment steps
    const stepKeywords = [
      "Initializing",
      "Connecting",
      "Pulling",
      "Creating",
      "Downloading",
      "Configuring",
      "Starting",
      "Provisioning",
      "Verifying",
      "Finalizing",
    ];

    const currentStepIndex = stepKeywords.findIndex((keyword) =>
      step.toLowerCase().includes(keyword.toLowerCase())
    );

    if (currentStepIndex !== -1) {
      return Math.round(((currentStepIndex + 1) / stepKeywords.length) * 90); // Max 90% during process
    }

    if (step.includes("Creating deployment")) return 95;
    return 10;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-cyan-500/20 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            {isSuccess
              ? "Deployment Complete!"
              : isError
              ? "Deployment Failed"
              : "Deploying Model"}
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
              <div className="text-gray-400 text-sm">
                {step.includes("Docker") &&
                  "Setting up containerization environment..."}
                {step.includes("Ollama") && "Preparing AI model runtime..."}
                {step.includes("Downloading") &&
                  "This may take a few minutes..."}
                {step.includes("Provisioning") &&
                  "Allocating system resources..."}
                {!step.includes("Docker") &&
                  !step.includes("Ollama") &&
                  !step.includes("Downloading") &&
                  !step.includes("Provisioning") &&
                  "Please wait while we deploy your model..."}
              </div>
            )}
          </div>

          {!isSuccess && !isError && (
            <div className="w-full">
              <Progress value={getProgressValue()} className="w-full" />
              <div className="text-xs text-gray-500 mt-2 text-center">
                {getProgressValue()}% complete
              </div>
            </div>
          )}

          {!isSuccess && !isError && (
            <Button
              onClick={onClose}
              variant="outline"
              className="bg-transparent border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
            >
              Continue in Background
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentModal;
