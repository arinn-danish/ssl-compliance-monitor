import express, { Request, Response } from 'express';
import 'dotenv/config';
import { handleStreamAssistRequest } from './geminiEnterpriseAgent.ts';
import {
  STRATEGIC_PILLARS,
  INITIAL_PROGRAMS,
  INITIAL_EVALUATIONS,
  INITIAL_KPIS,
  INITIAL_RISKS,
  INITIAL_EVIDENCE_DOCS,
  INITIAL_GOVERNANCE_ALERTS,
  PRISMA_SCHEMA_CODE
} from '../src/data/sabahLibraryData.ts';
import {
  LibraryProgram,
  ProgramEvaluation,
  ProgramKPI,
  ComplianceRisk,
  EvidenceDocument,
  GovernanceAlert,
  DashboardMetrics
} from '../src/types.ts';

// In-memory persistent state initialized with Sabah State Library seed dataset
let programs: LibraryProgram[] = [...INITIAL_PROGRAMS];
let evaluations: ProgramEvaluation[] = [...INITIAL_EVALUATIONS];
let kpis: ProgramKPI[] = [...INITIAL_KPIS];
let risks: ComplianceRisk[] = [...INITIAL_RISKS];
let evidenceDocs: EvidenceDocument[] = [...INITIAL_EVIDENCE_DOCS];
let alerts: GovernanceAlert[] = [...INITIAL_GOVERNANCE_ALERTS];

function calculateMetrics(): DashboardMetrics {
  const totalPrograms = programs.length;
  const full = programs.filter(p => p.alignmentLevel === 'FULL').length;
  const partial = programs.filter(p => p.alignmentLevel === 'PARTIAL').length;
  const nonCompliant = programs.filter(p => p.alignmentLevel === 'NON_COMPLIANT').length;

  const totalScoreSum = programs.reduce((acc, p) => acc + p.complianceScore, 0);
  const overallComplianceScore = totalPrograms > 0 ? Math.round(totalScoreSum / totalPrograms) : 0;

  const criticalRisks = risks.filter(r => r.severity === 'CRITICAL' && r.status !== 'MITIGATED').length;
  const highRisks = risks.filter(r => r.severity === 'HIGH' && r.status !== 'MITIGATED').length;
  const mediumRisks = risks.filter(r => r.severity === 'MEDIUM' && r.status !== 'MITIGATED').length;
  const lowRisks = risks.filter(r => r.severity === 'LOW' && r.status !== 'MITIGATED').length;

  const pillarProgress = STRATEGIC_PILLARS.map(pillar => {
    const pillarPrograms = programs.filter(p => p.pillarId === pillar.id);
    const count = pillarPrograms.length;
    const avgScore = count > 0 ? Math.round(pillarPrograms.reduce((sum, p) => sum + p.complianceScore, 0) / count) : 0;
    const avgKpi = count > 0 ? Math.round(pillarPrograms.reduce((sum, p) => sum + p.kpiProgress, 0) / count) : 0;
    return {
      pillarId: pillar.id,
      pillarName: pillar.name,
      programCount: count,
      averageScore: avgScore,
      targetKPIProgress: avgKpi
    };
  });

  const totalAllocated = programs.reduce((acc, p) => acc + p.budgetMYR, 0);
  const totalSpent = programs.reduce((acc, p) => acc + p.budgetSpentMYR, 0);

  return {
    totalPrograms,
    overallComplianceScore,
    alignmentCounts: { full, partial, nonCompliant },
    riskSeverityCounts: { critical: criticalRisks, high: highRisks, medium: mediumRisks, low: lowRisks },
    pillarProgress,
    activeAlertsCount: alerts.filter(a => !a.acknowledged).length,
    budgetUtilizationMYR: {
      allocated: totalAllocated,
      spent: totalSpent
    }
  };
}

export const app = express();

app.use(express.json({ limit: '10mb' }));

// ==========================================
// REST API ENDPOINTS
// ==========================================

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    service: 'Sabah State Library Compliance & Strategic Monitoring API',
    version: '1.0.0',
    enactment: 'Sabah State Library Enactment 1988 (Rev. 2022)',
    strategicCycle: '2026–2028'
  });
});

// Aggregated Dashboard Metrics
app.get('/api/dashboard/metrics', (_req: Request, res: Response) => {
  res.json(calculateMetrics());
});

