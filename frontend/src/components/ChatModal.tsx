
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatModalProps {
  model: any;
  onClose: () => void;
}

const ChatModal = ({ model, onClose }: ChatModalProps) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hello! I'm ${model.name}. How can I help you today?` }
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessages = [
      ...messages,
      { role: 'user', content: input },
      { role: 'assistant', content: 'This is a demo response from the model. In a real implementation, this would be connected to the actual model API.' }
    ];
    
    setMessages(newMessages);
    setInput('');
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
          </div>
          
          <div className="flex space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="bg-gray-800/50 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <Button
              onClick={sendMessage}
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
