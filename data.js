// ================================================================
// TRANSLATIONS DATABASE (Kamus Terjemahan)
// ================================================================
const T = {
    'nav.about':        { id:'Tentang',         en:'About' },
    'nav.experience':   { id:'Pengalaman',      en:'Experience' },
    'nav.skills':       { id:'Keahlian',        en:'Skills' },
    'nav.certificates': { id:'Sertifikat',      en:'Certificates' },
    'nav.projects':     { id:'Proyek',          en:'Projects' },
    'nav.business':       { id:'Bisnis',        en:'Business' },
    'nav.learn':          { id:'Belajar',       en:'Learn' },
    'nav.login':        { id:'Masuk / Daftar',  en:'Login / Sign Up' },
    'nav.contact':      { id:'Hubungi',         en:'Contact' },
    'nav.contactFull':  { id:'Hubungi Saya',    en:'Contact Me' },

    'hero.badge':   { id:'Open to Opportunities', en:'Open to Opportunities' },
    'hero.greeting': { id:'Halo, saya',             en:"Hello, I'm" },
    'hero.desc': {
        id:'Lulusan S1 Fisika dari Universitas Negeri Malang yang berfokus pada <span class="text-white font-medium">Data Analysis</span> dan <span class="text-white font-medium">Python Programming</span>.',
        en:'Physics graduate from Universitas Negeri Malang, focusing on <span class="text-white font-medium">Data Analysis</span> and <span class="text-white font-medium">Python Programming</span>.'
    },
    'hero.cta1':   { id:'Lihat Sertifikat', en:'View Certificates' },
    'hero.cta2':   { id:'Hubungi Saya',     en:'Contact Me' },
    'hero.stat1':  { id:'Sertifikat',          en:'Certificates' },
    'hero.stat2':  { id:'Proyek',              en:'Projects' },
    'hero.stat3':  { id:'Riset Internasional', en:'International Research' },

    'about.label':  { id:'Tentang Saya',              en:'About Me' },
    'about.title1': { id:'Driven by Data,',            en:'Driven by Data,' },
    'about.title2': { id:'Powered by Curiosity',       en:'Powered by Curiosity' },
    'about.p1': {
        id:'Saya adalah lulusan S1 Fisika dari Universitas Negeri Malang yang memiliki ketertarikan mendalam di bidang analisis data dan pemrograman. Latar belakang pendidikan fisika membekali saya dengan kemampuan berpikir logis, matematis, dan analitis yang kuat.',
        en:'I am a Physics graduate from Universitas Negeri Malang with a deep interest in data analysis and programming. My physics background has equipped me with strong logical, mathematical, and analytical thinking skills.'
    },
    'about.p2': {
        id:'Saya sangat <strong class="text-navy-800">termotivasi</strong>, berorientasi pada <strong class="text-navy-800">detail</strong>, dan senantiasa mencari peluang untuk berkembang. Pengalaman magang riset internasional di Korea Selatan telah membentuk saya menjadi individu yang adaptif dan siap menghadapi tantangan di lingkungan kerja yang dinamis.',
        en:'I am highly <strong class="text-navy-800">motivated</strong>, <strong class="text-navy-800">detail-oriented</strong>, and always seeking opportunities to grow. My international research internship in South Korea has shaped me into an adaptive individual ready to face challenges in a dynamic work environment.'
    },
    'about.p3': {
        id:'Saat ini saya sedang aktif mencari tantangan profesional yang memungkinkan saya mengaplikasikan keahlian teknis sekaligus terus belajar dan berkontribusi secara nyata.',
        en:'I am currently actively seeking professional challenges that allow me to apply my technical skills while continuing to learn and contribute meaningfully.'
    },
    'about.h1t': { id:'Detail-Oriented',   en:'Detail-Oriented' },
    'about.h1d': { id:'Presisi dalam setiap pekerjaan',  en:'Precision in every task' },
    'about.h2t': { id:'Internasional',      en:'International' },
    'about.h2d': { id:'Pengalaman riset di Korsel',     en:'Research experience in South Korea' },
    'about.h3t': { id:'Growth Mindset',     en:'Growth Mindset' },
    'about.h3d': { id:'Selalu ingin belajar hal baru',  en:'Always eager to learn new things' },
    'about.h4t': { id:'Kolaboratif',        en:'Collaborative' },
    'about.h4d': { id:'Mudah bekerja dalam tim',        en:'Easy to work in a team' },

    'exp.label': { id:'Perjalanan Saya',              en:'My Journey' },
    'exp.title': { id:'Pengalaman & Pendidikan',       en:'Experience & Education' },
    'exp.tag1':  { id:'Pendidikan',                    en:'Education' },
    'exp.desc1': {
        id:'Fokus pada fisika komputasional, analisis data, dan pemodelan matematis. Menguasai berbagai tools pemrograman untuk riset ilmiah.',
        en:'Focused on computational physics, data analysis, and mathematical modeling. Proficient in various programming tools for scientific research.'
    },
    'exp.tag2':  { id:'Magang Riset Internasional',    en:'International Research Internship' },
    'exp.korea': { id:'Korea Selatan',                 en:'South Korea' },
    'exp.desc2': {
        id:'Melaksanakan magang riset di lingkungan internasional, terlibat dalam proyek penelitian tingkat global bersama peneliti dari berbagai negara.',
        en:'Conducted a research internship in an international environment, involved in global-level research projects alongside researchers from various countries.'
    },
    'exp.tag3':  { id:'Pengembangan Diri',             en:'Self Development' },
    'exp.sub3':  { id:'Self-Directed Study',           en:'Self-Directed Study' },
    'exp.desc3': {
        id:'Aktif mengejar sertifikasi profesional, mengembangkan proyek independen di bidang Data Science, Machine Learning, dan Web Development.',
        en:'Actively pursuing professional certifications, developing independent projects in Data Science, Machine Learning, and Web Development.'
    },

    'skills.label': { id:'Kemampuan Teknis', en:'Technical Skills' },
    'skills.title': { id:'Keahlian Saya',    en:'My Skills' },

    'cert.label':    { id:'Bukti Kompetensi', en:'Proof of Competence' },
    'cert.title':    { id:'Sertifikat Saya',  en:'My Certificates' },
    'cert.subtitle': { id:'Klik pada setiap kartu untuk melihat sertifikat lengkap (gambar / PDF).', en:'Click on each card to view the full certificate (image / PDF).' },
    'cert.viewBtn':  { id:'Lihat Sertifikat', en:'View Certificate' },
    'cert.featured': { id:'Unggulan',         en:'Featured' },

    'proj.label': { id:'Karya Saya', en:'My Work' },
    'proj.title': { id:'Proyek',     en:'Projects' },

    'contact.label':       { id:'Mari Terhubung',               en:"Let's Connect" },
    'contact.title':       { id:'Hubungi Saya',                 en:'Contact Me' },
    'contact.desc':        { id:'Saya selalu terbuka untuk peluang baru, kolaborasi, atau sekadar diskusi. Jangan ragu untuk menghubungi saya.', en:"I'm always open to new opportunities, collaborations, or just a discussion. Don't hesitate to reach out." },
    'contact.emailLabel':  { id:'Email',                       en:'Email' },
    'contact.locLabel':    { id:'Lokasi',                      en:'Location' },
    'contact.locValue':    { id:'Indonesia',                   en:'Indonesia' },
    'contact.statusLabel': { id:'Status',                      en:'Status' },
    'contact.statusValue': { id:'Terbuka untuk kesempatan',   en:'Open to opportunities' },
    'contact.nameLabel':   { id:'Nama',                        en:'Name' },
    'contact.namePh':      { id:'Nama lengkap',                en:'Full name' },
    'contact.emailInputLabel': { id:'Email',                  en:'Email' },
    'contact.emailPh':     { id:'email@contoh.com',            en:'email@example.com' },
    'contact.subjectLabel':{ id:'Subjek',                      en:'Subject' },
    'contact.subjectPh':   { id:'Topik pesan Anda',            en:'Your message topic' },
    'contact.msgLabel':    { id:'Pesan',                       en:'Message' },
    'contact.msgPh':       { id:'Tulis pesan Anda di sini...',en:'Write your message here...' },
    'contact.submit':      { id:'Kirim Pesan',                 en:'Send Message' },
    'contact.errorEmpty':  { id:'Mohon lengkapi semua field.', en:'Please fill in all fields.' },
    'contact.errorEmail':  { id:'Format email tidak valid.',   en:'Invalid email format.' },
    'contact.sending':     { id:'Mengirim...',                 en:'Sending...' },
    'contact.toastTitle':  { id:'Pesan Terkirim!',             en:'Message Sent!' },
    'contact.toastDesc':   { id:'Terima kasih, saya akan segera membalas.', en:'Thank you, I will reply soon.' },

    'auth.loginTitle':  { id:'Selamat Datang', en:'Welcome Back' },
    'auth.loginSub':    { id:'Silakan masuk ke akun Anda', en:'Please sign in to your account' },
    'auth.regTitle':    { id:'Buat Akun Baru', en:'Create an Account' },
    'auth.regSub':      { id:'Bergabunglah untuk melanjutkan', en:'Join us to continue' },
    'auth.passLabel':   { id:'Kata Sandi', en:'Password' },
    'auth.loginBtn':    { id:'Masuk', en:'Sign In' },
    'auth.regBtn':      { id:'Daftar', en:'Sign Up' },
    'auth.noAccount':   { id:'Belum punya akun?', en:"Don't have an account?" },
    'auth.haveAccount': { id:'Sudah punya akun?', en:'Already have an account?' },
    'auth.registerNow': { id:'Daftar sekarang', en:'Register now' },
    'auth.loginNow':    { id:'Masuk di sini', en:'Sign in here' },
    'auth.demoMsg':     { id:'Ini adalah demo UI form Login/Register statis.', en:'This is a static Login/Register UI demo form.' },

    'footer.backTop': { id:'Kembali ke atas', en:'Back to top' }
};

