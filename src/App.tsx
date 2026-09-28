import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ComplianceDashboard } from './components/ComplianceDashboard';
import { StrategicAlignmentMatrix } from './components/StrategicAlignmentMatrix';
import { ProgramAuditModal } from './components/ProgramAuditModal';
import { EvidenceRepositoryView } from './components/EvidenceRepositoryView';
import { GovernanceAlertsDrawer } from './components/GovernanceAlertsDrawer';
import { RiskRegisterView } from './components/RiskRegisterView';
import { PrismaSchemaViewer } from './components/PrismaSchemaViewer';
import { ProgramDetailModal } from './components/ProgramDetailModal';
import { NewProgramModal } from './components/NewProgramModal';
import { CoreInterfacePortal } from './components/CoreInterfacePortal';
import { AnalyticsEngineView } from './components/AnalyticsEngineView';
import { AuditTrailView } from './components/AuditTrailView';
import { AuthGate } from './components/AuthGate';
import { Loader2, ShieldCheck } from 'lucide-react';

import {
  USER_PERSONAS,
  STRATEGIC_PILLARS,
  INITIAL_PROGRAMS,
  INITIAL_EVALUATIONS,
  INITIAL_KPIS,
  INITIAL_RISKS,
  INITIAL_EVIDENCE_DOCS,
  INITIAL_GOVERNANCE_ALERTS
} from './data/sabahLibraryData';

import {
  UserPersona,
  LibraryProgram,
  ProgramEvaluation,
  ProgramKPI,
  ComplianceRisk,
  EvidenceDocument,
  GovernanceAlert,
  DashboardMetrics,
  StrategicPillar,
  EvaluationScoreCriteria
} from './types';

import { api } from './services/api';
import { useFirebase } from './context/FirebaseContext';

