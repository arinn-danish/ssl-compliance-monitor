import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  FileCheck2,
  Upload,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Send,
  RotateCcw,
  Plus,
  Trash2,
  Building2,
  Layers,
  ArrowRight,
  Eye,
  Sliders,
  Sparkles,
  Info,
  Calendar,
  User,
  Paperclip,
  Check,
  ExternalLink,
  ChevronRight,
  Filter,
  Search,
  Loader2,
  Bot,
  KeyRound,
  Copy
} from 'lucide-react';
import {
  LibraryProgram,
  StrategicPillar,
  ProgramEvaluation,
  EvidenceDocument,
  ComplianceRisk,
  ProgramKPI,
  UserPersona,
  DocumentType,
  EvaluationScoreCriteria,
  AuditCycleRecord
} from '../types';
import { StrategicAlignmentMatrix } from './StrategicAlignmentMatrix';
import { EvidenceRepositoryView } from './EvidenceRepositoryView';
import { RiskRegisterView } from './RiskRegisterView';
import { PrismaSchemaViewer } from './PrismaSchemaViewer';
import { GeminiAgentChat } from './GeminiAgentChat';
import { queryGeminiEnterpriseAgent } from '../services/geminiEnterpriseService';
import { firestoreService } from '../services/firebase';

interface CoreInterfacePortalProps {
  programs: LibraryProgram[];
  pillars: StrategicPillar[];
  evaluations: ProgramEvaluation[];
  evidenceDocs: EvidenceDocument[];
  risks: ComplianceRisk[];
  kpis: ProgramKPI[];
  currentPersona: UserPersona;
  onSubmitAudit: (evalData: {
    programId: string;
    evaluatorId: string;
    evaluatorName: string;
    evaluatorRole: string;
    scores: EvaluationScoreCriteria;
    statutoryEnactmentClause: string;
    gapsIdentified: string[];
    auditorNotes: string;
    correctiveAction?: {
      actionRequired: string;
      assignedOfficer: string;
      dueDate: string;
      escalationLevel: 'INTERNAL' | 'DIRECTOR_ESCALATION' | 'MINISTRY_NOTICE';
    };
  }) => Promise<void>;
  onUploadEvidence: (docData: Partial<EvidenceDocument>) => Promise<void>;
  onVerifyEvidence: (id: string, status: 'VERIFIED' | 'PENDING' | 'FLAGGED') => Promise<void>;
  onCreateRisk: (riskData: Partial<ComplianceRisk>) => Promise<void>;
  onUpdateRiskStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED') => Promise<void>;
  onOpenProgramDetail: (prog: LibraryProgram) => void;
  onOpenAuditModal: (prog: LibraryProgram) => void;
  onOpenNewProgramModal: () => void;
}

const COMMON_GAPS = [
  'Missing statutory legal deposit gazette notice',
  'Preservation temperature & humidity logging deficiency',
  'Branch operating below minimum statutory public hours',
  'Quarterly financial utilization disclosure pending',
  'Mobile outreach vehicle safety inspection overdue',
  'Indigenous oral history recording metadata incomplete'
];

const STATUTORY_CLAUSE_PRESETS = [
  'Sabah State Library Enactment 1988, Section 6 (Powers and Duties of Director)',
  'Sabah State Library Enactment 1988, Section 7 (Statutory Legal Deposit of State Literature)',
  'Sabah State Library Enactment 1988, Section 12 (Rural Branch Stations & Mobile Fleet Outreach)',
  'Sabah State Library Enactment 1988, Section 14 (Special Borneo Collections & Heritage Archives)'
];