// ================================================================
// DYNAMIC CONTENT DATA (Skills, Certs, Projects)
// ================================================================
const skillsData = [
    { icon:'code-2',      key:'Python Programming', pct:90 },
    { icon:'bar-chart-3', key:'Data Analysis',      pct:85 },
    { icon:'brain',       key:'Machine Learning',   pct:75 },
    { icon:'globe',       key:'Web Development',    pct:80 },
    { icon:'sigma',       key:'MATLAB',             pct:70 },
    { icon:'cpu',         key:'IoT Development',    pct:65 },
];

const skillsI18n = {
    'Python Programming': { id:'Python Programming', en:'Python Programming' },
    'Data Analysis':      { id:'Analisis Data',      en:'Data Analysis' },
    'Machine Learning':   { id:'Machine Learning',   en:'Machine Learning' },
    'Web Development':    { id:'Pengembangan Web',   en:'Web Development' },
    'MATLAB':             { id:'MATLAB',             en:'MATLAB' },
    'IoT Development':    { id:'Pengembangan IoT',   en:'IoT Development' },
};

const toolBadges = ['Pandas','NumPy','Scikit-Learn','HTML/CSS/JS','SQL','Git','ESP32','LaTeX'];

const certsData = [
    {
        coverSrc:'/edit/uploads/1777173742_CertificateLPIAEPTDarmapage0001.jpg',
        imgSrc:'/edit/uploads/1777173742_CertificateLPIAEPTDarmapage0001.jpg', 
        fullSrc:'/edit/uploads/1777173742_CertificateLPIAEPTDarmapage0001.jpg',
        pdfSrc:'',
        tagKey:'cert.tagLang', tagIcon:'languages',
        titleKey:'cert.t1', descKey:'cert.d1',
        featured: false, span: ''
    },
    {
        coverSrc:'/edit/uploads/1777173973_DarmaAlifRakhaaCFTpage0001.jpg',
        imgSrc:'/edit/uploads/1777173973_DarmaAlifRakhaaCFTpage0001.jpg', 
        fullSrc:'/edit/uploads/1777173973_DarmaAlifRakhaaCFTpage0001.jpg',
        pdfSrc:'',
        tagKey:'cert.tagTech', tagIcon:'table',
        titleKey:'cert.t2', descKey:'cert.d2',
        featured: false, span: ''
    },
    {
        coverSrc:'/edit/uploads/1777174029_ENpage0001.jpg',
        imgSrc:'/edit/uploads/1777174029_ENpage0001.jpg', 
        fullSrc:'/edit/uploads/1777174029_ENpage0001.jpg',
        pdfSrc:'',
        tagKey:'cert.tagIntl', tagIcon:'award',
        titleKey:'cert.t3', descKey:'cert.d3',
        featured: true, span: 'sm:col-span-2 md:col-span-1'
    },
    {
        coverSrc:'/edit/uploads/1777175013_sertifikattoefeldarmaalifrakhaapage0001.jpg',
        imgSrc:'/edit/uploads/1777175013_sertifikattoefeldarmaalifrakhaapage0001.jpg', 
        fullSrc:'/edit/uploads/1777175013_sertifikattoefeldarmaalifrakhaapage0001.jpg',
        pdfSrc:'',
        tagKey:'cert.tagLang', tagIcon:'languages',
        titleKey:'cert.t1', descKey:'cert.d1',
        featured: false, span: ''
    },
];