// Strategic Pillars
app.get('/api/pillars', (_req: Request, res: Response) => {
  res.json(STRATEGIC_PILLARS);
});

// Programs - List with filtering
app.get('/api/programs', (req: Request, res: Response) => {
  let filtered = [...programs];
  const { pillarId, alignment, risk, search, branch } = req.query;

  if (pillarId && typeof pillarId === 'string' && pillarId !== 'ALL') {
    filtered = filtered.filter(p => p.pillarId === pillarId);
  }
  if (alignment && typeof alignment === 'string' && alignment !== 'ALL') {
    filtered = filtered.filter(p => p.alignmentLevel === alignment);
  }
  if (risk && typeof risk === 'string' && risk !== 'ALL') {
    filtered = filtered.filter(p => p.riskSeverity === risk);
  }
  if (branch && typeof branch === 'string' && branch !== 'ALL') {
    filtered = filtered.filter(p => p.branch.toLowerCase().includes(branch.toLowerCase()));
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.leadOfficer.toLowerCase().includes(q) ||
      p.statutoryReference.toLowerCase().includes(q)
    );
  }

  res.json(filtered);
});

// Program by ID
app.get('/api/programs/:id', (req: Request, res: Response) => {
  const program = programs.find(p => p.id === req.params.id);
  if (!program) {
    return res.status(404).json({ error: 'Program not found' });
  }
  const programEvaluations = evaluations.filter(e => e.programId === program.id);
  const programKpis = kpis.filter(k => k.programId === program.id);
  const programRisks = risks.filter(r => r.programId === program.id);
  const programEvidence = evidenceDocs.filter(e => e.programId === program.id);

  res.json({
    ...program,
    evaluations: programEvaluations,
    kpis: programKpis,
    risks: programRisks,
    evidence: programEvidence
  });
});

// Create Program
app.post('/api/programs', (req: Request, res: Response) => {
  const body = req.body;
  const pillar = STRATEGIC_PILLARS.find(p => p.id === body.pillarId);

  const newProgram: LibraryProgram = {
    id: `prog-${Date.now()}`,
    code: body.code || `SSL-PRG-${programs.length + 1}`,
    name: body.name,
    pillarId: body.pillarId,
    pillarName: pillar?.name || 'General Strategic Initiative',
    branch: body.branch || 'Headquarters Tanjung Aru',
    leadOfficer: body.leadOfficer || 'Unassigned',
    statutoryReference: body.statutoryReference || 'Sabah State Library Enactment 1988, Section 6',
    strategicObjective: body.strategicObjective || '',
    alignmentLevel: body.alignmentLevel || 'PARTIAL',
    complianceScore: Number(body.complianceScore) || 70,
    riskSeverity: body.riskSeverity || 'LOW',
    budgetMYR: Number(body.budgetMYR) || 100000,
    budgetSpentMYR: 0,
    kpiProgress: 0,
    status: 'ACTIVE',
    lastAuditedAt: new Date().toISOString().split('T')[0],
    nextAuditDue: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0],
    evidenceCount: 0,
    unresolvedRisksCount: 0,
    description: body.description || ''
  };

  programs.unshift(newProgram);
  res.status(201).json(newProgram);
});

// Evaluations - List
app.get('/api/evaluations', (req: Request, res: Response) => {
  const { programId } = req.query;
  if (programId && typeof programId === 'string') {
    return res.json(evaluations.filter(e => e.programId === programId));
  }
  res.json(evaluations);
});

