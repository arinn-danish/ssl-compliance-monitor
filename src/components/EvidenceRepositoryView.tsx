import React, { useState, useRef } from 'react';
import {
  FileText,
  Upload,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldCheck,
  Tag,
  Eye,
  FileCheck2,
  FolderOpen,
  X
} from 'lucide-react';
import {
  EvidenceDocument,
  LibraryProgram,
  DocumentType,
  UserPersona
} from '../types';

interface EvidenceRepositoryViewProps {
  evidenceDocs: EvidenceDocument[];
  programs: LibraryProgram[];
  currentPersona: UserPersona;
  onUploadDocument: (docData: Partial<EvidenceDocument>) => Promise<void>;
  onVerifyDocument: (id: string, status: 'VERIFIED' | 'PENDING' | 'FLAGGED') => Promise<void>;
  initialProgramFilter?: string;
}

export const EvidenceRepositoryView: React.FC<EvidenceRepositoryViewProps> = ({
  evidenceDocs,
  programs,
  currentPersona,
  onUploadDocument,
  onVerifyDocument,
  initialProgramFilter
}) => {
  const [selectedProgramId, setSelectedProgramId] = useState<string>(initialProgramFilter || 'ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadProgramId, setUploadProgramId] = useState(programs[0]?.id || '');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDocType, setUploadDocType] = useState<DocumentType>('INSPECTION_REPORT');
  const [uploadProvenance, setUploadProvenance] = useState('');
  const [uploadTags, setUploadTags] = useState('Sabah State Library, Audit 2026');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview modal state
  const [previewDoc, setPreviewDoc] = useState<EvidenceDocument | null>(null);

  const filteredDocs = evidenceDocs.filter((doc) => {
    if (selectedProgramId !== 'ALL' && doc.programId !== selectedProgramId) return false;
    if (selectedType !== 'ALL' && doc.documentType !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        doc.title.toLowerCase().includes(q) ||
        doc.fileName.toLowerCase().includes(q) ||
        doc.programName.toLowerCase().includes(q) ||
        doc.uploadedBy.toLowerCase().includes(q) ||
        doc.tags.some(t => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!uploadTitle) setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadProgramId) return;

    setIsSubmitting(true);
    try {
      const fileName = selectedFile ? selectedFile.name : `${uploadTitle.replace(/\s+/g, '_')}.pdf`;
      const fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.8 MB';
      const tagsArray = uploadTags.split(',').map(t => t.trim()).filter(Boolean);

      await onUploadDocument({
        programId: uploadProgramId,
        title: uploadTitle,
        documentType: uploadDocType,
        fileName,
        fileSize,
        uploadedBy: currentPersona.name,
        provenanceDetails: uploadProvenance || 'Document verified and deposited into the official Sabah State Library compliance archive.',
        tags: tagsArray
      });

      // Reset form
      setSelectedFile(null);
      setUploadTitle('');
      setUploadProvenance('');
      setIsUploadOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDocTypeBadge = (type: DocumentType) => {
    switch (type) {
      case 'MOU':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">MOU / Treaty</span>;
      case 'INSPECTION_REPORT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Inspection Report</span>;
      case 'PROVENANCE_RECORD':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Provenance Record</span>;
      case 'STATUTORY_CERTIFICATE':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Statutory Certificate</span>;
      case 'AUDIT_TRAIL':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">Audit Trail</span>;
    }
  };

  return (
    <div className="space-y-4 pb-12">
      
      {/* Header & Upload Button */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-600" />
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Document &amp; Evidence Repository
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Custody logs, statutory MOUs, provenance records, and field inspection receipts underpinning compliance audits.
          </p>
        </div>

        <button
          id="open-upload-evidence-btn"
          onClick={() => setIsUploadOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Upload className="w-4 h-4" />
          Deposit Evidence Document
        </button>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="evidence-search-input"
              type="text"
              placeholder="Search title, tags, uploader, provenance details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              id="evidence-program-filter"
              value={selectedProgramId}
              onChange={(e) => setSelectedProgramId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Linked Programs ({programs.length})</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>
                  [{p.code}] {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              id="evidence-type-filter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
            >
              <option value="ALL">All Document Types</option>
              <option value="MOU">MOUs &amp; Joint Treaties</option>
              <option value="INSPECTION_REPORT">Inspection &amp; Field Reports</option>
              <option value="PROVENANCE_RECORD">Historical Provenance Records</option>
              <option value="STATUTORY_CERTIFICATE">Statutory Certificates</option>
              <option value="AUDIT_TRAIL">Audit Trails &amp; JKKK Receipts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocs.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500">
            No evidence documents match your selected filters.
          </div>
        ) : (
          filteredDocs.map((doc) => (
            <div
              key={doc.id}
              id={`evidence-card-${doc.id}`}
              className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      {getDocTypeBadge(doc.documentType)}
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    doc.verifiedStatus === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                    doc.verifiedStatus === 'FLAGGED' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {doc.verifiedStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2.5 line-clamp-2">
                  {doc.title}
                </h3>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                  Program: {doc.programName}
                </p>

                {doc.provenanceDetails && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-md border border-slate-100 dark:border-slate-800">
                    <strong>Provenance:</strong> {doc.provenanceDetails}
                  </p>
                )}

                <div className="flex flex-wrap gap-1 mt-2.5">
                  {doc.tags.map((tag, idx) => (
                    <span key={idx} className="px-1.5 py-0.5 text-[10px] rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/70 flex items-center justify-between text-[11px]">
                <div className="text-slate-400">
                  <span>{doc.fileSize}</span> • <span>{doc.uploadedAt}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium flex items-center gap-1 transition"
                  >
                    <Eye className="w-3 h-3" /> Inspect
                  </button>

                  {(currentPersona.role === 'ADMIN' || currentPersona.role === 'COMPLIANCE_OFFICER') && (
                    <button
                      onClick={() => onVerifyDocument(doc.id, doc.verifiedStatus === 'VERIFIED' ? 'FLAGGED' : 'VERIFIED')}
                      className={`p-1 rounded ${
                        doc.verifiedStatus === 'VERIFIED'
                          ? 'text-emerald-600 hover:text-emerald-700'
                          : 'text-amber-500 hover:text-amber-600'
                      }`}
                      title={doc.verifiedStatus === 'VERIFIED' ? 'Flag document for re-audit' : 'Confirm provenance authenticity'}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Evidence Modal with Drag & Drop */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-900 text-white">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">Deposit Statutory Evidence</h2>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 text-xs">
              
              {/* Drag and drop upload zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".pdf,.docx,.xlsx,.png,.jpg"
                />
                <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                  {selectedFile ? selectedFile.name : 'Drag & drop compliance file here, or browse'}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports PDF, DOCX, XLSX, images (MOU scans, provenance certificates, inspection logs)
                </p>
                {selectedFile && (
                  <span className="inline-block mt-2 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB Ready
                  </span>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. British North Borneo Land Registry Deeds Provenance Certificate"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Linked Program *
                  </label>
                  <select
                    value={uploadProgramId}
                    onChange={(e) => setUploadProgramId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
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
                    Document Classification
                  </label>
                  <select
                    value={uploadDocType}
                    onChange={(e: any) => setUploadDocType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option value="MOU">MOU / Statutory Treaty</option>
                    <option value="INSPECTION_REPORT">Inspection &amp; Field Report</option>
                    <option value="PROVENANCE_RECORD">Provenance &amp; Custody Certificate</option>
                    <option value="STATUTORY_CERTIFICATE">Statutory Compliance Certificate</option>
                    <option value="AUDIT_TRAIL">Audit Log / JKKK Receipts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custody &amp; Provenance Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Record custodian chain, signatory officer, physical storage coordinates, or legal deposit reference..."
                  value={uploadProvenance}
                  onChange={(e) => setUploadProvenance(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Metadata Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Statutory, Enactment Sec 7(2), Sandakan Vault, 1881"
                  value={uploadTags}
                  onChange={(e) => setUploadTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSubmitting ? 'Depositing...' : 'Archive & Deposit'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Preview Document Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs animate-in fade-in">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  Sabah State Library Verified Evidence
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {previewDoc.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div><strong>File Name:</strong> {previewDoc.fileName}</div>
                  <div><strong>File Size:</strong> {previewDoc.fileSize}</div>
                  <div><strong>Uploaded By:</strong> {previewDoc.uploadedBy}</div>
                  <div><strong>Deposit Date:</strong> {previewDoc.uploadedAt}</div>
                  <div><strong>Linked Program:</strong> {previewDoc.programName}</div>
                  <div><strong>Verification Status:</strong> {previewDoc.verifiedStatus}</div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                  Provenance &amp; Custody Certification
                </h4>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  {previewDoc.provenanceDetails || 'No additional provenance notes provided.'}
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {previewDoc.tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-medium">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