const certsI18n = {
    'cert.tagLang':  { id:'Bahasa',        en:'Language' },
    'cert.tagTech':  { id:'Teknis',        en:'Technical' },
    'cert.tagIntl':  { id:'Internasional', en:'International' },
    'cert.t1':       { id:'Sertifikat Bahasa Inggris',         en:'English Language Certificate' },
    'cert.d1':       { id:'Sertifikasi kemampuan bahasa Inggris yang membuktikan kompetensi komunikasi profesional.', en:'English language proficiency certification proving professional communication competence.' },
    'cert.t2':       { id:'Sertifikat Microsoft Excel',        en:'Microsoft Excel Certificate' },
    'cert.d2':       { id:'Sertifikasi tingkat lanjut dalam penggunaan Microsoft Excel untuk pengolahan data.', en:'Advanced certification in Microsoft Excel for data processing and analysis.' },
    'cert.t3':       { id:'Sertifikat Magang IBS Korea',       en:'IBS Korea Internship Certificate' },
    'cert.d3':       { id:'Sertifikat resmi dari Institute of Basic Sciences, Korea Selatan sebagai bukti penyelesaian magang riset.', en:'Official certificate from the Institute of Basic Sciences, South Korea as proof of completed research internship.' },
    'cert.t4':       { id:'Sertifikat Bahasa Inggris',       en:'English Language Certificate' },
    'cert.d4':       { id:'Sertifikasi kemampuan bahasa Inggris yang membuktikan kompetensi komunikasi profesional.', en:'English language proficiency certification proving professional communication competence.' },
};

