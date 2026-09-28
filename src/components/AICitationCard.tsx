import React, { useState } from 'react';
import {
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  BookOpen,
  Scale,
  Copy,
  Check,
  Building,
  Info
} from 'lucide-react';
import { AICitation } from '../types';

interface AICitationCardProps {
  citation: AICitation;
  className?: string;
}

export const AICitationCard: React.FC<AICitationCardProps> = ({ citation, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const textToCopy = `[Citation] ${citation.title}\nRelevance: ${citation.relevance}\nSection: ${citation.enactmentSection || 'N/A'}\nExcerpt: "${citation.excerpt}"\nSource: ${citation.sourceUrl || 'Sabah State Library Statutory Repository'}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTypeBadge = () => {
    switch (citation.type) {
      case 'ENACTMENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Scale className="w-3 h-3" />
            <span>Statutory Enactment</span>
          </span>
        );
      case 'STRATEGIC_PLAN':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <BookOpen className="w-3 h-3" />
            <span>Strategic Plan 2026–2028</span>
          </span>
        );
      case 'AUDIT_CIRCULAR':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/70 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            <ShieldCheck className="w-3 h-3" />
            <span>KSTI Audit Directive</span>
          </span>
        );
      case 'DATABASE_RECORD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 dark:bg-sky-950/70 text-sky-900 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
            <Building className="w-3 h-3" />
            <span>Library Record</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <FileText className="w-3 h-3" />
            <span>Policy Document</span>
          </span>
        );
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/90 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden text-left ${className}`}
    >
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3 sm:p-3.5 bg-slate-50/80 dark:bg-slate-850 cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/90 transition-colors flex items-start justify-between gap-2.5"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {getTypeBadge()}
            {citation.enactmentSection && (
              <span className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {citation.enactmentSection}
              </span>
            )}
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              • {citation.relevance}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white tracking-tight leading-snug truncate">
            {citation.title}
          </h4>
        </div>

        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          <button
            type="button"
            onClick={handleCopyCitation}
            title="Copy citation reference"
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <div className="p-1 text-slate-400">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Excerpt Body */}
      <div className="p-3 sm:p-3.5 space-y-2 border-t border-slate-100 dark:border-slate-800">
        <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic border-l-2 border-emerald-500/80 pl-2.5 py-0.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-r">
          "{citation.excerpt}"
        </div>

        {/* Expandable Deep Detail */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5 text-xs animate-in fade-in slide-in-from-top-1 duration-200">
            {citation.fullText && (
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider block mb-1">
                  Statutory Provision Text:
                </span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px] bg-slate-100 dark:bg-slate-950 p-2.5 rounded-lg font-mono border border-slate-200 dark:border-slate-800 whitespace-pre-line">
                  {citation.fullText}
                </p>
              </div>
            )}

            {citation.crossReferences && citation.crossReferences.length > 0 && (
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider block mb-1">
                  Statutory Cross-References:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {citation.crossReferences.map((ref, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                    >
                      {ref}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 dark:text-slate-500">
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3 text-emerald-600" />
                <span>Verified against Sabah State Library Enactment 1988</span>
              </span>
              {citation.sourceUrl && (
                <a
                  href={citation.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
                >
                  <span>Legal Gazette Record</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
