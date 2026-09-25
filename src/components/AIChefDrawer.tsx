import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Zap, 
  RotateCcw, 
  ChefHat
} from 'lucide-react';
import { Recipe, UserProfile } from '../types/recipe';
import { AIChefService } from '../services/aiService';
import { ActiveTimer } from './ActiveTimerOverlay';

interface AIChefDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRecipe?: Recipe | null;
  userProfile?: UserProfile | null;
  isPremiumUser: boolean;
  isOnline: boolean;
  downloadedIds: Set<string>;
  onStartTimer: (timer: ActiveTimer) => void;
  onOpenUnlockModal: () => void;
  initialPrompt?: string;
}

interface Message {
  id: string;
  sender: 'user' | 'chef';
  text: string;
  title?: string;
  handledLocally?: boolean;
  category?: string;
  timestamp: string;
}

// Helper to format bold markdown, lists, and prevent any mobile horizontal overflow
const formatInlineTokens = (text: string, isUser: boolean) => {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong
          key={i}
          className={isUser ? 'font-bold text-[#FBF9F5]' : 'font-semibold text-[#C85A32]'}
        >
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
};

const renderFormattedChefMessage = (text: string, isUser: boolean) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-1.5 space-y-1 pl-4 list-disc text-inherit break-words [overflow-wrap:anywhere]">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="break-words [overflow-wrap:anywhere] leading-relaxed">
              {formatInlineTokens(item, isUser)}
            </li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-1.5 space-y-1 pl-4 list-decimal text-inherit break-words [overflow-wrap:anywhere]">
          {currentList.items.map((item, idx) => (
            <li key={idx} className="break-words [overflow-wrap:anywhere] leading-relaxed">
              {formatInlineTokens(item, isUser)}
            </li>
          ))}
        </ol>
      );
    }
    currentList = null;
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      elements.push(<div key={`sp-${lineIdx}`} className="h-1" />);
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bulletMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
      return;
    }

    const numMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
    if (numMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(numMatch[1]);
      return;
    }

    flushList();
    elements.push(
      <p key={`p-${lineIdx}`} className="break-words [overflow-wrap:anywhere] leading-relaxed my-1">
        {formatInlineTokens(trimmed, isUser)}
      </p>
    );
  });

  flushList();
  return elements;
};

