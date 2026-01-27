'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { aiApi } from '@/lib/api';
import { MessageSquare, FileText, Send, Sparkles } from 'lucide-react';

interface GeneratedQuestion {
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

export default function TeacherAIPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'questions'>('questions');

  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Question generation state
  const [questionParams, setQuestionParams] = useState({
    subject: '',
    topic: '',
    class_level: '',
    question_type: 'mcq',
    count: 5,
    difficulty: 'medium',
  });
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = { role: 'user', content: chatMessage };
    setChatHistory((prev) => [...prev, userMessage]);
    setChatMessage('');
    setChatLoading(true);

    try {
      const response = await aiApi.chat(chatMessage, chatHistory);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: response.response }]);
    } catch (error) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const questions = await aiApi.generateQuestions(questionParams);
      setGeneratedQuestions(questions);
    } catch (error) {
      alert('Failed to generate questions. Please try again.');
    } finally {
      setQuestionsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">AI Teaching Assistant</h1>
        <p className="text-gray-600">Generate questions and get teaching assistance</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('questions')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'questions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Question Generator
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === 'chat'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-2" />
          AI Chat
        </button>
      </div>

      {/* Question Generator */}
      {activeTab === 'questions' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card variant="elevated">
            <CardHeader>
              <CardTitle>Question Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Subject"
                value={questionParams.subject}
                onChange={(e) => setQuestionParams({ ...questionParams, subject: e.target.value })}
                placeholder="e.g., Mathematics"
              />
              <Input
                label="Topic"
                value={questionParams.topic}
                onChange={(e) => setQuestionParams({ ...questionParams, topic: e.target.value })}
                placeholder="e.g., Quadratic Equations"
              />
              <Input
                label="Class Level"
                value={questionParams.class_level}
                onChange={(e) => setQuestionParams({ ...questionParams, class_level: e.target.value })}
                placeholder="e.g., Class 10"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={questionParams.question_type}
                  onChange={(e) => setQuestionParams({ ...questionParams, question_type: e.target.value })}
                >
                  <option value="mcq">Multiple Choice (MCQ)</option>
                  <option value="short">Short Answer</option>
                  <option value="long">Long Answer</option>
                  <option value="fill_blank">Fill in the Blank</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={questionParams.difficulty}
                  onChange={(e) => setQuestionParams({ ...questionParams, difficulty: e.target.value })}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Number of Questions</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  value={questionParams.count}
                  onChange={(e) => setQuestionParams({ ...questionParams, count: parseInt(e.target.value) })}
                />
              </div>
              <Button onClick={handleGenerateQuestions} isLoading={questionsLoading} className="w-full">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Questions
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2">
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Generated Questions</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedQuestions.length > 0 ? (
                  <div className="space-y-6">
                    {generatedQuestions.map((q, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-medium text-gray-900 mb-2">
                          Q{index + 1}. {q.question}
                        </p>
                        {q.options && (
                          <ul className="space-y-1 mb-3 ml-4">
                            {q.options.map((opt, i) => (
                              <li key={i} className="text-gray-600">
                                {String.fromCharCode(65 + i)}. {opt}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="bg-green-50 rounded p-2 mb-2">
                          <p className="text-sm text-green-800">
                            <strong>Answer:</strong> {q.answer}
                          </p>
                        </div>
                        {q.explanation && (
                          <p className="text-sm text-gray-600">
                            <strong>Explanation:</strong> {q.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Fill in the parameters and click Generate to create questions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* AI Chat */}
      {activeTab === 'chat' && (
        <Card variant="elevated" className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
              Teaching Assistant Chat
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {chatHistory.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Ask me anything about teaching, curriculum, or student engagement!
                  </p>
                </div>
              ) : (
                chatHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} disabled={!chatMessage.trim() || chatLoading}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
