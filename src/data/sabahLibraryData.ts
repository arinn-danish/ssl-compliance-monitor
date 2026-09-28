import {
  StrategicPillar,
  LibraryProgram,
  ProgramEvaluation,
  ProgramKPI,
  ComplianceRisk,
  EvidenceDocument,
  GovernanceAlert,
  UserPersona
} from '../types';

export const USER_PERSONAS: UserPersona[] = [
  {
    id: 'user-001',
    name: 'Antonia Peter Sani',
    email: 'antoniapeter.sani@sabah.gov.my',
    role: 'COMPLIANCE_OFFICER',
    designation: 'Principal Public Sector Compliance & Internal Audit Officer',
    department: 'Governance, Quality Assurance & Enactment Compliance Unit',
    avatarInitials: 'AS'
  },
  {
    id: 'user-002',
    name: 'Datu Hj. Jamawi bin Jaafar',
    email: 'jamawi.jaafar@sabah.gov.my',
    role: 'ADMIN',
    designation: 'Director of Sabah State Library (State Executive Level)',
    department: 'Executive Directorate & Board Secretariat',
    avatarInitials: 'JJ'
  },
  {
    id: 'user-003',
    name: 'Grace Majanil',
    email: 'grace.majanil@sabah.gov.my',
    role: 'VIEWER',
    designation: 'Senior Curator & Heritage Archivist',
    department: 'Borneo Special Collection & Local History Division',
    avatarInitials: 'GM'
  },
  {
    id: 'user-004',
    name: 'Walter K. Sikil',
    email: 'walter.sikil@sabah.gov.my',
    role: 'VIEWER',
    designation: 'Regional Branch Supervisor (Interior Division - Keningau)',
    department: 'Branch Network & Rural Services Division',
    avatarInitials: 'WS'
  }
];

export const STRATEGIC_PILLARS: StrategicPillar[] = [
  {
    id: 'pillar-1',
    code: 'P-1',
    name: 'Community Outreach',
    enactmentSection: 'Sabah State Library Enactment 1988, Section 6(1)(a)',
    statutoryMandate: 'Duty to establish public library services, foster literacy clubs, and engage civic communities across urban and semi-rural sectors.',
    target2028: '1,200,000 active community interactions across 32 administrative districts.',
    leadUnit: 'Community Literacy & Civic Programs Department',
    color: 'emerald',
    budgetAllocatedMYR: 3500000
  },
  {
    id: 'pillar-2',
    code: 'P-2',
    name: 'Digital Inclusion',
    enactmentSection: 'Sabah State Library Enactment 1988, Section 6(1)(e) & Blueprint 2026',
    statutoryMandate: 'Provision of modern information technology, public broadband access points, and equitable digital competency training.',
    target2028: '95% public branches equipped with gigabit fiber, AI-guided search kiosks, and public assistive tech.',
    leadUnit: 'Digital Transformation & Library Systems Division',
    color: 'blue',
    budgetAllocatedMYR: 4800000
  },
  {
    id: 'pillar-3',
    code: 'P-3',
    name: 'Local History Collection Acquisition',
    enactmentSection: 'Sabah State Library Enactment 1988, Section 7(2) & Legal Deposit Act',
    statutoryMandate: 'Acquisition, statutory legal deposit enforcement, and custody of books, maps, treaties, and private records pertaining to Sabah.',
    target2028: 'Acquire and verify provenance for 15,000 primary North Borneo and post-Malaysia historical artifacts.',
    leadUnit: 'Borneo Special Collection & Legal Deposit Division',
    color: 'amber',
    budgetAllocatedMYR: 2900000
  },
  {
    id: 'pillar-4',
    code: 'P-4',
    name: 'Sabah Heritage Preservation',
    enactmentSection: 'Sabah State Library Enactment 1988, Section 8(1)',
    statutoryMandate: 'Conservation, physical deacidification, digital preservation, and oral indigenous narrative documentation for future generations.',
    target2028: '100% rare documents de-acidified; 4,000 hours of multi-ethnic oral heritage digitally transcribed.',
    leadUnit: 'Conservation Laboratory & Oral History Archive Unit',
    color: 'purple',
    budgetAllocatedMYR: 3100000
  },
  {
    id: 'pillar-5',
    code: 'P-5',
    name: 'Rural Literacy Expansion',
    enactmentSection: 'Sabah State Library Enactment 1988, Section 6(2)',
    statutoryMandate: 'Deployment of mobile fleet units, riverine book boats, and Desa Pintar community reading outposts in remote sub-districts.',
    target2028: '100% of remote settlements reachable within a 14-day rotational mobile circuit.',
    leadUnit: 'Rural & Interior Division Mobile Fleet Operations',
    color: 'teal',
    budgetAllocatedMYR: 4200000
  }
];

