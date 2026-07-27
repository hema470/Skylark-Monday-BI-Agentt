import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, HelpCircle, ArrowRight, CornerDownLeft, RefreshCw } from 'lucide-react';
import { ChatMessage, ClarifyingOption } from '../types/bi';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  isLoading: boolean;
  onSendMessage: (msg: string) => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const renderFormattedContent = (content: string) => {
    // Simple markdown-style renderer for headings, bullet points, and bold text
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-sm font-extrabold text-indigo-300 mt-3 mb-1.5 flex items-center gap-1.5">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('- ')) {
        const bulletText = line.replace('- ', '');
        return (
          <div key={idx} className="flex items-start gap-2 my-1 text-xs text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0"></span>
            <span dangerouslySetInnerHTML={{ __html: formatBoldText(bulletText) }} />
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} className="h-2"></div>;
      }
      return (
        <p key={idx} className="text-xs leading-relaxed text-slate-200 my-1" dangerouslySetInnerHTML={{ __html: formatBoldText(line) }} />
      );
    });
  };

  const formatBoldText = (text: string) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Skylark Executive Advisor
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400">Powered by Monday GraphQL & Gemini AI Engine</p>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 py-12">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-2xl animate-bounce">
              🦅
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-slate-100">Ask Founder-Level Business Questions</h4>
              <p className="text-xs text-slate-400 mt-1">
                Connected directly to Monday.com Deals & Work Orders boards. Ask about revenue, pipeline, delayed orders, or sector comparisons.
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                msg.role === 'user'
                  ? 'bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'bg-indigo-950/80 border border-indigo-500/30 text-indigo-300'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs shadow-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-600 text-white font-medium rounded-tr-none'
                  : 'bg-[#111827]/90 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="leading-relaxed">{msg.content}</p>
              ) : (
                <div>
                  {renderFormattedContent(msg.content)}

                  {/* Clarifying Options UI if ambiguous */}
                  {msg.requires_clarification && msg.clarifying_options && msg.clarifying_options.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-800/80">
                      <p className="text-[11px] font-semibold text-amber-300 mb-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        Select a specific follow-up topic:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {msg.clarifying_options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => onSendMessage(opt.query_text)}
                            className="text-left px-3 py-2 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-200 text-[11px] font-medium transition-all flex items-center justify-between group"
                          >
                            <span>{opt.label}</span>
                            <ArrowRight className="w-3 h-3 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 flex items-center justify-center">
              <Bot className="w-4 h-4 animate-spin text-cyan-400" />
            </div>
            <div className="bg-[#111827]/90 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Analyzing Monday GraphQL Data</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dot-typing-1"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 dot-typing-2"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 dot-typing-3"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/60">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask founder questions (e.g. 'How is our pipeline?', 'Compare Energy vs Manufacturing')..."
            className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
