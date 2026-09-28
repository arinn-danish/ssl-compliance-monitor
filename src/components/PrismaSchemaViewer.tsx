import React, { useState } from 'react';
import {
  Database,
  Copy,
  Check,
  Server,
  Code2,
  Shield,
  Layers,
  FileCode,
  Lock,
  Workflow
} from 'lucide-react';
import { PRISMA_SCHEMA_CODE } from '../data/sabahLibraryData';

export const PrismaSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'prisma' | 'rbac' | 'api'>('architecture');

  const handleCopy = () => {
    navigator.clipboard.writeText(PRISMA_SCHEMA_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Enterprise Architecture &amp; Database Schema Specification
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            System architecture justification, PostgreSQL Prisma ORM schema, REST API blueprint, and RBAC matrix.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg text-xs">
          <button
            onClick={() => setActiveSubTab('architecture')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeSubTab === 'architecture'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Architecture Justification
          </button>
          <button
            onClick={() => setActiveSubTab('prisma')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeSubTab === 'prisma'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Prisma / PostgreSQL Schema
          </button>
          <button
            onClick={() => setActiveSubTab('rbac')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeSubTab === 'rbac'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            RBAC Permissions Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('api')}
            className={`px-3 py-1.5 rounded-md font-medium transition ${
              activeSubTab === 'api'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            REST API Blueprint
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ARCHITECTURE JUSTIFICATION */}
      {activeSubTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 flex items-center justify-center mb-3">
                <Code2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Frontend: React 19 + TypeScript
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Utilizes strict TypeScript interfaces for compliance audits, zero-lag reactive filtering across large initiative datasets, and Tailwind CSS v4 design tokens adhering to public sector accessibility standards.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mb-3">
                <Server className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Backend: Express + Node.js
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                RESTful microservices handling statutory compliance calculations, dynamic risk scoring (Likelihood × Impact), evidence custody chains, and automated audit alert triggers.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 flex items-center justify-center mb-3">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Database: PostgreSQL + Prisma ORM
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                ACID-compliant relational model linking 5 Strategic Pillars to library programs, evaluations, KPIs, risks, and evidence documents with cascade integrity and composite indexing.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600 flex items-center justify-center mb-3">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Governance: RBAC Security
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Strict separation of duties between Compliance Auditors (scoring &amp; flagging), State Director (approvals &amp; escalation), and Branch Curators (viewing &amp; evidence uploads).
              </p>
            </div>

          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Workflow className="w-4 h-4 text-emerald-600" />
              Strategic Plan (2026–2028) &amp; Enactment 1988 Compliance Workflow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">1</span>
                  Program Registration
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Initiatives are mapped to one of the 5 core strategic pillars and cross-referenced with statutory sections of the Sabah State Library Enactment 1988.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                  Quarterly Audit Scoring
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Compliance Officers evaluate programs across 4 dimensions (0–25 marks each). Dynamic validation triggers mandatory CAPs for scores below 80%.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">3</span>
                  Evidence &amp; Automated Escalation
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                  Chain-of-custody MOUs and inspection reports are deposited in the vault. Lagging KPIs (&gt;30% off-track) trigger automated governance alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: PRISMA SCHEMA */}
      {activeSubTab === 'prisma' && (
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="px-5 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-semibold text-slate-300">
                prisma/schema.prisma (PostgreSQL Relational Schema)
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Prisma Schema'}
            </button>
          </div>

          <pre className="p-5 font-mono text-[11px] leading-relaxed text-emerald-300 overflow-x-auto max-h-[600px]">
            {PRISMA_SCHEMA_CODE}
          </pre>
        </div>
      )}

      {/* SUB-TAB 3: RBAC MATRIX */}
      {activeSubTab === 'rbac' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Role-Based Access Control (RBAC) Permissions Architecture
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enforces statutory audit segregation of duties under public sector internal control frameworks.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <th className="py-3 px-4">Functional Module &amp; Operation</th>
                  <th className="py-3 px-4 text-center">State Director (ADMIN)</th>
                  <th className="py-3 px-4 text-center">Internal Auditor (OFFICER)</th>
                  <th className="py-3 px-4 text-center">Curator / Branch (VIEWER)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                <tr>
                  <td className="py-3 px-4 font-semibold">View Compliance Dashboards &amp; Matrices</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full Access</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full Access</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full Access</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Perform Program Audits &amp; Scoring (0–100)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Full Access</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Authorized Lead</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-bold">✗ Read Only</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Assign Corrective Action Plans (CAP)</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Approve &amp; Escalate</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Mandate &amp; Assign</td>
                  <td className="py-3 px-4 text-center text-slate-400 font-medium">Recipient Only</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Register New Strategic Initiatives</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Authorize</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Authorize</td>
                  <td className="py-3 px-4 text-center text-rose-500 font-bold">✗ Restricted</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Deposit &amp; Verify Custody Evidence</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Final Sign-off</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Audit &amp; Verify</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Upload Only</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-semibold">Export Formal CSV / Printable PDF Audit Reports</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Allowed</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Allowed</td>
                  <td className="py-3 px-4 text-center text-emerald-600 font-bold">✓ Allowed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: REST API BLUEPRINT */}
      {activeSubTab === 'api' && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-600" />
              Core Backend REST API Endpoints Specification
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Production-ready Express endpoints running on port 3000.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-700 text-xs">
            <div className="p-4 flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">GET</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">/api/dashboard/metrics</span>
              <span className="text-slate-500 text-[11px] ml-auto">Aggregated compliance index, pillar progress, and risk counts.</span>
            </div>

            <div className="p-4 flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">GET</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">/api/programs</span>
              <span className="text-slate-500 text-[11px] ml-auto">Query programs with pillar, alignment, and risk query filters.</span>
            </div>

            <div className="p-4 flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">POST</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">/api/evaluations</span>
              <span className="text-slate-500 text-[11px] ml-auto">Execute 4-dimension audit scoring, gap logging, and CAP creation.</span>
            </div>

            <div className="p-4 flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 font-mono font-bold text-[10px]">GET</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">/api/evidence</span>
              <span className="text-slate-500 text-[11px] ml-auto">Retrieve custody MOUs, inspection logs, and provenance files.</span>
            </div>

            <div className="p-4 flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">POST</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">/api/risks</span>
              <span className="text-slate-500 text-[11px] ml-auto">Log operational hazard or statutory breach to the 5x5 heatmap.</span>
            </div>

            <div className="p-4 flex items-center gap-3">
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-mono font-bold text-[10px]">PATCH</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">/api/alerts/:id/acknowledge</span>
              <span className="text-slate-500 text-[11px] ml-auto">Acknowledge automated governance triggers.</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