export const INITIAL_PROGRAMS: LibraryProgram[] = [
  {
    id: 'prog-001',
    code: 'SSL-LHC-01',
    name: 'Borneo Historical Collection Transfer & Provenance Audit',
    pillarId: 'pillar-3',
    pillarName: 'Local History Collection Acquisition',
    branch: 'Keningau & Sandakan Regional Archives',
    leadOfficer: 'Grace Majanil',
    statutoryReference: 'Enactment 1988 Sec. 7(2) (Statutory Custody of Historical Papers)',
    strategicObjective: 'Consolidate rare 1881-1963 Chartered Company and colonial district administration registers into secure humidity-controlled archives.',
    alignmentLevel: 'FULL',
    complianceScore: 92,
    riskSeverity: 'LOW',
    budgetMYR: 650000,
    budgetSpentMYR: 540000,
    kpiProgress: 88,
    status: 'ACTIVE',
    lastAuditedAt: '2026-08-14',
    nextAuditDue: '2026-11-14',
    evidenceCount: 14,
    unresolvedRisksCount: 0,
    description: 'Statutory verification and physical transfer of 3,420 historical cadastral and colonial district files from district registries to the State Archives vault.'
  },
  {
    id: 'prog-002',
    code: 'SSL-RLE-02',
    name: 'Rural Mobile Reading Units & Desa Pintar Fleet',
    pillarId: 'pillar-5',
    pillarName: 'Rural Literacy Expansion',
    branch: 'Ranau, Kota Marudu & Pitas Sub-districts',
    leadOfficer: 'Walter K. Sikil',
    statutoryReference: 'Enactment 1988 Sec. 6(2) (Extension of Library Facilities to Outlying Areas)',
    strategicObjective: 'Deploy four customized all-terrain 4WD mobile reading vehicles equipped with satellite Wi-Fi and bilingual solar tablets.',
    alignmentLevel: 'FULL',
    complianceScore: 89,
    riskSeverity: 'MEDIUM',
    budgetMYR: 980000,
    budgetSpentMYR: 790000,
    kpiProgress: 82,
    status: 'ACTIVE',
    lastAuditedAt: '2026-07-28',
    nextAuditDue: '2026-10-28',
    evidenceCount: 19,
    unresolvedRisksCount: 1,
    description: 'Bi-weekly mobile reading unit visits across 42 interior villages, providing primary school reading packs, internet access, and lending services.'
  },
  {
    id: 'prog-003',
    code: 'SSL-OUT-03',
    name: 'Night@theLibrary (Kota Kinabalu Central Hub)',
    pillarId: 'pillar-1',
    pillarName: 'Community Outreach',
    branch: 'HQ Tanjung Aru / Kota Kinabalu Central',
    leadOfficer: 'Roslina binti Mansur',
    statutoryReference: 'Enactment 1988 Sec. 6(1)(a) (Promotion of Reading Habit & Civic Culture)',
    strategicObjective: 'Extended operational hours (till 11:00 PM) featuring author symposiums, youth coding workshops, and heritage lecture series.',
    alignmentLevel: 'FULL',
    complianceScore: 94,
    riskSeverity: 'LOW',
    budgetMYR: 420000,
    budgetSpentMYR: 380000,
    kpiProgress: 95,
    status: 'ACTIVE',
    lastAuditedAt: '2026-08-02',
    nextAuditDue: '2026-12-02',
    evidenceCount: 22,
    unresolvedRisksCount: 0,
    description: 'Flagship community activation attracting young professionals, tertiary students, and local researchers with high evening patronage.'
  },
  {
    id: 'prog-004',
    code: 'SSL-DIG-04',
    name: 'Tamu Digital Literacy Kiosks & Rural Citizen Portal',
    pillarId: 'pillar-2',
    pillarName: 'Digital Inclusion',
    branch: 'Tambunan, Kudat & Nabawan Weekly Markets',
    leadOfficer: 'Faridah Tan',
    statutoryReference: 'Enactment 1988 Sec. 6(1)(e) (Information Technology Democratization)',
    strategicObjective: 'Set up pop-up interactive touchpoint kiosks during weekly traditional Tamu markets to teach e-government access and digital banking safety.',
    alignmentLevel: 'PARTIAL',
    complianceScore: 68,
    riskSeverity: 'HIGH',
    budgetMYR: 520000,
    budgetSpentMYR: 310000,
    kpiProgress: 54,
    status: 'UNDER_AUDIT',
    lastAuditedAt: '2026-08-20',
    nextAuditDue: '2026-09-30',
    evidenceCount: 7,
    unresolvedRisksCount: 2,
    description: 'Field compliance audit flagged recurring satellite telecommunication packet loss and delays in procuring solar batteries for remote Tamu kiosks.'
  },
  {
    id: 'prog-005',
    code: 'SSL-SHP-05',
    name: 'North Borneo Oral History Archive & Indigenous Dialects',
    pillarId: 'pillar-4',
    pillarName: 'Sabah Heritage Preservation',
    branch: 'Penampang, Tuaran & Tenom Cultural Nodes',
    leadOfficer: 'Alvinus Peter Lojikim',
    statutoryReference: 'Enactment 1988 Sec. 8(1) (Preservation of Cultural Heritage & Indigenous Records)',
    strategicObjective: 'Record, audio-video archive, and annotate oral folk narratives from 120 village elders across Kadazandusun, Murut, and Rungus communities.',
    alignmentLevel: 'FULL',
    complianceScore: 86,
    riskSeverity: 'MEDIUM',
    budgetMYR: 580000,
    budgetSpentMYR: 420000,
    kpiProgress: 76,
    status: 'ACTIVE',
    lastAuditedAt: '2026-07-15',
    nextAuditDue: '2026-10-15',
    evidenceCount: 16,
    unresolvedRisksCount: 1,
    description: 'High strategic value initiative capturing unwritten indigenous legal customs (Adat), folk music, and linguistic idiosyncrasies.'
  },
  {
    id: 'prog-006',
    code: 'SSL-SHP-06',
    name: 'British North Borneo Chartered Company Rare Gazette Conservation',
    pillarId: 'pillar-4',
    pillarName: 'Sabah Heritage Preservation',
    branch: 'Central Conservation Laboratory (KK)',
    leadOfficer: 'Dr. Zubaidah Rahman',
    statutoryReference: 'Enactment 1988 Sec. 8(1) (Conservation and Restoration of Rare Books)',
    strategicObjective: 'Deacidify, micro-repair, and ultra-high-resolution scan 1883-1941 official state gazettes and land registry maps.',
    alignmentLevel: 'PARTIAL',
    complianceScore: 71,
    riskSeverity: 'HIGH',
    budgetMYR: 850000,
    budgetSpentMYR: 610000,
    kpiProgress: 63,
    status: 'ACTIVE',
    lastAuditedAt: '2026-06-19',
    nextAuditDue: '2026-09-19',
    evidenceCount: 11,
    unresolvedRisksCount: 2,
    description: 'HVAC humidity fluctuation in Archive Room B poses risk to brittle century-old cellulose paper. Requires immediate climate sensor recalibration.'
  },
  {
    id: 'prog-007',
    code: 'SSL-LHC-07',
    name: 'Statutory Legal Deposit Enforcement & Publishing Registry',
    pillarId: 'pillar-3',
    pillarName: 'Local History Collection Acquisition',
    branch: 'State-wide Publisher Registration Network',
    leadOfficer: 'Antonia Peter Sani',
    statutoryReference: 'Enactment 1988 Section 12 (Mandatory Deposit of Printed Materials Published in Sabah)',
    strategicObjective: 'Audit private and institutional publishers state-wide to ensure 100% compliance with statutory deposit of two copies within 1 month of print.',
    alignmentLevel: 'NON_COMPLIANT',
    complianceScore: 48,
    riskSeverity: 'CRITICAL',
    budgetMYR: 290000,
    budgetSpentMYR: 110000,
    kpiProgress: 36,
    status: 'UNDER_AUDIT',
    lastAuditedAt: '2026-08-25',
    nextAuditDue: '2026-09-15',
    evidenceCount: 5,
    unresolvedRisksCount: 3,
    description: 'Critical gap: 42 local publishing entities and commercial printers failed to submit required legal deposit copies, violating Section 12 statutory obligations.'
  },
  {
    id: 'prog-008',
    code: 'SSL-DIG-08',
    name: 'Assistive Braille & Audio E-Book Hub for Visually Impaired',
    pillarId: 'pillar-2',
    pillarName: 'Digital Inclusion',
    branch: 'Tawau, Sandakan & Kota Kinabalu Hubs',
    leadOfficer: 'Faridah Tan',
    statutoryReference: 'Enactment 1988 Sec. 6(1)(c) (Inclusive Access for Special Needs Persons)',
    strategicObjective: 'Implement Screen Readers, tactile refreshable braille terminals, and 1,500 curated local audiobooks in Bahasa Melayu and English.',
    alignmentLevel: 'FULL',
    complianceScore: 91,
    riskSeverity: 'LOW',
    budgetMYR: 440000,
    budgetSpentMYR: 410000,
    kpiProgress: 92,
    status: 'ACTIVE',
    lastAuditedAt: '2026-07-10',
    nextAuditDue: '2026-11-10',
    evidenceCount: 15,
    unresolvedRisksCount: 0,
    description: 'Commended in ministerial quarterly review for exceeding accessibility standards and empowering special education pupils across East Coast.'
  },
  {
    id: 'prog-009',
    code: 'SSL-RLE-09',
    name: 'Kinabatangan Riverine Library Boat Outreach',
    pillarId: 'pillar-5',
    pillarName: 'Rural Literacy Expansion',
    branch: 'Kinabatangan & Sukau River Settlements',
    leadOfficer: 'Walter K. Sikil',
    statutoryReference: 'Enactment 1988 Sec. 6(2) (Rural Navigable Reaches Literacy)',
    strategicObjective: 'Provide floating book service and portable solar-powered e-readers to 18 riparian villages accessible only via water routes.',
    alignmentLevel: 'PARTIAL',
    complianceScore: 74,
    riskSeverity: 'MEDIUM',
    budgetMYR: 380000,
    budgetSpentMYR: 290000,
    kpiProgress: 69,
    status: 'ACTIVE',
    lastAuditedAt: '2026-08-05',
    nextAuditDue: '2026-11-05',
    evidenceCount: 8,
    unresolvedRisksCount: 1,
    description: 'Service active, but fuel logistics during monsoon floods require revised safety protocols and enhanced waterproof cargo containers.'
  }
];

