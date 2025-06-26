import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import api2 from "@/lib/api2";

interface ChatModalProps {
  model: any;
  onClose: () => void;
}

const ChatModal = ({ model, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm ${model.name}. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await api2.post(`/api/v1/proxy/${model.containerName}/chat`, {
        messages: [userMessage] // Only last user message is needed
      });

      const assistantMessage = res.data.message;
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage = {
        role: 'assistant',
        content: '⚠️ Failed to get a response from the model.'
      };
      setMessages((prev) => [...prev, errorMessage]);
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-cyan-500/20 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center space-x-2">
            <span className="text-xl">{model.icon}</span>
            <span>Chat with {model.name}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="h-96 overflow-y-auto space-y-3 p-4 bg-gray-800/30 rounded-lg">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg max-w-xs ${
                  message.role === 'user'
                    ? 'bg-cyan-500/20 text-cyan-100 ml-auto'
                    : 'bg-gray-700/50 text-gray-100'
                }`}
              >
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="p-3 rounded-lg max-w-xs bg-gray-700/50 text-gray-100 animate-pulse">
                Thinking...
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="bg-gray-800/50 border-gray-600 text-white"
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatModal;
