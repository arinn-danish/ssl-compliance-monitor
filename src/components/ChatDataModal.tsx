import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  FileJson,
  FileText,
  Copy,
  Check,
  Code2,
  Database,
  Sparkles,
  Layers,
  ArrowRight,
  Eye,
  File
} from 'lucide-react';
import { ProcessedAttachment, createDataSnippetAttachment } from '../utils/fileDataProcessor';

interface EnterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAttachData: (attachment: ProcessedAttachment) => void;
}

const SAMPLE_DATASETS = [
  {
    title: 'Legal Deposit & Acquisition Audit (CSV)',
    format: 'csv' as const,
    data: `Branch,Quarter,Legal_Deposits_Target,Deposits_Received,Compliance_Pct,Statutory_Section
HQ_Kota_Kinabalu,Q1_2026,1200,1285,107.1,Section 6 (Enactment 1988)
Sandakan_Regional,Q1_2026,450,420,93.3,Section 6 (Enactment 1988)
Tawau_Regional,Q1_2026,400,365,91.3,Section 6 (Enactment 1988)
Keningau_Branch,Q1_2026,250,260,104.0,Section 6 (Enactment 1988)
Lahad_Datu_Branch,Q1_2026,200,155,77.5,Section 6 (Enactment 1988)`
  },
  {
    title: 'Statutory Budget Utilization (JSON)',
    format: 'json' as const,
    data: JSON.stringify(
      {
        fiscalYear: 2026,
        jurisdiction: 'Sabah State Library (Enactment 1988 Rev. 2022)',
        enactmentClauses: ['Section 3', 'Section 14'],
        programs: [
          {
            code: 'SSL-LDS-01',
            name: 'Digital Legal Deposit & Archival',
            budgetAllocatedMYR: 280000,
            spentMYR: 195000,
            status: 'FULL_COMPLIANCE'
          },
          {
            code: 'SSL-DES-03',
            name: 'Rural Library Mobile Outreach',
            budgetAllocatedMYR: 160000,
            spentMYR: 142000,
            status: 'PARTIAL_ALIGNMENT'
          },
          {
            code: 'SSL-HER-02',
            name: 'Indigenous Heritage Oral History',
            budgetAllocatedMYR: 120000,
            spentMYR: 110000,
            status: 'FULL_COMPLIANCE'
          }
        ]
      },
      null,
      2
    )
  },
  {
    title: 'Statutory Inspection Notes (Text)',
    format: 'text' as const,
    data: `STATE LIBRARY STATUTORY INSPECTION MEMORANDUM
Date: 15 August 2026
Auditor: Antonia Peter Sani (Internal Audit Unit)
Reference: SSL/AUD/2026-088
Governing Law: Sabah State Library Enactment 1988, Section 3(2)(c) & Section 8

FINDINGS:
1. Physical preservation standards at the Sandakan branch meet minimum humidity thresholds of 55% RH.
2. Mandatory deposit register records 420 publisher items cataloged under Section 6.
3. Deficit identified in local vernacular serial publications cataloging; corrective action plan (CAP-2026-04) requested within 30 days.`
  }
];

