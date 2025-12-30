'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TextInput } from '@/components/inputs/text-input';
import { AIAnalyzedTextInput } from '@/components/inputs/ai-analyzed-text-input';
import { VoiceInput } from '@/components/inputs/voice-input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Mic,
  Menu,
  X,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Flame
} from 'lucide-react';
import { toast } from 'sonner';

interface ContactOption {
  id: string;
  name: string;
  pipeline_stage?: string;
}

interface Message {
  id: string;
  type: 'system' | 'ai' | 'user' | 'action';
  content: string;
  timestamp: Date;
  contact?: {
    name: string;
    stage: string;
    motivation: string;
    priority: number;
  };
}

interface Contact {
  id: string;
  name: string;
  stage: string;
  motivation: string;
  priority: number;
  lastContact: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'system',
      content: '👋 Good morning! Here are your priorities for today:',
      timestamp: new Date(),
    },
    {
      id: '2',
      type: 'action',
      content: 'Call John Doe about the 3-bedroom property in Downtown',
      timestamp: new Date(),
      contact: {
        name: 'John Doe',
        stage: 'Active Opportunity',
        motivation: 'High',
        priority: 9,
      },
    },
    {
      id: '3',
      type: 'action',
      content: 'Follow up with Jane Smith on her pre-approval status',
      timestamp: new Date(),
      contact: {
        name: 'Jane Smith',
        stage: 'New Opportunity',
        motivation: 'High',
        priority: 8,
      },
    },
  ]);

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [inputType, setInputType] = useState<'text' | 'voice'>('text');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [contacts, setContacts] = useState<ContactOption[]>([]);
  const [contactsLoading, setContactsLoading] = useState(false);

  const mockContacts: Contact[] = [
    { id: '1', name: 'John Doe', stage: 'Active Opportunity', motivation: 'High', priority: 9, lastContact: '2 days ago' },
    { id: '2', name: 'Jane Smith', stage: 'New Opportunity', motivation: 'High', priority: 8, lastContact: '3 days ago' },
    { id: '3', name: 'Bob Johnson', stage: 'Lead', motivation: 'Medium', priority: 6, lastContact: '1 week ago' },
    { id: '4', name: 'Sarah Williams', stage: 'Under Contract', motivation: 'High', priority: 7, lastContact: '1 day ago' },
  ];

  useEffect(() => {
    const loadContacts = async () => {
      setContactsLoading(true);
      try {
        const response = await fetch('/api/contacts?limit=100');
        if (!response.ok) {
          throw new Error('Failed to load contacts');
        }
        const data = await response.json();
        setContacts(data.contacts || []);
      } catch (error) {
        console.error('Error loading contacts:', error);
      } finally {
        setContactsLoading(false);
      }
    };

    loadContacts();
  }, []);

  const logConversation = async (content: string, type: 'text' | 'voice') => {
    if (!selectedContactId) return;
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact_id: selectedContactId,
          input_type: type,
          content,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log conversation');
      }
    } catch (error) {
      console.error('Error logging conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to log conversation');
    }
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInput('');
    setInputType('text');

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I understand. Let me analyze that information and update your contacts accordingly.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);

    await logConversation(content, inputType);
  };

  const handleTranscript = (text: string) => {
    setInput((prev) => (prev ? `${prev} ${text}` : text));
    setVoiceOpen(false);
    setInputType('voice');
  };

  const getStageColor = (stage: string) => {
    const colors: Record<string, string> = {
      'Lead': 'bg-gray-500',
      'New Opportunity': 'bg-blue-500',
      'Active Opportunity': 'bg-green-500',
      'Under Contract': 'bg-yellow-500',
      'Closed': 'bg-purple-500',
    };
    return colors[stage] || 'bg-gray-500';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-80 bg-white border-r transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">RealCoach AI</h2>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs text-gray-500">Streak</p>
                    <p className="text-lg font-bold">7 days</p>
                  </div>
                </div>
              </Card>
              <Card className="p-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-xs text-gray-500">Score</p>
                    <p className="text-lg font-bold">85%</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Contacts List */}
          <ScrollArea className="flex-1 p-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">CONTACTS</h3>
            <div className="space-y-2">
              {mockContacts.map((contact) => (
                <Card key={contact.id} className="p-3 hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{contact.name}</p>
                        <Badge className={`text-xs ${getStageColor(contact.stage)}`}>
                          {contact.stage}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">{contact.lastContact}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="h-1.5 flex-1 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${contact.priority * 10}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{contact.priority}/10</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full" size="sm">
              <Phone className="h-4 w-4 mr-2" />
              Contacts: 24
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">RealCoach AI</h1>
                <p className="text-xs text-gray-500">Your behavioral intelligence assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-1">
                <Flame className="h-3 w-3" />
                7-day streak
              </Badge>
              {isRecording && (
                <Badge className="gap-1 bg-red-100 text-red-700 border border-red-200">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Recording
                </Badge>
              )}
              <Badge variant="outline">
                5/5 contacts today
              </Badge>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type !== 'user' && (
                  <Avatar className="mr-3 mt-1">
                    <AvatarFallback className="bg-blue-500 text-white">
                      {message.type === 'system' ? '📊' : 'AI'}
                    </AvatarFallback>
                  </Avatar>
                )}

                <div className={`max-w-[80%] ${message.type === 'user' ? 'bg-blue-500 text-white' : message.type === 'action' ? 'bg-white border-2 border-blue-200' : 'bg-gray-100'} rounded-lg p-4`}>
                  {message.type === 'action' && message.contact ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getStageColor(message.contact.stage)}>
                          {message.contact.stage}
                        </Badge>
                        <span className="text-xs text-gray-500">Priority: {message.contact.priority}/10</span>
                      </div>
                      <p className="font-medium mb-2">{message.content}</p>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Phone className="h-3 w-3 mr-1" />
                          Call
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-3 w-3 mr-1" />
                          Email
                        </Button>
                        <Button size="sm" variant="outline">
                          Complete
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {message.type === 'user' && (
                  <Avatar className="ml-3 mt-1">
                    <AvatarFallback className="bg-gray-500">
                      You
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="bg-white border-t p-4">
          <div className="max-w-3xl mx-auto">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-3">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Screenshot
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setVoiceOpen(true)}
              >
                <Mic className="h-4 w-4 mr-2" />
                Voice Input
              </Button>
            </div>

            {/* Contact Selector */}
            {!selectedContactId && (
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger className="mb-3">
                  <SelectValue placeholder="Select a contact to log conversation" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      <div className="flex items-center gap-2">
                        <span>{contact.name}</span>
                        <Badge className={`text-xs ${getStageColor(contact.pipeline_stage)}`}>
                          {contact.pipeline_stage}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* AI-Analyzed Text Input */}
            <AIAnalyzedTextInput
              value={input}
              onChange={setInput}
              onSend={handleSend}
              contactId={selectedContactId}
              disabled={!selectedContactId}
              placeholder={selectedContactId ? "Log your conversation or note with this contact..." : "Select a contact first..."}
              onAnalysisComplete={(analysis) => {
                console.log('Analysis complete:', analysis);
                setMessages((prev) => [...prev, {
                  id: Date.now().toString(),
                  type: 'ai',
                  content: `Analysis complete. Motivation: ${analysis.entities.motivation.level}, Timeframe: ${analysis.entities.timeframe.range}, Stage: ${analysis.stage.currentStage}`,
                  timestamp: new Date(),
                }]);
              }}
            />
          </div>
        </div>

        {/* Voice Input Modal */}
        {voiceOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6 w-full max-w-lg">
              <VoiceInput
                onTranscript={handleTranscript}
                onClose={() => setVoiceOpen(false)}
                onRecordingChange={setIsRecording}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