export const INITIAL_EVALUATIONS: ProgramEvaluation[] = [
  {
    id: 'eval-001',
    programId: 'prog-007',
    programName: 'Statutory Legal Deposit Enforcement & Publishing Registry',
    evaluatorId: 'user-001',
    evaluatorName: 'Antonia Peter Sani',
    evaluatorRole: 'Principal Public Sector Compliance Officer',
    evaluationDate: '2026-08-25',
    scores: {
      statutoryEnactment: 10, // out of 25
      strategicRelevance: 16, // out of 25
      executionIntegrity: 11, // out of 25
      communityImpact: 11     // out of 25
    },
    totalScore: 48,
    alignmentLevel: 'NON_COMPLIANT',
    statutoryEnactmentClause: 'Section 12, Sabah State Library Enactment 1988: "Delivery of copies of books published in the State to the Director."',
    gapsIdentified: [
      'No formal inspection notices served to 42 identified default commercial presses in Inanam and Penampang.',
      'Absence of automated tracking integration between Ministry of Communications registry and State Library acquisition index.',
      'Late deposit penalty enforcement mechanism under Section 12(3) has never been invoked.'
    ],
    auditorNotes: 'High statutory risk. The enactment obligates publishers to supply 2 copies within 30 days. Currently, approximately 44% of state-published titles go unarchived. Mandatory formal notice and legal advisory required.',
    status: 'SUBMITTED',
    correctiveAction: {
      id: 'cap-001',
      actionRequired: 'Issue statutory compliance notice Form SSL-ENACT-12 to all 42 identified non-compliant commercial printers with a 21-day cure period.',
      assignedOfficer: 'Antonia Peter Sani / State Legal Advisor',
      dueDate: '2026-09-20',
      status: 'IN_PROGRESS',
      escalationLevel: 'DIRECTOR_ESCALATION'
    }
  },
  {
    id: 'eval-002',
    programId: 'prog-004',
    programName: 'Tamu Digital Literacy Kiosks & Rural Citizen Portal',
    evaluatorId: 'user-001',
    evaluatorName: 'Antonia Peter Sani',
    evaluatorRole: 'Principal Public Sector Compliance Officer',
    evaluationDate: '2026-08-20',
    scores: {
      statutoryEnactment: 19,
      strategicRelevance: 21,
      executionIntegrity: 13,
      communityImpact: 15
    },
    totalScore: 68,
    alignmentLevel: 'PARTIAL',
    statutoryEnactmentClause: 'Section 6(1)(e): "Provision of public IT infrastructure and equitable digital capability."',
    gapsIdentified: [
      'Starlink / 4G cellular signal attenuation in Tambunan interior valley causing 38% kiosk downtime during peak market hours.',
      'Battery storage degradation on mobile solar carts.',
      'Only 3 out of 8 field instructors are fluent in local Dusun dialects.'
    ],
    auditorNotes: 'Strong community enthusiasm, but equipment reliability is impairing KPI realization. Technical vendor must be held to SLA contract terms.',
    status: 'APPROVED',
    correctiveAction: {
      id: 'cap-002',
      actionRequired: 'Replace lithium iron phosphate batteries and execute SLA penalty clause against telecommunications satellite service provider.',
      assignedOfficer: 'Faridah Tan',
      dueDate: '2026-10-15',
      status: 'PENDING',
      escalationLevel: 'INTERNAL'
    }
  },
  {
    id: 'eval-003',
    programId: 'prog-001',
    programName: 'Borneo Historical Collection Transfer & Provenance Audit',
    evaluatorId: 'user-001',
    evaluatorName: 'Antonia Peter Sani',
    evaluatorRole: 'Principal Public Sector Compliance Officer',
    evaluationDate: '2026-08-14',
    scores: {
      statutoryEnactment: 24,
      strategicRelevance: 23,
      executionIntegrity: 22,
      communityImpact: 23
    },
    totalScore: 92,
    alignmentLevel: 'FULL',
    statutoryEnactmentClause: 'Section 7(2): "Custody and physical custody standards of historical manuscripts."',
    gapsIdentified: [
      'Minor gap: 14 boxes of Sandakan land deeds lack individual acid-free Mylar sleeves.'
    ],
    auditorNotes: 'Exemplary provenance documentation and digital indexing. Custody chain verified with signed registry handover certificates.',
    status: 'APPROVED'
  }
];

