import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  LibraryProgram,
  ProgramEvaluation,
  ProgramKPI,
  ComplianceRisk,
  EvidenceDocument,
  GovernanceAlert,
  UserPersona,
  AuditCycleRecord,
  FirestoreAuditLog
} from '../types';
import {
  INITIAL_PROGRAMS,
  INITIAL_EVALUATIONS,
  INITIAL_KPIS,
  INITIAL_RISKS,
  INITIAL_EVIDENCE_DOCS,
  INITIAL_GOVERNANCE_ALERTS
} from '../data/sabahLibraryData';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firestore with the named database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Sign-in with Google popup
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
}

// Sign-out
export async function logOut(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

// Seed Initial Database if empty
export async function seedFirestoreIfEmpty(): Promise<void> {
  try {
    const programsCol = collection(db, 'programs');
    const snap = await getDocs(programsCol);
    if (!snap.empty) {
      return; // Already populated
    }

    console.log('Database empty, auto-seeding initial Sabah State Library governance records...');
    const batch = writeBatch(db);

    // Seed programs
    for (const p of INITIAL_PROGRAMS) {
      const ref = doc(db, 'programs', p.id);
      batch.set(ref, p);
    }

    // Seed evaluations
    for (const e of INITIAL_EVALUATIONS) {
      const ref = doc(db, 'evaluations', e.id);
      batch.set(ref, e);
    }

    // Seed KPIs
    for (const k of INITIAL_KPIS) {
      const ref = doc(db, 'kpis', k.id);
      batch.set(ref, k);
    }

    // Seed Risks
    for (const r of INITIAL_RISKS) {
      const ref = doc(db, 'risks', r.id);
      batch.set(ref, r);
    }

    // Seed Evidence
    for (const ed of INITIAL_EVIDENCE_DOCS) {
      const ref = doc(db, 'evidence', ed.id);
      batch.set(ref, ed);
    }

    // Seed Alerts
    for (const a of INITIAL_GOVERNANCE_ALERTS) {
      const ref = doc(db, 'alerts', a.id);
      batch.set(ref, a);
    }

    await batch.commit();
    console.log('Initial Sabah State Library governance records seeded successfully into Firestore.');
  } catch (error) {
    console.warn('Seed verification failed (or rules prevented seeding without auth):', error);
  }
}

// Firestore Database Service API
export const firestoreService = {
  // Programs
  async getPrograms(): Promise<LibraryProgram[]> {
    const path = 'programs';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return INITIAL_PROGRAMS;
      }
      return snap.docs.map(d => d.data() as LibraryProgram);
    } catch (err) {
      console.warn('Firestore getPrograms failed, using initial dataset:', err);
      return INITIAL_PROGRAMS;
    }
  },

  async addProgram(program: LibraryProgram): Promise<LibraryProgram> {
    const path = `programs/${program.id}`;
    try {
      await setDoc(doc(db, 'programs', program.id), program);
      return program;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateProgram(id: string, updates: Partial<LibraryProgram>): Promise<void> {
    const path = `programs/${id}`;
    try {
      await updateDoc(doc(db, 'programs', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Evaluations
  async getEvaluations(): Promise<ProgramEvaluation[]> {
    const path = 'evaluations';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return INITIAL_EVALUATIONS;
      }
      return snap.docs.map(d => d.data() as ProgramEvaluation);
    } catch (err) {
      console.warn('Firestore getEvaluations fallback:', err);
      return INITIAL_EVALUATIONS;
    }
  },

  async addEvaluation(evaluation: ProgramEvaluation): Promise<ProgramEvaluation> {
    const path = `evaluations/${evaluation.id}`;
    try {
      await setDoc(doc(db, 'evaluations', evaluation.id), evaluation);
      return evaluation;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  // KPIs
  async getKPIs(): Promise<ProgramKPI[]> {
    const path = 'kpis';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return INITIAL_KPIS;
      }
      return snap.docs.map(d => d.data() as ProgramKPI);
    } catch (err) {
      console.warn('Firestore getKPIs fallback:', err);
      return INITIAL_KPIS;
    }
  },

  async updateKPI(id: string, currentValue: number, status?: string): Promise<void> {
    const path = `kpis/${id}`;
    try {
      const updates: any = { currentValue };
      if (status) updates.status = status;
      await updateDoc(doc(db, 'kpis', id), updates);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Risks
  async getRisks(): Promise<ComplianceRisk[]> {
    const path = 'risks';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return INITIAL_RISKS;
      }
      return snap.docs.map(d => d.data() as ComplianceRisk);
    } catch (err) {
      console.warn('Firestore getRisks fallback:', err);
      return INITIAL_RISKS;
    }
  },

  async addRisk(risk: ComplianceRisk): Promise<ComplianceRisk> {
    const path = `risks/${risk.id}`;
    try {
      await setDoc(doc(db, 'risks', risk.id), risk);
      return risk;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateRiskStatus(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'MITIGATED'): Promise<void> {
    const path = `risks/${id}`;
    try {
      await updateDoc(doc(db, 'risks', id), { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Evidence
  async getEvidence(): Promise<EvidenceDocument[]> {
    const path = 'evidence';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return INITIAL_EVIDENCE_DOCS;
      }
      return snap.docs.map(d => d.data() as EvidenceDocument);
    } catch (err) {
      console.warn('Firestore getEvidence fallback:', err);
      return INITIAL_EVIDENCE_DOCS;
    }
  },

  async addEvidence(docItem: EvidenceDocument): Promise<EvidenceDocument> {
    const path = `evidence/${docItem.id}`;
    try {
      await setDoc(doc(db, 'evidence', docItem.id), docItem);
      return docItem;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, path);
    }
  },

  async updateEvidenceStatus(id: string, verifiedStatus: 'VERIFIED' | 'PENDING' | 'FLAGGED'): Promise<void> {
    const path = `evidence/${id}`;
    try {
      await updateDoc(doc(db, 'evidence', id), { verifiedStatus });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Alerts
  async getAlerts(): Promise<GovernanceAlert[]> {
    const path = 'alerts';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return INITIAL_GOVERNANCE_ALERTS;
      }
      return snap.docs.map(d => d.data() as GovernanceAlert);
    } catch (err) {
      console.warn('Firestore getAlerts fallback:', err);
      return INITIAL_GOVERNANCE_ALERTS;
    }
  },

  async acknowledgeAlert(id: string): Promise<void> {
    const path = `alerts/${id}`;
    try {
      await updateDoc(doc(db, 'alerts', id), { acknowledged: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, path);
    }
  },

  // Save User Profile in Firestore
  async saveUserProfile(user: {
    uid: string;
    email: string;
    displayName: string;
    role: 'ADMIN' | 'COMPLIANCE_OFFICER' | 'VIEWER';
    designation?: string;
    branch?: string;
    avatarInitials?: string;
  }): Promise<void> {
    const path = `users/${user.uid}`;
    try {
      await setDoc(doc(db, 'users', user.uid), user, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }
  },

  // Audit Cycles / Input-Output History
  async recordAuditCycle(record: AuditCycleRecord): Promise<AuditCycleRecord> {
    const path = `audit_cycles/${record.id}`;
    try {
      await setDoc(doc(db, 'audit_cycles', record.id), record);
      return record;
    } catch (err) {
      console.warn('Failed to record audit cycle to Firestore:', err);
      return record;
    }
  },

  async getAuditCycles(): Promise<AuditCycleRecord[]> {
    const path = 'audit_cycles';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return [];
      }
      const records = snap.docs.map(d => d.data() as AuditCycleRecord);
      // Sort newest first
      return records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.warn('Firestore getAuditCycles fallback:', err);
      return [];
    }
  },

  subscribeAuditCycles(callback: (records: AuditCycleRecord[]) => void): () => void {
    const path = 'audit_cycles';
    try {
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snap) => {
          const records = snap.docs.map(d => d.data() as AuditCycleRecord);
          // Newest first
          records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          callback(records);
        },
        (error) => {
          console.warn('Firestore audit_cycles snapshot error:', error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscribeAuditCycles failed:', err);
      return () => {};
    }
  },

  async deleteAuditCycle(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'audit_cycles', id));
    } catch (err) {
      console.warn('Delete audit cycle error:', err);
    }
  },

  // Audit Logs (Question asked, timestamp, short summary of result, signed-in user's email)
  async addAuditLog(entry: {
    question: string;
    timestamp?: string;
    summary: string;
    userEmail: string;
    userId?: string;
    userName?: string;
    rawAnswer?: string;
    status?: string;
  }): Promise<string> {
    const path = 'audit_logs';
    try {
      const docData = {
        question: entry.question,
        timestamp: entry.timestamp || new Date().toISOString(),
        summary: entry.summary,
        userEmail: entry.userEmail,
        userId: entry.userId || '',
        userName: entry.userName || '',
        rawAnswer: entry.rawAnswer || '',
        status: entry.status || 'SUCCESS'
      };
      const ref = await addDoc(collection(db, path), docData);
      return ref.id;
    } catch (err) {
      console.warn('Failed to add audit log to Firestore:', err);
      return `local-${Date.now()}`;
    }
  },

  async getAuditLogs(): Promise<FirestoreAuditLog[]> {
    const path = 'audit_logs';
    try {
      const snap = await getDocs(collection(db, path));
      if (snap.empty) {
        return [];
      }
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreAuditLog));
      return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.warn('getAuditLogs fallback:', err);
      return [];
    }
  },

  subscribeAuditLogs(callback: (logs: FirestoreAuditLog[]) => void): () => void {
    const path = 'audit_logs';
    try {
      const unsubscribe = onSnapshot(
        collection(db, path),
        (snap) => {
          const logs = snap.docs.map(d => ({ id: d.id, ...d.data() } as FirestoreAuditLog));
          logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          callback(logs);
        },
        (error) => {
          console.warn('Firestore audit_logs subscription notice:', error);
          callback([]);
        }
      );
      return unsubscribe;
    } catch (err) {
      console.warn('subscribeAuditLogs error:', err);
      return () => {};
    }
  }
};
