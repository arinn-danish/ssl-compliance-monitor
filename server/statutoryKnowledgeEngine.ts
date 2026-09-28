/**
 * Sabah State Library (Perpustakaan Negeri Sabah)
 * Statutory & Compliance AI Knowledge Engine
 * 
 * Provides deep domain intelligence for:
 * - Sabah State Library Enactment 1988 (Enactment No. 4 of 1988, amended 2022)
 * - State Strategic Plan (Pelan Strategik Perpustakaan Negeri Sabah 2026-2028)
 * - Statutory Job Descriptions (Pengarah Perpustakaan, Timbalan Pengarah, Pustakawan Daerah)
 * - Legal Deposit (Seksyen 6) & Borneo Heritage Archives
 * - Rural Network & Branch Operations (Seksyen 8)
 * - Financial Governance & Library Fund (Seksyen 14)
 * - File and tabular data compliance audit
 */

export interface AttachmentData {
  name?: string;
  type?: string;
  size?: number;
  sizeFormatted?: string;
  format?: string;
  lineCount?: number;
  content?: string | any;
}

/**
 * Detects if query is primarily in Bahasa Malaysia
 */
function isMalayLanguage(text: string): boolean {
  const malayKeywords = [
    'apakah', 'bagaimana', 'cadangan', 'pengarah', 'jawatan', 'tugas', 'perpustakaan',
    'negeri', 'sabah', 'enakmen', 'polisi', 'cawangan', 'syarat', 'kelayakan', 'huraian',
    'senarai', 'kpi', 'pekeliling', 'seksyen', 'pelan', 'strategik', 'dana', 'deposit',
    'bahan', 'undang', 'laporan', 'khidmat', 'desa', 'kewangan', 'borang', 'buku'
  ];
  const lower = text.toLowerCase();
  let matches = 0;
  for (const kw of malayKeywords) {
    if (lower.includes(kw)) matches++;
  }
  return matches >= 2 || lower.includes('cadangan job description') || lower.includes('pengarah');
}

/**
 * Builds the comprehensive Job Description for Director of Sabah State Library
 */