export const INITIAL_KPIS: ProgramKPI[] = [
  {
    id: 'kpi-001',
    programId: 'prog-001',
    programName: 'Borneo Historical Collection Transfer',
    pillarId: 'pillar-3',
    title: 'Primary Historical Records Cataloged with Verified Provenance',
    baseline: 1200,
    target2026: 3500,
    target2028: 5000,
    currentValue: 3080,
    unit: 'records',
    status: 'ON_TRACK',
    reportingQuarter: 'Q3 2026'
  },
  {
    id: 'kpi-002',
    programId: 'prog-002',
    programName: 'Rural Mobile Reading Units & Desa Pintar Fleet',
    pillarId: 'pillar-5',
    title: 'Rural Outpost Population Served within 14-day Cycle',
    baseline: 18000,
    target2026: 45000,
    target2028: 65000,
    currentValue: 36900,
    unit: 'citizens',
    status: 'ON_TRACK',
    reportingQuarter: 'Q3 2026'
  },
  {
    id: 'kpi-003',
    programId: 'prog-004',
    programName: 'Tamu Digital Literacy Kiosks',
    pillarId: 'pillar-2',
    title: 'Rural Citizens Completing Digital Government Competency Modules',
    baseline: 400,
    target2026: 2500,
    target2028: 6000,
    currentValue: 1350,
    unit: 'citizens certified',
    status: 'LAGGING',
    reportingQuarter: 'Q3 2026'
  },
  {
    id: 'kpi-004',
    programId: 'prog-007',
    programName: 'Statutory Legal Deposit Enforcement',
    pillarId: 'pillar-3',
    title: 'Published Works Deposited within 30 Days of Publication',
    baseline: 35,
    target2026: 85,
    target2028: 98,
    currentValue: 36,
    unit: '% compliance rate',
    status: 'LAGGING',
    reportingQuarter: 'Q3 2026'
  },
  {
    id: 'kpi-005',
    programId: 'prog-005',
    programName: 'North Borneo Oral History Archive',
    pillarId: 'pillar-4',
    title: 'Hours of Indigenous Cultural Testimony Recorded & Transcribed',
    baseline: 80,
    target2026: 400,
    target2028: 1200,
    currentValue: 304,
    unit: 'hours transcribed',
    status: 'ON_TRACK',
    reportingQuarter: 'Q3 2026'
  },
  {
    id: 'kpi-006',
    programId: 'prog-006',
    programName: 'British North Borneo Chartered Company Gazette Conservation',
    pillarId: 'pillar-4',
    title: 'Fragile Folio Sheets Deacidified & Encapsulated',
    baseline: 500,
    target2026: 2200,
    target2028: 4500,
    currentValue: 1386,
    unit: 'sheets',
    status: 'AT_RISK',
    reportingQuarter: 'Q3 2026'
  }
];