// Create Evaluation (Audit Scoring)
app.post('/api/evaluations', (req: Request, res: Response) => {
  const {
    programId,
    evaluatorId,
    evaluatorName,
    evaluatorRole,
    scores,
    statutoryEnactmentClause,
    gapsIdentified,
    auditorNotes,
    correctiveAction
  } = req.body;

  const program = programs.find(p => p.id === programId);
  if (!program) {
    return res.status(404).json({ error: 'Program not found' });
  }

  const totalScore = Math.min(
    100,
    (Number(scores?.statutoryEnactment) || 0) +
    (Number(scores?.strategicRelevance) || 0) +
    (Number(scores?.executionIntegrity) || 0) +
    (Number(scores?.communityImpact) || 0)
  );

  let alignmentLevel: 'FULL' | 'PARTIAL' | 'NON_COMPLIANT' = 'FULL';
  let riskSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';

  if (totalScore < 50) {
    alignmentLevel = 'NON_COMPLIANT';
    riskSeverity = 'CRITICAL';
  } else if (totalScore < 80) {
    alignmentLevel = 'PARTIAL';
    riskSeverity = 'HIGH';
  } else {
    alignmentLevel = 'FULL';
    riskSeverity = 'LOW';
  }

  const evaluationDate = new Date().toISOString().split('T')[0];

  const newEvaluation: ProgramEvaluation = {
    id: `eval-${Date.now()}`,
    programId,
    programName: program.name,
    evaluatorId: evaluatorId || 'user-001',
    evaluatorName: evaluatorName || 'Compliance Officer',
    evaluatorRole: evaluatorRole || 'Internal Audit',
    evaluationDate,
    scores: {
      statutoryEnactment: Number(scores?.statutoryEnactment) || 0,
      strategicRelevance: Number(scores?.strategicRelevance) || 0,
      executionIntegrity: Number(scores?.executionIntegrity) || 0,
      communityImpact: Number(scores?.communityImpact) || 0
    },
    totalScore,
    alignmentLevel,
    statutoryEnactmentClause: statutoryEnactmentClause || program.statutoryReference,
    gapsIdentified: Array.isArray(gapsIdentified) ? gapsIdentified : (gapsIdentified ? [gapsIdentified] : []),
    auditorNotes: auditorNotes || '',
    status: 'SUBMITTED',
    correctiveAction: correctiveAction ? {
      id: `cap-${Date.now()}`,
      actionRequired: correctiveAction.actionRequired,
      assignedOfficer: correctiveAction.assignedOfficer,
      dueDate: correctiveAction.dueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'PENDING',
      escalationLevel: correctiveAction.escalationLevel || 'INTERNAL'
    } : undefined
  };

  evaluations.unshift(newEvaluation);

  // Update program's score and alignment status
  program.complianceScore = totalScore;
  program.alignmentLevel = alignmentLevel;
  program.riskSeverity = riskSeverity;
  program.lastAuditedAt = evaluationDate;
  program.nextAuditDue = new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString().split('T')[0];

  // Check if new alert needs to be generated for non-compliant or high gap
  if (alignmentLevel === 'NON_COMPLIANT') {
    alerts.unshift({
      id: `alt-${Date.now()}`,
      type: 'ENACTMENT_GAP',
      severity: 'CRITICAL',
      title: `Audit Non-Compliance: ${program.code}`,
      message: `Program scored ${totalScore}/100. Gaps identified against statutory enactment. Immediate corrective action assigned.`,
      programId: program.id,
      programName: program.name,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      acknowledged: false,
      actionUrl: 'evaluations'
    });
  }

  res.status(201).json(newEvaluation);
});

// KPIs - List & Update
app.get('/api/kpis', (_req: Request, res: Response) => {
  res.json(kpis);
});

app.put('/api/kpis/:id', (req: Request, res: Response) => {
  const kpiIndex = kpis.findIndex(k => k.id === req.params.id);
  if (kpiIndex === -1) {
    return res.status(404).json({ error: 'KPI not found' });
  }
  const { currentValue, status } = req.body;
  kpis[kpiIndex].currentValue = Number(currentValue) ?? kpis[kpiIndex].currentValue;
  if (status) kpis[kpiIndex].status = status;
  res.json(kpis[kpiIndex]);
});

// Risks - List & Management
app.get('/api/risks', (_req: Request, res: Response) => {
  res.json(risks);
});

app.post('/api/risks', (req: Request, res: Response) => {
  const { programId, title, category, likelihood, impact, mitigationStrategy, owner } = req.body;
  const program = programs.find(p => p.id === programId);
  if (!program) {
    return res.status(404).json({ error: 'Program not found' });
  }

  const l = Math.min(5, Math.max(1, Number(likelihood) || 1));
  const i = Math.min(5, Math.max(1, Number(impact) || 1));
  const score = l * i;
  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (score >= 16) severity = 'CRITICAL';
  else if (score >= 10) severity = 'HIGH';
  else if (score >= 5) severity = 'MEDIUM';

  const newRisk: ComplianceRisk = {
    id: `risk-${Date.now()}`,
    programId,
    programName: program.name,
    pillarId: program.pillarId,
    title,
    category: category || 'STATUTORY_NON_COMPLIANCE',
    likelihood: l,
    impact: i,
    severity,
    mitigationStrategy,
    owner: owner || 'Compliance Officer',
    status: 'OPEN',
    identifiedDate: new Date().toISOString().split('T')[0]
  };

  risks.unshift(newRisk);
  program.unresolvedRisksCount = (program.unresolvedRisksCount || 0) + 1;
  if (severity === 'CRITICAL' || severity === 'HIGH') {
    program.riskSeverity = severity;
  }

  res.status(201).json(newRisk);
});

