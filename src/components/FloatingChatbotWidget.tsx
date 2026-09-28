import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles, ShieldCheck, ChevronDown, MessageSquare } from 'lucide-react';
import { GeminiAgentChat } from './GeminiAgentChat';
import { UserPersona, LibraryProgram } from '../types';

interface FloatingChatbotWidgetProps {
  currentPersona: UserPersona;
  programs: LibraryProgram[];
  selectedProgramId?: string;
  onSelectProgram?: (id: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

export const FloatingChatbotWidget: React.FC<FloatingChatbotWidgetProps> = ({
  currentPersona,
  programs,
  selectedProgramId,
  onSelectProgram,
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const toggleOpen = () => {
    if (controlledOnToggle) {
      controlledOnToggle();
    } else {
      setInternalIsOpen(!internalIsOpen);
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        toggleOpen();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <div
      id="floating-ai-chatbot-root"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end pointer-events-none"
    >
      {/* EXPANDED CHAT DRAWER */}
      {isOpen && (
        <div
          id="floating-ai-chat-drawer"
          className="pointer-events-auto mb-3 w-[94vw] sm:w-[460px] md:w-[500px] h-[82vh] max-h-[720px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-250 ease-out"
        >
          <GeminiAgentChat
            currentPersona={currentPersona}
            programs={programs}
            selectedProgramId={selectedProgramId}
            onSelectProgram={onSelectProgram}
            isFloating={true}
            onClose={toggleOpen}
          />
        </div>
      )}

      {/* FLOATING ACTION TRIGGER BUTTON */}
      <div className="pointer-events-auto flex items-center gap-2">
        {!isOpen && (
          <div
            onClick={toggleOpen}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-800 text-white text-xs font-semibold shadow-lg backdrop-blur-xs border border-slate-700/50 cursor-pointer hover:bg-slate-900 transition-all transform hover:scale-105"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SSL AI Assistant</span>
            <span className="text-[10px] text-slate-400 font-mono">Agent #9469</span>
          </div>
        )}

        <button
          type="button"
          id="floating-ai-trigger-btn"
          onClick={toggleOpen}
          aria-label={isOpen ? 'Close AI Assistant' : 'Open Sabah State Library AI Assistant'}
          className={`w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer relative group ${
            isOpen
              ? 'bg-slate-800 dark:bg-slate-700 text-white rotate-90 ring-4 ring-slate-400/20'
              : 'bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white ring-4 ring-emerald-500/25 hover:shadow-emerald-500/30'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 transition-transform" />
          ) : (
            <>
              <Bot className="w-7 h-7 group-hover:rotate-6 transition-transform" />
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