export const INITIAL_RISKS: ComplianceRisk[] = [
  {
    id: 'risk-001',
    programId: 'prog-007',
    programName: 'Statutory Legal Deposit Enforcement & Publishing Registry',
    pillarId: 'pillar-3',
    title: 'Systemic Non-Delivery of State Legal Deposit Publications',
    category: 'STATUTORY_NON_COMPLIANCE',
    likelihood: 5,
    impact: 5,
    severity: 'CRITICAL',
    mitigationStrategy: 'Issue statutory demand letters under Section 12; establish inter-agency data link with State Printing Department (Jabatan Cetak Kerajaan).',
    owner: 'Antonia Peter Sani',
    status: 'OPEN',
    identifiedDate: '2026-08-25'
  },
  {
    id: 'risk-002',
    programId: 'prog-006',
    programName: 'British North Borneo Chartered Company Gazette Conservation',
    pillarId: 'pillar-4',
    title: 'Thermal & Relative Humidity Excursions in Archive Vault B',
    category: 'PRESERVATION_LOSS',
    likelihood: 4,
    impact: 5,
    severity: 'CRITICAL',
    mitigationStrategy: 'Immediate procurement of redundant dual-compressor precision environmental control unit; emergency relocation of pre-1900 folios to Vault A.',
    owner: 'Dr. Zubaidah Rahman',
    status: 'IN_PROGRESS',
    identifiedDate: '2026-07-04'
  },
  {
    id: 'risk-003',
    programId: 'prog-004',
    programName: 'Tamu Digital Literacy Kiosks & Rural Citizen Portal',
    pillarId: 'pillar-2',
    title: 'Telecommunication Connectivity Dropouts in Interior Highlands',
    category: 'INFRASTRUCTURE',
    likelihood: 4,
    impact: 4,
    severity: 'HIGH',
    mitigationStrategy: 'Deploy low-earth-orbit satellite receiver units with automatic LTE dual-SIM failover.',
    owner: 'Faridah Tan',
    status: 'OPEN',
    identifiedDate: '2026-08-10'
  },
  {
    id: 'risk-004',
    programId: 'prog-002',
    programName: 'Rural Mobile Reading Units & Desa Pintar Fleet',
    pillarId: 'pillar-5',
    title: 'Severe Wet Season Road Inaccessibility in Pitas & Ranau',
    category: 'RESOURCE_DEFICIT',
    likelihood: 4,
    impact: 3,
    severity: 'MEDIUM',
    mitigationStrategy: 'Pre-position seasonal reading packs in village community halls (Balai Raya) prior to northeast monsoon onset.',
    owner: 'Walter K. Sikil',
    status: 'IN_PROGRESS',
    identifiedDate: '2026-06-12'
  },
  {
    id: 'risk-005',
    programId: 'prog-005',
    programName: 'North Borneo Oral History Archive & Indigenous Dialects',
    pillarId: 'pillar-4',
    title: 'Loss of Elder Knowledge Bearers Due to Aging Demographic',
    category: 'PRESERVATION_LOSS',
    likelihood: 3,
    impact: 4,
    severity: 'MEDIUM',
    mitigationStrategy: 'Accelerate fieldwork schedule and prioritize elders aged 75+ in remote sub-districts with emergency oral recording teams.',
    owner: 'Alvinus Peter Lojikim',
    status: 'IN_PROGRESS',
    identifiedDate: '2026-05-18'
  },
  {
    id: 'risk-006',
    programId: 'prog-009',
    programName: 'Kinabatangan Riverine Library Boat Outreach',
    pillarId: 'pillar-5',
    title: 'Watercraft Engine Failure and Fluvial Hazard Risks',
    category: 'INFRASTRUCTURE',
    likelihood: 2,
    impact: 4,
    severity: 'MEDIUM',
    mitigationStrategy: 'Mandatory twin-engine outboard maintenance every 50 operating hours; certified maritime life vest protocol.',
    owner: 'Walter K. Sikil',
    status: 'MITIGATED',
    identifiedDate: '2026-04-22'
  }
];

