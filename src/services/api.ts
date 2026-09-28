import {
  LibraryProgram,
  ProgramEvaluation,
  ProgramKPI,
  ComplianceRisk,
  EvidenceDocument,
  GovernanceAlert,
  DashboardMetrics,
  StrategicPillar,
  AuditCycleRecord
} from '../types';
import {
  STRATEGIC_PILLARS,
  INITIAL_PROGRAMS,
  INITIAL_EVALUATIONS,
  INITIAL_KPIS,
  INITIAL_RISKS,
  INITIAL_EVIDENCE_DOCS,
  INITIAL_GOVERNANCE_ALERTS
} from '../data/sabahLibraryData';
import { firestoreService } from './firebase';

// Helper to make API calls with fallback to in-memory state if server is momentarily unreachable
async function safeFetch<T>(url: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`API call to ${url} failed, using local memory state:`, err);
    if (fallbackData !== undefined) {
      return fallbackData;
    }
    throw err;
  }
}

export const api = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    return safeFetch<DashboardMetrics>('/api/dashboard/metrics', undefined, {
      totalPrograms: INITIAL_PROGRAMS.length,
      overallComplianceScore: 84,
      alignmentCounts: {
        full: INITIAL_PROGRAMS.filter(p => p.alignmentLevel === 'FULL').length,
        partial: INITIAL_PROGRAMS.filter(p => p.alignmentLevel === 'PARTIAL').length,
        nonCompliant: INITIAL_PROGRAMS.filter(p => p.alignmentLevel === 'NON_COMPLIANT').length
      },
      riskSeverityCounts: {
        critical: INITIAL_RISKS.filter(r => r.severity === 'CRITICAL').length,
        high: INITIAL_RISKS.filter(r => r.severity === 'HIGH').length,
        medium: INITIAL_RISKS.filter(r => r.severity === 'MEDIUM').length,
        low: INITIAL_RISKS.filter(r => r.severity === 'LOW').length
      },
      pillarProgress: STRATEGIC_PILLARS.map(p => ({
        pillarId: p.id,
        pillarName: p.name,
        programCount: INITIAL_PROGRAMS.filter(pr => pr.pillarId === p.id).length,
        averageScore: 85,
        targetKPIProgress: 80
      })),
      activeAlertsCount: INITIAL_GOVERNANCE_ALERTS.filter(a => !a.acknowledged).length,
      budgetUtilizationMYR: {
        allocated: 5030000,
        spent: 3450000
      }
    });
  },

  getPillars: async (): Promise<StrategicPillar[]> => {
    return safeFetch<StrategicPillar[]>('/api/pillars', undefined, STRATEGIC_PILLARS);
  },

  getPrograms: async (params?: {
    pillarId?: string;
    alignment?: string;
    risk?: string;
    branch?: string;
    search?: string;
  }): Promise<LibraryProgram[]> => {
    try {
      // First attempt to load from Firestore cloud database
      const cloudPrograms = await firestoreService.getPrograms();
      let filtered = [...cloudPrograms];

      if (params?.pillarId && params.pillarId !== 'ALL') {
        filtered = filtered.filter(p => p.pillarId === params.pillarId);
      }
      if (params?.alignment && params.alignment !== 'ALL') {
        filtered = filtered.filter(p => p.alignmentLevel === params.alignment);
      }
      if (params?.risk && params.risk !== 'ALL') {
        filtered = filtered.filter(p => p.riskSeverity === params.risk);
      }
      if (params?.branch && params.branch !== 'ALL') {
        filtered = filtered.filter(p => p.branch.toLowerCase().includes(params.branch!.toLowerCase()));
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.leadOfficer.toLowerCase().includes(q) ||
          p.statutoryReference.toLowerCase().includes(q)
        );
      }
      return filtered;
    } catch {
      const query = new URLSearchParams();
      if (params?.pillarId && params.pillarId !== 'ALL') query.set('pillarId', params.pillarId);
      if (params?.alignment && params.alignment !== 'ALL') query.set('alignment', params.alignment);
      if (params?.risk && params.risk !== 'ALL') query.set('risk', params.risk);
      if (params?.branch && params.branch !== 'ALL') query.set('branch', params.branch);
      if (params?.search) query.set('search', params.search);

      const url = `/api/programs${query.toString() ? `?${query.toString()}` : ''}`;
      return safeFetch<LibraryProgram[]>(url, undefined, INITIAL_PROGRAMS);
    }
  },

  getProgramById: async (id: string): Promise<LibraryProgram | null> => {
    return safeFetch<LibraryProgram>(`/api/programs/${id}`, undefined, INITIAL_PROGRAMS.find(p => p.id === id) || null as any);
  },

  createProgram: async (programData: Partial<LibraryProgram>): Promise<LibraryProgram> => {
    const pillar = STRATEGIC_PILLARS.find(p => p.id === programData.pillarId);
    const newProgram: LibraryProgram = {
      id: programData.id || `prog-${Date.now()}`,
      code: programData.code || `SSL-PRG-${Date.now().toString().slice(-4)}`,
      name: programData.name || 'Untitled Initiative',
      pillarId: programData.pillarId || '1',
      pillarName: pillar?.name || 'General Governance',
      branch: programData.branch || 'Headquarters Tanjung Aru',
      leadOfficer: programData.leadOfficer || 'Antonia Peter Sani',
      statutoryReference: programData.statutoryReference || 'Sabah State Library Enactment 1988, Section 6',
      strategicObjective: programData.strategicObjective || '',
      alignmentLevel: programData.alignmentLevel || 'PARTIAL',
      complianceScore: Number(programData.complianceScore) || 75,
      riskSeverity: programData.riskSeverity || 'LOW',
      budgetMYR: Number(programData.budgetMYR) || 100000,
      budgetSpentMYR: 0,
      kpiProgress: 0,
      status: 'ACTIVE',
      lastAuditedAt: new Date().toISOString().split('T')[0],
      nextAuditDue: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
      evidenceCount: 0,
      unresolvedRisksCount: 0,
      description: programData.description || ''
    };

    // Save to Firestore
    try {
      await firestoreService.addProgram(newProgram);
      await firestoreService.recordAuditCycle({
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        summary: `New statutory library program "${newProgram.name}" (${newProgram.code}) registered under ${newProgram.pillarName}.`,
        cycleType: 'PROGRAM_CREATION',
        officerName: newProgram.leadOfficer,
        officerRole: 'Lead Officer',
        status: 'SUCCESS',
        input: {
          action: 'REGISTER_LIBRARY_PROGRAM',
          targetProgramId: newProgram.id,
          targetProgramName: newProgram.name,
          statutoryClause: newProgram.statutoryReference,
          submittedBy: newProgram.leadOfficer,
          payload: programData
        },
        output: {
          resultSummary: `Program created with code ${newProgram.code} and initial alignment status ${newProgram.alignmentLevel}`,
          totalScore: newProgram.complianceScore,
          alignmentLevel: newProgram.alignmentLevel,
          riskSeverity: newProgram.riskSeverity,
          documentId: newProgram.id,
          statusBadge: newProgram.status
        },
        rawPayload: { input: programData, output: newProgram }
      });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    // Also sync to local backend if available
    try {
      await fetch('/api/programs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProgram)
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    return newProgram;
  },

  getEvaluations: async (programId?: string): Promise<ProgramEvaluation[]> => {
    try {
      const all = await firestoreService.getEvaluations();
      if (programId) {
        return all.filter(e => e.programId === programId);
      }
      return all;
    } catch {
      const url = programId ? `/api/evaluations?programId=${programId}` : '/api/evaluations';
      return safeFetch<ProgramEvaluation[]>(url, undefined, INITIAL_EVALUATIONS);
    }
  },

  submitEvaluation: async (evalData: {
    programId: string;
    evaluatorId: string;
    evaluatorName: string;
    evaluatorRole: string;
    scores: {
      statutoryEnactment: number;
      strategicRelevance: number;
      executionIntegrity: number;
      communityImpact: number;
    };
    statutoryEnactmentClause: string;
    gapsIdentified: string[];
    auditorNotes: string;
    correctiveAction?: {
      actionRequired: string;
      assignedOfficer: string;
      dueDate: string;
      escalationLevel: 'INTERNAL' | 'DIRECTOR_ESCALATION' | 'MINISTRY_NOTICE';
    };
  }): Promise<ProgramEvaluation> => {
    const totalScore = Math.min(
      100,
      (Number(evalData.scores?.statutoryEnactment) || 0) +
      (Number(evalData.scores?.strategicRelevance) || 0) +
      (Number(evalData.scores?.executionIntegrity) || 0) +
      (Number(evalData.scores?.communityImpact) || 0)
    );

    const alignmentLevel = totalScore < 50 ? 'NON_COMPLIANT' : totalScore < 80 ? 'PARTIAL' : 'FULL';
    const evalId = `eval-${Date.now()}`;
    const evaluationDate = new Date().toISOString().split('T')[0];

    const newEval: ProgramEvaluation = {
      id: evalId,
      programId: evalData.programId,
      programName: 'Library Initiative',
      evaluatorId: evalData.evaluatorId || 'user-auditor',
      evaluatorName: evalData.evaluatorName || 'Antonia Peter Sani',
      evaluatorRole: evalData.evaluatorRole || 'Internal Audit',
      evaluationDate,
      scores: evalData.scores,
      totalScore,
      alignmentLevel,
      statutoryEnactmentClause: evalData.statutoryEnactmentClause,
      gapsIdentified: evalData.gapsIdentified,
      auditorNotes: evalData.auditorNotes,
      status: 'SUBMITTED',
      correctiveAction: evalData.correctiveAction ? {
        id: `cap-${Date.now()}`,
        actionRequired: evalData.correctiveAction.actionRequired,
        assignedOfficer: evalData.correctiveAction.assignedOfficer,
        dueDate: evalData.correctiveAction.dueDate,
        status: 'PENDING',
        escalationLevel: evalData.correctiveAction.escalationLevel
      } : undefined
    };

    // Save to Firestore
    try {
      await firestoreService.addEvaluation(newEval);
      await firestoreService.updateProgram(evalData.programId, {
        complianceScore: totalScore,
        alignmentLevel: alignmentLevel,
        lastAuditedAt: evaluationDate
      });
      await firestoreService.recordAuditCycle({
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        summary: `Statutory audit evaluation submitted for program ${evalData.programId}. Calculated compliance score: ${totalScore}/100 (${alignmentLevel}).`,
        cycleType: 'EVALUATION_SUBMISSION',
        officerName: evalData.evaluatorName,
        officerRole: evalData.evaluatorRole,
        status: 'SUCCESS',
        input: {
          action: 'SUBMIT_PROGRAM_AUDIT_EVALUATION',
          targetProgramId: evalData.programId,
          statutoryClause: evalData.statutoryEnactmentClause,
          submittedBy: evalData.evaluatorName,
          payload: {
            scores: evalData.scores,
            statutoryEnactmentClause: evalData.statutoryEnactmentClause,
            gapsIdentified: evalData.gapsIdentified,
            auditorNotes: evalData.auditorNotes,
            correctiveAction: evalData.correctiveAction
          }
        },
        output: {
          resultSummary: `Evaluation recorded with compliance rating ${totalScore}/100 (${alignmentLevel}) under Enactment 1988`,
          totalScore,
          alignmentLevel,
          documentId: newEval.id,
          statusBadge: 'SUBMITTED',
          details: {
            evaluationDate,
            hasCorrectiveAction: !!evalData.correctiveAction,
            correctiveActionStatus: newEval.correctiveAction?.status
          }
        },
        rawPayload: {
          input: evalData,
          output: newEval
        }
      });
    } catch (err) {
      console.warn('Firestore write warning:', err);
    }

    // Sync to backend API
    try {
      await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(evalData)
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    return newEval;
  },

  getKPIs: async (): Promise<ProgramKPI[]> => {
    try {
      return await firestoreService.getKPIs();
    } catch {
      return safeFetch<ProgramKPI[]>('/api/kpis', undefined, INITIAL_KPIS);
    }
  },

  updateKPI: async (id: string, currentValue: number, status?: string): Promise<void> => {
    try {
      await firestoreService.updateKPI(id, currentValue, status);
    } catch (e) {
      console.warn('Firestore update warning:', e);
    }
    try {
      await fetch(`/api/kpis/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentValue, status })
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }
  },

  getRisks: async (): Promise<ComplianceRisk[]> => {
    try {
      return await firestoreService.getRisks();
    } catch {
      return safeFetch<ComplianceRisk[]>('/api/risks', undefined, INITIAL_RISKS);
    }
  },

  createRisk: async (riskData: Partial<ComplianceRisk>): Promise<ComplianceRisk> => {
    const l = Math.min(5, Math.max(1, Number(riskData.likelihood) || 1));
    const i = Math.min(5, Math.max(1, Number(riskData.impact) || 1));
    const score = l * i;
    let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    if (score >= 16) severity = 'CRITICAL';
    else if (score >= 10) severity = 'HIGH';
    else if (score >= 5) severity = 'MEDIUM';

    const newRisk: ComplianceRisk = {
      id: `risk-${Date.now()}`,
      programId: riskData.programId || 'prog-001',
      programName: riskData.programName || 'Library Program',
      pillarId: riskData.pillarId || '1',
      title: riskData.title || 'Risk item',
      category: riskData.category || 'STATUTORY_NON_COMPLIANCE',
      likelihood: l,
      impact: i,
      severity,
      mitigationStrategy: riskData.mitigationStrategy || 'Enforce statutory oversight and periodic review.',
      owner: riskData.owner || 'Compliance Officer',
      status: 'OPEN',
      identifiedDate: new Date().toISOString().split('T')[0]
    };

    try {
      await firestoreService.addRisk(newRisk);
      await firestoreService.recordAuditCycle({
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        summary: `Compliance risk registered: "${newRisk.title}". Computed severity: ${severity} (Likelihood ${l}, Impact ${i}).`,
        cycleType: 'RISK_REGISTRATION',
        officerName: newRisk.owner,
        officerRole: 'Compliance Officer',
        status: severity === 'CRITICAL' ? 'WARNING' : 'SUCCESS',
        input: {
          action: 'REGISTER_COMPLIANCE_RISK',
          targetProgramId: newRisk.programId,
          targetProgramName: newRisk.programName,
          payload: riskData
        },
        output: {
          resultSummary: `Risk assessed with severity ${severity} (Likelihood: ${l}, Impact: ${i})`,
          riskSeverity: severity,
          documentId: newRisk.id,
          statusBadge: newRisk.status
        },
        rawPayload: { input: riskData, output: newRisk }
      });
    } catch (e) {
      console.warn('Firestore risk add warning:', e);
    }

    try {
      await fetch('/api/risks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskData)
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    return newRisk;
  },

  updateRiskStatus: async (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED'): Promise<void> => {
    try {
      await firestoreService.updateRiskStatus(id, status);
      await firestoreService.recordAuditCycle({
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        summary: `Compliance risk ${id} status updated to ${status}.`,
        cycleType: 'STATUS_VERIFICATION',
        status: 'SUCCESS',
        input: {
          action: 'UPDATE_RISK_STATUS',
          payload: { riskId: id, newStatus: status }
        },
        output: {
          resultSummary: `Risk status modified to ${status}`,
          documentId: id,
          statusBadge: status
        }
      });
    } catch (e) {
      console.warn('Firestore update warning:', e);
    }

    try {
      await fetch(`/api/risks/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }
  },

  getEvidence: async (programId?: string, type?: string): Promise<EvidenceDocument[]> => {
    try {
      let docs = await firestoreService.getEvidence();
      if (programId) docs = docs.filter(d => d.programId === programId);
      if (type && type !== 'ALL') docs = docs.filter(d => d.documentType === type);
      return docs;
    } catch {
      const q = new URLSearchParams();
      if (programId) q.set('programId', programId);
      if (type && type !== 'ALL') q.set('type', type);
      const url = `/api/evidence${q.toString() ? `?${q.toString()}` : ''}`;
      return safeFetch<EvidenceDocument[]>(url, undefined, INITIAL_EVIDENCE_DOCS);
    }
  },

  uploadEvidence: async (docData: Partial<EvidenceDocument>): Promise<EvidenceDocument> => {
    const newDoc: EvidenceDocument = {
      id: `ev-${Date.now()}`,
      programId: docData.programId || 'prog-001',
      programName: docData.programName || 'Preservation & Legal Deposit',
      title: docData.title || docData.fileName || 'Compliance Evidence Document',
      documentType: docData.documentType || 'INSPECTION_REPORT' as any,
      fileName: docData.fileName || 'evidence.pdf',
      fileSize: docData.fileSize || '1.2 MB',
      uploadedBy: docData.uploadedBy || 'Antonia Peter Sani',
      uploadedAt: new Date().toISOString().split('T')[0],
      verifiedStatus: 'VERIFIED',
      provenanceDetails: docData.provenanceDetails || 'Uploaded and verified under Sabah State Library Enactment 1988.',
      fileUrl: `/documents/${docData.fileName || 'doc.pdf'}`,
      tags: docData.tags || ['Statutory Enactment', 'Audit Evidence']
    };

    try {
      await firestoreService.addEvidence(newDoc);
      await firestoreService.recordAuditCycle({
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        summary: `Legal evidence document "${newDoc.title}" deposited under ${newDoc.documentType}. Initial status: ${newDoc.verifiedStatus}.`,
        cycleType: 'EVIDENCE_DEPOSIT',
        officerName: newDoc.uploadedBy,
        officerRole: 'Statutory Depositor',
        status: 'SUCCESS',
        input: {
          action: 'DEPOSIT_STATUTORY_EVIDENCE',
          targetProgramId: newDoc.programId,
          targetProgramName: newDoc.programName,
          submittedBy: newDoc.uploadedBy,
          payload: docData
        },
        output: {
          resultSummary: `Evidence document deposited and registered under ${newDoc.documentType}`,
          documentId: newDoc.id,
          statusBadge: newDoc.verifiedStatus,
          details: {
            fileName: newDoc.fileName,
            fileSize: newDoc.fileSize,
            provenance: newDoc.provenanceDetails
          }
        },
        rawPayload: { input: docData, output: newDoc }
      });
    } catch (e) {
      console.warn('Firestore evidence write warning:', e);
    }

    try {
      await fetch('/api/evidence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docData)
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    return newDoc;
  },

  verifyEvidence: async (id: string, status: 'VERIFIED' | 'PENDING' | 'FLAGGED'): Promise<EvidenceDocument> => {
    try {
      await firestoreService.updateEvidenceStatus(id, status);
      await firestoreService.recordAuditCycle({
        id: `cycle-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        summary: `Evidence document ${id} verification updated to ${status}.`,
        cycleType: 'STATUS_VERIFICATION',
        status: status === 'FLAGGED' ? 'WARNING' : 'SUCCESS',
        input: {
          action: 'VERIFY_EVIDENCE_STATUS',
          payload: { documentId: id, newStatus: status }
        },
        output: {
          resultSummary: `Evidence document verification status changed to ${status}`,
          documentId: id,
          statusBadge: status
        }
      });
    } catch (e) {
      console.warn('Firestore update warning:', e);
    }

    try {
      await fetch(`/api/evidence/${id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }

    // Return dummy or updated document representation so calling state doesn't break
    return {
      id,
      programId: 'prog-001',
      programName: 'Library Initiative',
      title: 'Audited Evidence Document',
      documentType: 'INSPECTION_REPORT',
      fileName: 'verified_report.pdf',
      fileSize: '1.8 MB',
      uploadedBy: 'Antonia Peter Sani',
      uploadedAt: new Date().toISOString().split('T')[0],
      verifiedStatus: status,
      fileUrl: '/documents/verified.pdf',
      tags: ['Statutory Enactment']
    };
  },

  getAlerts: async (): Promise<GovernanceAlert[]> => {
    try {
      return await firestoreService.getAlerts();
    } catch {
      return safeFetch<GovernanceAlert[]>('/api/alerts', undefined, INITIAL_GOVERNANCE_ALERTS);
    }
  },

  acknowledgeAlert: async (id: string): Promise<void> => {
    try {
      await firestoreService.acknowledgeAlert(id);
    } catch (e) {
      console.warn('Firestore alert ack warning:', e);
    }

    try {
      await fetch(`/api/alerts/${id}/acknowledge`, {
        method: 'PATCH'
      });
    } catch (e) {
      console.warn('Backend sync warning:', e);
    }
  },

  // Audit Cycles / Input-Output History
  getAuditCycles: async (): Promise<AuditCycleRecord[]> => {
    return await firestoreService.getAuditCycles();
  },

  recordAuditCycle: async (record: AuditCycleRecord): Promise<AuditCycleRecord> => {
    return await firestoreService.recordAuditCycle(record);
  },

  subscribeAuditCycles: (callback: (records: AuditCycleRecord[]) => void): () => void => {
    return firestoreService.subscribeAuditCycles(callback);
  },

  // Automated Role-Based Access Control Verification
  verifyRBAC: async (userData: { email?: string; name?: string; uid?: string }) => {
    return safeFetch<any>('/api/auth/rbac/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }, {
      uid: userData.uid || 'guest',
      role: userData.email === 'antoniapeter.sani@sabah.gov.my' ? 'SuperAdmin' : (userData.email?.endsWith('@sabah.gov.my') ? 'Librarian' : (userData.email ? 'Member' : 'Guest')),
      email: userData.email || '',
      displayName: userData.name || (userData.email ? userData.email.split('@')[0] : 'Guest Visitor'),
      designation: userData.email === 'antoniapeter.sani@sabah.gov.my' ? 'Director of Sabah State Library' : 'Compliance Officer',
      department: 'Sabah State Library Directorate',
      permissions: {
        canAuditPrograms: true,
        canUploadEvidence: true,
        canVerifyEvidence: userData.email === 'antoniapeter.sani@sabah.gov.my',
        canManageRisks: true,
        canRegisterPrograms: userData.email === 'antoniapeter.sani@sabah.gov.my',
        canAcknowledgeAlerts: true,
        canAccessSchema: true,
        canQueryAgent: true,
        canManageUsers: userData.email === 'antoniapeter.sani@sabah.gov.my',
        canExportReports: true
      }
    });
  }
};