export const EnterDataModal: React.FC<EnterDataModalProps> = ({
  isOpen,
  onClose,
  onAttachData
}) => {
  const [title, setTitle] = useState('');
  const [formatChoice, setFormatChoice] = useState<'auto' | 'csv' | 'json' | 'text'>('auto');
  const [dataContent, setDataContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dataContent.trim()) {
      setErrorMsg('Please enter or paste some data or text.');
      return;
    }

    const attachment = createDataSnippetAttachment(
      title.trim() || 'Data Snippet',
      dataContent,
      formatChoice
    );
    onAttachData(attachment);
    onClose();
    setTitle('');
    setDataContent('');
    setErrorMsg('');
  };

  const handleApplySample = (sample: typeof SAMPLE_DATASETS[0]) => {
    setTitle(sample.title);
    setFormatChoice(sample.format);
    setDataContent(sample.data);
    setErrorMsg('');
  };

  const lineCount = dataContent ? dataContent.split('\n').length : 0;
  const charCount = dataContent.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Upload or Paste Data into Chatbot</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Direct Input
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Paste CSV tables, JSON records, statutory text, or spreadsheets to analyze in the AI Chat.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Preset Samples */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>Quick Test Templates</span>
              </label>
              <span className="text-[10px] text-slate-400">Click to insert sample</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DATASETS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplySample(sample)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  {sample.format === 'csv' ? (
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  ) : sample.format === 'json' ? (
                    <FileJson className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                  )}
                  <span>{sample.title.split('(')[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Title & Format Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Data Title / Label
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Library Acquisition Q2, Budget Ledger, Audit Memo..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Format
              </label>
              <select
                value={formatChoice}
                onChange={(e) => setFormatChoice(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="auto">Auto-Detect</option>
                <option value="csv">CSV Table</option>
                <option value="json">JSON Object/Array</option>
                <option value="text">Plain Text / Notes</option>
              </select>
            </div>
          </div>

          {/* Textarea for Data */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Paste Data Content / Table</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {lineCount} lines • {charCount.toLocaleString()} chars
              </span>
            </div>
            <textarea
              rows={9}
              value={dataContent}
              onChange={(e) => {
                setDataContent(e.target.value);
                if (errorMsg) setErrorMsg('');
              }}
              placeholder="Paste raw CSV, JSON, table rows, tab-separated records, or statutory clauses here..."
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 font-mono text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
              {errorMsg}
            </p>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
            <span className="text-[11px] text-slate-400">
              Attached data will be streamed directly into your AI query context.
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <span>Attach to Chat</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

interface InspectAttachmentModalProps {
  attachment: ProcessedAttachment | null;
  onClose: () => void;
}

export const InspectAttachmentModal: React.FC<InspectAttachmentModalProps> = ({
  attachment,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');

  if (!attachment) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(attachment.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if content is CSV for table view
  const isCsv = attachment.format === 'csv';
  const csvLines = isCsv ? attachment.content.split(/\r?\n/).filter((l) => l.trim().length > 0) : [];
  const headers = isCsv && csvLines.length > 0 ? csvLines[0].split(',') : [];
  const rows = isCsv && csvLines.length > 1 ? csvLines.slice(1).map((l) => l.split(',')) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              attachment.format === 'csv'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                : attachment.format === 'json'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                : attachment.format === 'pdf'
                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                : attachment.format === 'image'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
            }`}>
              {attachment.format === 'csv' ? (
                <FileSpreadsheet className="w-5 h-5" />
              ) : attachment.format === 'json' ? (
                <FileJson className="w-5 h-5" />
              ) : attachment.format === 'pdf' ? (
                <FileText className="w-5 h-5" />
              ) : attachment.format === 'image' ? (
                <Eye className="w-5 h-5" />
              ) : (
                <File className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {attachment.name}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  {attachment.format}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {attachment.sizeFormatted} • {attachment.lineCount || 1} lines • {attachment.charCount?.toLocaleString()} characters
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCsv && (
              <div className="flex items-center bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('formatted')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition ${
                    viewMode === 'formatted'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Table
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('raw')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition ${
                    viewMode === 'raw'
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Raw
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-medium cursor-pointer flex items-center gap-1"
              title="Copy content"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Preview Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {attachment.previewUrl ? (
            <div className="space-y-3">
              <div className="flex justify-center bg-slate-950 p-4 rounded-xl">
                <img
                  src={attachment.previewUrl}
                  alt={attachment.name}
                  className="max-h-80 object-contain rounded-lg"
                />
              </div>
              <p className="text-xs text-slate-500 font-mono text-center">
                {attachment.name} ({attachment.type}, {attachment.sizeFormatted})
              </p>
            </div>
          ) : isCsv && viewMode === 'formatted' && headers.length > 0 ? (
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto shadow-2xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-200">
                  <tr>
                    {headers.map((h, i) => (
                      <th key={i} className="px-3 py-2 whitespace-nowrap">
                        {h.trim()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {rows.map((row, rIdx) => (
                    <tr
                      key={rIdx}
                      className="hover:bg-slate-50 dark:hover:bg-slate-750 font-mono text-[11px]"
                    >
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap">
                          {cell.trim()}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed max-h-[60vh] border border-slate-800">
              {attachment.content}
            </pre>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-[11px] text-slate-500 flex items-center justify-between">
          <span>This file/data is passed directly into the Gemini Enterprise statutory reasoning model.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold cursor-pointer text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