export const INITIAL_EVIDENCE_DOCS: EvidenceDocument[] = [
  {
    id: 'ev-001',
    programId: 'prog-001',
    programName: 'Borneo Historical Collection Transfer',
    title: 'MOU with National Archives of Malaysia (Sabah Branch) for Joint Custody',
    documentType: 'MOU',
    fileName: 'MOU_SSL_ArkibNegara_2026_Executed.pdf',
    fileSize: '3.4 MB',
    uploadedBy: 'Grace Majanil',
    uploadedAt: '2026-08-14',
    verifiedStatus: 'VERIFIED',
    provenanceDetails: 'Signed by State Secretary of Sabah and Director-General of National Archives. Establishes legal transfer protocols for 3,420 cadastral registers.',
    fileUrl: '/documents/MOU_SSL_ArkibNegara_2026_Executed.pdf',
    tags: ['MOU', 'Legal Custody', 'Enactment Sec 7(2)', 'Historical Archives']
  },
  {
    id: 'ev-002',
    programId: 'prog-007',
    programName: 'Statutory Legal Deposit Enforcement & Publishing Registry',
    title: 'Statutory Non-Compliance Notice & Audit Schedule (Form SSL-ENACT-12)',
    documentType: 'INSPECTION_REPORT',
    fileName: 'Legal_Deposit_Audit_Inspection_Report_Q3_2026.pdf',
    fileSize: '2.1 MB',
    uploadedBy: 'Antonia Peter Sani',
    uploadedAt: '2026-08-26',
    verifiedStatus: 'FLAGGED',
    provenanceDetails: 'Lists 42 default publishers in West Coast and Interior divisions. Formal documentation for Board escalated enforcement.',
    fileUrl: '/documents/Legal_Deposit_Audit_Inspection_Report_Q3_2026.pdf',
    tags: ['Enactment Violation', 'Section 12', 'Audit Evidence', 'Statutory']
  },
  {
    id: 'ev-003',
    programId: 'prog-001',
    programName: 'Borneo Historical Collection Transfer',
    title: 'British North Borneo Chartered Company Land Deeds Provenance Certificate',
    documentType: 'PROVENANCE_RECORD',
    fileName: 'Provenance_Certificate_BNBC_Keningau_Deeds_1892.pdf',
    fileSize: '4.8 MB',
    uploadedBy: 'Grace Majanil',
    uploadedAt: '2026-08-15',
    verifiedStatus: 'VERIFIED',
    provenanceDetails: 'Chain of custody verified from Resident Office Sandakan (1946) to Keningau District Vault (1965) to Sabah State Library (2026).',
    fileUrl: '/documents/Provenance_Certificate_BNBC_Keningau_Deeds_1892.pdf',
    tags: ['Provenance', 'Colonial Archive', 'Authentication']
  },
  {
    id: 'ev-004',
    programId: 'prog-006',
    programName: 'British North Borneo Chartered Company Rare Gazette Conservation',
    title: 'Archive Vault B Hygrothermograph Environmental Calibration Log',
    documentType: 'INSPECTION_REPORT',
    fileName: 'HVAC_VaultB_Humidity_Excursion_Log_August2026.pdf',
    fileSize: '1.2 MB',
    uploadedBy: 'Dr. Zubaidah Rahman',
    uploadedAt: '2026-08-18',
    verifiedStatus: 'FLAGGED',
    provenanceDetails: 'Continuous IoT sensor record showing RH exceeding 68% between Aug 12-16, 2026. Evidence supporting emergency HVAC overhaul.',
    fileUrl: '/documents/HVAC_VaultB_Humidity_Excursion_Log_August2026.pdf',
    tags: ['Conservation', 'Environmental Audit', 'HVAC Failure']
  },
  {
    id: 'ev-005',
    programId: 'prog-002',
    programName: 'Rural Mobile Reading Units & Desa Pintar Fleet',
    title: 'Desa Pintar Vehicle Telematics & Village Patronage Logsheet',
    documentType: 'AUDIT_TRAIL',
    fileName: 'MobileUnit_Ranau_Pitas_FieldAudit_Jul2026.pdf',
    fileSize: '1.9 MB',
    uploadedBy: 'Walter K. Sikil',
    uploadedAt: '2026-07-29',
    verifiedStatus: 'VERIFIED',
    provenanceDetails: 'GPS logged field routes with signed verification receipts from 24 Village Development Committees (JKKK).',
    fileUrl: '/documents/MobileUnit_Ranau_Pitas_FieldAudit_Jul2026.pdf',
    tags: ['Rural Literacy', 'Field Audit', 'JKKK Receipts']
  },
  {
    id: 'ev-006',
    programId: 'prog-008',
    programName: 'Assistive Braille & Audio E-Book Hub for Visually Impaired',
    title: 'Sabah Blind Association Inclusive Accessibility Compliance Endorsement',
    documentType: 'STATUTORY_CERTIFICATE',
    fileName: 'Accessibility_Certification_SabahBlindAssoc_2026.pdf',
    fileSize: '890 KB',
    uploadedBy: 'Faridah Tan',
    uploadedAt: '2026-07-12',
    verifiedStatus: 'VERIFIED',
    provenanceDetails: 'Independent third-party accreditation confirming adherence to Marrakesh Treaty and Malaysian Persons with Disabilities Act 2008 standards.',
    fileUrl: '/documents/Accessibility_Certification_SabahBlindAssoc_2026.pdf',
    tags: ['Accreditation', 'Disability Inclusion', 'Marrakesh Treaty']
  }
];

