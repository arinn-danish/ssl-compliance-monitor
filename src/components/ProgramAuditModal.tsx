import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  FileCheck2,
  CheckCircle2,
  Plus,
  Trash2,
  HelpCircle,
  Clock,
  UserCheck
} from 'lucide-react';
import {
  LibraryProgram,
  UserPersona,
  ProgramEvaluation,
  EvaluationScoreCriteria
} from '../types';

interface ProgramAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: LibraryProgram | null;
  allPrograms: LibraryProgram[];
  currentPersona: UserPersona;
  onSubmitAudit: (evaluationData: {
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
}

export const ProgramAuditModal: React.FC<ProgramAuditModalProps> = ({
  isOpen,
  onClose,
  program,
  allPrograms,
  currentPersona,
  onSubmitAudit
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(program?.id || '');
  const [statutoryClause, setStatutoryClause] = useState<string>('');
  
  // 4 Core evaluation criteria (0-25 each, sum = 100)
  const [scores, setScores] = useState<EvaluationScoreCriteria>({
    statutoryEnactment: 20,
    strategicRelevance: 20,
    executionIntegrity: 20,
    communityImpact: 20
  });

  const [gaps, setGaps] = useState<string[]>(['']);
  const [auditorNotes, setAuditorNotes] = useState<string>('');
  const [includeCAP, setIncludeCAP] = useState<boolean>(false);
  const [capAction, setCapAction] = useState<string>('');
  const [capOfficer, setCapOfficer] = useState<string>('');
  const [capDueDate, setCapDueDate] = useState<string>('');
  const [capEscalation, setCapEscalation] = useState<'INTERNAL' | 'DIRECTOR_ESCALATION' | 'MINISTRY_NOTICE'>('INTERNAL');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (program) {
      setSelectedProgramId(program.id);
      setStatutoryClause(program.statutoryReference || '');
      setCapOfficer(program.leadOfficer || currentPersona.name);
    } else if (allPrograms.length > 0 && !selectedProgramId) {
      setSelectedProgramId(allPrograms[0].id);
      setStatutoryClause(allPrograms[0].statutoryReference || '');
      setCapOfficer(allPrograms[0].leadOfficer || currentPersona.name);
    }
  }, [program, allPrograms, currentPersona]);

  if (!isOpen) return null;

  const currentProgram = allPrograms.find(p => p.id === selectedProgramId) || program;

  const totalScore = Math.min(
    100,
    (scores.statutoryEnactment || 0) +
    (scores.strategicRelevance || 0) +
    (scores.executionIntegrity || 0) +
    (scores.communityImpact || 0)
  );

  const calculatedAlignment = totalScore >= 80 ? 'FULL' : totalScore >= 50 ? 'PARTIAL' : 'NON_COMPLIANT';

  const handleScoreChange = (field: keyof EvaluationScoreCriteria, value: number) => {
    const clamped = Math.max(0, Math.min(25, Number(value) || 0));
    setScores(prev => ({ ...prev, [field]: clamped }));
  };

  const handleAddGap = () => {
    setGaps([...gaps, '']);
  };

  const handleUpdateGap = (index: number, val: string) => {
    const updated = [...gaps];
    updated[index] = val;
    setGaps(updated);
  };

  const handleRemoveGap = (index: number) => {
    setGaps(gaps.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProgramId) {
      setErrorMessage('Please choose a library initiative to audit.');
      return;
    }

    if (!statutoryClause.trim()) {
      setErrorMessage('Statutory enactment clause reference is required.');
      return;
    }

    if (!auditorNotes.trim()) {
      setErrorMessage('Please include auditor notes / executive summary of findings.');
      return;
    }

    // If score < 80 and no CAP is selected, suggest CAP
    if (totalScore < 80 && !includeCAP && gaps.filter(g => g.trim()).length === 0) {
      setErrorMessage('Programs with partial or non-compliant scores (<80) require identified gaps and a corrective action plan.');
      setIncludeCAP(true);
      return;
    }

    if (includeCAP && !capAction.trim()) {
      setErrorMessage('Corrective Action Plan requires an explicit action description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const validGaps = gaps.filter(g => g.trim().length > 0);
      
      await onSubmitAudit({
        programId: selectedProgramId,
        evaluatorId: currentPersona.id,
        evaluatorName: currentPersona.name,
        evaluatorRole: currentPersona.designation,
        scores,
        statutoryEnactmentClause: statutoryClause,
        gapsIdentified: validGaps,
        auditorNotes,
        correctiveAction: includeCAP ? {
          actionRequired: capAction,
          assignedOfficer: capOfficer || currentProgram?.leadOfficer || 'Lead Officer',
          dueDate: capDueDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0],
          escalationLevel: capEscalation
        } : undefined
      });

      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit evaluation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">
                Sabah State Library Program Audit &amp; Evaluation Engine
              </h2>
              <p className="text-xs text-emerald-200">
                Statutory Assessment against Enactment 1988 &amp; Strategic Plan 2026–2028
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Program Selector & Statutory Clause */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Select Initiative / Program *
              </label>
              <select
                id="audit-select-program"
                value={selectedProgramId}
                onChange={(e) => {
                  const pId = e.target.value;
                  setSelectedProgramId(pId);
                  const selected = allPrograms.find(p => p.id === pId);
                  if (selected) {
                    setStatutoryClause(selected.statutoryReference);
                    setCapOfficer(selected.leadOfficer);
                  }
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              >
                {allPrograms.map(p => (
                  <option key={p.id} value={p.id}>
                    [{p.code}] {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Auditor In-Charge (Logged-in Persona)
              </label>
              <div className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span className="font-semibold">{currentPersona.name}</span>
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400">
                  {currentPersona.role}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Statutory Basis / Enactment 1988 Clause Reference *
            </label>
            <input
              id="audit-statutory-clause"
              type="text"
              value={statutoryClause}
              onChange={(e) => setStatutoryClause(e.target.value)}
              placeholder="e.g. Sabah State Library Enactment 1988, Section 7(2) & Section 12"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
            />
          </div>

          {/* 4 Scoring Dimensions */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                  Statutory Evaluation Criteria (0–100 Scale)
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Score each dimension between 0 and 25 marks according to public sector audit standards.
                </p>
              </div>

              {/* Dynamic Live Score Badge */}
              <div className="text-right">
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {totalScore} <span className="text-xs font-normal text-slate-400">/100</span>
                </div>
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                  calculatedAlignment === 'FULL' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                  calculatedAlignment === 'PARTIAL' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                  'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}>
                  {calculatedAlignment === 'FULL' ? 'Full Compliance (>=80)' :
                   calculatedAlignment === 'PARTIAL' ? 'Partial Alignment (50-79)' : 'Non-Compliant Gap (<50)'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* Criterion 1 */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    1. Statutory Enactment Adherence
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {scores.statutoryEnactment} / 25
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Alignment with Enactment 1988 sections, custody, legal deposit, or mobile powers.
                </p>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scores.statutoryEnactment}
                  onChange={(e) => handleScoreChange('statutoryEnactment', Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Criterion 2 */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    2. Strategic Plan 2026–2028 Relevance
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {scores.strategicRelevance} / 25
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Direct contribution to the targeted milestones of the 5 strategic pillars.
                </p>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scores.strategicRelevance}
                  onChange={(e) => handleScoreChange('strategicRelevance', Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Criterion 3 */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    3. Operational &amp; Financial Integrity
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {scores.executionIntegrity} / 25
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Proper budget absorption, procedural compliance, and risk controls.
                </p>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scores.executionIntegrity}
                  onChange={(e) => handleScoreChange('executionIntegrity', Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>

              {/* Criterion 4 */}
              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    4. Community &amp; Heritage Impact
                  </span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {scores.communityImpact} / 25
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Civic reach, indigenous representation, literacy improvement, and patron satisfaction.
                </p>
                <input
                  type="range"
                  min="0"
                  max="25"
                  value={scores.communityImpact}
                  onChange={(e) => handleScoreChange('communityImpact', Number(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Gaps Identified Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Gaps Identified &amp; Statutory Deficiencies
              </label>
              <button
                type="button"
                onClick={handleAddGap}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Gap Entry
              </button>
            </div>

            {gaps.map((gap, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Describe statutory gap or operational finding #${idx + 1}...`}
                  value={gap}
                  onChange={(e) => handleUpdateGap(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 text-xs"
                />
                {gaps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGap(idx)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Auditor Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Auditor Executive Findings &amp; Formal Recommendation *
            </label>
            <textarea
              id="audit-notes"
              rows={3}
              value={auditorNotes}
              onChange={(e) => setAuditorNotes(e.target.value)}
              placeholder="State formal findings, root cause analysis, legal risk level, and required remedial actions..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Corrective Action Plan (CAP) Builder */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50 dark:bg-slate-850">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={includeCAP}
                  onChange={(e) => setIncludeCAP(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                Assign Corrective Action Plan (CAP)
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Enforces remediation deadline &amp; accountable officer
              </span>
            </div>

            {includeCAP && (
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/60 space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Remedial Action Mandated *
                  </label>
                  <input
                    type="text"
                    value={capAction}
                    onChange={(e) => setCapAction(e.target.value)}
                    placeholder="e.g. Serve statutory Form SSL-ENACT-12 notice within 21 days; replace failing HVAC sensor."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Responsible Officer
                    </label>
                    <input
                      type="text"
                      value={capOfficer}
                      onChange={(e) => setCapOfficer(e.target.value)}
                      placeholder="Assignee name"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Target Completion Date
                    </label>
                    <input
                      type="date"
                      value={capDueDate}
                      onChange={(e) => setCapDueDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Escalation Tier
                    </label>
                    <select
                      value={capEscalation}
                      onChange={(e: any) => setCapEscalation(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                    >
                      <option value="INTERNAL">Internal Branch Notice</option>
                      <option value="DIRECTOR_ESCALATION">Director Executive Escalation</option>
                      <option value="MINISTRY_NOTICE">State Ministry Notification</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              id="submit-audit-btn"
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? 'Recording Audit...' : 'Authorize & Sign-off Evaluation'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
