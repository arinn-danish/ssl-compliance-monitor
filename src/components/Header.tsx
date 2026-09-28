import React, { useState } from 'react';
import {
  ShieldCheck,
  Bell,
  Database,
  UserCheck,
  ChevronDown,
  Building2,
  FileCheck2,
  AlertTriangle,
  FileText,
  BarChart3,
  Moon,
  Sun,
  Layers,
  LogIn,
  LogOut,
  Cloud,
  CheckCircle2
} from 'lucide-react';
import { UserPersona, UserRole } from '../types';
import { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  currentPersona: UserPersona;
  allPersonas: UserPersona[];
  onSelectPersona: (persona: UserPersona) => void;
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  unacknowledgedAlertsCount: number;
  onOpenAlerts: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  firebaseUser?: FirebaseUser | null;
  onGoogleSignIn?: () => Promise<void>;
  onGoogleSignOut?: () => Promise<void>;
  isFirebaseReady?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentPersona,
  allPersonas,
  onSelectPersona,
  activeTab,
  onSelectTab,
  unacknowledgedAlertsCount,
  onOpenAlerts,
  darkMode,
  onToggleDarkMode,
  firebaseUser,
  onGoogleSignIn,
  onGoogleSignOut,
  isFirebaseReady = true
}) => {
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">Director / Admin</span>;
      case 'COMPLIANCE_OFFICER':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Compliance Officer</span>;
      case 'VIEWER':
        return <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Branch Curator</span>;
    }
  };

  const handleSignInClick = async () => {
    if (!onGoogleSignIn) return;
    try {
      setAuthLoading(true);
      await onGoogleSignIn();
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOutClick = async () => {
    if (!onGoogleSignOut) return;
    try {
      setAuthLoading(true);
      await onGoogleSignOut();
    } catch (err) {
      console.error('Sign-out error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const navItems = [
    { id: 'core', label: 'Core Interface', icon: Layers },
    { id: 'analytics', label: 'Analytics Engine', icon: BarChart3 },
    { id: 'audit-trail', label: 'Audit Trail', icon: FileCheck2 },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-30 transition-colors shadow-xs">
      {/* Top utility bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-sm border border-emerald-800">
              <Building2 className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white tracking-tight text-lg">
                  Perpustakaan Negeri Sabah
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded border border-emerald-200 dark:border-emerald-800">
                  <span>Enactment 1988 &amp; 2026–2028</span>
                </span>
                {isFirebaseReady && (
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 rounded-full border border-emerald-300 dark:border-emerald-700">
                    <Cloud className="w-3 h-3 text-emerald-600" />
                    <span>Firestore Connected</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Public Sector Governance, Statutory Compliance &amp; Program Audit System
              </p>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">

            {/* Google Sign-in / Signed-in indicator */}
            {firebaseUser ? (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium truncate max-w-[130px]">{firebaseUser.email}</span>
                <button
                  id="google-sign-out-btn"
                  onClick={handleSignOutClick}
                  disabled={authLoading}
                  className="ml-1 text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                  title="Sign out from Google"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                id="google-sign-in-btn"
                onClick={handleSignInClick}
                disabled={authLoading}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-2xs"
                title="Sign in with Google Sabah Gov Account"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span>{authLoading ? 'Signing in...' : 'Google Sign-In'}</span>
              </button>
            )}
            
            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={onToggleDarkMode}
              aria-label="Toggle visual theme"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Alerts notification button */}
            <button
              id="governance-alerts-btn"
              onClick={onOpenAlerts}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center"
              title="View Governance Alerts"
            >
              <Bell className="w-5 h-5" />
              {unacknowledgedAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white shadow-xs animate-pulse">
                  {unacknowledgedAlertsCount}
                </span>
              )}
            </button>

            {/* RBAC Persona Selector Dropdown */}
            <div className="relative">
              <button
                id="rbac-user-menu-btn"
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-left cursor-pointer"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentPersona.avatarInitials}
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {currentPersona.name}
                    </span>
                    {getRoleBadge(currentPersona.role)}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[190px]">
                    {currentPersona.email}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Governance Account &amp; RBAC
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Director, Auditor, and Curator access tiers for statutory evaluations.
                    </p>
                  </div>

                  <div className="py-1">
                    {allPersonas.map((persona) => {
                      const isSelected = persona.id === currentPersona.id;
                      return (
                        <button
                          key={persona.id}
                          id={`select-persona-${persona.id}`}
                          onClick={() => {
                            onSelectPersona(persona);
                            setPersonaDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition cursor-pointer ${
                            isSelected ? 'bg-emerald-50/70 dark:bg-emerald-950/40' : ''
                          }`}
                        >
                          <div className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                          }`}>
                            {persona.avatarInitials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                                {persona.name}
                              </span>
                              {getRoleBadge(persona.role)}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {persona.designation}
                            </p>
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                              {persona.email}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Google sign-in trigger in dropdown */}
                  <div className="pt-2 mt-1 border-t border-slate-100 dark:border-slate-700/80 px-3 pb-1">
                    {firebaseUser ? (
                      <button
                        id="dropdown-signout-btn"
                        onClick={() => {
                          handleSignOutClick();
                          setPersonaDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out ({firebaseUser.email})</span>
                      </button>
                    ) : (
                      <button
                        id="dropdown-signin-btn"
                        onClick={() => {
                          handleSignInClick();
                          setPersonaDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition cursor-pointer"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>Sign in with Google</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex space-x-1 overflow-x-auto no-scrollbar pt-1 border-t border-slate-100 dark:border-slate-800/60" aria-label="Main Navigation">
          {navItems.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-tab-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400 font-semibold'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