export const AIChefDrawer: React.FC<AIChefDrawerProps> = ({
  isOpen,
  onClose,
  activeRecipe,
  userProfile,
  isPremiumUser,
  isOnline,
  downloadedIds,
  onStartTimer,
  onOpenUnlockModal,
  initialPrompt
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'chef',
      title: 'Welcome to your Global Kitchen',
      text: activeRecipe
        ? `Hello! I'm here to assist with **${activeRecipe.title}** from ${activeRecipe.country}. Ask me for ingredient substitutions, technique tips, or say "Make this for 4" to scale servings.`
        : 'Hello! I am your culinary assistant for Palate & Place. Ask me for authentic technique guidance, ingredient substitutions, recipe scaling, or what to cook with ingredients on hand!',
      handledLocally: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Handle initial prompt from recipe modal
  useEffect(() => {
    if (initialPrompt && isOpen) {
      handleSend(initialPrompt);
    }
  }, [initialPrompt, isOpen]);

  // Support Escape key to close drawer smoothly
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    window.history.pushState({ drawer: 'ai-chef' }, '');
    const handlePopState = () => {
      onClose();
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, onClose]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || inputValue;
    if (!textToSend.trim() || isThinking) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!questionText) setInputValue('');
    setIsThinking(true);

    try {
      const response = await AIChefService.askChef(
        textToSend,
        activeRecipe || undefined,
        userProfile,
        downloadedIds,
        isOnline,
        messages.slice(-6)
      );

      const chefMsg: Message = {
        id: `chef-${Date.now()}`,
        sender: 'chef',
        title: response.title,
        text: response.response,
        handledLocally: response.handledLocally,
        category: response.category,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, chefMsg]);

      // If action payload includes setting a timer, trigger timer overlay
      if (response.actionPayload?.type === 'set_timer') {
        const minutes = response.actionPayload.data?.minutes || 10;
        onStartTimer({
          id: `timer-${Date.now()}`,
          label: activeRecipe ? `${activeRecipe.title} Timer` : 'Kitchen Timer',
          totalSeconds: minutes * 60,
          remainingSeconds: minutes * 60,
          isRunning: true
        });
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'chef',
          text: 'I could not connect to the culinary server right now. You can still ask me to scale portions (e.g. "Make this for 4") or set a kitchen timer completely offline!',
          handledLocally: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  // Question counts
  const usage = userProfile?.aiUsage || { rollingCount: 0, todayCount: 0 };
  const monthlyMax = isPremiumUser ? 100 : 5;
  const remainingMonthly = Math.max(0, monthlyMax - usage.rollingCount);

  // Quick friendly suggestion chips
  const quickPrompts = activeRecipe
    ? [
        `Make this for ${activeRecipe.servings === 2 ? 4 : 2}`,
        'What can I substitute in this?',
        'How do I tell when it is done?',
        'Is this dish spicy?'
      ]
    : [
        'What can I cook with chicken and rice?',
        'Convert 180°C to Fahrenheit',
        'Set a 15-minute timer',
        'What can I use instead of heavy cream?'
      ];

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-200"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-full sm:max-w-md md:max-w-lg bg-[#FBF9F5] border-l border-[#E8E1D7] shadow-2xl flex flex-col h-[100dvh] max-h-[100dvh] animate-in slide-in-from-right duration-200 overflow-x-hidden overflow-y-hidden"
      >
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#E8E1D7] bg-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#231B15] flex items-center justify-center text-[#FBF9F5] shadow-sm shrink-0">
              <ChefHat className="w-5 h-5 text-[#E8DAB7]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base text-[#231B15] truncate">
                  Ask Your Chef
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#F2F5EC] text-[#5C6B38] border border-[#D5DEBF] shrink-0">
                  Ready
                </span>
              </div>
              <p className="text-xs text-[#8E8277] truncate">
                {activeRecipe ? `Guiding: ${activeRecipe.title}` : 'Authentic Global Guidance'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <button
              onClick={() => setMessages([messages[0]])}
              className="p-2 rounded-lg text-[#8E8277] hover:text-[#231B15] hover:bg-[#F4F0E8] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#8E8277] hover:text-[#231B15] hover:bg-[#F4F0E8] transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Close assistant"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Question Allowance Strip */}
        <div className="px-4 py-2 bg-[#F7F4EE] border-b border-[#E8E1D7] flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-[#5E5248]">
            <Sparkles className="w-3.5 h-3.5 text-[#C85A32]" />
            <span>
              {isPremiumUser ? (
                <>AI Chef fair-use: <strong>{remainingMonthly}</strong> responses remaining this month (10/day max)</>
              ) : (
                <>Free trial: <strong>{remainingMonthly} of 5</strong> AI responses remaining · Local tools unlimited</>
              )}
            </span>
          </div>

          {!isPremiumUser ? (
            <button
              onClick={onOpenUnlockModal}
              className="text-[#C85A32] hover:underline font-semibold text-xs shrink-0"
            >
              Unlock 100/mo
            </button>
          ) : (
            <span className="text-[11px] text-[#5C6B38] font-medium shrink-0">World Pass</span>
          )}
        </div>

        {/* Messages Scroll Area with Absolute Mobile Wrap Protection */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-3.5 sm:p-5 space-y-4 touch-scroll w-full max-w-full overflow-x-hidden min-w-0">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col w-full max-w-full min-w-0 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed min-w-0 break-words [overflow-wrap:anywhere] overflow-x-hidden ${
                  msg.sender === 'user'
                    ? 'bg-[#231B15] text-[#FBF9F5] font-normal rounded-tr-sm shadow-sm'
                    : 'bg-white border border-[#E8E1D7] text-[#231B15] rounded-tl-sm shadow-sm'
                }`}
              >
                {msg.title && (
                  <p className="font-serif font-bold text-[#C85A32] text-sm mb-1.5 flex items-center gap-1.5 break-words [overflow-wrap:anywhere]">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{msg.title}</span>
                  </p>
                )}

                <div className="w-full max-w-full min-w-0 break-words [overflow-wrap:anywhere] overflow-x-hidden">
                  {renderFormattedChefMessage(msg.text, msg.sender === 'user')}
                </div>

                {msg.sender === 'chef' && msg.handledLocally && (
                  <div className="mt-2.5 pt-2 border-t border-[#E8E1D7] flex items-center gap-1.5 text-[11px] text-[#5C6B38] font-medium">
                    <Zap className="w-3.5 h-3.5 text-[#5C6B38] shrink-0" />
                    <span>Instant kitchen assistance · Ready offline</span>
                  </div>
                )}
              </div>

              <span className="text-[10px] text-[#8E8277] mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-[#E8E1D7] text-xs text-[#5E5248] w-fit shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#C85A32] animate-spin" />
              <span>Chef is preparing authentic guidance...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-3 border-t border-[#E8E1D7] bg-[#F7F4EE] overflow-x-auto scrollbar-none touch-scroll flex items-center gap-2 shrink-0">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="text-xs px-3.5 py-1.5 rounded-lg bg-white hover:bg-[#F4F0E8] text-[#5E5248] border border-[#E8E1D7] whitespace-nowrap transition-colors shadow-sm min-h-[34px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#E8E1D7] bg-white shrink-0 pb-[max(env(safe-area-inset-bottom),1rem)]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={activeRecipe ? `Ask about cooking ${activeRecipe.title}...` : 'Ask any cooking question...'}
              className="flex-1 py-2.5 px-3.5 rounded-xl bg-[#FBF9F5] border border-[#E8E1D7] text-xs sm:text-sm text-[#231B15] placeholder-[#8E8277] focus:outline-none focus:border-[#231B15] min-h-[44px]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isThinking}
              className="p-2.5 rounded-xl bg-[#231B15] hover:bg-[#3D322A] disabled:opacity-40 text-[#FBF9F5] font-medium transition-all shadow-sm min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Send className="w-4 h-4 text-[#E8DAB7]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