app.put('/api/risks/:id/status', (req: Request, res: Response) => {
  const risk = risks.find(r => r.id === req.params.id);
  if (!risk) {
    return res.status(404).json({ error: 'Risk not found' });
  }
  const { status } = req.body;
  if (status) {
    risk.status = status;
    if (status === 'MITIGATED') {
      const program = programs.find(p => p.id === risk.programId);
      if (program && program.unresolvedRisksCount > 0) {
        program.unresolvedRisksCount -= 1;
      }
    }
  }
  res.json(risk);
});

// Evidence Documents - Repository
app.get('/api/evidence', (req: Request, res: Response) => {
  const { programId, type } = req.query;
  let filtered = [...evidenceDocs];
  if (programId && typeof programId === 'string') {
    filtered = filtered.filter(e => e.programId === programId);
  }
  if (type && typeof type === 'string' && type !== 'ALL') {
    filtered = filtered.filter(e => e.documentType === type);
  }
  res.json(filtered);
});

app.post('/api/evidence', (req: Request, res: Response) => {
  const { programId, title, documentType, fileName, fileSize, uploadedBy, provenanceDetails, tags } = req.body;
  const program = programs.find(p => p.id === programId);
  if (!program) {
    return res.status(404).json({ error: 'Program not found' });
  }

  const newDoc: EvidenceDocument = {
    id: `ev-${Date.now()}`,
    programId,
    programName: program.name,
    title: title || fileName || 'Uploaded Compliance Document',
    documentType: documentType || 'INSPECTION_REPORT',
    fileName: fileName || 'Document.pdf',
    fileSize: fileSize || '1.5 MB',
    uploadedBy: uploadedBy || 'Antonia Peter Sani',
    uploadedAt: new Date().toISOString().split('T')[0],
    verifiedStatus: 'VERIFIED',
    provenanceDetails: provenanceDetails || 'Uploaded and verified via Sabah State Library Compliance Portal.',
    fileUrl: `/documents/${fileName || 'document.pdf'}`,
    tags: Array.isArray(tags) ? tags : ['Statutory Compliance', 'Sabah State Library']
  };

  evidenceDocs.unshift(newDoc);
  program.evidenceCount = (program.evidenceCount || 0) + 1;
  res.status(201).json(newDoc);
});

app.patch('/api/evidence/:id/verify', (req: Request, res: Response) => {
  const doc = evidenceDocs.find(d => d.id === req.params.id);
  if (!doc) {
    return res.status(404).json({ error: 'Evidence document not found' });
  }
  const { status } = req.body;
  if (status) {
    doc.verifiedStatus = status;
  }
  res.json(doc);
});

// Governance Alerts
app.get('/api/alerts', (_req: Request, res: Response) => {
  res.json(alerts);
});

app.patch('/api/alerts/:id/acknowledge', (req: Request, res: Response) => {
  const alert = alerts.find(a => a.id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Alert not found' });
  }
  alert.acknowledged = true;
  res.json(alert);
});

// Prisma Schema & Tech Stack Architecture specification
app.get('/api/schema/prisma', (_req: Request, res: Response) => {
  res.json({
    schema: PRISMA_SCHEMA_CODE,
    dialect: 'PostgreSQL 16+',
    orm: 'Prisma 5+',
    enactmentsCovered: [
      'Sabah State Library Enactment 1988 (Enactment No. 4 of 1988)',
      'Sabah State Library (Amendment) Enactment 2022',
      'State Strategic Plan (Pelan Strategik Perpustakaan Negeri Sabah 2026–2028)'
    ],
    corePillars: STRATEGIC_PILLARS.map(p => ({
      code: p.code,
      name: p.name,
      section: p.enactmentSection
    }))
  });
});

// Gemini Enterprise Discovery Engine Server-Side Integration
app.post('/api/agent/stream-assist', handleStreamAssistRequest);
app.post('/api/gemini-enterprise/stream-assist', handleStreamAssistRequest);