const projData = [
    {
        imgSrc:'/edit/uploads/1777174476_AnalisisAktivitasRadioisotopremovedpage0001.jpg',
        fullSrc:'/edit/uploads/1777174476_AnalisisAktivitasRadioisotopremovedpage0001.jpg',
        tags:['COSINE-100','Dark Matter','Science'],
        titleKey:'proj.t1', descKey:'proj.d1', span:''
    },
    {
        imgSrc:'https://picsum.photos/seed/project-ml-model/600/375.jpg',
        tags:['Scikit-Learn','Pandas'],
        titleKey:'proj.t2', descKey:'proj.d2', span:''
    },
    {
        imgSrc:'https://picsum.photos/seed/project-esp32-iot/600/375.jpg',
        tags:['ESP32-CAM','IoT'],
        titleKey:'proj.t3', descKey:'proj.d3', span:'sm:col-span-2 md:col-span-1'
    },
];

const projI18n = {
    'proj.t1': { id:'Analisis Aktivitas Radioisotop Kalium-40 pada SET 1 (48 hari) Menggunakan Teknik Multi-Hit dalam Eksperimen COSINE-100',            en:'Analysis of Potassium-40 Radioisotope Activity at SET 1 (48 days) Using the Multi-Hit Technique in the COSINE-100 Experiment' },
    'proj.d1': { id:'Eksperimen COSINE-100 merupakan upaya untuk memverifikasi sinyal modulasi tahunan yang dilaporkan oleh DAMA/LIBRA dengan menggunakan detektor kristal NaI(Tl) dalam kondisi latar belakang (background) radiasi yang rendah.', en:'The COSINE-100 experiment is an attempt to verify the annual modulation signal reported by DAMA/LIBRA using a NaI(Tl) crystal detector under low background radiation conditions.' },
    'proj.t2': { id:'Pemodelan Machine Learning',    en:'Machine Learning Modeling' },
    'proj.d2': { id:'Pemodelan prediktif menggunakan berbagai algoritma ML untuk analisis data riset.', en:'Predictive modeling using various ML algorithms for research data analysis.' },
    'proj.t3': { id:'Eksplorasi IoT ESP32-CAM',     en:'IoT ESP32-CAM Exploration' },
    'proj.d3': { id:'Eksperimen ESP32-CAM untuk sistem pemantauan berbasis Internet of Things.', en:'ESP32-CAM experiments for IoT-based monitoring systems.' },
};
