import React from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  Calendar,
  Building,
  User,
  Scale,
  FileText,
  DollarSign,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  LibraryProgram,
  ProgramEvaluation,
  ProgramKPI,
  ComplianceRisk,
  EvidenceDocument,
  UserRole
} from '../types';

interface ProgramDetailModalProps {
  program: LibraryProgram | null;
  isOpen: boolean;
  onClose: () => void;
  evaluations: ProgramEvaluation[];
  kpis: ProgramKPI[];
  risks: ComplianceRisk[];
  evidence: EvidenceDocument[];
  onOpenAudit: (program: LibraryProgram) => void;
  userRole: UserRole;
}

export const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  program,
  isOpen,
  onClose,
  evaluations,
  kpis,
  risks,
  evidence,
  onOpenAudit,
  userRole
}) => {
  if (!isOpen || !program) return null;

  const programEvaluations = evaluations.filter(e => e.programId === program.id);
  const programKpis = kpis.filter(k => k.programId === program.id);
  const programRisks = risks.filter(r => r.programId === program.id);
  const programEvidence = evidence.filter(e => e.programId === program.id);

  const formatMYR = (val: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in my-8 text-xs">
        
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-900 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 font-mono text-[10px] font-bold">
                {program.code}
              </span>
              <span className="text-emerald-200 text-xs font-semibold">
                {program.pillarName}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {program.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {(userRole === 'ADMIN' || userRole === 'COMPLIANCE_OFFICER') && (
              <button
                onClick={() => {
                  onClose();
                  onOpenAudit(program);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition flex items-center gap-1.5"
              >
                <FileCheck2 className="w-3.5 h-3.5" /> Audit Now
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Quick Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Compliance Score</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {program.complianceScore}%
              </div>
              <span className="text-[10px] text-slate-400">Alignment: {program.alignmentLevel}</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-semibold uppercase text-slate-500">Risk Severity</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {program.riskSeverity}
              </div>
              <span className="text-[10px] text-slate-400">{programRisks.length} logged risk(s)</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-semibold uppercase text-slate-500">KPI Progress</span>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {program.kpiProgress}%
              </div>
              <span className="text-[10px] text-slate-400">Target Cycle: 2026–2028</span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] font-semibold uppercase text-slate-500">State Budget</span>
              <div className="text-sm font-bold text-slate-900 dark:text-white mt-1">
                {formatMYR(program.budgetSpentMYR)}
              </div>
              <span className="text-[10px] text-slate-400">of {formatMYR(program.budgetMYR)}</span>
            </div>
          </div>

          {/* Statutory & Strategic Mandate */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 space-y-2">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
              <Scale className="w-4 h-4 text-emerald-600" />
              Statutory Enactment &amp; Governance Mandate
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Enactment 1988 Clause:</span>
                <p className="text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                  {program.statutoryReference}
                </p>
              </div>
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Lead Officer &amp; Division:</span>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">
                  {program.leadOfficer} • {program.branch}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Strategic Objective:</span>
              <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                {program.strategicObjective}
              </p>
            </div>
          </div>

          {/* Audit History */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              Statutory Audit Evaluations ({programEvaluations.length})
            </h3>
            {programEvaluations.length === 0 ? (
              <p className="text-slate-400">No evaluation records logged yet.</p>
            ) : (
              <div className="space-y-2">
                {programEvaluations.map((ev) => (
                  <div key={ev.id} className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">
                        Score: {ev.totalScore}/100 • {ev.alignmentLevel}
                      </span>
                      <span className="text-slate-400 text-[11px]">{ev.evaluationDate} by {ev.evaluatorName}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {ev.auditorNotes}
                    </p>
                    {ev.correctiveAction && (
                      <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-[11px]">
                        <strong>Mandated CAP:</strong> {ev.correctiveAction.actionRequired} (Due: {ev.correctiveAction.dueDate})
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Docs */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 text-sm">
              <FileText className="w-4 h-4 text-emerald-600" />
              Attached Evidence Documents ({programEvidence.length})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {programEvidence.map((doc) => (
                <div key={doc.id} className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="font-bold text-slate-900 dark:text-white truncate">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>{doc.fileName}</span>
                    <span className="text-emerald-600 font-bold">{doc.verifiedStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