// Safe configuration status check
app.get('/api/agent/status', (_req: Request, res: Response) => {
  const hasClientId = Boolean(process.env.oauth_client_id || process.env.OAUTH_CLIENT_ID);
  const hasClientSecret = Boolean(process.env.oauth_client_secret || process.env.OAUTH_CLIENT_SECRET);
  const hasRefreshToken = Boolean(process.env.oauth_refresh_token || process.env.OAUTH_REFRESH_TOKEN);
  const hasProjectNumber = Boolean(process.env.PROJECT_NUMBER || process.env.project_number);
  const hasEngineId = Boolean(process.env.ENGINE_ID || process.env.engine_id);
  const hasAssistantId = Boolean(process.env.ASSISTANT_ID || process.env.assistant_id);
  const hasAgentId = Boolean(process.env.AGENT_ID || process.env.agent_id);
  const resolvedAgentId = (
    process.env.AGENT_ID ||
    process.env.agent_id ||
    process.env.AI_AGENT_ID ||
    process.env.ASSISTANT_AGENT_ID ||
    '9469390002127365054'
  ).trim().replace(/^\{|\}$/g, '').trim();

  res.json({
    configured: hasClientId && hasClientSecret && hasRefreshToken,
    agentId: resolvedAgentId,
    projectNumber: (process.env.PROJECT_NUMBER || process.env.project_number || 'sabahnet-ge-ai').trim().replace(/^\{|\}$/g, '').trim(),
    engineId: (process.env.ENGINE_ID || process.env.engine_id || 'ai-application_1786935394467').trim().replace(/^\{|\}$/g, '').trim(),
    assistantId: (process.env.ASSISTANT_ID || process.env.assistant_id || 'default_assistant').trim().replace(/^\{|\}$/g, '').trim(),
    oauthConfigured: {
      hasClientId,
      hasClientSecret,
      hasRefreshToken
    },
    discoveryEngineConfigured: {
      hasProjectNumber,
      hasEngineId,
      hasAssistantId,
      hasAgentId
    }
  });
});

// Automated RBAC Resolution
app.post('/api/auth/rbac/verify', (req: Request, res: Response) => {
  const { email, name, uid } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();

  const isSuperAdmin =
    cleanEmail === 'antoniapeter.sani@sabah.gov.my' ||
    cleanEmail.startsWith('antoniapeter') ||
    cleanEmail === 'pengarah.ssl@sabah.gov.my';

  const isLibrarian =
    !isSuperAdmin &&
    (cleanEmail.endsWith('@sabah.gov.my') || cleanEmail.endsWith('@ssl.gov.my'));

  const isMember = !isSuperAdmin && !isLibrarian && Boolean(cleanEmail);

  let role: 'SuperAdmin' | 'Librarian' | 'Member' | 'Guest' = 'Guest';
  let designation = 'Public Observer (Read-Only)';
  let department = 'Public Community Access Portal';

  if (isSuperAdmin) {
    role = 'SuperAdmin';
    designation = 'Director of Sabah State Library (Pengarah Perpustakaan Negeri Sabah)';
    department = 'Executive Directorate & Statutory Governance';
  } else if (isLibrarian) {
    role = 'Librarian';
    designation = 'Senior Compliance Officer / Pustakawan Berkanun';
    department = 'Statutory Legal Deposit & Branch Inspection Directorate';
  } else if (isMember) {
    role = 'Member';
    designation = 'Registered Library Member / Academic Researcher';
    department = 'State Research & Digital Lending Services';
  }

  const permissions = {
    canAuditPrograms: role === 'SuperAdmin' || role === 'Librarian',
    canUploadEvidence: role === 'SuperAdmin' || role === 'Librarian',
    canVerifyEvidence: role === 'SuperAdmin',
    canManageRisks: role === 'SuperAdmin' || role === 'Librarian',
    canRegisterPrograms: role === 'SuperAdmin',
    canAcknowledgeAlerts: role === 'SuperAdmin' || role === 'Librarian',
    canAccessSchema: role === 'SuperAdmin' || role === 'Librarian',
    canQueryAgent: true,
    canManageUsers: role === 'SuperAdmin',
    canExportReports: role === 'SuperAdmin' || role === 'Librarian'
  };

  res.json({
    uid: uid || 'guest',
    role,
    email: cleanEmail,
    displayName: name || (cleanEmail ? cleanEmail.split('@')[0] : 'Guest Visitor'),
    designation,
    department,
    permissions,
    enactmentAuthority: 'Sabah State Library Enactment 1988 (No. 4 of 1988, amended 2022)'
  });
});