export default function App() {
  // Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Firebase Auth and RBAC persona
  const {
    firebaseUser,
    currentPersona,
    setCurrentPersona,
    signIn: googleSignIn,
    signInAsOfficer,
    signOut: googleSignOut,
    isAuthLoading,
    isFirebaseReady
  } = useFirebase();

  // Main active tab: core (Core Interface), analytics (Analytics Engine), audit-trail (Audit Trail)
  const [activeTab, setActiveTab] = useState<string>('core');

  // Application Data States
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [pillars, setPillars] = useState<StrategicPillar[]>(STRATEGIC_PILLARS);
  const [programs, setPrograms] = useState<LibraryProgram[]>(INITIAL_PROGRAMS);
  const [evaluations, setEvaluations] = useState<ProgramEvaluation[]>(INITIAL_EVALUATIONS);
  const [kpis, setKpis] = useState<ProgramKPI[]>(INITIAL_KPIS);
  const [risks, setRisks] = useState<ComplianceRisk[]>(INITIAL_RISKS);
  const [evidenceDocs, setEvidenceDocs] = useState<EvidenceDocument[]>(INITIAL_EVIDENCE_DOCS);
  const [alerts, setAlerts] = useState<GovernanceAlert[]>(INITIAL_GOVERNANCE_ALERTS);

  // Selected filter on matrix
  const [selectedPillarId, setSelectedPillarId] = useState<string>('ALL');

  // Modals & Drawers
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [auditTargetProgram, setAuditTargetProgram] = useState<LibraryProgram | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [detailTargetProgram, setDetailTargetProgram] = useState<LibraryProgram | null>(null);

  const [isNewProgramModalOpen, setIsNewProgramModalOpen] = useState<boolean>(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Load backend data on mount
  const loadAllData = useCallback(async () => {
    try {
      const [m, p, pr, ev, k, r, ed, al] = await Promise.all([
        api.getMetrics(),
        api.getPillars(),
        api.getPrograms(),
        api.getEvaluations(),
        api.getKPIs(),
        api.getRisks(),
        api.getEvidence(),
        api.getAlerts()
      ]);

      if (m) setMetrics(m);
      if (p && p.length) setPillars(p);
      if (pr && pr.length) setPrograms(pr);
      if (ev && ev.length) setEvaluations(ev);
      if (k && k.length) setKpis(k);
      if (r && r.length) setRisks(r);
      if (ed && ed.length) setEvidenceDocs(ed);
      if (al && al.length) setAlerts(al);
    } catch (err) {
      console.warn('Initial data load error:', err);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Submit Program Audit Evaluation
  const handleAuditSubmit = async (evalData: {
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
  }) => {
    try {
      const newEval = await api.submitEvaluation(evalData);
      setEvaluations(prev => [newEval, ...prev]);

      // Optimistically update program score and alignment
      setPrograms(prev => prev.map(p => {
        if (p.id === evalData.programId) {
          const total = Math.min(100, evalData.scores.statutoryEnactment + evalData.scores.strategicRelevance + evalData.scores.executionIntegrity + evalData.scores.communityImpact);
          const align = total >= 80 ? 'FULL' : total >= 50 ? 'PARTIAL' : 'NON_COMPLIANT';
          const riskSev = total < 50 ? 'CRITICAL' : total < 80 ? 'HIGH' : 'LOW';
          return {
            ...p,
            complianceScore: total,
            alignmentLevel: align,
            riskSeverity: riskSev,
            lastAuditedAt: new Date().toISOString().split('T')[0]
          };
        }
        return p;
      }));

      // Refresh metrics from server
      const updatedMetrics = await api.getMetrics();
      setMetrics(updatedMetrics);

      showToast(`Audit successfully logged for ${newEval.programName}. Overall score: ${newEval.totalScore}/100.`);
    } catch (err: any) {
      showToast(`Audit failed: ${err.message || 'Error occurred'}`);
    }
  };

  // Upload Evidence
  const handleUploadEvidence = async (docData: Partial<EvidenceDocument>) => {
    try {
      const newDoc = await api.uploadEvidence(docData);
      setEvidenceDocs(prev => [newDoc, ...prev]);

      setPrograms(prev => prev.map(p => {
        if (p.id === docData.programId) {
          return { ...p, evidenceCount: (p.evidenceCount || 0) + 1 };
        }
        return p;
      }));

      showToast(`Evidence deposited: "${newDoc.title}".`);
    } catch (err: any) {
      showToast(`Upload failed: ${err.message}`);
    }
  };

  // Verify Evidence
  const handleVerifyEvidence = async (id: string, status: 'VERIFIED' | 'PENDING' | 'FLAGGED') => {
    try {
      const updated = await api.verifyEvidence(id, status);
      setEvidenceDocs(prev => prev.map(d => d.id === id ? updated : d));
      showToast(`Document status updated to ${status}.`);
    } catch (err: any) {
      showToast(`Verification update failed: ${err.message}`);
    }
  };

  // Create Risk
  const handleCreateRisk = async (riskData: Partial<ComplianceRisk>) => {
    try {
      const newRisk = await api.createRisk(riskData);
      setRisks(prev => [newRisk, ...prev]);
      const updatedMetrics = await api.getMetrics();
      setMetrics(updatedMetrics);
      showToast(`Risk registered: "${newRisk.title}".`);
    } catch (err: any) {
      showToast(`Risk creation failed: ${err.message}`);
    }
  };

  // Update Risk Status
  const handleUpdateRiskStatus = async (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED') => {
    try {
      await api.updateRiskStatus(id, status);
      setRisks(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      const updatedMetrics = await api.getMetrics();
      setMetrics(updatedMetrics);
      showToast(`Risk status updated to ${status}.`);
    } catch (err: any) {
      showToast(`Status update failed: ${err.message}`);
    }
  };

  // Register New Program
  const handleCreateProgram = async (programData: Partial<LibraryProgram>) => {
    try {
      const newProg = await api.createProgram(programData);
      setPrograms(prev => [newProg, ...prev]);
      const updatedMetrics = await api.getMetrics();
      setMetrics(updatedMetrics);
      showToast(`Initiative "${newProg.name}" registered.`);
    } catch (err: any) {
      showToast(`Initiative creation failed: ${err.message}`);
    }
  };

  // Acknowledge Alert
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
      if (metrics) {
        setMetrics({ ...metrics, activeAlertsCount: Math.max(0, metrics.activeAlertsCount - 1) });
      }
    } catch (err: any) {
      console.warn('Failed to acknowledge alert:', err);
    }
  };

  // Fallback metrics if initial loading
  const currentMetrics: DashboardMetrics = metrics || {
    totalPrograms: programs.length,
    overallComplianceScore: 84,
    alignmentCounts: {
      full: programs.filter(p => p.alignmentLevel === 'FULL').length,
      partial: programs.filter(p => p.alignmentLevel === 'PARTIAL').length,
      nonCompliant: programs.filter(p => p.alignmentLevel === 'NON_COMPLIANT').length
    },
    riskSeverityCounts: {
      critical: risks.filter(r => r.severity === 'CRITICAL' && r.status !== 'MITIGATED').length,
      high: risks.filter(r => r.severity === 'HIGH' && r.status !== 'MITIGATED').length,
      medium: risks.filter(r => r.severity === 'MEDIUM' && r.status !== 'MITIGATED').length,
      low: risks.filter(r => r.severity === 'LOW' && r.status !== 'MITIGATED').length
    },
    pillarProgress: pillars.map(p => ({
      pillarId: p.id,
      pillarName: p.name,
      programCount: programs.filter(pr => pr.pillarId === p.id).length,
      averageScore: 82,
      targetKPIProgress: 80
    })),
    activeAlertsCount: alerts.filter(a => !a.acknowledged).length,
    budgetUtilizationMYR: {
      allocated: 5030000,
      spent: 3450000
    }
  };

  const unacknowledgedAlertsCount = alerts.filter(a => !a.acknowledged).length;

  // Gated Access Loading
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white">
        <div className="flex flex-col items-center max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-pulse">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-base font-bold">Perpustakaan Negeri Sabah</h2>
            <p className="text-xs text-slate-400 mt-1">
              Verifying statutory credentials &amp; Firebase session...
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Connecting to Firebase Auth &amp; Firestore...</span>
          </div>
        </div>
      </div>
    );
  }

  // Access Gate: Require Firebase Authentication with Google Sign-In
  if (!firebaseUser) {
    return (
      <AuthGate
        onGoogleSignIn={googleSignIn}
        onAuthorizedSessionSignIn={signInAsOfficer}
        isFirebaseReady={isFirebaseReady}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-3.5 rounded-xl bg-emerald-900 text-white shadow-xl border border-emerald-700 flex items-center gap-2 text-xs animate-in slide-in-from-top-4 fade-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        currentPersona={currentPersona}
        allPersonas={USER_PERSONAS}
        onSelectPersona={(persona) => {
          setCurrentPersona(persona);
          showToast(`Switched active RBAC role to: ${persona.name} (${persona.role})`);
        }}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unacknowledgedAlertsCount={unacknowledgedAlertsCount}
        onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        firebaseUser={firebaseUser}
        onGoogleSignIn={googleSignIn}
        onGoogleSignOut={googleSignOut}
        isFirebaseReady={isFirebaseReady}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* PAGE 1: CORE INTERFACE (Input & Output Portal) */}
        {activeTab === 'core' && (
          <CoreInterfacePortal
            programs={programs}
            pillars={pillars}
            evaluations={evaluations}
            evidenceDocs={evidenceDocs}
            risks={risks}
            kpis={kpis}
            currentPersona={currentPersona}
            onSubmitAudit={handleAuditSubmit}
            onUploadEvidence={handleUploadEvidence}
            onVerifyEvidence={handleVerifyEvidence}
            onCreateRisk={handleCreateRisk}
            onUpdateRiskStatus={handleUpdateRiskStatus}
            onOpenProgramDetail={(prog) => {
              setDetailTargetProgram(prog);
              setIsDetailModalOpen(true);
            }}
            onOpenAuditModal={(prog) => {
              setAuditTargetProgram(prog);
              setIsAuditModalOpen(true);
            }}
            onOpenNewProgramModal={() => setIsNewProgramModalOpen(true)}
          />
        )}

        {/* PAGE 2: ANALYTICS ENGINE */}
        {activeTab === 'analytics' && (
          <AnalyticsEngineView />
        )}

        {/* PAGE 3: AUDIT TRAIL */}
        {activeTab === 'audit-trail' && (
          <AuditTrailView onNavigateToCorePortal={() => setActiveTab('core')} />
        )}

        {/* Fallback for legacy navigation */}
        {activeTab !== 'core' && activeTab !== 'analytics' && activeTab !== 'audit-trail' && (
          <CoreInterfacePortal
            programs={programs}
            pillars={pillars}
            evaluations={evaluations}
            evidenceDocs={evidenceDocs}
            risks={risks}
            kpis={kpis}
            currentPersona={currentPersona}
            onSubmitAudit={handleAuditSubmit}
            onUploadEvidence={handleUploadEvidence}
            onVerifyEvidence={handleVerifyEvidence}
            onCreateRisk={handleCreateRisk}
            onUpdateRiskStatus={handleUpdateRiskStatus}
            onOpenProgramDetail={(prog) => {
              setDetailTargetProgram(prog);
              setIsDetailModalOpen(true);
            }}
            onOpenAuditModal={(prog) => {
              setAuditTargetProgram(prog);
              setIsAuditModalOpen(true);
            }}
            onOpenNewProgramModal={() => setIsNewProgramModalOpen(true)}
          />
        )}

      </main>

      {/* Audit Evaluation Modal */}
      <ProgramAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        program={auditTargetProgram}
        allPrograms={programs}
        currentPersona={currentPersona}
        onSubmitAudit={handleAuditSubmit}
      />

      {/* Program Detail / Dossier Modal */}
      <ProgramDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        program={detailTargetProgram}
        evaluations={evaluations}
        kpis={kpis}
        risks={risks}
        evidence={evidenceDocs}
        onOpenAudit={(prog) => {
          setAuditTargetProgram(prog);
          setIsAuditModalOpen(true);
        }}
        userRole={currentPersona.role}
      />

      {/* Register New Program Modal */}
      <NewProgramModal
        isOpen={isNewProgramModalOpen}
        onClose={() => setIsNewProgramModalOpen(false)}
        pillars={pillars}
        onCreateProgram={handleCreateProgram}
      />

      {/* Governance Alerts Drawer */}
      <GovernanceAlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onNavigateToAction={(actionUrl) => {
          setActiveTab(actionUrl);
          setIsAlertsDrawerOpen(false);
        }}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            &copy; {new Date().getFullYear()} Perpustakaan Negeri Sabah (Sabah State Library). All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Sabah State Library Enactment 1988</span>
            <span>•</span>
            <span>Strategic Plan 2026–2028</span>
            <span>•</span>
            <button
              onClick={() => setActiveTab('schema')}
              className="text-emerald-700 dark:text-emerald-400 hover:underline font-medium"
            >
              Prisma PostgreSQL Specification
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
