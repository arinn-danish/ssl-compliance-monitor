import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  RotateCcw,
  Loader2,
  Copy,
  Check,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Building2,
  Paperclip,
  UploadCloud,
  FileSpreadsheet,
  FileJson,
  FileText,
  FileCode,
  File,
  Eye,
  X,
  Database,
  ImageIcon
} from 'lucide-react';
import {
  queryGeminiEnterpriseAgent,
  getAgentStatus,
  AgentStatusInfo,
  ChatMessage,
  ChatAttachment
} from '../services/geminiEnterpriseService';
import { firestoreService } from '../services/firebase';
import { UserPersona, LibraryProgram, AuditCycleRecord } from '../types';
import {
  ProcessedAttachment,
  processFile
} from '../utils/fileDataProcessor';
import {
  EnterDataModal,
  InspectAttachmentModal
} from './ChatDataModal';
import { AICitationCard } from './AICitationCard';
import { AICitation } from '../types';

interface GeminiAgentChatProps {
  currentPersona: UserPersona;
  programs: LibraryProgram[];
  selectedProgramId?: string;
  onSelectProgram?: (id: string) => void;
  statutoryClause?: string;
  isFloating?: boolean;
  onClose?: () => void;
}

function extractCitationsFromMessage(content: string): AICitation[] {
  const citations: AICitation[] = [];
  const lower = content.toLowerCase();

  if (lower.includes('section 3') || lower.includes('seksyen 3')) {
    citations.push({
      id: 'cit-sec-3',
      title: 'Sabah State Library Enactment 1988 — Section 3: Functions & Statutory Powers',
      enactmentSection: 'Section 3',
      excerpt: 'The State Library shall maintain, manage and develop the public library services in Sabah, acquire and preserve library materials reflecting cultural heritage.',
      relevance: 'Statutory Authority & Core Functions',
      type: 'ENACTMENT',
      sourceUrl: 'https://lawnet.sabah.gov.my',
      fullText: 'Section 3(1): It shall be the function of the Library to promote and facilitate the establishment, maintenance and development of public library services in the State, and acquire and preserve library materials reflecting the historical, cultural and scientific heritage of the State.',
      crossReferences: ['Section 8 (Powers of Director)', 'Section 14 (Disposal)', 'State Heritage Policy']
    });
  }

  if (lower.includes('section 6') || lower.includes('seksyen 6') || lower.includes('legal deposit') || lower.includes('penyerahan')) {
    citations.push({
      id: 'cit-sec-6',
      title: 'Sabah State Library Enactment 1988 — Section 6: Statutory Legal Deposit of Published Materials',
      enactmentSection: 'Section 6',
      excerpt: 'The publisher of every book published in the State shall, within one month after publication, deliver at his own expense two copies to the Director at the State Library.',
      relevance: 'Mandatory Statutory Legal Deposit',
      type: 'ENACTMENT',
      sourceUrl: 'https://lawnet.sabah.gov.my',
      fullText: 'Section 6(1): The publisher of every book published in the State shall, within one month after publication, deliver at his own expense two copies of the book to the Director at the State Library headquarters.\nPenalty: Non-compliance carries fine or statutory enforcement notices under state regulations.',
      crossReferences: ['Section 7 (Cataloguing)', 'National Library Act 1986', 'Preservation Guidelines']
    });
  }

  if (lower.includes('section 8') || lower.includes('seksyen 8') || lower.includes('kuasa pengarah') || lower.includes('pengarah')) {
    citations.push({
      id: 'cit-sec-8',
      title: 'Sabah State Library Enactment 1988 — Section 8: Powers & Executive Governance of the Director',
      enactmentSection: 'Section 8',
      excerpt: 'Subject to the general direction of the Minister, the Director shall have the control and management of the Library and shall be responsible for carrying out the provisions of this Enactment.',
      relevance: 'Executive Governance Mandate',
      type: 'ENACTMENT',
      sourceUrl: 'https://lawnet.sabah.gov.my',
      fullText: 'Section 8: The Director shall be the principal executive officer responsible for administrative oversight, state branch inspections, rural mobile libraries, and statutory legal deposit enforcement across Sabah.',
      crossReferences: ['Section 3 (Functions)', 'Section 9 (Officers)', 'KSTI Governance Framework']
    });
  }

  if (lower.includes('section 14') || lower.includes('seksyen 14') || lower.includes('disposal') || lower.includes('pelupusan')) {
    citations.push({
      id: 'cit-sec-14',
      title: 'Sabah State Library Enactment 1988 — Section 14: Preservation, Custodianship & Deaccessioning',
      enactmentSection: 'Section 14',
      excerpt: 'Statutory procedures governing the deaccessioning, disposal, write-off, and archival preservation of damaged or obsolete library assets under statutory review.',
      relevance: 'Asset Custodianship & Archival Preservation',
      type: 'ENACTMENT',
      sourceUrl: 'https://lawnet.sabah.gov.my',
      crossReferences: ['State Financial By-laws', 'National Archives Standards']
    });
  }

  if (lower.includes('pelan strategik') || lower.includes('strategic plan') || lower.includes('2026-2028') || lower.includes('2026–2028') || lower.includes('pillar') || lower.includes('teras')) {
    citations.push({
      id: 'cit-strat-plan',
      title: 'Pelan Strategik Perpustakaan Negeri Sabah (PNS) 2026–2028',
      excerpt: 'Strategic governance framework aligning four core pillars: Statutory Enactment, Rural Inclusivity, Digital Modernization, and Lifelong Learning.',
      relevance: 'State Strategic Direction (KSTI)',
      type: 'STRATEGIC_PLAN',
      fullText: 'Pillar 1: Pemerkasaan Statutori & Pematuhan Enakmen 1988\nPillar 2: Perpustakaan Digital & Pemodenan Kecerdasan Buatan (AI)\nPillar 3: Pemerkasaan Literasi Luar Bandar & Komuniti Terpencil\nPillar 4: Pemeliharaan Warisan Tempatan & Pendepositan Berkanun',
      crossReferences: ['Sabah Maju Jaya (SMJ)', 'KSTI Digital Blueprint', 'UN SDG 4: Quality Education']
    });
  }

  if (lower.includes('job description') || lower.includes('ksti') || lower.includes('deskripsi tugas') || lower.includes('bidang kuasa')) {
    citations.push({
      id: 'cit-ksti-jd',
      title: 'KSTI Circular No. 3/2024 — Directorate Executive Governance Standards',
      excerpt: 'Prescribing operational mandates, statutory reporting obligations, and executive KPIs for the Director of Sabah State Library.',
      relevance: 'KSTI Executive Governance Standards',
      type: 'AUDIT_CIRCULAR',
      fullText: 'Core responsibilities:\n1. Statutory enforcement of Sabah State Library Enactment 1988\n2. Financial custodianship and development grant execution\n3. Rural library infrastructure and mobile literacy outreach\n4. Digital transformation and AI Enterprise catalog governance',
      crossReferences: ['Perkhidmatan Awam Negeri Sabah (PANS)', 'Enactment 1988']
    });
  }

  return citations;
}

