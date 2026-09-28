import React, { useState, useEffect, useMemo } from 'react';
import {
  History,
  Eye,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  Filter,
  ArrowDownUp,
  Copy,
  Check,
  RefreshCw,
  Clock,
  User,
  Layers,
  ShieldCheck,
  Terminal,
  Code2,
  Download,
  Send,
  Database,
  Sparkles,
  X,
  ChevronRight,
  Sliders,
  ExternalLink,
  FileText,
  UserCheck
} from 'lucide-react';
import { AuditCycleRecord, AuditCycleType, FirestoreAuditLog } from '../types';
import { api } from '../services/api';
import { firestoreService } from '../services/firebase';

interface AuditTrailViewProps {
  onNavigateToCorePortal?: () => void;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ onNavigateToCorePortal }) => {
  const [activeLedgerTab, setActiveLedgerTab] = useState<'audit_logs' | 'audit_cycles'>('audit_logs');
  const [auditLogs, setAuditLogs] = useState<FirestoreAuditLog[]>([]);
  const [selectedAuditLog, setSelectedAuditLog] = useState<FirestoreAuditLog | null>(null);

  const [cycles, setCycles] = useState<AuditCycleRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [selectedCycle, setSelectedCycle] = useState<AuditCycleRecord | null>(null);
  const [activeModalTab, setActiveModalTab] = useState<'structured' | 'raw_json'>('structured');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreatingSample, setIsCreatingSample] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Connecting...');

  // Subscribe to real-time Firestore audit_cycles and audit_logs stream
  useEffect(() => {
    setIsLoading(true);
    const unsubCycles = firestoreService.subscribeAuditCycles((records) => {
      setCycles(records);
      setIsLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    });

    const unsubLogs = firestoreService.subscribeAuditLogs((logs) => {
      setAuditLogs(logs);
      setIsLoading(false);
    });

    return () => {
      unsubCycles();
      unsubLogs();
    };
  }, []);

  // Manual refresh
  const handleManualRefresh = async () => {
    try {
      setIsRefreshing(true);
      const [cycleData, logData] = await Promise.all([
        api.getAuditCycles(),
        firestoreService.getAuditLogs()
      ]);
      setCycles(cycleData);
      setAuditLogs(logData);
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Manual refresh warning:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Format timestamp
  const formatTimestamp = (isoString: string): { formattedDate: string; formattedTime: string; relativeTime: string } => {
    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        return { formattedDate: isoString, formattedTime: '', relativeTime: '' };
      }
      return {
        formattedDate: date.toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }),
        formattedTime: date.toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        relativeTime: getRelativeTime(date)
      };
    } catch {
      return { formattedDate: isoString, formattedTime: '', relativeTime: '' };
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Quick Action: Simulate / Create Sample Cycle to easily test input-output logging
  const handleSimulateCycle = async () => {
    try {
      setIsCreatingSample(true);
      const now = new Date();
      const sampleRecord: AuditCycleRecord = {
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now.toISOString(),
        summary: 'Statutory compliance validation cycle executed for Rural Mobile Library Fleet Outreach. Total compliance rating: 92/100 (FULL).',
        cycleType: 'EVALUATION_SUBMISSION',
        officerName: 'Antonia Peter Sani',
        officerRole: 'Internal Audit & Compliance Lead',
        status: 'SUCCESS',
        executionTimeMs: 46,
        input: {
          action: 'SUBMIT_PROGRAM_AUDIT_EVALUATION',
          targetProgramId: 'prog-004',
          targetProgramName: 'Rural Mobile Library Fleet Outreach (Keningau & Tenom)',
          statutoryClause: 'Sabah State Library Enactment 1988, Section 12 (Rural Stations & Mobile Units)',
          submittedBy: 'Antonia Peter Sani',
          payload: {
            scores: {
              statutoryEnactment: 23,
              strategicRelevance: 24,
              executionIntegrity: 22,
              communityImpact: 23
            },
            gapsIdentified: ['Quarterly vehicle safety inspection certificate pending gazette filing'],
            auditorNotes: 'High rural participation logged across 14 remote villages. Outreach schedule fully aligns with Enactment 1988 obligations.',
            correctiveAction: {
              actionRequired: 'Deposit certified mechanical safety audit report with Director.',
              assignedOfficer: 'Zainal Abidin',
              dueDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
              escalationLevel: 'INTERNAL'
            }
          }
        },
        output: {
          resultSummary: 'Statutory evaluation certified with compliance score 92/100 (FULL alignment) under Enactment 1988',
          totalScore: 92,
          alignmentLevel: 'FULL',
          riskSeverity: 'LOW',
          documentId: `eval-${Date.now()}`,
          statusBadge: 'APPROVED',
          details: {
            inspectionFrequency: 'Quarterly',
            nextAuditScheduled: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0]
          }
        },
        rawPayload: {
          requestHeader: {
            client: 'SabahStateLibrary/WebPortal',
            enactmentStandard: '1988-REV2026'
          },
          computedMetrics: {
            statutoryEnactmentWeight: '25%',
            strategicRelevanceWeight: '25%',
            executionIntegrityWeight: '25%',
            communityImpactWeight: '25%'
          }
        }
      };

      await api.recordAuditCycle(sampleRecord);
      setSelectedCycle(sampleRecord);
    } catch (err) {
      console.warn('Simulation error:', err);
    } finally {
      setIsCreatingSample(false);
    }
  };

  // Export Audit Trail
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cycles, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `SabahStateLibrary_AuditTrail_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Filtered Cycles (Newest First)
  const filteredCycles = useMemo(() => {
    return cycles
      .filter(item => {
        if (selectedTypeFilter !== 'ALL' && item.cycleType !== selectedTypeFilter) return false;
        if (selectedStatusFilter !== 'ALL' && item.status !== selectedStatusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesSummary = item.summary?.toLowerCase().includes(q);
          const matchesOfficer = item.officerName?.toLowerCase().includes(q);
          const matchesProgram = item.input?.targetProgramName?.toLowerCase().includes(q);
          const matchesId = item.id.toLowerCase().includes(q);
          const matchesClause = item.input?.statutoryClause?.toLowerCase().includes(q);
          return matchesSummary || matchesOfficer || matchesProgram || matchesId || matchesClause;
        }
        return true;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [cycles, selectedTypeFilter, selectedStatusFilter, searchQuery]);

  // Filtered Audit Logs (Question asked, timestamp, short summary, signed-in user's email)
  const filteredAuditLogs = useMemo(() => {
    return auditLogs
      .filter(log => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          log.question?.toLowerCase().includes(q) ||
          log.summary?.toLowerCase().includes(q) ||
          log.userEmail?.toLowerCase().includes(q) ||
          log.userName?.toLowerCase().includes(q) ||
          log.id?.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [auditLogs, searchQuery]);

  // Simulate a statutory inquiry audit log
  const handleSimulateAuditLog = async () => {
    try {
      setIsCreatingSample(true);
      await firestoreService.addAuditLog({
        question: 'Does the Tanjung Aru branch community outreach program fulfill statutory mandates under Section 7 of the Sabah State Library Enactment 1988?',
        timestamp: new Date().toISOString(),
        summary: 'Statutory compliance verified at 88% alignment. Fulfills Section 7 public reading material preservation and community education standards.',
        userEmail: 'antoniapeter.sani@sabah.gov.my',
        userName: 'Antonia Peter Sani',
        rawAnswer: 'Under Section 7 of the Sabah State Library Enactment 1988, the Director is empowered to organize community educational outreach and maintain public accessibility across all divisional branches. The Tanjung Aru Community Outreach program satisfies all statutory criteria with commendable public engagement metrics.',
        status: 'SUCCESS'
      });
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Simulate audit log error:', err);
    } finally {
      setIsCreatingSample(false);
    }
  };

  // Color helper for cycle types
  const getCycleTypeBadge = (type: AuditCycleType) => {
    switch (type) {
      case 'EVALUATION_SUBMISSION':
        return { label: 'Audit Evaluation', color: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' };
      case 'EVIDENCE_DEPOSIT':
        return { label: 'Evidence Deposit', color: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' };
      case 'RISK_REGISTRATION':
        return { label: 'Risk Registration', color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' };
      case 'PROGRAM_CREATION':
        return { label: 'Program Initiative', color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800' };
      case 'STATUS_VERIFICATION':
        return { label: 'Verification', color: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' };
      default:
        return { label: 'Cycle Event', color: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700' };
    }
  };

  const getStatusBadge = (status: 'SUCCESS' | 'WARNING' | 'FAILED') => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Success
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            Warning
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
            Failed
          </span>
        );
    }
  };

  return (
    <div id="audit-trail-page" className="space-y-6 pb-16 animate-in fade-in duration-300">
      {/* Top Banner & Telemetry Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
              <History className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  Audit Trail &amp; Historical Input-Output Cycles
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Live Firestore onSnapshot
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-3xl leading-relaxed">
                Statutory event ledger under Sabah State Library Enactment 1988. Dedicated chronological log of every input-output cycle, evaluation rubric scoring, legal deposit deposit, and provenance verification pulled directly from Firestore.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
            <button
              id="refresh-audit-trail-btn"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors disabled:opacity-60"
              title="Re-query Firestore audit_cycles collection"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
            </button>

            <button
              id="export-audit-trail-btn"
              onClick={handleExportJSON}
              disabled={cycles.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors disabled:opacity-50"
              title="Download audit records as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>

            <button
              id="simulate-test-cycle-btn"
              onClick={handleSimulateCycle}
              disabled={isCreatingSample}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-60"
              title="Generate a sample verified input-output cycle into Firestore"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isCreatingSample ? 'Writing to Firestore...' : 'Simulate Test Cycle'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Telemetry Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-y-2">
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono text-slate-700 dark:text-slate-300">Firestore collections: audit_logs &amp; audit_cycles</span>
            </span>
            <span>•</span>
            <span>Inquiry Logs: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{auditLogs.length}</strong></span>
            <span>•</span>
            <span>System Cycles: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{cycles.length}</strong></span>
            <span>•</span>
            <span>Ordering: <strong className="text-slate-800 dark:text-slate-200 font-semibold">Newest First (Chronological)</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Synced: <span className="font-mono text-slate-700 dark:text-slate-300">{lastSyncTime}</span></span>
          </div>
        </div>
      </div>

      {/* Sub-Tabs: Statutory Audit Logs vs Technical System Cycles */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          id="tab-statutory-audit-logs"
          type="button"
          onClick={() => setActiveLedgerTab('audit_logs')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeLedgerTab === 'audit_logs'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Statutory Audit Logs (Question, Timestamp, Summary, User Email)</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeLedgerTab === 'audit_logs' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {auditLogs.length}
          </span>
        </button>

        <button
          id="tab-system-cycles"
          type="button"
          onClick={() => setActiveLedgerTab('audit_cycles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeLedgerTab === 'audit_cycles'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Technical Input-Output Cycles</span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
            activeLedgerTab === 'audit_cycles' ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
          }`}>
            {cycles.length}
          </span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="audit-trail-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by summary, program name, officer, statutory clause, or cycle ID..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Type:</span>
            </div>
            <select
              id="audit-type-filter"
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Event Types</option>
              <option value="EVALUATION_SUBMISSION">Audit Evaluations</option>
              <option value="EVIDENCE_DEPOSIT">Evidence Deposits</option>
              <option value="RISK_REGISTRATION">Risk Registrations</option>
              <option value="PROGRAM_CREATION">Program Registrations</option>
              <option value="STATUS_VERIFICATION">Verifications</option>
            </select>

            <select
              id="audit-status-filter"
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="SUCCESS">Success Only</option>
              <option value="WARNING">Warnings</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Historical Log Listing */}
      {activeLedgerTab === 'audit_logs' ? (
        isLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[360px]">
            <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pulling Statutory Audit Logs from Firestore...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecting to collection: audit_logs</p>
          </div>
        ) : filteredAuditLogs.length === 0 ? (
          <div
            id="statutory-audit-logs-empty-state"
            className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[380px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
              <FileText className="w-8 h-8" />
            </div>

            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              No audit logs yet — ask a question in the Core Interface.
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
              Every inquiry asked by authenticated officers (e.g. question asked, timestamp, short summary of the result, and signed-in user's email) is permanently stored in Firestore.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {onNavigateToCorePortal && (
                <button
                  type="button"
                  onClick={onNavigateToCorePortal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Go to Core Interface to Inquire</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSimulateAuditLog}
                disabled={isCreatingSample}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Sample Statutory Audit Log</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Statutory Audit Logs ({filteredAuditLogs.length} records in Firestore /audit_logs)
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Sorted newest first
              </span>
            </div>

            <div className="space-y-3">
              {filteredAuditLogs.map((log, index) => {
                const { formattedDate, formattedTime, relativeTime } = formatTimestamp(log.timestamp);
                return (
                  <div
                    key={log.id || index}
                    id={`audit-log-row-${log.id || index}`}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Left: Index & Main Content */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="shrink-0 flex flex-col items-center mt-0.5">
                          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-mono text-xs font-bold">
                            #{filteredAuditLogs.length - index}
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 space-y-2.5">
                          {/* Question Asked */}
                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                Question Asked
                              </span>
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {formattedDate} {formattedTime} ({relativeTime})
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              "{log.question}"
                            </h3>
                          </div>

                          {/* Short Summary of the Result */}
                          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80 text-xs">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block mb-1">
                              Short Summary of Result
                            </span>
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                              {log.summary || 'Summary unavailable.'}
                            </p>
                          </div>

                          {/* Signed-in User's Email & Officer provenance */}
                          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
                              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              <span className="font-semibold text-[11px]">Signed-In User:</span>
                              <span className="font-mono text-[11px] font-bold">
                                {log.userEmail || 'Anonymous'}
                              </span>
                              {log.userName && (
                                <span className="text-slate-500 dark:text-slate-400 text-[10px]">
                                  • {log.userName}
                                </span>
                              )}
                            </div>

                            {log.id && (
                              <span className="font-mono text-[10px] text-slate-400">
                                firestore id: {log.id}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setSelectedAuditLog(log)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Answer</span>
                        </button>

                        {log.id && (
                          <button
                            type="button"
                            onClick={() => handleCopy(log.id!, `log-${log.id}`)}
                            className="inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            title="Copy Firestore document ID"
                          >
                            {copiedId === `log-${log.id}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Copied ID</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy ID</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      ) : (
        /* Technical System Cycles List */
        isLoading ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[360px]">
            <RefreshCw className="w-8 h-8 text-emerald-600 dark:text-emerald-400 animate-spin mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Pulling Historical Cycles from Firestore...</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Connecting to collection: audit_cycles</p>
          </div>
        ) : filteredCycles.length === 0 ? (
          /* Empty State: EXACT prompt mandate: “No history yet — submit something to see it here.” */
          <div
            id="audit-trail-empty-state"
            className="bg-white dark:bg-slate-800 rounded-xl p-12 border border-dashed border-slate-300 dark:border-slate-700 text-center flex flex-col items-center justify-center min-h-[380px]"
          >
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
              <FileCheck2 className="w-8 h-8" />
            </div>

            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              No history yet — submit something to see it here.
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mt-2 leading-relaxed">
              Every input-output cycle executed in the Core Interface Portal (statutory evaluations, evidence deposits, risk assessments, or initiatives) will be logged here chronologically in real-time.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {onNavigateToCorePortal && (
                <button
                  type="button"
                  onClick={onNavigateToCorePortal}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Go to Core Interface to Submit</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleSimulateCycle}
                disabled={isCreatingSample}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Simulate Sample Input-Output Cycle</span>
              </button>
            </div>
          </div>
        ) : (
          /* Dedicated Historical Log of Every Input-Output Cycle (Newest First) */
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Chronological Audit Ledger ({filteredCycles.length} records)
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Sorted newest first
              </span>
            </div>

            <div className="space-y-3">
              {filteredCycles.map((cycle, index) => {
                const typeBadge = getCycleTypeBadge(cycle.cycleType);
                const { formattedDate, formattedTime, relativeTime } = formatTimestamp(cycle.timestamp);

                return (
                  <div
                    key={cycle.id}
                    id={`audit-cycle-row-${cycle.id}`}
                    className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Main Summary & Timestamp Info */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        {/* Order Index & Status Icon */}
                        <div className="shrink-0 flex flex-col items-center mt-0.5">
                          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-700 dark:text-slate-300 font-mono text-xs font-bold">
                            #{filteredCycles.length - index}
                          </div>
                        </div>

                        {/* Content Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            {/* Cycle Type Badge */}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>

                            {/* Status Badge */}
                            {getStatusBadge(cycle.status)}

                            {/* Score or Key Metric Badge if present */}
                            {typeof cycle.output?.totalScore === 'number' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                                Score: {cycle.output.totalScore}/100
                              </span>
                            )}

                            {/* Alignment Badge if present */}
                            {cycle.output?.alignmentLevel && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                {cycle.output.alignmentLevel}
                              </span>
                            )}

                            {/* Target Program if available */}
                            {cycle.input?.targetProgramName && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-xs" title={cycle.input.targetProgramName}>
                                • {cycle.input.targetProgramName}
                              </span>
                            )}
                          </div>

                          {/* Short Summary */}
                          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-snug">
                            {cycle.summary}
                          </p>

                          {/* Metadata row: Timestamp, Officer, ID */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                            {/* Timestamp */}
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{formattedDate} {formattedTime}</span>
                              <span className="text-emerald-600 dark:text-emerald-400 font-sans font-medium">({relativeTime})</span>
                            </div>

                            {/* Officer / Auditor */}
                            {cycle.officerName && (
                              <div className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-slate-400" />
                                <span>{cycle.officerName}</span>
                                {cycle.officerRole && <span className="text-slate-400">({cycle.officerRole})</span>}
                              </div>
                            )}

                            {/* Cycle ID */}
                            <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                              <span>ID:</span>
                              <span className="truncate max-w-[120px]">{cycle.id}</span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(cycle.id, cycle.id);
                                }}
                                className="hover:text-slate-600 dark:hover:text-slate-200"
                                title="Copy ID"
                              >
                                {copiedId === cycle.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Dedicated “View” Option to inspect the full record */}
                      <div className="flex items-center justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100 dark:border-slate-700/60">
                        <button
                          id={`view-cycle-btn-${cycle.id}`}
                          type="button"
                          onClick={() => {
                            setSelectedCycle(cycle);
                            setActiveModalTab('structured');
                          }}
                          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white dark:bg-slate-700 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-200 transition-colors shadow-2xs group-hover:bg-emerald-600 group-hover:text-white"
                          title="View complete input payload, output calculations, and raw JSON"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}

      {/* FULL RECORD MODAL INSPECTOR (For debugging and reviewing past activity) */}
      {selectedCycle && (
        <div
          id="audit-cycle-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedCycle(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      {selectedCycle.id}
                    </span>
                    {getCycleTypeBadge(selectedCycle.cycleType) && (
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${getCycleTypeBadge(selectedCycle.cycleType).color}`}>
                        {getCycleTypeBadge(selectedCycle.cycleType).label}
                      </span>
                    )}
                    {getStatusBadge(selectedCycle.status)}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Input-Output Audit Record Inspector
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedCycle.summary}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(JSON.stringify(selectedCycle, null, 2), 'modal-json')}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Copy full cycle record as JSON"
                >
                  {copiedId === 'modal-json' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setSelectedCycle(null)}
                  className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 transition-colors"
                  title="Close inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* View Mode Toggle: Structured vs Raw JSON */}
            <div className="px-6 pt-3 pb-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setActiveModalTab('structured')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeModalTab === 'structured'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Structured Comparison (Input vs. Output)</span>
                </button>
                <button
                  onClick={() => setActiveModalTab('raw_json')}
                  className={`pb-2.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                    activeModalTab === 'raw_json'
                      ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                      : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Raw JSON Ledger</span>
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Clock className="w-3 h-3" />
                <span>{selectedCycle.timestamp}</span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {activeModalTab === 'structured' ? (
                <div className="space-y-6">
                  {/* Top Metadata Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Timestamp</span>
                      <span className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200 block mt-0.5">
                        {formatTimestamp(selectedCycle.timestamp).formattedDate}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {formatTimestamp(selectedCycle.timestamp).formattedTime}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Officer / Actor</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 truncate">
                        {selectedCycle.officerName || 'System Automated'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {selectedCycle.officerRole || 'Compliance'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Target Initiative</span>
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block mt-0.5 truncate" title={selectedCycle.input?.targetProgramName}>
                        {selectedCycle.input?.targetProgramName || selectedCycle.input?.targetProgramId || 'General Library'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 block truncate">
                        {selectedCycle.input?.targetProgramId || 'System'}
                      </span>
                    </div>

                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Enactment Standard</span>
                      <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mt-0.5 truncate">
                        Enactment 1988
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        Sabah State Law
                      </span>
                    </div>
                  </div>

                  {/* 2-Column Comparison: INPUT vs OUTPUT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Column 1: INPUT PAYLOAD */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="px-4 py-3 bg-blue-50/60 dark:bg-blue-950/30 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            1. Input Payload (Provided)
                          </h3>
                        </div>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                          {selectedCycle.input?.action || 'INPUT_ACTION'}
                        </span>
                      </div>

                      <div className="p-4 space-y-3.5 text-xs">
                        {selectedCycle.input?.statutoryClause && (
                          <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Statutory Clause Cited</span>
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                              {selectedCycle.input.statutoryClause}
                            </div>
                          </div>
                        )}

                        {selectedCycle.input?.payload && (
                          <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1.5">Submitted Parameters</span>
                            <div className="space-y-2">
                              {Object.entries(selectedCycle.input.payload).map(([key, value]) => {
                                if (value === undefined || value === null) return null;
                                return (
                                  <div key={key} className="p-2 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-700/40">
                                    <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-semibold block">
                                      {key}:
                                    </span>
                                    <div className="mt-0.5 text-slate-700 dark:text-slate-300 break-words">
                                      {typeof value === 'object' ? (
                                        <pre className="font-mono text-[10px] whitespace-pre-wrap">
                                          {JSON.stringify(value, null, 2)}
                                        </pre>
                                      ) : (
                                        String(value)
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Column 2: OUTPUT RESULT */}
                    <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div className="px-4 py-3 bg-emerald-50/60 dark:bg-emerald-950/30 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                            2. Output Result (Evaluated)
                          </h3>
                        </div>
                        {selectedCycle.output?.statusBadge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                            {selectedCycle.output.statusBadge}
                          </span>
                        )}
                      </div>

                      <div className="p-4 space-y-3.5 text-xs">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Result Summary</span>
                          <div className="p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200 font-medium">
                            {selectedCycle.output?.resultSummary || 'Operation completed successfully.'}
                          </div>
                        </div>

                        {/* Calculated Evaluation Metrics */}
                        <div className="grid grid-cols-2 gap-2">
                          {typeof selectedCycle.output?.totalScore === 'number' && (
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Compliance Score</span>
                              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                                {selectedCycle.output.totalScore}
                                <span className="text-xs text-slate-400 font-normal"> / 100</span>
                              </span>
                            </div>
                          )}

                          {selectedCycle.output?.alignmentLevel && (
                            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                              <span className="text-[10px] font-semibold text-slate-400 uppercase block">Statutory Tier</span>
                              <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                {selectedCycle.output.alignmentLevel}
                              </span>
                            </div>
                          )}
                        </div>

                        {selectedCycle.output?.documentId && (
                          <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Generated Firestore Document ID</span>
                            <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-800 dark:text-slate-200 flex items-center justify-between">
                              <span className="truncate">{selectedCycle.output.documentId}</span>
                              <button
                                onClick={() => handleCopy(selectedCycle.output.documentId!, 'doc-id')}
                                className="hover:text-emerald-600"
                              >
                                {copiedId === 'doc-id' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        )}

                        {selectedCycle.output?.details && (
                          <div>
                            <span className="text-[11px] font-semibold text-slate-400 uppercase block mb-1">Additional Output Properties</span>
                            <div className="space-y-1.5">
                              {Object.entries(selectedCycle.output.details).map(([k, v]) => (
                                <div key={k} className="flex items-center justify-between py-1 px-2 rounded bg-slate-50 dark:bg-slate-900/40 text-[11px]">
                                  <span className="font-mono text-slate-500 dark:text-slate-400">{k}:</span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200">{String(v)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Raw JSON Ledger View (Ideal for debugging and provenance review) */
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Complete Document Snapshot (Firestore: /audit_cycles/{selectedCycle.id})
                    </span>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedCycle, null, 2), 'raw-json')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                    >
                      {copiedId === 'raw-json' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Full JSON</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 max-h-[480px]">
                    {JSON.stringify(selectedCycle, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500 dark:text-slate-400">
                Audited according to <strong className="text-slate-700 dark:text-slate-300">Sabah State Library Enactment 1988</strong> standards.
              </div>
              <button
                onClick={() => setSelectedCycle(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATUTORY AUDIT LOG DETAIL MODAL */}
      {selectedAuditLog && (
        <div
          id="audit-log-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setSelectedAuditLog(null)}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      /audit_logs
                    </span>
                    {selectedAuditLog.id && (
                      <span className="text-xs font-mono text-slate-400">
                        {selectedAuditLog.id}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                    Statutory Inquiry &amp; Result Audit Record
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Immutable event recorded in Firestore under Sabah State Library Enactment 1988
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
              {/* Question Asked */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block mb-1">
                  Question Asked
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  "{selectedAuditLog.question}"
                </p>
              </div>

              {/* Provenance Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Signed-In User Email
                  </span>
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                      {selectedAuditLog.userEmail}
                    </span>
                  </div>
                  {selectedAuditLog.userName && (
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                      Name: {selectedAuditLog.userName}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Statutory Timestamp
                  </span>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {new Date(selectedAuditLog.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                    {selectedAuditLog.timestamp}
                  </span>
                </div>
              </div>

              {/* Short Summary of Result */}
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-1">
                  Short Summary of Result
                </span>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                  {selectedAuditLog.summary || 'Summary unavailable.'}
                </p>
              </div>

              {/* Full Raw Answer from Agent */}
              {selectedAuditLog.rawAnswer && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Complete Agent Response Output
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedAuditLog.rawAnswer!, 'raw-answer')}
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      {copiedId === 'raw-answer' ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Copied Answer</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Answer Text</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-sans text-xs leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                    {selectedAuditLog.rawAnswer}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                {selectedAuditLog.id ? `doc: ${selectedAuditLog.id}` : 'Firestore Document'}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAuditLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
              >
                Close Audit Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