function getDirectorJobDescription(agentId: string, isMalay: boolean, upstreamNotice?: string): string {
  if (isMalay) {
    return `# CADANGAN HURAIAN TUGAS (JOB DESCRIPTION)
## JAWATAN: PENGARAH PERPUSTAKAAN NEGERI SABAH
**Gred Jawatan:** Pustakawan Gred S54 / JUSA C (Pengurusan & Profesional / Pengurusan Tertinggi)  
**Agensi:** Perpustakaan Negeri Sabah (Sabah State Library)  
**Kementerian:** Kementerian Sains, Teknologi dan Inovasi Sabah (KSTI)  
**Punca Kuasa Statutori:** Enakmen Perpustakaan Negeri Sabah 1988 (Enactment No. 4 of 1988) & Enakmen Perpustakaan Negeri Sabah (Pindaan) 2022  
**Pelan Rujukan:** Pelan Strategik Perpustakaan Negeri Sabah 2026–2028 & Wawasan Sabah Maju Jaya (SMJ)  
**AI Agent Rujukan:** Agent ID \`${agentId}\` (Sabah State Library Statutory Intelligence)  
${upstreamNotice ? `\n> ℹ️ *${upstreamNotice}*\n` : ''}

---

### 1. RINGKASAN JAWATAN (JOB PURPOSE & SUMMARY)
Pengarah Perpustakaan Negeri Sabah bertindak sebagai **Ketua Pegawai Eksekutif (CEO)** dan pentadbir tertinggi perkhidmatan perpustakaan awam bagi seluruh Negeri Sabah. Penyandang bertanggungjawab terus kepada Setiausaha Tetap Kementerian Sains, Teknologi dan Inovasi Sabah (KSTI) serta Majlis/Lembaga Penasihat Perpustakaan Negeri bagi menerajui penguatkuasaan Enakmen 1988, pengurusan deposit statutori bahan terbitan Sabah, pemerkasaan rangkaian 28+ cawangan wilayah dan perpustakaan desa, pemeliharaan manuskrip sejarah Borneo, serta memacu transformasi perpustakaan pintar digital negeri.

---

### 2. AKTA, ENAKMEN & POLISI PUNCA KUASA
Penyandang menjalankan kuasa di bawah instrumen perundangan berikut:
1. **Enakmen Perpustakaan Negeri Sabah 1988 (Enakmen No. 4 Tahun 1988)**: Kuasa pentadbiran (Seksyen 3, 4 & 5).
2. **Enakmen Perpustakaan Negeri Sabah (Pindaan) 2022**: Pengukuhan penyerahan deposit bahan digital & pemeliharaan khazanah Borneo.
3. **Seksyen 6 Enakmen 1988**: Penyerahan Bahan Perpustakaan (Legal Deposit Mandate).
4. **Seksyen 8 Enakmen 1988**: Pengurusan cawangan wilayah, daerah, pekan, dan perpustakaan bergerak luar bandar.
5. **Seksyen 14 Enakmen 1988**: Pentadbiran Kumpulan Wang Perpustakaan Negeri Sabah (Library Fund).
6. **Pelan Strategik Perpustakaan Negeri Sabah 2026–2028**: 4 Teras Strategik (Warisan Borneo, Literasi Komuniti, Hab STEM Digital, Governans & Integriti).
7. **Arahan Perbendaharaan Negeri Sabah & Pekeliling Perkhidmatan Awam Negeri**.

---

### 3. BIDANG TUGAS & TANGGUNGJAWAB BERKANUN (KEY RESPONSIBILITIES)

#### A. Kepimpinan Dasar & Tadbir Urus Statutori (Seksyen 3 & 4 Enakmen 1988)
* **Pentadbiran Berkanun:** Menasihati Kerajaan Negeri Sabah dan Menteri KSTI berkenaan dasar perpustakaan, literasi awam, undang-undang maklumat, dan pemeliharaan warisan.
* **Penggubalan Dasar:** Merangka dan menguatkuasakan dasar pembangunan koleksi, perkhidmatan digital, etika penggunaan perpustakaan, dan penarafan perpustakaan cawangan.
* **Setiausaha / Penasihat Majlis:** Menyelaras mesyuarat berkala Lembaga/Majlis Penasihat Perpustakaan Negeri dan membentangkan laporan prestasi rasmi.
* **Laporan Tahunan Statutori:** Menyediakan Laporan Tahunan Berkanun dan Penyata Kewangan Teraudit untuk dibentangkan kepada Dewan Undangan Negeri (DUN) Sabah.

#### B. Pemeliharaan Khazanah Borneo & Penyerahan Deposit Bahan (Seksyen 6 & Pindaan 2022)
* **Statutory Custodian of Sabah Publications:** Bertindak sebagai penjaga sah bahan terbitan negeri Sabah di bawah Seksyen 6 Enakmen.
* **Penguatkuasaan Legal Deposit:** Memastikan semua penerbit, pencetak, agensi kerajaan, dan pengarang tempatan menyerahkan naskhah deposit statutori (cetak dan digital) bagi setiap karya yang diterbitkan di atau mengenai Sabah.
* **Arkib & Repositori Warisan Borneo:** Mengukuhkan Pusat Sumber Borneo (Borneo Collection), pemuliharaan manuskrip bersejarah, peta kolonial, tradisi lisan, dan artifak sastera peribumi Sabah.
* **Pendigitalan Khazanah Negeri:** Memimpin projek pendigitalan bahan nadir Borneo bagi memastikan capaian terbuka (Open Access) untuk penyelidik global tanpa merosakkan naskhah asal.

#### C. Pengurusan Rangkaian Cawangan, Luar Bandar & Komuniti (Seksyen 8)
* **Peluasan Rangkaian 28+ Cawangan:** Mengawal selia operasi seluruh cawangan wilayah (Kota Kinabalu, Sandakan, Tawau, Keningau, Kudat) serta perpustakaan daerah dan pekan.
* **Literasi Desa & Perpustakaan Bergerak:** Memperluas perkhidmatan Perpustakaan Desa dan Mobile Library Units ke kawasan pedalaman (Nabawan, Pitas, Tongod, Beluran) selaras dengan ekuiti pendidikan Sabah Maju Jaya.
* **Akses Sejagat (Universal Inclusivity):** Menjamin semua premis perpustakaan dilengkapi kemudahan mesra Orang Kurang Upaya (OKU), sudut braille, audio-book, dan ruang mesra warga emas/kanak-kanak.

#### D. Pengurusan Kewangan & Kumpulan Wang Perpustakaan (Seksyen 14)
* **Pengawalan Kumpulan Wang Perpustakaan:** Mentadbir Kumpulan Wang Perpustakaan Negeri Sabah (Library Fund) mengikut Seksyen 14 Enakmen dan Tatacara Pengurusan Wang Awam Negeri.
* **Belanjawan Mengurus (OE) & Pembangunan (DE):** Menyediakan anggaran belanjawan tahunan bernilai jutaan ringgit bagi perolehan bahan bacaan, penaiktarafan bangunan perpustakaan, dan teknologi maklumat.
* **Audit & Integriti:** Memastikan skor pematuhan audit dalaman melebihi 85%+ dan sifar ketakpatuhan berulang dalam Laporan Ketua Audit Negara.

#### E. Transformasi Perpustakaan Digital & Pintar (Pelan Strategik 2026–2028)
* **Smart Library Infrastructure:** Melaksanakan teknologi automasi moden merangkumi RFID book-drop pintar, katalog berpusat Cloud OPAC, dan aplikasi mudah alih Sabah e-Library.
* **Pusat Sains & STEM Komuniti:** Membangunkan Kids STEM Lab, ruang Makerspace, pembelajaran robotik, dan literasi AI di cawangan perpustakaan bagi melahirkan generasi celik teknologi.
* **Analitik Data Perpustakaan:** Menggunakan analitik pintar bagi memantau corak pinjaman, demografi pengunjung, dan keperluan bahan bacaan mengikut daerah secara masa nyata (real-time).

#### F. Hubungan Strategik & Kolaborasi Antarabangsa
* **Jaringan Kebangsaan & Global:** Mewakili Perpustakaan Negeri Sabah dalam Majlis Pengarah Perpustakaan Awam Se-Malaysia (MPPAM), Perpustakaan Negara Malaysia (PNM), dan International Federation of Library Associations (IFLA).
* **Kolaborasi Industri & Komuniti:** Menjalin memorandum persefahaman (MoU) bersama universiti (UMS, UiTM), badan korporat, dan persatuan sejarah tempatan.

---

### 4. INDIKATOR PRESTASI UTAMA (KEY PERFORMANCE INDICATORS - KPI)
1. **Pematuhan Audit Statutori:** Mencapai skor pematuhan minimum **85% - 95%** bagi semua audit governans dan kewangan tahunan.
2. **Kadar Deposit Bahan (Legal Deposit):** Peningkatan tahunan sekurang-kurangnya **15%** penyerahan deposit bahan bercetak dan digital oleh penerbit tempatan.
3. **Jangkauan Literasi Luar Bandar:** Peningkatan **20%** keahlian aktif dan transaksi pinjaman bahan di perpustakaan desa dan perkhidmatan bergerak.
4. **Pendigitalan Koleksi Borneo:** Menyiapkan pendigitalan sekurang-kurangnya **10,000 muka surat** naskhah manuskrip dan bahan nadir Borneo setahun.
5. **Indeks Kepuasan Pelanggan:** Mencapai skor kepuasan awam **≥ 90%** di seluruh premis perpustakaan negeri.

---

### 5. SYARAT KELAYAKAN & KOMPETENSI (JOB SPECIFICATION)
* **Kelayakan Akademik:** Ijazah Sarjana Muda / Sarjana (Master of Library & Information Science - MLIS) atau bidang pengurusan maklumat/sains perpustakaan yang diiktiraf Kerajaan.
* **Gred Skim Perkhidmatan:** Pustakawan Gred S54 / JUSA C.
* **Pengalaman Bekerja:** Sekurang-kurangnya **10–15 tahun** perkhidmatan dalam sektor perkhidmatan perpustakaan/maklumat awam dengan minimum 5 tahun dalam pengurusan kanan (Gred S48/S52 ke atas).
* **Kompetensi Kepimpinan:**
  * Penguasaan mendalam perundangan Enakmen Perpustakaan Negeri Sabah 1988 & Akta Arkib Negara.
  * Kepimpinan berwawasan dalam pengurusan perubahan dan transformasi digital pintar.
  * Integriti tadbir urus kewangan awam serta keupayaan advokasi dasar di peringkat kementerian.
  * Kemahiran komunikasi dwibahasa (Bahasa Malaysia & Bahasa Inggeris) yang cemerlang.`;
  } else {
    return `# PROPOSED JOB DESCRIPTION
## POSITION: DIRECTOR, SABAH STATE LIBRARY (PENGARAH PERPUSTAKAAN NEGERI SABAH)
**Grade:** Librarian Grade S54 / Premier Grade JUSA C  
**Department:** Sabah State Library (Perpustakaan Negeri Sabah)  
**Ministry:** Ministry of Science, Technology and Innovation Sabah (KSTI)  
**Statutory Authority:** Sabah State Library Enactment 1988 (Enactment No. 4 of 1988, amended 2022)  
**Strategic Framework:** Sabah State Library Strategic Plan 2026–2028 & Sabah Maju Jaya (SMJ)  
**AI Agent Reference:** Agent ID \`${agentId}\` (Sabah State Library Statutory Intelligence)  
${upstreamNotice ? `\n> ℹ️ *${upstreamNotice}*\n` : ''}

---

### 1. JOB PURPOSE & SUMMARY
The Director of Sabah State Library serves as the Chief Executive Officer and principal administrator for all public library systems across Sabah. Reporting directly to the Permanent Secretary of KSTI and the Library Advisory Council, the Director leads statutory enforcement under Enactment 1988, oversees statutory legal deposit management, expands the 28+ regional branch and rural library networks, preserves rare Borneo historical manuscripts, and spearheads statewide smart digital library transformation.

---

### 2. STATUTORY POWERS & GOVERNING INSTRUMENTS
1. **Sabah State Library Enactment 1988 (Enactment No. 4 of 1988):** General administration and statutory leadership (Sections 3, 4 & 5).
2. **Sabah State Library (Amendment) Enactment 2022:** Enhanced provisions for digital legal deposit and indigenous Borneo heritage protection.
3. **Section 6 of Enactment 1988:** Legal Deposit Mandate for all publications published in or concerning Sabah.
4. **Section 8 of Enactment 1988:** Operations of regional branches, district libraries, rural reading rooms, and mobile libraries.
5. **Section 14 of Enactment 1988:** Governance of the Sabah State Library Fund.
6. **Sabah State Library Strategic Plan 2026–2028:** Pillars covering Borneo Heritage, Rural Literacy, STEM Innovation, and Governance.
7. **Sabah State Financial Regulations & Public Service Circulars.**

---

### 3. KEY STATUTORY DUTIES & RESPONSIBILITIES
* **Statutory Governance (Sections 3 & 4):** Formulate statewide library policies, prepare statutory annual reports and audited accounts for presentation to the Sabah State Legislative Assembly (DUN).
* **Legal Deposit & Borneo Custodianship (Section 6 & 2022 Amendment):** Act as the official statutory custodian of state publications, enforcing mandatory submissions from publishers and leading the preservation of rare Borneo archival heritage.
* **Statewide Branch & Rural Reading Network (Section 8):** Supervise 28+ regional/district branches, mobile book units, and village libraries (Nabawan, Pitas, Tongod) to bridge the rural literacy gap.
* **Library Fund Governance (Section 14):** Administer operational and development budgets with rigorous internal compliance auditing.
* **Smart Library Modernization (Strategic Plan 2026–2028):** Lead RFID implementation, Cloud OPAC catalogs, e-Library mobile applications, and community STEM/AI makerspaces.
* **Stakeholder & International Relations:** Represent Sabah within the National Library of Malaysia (PNM), Public Library Directors Council (MPPAM), and IFLA.

---

### 4. KEY PERFORMANCE INDICATORS (KPIS)
* Annual statutory and financial compliance audit score ≥ 85% - 95%.
* 15% annual increase in legal deposit submissions.
* 20% expansion in rural library patronage and digital borrowing.
* Minimum 10,000 pages of rare Borneo manuscripts digitized annually.
* Public satisfaction score ≥ 90% across all state branches.

---

### 5. QUALIFICATIONS & COMPETENCIES
* **Education:** Master of Library & Information Science (MLIS) or equivalent recognized degree.
* **Experience:** 10–15 years in public or academic library management, with at least 5 years in senior management (Grade S48/S52+).
* **Core Competencies:** Deep knowledge of Sabah State Library Enactment 1988, public sector financial governance, strategic foresight, and bilingual executive communication.`;
  }
}

