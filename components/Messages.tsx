
import React, { useState, useEffect, useRef } from 'react';
import { Owner, Message, Conversation } from '../types';
import { Icons } from '../constants';
import { geminiService } from '../services/geminiService';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface MessagesProps {
  currentOwner: Owner;
  onIncomingMessage?: (text: string, senderName: string, senderAvatar: string) => void;
  onMessagesViewed?: () => void;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'ai-1', participantId: 'assistant', participantName: 'PawAssistant', participantAvatar: 'https://cdn-icons-png.flaticon.com/512/6134/6134346.png', lastMessage: 'Ask me anything about pets!', isAssistant: true },
  { id: 'conv-2', participantId: 'owner-2', participantName: 'Sarah Miller', participantAvatar: 'https://picsum.photos/seed/sarah/150', lastMessage: 'Is Luna still free for a playdate?' }
];

const Messages: React.FC<MessagesProps> = ({ currentOwner, onIncomingMessage, onMessagesViewed }) => {
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (onMessagesViewed) onMessagesViewed();
  }, [onMessagesViewed]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedConv]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !selectedConv) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: currentOwner.id,
      text: inputText,
      timestamp: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [selectedConv.id]: [...(prev[selectedConv.id] || []), userMsg]
    }));
    setInputText('');

    if (selectedConv.isAssistant) {
      setIsTyping(true);
      
      // Get location for Maps grounding if possible
      let location;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => navigator.geolocation.getCurrentPosition(res, rej));
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) {}

      const response = await geminiService.chatWithAssistant(inputText, location);
      
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'assistant',
        text: response.text,
        timestamp: new Date(),
        isAi: true,
        groundingUrls: response.urls
      };

      setMessages(prev => ({
        ...prev,
        [selectedConv.id]: [...(prev[selectedConv.id] || []), aiMsg]
      }));
      setIsTyping(false);

      // Trigger notification if applicable
      if (onIncomingMessage) {
        onIncomingMessage(response.text, selectedConv.participantName, selectedConv.participantAvatar);
      }
    }
  };

  const startLiveSession = async () => {
    setIsLiveActive(true);
    alert("Voice Assistant session started! (Simulated for this demo)");
    setTimeout(() => setIsLiveActive(false), 3000);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
      {!selectedConv ? (
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xl font-bold mb-6 px-2">Messages</h2>
          <div className="space-y-2">
            {MOCK_CONVERSATIONS.map(conv => (
              <button 
                key={conv.id}
                onClick={() => setSelectedConv(conv)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="relative">
                  <img src={conv.participantAvatar} className="w-14 h-14 rounded-full object-cover border" alt="" />
                  {conv.isAssistant && <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white shadow-sm" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-800">{conv.participantName}</h3>
                    <span className="text-[10px] text-gray-400">Now</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <header className="p-4 border-b flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setSelectedConv(null)} className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </button>
              <img src={selectedConv.participantAvatar} className="w-10 h-10 rounded-full object-cover" alt="" />
              <div>
                <h3 className="font-bold text-gray-800 leading-tight">{selectedConv.participantName}</h3>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Online</span>
              </div>
            </div>
            {selectedConv.isAssistant && (
              <button 
                onClick={startLiveSession}
                className={`p-2 rounded-full transition-all ${isLiveActive ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
              >
                <Icons.Mic />
              </button>
            )}
          </header>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/30">
            {(messages[selectedConv.id] || []).map(msg => (
              <div key={msg.id} className={`flex ${msg.senderId === currentOwner.id ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm ${
                  msg.senderId === currentOwner.id ? 'bg-red-500 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  {msg.groundingUrls && msg.groundingUrls.length > 0 && (
                    <div className="mt-2 space-y-1 border-t pt-2 border-gray-100">
                      <p className="text-[10px] uppercase font-bold text-gray-400">References</p>
                      {msg.groundingUrls.map((link, idx) => (
                        <a key={idx} href={link.uri} target="_blank" rel="noopener" className="block text-[10px] text-blue-500 hover:underline truncate">
                          🔗 {link.title || link.uri}
                        </a>
                      ))}
                    </div>
                  )}
                  <span className={`text-[9px] mt-1 block ${msg.senderId === currentOwner.id ? 'text-red-100' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl border border-gray-100 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t">
            <div className="flex items-center gap-2 bg-gray-100 rounded-2xl p-1 pr-3 focus-within:ring-2 focus-within:ring-red-400 transition-all">
              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-transparent border-none outline-none p-3 text-sm text-gray-700"
                placeholder={selectedConv.isAssistant ? "Ask about local parks or health tips..." : "Type a message..."}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!inputText.trim()}
                className="bg-red-500 text-white p-2 rounded-xl disabled:opacity-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