export const CoreInterfacePortal: React.FC<CoreInterfacePortalProps> = ({
  programs,
  pillars,
  evaluations,
  evidenceDocs,
  risks,
  kpis,
  currentPersona,
  onSubmitAudit,
  onUploadEvidence,
  onVerifyEvidence,
  onCreateRisk,
  onUpdateRiskStatus,
  onOpenProgramDetail,
  onOpenAuditModal,
  onOpenNewProgramModal
}) => {
  // Sub-navigation within Core Interface: Default to interactive Agent Chat interface
  const [subView, setSubView] = useState<'chat' | 'rubric' | 'matrix' | 'evidence' | 'risks' | 'schema'>('chat');

  // Form State
  const [selectedProgramId, setSelectedProgramId] = useState<string>(programs[0]?.id || '');
  const [statutoryClause, setStatutoryClause] = useState<string>(
    programs[0]?.statutoryReference || STATUTORY_CLAUSE_PRESETS[0]
  );
  
  // 4 Core evaluation criteria (0-25 each, sum = 100)
  const [scores, setScores] = useState<EvaluationScoreCriteria>({
    statutoryEnactment: 22,
    strategicRelevance: 21,
    executionIntegrity: 20,
    communityImpact: 21
  });

  const [activeGaps, setActiveGaps] = useState<string[]>(['Missing statutory legal deposit gazette notice']);
  const [customGapInput, setCustomGapInput] = useState<string>('');
  const [auditorNotes, setAuditorNotes] = useState<string>(
    'Formal compliance inspection conducted under Enactment 1988. Operations demonstrate commendable adherence to rural outreach directives, with legal deposit notices requiring expedited resolution.'
  );

  // Corrective Action Plan
  const [includeCAP, setIncludeCAP] = useState<boolean>(false);
  const [capAction, setCapAction] = useState<string>('Publish official legal deposit gazette notice in Sabah Government Gazette.');
  const [capOfficer, setCapOfficer] = useState<string>(programs[0]?.leadOfficer || 'Antonia Peter Sani');
  const [capDueDate, setCapDueDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [capEscalation, setCapEscalation] = useState<'INTERNAL' | 'DIRECTOR_ESCALATION' | 'MINISTRY_NOTICE'>('INTERNAL');

  // File Drop Zone State
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    size: string;
    type: DocumentType;
    provenance: string;
  } | null>({
    name: 'Statutory_Inspection_SSL_2026.pdf',
    size: '2.4 MB',
    type: 'INSPECTION_REPORT',
    provenance: 'Internal Audit & Compliance Directorate verification report'
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Submission & Feedback State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gemini Enterprise Agent State
  const [agentStreamingProgress, setAgentStreamingProgress] = useState<string>('');
  const [agentFinalAnswer, setAgentFinalAnswer] = useState<string | null>(null);
  const [agentStatus, setAgentStatus] = useState<'IDLE' | 'STREAMING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [agentErrorMessage, setAgentErrorMessage] = useState<string | null>(null);
  const [agentLastQuery, setAgentLastQuery] = useState<string>('');
  const [agentSavedAuditId, setAgentSavedAuditId] = useState<string | null>(null);
  const [copiedAnswer, setCopiedAnswer] = useState(false);

  // Filter for Results area
  const [resultsFilter, setResultsFilter] = useState<'ALL' | 'FULL' | 'PARTIAL' | 'NON_COMPLIANT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected program object
  const currentProgram = programs.find(p => p.id === selectedProgramId) || programs[0];

  // Update clause and officer when program changes
  const handleProgramChange = (progId: string) => {
    setSelectedProgramId(progId);
    const found = programs.find(p => p.id === progId);
    if (found) {
      if (found.statutoryReference) setStatutoryClause(found.statutoryReference);
      if (found.leadOfficer) setCapOfficer(found.leadOfficer);
    }
  };

  // Calculations for Dynamic Summary Area
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      (Number(scores.statutoryEnactment) || 0) +
      (Number(scores.strategicRelevance) || 0) +
      (Number(scores.executionIntegrity) || 0) +
      (Number(scores.communityImpact) || 0)
    )
  );

  const calculatedAlignment: 'FULL' | 'PARTIAL' | 'NON_COMPLIANT' =
    totalScore >= 80 ? 'FULL' : totalScore >= 50 ? 'PARTIAL' : 'NON_COMPLIANT';

  // Toggle GAP
  const toggleGap = (gapText: string) => {
    if (activeGaps.includes(gapText)) {
      setActiveGaps(activeGaps.filter(g => g !== gapText));
    } else {
      setActiveGaps([...activeGaps, gapText]);
    }
  };

  const handleAddCustomGap = () => {
    if (!customGapInput.trim()) return;
    if (!activeGaps.includes(customGapInput.trim())) {
      setActiveGaps([...activeGaps, customGapInput.trim()]);
    }
    setCustomGapInput('');
  };

  // Drag & Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({
        name: file.name,
        size: `${sizeMB} MB`,
        type: 'INSPECTION_REPORT',
        provenance: `Uploaded evidence verified by ${currentPersona.name}`
      });
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setAttachedFile({
        name: file.name,
        size: `${sizeMB} MB`,
        type: 'INSPECTION_REPORT',
        provenance: `Uploaded evidence verified by ${currentPersona.name}`
      });
    }
  };

  // Reset form to defaults
  const handleResetForm = () => {
    setScores({
      statutoryEnactment: 20,
      strategicRelevance: 20,
      executionIntegrity: 20,
      communityImpact: 20
    });
    setActiveGaps([]);
    setAuditorNotes('');
    setIncludeCAP(false);
    setAttachedFile(null);
    setSubmitSuccessMsg(null);
    setErrorMessage(null);
  };

  // Submit Handler - Wired to Gemini Enterprise Agent and Firestore Audit Log
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // The question from the existing form (auditorNotes textarea or statutory clause inquiry)
    const questionText = (auditorNotes || '').trim() || (statutoryClause || '').trim() || `Statutory compliance evaluation inquiry for ${currentProgram?.name || 'Sabah State Library programs'} under the Sabah State Library Enactment 1988`;

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSubmitSuccessMsg(null);
      setAgentErrorMessage(null);
      setAgentStreamingProgress('');
      setAgentFinalAnswer(null);
      setAgentStatus('STREAMING');
      setAgentLastQuery(questionText);
      setAgentSavedAuditId(null);

      // Scroll smoothly to the results area so progress is visible immediately (not a blank screen)
      const resultsEl = document.getElementById('core-output-results-area');
      if (resultsEl) {
        resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      const startTime = Date.now();

      // Send the question to the server-side Gemini Enterprise stream-assist route
      const result = await queryGeminiEnterpriseAgent(questionText, {
        onProgress: (partial) => {
          setAgentStreamingProgress(partial);
        }
      });

      const executionDuration = Date.now() - startTime;

      if (!result.success || !result.answer || !result.answer.trim()) {
        setAgentStatus('ERROR');
        const noResp = result.message || 'No response was generated. Try rephrasing your question.';
        setAgentErrorMessage(noResp);
        setErrorMessage(noResp);
        return;
      }

      // Success: Display formatted answer in the existing results area
      setAgentStatus('SUCCESS');
      setAgentFinalAnswer(result.answer);

      // Also register evaluation scores and evidentiary uploads in local state
      let createdEvalId = `eval-${Date.now()}`;
      try {
        await onSubmitAudit({
          programId: selectedProgramId || programs[0].id,
          evaluatorId: currentPersona.id,
          evaluatorName: currentPersona.name,
          evaluatorRole: currentPersona.designation || currentPersona.role,
          scores,
          statutoryEnactmentClause: statutoryClause || 'Sabah State Library Enactment 1988',
          gapsIdentified: activeGaps,
          auditorNotes: questionText,
          correctiveAction: includeCAP ? {
            actionRequired: capAction || 'Resolve identified operational deficiencies.',
            assignedOfficer: capOfficer || currentPersona.name,
            dueDate: capDueDate || new Date().toISOString().split('T')[0],
            escalationLevel: capEscalation
          } : undefined
        });
      } catch (auditErr) {
        console.warn('Evaluation state update note:', auditErr);
      }

      if (attachedFile) {
        try {
          await onUploadEvidence({
            programId: selectedProgramId || programs[0].id,
            programName: currentProgram?.name || 'Library Program',
            title: attachedFile.name.replace(/\.[^/.]+$/, ''),
            documentType: attachedFile.type,
            fileName: attachedFile.name,
            fileSize: attachedFile.size,
            uploadedBy: currentPersona.name,
            provenanceDetails: attachedFile.provenance,
            tags: ['Statutory Enactment 1988', 'Audit Evaluation Evidence']
          });
        } catch (evErr) {
          console.warn('Evidence upload note:', evErr);
        }
      }

      // Save to the audit log already set up in Firebase
      const auditCycle: AuditCycleRecord = {
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        summary: `Gemini Enterprise Agent assisted evaluation for ${currentProgram?.name || 'Sabah State Library'}. Question: "${questionText.slice(0, 60)}..."`,
        cycleType: 'AGENT_ASSIST_QUERY',
        officerName: currentPersona.name,
        officerRole: currentPersona.designation || currentPersona.role,
        status: 'SUCCESS',
        executionTimeMs: executionDuration,
        input: {
          action: 'GEMINI_ENTERPRISE_STREAM_ASSIST',
          targetProgramId: selectedProgramId,
          targetProgramName: currentProgram?.name,
          statutoryClause: statutoryClause,
          submittedBy: currentPersona.name,
          payload: {
            query: { text: questionText }
          }
        },
        output: {
          resultSummary: `Gemini Enterprise response received (${result.answer.length} characters) under Enactment 1988`,
          totalScore,
          alignmentLevel: calculatedAlignment,
          documentId: createdEvalId,
          statusBadge: 'AGENT_ANSWERED',
          details: {
            question: questionText,
            answerMarkdown: result.answer,
            statutoryClauseAssessed: statutoryClause
          }
        },
        rawPayload: {
          query: questionText,
          answer: result.answer,
          scores
        }
      };

      try {
        await firestoreService.recordAuditCycle(auditCycle);
        setAgentSavedAuditId(auditCycle.id);

        // Record official audit log document (question asked, timestamp, short summary of the result, signed-in user's email)
        const cleanSummary = result.answer
          ? result.answer.replace(/[#*`_\[\]]/g, '').replace(/\s+/g, ' ').trim().slice(0, 250) + (result.answer.length > 250 ? '...' : '')
          : 'Statutory compliance evaluation completed.';

        await firestoreService.addAuditLog({
          question: questionText,
          timestamp: auditCycle.timestamp,
          summary: cleanSummary,
          userEmail: currentPersona.email || 'antoniapeter.sani@sabah.gov.my',
          userId: currentPersona.id,
          userName: currentPersona.name,
          rawAnswer: result.answer,
          status: 'SUCCESS'
        });
      } catch (fbErr) {
        console.warn('Failed to record agent audit cycle/log to Firestore:', fbErr);
      }

      setSubmitSuccessMsg(
        `Gemini Enterprise Agent answer received & saved to Firebase Audit Log.`
      );

      setTimeout(() => {
        setSubmitSuccessMsg(null);
      }, 8000);
    } catch (err: any) {
      console.error('Audit submission error:', err);
      setErrorMessage(err?.message || 'Failed to query Gemini Enterprise agent.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered Evaluations for Results area
  const filteredEvaluations = evaluations.filter(ev => {
    if (resultsFilter !== 'ALL' && ev.alignmentLevel !== resultsFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ev.programName.toLowerCase().includes(q) ||
        ev.evaluatorName.toLowerCase().includes(q) ||
        ev.statutoryEnactmentClause.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const renderHistoricalEvaluationsArea = () => (
    <div id="core-output-results-area" className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-600" />
            <span>Official Output &amp; Evaluation Results</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Live statutory scorecards, audit histories, and compliance determinations.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-700 p-0.5 rounded-lg text-[11px]">
            {(['ALL', 'FULL', 'PARTIAL', 'NON_COMPLIANT'] as const).map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setResultsFilter(filter)}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  resultsFilter === filter
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'FULL' ? 'Full' : filter === 'PARTIAL' ? 'Partial' : 'Non-Compliant'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvaluations.map((ev) => (
          <div
            key={ev.id}
            id={`eval-result-card-${ev.id}`}
            className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between hover:border-emerald-300 dark:hover:border-emerald-700 transition"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    {ev.evaluationDate} • {ev.evaluatorRole}
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                    {ev.programName}
                  </h3>
                </div>

                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    ev.totalScore >= 80 ? 'text-emerald-600' : ev.totalScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                  }`}>
                    {ev.totalScore}/100
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    ev.alignmentLevel === 'FULL'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : ev.alignmentLevel === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                  }`}>
                    {ev.alignmentLevel}
                  </span>
                </div>
              </div>

              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px]">
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Statutory Clause Assessed:
                </div>
                <div className="text-slate-500 dark:text-slate-400 font-mono mt-0.5 line-clamp-1">
                  {ev.statutoryEnactmentClause}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5 mt-2.5 text-center text-[10px]">
                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Enactment</span>
                  <strong className="text-slate-800 dark:text-slate-200">{ev.scores.statutoryEnactment}/25</strong>
                </div>
                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Strategic</span>
                  <strong className="text-slate-800 dark:text-slate-200">{ev.scores.strategicRelevance}/25</strong>
                </div>
                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Execution</span>
                  <strong className="text-slate-800 dark:text-slate-200">{ev.scores.executionIntegrity}/25</strong>
                </div>
                <div className="p-1.5 rounded bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[9px]">Community</span>
                  <strong className="text-slate-800 dark:text-slate-200">{ev.scores.communityImpact}/25</strong>
                </div>
              </div>

              {ev.gapsIdentified && ev.gapsIdentified.length > 0 && (
                <div className="mt-2.5 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-rose-600">Gaps:</span>{' '}
                  {ev.gapsIdentified.join(', ')}
                </div>
              )}

              <div className="mt-2.5 text-slate-600 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-lg line-clamp-2">
                <strong>Notes:</strong> {ev.auditorNotes}
              </div>

              {ev.correctiveAction && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs">
                  <div className="flex items-center justify-between font-bold text-rose-900 dark:text-rose-300 text-[11px]">
                    <span>CAP: {ev.correctiveAction.escalationLevel}</span>
                    <span>Due: {ev.correctiveAction.dueDate}</span>
                  </div>
                  <p className="text-rose-800 dark:text-rose-200 text-[11px] mt-0.5">
                    {ev.correctiveAction.actionRequired}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Auditor: {ev.evaluatorName}</span>
              <button
                type="button"
                onClick={() => {
                  const prog = programs.find(p => p.id === ev.programId);
                  if (prog) onOpenProgramDetail(prog);
                }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Program Dossier</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEvaluations.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 border border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
          No evaluation records matched the current filter.
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-300">
      
      {/* Top Banner / Portal Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                Primary Intake &amp; Governance
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Enactment 1988 &amp; Strategic Plan 2026–2028
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-1.5">
              Core Interface — Statutory Input &amp; Output Portal
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
              Standardized evaluation portal for recording compliance scores, attaching evidentiary audit files, dynamically reviewing formatted determinations, and updating persistent state governance records.
            </p>
          </div>

          {/* Quick Actions & Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="core-new-program-btn"
              onClick={onOpenNewProgramModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Program</span>
            </button>
            
            {/* Auxiliary specialized views trigger */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-700/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-600 text-xs">
              <button
                id="subview-btn-chat"
                onClick={() => setSubView('chat')}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  subView === 'chat'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Agent Chat</span>
              </button>
              <button
                id="subview-btn-rubric"
                onClick={() => setSubView('rubric')}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer flex items-center gap-1.5 ${
                  subView === 'rubric'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Rubric Scoring</span>
              </button>
              <button
                onClick={() => setSubView('matrix')}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  subView === 'matrix'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Matrix View
              </button>
              <button
                onClick={() => setSubView('evidence')}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  subView === 'evidence'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Evidence Vault
              </button>
              <button
                onClick={() => setSubView('risks')}
                className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${
                  subView === 'risks'
                    ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
                }`}
              >
                Risk Log
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RENDER CONDITIONAL SUB-VIEWS (Matrix, Evidence, Risks) IF USER TOGGLES */}
      {subView === 'matrix' && (
        <StrategicAlignmentMatrix
          programs={programs}
          pillars={pillars}
          selectedPillarId="ALL"
          onSelectPillar={() => {}}
          onOpenAuditModal={onOpenAuditModal}
          onOpenProgramDetail={onOpenProgramDetail}
          onOpenEvidence={() => setSubView('evidence')}
          onOpenNewProgramModal={onOpenNewProgramModal}
          userRole={currentPersona.role}
        />
      )}

      {subView === 'evidence' && (
        <EvidenceRepositoryView
          evidenceDocs={evidenceDocs}
          programs={programs}
          currentPersona={currentPersona}
          onUploadDocument={onUploadEvidence}
          onVerifyDocument={onVerifyEvidence}
        />
      )}

      {subView === 'risks' && (
        <RiskRegisterView
          risks={risks}
          programs={programs}
          pillars={pillars}
          currentPersona={currentPersona}
          onCreateRisk={onCreateRisk}
          onUpdateRiskStatus={onUpdateRiskStatus}
        />
      )}

      {subView === 'schema' && (
        <PrismaSchemaViewer />
      )}

      {/* PRIMARY VIEW: GEMINI ENTERPRISE REAL CHAT INTERFACE */}
      {subView === 'chat' && (
        <div className="space-y-6">
          <GeminiAgentChat
            currentPersona={currentPersona}
            programs={programs}
            selectedProgramId={selectedProgramId}
            onSelectProgram={handleProgramChange}
            statutoryClause={statutoryClause}
          />
          {renderHistoricalEvaluationsArea()}
        </div>
      )}

      {/* SECONDARY VIEW: QUANTITATIVE RUBRIC EVALUATION FORM & FILE DROP ZONE */}
      {subView === 'rubric' && (
        <div className="space-y-6">
          
          {/* TOP SECTION: STANDARDIZED INPUT FORM & FILE DROP ZONE */}
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* LEFT COLUMN: TIDY FORM FIELDS (8 cols on lg) */}
              <div className="lg:col-span-8 space-y-5 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
                
                <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      1. Standardized Intake &amp; Evaluation Fields
                    </h2>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Evaluator: <strong className="text-slate-800 dark:text-slate-200">{currentPersona.name}</strong>
                  </span>
                </div>

                {/* Program Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Library Initiative or Program <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="input-portal-program-select"
                    value={selectedProgramId}
                    onChange={(e) => handleProgramChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {programs.map((p) => (
                      <option key={p.id} value={p.id}>
                        [{p.code}] {p.name} — {p.branch} ({p.complianceScore}% Score)
                      </option>
                    ))}
                  </select>

                  {/* Selected Program Meta pills */}
                  {currentProgram && (
                    <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 font-mono">
                        {currentProgram.code}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        {currentProgram.pillarName}
                      </span>
                      <span>Branch: <strong>{currentProgram.branch}</strong></span>
                      <span>Lead: <strong>{currentProgram.leadOfficer}</strong></span>
                    </div>
                  )}
                </div>

                {/* Statutory Clause Assessed */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Statutory Enactment 1988 Clause Reference <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] text-slate-400">Section authority</span>
                  </div>
                  <input
                    type="text"
                    id="input-portal-statutory-clause"
                    value={statutoryClause}
                    onChange={(e) => setStatutoryClause(e.target.value)}
                    placeholder="e.g. Sabah State Library Enactment 1988, Section 6"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                  
                  {/* Preset Buttons */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {STATUTORY_CLAUSE_PRESETS.map((preset, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setStatutoryClause(preset)}
                        className="text-[10px] px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                      >
                        Section {preset.match(/Section \d+/)?.[0]?.replace('Section ', '') || idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4-Dimension Rubric Scoring */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Statutory Rubric Scoring (4 Dimensions • 0 to 25 pts each)
                    </label>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Subtotal: {totalScore} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Dimension 1 */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          1. Enactment 1988 Compliance
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {scores.statutoryEnactment} / 25
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={scores.statutoryEnactment}
                        onChange={(e) => setScores({ ...scores, statutoryEnactment: Number(e.target.value) })}
                        className="w-full mt-2 accent-emerald-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Mandatory powers, public access rights &amp; legal deposit rules.
                      </p>
                    </div>

                    {/* Dimension 2 */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          2. Strategic Plan 2026–2028
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {scores.strategicRelevance} / 25
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={scores.strategicRelevance}
                        onChange={(e) => setScores({ ...scores, strategicRelevance: Number(e.target.value) })}
                        className="w-full mt-2 accent-emerald-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Alignment with 5 strategic pillars and annual milestone KPIs.
                      </p>
                    </div>

                    {/* Dimension 3 */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          3. Execution Integrity &amp; Finance
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {scores.executionIntegrity} / 25
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={scores.executionIntegrity}
                        onChange={(e) => setScores({ ...scores, executionIntegrity: Number(e.target.value) })}
                        className="w-full mt-2 accent-emerald-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Budget governance, procurement vouchers &amp; SOP verification.
                      </p>
                    </div>

                    {/* Dimension 4 */}
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          4. Community &amp; Rural Impact
                        </span>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          {scores.communityImpact} / 25
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="25"
                        value={scores.communityImpact}
                        onChange={(e) => setScores({ ...scores, communityImpact: Number(e.target.value) })}
                        className="w-full mt-2 accent-emerald-600 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Outreach to rural districts, inclusivity, and citizen engagement.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statutory Gaps Identified */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Identified Statutory &amp; Operational Gaps ({activeGaps.length})
                  </label>

                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {COMMON_GAPS.map((gap, idx) => {
                      const isSelected = activeGaps.includes(gap);
                      return (
                        <button
                          type="button"
                          key={idx}
                          onClick={() => toggleGap(gap)}
                          className={`text-xs px-2.5 py-1 rounded-md transition cursor-pointer border ${
                            isSelected
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 font-medium'
                              : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? '✕ ' : '+ '}
                          {gap}
                        </button>
                      );
                    })}
                  </div>

                  {/* Add Custom Gap */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customGapInput}
                      onChange={(e) => setCustomGapInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCustomGap();
                        }
                      }}
                      placeholder="Type custom statutory or operational observation..."
                      className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={handleAddCustomGap}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer"
                    >
                      Add Observation
                    </button>
                  </div>
                </div>

                {/* Auditor Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Official Auditor Findings &amp; Directives
                  </label>
                  <textarea
                    rows={3}
                    value={auditorNotes}
                    onChange={(e) => setAuditorNotes(e.target.value)}
                    placeholder="Enter formal compliance findings, statutory directives, or operational remarks..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden leading-relaxed"
                  />
                </div>

                {/* Corrective Action Plan (CAP) Section */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeCAP}
                        onChange={(e) => setIncludeCAP(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Include Corrective Action Plan (CAP)
                      </span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Mandatory for scores &lt; 80%
                    </span>
                  </div>

                  {includeCAP && (
                    <div className="mt-3 p-3.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-rose-900 dark:text-rose-300 mb-1">
                          Mandatory Remediation Action
                        </label>
                        <input
                          type="text"
                          value={capAction}
                          onChange={(e) => setCapAction(e.target.value)}
                          placeholder="e.g. Issue gazette notice and file statutory certificate within 30 days"
                          className="w-full px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <div>
                          <label className="block text-[11px] text-rose-900 dark:text-rose-300 mb-1">
                            Assigned Officer
                          </label>
                          <input
                            type="text"
                            value={capOfficer}
                            onChange={(e) => setCapOfficer(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-rose-900 dark:text-rose-300 mb-1">
                            Remediation Deadline
                          </label>
                          <input
                            type="date"
                            value={capDueDate}
                            onChange={(e) => setCapDueDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-rose-900 dark:text-rose-300 mb-1">
                            Escalation Tier
                          </label>
                          <select
                            value={capEscalation}
                            onChange={(e) => setCapEscalation(e.target.value as any)}
                            className="w-full px-2.5 py-1.5 rounded border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-900 text-xs"
                          >
                            <option value="INTERNAL">Internal Branch Head</option>
                            <option value="DIRECTOR_ESCALATION">Director Escalation</option>
                            <option value="MINISTRY_NOTICE">Ministry Notice</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: FILE DROP ZONE & ATTACHMENT PORTAL (4 cols on lg) */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
                  <div className="border-b border-slate-100 dark:border-slate-700 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        2. Evidentiary File Drop Zone
                      </h2>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-mono">
                      PDF / DOCX
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    Attach statutory inspection reports, Gazette notices, or signed vouchers validating the audit rubric.
                  </p>

                  {/* Drop Zone Box */}
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`mt-3 border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isDragging
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                        : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-slate-50/50 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleManualFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.xlsx,.jpg,.png"
                    />

                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>

                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Drag &amp; drop evidentiary file here
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      or click to browse from system
                    </span>
                    <span className="text-[10px] text-slate-400 mt-2 font-mono">
                      Max 25 MB • PDF, DOCX, Gazette Vouchers
                    </span>
                  </div>

                  {/* Attached File Card */}
                  {attachedFile ? (
                    <div className="mt-3.5 p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <FileText className="w-4 h-4 text-emerald-700 dark:text-emerald-400 mt-0.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {attachedFile.name}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400">
                              {attachedFile.size} • Ready for verification
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachedFile(null)}
                          className="text-slate-400 hover:text-rose-600 transition cursor-pointer"
                          title="Remove attached file"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Document Type Selector */}
                      <div className="mt-2.5">
                        <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                          Document Classification
                        </label>
                        <select
                          value={attachedFile.type}
                          onChange={(e) => setAttachedFile({ ...attachedFile, type: e.target.value as any })}
                          className="w-full px-2 py-1 rounded border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs font-medium"
                        >
                          <option value="INSPECTION_REPORT">Inspection Report</option>
                          <option value="GAZETTE_NOTICE">State Gazette Notice</option>
                          <option value="AUDIT_CERTIFICATE">Audit Certificate</option>
                          <option value="EXPENDITURE_VOUCHER">Expenditure Voucher</option>
                          <option value="MOU_AGREEMENT">MoU Agreement</option>
                          <option value="DEED_OF_GIFT">Deed of Gift</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 text-[11px] text-slate-500 text-center">
                      No evidentiary file currently attached.
                    </div>
                  )}

                  {/* Compliance Policy Note */}
                  <div className="mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Statutory Archive Mandate</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">
                      Files are cryptographically linked to the program ID in Firestore under Sabah State Library Enactment 1988 statutory audit retention rules.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* DYNAMIC SUMMARY AREA ABOVE THE RESULTS (Reformatting before sending) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-emerald-600/30 dark:border-emerald-500/30 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">
                      Dynamic Pre-Submission Verification Summary
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Reformats entered audit parameters, calculated statutory score, and attached evidence before final dispatch.
                    </p>
                  </div>
                </div>

                {/* Score & Tier Badge */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">
                      Calculated Rating
                    </span>
                    <span className={`text-xl font-black ${
                      totalScore >= 80 ? 'text-emerald-600' : totalScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {totalScore} <span className="text-xs font-normal text-slate-400">/ 100</span>
                    </span>
                  </div>

                  <span className={`px-3 py-1.5 text-xs font-bold rounded-lg border ${
                    calculatedAlignment === 'FULL'
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                      : calculatedAlignment === 'PARTIAL'
                      ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-800'
                      : 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950 dark:text-rose-200 dark:border-rose-800'
                  }`}>
                    {calculatedAlignment === 'FULL' ? 'FULL COMPLIANCE' : calculatedAlignment === 'PARTIAL' ? 'PARTIAL COMPLIANCE' : 'NON-COMPLIANT'}
                  </span>
                </div>
              </div>

              {/* Reformatted Confirmation Grid */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Panel A: Program & Mandate Recap */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Target Program &amp; Clause
                  </span>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {currentProgram?.name || 'Selected Program'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {currentProgram?.code} • {currentProgram?.branch}
                  </div>
                  
                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                    <span className="text-[10px] font-medium text-slate-500">Clause Assessed:</span>
                    <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-0.5 line-clamp-2">
                      {statutoryClause}
                    </p>
                  </div>
                </div>

                {/* Panel B: Dimension Scores Breakdown */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Dimension Score Breakdown
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mt-1.5">
                    <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Enactment 1988</span>
                      <strong className="text-slate-900 dark:text-white">{scores.statutoryEnactment}/25</strong>
                    </div>
                    <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Strategic Plan</span>
                      <strong className="text-slate-900 dark:text-white">{scores.strategicRelevance}/25</strong>
                    </div>
                    <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Execution Integrity</span>
                      <strong className="text-slate-900 dark:text-white">{scores.executionIntegrity}/25</strong>
                    </div>
                    <div className="p-1.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <span className="text-[10px] text-slate-400 block">Community Impact</span>
                      <strong className="text-slate-900 dark:text-white">{scores.communityImpact}/25</strong>
                    </div>
                  </div>
                </div>

                {/* Panel C: Gaps & Attached Evidentiary File */}
                <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Gaps &amp; Evidentiary File
                  </span>
                  
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    Gaps Flagged: <strong>{activeGaps.length}</strong>
                    {activeGaps.length > 0 ? (
                      <ul className="text-[10px] text-rose-600 dark:text-rose-400 list-disc pl-3 mt-1 space-y-0.5 line-clamp-2">
                        {activeGaps.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                        ✓ No statutory deficiencies flagged.
                      </p>
                    )}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Evidence Attached:</span>
                    {attachedFile ? (
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[130px]">
                        {attachedFile.name}
                      </span>
                    ) : (
                      <span className="text-slate-400">None attached</span>
                    )}
                  </div>

                  {includeCAP && (
                    <div className="mt-1 text-[10px] text-rose-700 dark:text-rose-400">
                      CAP Action: {capAction.slice(0, 35)}...
                    </div>
                  )}
                </div>
              </div>

              {/* Error Message if any */}
              {errorMessage && (
                <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Feedback */}
              {submitSuccessMsg && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{submitSuccessMsg}</span>
                </div>
              )}

              {/* Send / Confirm Buttons */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Review parameters above carefully before confirming submission to the statutory record.</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    disabled={isSubmitting}
                    className="px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    type="submit"
                    id="submit-statutory-evaluation-btn"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-6 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition shadow-sm cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Recording Evaluation...' : 'Confirm & Submit Statutory Evaluation'}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
          {renderHistoricalEvaluationsArea()}
        </div>
      )}
    </div>
  );
};
