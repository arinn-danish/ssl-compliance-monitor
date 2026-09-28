import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Printer,
  ShieldAlert,
  ShieldCheck,
  AlertCircle,
  FileCheck2,
  FileText,
  Building,
  ArrowUpDown,
  Layers,
  Plus
} from 'lucide-react';
import {
  LibraryProgram,
  StrategicPillar,
  AlignmentLevel,
  RiskSeverity,
  UserRole
} from '../types';

interface StrategicAlignmentMatrixProps {
  programs: LibraryProgram[];
  pillars: StrategicPillar[];
  selectedPillarId: string;
  onSelectPillar: (pillarId: string) => void;
  onOpenAuditModal: (program: LibraryProgram) => void;
  onOpenProgramDetail: (program: LibraryProgram) => void;
  onOpenEvidence: (programId: string) => void;
  onOpenNewProgramModal: () => void;
  userRole: UserRole;
}

export const StrategicAlignmentMatrix: React.FC<StrategicAlignmentMatrixProps> = ({
  programs,
  pillars,
  selectedPillarId,
  onSelectPillar,
  onOpenAuditModal,
  onOpenProgramDetail,
  onOpenEvidence,
  onOpenNewProgramModal,
  userRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlignment, setSelectedAlignment] = useState<string>('ALL');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [sortField, setSortField] = useState<keyof LibraryProgram>('complianceScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Extract unique branches for filter dropdown
  const uniqueBranches = useMemo(() => {
    const branches = new Set(programs.map(p => p.branch));
    return Array.from(branches);
  }, [programs]);

  // Filter and sort programs
  const filteredPrograms = useMemo(() => {
    return programs
      .filter((p) => {
        // Pillar filter
        if (selectedPillarId !== 'ALL' && p.pillarId !== selectedPillarId) {
          return false;
        }
        // Alignment filter
        if (selectedAlignment !== 'ALL' && p.alignmentLevel !== selectedAlignment) {
          return false;
        }
        // Risk filter
        if (selectedRisk !== 'ALL' && p.riskSeverity !== selectedRisk) {
          return false;
        }
        // Branch filter
        if (selectedBranch !== 'ALL' && p.branch !== selectedBranch) {
          return false;
        }
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            p.name.toLowerCase().includes(q) ||
            p.code.toLowerCase().includes(q) ||
            p.leadOfficer.toLowerCase().includes(q) ||
            p.statutoryReference.toLowerCase().includes(q) ||
            p.branch.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        const strA = String(valA || '').toLowerCase();
        const strB = String(valB || '').toLowerCase();
        return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
  }, [programs, selectedPillarId, selectedAlignment, selectedRisk, selectedBranch, searchQuery, sortField, sortDirection]);

  const handleSort = (field: keyof LibraryProgram) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = [
      'Program Code',
      'Program Name',
      'Strategic Pillar',
      'Enactment Statutory Reference',
      'Branch / Division',
      'Lead Officer',
      'Compliance Score (%)',
      'Alignment Level',
      'Risk Severity',
      'KPI Progress (%)',
      'Allocated Budget (MYR)',
      'Budget Spent (MYR)',
      'Last Audited Date',
      'Next Audit Due'
    ];

    const rows = filteredPrograms.map(p => [
      `"${p.code}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.pillarName}"`,
      `"${p.statutoryReference.replace(/"/g, '""')}"`,
      `"${p.branch}"`,
      `"${p.leadOfficer}"`,
      p.complianceScore,
      p.alignmentLevel,
      p.riskSeverity,
      p.kpiProgress,
      p.budgetMYR,
      p.budgetSpentMYR,
      p.lastAuditedAt,
      p.nextAuditDue
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sabah_State_Library_Strategic_Compliance_Matrix_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Printable Executive PDF Report
  const handlePrintReport = () => {
    window.print();
  };

  const getAlignmentBadge = (level: AlignmentLevel) => {
    switch (level) {
      case 'FULL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" /> Full Compliance
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-3.5 h-3.5" /> Partial Alignment
          </span>
        );
      case 'NON_COMPLIANT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="w-3.5 h-3.5" /> Non-Compliant Gap
          </span>
        );
    }
  };

  const getRiskBadge = (risk: RiskSeverity) => {
    switch (risk) {
      case 'CRITICAL':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">CRITICAL</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 border border-yellow-200">MEDIUM</span>;
      case 'LOW':
        return <span className="px-2 py-0.5 text-[11px] font-medium rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200">LOW</span>;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Matrix Header & Actions */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Strategic Alignment Matrix (2026–2028)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit evaluation records mapped against the Sabah State Library Enactment 1988 statutory requirements.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Initiative (Admin/Officer only) */}
          {(userRole === 'ADMIN' || userRole === 'COMPLIANCE_OFFICER') && (
            <button
              id="matrix-add-program-btn"
              onClick={onOpenNewProgramModal}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              Register Initiative
            </button>
          )}

          {/* Export CSV */}
          <button
            id="matrix-export-csv-btn"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition"
            title="Download complete matrix in CSV spreadsheet format"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>

          {/* Print / PDF Executive Report */}
          <button
            id="matrix-print-report-btn"
            onClick={handlePrintReport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold transition"
            title="Generate print/PDF statutory compliance summary report"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            Print / PDF Report
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="matrix-search-input"
              type="text"
              placeholder="Search code, initiative name, officer, statutory clause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            )}
          </div>

          {/* Pillar selector */}
          <div>
            <select
              id="matrix-pillar-filter"
              value={selectedPillarId}
              onChange={(e) => onSelectPillar(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Strategic Pillars (5)</option>
              {pillars.map(p => (
                <option key={p.id} value={p.id}>
                  {p.code}: {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Alignment Level selector */}
          <div>
            <select
              id="matrix-alignment-filter"
              value={selectedAlignment}
              onChange={(e) => setSelectedAlignment(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Alignment Levels</option>
              <option value="FULL">Full Compliance (80-100%)</option>
              <option value="PARTIAL">Partial Alignment (50-79%)</option>
              <option value="NON_COMPLIANT">Non-Compliant Gaps (&lt;50%)</option>
            </select>
          </div>

          {/* Risk Level selector */}
          <div>
            <select
              id="matrix-risk-filter"
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Risk Severities</option>
              <option value="CRITICAL">Critical Severity</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>
        </div>

        {/* Second row: quick branch filters & counter */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-slate-500 dark:text-slate-400 font-medium shrink-0">Branch Focus:</span>
            <button
              onClick={() => setSelectedBranch('ALL')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                selectedBranch === 'ALL'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              All Regions
            </button>
            {uniqueBranches.map(b => (
              <button
                key={b}
                onClick={() => setSelectedBranch(b)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition ${
                  selectedBranch === b
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          <div className="text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white">{filteredPrograms.length}</strong> of {programs.length} initiatives
          </div>
        </div>
      </div>

      {/* Main Interactive Matrix Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('code')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                    Code &amp; Initiative <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Strategic Pillar</th>
                <th className="py-3 px-4">Enactment Basis</th>
                <th className="py-3 px-4">Branch &amp; Officer</th>
                <th className="py-3 px-4">
                  <button onClick={() => handleSort('complianceScore')} className="flex items-center gap-1 hover:text-slate-900 dark:hover:text-white">
                    Audit Score <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-3 px-4">Alignment Status</th>
                <th className="py-3 px-4">Risk</th>
                <th className="py-3 px-4">KPI Progress</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {filteredPrograms.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 dark:text-slate-400">
                    No library initiatives match the specified criteria.
                  </td>
                </tr>
              ) : (
                filteredPrograms.map((program) => (
                  <tr
                    key={program.id}
                    id={`program-row-${program.id}`}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-750 transition"
                  >
                    {/* Code & Title */}
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          {program.code}
                        </span>
                      </div>
                      <button
                        onClick={() => onOpenProgramDetail(program)}
                        className="text-left font-semibold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition mt-0.5 line-clamp-2"
                      >
                        {program.name}
                      </button>
                    </td>

                    {/* Pillar */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                        {program.pillarName}
                      </span>
                    </td>

                    {/* Enactment Statutory Clause */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <span className="line-clamp-2 text-[11px] font-mono">
                        {program.statutoryReference}
                      </span>
                    </td>

                    {/* Branch & Lead Officer */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                      <div className="font-medium text-[11px]">{program.branch}</div>
                      <div className="text-[10px] text-slate-400">{program.leadOfficer}</div>
                    </td>

                    {/* Compliance Score Gauge */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          program.complianceScore >= 80 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                          program.complianceScore >= 50 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        }`}>
                          {program.complianceScore}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">/100</span>
                      </div>
                    </td>

                    {/* Alignment Level */}
                    <td className="py-3.5 px-4">
                      {getAlignmentBadge(program.alignmentLevel)}
                    </td>

                    {/* Risk Level */}
                    <td className="py-3.5 px-4">
                      {getRiskBadge(program.riskSeverity)}
                    </td>

                    {/* KPI Progress Bar */}
                    <td className="py-3.5 px-4">
                      <div className="w-24">
                        <div className="flex justify-between text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                          <span>{program.kpiProgress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              program.kpiProgress >= 80 ? 'bg-emerald-600' :
                              program.kpiProgress >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${program.kpiProgress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        
                        {/* Audit Program Button (Officer/Admin only) */}
                        {(userRole === 'ADMIN' || userRole === 'COMPLIANCE_OFFICER') ? (
                          <button
                            id={`audit-btn-${program.id}`}
                            onClick={() => onOpenAuditModal(program)}
                            className="px-2.5 py-1.5 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px] flex items-center gap-1 transition"
                            title="Perform statutory audit & scoring"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                            Audit
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenProgramDetail(program)}
                            className="px-2.5 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium"
                          >
                            Dossier
                          </button>
                        )}

                        {/* Evidence docs button */}
                        <button
                          id={`evidence-btn-${program.id}`}
                          onClick={() => onOpenEvidence(program.id)}
                          className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                          title="View & attach evidence documents"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Stylesheet for clean PDF output */}
      <div className="hidden print:block text-slate-900 bg-white p-8 space-y-6">
        <div className="border-b-2 border-emerald-800 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-emerald-900">PERPUSTAKAAN NEGERI SABAH</h1>
              <h2 className="text-base font-semibold text-slate-700">Bahagian Pematuhan Governan &amp; Audit Statutori</h2>
              <p className="text-xs text-slate-500 mt-1">
                Laporan Pematuhan Pelan Strategik (2026–2028) &amp; Enakmen Perpustakaan Negeri Sabah 1988
              </p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Tarikh Laporan: {new Date().toLocaleDateString('en-MY')}</p>
              <p>Status Klasifikasi: RASMI (KERAJAAN NEGERI SABAH)</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 text-xs">
          <div className="p-3 border border-slate-300 rounded">
            <strong>Jumlah Inisiatif:</strong> {filteredPrograms.length}
          </div>
          <div className="p-3 border border-slate-300 rounded">
            <strong>Pematuhan Penuh:</strong> {filteredPrograms.filter(p => p.alignmentLevel === 'FULL').length}
          </div>
          <div className="p-3 border border-slate-300 rounded">
            <strong>Pematuhan Separa:</strong> {filteredPrograms.filter(p => p.alignmentLevel === 'PARTIAL').length}
          </div>
          <div className="p-3 border border-slate-300 rounded">
            <strong>Ketidakpatuhan (Jurang):</strong> {filteredPrograms.filter(p => p.alignmentLevel === 'NON_COMPLIANT').length}
          </div>
        </div>

        <table className="w-full text-xs border border-slate-300 divide-y divide-slate-300">
          <thead>
            <tr className="bg-slate-100 font-bold">
              <th className="p-2 text-left">Kod</th>
              <th className="p-2 text-left">Program</th>
              <th className="p-2 text-left">Teras</th>
              <th className="p-2 text-left">Skor</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Risiko</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {filteredPrograms.map(p => (
              <tr key={p.id}>
                <td className="p-2 font-mono">{p.code}</td>
                <td className="p-2 font-semibold">{p.name}</td>
                <td className="p-2">{p.pillarName}</td>
                <td className="p-2">{p.complianceScore}%</td>
                <td className="p-2">{p.alignmentLevel}</td>
                <td className="p-2">{p.riskSeverity}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-8 grid grid-cols-2 gap-12 text-xs">
          <div>
            <p className="mb-12">Disediakan Oleh:</p>
            <p className="font-bold border-t border-slate-400 pt-1">Pegawai Pematuhan Governan</p>
            <p className="text-slate-500">Perpustakaan Negeri Sabah</p>
          </div>
          <div>
            <p className="mb-12">Disahkan &amp; Diluluskan Oleh:</p>
            <p className="font-bold border-t border-slate-400 pt-1">Pengarah Perpustakaan Negeri Sabah</p>
            <p className="text-slate-500">Kementerian Sains, Teknologi dan Inovasi Sabah</p>
          </div>
        </div>
      </div>

    </div>
  );
};