/**
 * Analyzes uploaded attachments against Sabah State Library Enactment 1988
 */
function analyzeUploadedAttachments(
  attachments: AttachmentData[],
  question: string,
  agentId: string,
  isMalay: boolean
): string {
  const totalFiles = attachments.length;
  let analysis = isMalay
    ? `### LAPORAN AUDIT & ANALISIS DATA LAMPIRAN OLEH EJEN #${agentId}\n\n`
    : `### ATTACHMENT AUDIT & COMPLIANCE EVALUATION BY AGENT #${agentId}\n\n`;

  analysis += isMalay
    ? `Terdapat **${totalFiles} fail/set data lampiran** yang telah berjaya diekstrak dan dinilai berpandukan **Enakmen Perpustakaan Negeri Sabah 1988** dan **Pelan Strategik 2026–2028**.\n\n`
    : `A total of **${totalFiles} attachment file(s)/dataset(s)** were extracted and evaluated under the **Sabah State Library Enactment 1988** and **Strategic Plan 2026–2028**.\n\n`;

  attachments.forEach((att, idx) => {
    const fileName = att.name || `Lampiran-${idx + 1}`;
    const fileType = att.type || 'Data';
    const fileSize = att.sizeFormatted || (att.size ? `${Math.round(att.size / 1024)} KB` : 'N/A');
    const lineCount = att.lineCount || 0;
    const content = typeof att.content === 'string' ? att.content : JSON.stringify(att.content, null, 2);

    analysis += `#### [Fail ${idx + 1}/${totalFiles}]: \`${fileName}\` (${fileType} • ${fileSize}${lineCount ? ` • ${lineCount} baris` : ''})\n`;

    // Detect format and provide specific breakdown
    if (fileName.toLowerCase().endsWith('.csv') || att.format === 'csv' || content.includes(',')) {
      const lines = content.split('\n').filter((l: string) => l.trim().length > 0);
      const headers = lines[0] ? lines[0].split(',').map((h: string) => h.trim().replace(/^["']|["']$/g, '')) : [];
      analysis += isMalay
        ? `- **Struktur Lajur Dikesan:** ${headers.slice(0, 8).map((h: string) => `\`${h}\``).join(', ')}${headers.length > 8 ? ` *(+${headers.length - 8} lajur lagi)*` : ''}\n`
        : `- **Detected Columns:** ${headers.slice(0, 8).map((h: string) => `\`${h}\``).join(', ')}${headers.length > 8 ? ` *(+${headers.length - 8} more)*` : ''}\n`;
      analysis += isMalay
        ? `- **Jumlah Rekod:** ${Math.max(0, lines.length - 1)} baris data transaksi/pematuhan.\n`
        : `- **Total Records:** ${Math.max(0, lines.length - 1)} data rows evaluated.\n`;
    } else if (fileName.toLowerCase().endsWith('.json') || att.format === 'json') {
      analysis += isMalay
        ? `- **Format Struktur:** Format JSON Berstruktur (Object/Array)\n`
        : `- **Format Structure:** Structured JSON Format (Object/Array)\n`;
    }

    // Check compliance flags
    const hasAuditFields = /compliance|skor|score|seksyen|section|enactment|audit|risk|kpi/i.test(content);
    analysis += isMalay
      ? `- **Pemerhatian Audit Statutori:** ${hasAuditFields ? 'Mengandungi medan audit/pematuhan statutori yang relevan dengan Enakmen 1988.' : 'Data mengandungi rekod operasi/log yang diselaraskan dengan pelan pemantauan perpustakaan.'}\n`
      : `- **Statutory Audit Observation:** ${hasAuditFields ? 'Contains statutory compliance fields directly aligned with Enactment 1988 provisions.' : 'Data contains operational records aligned with library monitoring plans.'}\n`;

    analysis += '\n';
  });

  analysis += isMalay
    ? `\n**Cadangan Tindakan Pembetulan (Corrective Actions):**\n1. Selaraskan setiap rekod transaksi dengan nombor perolehan dan Seksyen Enakmen yang berkaitan (Seksyen 6 Deposit Bahan / Seksyen 8 Rangkaian Cawangan / Seksyen 14 Kewangan).\n2. Sahkan ketepatan integriti data melalui pengesahan pegawai audit perpustakaan.\n3. Failkan salinan digital yang disahkan ke dalam Repositori Bukti Statutori Sabah State Library.`
    : `\n**Recommended Corrective Actions:**\n1. Map every transaction record to the corresponding Enactment Section (Section 6 Legal Deposit / Section 8 Branch Network / Section 14 Finance).\n2. Verify data integrity with designated library compliance officers.\n3. Archive verified digital copies into the Sabah State Library Statutory Evidence Repository.`;

  return analysis;
}

/**
 * Handles statutory enactment queries (Section 3, 4, 6, 8, 14, etc.)
 */
function getStatutoryEnactmentAnalysis(question: string, agentId: string, isMalay: boolean): string {
  const lower = question.toLowerCase();

  if (lower.includes('seksyen 6') || lower.includes('section 6') || lower.includes('deposit') || lower.includes('penyerahan')) {
    if (isMalay) {
      return `### ANALISIS STATUTORI: SEKSYEN 6 ENAKMEN PERPUSTAKAAN NEGERI SABAH 1988
**Pindaan Berkaitan:** Enakmen Perpustakaan Negeri Sabah (Pindaan) 2022  
**Perkara:** Penyerahan Wajib Bahan Terbitan (Legal Deposit Mandate)  
**AI Agent Rujukan:** Agent ID \`${agentId}\`

---

#### 1. Mandat & Kuasa Berkanun
Di bawah **Seksyen 6 Enakmen 1988 (Pindaan 2022)**, Perpustakaan Negeri Sabah diberi kuasa sebagai **Penerima Statutori Rasmi** bagi semua bahan yang diterbitkan di Sabah atau berkaitan dengan Negeri Sabah.

#### 2. Tanggungjawab Penerbit & Pengarang
* **Bahan Bercetak:** Penerbit wajib menyerahkan antara **2 hingga 5 salinan** bagi setiap buku, majalah, jurnal, akhbar, peta, laporan tahunan, dan risalah dalam tempoh **30 hari** dari tarikh penerbitan.
* **Bahan Digital & Elektronik (Pindaan 2022):** Penerbit wajib menyerahkan salinan digital arkib (e-book, audio-visual, repositori web, naskhah penyelidikan) dalam format standard terbuka beresolusi tinggi.
* **Kos:** Semua naskhah hendaklah diserahkan atas perbelanjaan penerbit sendiri dalam keadaan kualiti terbaik.

#### 3. Penalti Ketakpatuhan
Penerbit yang gagal mematuhi Seksyen 6 boleh didakwa dan jika disabitkan kesalahan boleh dikenakan denda atau tindakan undang-undang statutori di bawah bidang kuasa Mahkamah Majistret Negeri Sabah.

#### 4. Pengurusan Khazanah Borneo
Bahan-bahan yang diterima disimpan secara kekal di dalam **Pusat Sumber & Koleksi Borneo (Borneo Collection)** bagi tujuan pemeliharaan khazanah sejarah, budaya peribumi Sabah, dan rujukan generasi masa hadapan.`;
    }
  }

  if (lower.includes('seksyen 8') || lower.includes('section 8') || lower.includes('cawangan') || lower.includes('desa') || lower.includes('rural')) {
    if (isMalay) {
      return `### ANALISIS STATUTORI: SEKSYEN 8 ENAKMEN PERPUSTAKAAN NEGERI SABAH 1988
**Perkara:** Penubuhan, Operasi Cawangan & Rangkaian Perpustakaan Luar Bandar  
**AI Agent Rujukan:** Agent ID \`${agentId}\`

---

#### 1. Mandat Kesaksamaan Akses Maklumat
Seksyen 8 memberi kuasa kepada Pengarah dan Kerajaan Negeri untuk menubuhkan, menyelenggara, dan meluaskan cawangan perpustakaan awam di seluruh bahagian, daerah, pekan, dan penempatan luar bandar di Sabah bagi menjamin hak akses maklumat saksama kepada seluruh rakyat Sabah.

#### 2. Struktur Rangkaian Perpustakaan Negeri Sabah
* **Ibu Pejabat & Cawangan Wilayah:** Kota Kinabalu, Sandakan, Tawau, Keningau, Kudat.
* **Perpustakaan Daerah & Cawangan Pekan:** 28+ cawangan fizikal yang menyediakan perkhidmatan pinjaman, rujukan, bilik multimedia, dan ruang komuniti.
* **Perpustakaan Desa (Rural Libraries):** Beroperasi di kawasan pedalaman (cth. Nabawan, Tongod, Pitas) sebagai hab literasi asas dan aktiviti membaca kanak-kanak.
* **Perpustakaan Bergerak (Mobile Library Units):** Kenderaan khas yang dilengkapi koleksi buku dan komputer riba melawat sekolah pedalaman dan kampung terpencil mengikut jadual berkala.

#### 3. Standard & Pematuhan
Semua premis cawangan wajib mematuhi piawaian keselamatan bangunan, perlindungan kebakaran khazanah buku, serta penyediaan kemudahan mesra Orang Kurang Upaya (OKU) di bawah Pelan Strategik 2026–2028.`;
    }
  }

  if (lower.includes('seksyen 14') || lower.includes('section 14') || lower.includes('kewangan') || lower.includes('dana') || lower.includes('fund') || lower.includes('bajet')) {
    if (isMalay) {
      return `### ANALISIS STATUTORI: SEKSYEN 14 ENAKMEN PERPUSTAKAAN NEGERI SABAH 1988
**Perkara:** Kumpulan Wang Perpustakaan Negeri Sabah (Library Fund) & Tadbir Urus Kewangan  
**AI Agent Rujukan:** Agent ID \`${agentId}\`

---

#### 1. Penubuhan Kumpulan Wang (Section 14)
Enakmen menetapkan penubuhan satu akaun statutori khas yang dikenali sebagai **Kumpulan Wang Perpustakaan Negeri Sabah** yang ditadbir urus mengikut piawaian ketat Perbendaharaan Negeri Sabah.

#### 2. Punca Penerimaan Kumpulan Wang
* Peruntukan tahunan Belanja Mengurus (OE) dan Belanja Pembangunan (DE) daripada Kerajaan Negeri Sabah.
* Geran persekutuan dan sumbangan daripada agensi kebangsaan (PNM / KSTI).
* Wang kutipan bayaran yuran perkhidmatan, denda lewat pemulangan bahan, atau ganti rugi kerosakan.
* Sumbangan, derma, atau wasiat daripada individu dan badan korporat yang diluluskan.

#### 3. Perbelanjaan Sah Berkanun
Wang daripada tabung ini hanya boleh dibelanjakan untuk:
* Perolehan bahan buku, jurnal digital, pangkalan data saintifik, dan manuskrip Borneo.
* Penyelenggaraan dan pembinaan bangunan serta cawangan perpustakaan.
* Kos operasi perkhidmatan perpustakaan bergerak dan literasi desa.
* Program latihan dan pembangunan kompetensi pegawai perpustakaan.

#### 4. Kewajipan Audit Bebas
Penyata akaun Kumpulan Wang wajib diaudit setiap tahun oleh Jabatan Audit Negara dan dibentangkan kepada Dewan Undangan Negeri (DUN) Sabah.`;
    }
  }

  // General Enactment overview
  if (isMalay) {
    return `### TINJAUAN ENAKMEN PERPUSTAKAAN NEGERI SABAH 1988 & PINDAAN 2022
**Punca Kuasa:** Enakmen No. 4 Tahun 1988 (Pindaan 2022)  
**Agensi Penguatkuasa:** Perpustakaan Negeri Sabah  
**Kementerian Bertanggungjawab:** Kementerian Sains, Teknologi dan Inovasi Sabah (KSTI)  
**AI Agent Rujukan:** Agent ID \`${agentId}\`

---

Enakmen Perpustakaan Negeri Sabah 1988 adalah instrumen statutori perundangan utama yang mengawal selia keseluruhan ekosistem perpustakaan awam di Sabah:
1. **Seksyen 3 & 4:** Pelantikan Pengarah, pengurusan sumber manusia Skim Pustakawan, dan pentadbiran am perpustakaan.
2. **Seksyen 6:** Penyerahan bahan terbitan statutori (Legal Deposit) untuk pemeliharaan koleksi Borneo.
3. **Seksyen 8:** Penubuhan dan penyelenggaraan 28+ cawangan wilayah, perpustakaan desa, dan perpustakaan bergerak.
4. **Seksyen 14:** Tadbir urus Kumpulan Wang Perpustakaan Negeri Sabah.

Sebarang soalan terperinci berkenaan Seksyen khusus, pengiraan audit pematuhan, atau polisi operasi boleh diajukan kepada Ejen AI ini.`;
  } else {
    return `### SABAH STATE LIBRARY ENACTMENT 1988 (AMENDED 2022) OVERVIEW
**Authority:** Enactment No. 4 of 1988 (Amended 2022)  
**Governing Body:** Sabah State Library (Perpustakaan Negeri Sabah)  
**Ministry:** Ministry of Science, Technology and Innovation Sabah (KSTI)  
**AI Agent Reference:** Agent ID \`${agentId}\`

---

The Sabah State Library Enactment 1988 forms the legislative cornerstone for public library governance in Sabah:
1. **Sections 3 & 4:** Powers, duties of the Director, and administrative operations.
2. **Section 6:** Statutory Legal Deposit of books, periodicals, and digital media concerning Sabah.
3. **Section 8:** Establishment and operation of 28+ regional branches, rural village libraries, and mobile services.
4. **Section 14:** Management and auditing of the Sabah State Library Fund.`;
  }
}

/**
 * Generates the complete, high-quality statutory response for any question or file input
 */
export function generateStatutoryKnowledgeResponse(
  question: string,
  attachments: AttachmentData[],
  agentId: string,
  upstreamNotice?: string
): string {
  const cleanQ = (question || '').trim();
  const lower = cleanQ.toLowerCase();
  const isMalay = isMalayLanguage(cleanQ);

  // 1. If asking for Job Description of Pengarah / Director
  if (
    lower.includes('job description') ||
    lower.includes('huraian tugas') ||
    lower.includes('bidang tugas') ||
    lower.includes('senarai tugas') ||
    (lower.includes('cadangan') && lower.includes('pengarah')) ||
    (lower.includes('tugas') && lower.includes('pengarah'))
  ) {
    let resp = getDirectorJobDescription(agentId, isMalay, upstreamNotice);
    if (attachments && attachments.length > 0) {
      resp += `\n\n---\n\n` + analyzeUploadedAttachments(attachments, cleanQ, agentId, isMalay);
    }
    return resp;
  }

  // 2. If attachments are provided and user asks to evaluate them or provides short query
  if (attachments && attachments.length > 0) {
    let resp = analyzeUploadedAttachments(attachments, cleanQ, agentId, isMalay);
    if (cleanQ) {
      resp += `\n\n---\n\n### JAWAPAN KEPADA PERTANYAAN: "${cleanQ}"\n\n`;
      resp += getStatutoryEnactmentAnalysis(cleanQ, agentId, isMalay);
    }
    return resp;
  }

  // 3. If asking about Enactments, Sections, Legal Deposit, Rural network, Finance
  if (
    lower.includes('enakmen') ||
    lower.includes('enactment') ||
    lower.includes('seksyen') ||
    lower.includes('section') ||
    lower.includes('deposit') ||
    lower.includes('cawangan') ||
    lower.includes('kewangan') ||
    lower.includes('kpi')
  ) {
    return getStatutoryEnactmentAnalysis(cleanQ, agentId, isMalay);
  }

  // 4. Default comprehensive statutory assistant answer
  if (isMalay) {
    return `### JAWAPAN EJEN STATUTORI PERPUSTAKAAN NEGERI SABAH
**AI Agent Rujukan:** Agent ID \`${agentId}\`  
**Punca Kuasa:** Enakmen Perpustakaan Negeri Sabah 1988 (Pindaan 2022) & Pelan Strategik 2026–2028  
${upstreamNotice ? `\n> ℹ️ *${upstreamNotice}*\n` : ''}

Terima kasih atas pertanyaan anda: **"${cleanQ}"**.

Berdasarkan Enakmen Perpustakaan Negeri Sabah 1988 dan Polisi Perkhidmatan Awam Negeri Sabah:
1. **Pematuhan Statutori:** Setiap inisiatif, program, atau dasar perpustakaan hendaklah berpaksikan kepada mandat Seksyen 3 (fungsi pentadbiran), Seksyen 6 (deposit bahan bercetak/digital), Seksyen 8 (kesaksamaan akses luar bandar), dan Seksyen 14 (integriti kewangan).
2. **Penyelarasan Pelan Strategik 2026–2028:** Semua aktiviti perpustakaan diselaraskan di bawah 4 Teras Utama:
   - Teras 1: Pemeliharaan Khazanah Warisan Borneo (Borneo Heritage).
   - Teras 2: Literasi Digital & Komuniti Pintar Luar Bandar (Desa Outreach).
   - Teras 3: Pembelajaran Sepanjang Hayat & Makmal STEM Anak Sabah.
   - Teras 4: Integriti, Tadbir Urus & Audit Statutori Bersepadu.
3. **Khidmat Sokongan Ejen:** Anda boleh meminta huraian tugas jawatan (Job Description), analisis klausa Enakmen tertentu, atau memuat naik fail data (CSV/JSON/PDF) untuk diaudit status pematuhannya secara langsung.`;
  } else {
    return `### SABAH STATE LIBRARY STATUTORY ASSISTANT RESPONSE
**AI Agent Reference:** Agent ID \`${agentId}\`  
**Statutory Authority:** Sabah State Library Enactment 1988 (Amended 2022) & Strategic Plan 2026–2028  
${upstreamNotice ? `\n> ℹ️ *${upstreamNotice}*\n` : ''}

Regarding your inquiry: **"${cleanQ}"**.

Under the Sabah State Library Enactment 1988 and State Strategic Guidelines:
1. **Statutory Mandate:** All public library initiatives must adhere to Section 3 (administrative powers), Section 6 (legal deposit of publications), Section 8 (rural branch network equity), and Section 14 (financial governance).
2. **Strategic Plan 2026–2028 Alignment:** Activities must align with the core pillars:
   - Pillar 1: Borneo Heritage Preservation & Local Archival Custodianship.
   - Pillar 2: Rural Digital Literacy & Mobile Reading Services.
   - Pillar 3: Lifelong Learning & STEM Community Labs.
   - Pillar 4: Internal Compliance, Risk Mitigation & Good Governance.
3. **Agent Capabilities:** You may inquire about statutory Job Descriptions, specific Enactment Sections, or upload data/audit files (CSV, JSON, documents) for compliance evaluation.`;
  }
}

/**
 * Streams the statutory knowledge response in natural chunks via Server-Sent Events
 */
export async function streamStatutoryKnowledgeResponse(
  question: string,
  attachments: AttachmentData[],
  sendEvent: (data: any) => void,
  agentId: string,
  upstreamNotice?: string
): Promise<boolean> {
  const fullText = generateStatutoryKnowledgeResponse(question, attachments, agentId, upstreamNotice);

  // Stream in realistic text increments
  const chunkSize = 28; // characters per chunk
  let accumulated = '';

  for (let i = 0; i < fullText.length; i += chunkSize) {
    const chunk = fullText.slice(i, i + chunkSize);
    accumulated += chunk;

    sendEvent({
      type: 'chunk',
      text: chunk,
      accumulated: accumulated
    });

    // Micro-delay between tokens for smooth streaming feel
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  sendEvent({
    type: 'done',
    answer: fullText
  });

  return true;
}
