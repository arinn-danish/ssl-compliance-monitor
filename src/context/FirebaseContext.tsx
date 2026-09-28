import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import {
  auth,
  signInWithGoogle,
  logOut,
  seedFirestoreIfEmpty,
  firestoreService
} from '../services/firebase';
import { UserPersona, UserRole, UserPermissions } from '../types';
import { USER_PERSONAS } from '../data/sabahLibraryData';
import { api } from '../services/api';

interface FirebaseContextType {
  firebaseUser: FirebaseUser | null;
  currentPersona: UserPersona;
  setCurrentPersona: (persona: UserPersona) => void;
  signIn: () => Promise<void>;
  signInAsOfficer: (email?: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthLoading: boolean;
  isFirebaseReady: boolean;
  isAdmin: boolean;
  isComplianceOfficer: boolean;
  isSuperAdmin: boolean;
  isLibrarian: boolean;
  isMember: boolean;
  isGuest: boolean;
  permissions: UserPermissions;
}

const DEFAULT_PERMISSIONS: UserPermissions = {
  canAuditPrograms: true,
  canUploadEvidence: true,
  canVerifyEvidence: true,
  canManageRisks: true,
  canRegisterPrograms: true,
  canAcknowledgeAlerts: true,
  canAccessSchema: true,
  canQueryAgent: true,
  canManageUsers: true,
  canExportReports: true
};

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentPersona, setCurrentPersona] = useState<UserPersona>({
    ...USER_PERSONAS[0],
    role: 'SuperAdmin',
    permissions: DEFAULT_PERMISSIONS
  });
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);

  useEffect(() => {
    // Seed Firestore if first time
    seedFirestoreIfEmpty()
      .then(() => setIsFirebaseReady(true))
      .catch((err) => {
        console.warn('Seed status:', err);
        setIsFirebaseReady(true);
      });

    // Listen to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);

      if (user) {
        const email = user.email || '';
        const name = user.displayName || email.split('@')[0] || 'Sabah Library Officer';

        try {
          // Verify automated RBAC through backend engine
          const rbacResult = await api.verifyRBAC({
            email,
            name,
            uid: user.uid
          });

          const persona: UserPersona = {
            id: user.uid,
            name: rbacResult.displayName || name,
            email: email,
            role: rbacResult.role as UserRole,
            designation: rbacResult.designation || 'Statutory Compliance Officer',
            department: rbacResult.department || 'Governance & Legal Directorate',
            avatarInitials: (name
              ? name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')
              : 'AS').toUpperCase(),
            permissions: rbacResult.permissions || DEFAULT_PERMISSIONS
          };

          setCurrentPersona(persona);

          // Store or update profile in Firestore
          await firestoreService.saveUserProfile({
            uid: user.uid,
            email: email,
            displayName: persona.name,
            role: persona.role,
            designation: persona.designation,
            branch: 'Headquarters Tanjung Aru',
            avatarInitials: persona.avatarInitials
          });
        } catch (err) {
          console.warn('Profile sync note:', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const handleSignInAsOfficer = async (
    email = 'antoniapeter.sani@sabah.gov.my',
    name = 'Antonia Peter Sani'
  ) => {
    const mockUser: any = {
      uid: 'officer-' + Math.random().toString(36).substring(2, 8),
      email,
      displayName: name,
      emailVerified: true
    };
    setFirebaseUser(mockUser);

    try {
      const rbacResult = await api.verifyRBAC({
        email,
        name,
        uid: mockUser.uid
      });

      const persona: UserPersona = {
        id: mockUser.uid,
        name: name,
        email: email,
        role: rbacResult.role as UserRole,
        designation: rbacResult.designation,
        department: rbacResult.department,
        avatarInitials: 'AS',
        permissions: rbacResult.permissions
      };
      setCurrentPersona(persona);
    } catch (e) {
      console.warn('Fallback officer RBAC:', e);
      setCurrentPersona({
        id: mockUser.uid,
        name: name,
        email: email,
        role: 'SuperAdmin',
        designation: 'Director of Sabah State Library (Pengarah Perpustakaan Negeri Sabah)',
        department: 'Executive Directorate & Statutory Governance',
        avatarInitials: 'AS',
        permissions: DEFAULT_PERMISSIONS
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setFirebaseUser(null);
      setCurrentPersona(USER_PERSONAS[0]);
    } catch (error) {
      console.error('Sign-out error:', error);
      setFirebaseUser(null);
      setCurrentPersona(USER_PERSONAS[0]);
    }
  };

  const isSuperAdmin = currentPersona.role === 'SuperAdmin' || currentPersona.role === 'ADMIN' || (firebaseUser?.email === 'antoniapeter.sani@sabah.gov.my');
  const isLibrarian = currentPersona.role === 'Librarian' || currentPersona.role === 'COMPLIANCE_OFFICER';
  const isMember = currentPersona.role === 'Member';
  const isGuest = currentPersona.role === 'Guest' || (!firebaseUser && !isSuperAdmin);

  const isAdmin = isSuperAdmin;
  const isComplianceOfficer = isSuperAdmin || isLibrarian;

  const permissions: UserPermissions = currentPersona.permissions || {
    canAuditPrograms: isSuperAdmin || isLibrarian,
    canUploadEvidence: isSuperAdmin || isLibrarian,
    canVerifyEvidence: isSuperAdmin,
    canManageRisks: isSuperAdmin || isLibrarian,
    canRegisterPrograms: isSuperAdmin,
    canAcknowledgeAlerts: isSuperAdmin || isLibrarian,
    canAccessSchema: isSuperAdmin || isLibrarian,
    canQueryAgent: true,
    canManageUsers: isSuperAdmin,
    canExportReports: isSuperAdmin || isLibrarian
  };

  return (
    <FirebaseContext.Provider
      value={{
        firebaseUser,
        currentPersona,
        setCurrentPersona,
        signIn: handleSignIn,
        signInAsOfficer: handleSignInAsOfficer,
        signOut: handleSignOut,
        isAuthLoading,
        isFirebaseReady,
        isAdmin,
        isComplianceOfficer,
        isSuperAdmin,
        isLibrarian,
        isMember,
        isGuest,
        permissions
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = (): FirebaseContextType => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
