import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { Send, MessageSquare, Crown, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BottomNavigation from '@/components/BottomNavigation';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
  isFromAdmin: boolean;
}

const Messages = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: 'admin',
      senderName: 'Community Admin',
      content: 'Welcome to our community! Please feel free to reach out if you have any questions.',
      createdAt: new Date(Date.now() - 86400000), // 1 day ago
      isFromAdmin: true
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all');

  const handleSendMessage = () => {
    if (!newMessage.trim()) {
      toast({
        title: "Message is empty",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || '',
      senderName: user?.fullName || '',
      content: newMessage.trim(),
      createdAt: new Date(),
      isFromAdmin: user?.role === 'admin'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    toast({
      title: "Message sent",
      description: user?.role === 'admin' 
        ? "Your message has been sent to all community members."
        : "Your message has been sent to the admin.",
    });
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays}d ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours}h ago`;
    } else {
      return 'Just now';
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20">
      {/* Header */}
      <div className="bg-gradient-primary text-primary-foreground">
        <div className="max-w-md mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            <div>
              <h1 className="text-xl font-bold">Messages</h1>
              <p className="text-primary-foreground/80 text-sm">
                {user.role === 'admin' 
                  ? 'Communicate with community members' 
                  : 'Send messages to your admin'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6">
        {/* Messages List */}
        <div className="space-y-4 mb-6">
          {messages.length === 0 ? (
            <Card className="text-center p-8 shadow-card bg-gradient-card border-border/50">
              <CardContent className="pt-6">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <CardTitle className="text-lg mb-2">No Messages Yet</CardTitle>
                <p className="text-muted-foreground text-sm">
                  {user.role === 'admin' 
                    ? 'Start a conversation with your community members.'
                    : 'Send your first message to the admin.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            messages.map((message) => (
              <Card 
                key={message.id} 
                className={`shadow-soft border-border/50 ${
                  message.isFromAdmin 
                    ? 'bg-gradient-primary/5 border-primary/20' 
                    : 'bg-gradient-card'
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        message.isFromAdmin 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {message.senderName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-sm">{message.senderName}</span>
                          {message.isFromAdmin && <Crown className="w-3 h-3 text-primary" />}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Message Input */}
        <Card className="shadow-card bg-gradient-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              {user.role === 'admin' ? 'Send to All Members' : 'Send to Admin'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Textarea
                placeholder={user.role === 'admin' 
                  ? "Type your message to all community members..." 
                  : "Type your message to the admin..."
                }
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="min-h-[80px] resize-none border-border/50 focus:border-primary"
              />
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  {newMessage.length}/500 characters
                </span>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-4 shadow-soft bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                {user.role === 'admin' ? <Users className="w-4 h-4 text-primary" /> : <Crown className="w-4 h-4 text-primary" />}
              </div>
              <div>
                <h4 className="font-medium text-sm text-primary mb-1">
                  {user.role === 'admin' ? 'Admin Messaging' : 'Member Messaging'}
                </h4>
                <p className="text-xs text-primary/80">
                  {user.role === 'admin' 
                    ? 'Your messages will be visible to all community members.'
                    : 'Only you and the admin can see your messages.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Messages;