export const INITIAL_GOVERNANCE_ALERTS: GovernanceAlert[] = [
  {
    id: 'alt-001',
    type: 'ENACTMENT_GAP',
    severity: 'CRITICAL',
    title: 'Statutory Breach: Section 12 Legal Deposit Default',
    message: '42 state publishers have defaulted past the 30-day legal deposit deadline. Formal sanction letter recommended to avoid irreparable cultural loss.',
    programId: 'prog-007',
    programName: 'Statutory Legal Deposit Enforcement & Publishing Registry',
    timestamp: '2026-08-25 10:15',
    acknowledged: false,
    actionUrl: 'evaluations'
  },
  {
    id: 'alt-002',
    type: 'CRITICAL_RISK',
    severity: 'CRITICAL',
    title: 'Environmental Hazard: Archive Vault B RH Exceeded 68%',
    message: 'Humidity sensor alert in Conservation Lab. Temperature and mold risk to pre-1900 Chartered Company gazettes. Emergency technician dispatched.',
    programId: 'prog-006',
    programName: 'British North Borneo Chartered Company Gazette Conservation',
    timestamp: '2026-08-18 14:40',
    acknowledged: false,
    actionUrl: 'risks'
  },
  {
    id: 'alt-003',
    type: 'LAGGING_KPI',
    severity: 'HIGH',
    title: 'Lagging Strategic KPI: Tamu Digital Kiosks (-32% vs Target)',
    message: 'Citizen certification volume is behind target by 1,150 participants due to satellite connectivity dropouts in Tambunan district.',
    programId: 'prog-004',
    programName: 'Tamu Digital Literacy Kiosks & Rural Citizen Portal',
    timestamp: '2026-08-20 09:30',
    acknowledged: false,
    actionUrl: 'kpis'
  },
  {
    id: 'alt-004',
    type: 'AUDIT_DEADLINE',
    severity: 'MEDIUM',
    title: 'Upcoming Quarterly Statutory Audit Deadline (Q3 2026)',
    message: 'Pillar 2 (Digital Inclusion) and Pillar 4 (Heritage Preservation) mid-term evaluations are due for Director Executive sign-off in 14 days.',
    timestamp: '2026-08-30 08:00',
    acknowledged: true,
    actionUrl: 'evaluations'
  }
];

