import React, { useState } from 'react';
import {
  X,
  Building,
  Plus,
  Scale,
  DollarSign
} from 'lucide-react';
import {
  LibraryProgram,
  StrategicPillar
} from '../types';

interface NewProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  pillars: StrategicPillar[];
  onCreateProgram: (programData: Partial<LibraryProgram>) => Promise<void>;
}

export const NewProgramModal: React.FC<NewProgramModalProps> = ({
  isOpen,
  onClose,
  pillars,
  onCreateProgram
}) => {
  const [pillarId, setPillarId] = useState(pillars[0]?.id || '');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('Headquarters Tanjung Aru');
  const [leadOfficer, setLeadOfficer] = useState('');
  const [statutoryReference, setStatutoryReference] = useState('');
  const [strategicObjective, setStrategicObjective] = useState('');
  const [budgetMYR, setBudgetMYR] = useState(300000);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !pillarId) return;

    setIsSubmitting(true);
    try {
      await onCreateProgram({
        pillarId,
        code: code || `SSL-NEW-${Date.now().toString().slice(-4)}`,
        name,
        branch,
        leadOfficer: leadOfficer || 'Assigned Officer',
        statutoryReference: statutoryReference || 'Sabah State Library Enactment 1988, Section 6',
        strategicObjective,
        budgetMYR,
        complianceScore: 75,
        alignmentLevel: 'PARTIAL',
        riskSeverity: 'LOW'
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs animate-in fade-in my-8">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Register Library Strategic Initiative
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Strategic Pillar Alignment *
            </label>
            <select
              value={pillarId}
              onChange={(e) => setPillarId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {pillars.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code}: {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Program Code
              </label>
              <input
                type="text"
                placeholder="e.g. SSL-EXT-10"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Allocated Budget (MYR)
              </label>
              <input
                type="number"
                value={budgetMYR}
                onChange={(e) => setBudgetMYR(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Initiative Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Borneo Biodiversity & Rainforest Botanical Manuscript Index"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch / Regional Division
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Lead Project Officer
              </label>
              <input
                type="text"
                placeholder="e.g. Antonia Peter Sani"
                value={leadOfficer}
                onChange={(e) => setLeadOfficer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Statutory Basis (Enactment Clause)
            </label>
            <input
              type="text"
              placeholder="e.g. Sabah State Library Enactment 1988, Section 8(1)"
              value={statutoryReference}
              onChange={(e) => setStatutoryReference(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Strategic Objective &amp; Scope
            </label>
            <textarea
              rows={2}
              placeholder="Describe deliverables and alignment to 2026-2028 targets..."
              value={strategicObjective}
              onChange={(e) => setStrategicObjective(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
            >
              {isSubmitting ? 'Registering...' : 'Register Initiative'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
