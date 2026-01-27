'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { MessageSquare, Send, User, Check, CheckCheck } from 'lucide-react';
import { studentApi } from '@/lib/api';

interface Teacher {
  id: number;
  name: string;
  email?: string;
  unread_count: number;
  last_message?: {
    content: string;
    created_at: string;
    is_from_me: boolean;
  };
}

interface Message {
  id: number;
  content: string;
  created_at: string;
  is_from_me: boolean;
  is_read: boolean;
}

interface Conversation {
  teacher: {
    id: number;
    name: string;
  };
  messages: Message[];
}

export default function StudentMessagesPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await studentApi.getTeachersForMessaging();
      setTeachers(data);
      if (data.length > 0 && !selectedTeacher) {
        setSelectedTeacher(data[0]);
      }
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedTeacher]);

  const fetchConversation = useCallback(async (teacherId: number) => {
    try {
      const data = await studentApi.getConversation(teacherId);
      setConversation(data);
    } catch (error) {
      console.error('Failed to fetch conversation:', error);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  useEffect(() => {
    if (selectedTeacher) {
      fetchConversation(selectedTeacher.id);
    }
  }, [fetchConversation, selectedTeacher]);

  useEffect(() => {
    scrollToBottom();
  }, [conversation?.messages, scrollToBottom]);

  const handleSend = async () => {
    if (!newMessage.trim() || !selectedTeacher) return;

    setSending(true);
    try {
      await studentApi.sendMessage(selectedTeacher.id, newMessage);
      setNewMessage('');
      fetchConversation(selectedTeacher.id);
      fetchTeachers();
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600">Chat with your teachers</p>
      </div>

      {teachers.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No teachers available to message</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Teachers List */}
          <Card variant="elevated" className="lg:col-span-1 overflow-hidden">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center text-base">
                <User className="w-4 h-4 mr-2 text-primary-600" />
                Teachers
              </CardTitle>
            </CardHeader>
            <div className="overflow-y-auto h-[calc(600px-60px)]">
              {teachers.map((teacher) => (
                <button
                  key={teacher.id}
                  onClick={() => setSelectedTeacher(teacher)}
                  className={`w-full p-4 text-left border-b hover:bg-gray-50 transition-colors ${
                    selectedTeacher?.id === teacher.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{teacher.name}</h4>
                        {teacher.last_message && (
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">
                            {teacher.last_message.is_from_me ? 'You: ' : ''}
                            {teacher.last_message.content}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {teacher.last_message && (
                        <span className="text-xs text-gray-400">
                          {formatTime(teacher.last_message.created_at)}
                        </span>
                      )}
                      {teacher.unread_count > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5">
                          {teacher.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Chat Area */}
          <Card variant="elevated" className="lg:col-span-2 flex flex-col overflow-hidden">
            {selectedTeacher && conversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedTeacher.name}</h3>
                      <p className="text-sm text-gray-500">Teacher</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {conversation.messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    conversation.messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_from_me ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                            message.is_from_me
                              ? 'bg-primary-600 text-white rounded-br-md'
                              : 'bg-white text-gray-900 border rounded-bl-md'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            message.is_from_me ? 'text-primary-200' : 'text-gray-400'
                          }`}>
                            <span className="text-xs">{formatTime(message.created_at)}</span>
                            {message.is_from_me && (
                              message.is_read
                                ? <CheckCheck className="w-3 h-3" />
                                : <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!newMessage.trim() || sending}
                      className="rounded-full px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a teacher to start chatting</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