const SUGGESTED_QUERIES = [
  'Berdasarkan enakmen2 dan Polisi Perpustakaan, apakah cadangan job description untuk pengarah perpustakaan negeri Sabah.',
  'What are the statutory powers of the Sabah State Library under Section 3 of the Enactment 1988?',
  'What are the mandatory legal deposit requirements for publishers under Section 6?',
  'Explain the Director’s powers regarding branch libraries and disposal of books under the Enactment.',
  'How do Sabah State Library statutory rules govern rural library services?'
];

export const GeminiAgentChat: React.FC<GeminiAgentChatProps> = ({
  currentPersona,
  programs,
  selectedProgramId,
  onSelectProgram,
  statutoryClause = 'Sabah State Library Enactment 1988',
  isFloating,
  onClose
}) => {
  const [agentInfo, setAgentInfo] = useState<AgentStatusInfo | null>(null);

  useEffect(() => {
    getAgentStatus().then((info) => {
      if (info) setAgentInfo(info);
    });
  }, []);

  const activeAgentId = agentInfo?.agentId || '9469390002127365054';

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    // Initial friendly greeting from the assistant
    return [
      {
        id: 'welcome-msg',
        role: 'assistant',
        content: `**Selamat Datang / Welcome to the Sabah State Library Statutory AI Assistant.**\n\nSaya bersambung terus dengan AI Agent dari Secrets (**ID: 9469390002127365054**) untuk menilai pematuhan statutori di bawah **Enakmen Perpustakaan Negeri Sabah 1988 (Pindaan 2022)** dan Pelan Strategik 2026–2028.\n\nAnda boleh bertanyakan soalan dasar/operasi (seperti cadangan *Job Description Pengarah & Pegawai*), atau **muat naik sebarang fail/data** (PDF laporan, CSV data, JSON, lembaran kerja, atau draf statutori) untuk analisis pematuhan segera.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        authorName: 'Gemini Enterprise Agent'
      }
    ];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [streamingProgress, setStreamingProgress] = useState('');
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  // File and data attachment state
  const [stagedAttachments, setStagedAttachments] = useState<ProcessedAttachment[]>([]);
  const [isEnterDataOpen, setIsEnterDataOpen] = useState(false);
  const [inspectingAttachment, setInspectingAttachment] = useState<ProcessedAttachment | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef<number>(0);

  // Auto-scroll on new messages or during active streaming
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingProgress, isLoading, stagedAttachments]);

  // Handle "New conversation"
  const handleNewConversation = () => {
    if (isLoading) return;
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `**New conversation started.**\n\nI am ready for your inquiries regarding the **Sabah State Library Enactment 1988**, branch operations, and program compliance. You can also upload any files or data for instant analysis.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        authorName: 'Gemini Enterprise Agent'
      }
    ]);
    setInputQuery('');
    setStagedAttachments([]);
    setStreamingProgress('');
    inputRef.current?.focus();
  };

  // Copy message text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => {
      setCopiedMsgId(null);
    }, 2000);
  };

  // Process and stage newly selected or dropped files
  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsProcessingFiles(true);
    try {
      const fileArray = Array.from(files);
      const processedList: ProcessedAttachment[] = [];
      for (const file of fileArray) {
        const processed = await processFile(file);
        processedList.push(processed);
      }
      setStagedAttachments((prev) => [...prev, ...processedList]);
    } catch (err) {
      console.error('Failed to process uploaded files:', err);
    } finally {
      setIsProcessingFiles(false);
      // Reset input value so re-selecting same file triggers onChange
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveStagedAttachment = (id: string) => {
    setStagedAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleClearAllAttachments = () => {
    setStagedAttachments([]);
  };

  const handleAttachDataSnippet = (snippet: ProcessedAttachment) => {
    setStagedAttachments((prev) => [...prev, snippet]);
  };

  // Helper to render icon for attachment format
  const renderAttachmentIcon = (format: ProcessedAttachment['format'], className = 'w-4 h-4') => {
    switch (format) {
      case 'csv':
        return <FileSpreadsheet className={`${className} text-emerald-600`} />;
      case 'json':
        return <FileJson className={`${className} text-amber-600`} />;
      case 'pdf':
        return <FileText className={`${className} text-rose-600`} />;
      case 'image':
        return <ImageIcon className={`${className} text-blue-600`} />;
      case 'code':
        return <FileCode className={`${className} text-indigo-600`} />;
      default:
        return <File className={`${className} text-slate-500`} />;
    }
  };

  // Submit message
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    const hasAttachments = stagedAttachments.length > 0;

    if ((!query && !hasAttachments) || isLoading) return;

    const userTimestamp = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });

    const activeAttachments = [...stagedAttachments];

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query || (hasAttachments ? 'Please analyze the attached file(s) and data under Sabah State Library governance and statutory mandates.' : ''),
      timestamp: userTimestamp,
      authorName: currentPersona.name,
      attachments: activeAttachments.length > 0 ? activeAttachments : undefined
    };

    // Add user message to chat immediately and reset staged inputs
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputQuery('');
    setStagedAttachments([]);
    setIsLoading(true);
    setStreamingProgress('');

    // Context from recent conversation (last 4-6 messages before this current query)
    const contextHistory = messages
      .filter((m) => m.id !== 'welcome-msg' && !m.isError)
      .slice(-6)
      .map((m) => ({
        role: m.role,
        content: m.content
      }));

    const targetProg = programs.find((p) => p.id === selectedProgramId);
    const startTime = Date.now();

    try {
      // Call existing server-side route via service with question, attachments, & agentId
      const result = await queryGeminiEnterpriseAgent(userMessage.content, {
        messages: contextHistory,
        attachments: activeAttachments,
        agentId: activeAgentId,
        onProgress: (partial) => {
          setStreamingProgress(partial);
        }
      });

      const execDuration = Date.now() - startTime;
      const isOk = result.success && result.answer && result.answer.trim().length > 0;
      const finalContent = isOk
        ? result.answer!
        : 'No response was generated. Try rephrasing your question.';

      let savedAuditId = '';

      // Save each exchange to Firebase audit log
      try {
        const cleanSummary = isOk
          ? finalContent
              .replace(/[#*`_\[\]]/g, '')
              .replace(/\s+/g, ' ')
              .trim()
              .slice(0, 250) + (finalContent.length > 250 ? '...' : '')
          : 'Query resulted in no response generated.';

        const attachmentsSummary = activeAttachments.length > 0
          ? ` [${activeAttachments.length} attached: ${activeAttachments.map((a) => a.name).join(', ')}]`
          : '';

        const auditCycle: AuditCycleRecord = {
          id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          timestamp: new Date().toISOString(),
          summary: `Gemini Enterprise Chat Inquiry: "${userMessage.content.slice(0, 70)}${userMessage.content.length > 70 ? '...' : ''}"${attachmentsSummary}`,
          cycleType: 'AGENT_ASSIST_QUERY',
          officerName: currentPersona.name,
          officerRole: currentPersona.designation || currentPersona.role,
          status: isOk ? 'SUCCESS' : 'WARNING',
          executionTimeMs: execDuration,
          input: {
            action: 'GEMINI_ENTERPRISE_STREAM_ASSIST',
            targetProgramId: selectedProgramId,
            targetProgramName: targetProg?.name,
            statutoryClause: statutoryClause,
            submittedBy: currentPersona.name,
            payload: {
              query: { text: userMessage.content },
              messagesCount: updatedMessages.length,
              attachmentsCount: activeAttachments.length,
              attachments: activeAttachments.map((a) => ({
                name: a.name,
                type: a.type,
                format: a.format,
                sizeFormatted: a.sizeFormatted
              }))
            }
          },
          output: {
            resultSummary: `Agent response received (${finalContent.length} chars)`,
            statusBadge: isOk ? 'AGENT_ANSWERED' : 'AGENT_NO_RESPONSE',
            details: {
              question: userMessage.content,
              answerMarkdown: finalContent,
              statutoryClauseAssessed: statutoryClause,
              attachmentsAnalyzed: activeAttachments.map((a) => a.name)
            }
          },
          rawPayload: {
            query: userMessage.content,
            attachmentsCount: activeAttachments.length,
            answer: finalContent
          }
        };

        await firestoreService.recordAuditCycle(auditCycle);
        savedAuditId = auditCycle.id;

        await firestoreService.addAuditLog({
          question: `${userMessage.content}${attachmentsSummary}`,
          timestamp: auditCycle.timestamp,
          summary: cleanSummary,
          userEmail: currentPersona.email || 'antoniapeter.sani@sabah.gov.my',
          userId: currentPersona.id,
          userName: currentPersona.name,
          rawAnswer: finalContent,
          status: isOk ? 'SUCCESS' : 'NO_RESPONSE'
        });
      } catch (fbErr) {
        console.warn('Firebase audit recording note:', fbErr);
      }

      const agentTimestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      const assistantMessage: ChatMessage = {
        id: `agent-${Date.now()}`,
        role: 'assistant',
        content: finalContent,
        timestamp: agentTimestamp,
        authorName: 'Gemini Enterprise Agent',
        isError: !isOk,
        auditId: savedAuditId
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const agentTimestamp = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      });

      const errorMessage: ChatMessage = {
        id: `agent-err-${Date.now()}`,
        role: 'assistant',
        content: 'No response was generated. Try rephrasing your question or re-uploading your data.',
        timestamp: agentTimestamp,
        authorName: 'Gemini Enterprise Agent',
        isError: true
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setStreamingProgress('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div
      id="gemini-agent-chat-window"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[760px] max-h-[88vh]"
    >
      {/* DRAG & DROP FULL OVERLAY */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-40 bg-emerald-900/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white border-2 border-dashed border-emerald-400 m-2 rounded-xl pointer-events-none animate-in fade-in duration-150">
          <div className="w-16 h-16 rounded-2xl bg-emerald-800 flex items-center justify-center text-emerald-300 mb-3 shadow-lg ring-4 ring-emerald-500/30">
            <UploadCloud className="w-8 h-8 animate-bounce" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">
            Drop Any File or Dataset into Chat
          </h3>
          <p className="text-xs text-emerald-100 max-w-md">
            PDF reports, CSV datasets, JSON records, Word documents, images, code, or logs will be attached and analyzed by the AI Agent.
          </p>
        </div>
      )}

      {/* CHAT HEADER */}
      <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Gemini Enterprise Statutory Assistant
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Agent
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Agent ID: {activeAgentId}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Sabah State Library Enactment 1988 • Multimodal File &amp; Data Analysis
            </p>
          </div>
        </div>

        {/* Action Controls & New Conversation Button */}
        <div className="flex items-center gap-2">
          {/* Optional Program Selector */}
          {programs.length > 0 && onSelectProgram && (
            <div className="hidden sm:flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="chat-program-context-selector"
                value={selectedProgramId || ''}
                onChange={(e) => onSelectProgram(e.target.value)}
                className="text-xs py-1 px-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 max-w-[180px] truncate"
                title="Target Library Initiative Context"
              >
                <option value="">All Programs / General</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* New Conversation Button */}
          <button
            type="button"
            id="chat-new-conversation-btn"
            onClick={handleNewConversation}
            disabled={isLoading}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            title="Clear chat and start a new conversation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">New conversation</span>
          </button>

          {/* Floating Drawer Close Button */}
          {onClose && (
            <button
              type="button"
              id="chat-close-drawer-btn"
              onClick={onClose}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition cursor-pointer"
              title="Close Chat Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* SCROLLABLE MESSAGE LIST */}
      <div
        id="chat-message-list"
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-900/30"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedMsgId === msg.id;
          const hasMsgAttachments = msg.attachments && msg.attachments.length > 0;

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-2xs transition-all ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-tr-xs'
                    : msg.isError
                    ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-tl-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-xs'
                }`}
              >
                {/* Bubble Header */}
                <div
                  className={`flex items-center justify-between gap-3 text-[10px] pb-1.5 mb-1.5 border-b ${
                    isUser
                      ? 'border-emerald-600/50 text-emerald-100'
                      : 'border-slate-100 dark:border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="font-bold flex items-center gap-1">
                    {isUser ? (
                      <>
                        <User className="w-3 h-3" />
                        <span>{msg.authorName || currentPersona.name}</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>AI Agent #{activeAgentId}</span>
                      </>
                    )}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Attached Files / Data in User Bubble */}
                {isUser && hasMsgAttachments && (
                  <div className="mb-2.5 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                      <Paperclip className="w-3 h-3" />
                      <span>Attached Evidence &amp; Data ({msg.attachments!.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {msg.attachments!.map((att) => (
                        <div
                          key={att.id}
                          onClick={() => setInspectingAttachment(att)}
                          className="bg-emerald-800/80 hover:bg-emerald-800 border border-emerald-600/60 rounded-xl p-2 cursor-pointer transition flex items-center justify-between gap-2 text-left"
                          title="Click to view file content"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-emerald-950/70 flex items-center justify-center shrink-0">
                              {renderAttachmentIcon(att.format, 'w-3.5 h-3.5')}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold truncate text-white">
                                {att.name}
                              </p>
                              <p className="text-[10px] text-emerald-200 font-mono">
                                {att.sizeFormatted} • {att.format.toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <Eye className="w-3.5 h-3.5 text-emerald-200 hover:text-white shrink-0" />
                        </div>
                      ))}
                    </div>

                    {/* Image thumbnails if any */}
                    {msg.attachments!.some((a) => a.previewUrl) && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {msg.attachments!
                          .filter((a) => a.previewUrl)
                          .map((imgAtt) => (
                            <img
                              key={imgAtt.id}
                              src={imgAtt.previewUrl}
                              alt={imgAtt.name}
                              onClick={() => setInspectingAttachment(imgAtt)}
                              className="h-16 w-24 object-cover rounded-lg border border-emerald-500/50 cursor-pointer hover:opacity-90 transition"
                              title="Click to expand image"
                            />
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Bubble Content */}
                {isUser ? (
                  <p className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                    {msg.content}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <div className="markdown-body text-xs sm:text-sm leading-relaxed space-y-2 font-sans text-slate-800 dark:text-slate-100">
                      <Markdown>{msg.content}</Markdown>
                    </div>

                    {/* Structured AI Citation Cards */}
                    {(() => {
                      const citations = extractCitationsFromMessage(msg.content);
                      if (citations.length === 0) return null;
                      return (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Statutory Sources &amp; Citations Referenced ({citations.length}):</span>
                          </div>
                          <div className="space-y-1.5">
                            {citations.map((citation) => (
                              <AICitationCard key={citation.id} citation={citation} />
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Assistant Footer Info (Audit badge & Copy) */}
                    <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-[10px]">
                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Saved to Firebase Audit Log</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition cursor-pointer flex items-center gap-1"
                        title="Copy answer"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-600 font-semibold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 mt-0.5 font-bold text-xs">
                  {currentPersona.name.charAt(0)}
                </div>
              )}
            </div>
          );
        })}

        {/* ACTIVE LOADING / STREAMING INDICATOR BUBBLE */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-800 dark:text-emerald-300 shrink-0 mt-0.5">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
            </div>

            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tl-xs p-4 bg-white dark:bg-slate-800 border border-emerald-500/40 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-slate-100 dark:border-slate-700 text-slate-400">
                <span className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                  <Sparkles className="w-3 h-3 animate-pulse" />
                  <span>Gemini Enterprise Agent • Formulating Response...</span>
                </span>
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Streaming
                </span>
              </div>

              {streamingProgress ? (
                <div className="markdown-body text-xs sm:text-sm leading-relaxed space-y-2 font-sans text-slate-800 dark:text-slate-100">
                  <Markdown>{streamingProgress}</Markdown>
                </div>
              ) : (
                <div className="flex items-center gap-2 py-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                  <span>Querying statutory knowledge base and analyzing uploaded data...</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* SUGGESTED QUICK PROMPTS (Visible when chat is short and no attachments) */}
      {messages.length <= 2 && !isLoading && stagedAttachments.length === 0 && (
        <div className="px-4 py-2 bg-slate-50/90 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-2 overflow-x-auto text-[11px] shrink-0">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] shrink-0">
            Suggested:
          </span>
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 whitespace-nowrap transition cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* STAGED ATTACHMENTS TRAY (Shown before sending) */}
      {stagedAttachments.length > 0 && (
        <div className="px-4 py-2.5 bg-emerald-50/50 dark:bg-emerald-950/20 border-t border-emerald-100 dark:border-emerald-900/30 flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Staged Files &amp; Datasets ({stagedAttachments.length})</span>
            </span>
            <button
              type="button"
              onClick={handleClearAllAttachments}
              className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 font-medium cursor-pointer"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
            {stagedAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 shadow-2xs text-xs group"
              >
                <div className="shrink-0">{renderAttachmentIcon(att.format, 'w-3.5 h-3.5')}</div>
                <div className="min-w-0 max-w-[160px]">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {att.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {att.sizeFormatted}
                    {att.metadata?.rowCount ? ` • ${att.metadata.rowCount} rows` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => setInspectingAttachment(att)}
                    className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                    title="Preview extracted content"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveStagedAttachment(att.id)}
                    className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Remove attachment"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CHAT INPUT AREA */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shrink-0">
        {/* Hidden native file input accepting ANY file type */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
          accept="*/*"
        />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="space-y-2"
        >
          <div className="flex items-end gap-2">
            <div className="relative flex-1">
              <textarea
                ref={inputRef}
                id="chat-input-textarea"
                rows={2}
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                placeholder={
                  stagedAttachments.length > 0
                    ? `Ask anything about your attached ${stagedAttachments.length} file(s)/data, or press Send to analyze...`
                    : 'Ask a question, or attach files/data to evaluate under Sabah State Library Enactment 1988...'
                }
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 resize-none transition"
              />
            </div>

            <button
              type="submit"
              id="chat-send-btn"
              disabled={isLoading || (!inputQuery.trim() && stagedAttachments.length === 0)}
              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 h-[44px]"
              title="Send message to agent"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>

          {/* Upload and quick action toolbar */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              {/* Attach file button */}
              <button
                type="button"
                id="chat-attach-file-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isProcessingFiles}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Attach any file (PDF, CSV, Excel, JSON, Word, images, TXT, code)"
              >
                {isProcessingFiles ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                ) : (
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>Attach File</span>
              </button>

              {/* Paste / Enter Data button */}
              <button
                type="button"
                id="chat-paste-data-btn"
                onClick={() => setIsEnterDataOpen(true)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-400 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                title="Paste CSV, JSON tables, or statutory text records"
              >
                <Database className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Paste Data / Dataset</span>
              </button>

              <span className="text-[11px] text-slate-400 hidden md:inline">
                or drag &amp; drop files directly into window
              </span>
            </div>

            <div className="text-[11px] text-slate-400 hidden sm:flex items-center gap-2">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Audited exchange</span>
              </span>
              <span>•</span>
              <span>Shift+Enter for newline</span>
            </div>
          </div>
        </form>
      </div>

      {/* MODAL: ENTER / PASTE DATA */}
      <EnterDataModal
        isOpen={isEnterDataOpen}
        onClose={() => setIsEnterDataOpen(false)}
        onAttachData={handleAttachDataSnippet}
      />

      {/* MODAL: INSPECT / PREVIEW ATTACHED FILE OR DATA */}
      <InspectAttachmentModal
        attachment={inspectingAttachment}
        onClose={() => setInspectingAttachment(null)}
      />
    </div>
  );
};
