export type AlignmentLevel = 'FULL' | 'PARTIAL' | 'NON_COMPLIANT';
export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type UserRole =
  | 'SuperAdmin'
  | 'Librarian'
  | 'Member'
  | 'Guest'
  | 'ADMIN'
  | 'COMPLIANCE_OFFICER'
  | 'VIEWER';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface UserPermissions {
  canAuditPrograms: boolean;
  canUploadEvidence: boolean;
  canVerifyEvidence: boolean;
  canManageRisks: boolean;
  canRegisterPrograms: boolean;
  canAcknowledgeAlerts: boolean;
  canAccessSchema: boolean;
  canQueryAgent: boolean;
  canManageUsers: boolean;
  canExportReports: boolean;
}

export interface AICitation {
  id: string;
  title: string;
  enactmentSection?: string;
  excerpt: string;
  relevance: string;
  type: 'ENACTMENT' | 'POLICY' | 'STRATEGIC_PLAN' | 'DATABASE_RECORD' | 'AUDIT_CIRCULAR';
  sourceUrl?: string;
  confidenceScore?: number;
  fullText?: string;
  crossReferences?: string[];
}

export type EvaluationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REVISE_REQUIRED';
export type MetricStatus = 'ON_TRACK' | 'AT_RISK' | 'LAGGING';
export type DocumentType = 'MOU' | 'INSPECTION_REPORT' | 'PROVENANCE_RECORD' | 'STATUTORY_CERTIFICATE' | 'AUDIT_TRAIL';

export interface UserPersona {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  designation: string;
  department: string;
  avatarInitials: string;
  permissions?: UserPermissions;
}

export interface StrategicPillar {
  id: string;
  code: string;
  name: string;
  enactmentSection: string;
  statutoryMandate: string;
  target2028: string;
  leadUnit: string;
  color: string;
  budgetAllocatedMYR: number;
}

export interface LibraryProgram {
  id: string;
  code: string;
  name: string;
  pillarId: string;
  pillarName: string;
  branch: string;
  leadOfficer: string;
  statutoryReference: string;
  strategicObjective: string;
  alignmentLevel: AlignmentLevel;
  complianceScore: number;
  riskSeverity: RiskSeverity;
  budgetMYR: number;
  budgetSpentMYR: number;
  kpiProgress: number; // 0-100%
  status: 'ACTIVE' | 'PLANNED' | 'UNDER_AUDIT' | 'COMPLETED';
  lastAuditedAt: string;
  nextAuditDue: string;
  evidenceCount: number;
  unresolvedRisksCount: number;
  description: string;
}

export interface EvaluationScoreCriteria {
  statutoryEnactment: number;   // Max 25
  strategicRelevance: number;   // Max 25
  executionIntegrity: number;   // Max 25
  communityImpact: number;      // Max 25
}

export interface CorrectiveAction {
  id: string;
  actionRequired: string;
  assignedOfficer: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  escalationLevel: 'INTERNAL' | 'DIRECTOR_ESCALATION' | 'MINISTRY_NOTICE';
}

export interface ProgramEvaluation {
  id: string;
  programId: string;
  programName: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  evaluationDate: string;
  scores: EvaluationScoreCriteria;
  totalScore: number; // 0-100
  alignmentLevel: AlignmentLevel;
  statutoryEnactmentClause: string;
  gapsIdentified: string[];
  auditorNotes: string;
  status: EvaluationStatus;
  correctiveAction?: CorrectiveAction;
}

export interface ProgramKPI {
  id: string;
  programId: string;
  programName: string;
  pillarId: string;
  title: string;
  baseline: number;
  target2026: number;
  target2028: number;
  currentValue: number;
  unit: string;
  status: MetricStatus;
  reportingQuarter: string;
}

export interface ComplianceRisk {
  id: string;
  programId: string;
  programName: string;
  pillarId: string;
  title: string;
  category: 'STATUTORY_NON_COMPLIANCE' | 'PRESERVATION_LOSS' | 'RESOURCE_DEFICIT' | 'INFRASTRUCTURE' | 'COMMUNITY_DISENGAGEMENT';
  likelihood: number; // 1-5
  impact: number;     // 1-5
  severity: RiskSeverity;
  mitigationStrategy: string;
  owner: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED';
  identifiedDate: string;
}

export interface EvidenceDocument {
  id: string;
  programId: string;
  programName: string;
  title: string;
  documentType: DocumentType;
  fileName: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  verifiedStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED';
  provenanceDetails?: string;
  fileUrl: string;
  tags: string[];
}

export interface GovernanceAlert {
  id: string;
  type: 'LAGGING_KPI' | 'AUDIT_DEADLINE' | 'CRITICAL_RISK' | 'ENACTMENT_GAP';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  message: string;
  programId?: string;
  programName?: string;
  timestamp: string;
  acknowledged: boolean;
  actionUrl?: string;
}

export interface DashboardMetrics {
  totalPrograms: number;
  overallComplianceScore: number;
  alignmentCounts: {
    full: number;
    partial: number;
    nonCompliant: number;
  };
  riskSeverityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  pillarProgress: {
    pillarId: string;
    pillarName: string;
    programCount: number;
    averageScore: number;
    targetKPIProgress: number;
  }[];
  activeAlertsCount: number;
  budgetUtilizationMYR: {
    allocated: number;
    spent: number;
  };
}

export type AuditCycleType =
  | 'EVALUATION_SUBMISSION'
  | 'EVIDENCE_DEPOSIT'
  | 'RISK_REGISTRATION'
  | 'PROGRAM_CREATION'
  | 'STATUS_VERIFICATION'
  | 'SYSTEM_DIAGNOSTIC'
  | 'AGENT_ASSIST_QUERY';

export interface AuditCycleRecord {
  id: string;
  timestamp: string; // ISO 8601 string
  summary: string; // Short human-readable summary of the input-output cycle
  cycleType: AuditCycleType;
  officerName?: string;
  officerRole?: string;
  status: 'SUCCESS' | 'WARNING' | 'FAILED';
  executionTimeMs?: number;
  input: {
    action: string;
    targetProgramId?: string;
    targetProgramName?: string;
    statutoryClause?: string;
    submittedBy?: string;
    payload: Record<string, any>;
  };
  output: {
    resultSummary: string;
    totalScore?: number;
    alignmentLevel?: AlignmentLevel;
    riskSeverity?: RiskSeverity;
    documentId?: string;
    statusBadge?: string;
    details?: Record<string, any>;
    errorMessage?: string;
  };
  rawPayload?: Record<string, any>;
}

export interface FirestoreAuditLog {
  id: string;
  question: string;        // question asked
  timestamp: string;       // timestamp
  summary: string;         // short summary of the result
  userEmail: string;       // signed-in user's email
  userId?: string;
  userName?: string;
  rawAnswer?: string;
  status?: string;
}

