import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Clock,
  X,
  Building
} from 'lucide-react';
import {
  ComplianceRisk,
  LibraryProgram,
  StrategicPillar,
  RiskSeverity,
  UserPersona
} from '../types';

interface RiskRegisterViewProps {
  risks: ComplianceRisk[];
  programs: LibraryProgram[];
  pillars: StrategicPillar[];
  currentPersona: UserPersona;
  onCreateRisk: (riskData: Partial<ComplianceRisk>) => Promise<void>;
  onUpdateRiskStatus: (id: string, status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED') => Promise<void>;
}

export const RiskRegisterView: React.FC<RiskRegisterViewProps> = ({
  risks,
  programs,
  pillars,
  currentPersona,
  onCreateRisk,
  onUpdateRiskStatus
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form state
  const [programId, setProgramId] = useState(programs[0]?.id || '');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplianceRisk['category']>('STATUTORY_NON_COMPLIANCE');
  const [likelihood, setLikelihood] = useState<number>(3);
  const [impact, setImpact] = useState<number>(3);
  const [mitigationStrategy, setMitigationStrategy] = useState('');
  const [owner, setOwner] = useState(currentPersona.name);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredRisks = risks.filter((r) => {
    if (selectedSeverity !== 'ALL' && r.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'ALL' && r.category !== selectedCategory) return false;
    return true;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !programId) return;

    setIsSubmitting(true);
    try {
      await onCreateRisk({
        programId,
        title,
        category,
        likelihood,
        impact,
        mitigationStrategy,
        owner
      });
      setIsAddOpen(false);
      setTitle('');
      setMitigationStrategy('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSeverityBadge = (severity: RiskSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border border-yellow-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">LOW</span>;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Risk Register Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Compliance &amp; Operational Risk Register
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Systematic tracking of statutory non-compliance, archival degradation hazards, and logistics risks.
          </p>
        </div>

        {(currentPersona.role === 'ADMIN' || currentPersona.role === 'COMPLIANCE_OFFICER') && (
          <button
            id="register-risk-btn"
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            Register Governance Risk
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Risk Severities</option>
            <option value="CRITICAL">Critical Severity</option>
            <option value="HIGH">High Severity</option>
            <option value="MEDIUM">Medium Severity</option>
            <option value="LOW">Low Severity</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            <option value="ALL">All Categories</option>
            <option value="STATUTORY_NON_COMPLIANCE">Statutory Non-Compliance</option>
            <option value="PRESERVATION_LOSS">Preservation Loss Hazard</option>
            <option value="INFRASTRUCTURE">Infrastructure &amp; Tech</option>
            <option value="RESOURCE_DEFICIT">Resource &amp; Logistics Deficit</option>
          </select>
        </div>

        <div className="ml-auto text-slate-500 dark:text-slate-400">
          Showing <strong>{filteredRisks.length}</strong> recorded risks
        </div>
      </div>

      {/* Risks Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Risk Item &amp; Initiative</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Likelihood x Impact</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Mitigation Strategy</th>
                <th className="py-3 px-4">Owner</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredRisks.map((risk) => (
                <tr key={risk.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{risk.title}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{risk.programName}</div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    {risk.category.replace(/_/g, ' ')}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                      L: {risk.likelihood} × I: {risk.impact} = {risk.likelihood * risk.impact}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {getSeverityBadge(risk.severity)}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs">
                    <p className="line-clamp-2">{risk.mitigationStrategy}</p>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                    {risk.owner}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      risk.status === 'MITIGATED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                      risk.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                      'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {risk.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {(currentPersona.role === 'ADMIN' || currentPersona.role === 'COMPLIANCE_OFFICER') && (
                      <select
                        value={risk.status}
                        onChange={(e: any) => onUpdateRiskStatus(risk.id, e.target.value)}
                        className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium"
                      >
                        <option value="OPEN">Mark Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="MITIGATED">Mitigated</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Risk Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Register Compliance Risk
              </h2>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Program *
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>
                      [{p.code}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Risk Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Failure to enforce Section 12 Legal Deposit"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Likelihood (1–5)
                  </label>
                  <select
                    value={likelihood}
                    onChange={(e) => setLikelihood(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  >
                    <option value={1}>1 - Rare</option>
                    <option value={2}>2 - Unlikely</option>
                    <option value={3}>3 - Possible</option>
                    <option value={4}>4 - Likely</option>
                    <option value={5}>5 - Frequent / Certain</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Impact (1–5)
                  </label>
                  <select
                    value={impact}
                    onChange={(e) => setImpact(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  >
                    <option value={1}>1 - Negligible</option>
                    <option value={2}>2 - Minor</option>
                    <option value={3}>3 - Moderate</option>
                    <option value={4}>4 - Major</option>
                    <option value={5}>5 - Catastrophic (Enactment Breach)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="STATUTORY_NON_COMPLIANCE">Statutory Non-Compliance</option>
                  <option value="PRESERVATION_LOSS">Preservation Loss Hazard</option>
                  <option value="INFRASTRUCTURE">Infrastructure &amp; Tech Deficit</option>
                  <option value="RESOURCE_DEFICIT">Resource &amp; Logistics Deficit</option>
                  <option value="COMMUNITY_DISENGAGEMENT">Community Disengagement</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mitigation Strategy *
                </label>
                <textarea
                  rows={2}
                  required
                  value={mitigationStrategy}
                  onChange={(e) => setMitigationStrategy(e.target.value)}
                  placeholder="Outline preventive steps and statutory remedy..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {isSubmitting ? 'Registering...' : 'Register Risk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