export const PRISMA_SCHEMA_CODE = `// ========================================================================
// SABAH STATE LIBRARY COMPLIANCE & STRATEGIC MONITORING DATABASE SCHEMA
// PostgreSQL / Prisma ORM
// Enactment Alignment: Sabah State Library Enactment 1988 & Strategic Plan 2026-2028
// ========================================================================

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  ADMIN               // State Library Director & Executive Board
  COMPLIANCE_OFFICER  // Internal Auditors & Statutory Enactment Monitors
  VIEWER              // Branch Managers, Curators, Department Heads
}

enum AlignmentLevel {
  FULL
  PARTIAL
  NON_COMPLIANT
}

enum RiskSeverity {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum EvaluationStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REVISE_REQUIRED
}

enum MetricStatus {
  ON_TRACK
  AT_RISK
  LAGGING
}

enum DocumentType {
  MOU
  INSPECTION_REPORT
  PROVENANCE_RECORD
  STATUTORY_CERTIFICATE
  AUDIT_TRAIL
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  name            String
  role            Role           @default(VIEWER)
  designation     String
  department      String
  isActive        Boolean        @default(true)
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  evaluations     Evaluation[]   @relation("Evaluator")
  uploadedDocs    EvidenceDocument[]
  assignedActions CorrectiveAction[]
  riskOwner       Risk[]
}

model Pillar {
  id                  String       @id @default(uuid())
  code                String       @unique // e.g. P-1, P-2
  name                String       // e.g. Community Outreach, Digital Inclusion
  enactmentSection    String       // e.g. Section 6(1)(a)
  statutoryMandate    String       @db.Text
  target2028          String
  leadUnit            String
  budgetAllocatedMYR  Decimal      @db.Decimal(12, 2)
  createdAt           DateTime     @default(now())
  updatedAt           DateTime     @updatedAt

  programs            Program[]
  kpis                KPI[]
}

model Program {
  id                  String         @id @default(uuid())
  code                String         @unique // e.g. SSL-LHC-01
  name                String
  pillarId            String
  pillar              Pillar         @relation(fields: [pillarId], references: [id])
  branch              String
  leadOfficer         String
  statutoryReference  String
  strategicObjective  String         @db.Text
  alignmentLevel      AlignmentLevel @default(PARTIAL)
  complianceScore     Int            @default(0) // 0-100
  riskSeverity        RiskSeverity   @default(LOW)
  budgetMYR           Decimal        @db.Decimal(12, 2)
  budgetSpentMYR      Decimal        @db.Decimal(12, 2) @default(0)
  kpiProgress         Int            @default(0) // 0-100%
  status              String         @default("ACTIVE")
  lastAuditedAt       DateTime?
  nextAuditDue        DateTime?
  description         String         @db.Text
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  evaluations         Evaluation[]
  kpis                KPI[]
  risks               Risk[]
  evidenceDocs        EvidenceDocument[]
  alerts              GovernanceAlert[]

  @@index([pillarId])
  @@index([alignmentLevel])
  @@index([riskSeverity])
}

model Evaluation {
  id                       String           @id @default(uuid())
  programId                String
  program                  Program          @relation(fields: [programId], references: [id], onDelete: Cascade)
  evaluatorId              String
  evaluator                User             @relation("Evaluator", fields: [evaluatorId], references: [id])
  evaluationDate           DateTime         @default(now())
  statutoryEnactmentScore  Int              // 0-25
  strategicRelevanceScore  Int              // 0-25
  executionIntegrityScore  Int              // 0-25
  communityImpactScore     Int              // 0-25
  totalScore               Int              // 0-100
  alignmentLevel           AlignmentLevel
  statutoryClause          String           @db.Text
  gapsIdentified           String[]
  auditorNotes             String           @db.Text
  status                   EvaluationStatus @default(SUBMITTED)
  createdAt                DateTime         @default(now())
  updatedAt                DateTime         @updatedAt

  correctiveAction         CorrectiveAction?

  @@index([programId])
  @@index([evaluatorId])
}

model CorrectiveAction {
  id                String       @id @default(uuid())
  evaluationId      String       @unique
  evaluation        Evaluation   @relation(fields: [evaluationId], references: [id], onDelete: Cascade)
  actionRequired    String       @db.Text
  assignedOfficerId String
  assignedOfficer   User         @relation(fields: [assignedOfficerId], references: [id])
  dueDate           DateTime
  status            String       @default("PENDING") // PENDING, IN_PROGRESS, COMPLETED
  escalationLevel   String       @default("INTERNAL")
  createdAt         DateTime     @default(now())
  updatedAt         DateTime     @updatedAt
}

model KPI {
  id                String        @id @default(uuid())
  programId         String
  program           Program       @relation(fields: [programId], references: [id], onDelete: Cascade)
  pillarId          String
  pillar            Pillar        @relation(fields: [pillarId], references: [id])
  title             String
  baseline          Float
  target2026        Float
  target2028        Float
  currentValue      Float
  unit              String
  status            MetricStatus  @default(ON_TRACK)
  reportingQuarter  String
  updatedAt         DateTime      @updatedAt

  @@index([programId])
  @@index([pillarId])
}

model Risk {
  id                 String       @id @default(uuid())
  programId          String
  program            Program      @relation(fields: [programId], references: [id], onDelete: Cascade)
  title              String
  category           String       // STATUTORY_NON_COMPLIANCE, PRESERVATION_LOSS, etc.
  likelihood         Int          // 1-5
  impact             Int          // 1-5
  severity           RiskSeverity
  mitigationStrategy String       @db.Text
  ownerId            String
  owner              User         @relation(fields: [ownerId], references: [id])
  status             String       @default("OPEN")
  identifiedDate     DateTime     @default(now())
  updatedAt          DateTime     @updatedAt

  @@index([programId])
  @@index([severity])
}

model EvidenceDocument {
  id                 String       @id @default(uuid())
  programId          String
  program            Program      @relation(fields: [programId], references: [id], onDelete: Cascade)
  title              String
  documentType       DocumentType
  fileName           String
  fileSize           String
  fileUrl            String
  uploadedById       String
  uploadedBy         User         @relation(fields: [uploadedById], references: [id])
  verifiedStatus     String       @default("PENDING") // VERIFIED, PENDING, FLAGGED
  provenanceDetails  String?      @db.Text
  tags               String[]
  createdAt          DateTime     @default(now())

  @@index([programId])
}

model GovernanceAlert {
  id            String       @id @default(uuid())
  type          String       // LAGGING_KPI, AUDIT_DEADLINE, CRITICAL_RISK, ENACTMENT_GAP
  severity      RiskSeverity
  title         String
  message       String       @db.Text
  programId     String?
  program       Program?     @relation(fields: [programId], references: [id], onDelete: SetNull)
  timestamp     DateTime     @default(now())
  acknowledged  Boolean      @default(false)
  actionUrl     String?

  @@index([acknowledged])
  @@index([severity])
}
`;
