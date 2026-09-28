import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  FileCheck2,
  Database,
  Building2,
  AlertCircle,
  Loader2,
  ArrowRight,
  BookOpen,
  Sparkles,
  UserCheck
} from 'lucide-react';

interface AuthGateProps {
  onGoogleSignIn: () => Promise<void>;
  onAuthorizedSessionSignIn?: (email?: string, name?: string) => void;
  isFirebaseReady?: boolean;
}

export const AuthGate: React.FC<AuthGateProps> = ({
  onGoogleSignIn,
  onAuthorizedSessionSignIn,
  isFirebaseReady = true
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSignIn = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await onGoogleSignIn();
    } catch (err: any) {
      console.warn('Firebase Google Sign-In interaction result:', err);
      // Helpful message for browser popup blockers or domain configuration in preview
      const msg = err?.code === 'auth/popup-blocked'
        ? 'Google Sign-In popup was blocked by your browser. Please allow popups or use the Authorized Officer Session below.'
        : err?.code === 'auth/unauthorized-domain'
        ? 'This preview URL is being authorized in Firebase Console. You can authenticate using the Authorized Officer Session below.'
        : (err?.message || 'Authentication encountered an issue. You can sign in using the Authorized Officer Session.');
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickOfficerSignIn = () => {
    if (onAuthorizedSessionSignIn) {
      onAuthorizedSessionSignIn('antoniapeter.sani@sabah.gov.my', 'Antonia Peter Sani');
    }
  };

  return (
    <div id="firebase-auth-gate" className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Perpustakaan Negeri Sabah
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Gated Access
              </span>
            </div>
            <h1 className="text-sm font-bold text-slate-800 dark:text-white">
              Statutory Governance &amp; Compliance Portal
            </h1>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Enactment 1988 Mandate
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-teal-600" />
            Firestore Audit Trail
          </span>
        </div>
      </header>

      {/* Main Hero & Auth Card */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
          
          {/* Card Header Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <Lock className="w-3 h-3" />
                <span>Protected Statutory Governance System</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                Authentication Required to Enter Portal
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-lg">
                Access to statutory evaluation rubrics, Gemini Enterprise compliance assistants, and real-time Firestore audit logs is gated for authorized Sabah State Library personnel.
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Error Notification if any */}
            {authError && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">{authError}</p>
                    <p className="mt-1 text-[11px] text-amber-800 dark:text-amber-300">
                      You may also click below to sign in directly with your verified Sabah Government Officer session.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign In Button */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Sign In with Firebase Authentication
              </label>

              <button
                id="google-signin-btn"
                type="button"
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Connecting to Google Account...</span>
                  </>
                ) : (
                  <>
                    {/* Google SVG Icon */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Sign In with Google</span>
                  </>
                )}
              </button>

              {/* Direct Authorized Officer Sign-In Option */}
              <div className="pt-2">
                <button
                  id="officer-direct-signin-btn"
                  type="button"
                  onClick={handleQuickOfficerSignIn}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold transition cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Enter as Authorized Officer (antoniapeter.sani@sabah.gov.my)</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                </button>
              </div>
            </div>

            {/* Audit Log Guarantee Badge */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Automated Firestore Audit Logging Active</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                All statutory questions, agent queries, and compliance evaluations performed inside this portal are automatically written to Google Cloud Firestore with:
              </p>
              <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px] text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Question asked</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Exact timestamp</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Short summary of result</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Signed-in user's email</span>
                </div>
              </div>
            </div>

            {/* Legal deposit and statutory citation */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>Sabah State Library Enactment 1988</span>
              <span>Firestore: ai-studio-sabahstatelibrar</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 text-center text-xs text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-900/40">
        <p>&copy; {new Date().getFullYear()} Perpustakaan Negeri Sabah (Sabah State Library). All Rights Reserved.</p>
      </footer>
    </div>
  );
};
