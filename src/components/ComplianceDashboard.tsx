import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  Landmark,
  Scale
} from 'lucide-react';
import {
  DashboardMetrics,
  StrategicPillar,
  ComplianceRisk,
  LibraryProgram
} from '../types';

interface ComplianceDashboardProps {
  metrics: DashboardMetrics;
  pillars: StrategicPillar[];
  programs: LibraryProgram[];
  risks: ComplianceRisk[];
  onSelectPillarFilter: (pillarId: string) => void;
  onNavigateToMatrix: () => void;
  onNavigateToAudit: (programId?: string) => void;
}

export const ComplianceDashboard: React.FC<ComplianceDashboardProps> = ({
  metrics,
  pillars,
  programs,
  risks,
  onSelectPillarFilter,
  onNavigateToMatrix,
  onNavigateToAudit
}) => {
  const [selectedRiskCell, setSelectedRiskCell] = React.useState<{ likelihood: number; impact: number } | null>(null);

  // Filter risks matching selected likelihood/impact cell
  const cellRisks = selectedRiskCell
    ? risks.filter(r => r.likelihood === selectedRiskCell.likelihood && r.impact === selectedRiskCell.impact)
    : [];

  const getHeatmapColor = (likelihood: number, impact: number) => {
    const score = likelihood * impact;
    if (score >= 16) return 'bg-rose-500 text-white hover:bg-rose-600';
    if (score >= 10) return 'bg-amber-500 text-white hover:bg-amber-600';
    if (score >= 5) return 'bg-yellow-400 text-slate-900 hover:bg-yellow-500';
    return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200';
  };

  const formatMYR = (val: number) => {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-md border border-emerald-800/40 relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/60 border border-emerald-600/40 text-xs font-semibold text-emerald-200 mb-4">
            <Scale className="w-3.5 h-3.5" />
            Sabah State Library Enactment 1988 Statutory Audit Cycle
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Strategic Plan (2026–2028) Compliance &amp; Governance Overview
          </h1>
          <p className="text-sm sm:text-base text-emerald-100/90 leading-relaxed">
            Real-time compliance monitoring, internal audit scoring, and risk oversight evaluating state library initiatives against statutory mandates and the 5 core strategic pillars.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              id="dashboard-audit-quick-btn"
              onClick={() => onNavigateToAudit()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              Conduct Program Audit
            </button>
            <button
              id="dashboard-matrix-quick-btn"
              onClick={onNavigateToMatrix}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium backdrop-blur-xs transition border border-white/20"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Open Compliance Matrix
            </button>
          </div>
        </div>

        {/* Subtle Decorative Badge */}
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none hidden lg:block">
          <Landmark className="w-80 h-80 text-white" />
        </div>
      </div>

      {/* Top Level Metric KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Compliance Index */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Governance Index
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.overallComplianceScore}%
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Target: 85%
            </span>
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, metrics.overallComplianceScore)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Aggregate statutory alignment rating across all 9 audited divisions.
          </p>
        </div>

        {/* Monitored Initiatives */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Programs
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 dark:text-white">
              {metrics.totalPrograms}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              across 5 pillars
            </span>
          </div>
          <div className="flex items-center gap-1.5 mt-3 text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {metrics.alignmentCounts.full} Full
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> {metrics.alignmentCounts.partial} Partial
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> {metrics.alignmentCounts.nonCompliant} Gaps
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            100% cataloged under the 2026–2028 State Strategic Plan.
          </p>
        </div>

        {/* Risk Register Metric */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Governance Risks
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 dark:text-rose-400">
              {metrics.riskSeverityCounts.critical + metrics.riskSeverityCounts.high}
            </span>
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Critical &amp; High
            </span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
              {metrics.riskSeverityCounts.critical} Critical
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {metrics.riskSeverityCounts.high} High
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
              {metrics.riskSeverityCounts.medium} Med
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            Including statutory legal deposit and archival HVAC excursions.
          </p>
        </div>

        {/* Budget & Resource Allocation */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Budget Utilization
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatMYR(metrics.budgetUtilizationMYR.spent)}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            of {formatMYR(metrics.budgetUtilizationMYR.allocated)} allocated
          </div>
          <div className="mt-3 w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-600 h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((metrics.budgetUtilizationMYR.spent / (metrics.budgetUtilizationMYR.allocated || 1)) * 100)}%`
              }}
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
            {Math.round((metrics.budgetUtilizationMYR.spent / (metrics.budgetUtilizationMYR.allocated || 1)) * 100)}% state fund absorption to date.
          </p>
        </div>
      </div>

      {/* Strategic Pillars Overview */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Landmark className="w-4 h-4 text-emerald-600" />
              Strategic Plan (2026–2028) Pillar Performance &amp; Enactment Mandates
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit score and KPI delivery across the 5 statutory pillars defined under the Sabah State Library Enactment 1988.
            </p>
          </div>
          <button
            id="view-all-matrix-btn"
            onClick={onNavigateToMatrix}
            className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 self-start sm:self-auto"
          >
            View detailed matrix <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {pillars.map((pillar) => {
            const pillarProg = metrics.pillarProgress.find(p => p.pillarId === pillar.id);
            const score = pillarProg?.averageScore || 0;
            const kpiProgress = pillarProg?.targetKPIProgress || 0;
            const programCount = pillarProg?.programCount || 0;

            return (
              <div
                key={pillar.id}
                id={`pillar-card-${pillar.id}`}
                onClick={() => onSelectPillarFilter(pillar.id)}
                className="rounded-xl p-4 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      {pillar.code}
                    </span>
                    <span className={`text-xs font-bold ${
                      score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {score}% Score
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 line-clamp-2">
                    {pillar.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {pillar.enactmentSection}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="text-slate-500 dark:text-slate-400">KPI Delivery</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{kpiProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full"
                      style={{ width: `${kpiProgress}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-3">
                    <span>{programCount} Initiatives</span>
                    <span className="text-emerald-600 font-medium">Filter &rarr;</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: 5x5 Risk Severity Heatmap + Statutory Enactment Reference */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Risk Severity Heatmap (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Risk Severity Heatmap (5x5 Matrix)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Likelihood (1–5) vs. Statutory &amp; Operational Impact (1–5). Click any cell to inspect logged risks.
              </p>
            </div>
            {selectedRiskCell && (
              <button
                onClick={() => setSelectedRiskCell(null)}
                className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 underline"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="flex gap-4">
            {/* Y-axis label */}
            <div className="flex flex-col justify-between py-6 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right w-16 shrink-0">
              <span>5 Catastrophic</span>
              <span>4 Major</span>
              <span>3 Moderate</span>
              <span>2 Minor</span>
              <span>1 Negligible</span>
            </div>

            {/* Matrix Grid (5 rows of 5 cells) */}
            <div className="flex-1 space-y-1.5">
              {[5, 4, 3, 2, 1].map((impact) => (
                <div key={impact} className="grid grid-cols-5 gap-1.5 h-10">
                  {[1, 2, 3, 4, 5].map((likelihood) => {
                    const count = risks.filter(
                      r => r.likelihood === likelihood && r.impact === impact && r.status !== 'MITIGATED'
                    ).length;
                    const isSelected = selectedRiskCell?.likelihood === likelihood && selectedRiskCell?.impact === impact;

                    return (
                      <button
                        key={`${impact}-${likelihood}`}
                        id={`heatmap-cell-${impact}-${likelihood}`}
                        onClick={() => setSelectedRiskCell({ likelihood, impact })}
                        className={`rounded-md flex items-center justify-center font-bold text-xs transition border ${
                          isSelected ? 'ring-2 ring-emerald-600 border-white' : 'border-transparent'
                        } ${getHeatmapColor(likelihood, impact)}`}
                        title={`Impact ${impact}, Likelihood ${likelihood}: ${count} risks`}
                      >
                        {count > 0 ? (
                          <span className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center text-[11px]">
                            {count}
                          </span>
                        ) : (
                          <span className="opacity-20 text-[10px]">-</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* X-axis labels */}
              <div className="grid grid-cols-5 gap-1.5 pt-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">
                <span>1 Rare</span>
                <span>2 Unlikely</span>
                <span>3 Possible</span>
                <span>4 Likely</span>
                <span>5 Frequent</span>
              </div>
              <p className="text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">
                Likelihood &rarr;
              </p>
            </div>
          </div>

          {/* Selected Cell Risk Drawer / Display */}
          {selectedRiskCell && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 animate-in fade-in">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Risks at Impact {selectedRiskCell.impact}, Likelihood {selectedRiskCell.likelihood} ({cellRisks.length} logged)
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                  Severity Score: {selectedRiskCell.impact * selectedRiskCell.likelihood}
                </span>
              </div>

              {cellRisks.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No active risks mapped to this intersection.
                </p>
              ) : (
                <div className="space-y-2">
                  {cellRisks.map((r) => (
                    <div key={r.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900 dark:text-white">{r.title}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          r.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                          r.severity === 'HIGH' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {r.severity}
                        </span>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 mt-1">
                        <strong>Mitigation:</strong> {r.mitigationStrategy}
                      </p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <span>Program: {r.programName}</span>
                        <span>Owner: {r.owner}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sabah State Library Statutory Clauses Reference (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-600" />
                Statutory Enactment Clauses
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                No. 4 of 1988
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Audit baseline clauses from Sabah State Library Enactment 1988 (Rev. 2022) monitored by compliance officers:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Section 6(1)(a) – Civic Reading &amp; Outreach</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Pillar 1</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Duty to establish, equip, and maintain public library services; foster reading clubs across district branches.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Section 6(1)(e) – Digital Public Access</span>
                  <span className="text-[10px] text-blue-600 font-bold">Pillar 2</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Mandate to provide computing infrastructure, e-resources, and assist digital literacy development.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Section 7(2) &amp; Section 12 – Legal Deposit</span>
                  <span className="text-[10px] text-amber-600 font-bold">Pillars 3 &amp; 4</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Mandatory statutory delivery of two copies of all books published in Sabah within 1 month. Crucial preservation duty.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/70">
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                  <span>Section 6(2) – Rural Mobile Facilities</span>
                  <span className="text-[10px] text-teal-600 font-bold">Pillar 5</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Direct authority to deploy traveling libraries, riverine boats, and village outposts to outlying areas.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Governance Framework</span>
            <button
              onClick={() => onNavigateToMatrix()}
              className="text-emerald-700 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              Examine Program Alignments &rarr;
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
