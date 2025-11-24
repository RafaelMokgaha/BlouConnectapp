import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Bot, X, Loader2 } from 'lucide-react';
import Button from './ui/Button';

interface AIChatProps {
  onClose: () => void;
}

interface AIMessage {
  role: 'user' | 'model';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'model', text: 'Hello! I am Blou AI (powered by Gemini). How can I help you with village life today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    if (!apiKey) {
        alert("Please enter a Gemini API Key to use the AI.");
        setShowKeyInput(true);
        return;
    }

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userMsg,
      });
      
      const text = response.text;
      if (text) {
        setMessages(prev => [...prev, { role: 'model', text: text }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please check your API key or try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (showKeyInput) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl p-6 shadow-2xl animate-slide-up">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Bot className="text-primary-500"/> Blou AI Setup
                    </h3>
                    <button onClick={onClose}><X className="text-gray-500" /></button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    To use Gemini AI, please provide your API Key. It is not stored on any server.
                </p>
                <input 
                    type="password" 
                    placeholder="Enter Gemini API Key"
                    className="w-full p-3 border rounded-xl dark:bg-gray-900 dark:border-gray-700 dark:text-white mb-4 focus:ring-2 focus:ring-primary-500 outline-none"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                />
                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                    <Button onClick={() => setShowKeyInput(false)} className="flex-1" disabled={!apiKey}>Start Chat</Button>
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="underline">Get a key here</a>
                </p>
            </div>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white dark:bg-dark-card sm:rounded-t-xl sm:top-10 shadow-2xl animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2">
           <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full text-primary-600">
             <Bot size={24} />
           </div>
           <div>
             <h3 className="font-bold text-lg dark:text-white">Blou AI</h3>
             <span className="text-xs text-primary-500">Powered by Gemini</span>
           </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
           <X size={24} className="text-gray-500" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-black/20">
         {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
               <div 
                 className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-primary-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                 }`}
               >
                 {msg.text}
               </div>
            </div>
         ))}
         {isLoading && (
             <div className="flex justify-start">
                 <div className="bg-white dark:bg-dark-card p-3 rounded-2xl rounded-tl-none border border-gray-200 dark:border-gray-700 shadow-sm flex items-center gap-2 text-gray-500 text-sm">
                    <Loader2 size={16} className="animate-spin" /> Thinking...
                 </div>
             </div>
         )}
         <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-dark-card">
         <form onSubmit={handleSend} className="flex items-center gap-2">
            <input 
              className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-full px-5 py-3 focus:ring-2 focus:ring-primary-500 dark:text-white outline-none"
              placeholder="Ask AI anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading}
              className="p-3 bg-primary-600 text-white rounded-full disabled:opacity-50 hover:bg-primary-700 transition-colors shadow-md"
            >
               <Send size={20} />
            </button>
         </form>
      </div>
    </div>
  );
};

export default AIChat;