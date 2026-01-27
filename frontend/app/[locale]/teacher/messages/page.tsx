'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  MessageSquare, Send, User, Search, Check, CheckCheck, GraduationCap
} from 'lucide-react';
import { teacherApi } from '@/lib/api';

interface ParentConversation {
  id: number;
  name: string;
  student_name: string;
  student_class: string;
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
}

interface Message {
  id: number;
  sender_id: number;
  sender_type: 'parent' | 'teacher';
  receiver_id: number;
  receiver_type: 'parent' | 'teacher';
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export default function TeacherMessagesPage() {
  const [parents, setParents] = useState<ParentConversation[]>([]);
  const [selectedParent, setSelectedParent] = useState<ParentConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchParents();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchParents = async () => {
    try {
      const data = await teacherApi.getParentsForMessaging();
      setParents(data);
    } catch (error) {
      console.error('Failed to fetch parents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (parent: ParentConversation) => {
    setSelectedParent(parent);
    setLoadingMessages(true);
    try {
      const data = await teacherApi.getConversationWithParent(parent.id);
      setMessages(data);
      // Update unread count in parent list
      setParents(prev => prev.map(p =>
        p.id === parent.id ? { ...p, unread_count: 0 } : p
      ));
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedParent) return;

    setSending(true);
    try {
      const sentMessage = await teacherApi.sendMessageToParent(selectedParent.id, newMessage);
      setMessages(prev => [...prev, sentMessage]);
      setNewMessage('');
      // Update last message in parent list
      setParents(prev => prev.map(p =>
        p.id === selectedParent.id
          ? { ...p, last_message: newMessage.slice(0, 50), last_message_time: new Date().toISOString() }
          : p
      ));
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const filteredParents = parents.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.student_class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Communicate with parents of your students</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-full">
        {/* Parents List */}
        <Card variant="elevated" className="lg:col-span-1 flex flex-col h-full">
          <CardHeader className="border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search parents or students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0">
            {filteredParents.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <User className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No parents found</p>
              </div>
            ) : (
              filteredParents.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => fetchConversation(parent)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 border-b transition-colors ${
                    selectedParent?.id === parent.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">{parent.name}</h4>
                      {parent.unread_count && parent.unread_count > 0 && (
                        <span className="px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                          {parent.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-600 flex items-center gap-1">
                      <GraduationCap className="w-3 h-3" />
                      {parent.student_name} - {parent.student_class}
                    </p>
                    {parent.last_message && (
                      <p className="text-sm text-gray-500 truncate">{parent.last_message}</p>
                    )}
                    {parent.last_message_time && (
                      <p className="text-xs text-gray-400 mt-1">{formatTime(parent.last_message_time)}</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card variant="elevated" className="lg:col-span-2 flex flex-col h-full">
          {selectedParent ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedParent.name}</h3>
                    <p className="text-sm text-gray-500">
                      Parent of {selectedParent.student_name} ({selectedParent.student_class})
                    </p>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No messages yet. Start a conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender_type === 'teacher' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender_type === 'teacher'
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-gray-100 text-gray-900 rounded-bl-none'
                        }`}
                      >
                        <p>{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                          message.sender_type === 'teacher' ? 'text-primary-200' : 'text-gray-400'
                        }`}>
                          <span>{formatTime(message.created_at)}</span>
                          {message.sender_type === 'teacher' && (
                            message.is_read ? (
                              <CheckCheck className="w-3 h-3" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sending}
                    isLoading={sending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Parent</h3>
                <p className="text-gray-500">Choose a parent from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
