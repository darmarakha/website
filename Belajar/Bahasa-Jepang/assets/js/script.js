// ===== Init Lucide Icons =====
if (window.lucide) {
  lucide.createIcons();
}

// ===== Navbar scroll effect =====
const navbar = document.getElementById('navbar');

if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(10,10,10,0.85)';
      navbar.style.backdropFilter = 'blur(20px)';
      navbar.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    } else {
      navbar.style.background = 'transparent';
      navbar.style.backdropFilter = 'none';
      navbar.style.borderBottom = 'none';
    }
  });
}

// ===== Mobile Menu =====
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenuClose = document.getElementById('mobileMenuClose');

if (mobileMenu && mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.style.opacity = '1';
    mobileMenu.style.pointerEvents = 'all';
  });
}

if (mobileMenu && mobileMenuClose) {
  mobileMenuClose.addEventListener('click', () => {
    mobileMenu.style.opacity = '0';
    mobileMenu.style.pointerEvents = 'none';
  });
}

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    if (mobileMenu) {
      mobileMenu.style.opacity = '0';
      mobileMenu.style.pointerEvents = 'none';
    }
  });
});

// ===== Reveal on Scroll =====
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length > 0) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));
}

// ===== Progress Circle Animation dari SQL / PHP =====
let progressAnimated = false;

// Support ID baru dan ID lama agar aman
const progressCircle =
  document.getElementById('aiProgressCircle') ||
  document.getElementById('progressCircle');

const progressNumber =
  document.getElementById('aiProgressNumber') ||
  document.getElementById('progressNumber');

if (progressCircle && progressNumber) {
  const progressSvg = progressCircle.closest('svg');

  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !progressAnimated) {
        progressAnimated = true;

        // Ambil target progress dari PHP:
        // <span data-target="<?php echo $ai_total_progress; ?>">
        let target = parseInt(progressNumber.getAttribute('data-target'), 10);

        // Validasi agar tidak NaN dan tidak keluar dari 0-100
        if (isNaN(target)) target = 0;
        target = Math.max(0, Math.min(100, target));

        let current = 0;
        const fullCircle = 440;
        const offset = fullCircle - (fullCircle * target / 100);

        // Animate number berdasarkan data SQL, bukan angka hardcode 65
        if (target > 0) {
          const step = Math.max(1, target / 60);

          const interval = setInterval(() => {
            current += step;

            if (current >= target) {
              current = target;
              clearInterval(interval);
            }

            progressNumber.textContent = Math.round(current);
          }, 25);
        } else {
          progressNumber.textContent = '0';
        }

        // Animate circle berdasarkan data SQL
        progressCircle.style.transition = 'stroke-dashoffset 2s ease-out';
        progressCircle.setAttribute('stroke-dashoffset', offset);
        progressCircle.style.strokeDashoffset = offset;
      }
    });
  }, {
    threshold: 0.3
  });

  if (progressSvg) {
    progressObserver.observe(progressSvg);
  }
}

// ===== Toast =====
let toastTimeout;

function showToast(title, msg, type = 'success') {
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');
  const icon = document.getElementById('toastIcon');

  // Kalau HTML toast belum ada, jangan bikin JS error
  if (!toast || !toastTitle || !toastMsg || !icon) {
    console.log(`${title}: ${msg}`);
    return;
  }

  toastTitle.textContent = title;
  toastMsg.textContent = msg;

  const iconBox = toast.querySelector('.w-10');

  if (type === 'success') {
    icon.setAttribute('data-lucide', 'check-circle');
    icon.className = 'w-5 h-5 text-emerald-400';

    if (iconBox) {
      iconBox.className = 'w-10 h-10 rounded-xl bg-emerald-400/15 flex items-center justify-center shrink-0';
    }
  } else {
    icon.setAttribute('data-lucide', 'info');
    icon.className = 'w-5 h-5 text-sakura-400';

    if (iconBox) {
      iconBox.className = 'w-10 h-10 rounded-xl bg-sakura-400/15 flex items-center justify-center shrink-0';
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }

  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(hideToast, 4000);
}

function hideToast() {
  const toast = document.getElementById('toast');

  if (toast) {
    toast.classList.remove('show');
  }
}

// ===== Daily Mission / Misi Harian Logic =====
function checkDailyAns(ans, btnElement) {
  const feedback = document.getElementById('daily-feedback');
  const bunpouBox = document.getElementById('bunpou-box');

  if (!feedback || !bunpouBox || !btnElement) return;

  // Reset warna semua tombol
  const allBtns = btnElement.parentElement.querySelectorAll('button');

  allBtns.forEach(b => {
    b.className = 'btn-secondary py-4 rounded-xl text-white font-bold text-lg hover:bg-white/10 hover:border-sakura-400 transition-all';
  });

  bunpouBox.classList.remove('hidden');

  if (ans === 'o') {
    btnElement.className = 'py-4 rounded-xl text-white font-bold text-lg bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    feedback.className = 'font-bold mb-3 text-lg flex items-center gap-2 text-emerald-400';
    feedback.innerHTML = '<i data-lucide="check-circle-2" class="w-6 h-6"></i> Luar Biasa! Jawaban Benar!';
  } else {
    btnElement.className = 'py-4 rounded-xl text-white font-bold text-lg bg-rose-500/20 border border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
    feedback.className = 'font-bold mb-3 text-lg flex items-center gap-2 text-rose-400';
    feedback.innerHTML = '<i data-lucide="x-circle" class="w-6 h-6"></i> Kurang Tepat, Coba Lagi!';
  }

  if (window.lucide) {
    lucide.createIcons();
  }

  showToast('Misi Harian', 'Tantangan Bunpou telah dikerjakan!', 'info');
}

// ===== Button Actions =====
const mulaiBelajarBtn = document.getElementById('mulaiBelajarBtn');
const ctaBelajarBtn = document.getElementById('ctaBelajarBtn');
const sertifikatBtn = document.getElementById('sertifikatBtn');
const cekLevelBtn = document.getElementById('cekLevelBtn');

if (mulaiBelajarBtn) {
  mulaiBelajarBtn.addEventListener('click', () => {
    showToast('よろしくお願いします！', 'Selamat datang! Mari mulai belajar bahasa Jepang.', 'success');

    const materiSection = document.getElementById('materi');

    if (materiSection) {
      materiSection.scrollIntoView({
        behavior: 'smooth'
      });
    }
  });
}

if (ctaBelajarBtn) {
  ctaBelajarBtn.addEventListener('click', () => {
    showToast('Akun Siap!', 'Selamat bergabung! Mulai perjalanan N5-mu sekarang.', 'success');
  });
}

if (sertifikatBtn) {
  sertifikatBtn.addEventListener('click', () => {
    showToast('Sertifikat N5', 'Selesaikan 100% materi untuk unlock sertifikat.', 'info');
  });
}

// ===== Level Check Quiz =====
const quizData = [
  {
    q: 'Apa arti dari 「おはようございます」?',
    opts: ['Selamat malam', 'Selamat pagi', 'Selamat siang', 'Sampai jumpa'],
    correct: 1
  },
  {
    q: 'Huruf Hiragana 「さ」 dibaca sebagai?',
    opts: ['sa', 'shi', 'su', 'se'],
    correct: 0
  },
  {
    q: 'Apa arti kata 「ねこ」?',
    opts: ['Anjing', 'Burung', 'Kucing', 'Ikan'],
    correct: 2
  },
  {
    q: 'Partikel 「は」 (wa) berfungsi sebagai?',
    opts: ['Penunjuk tempat', 'Penanda topik kalimat', 'Penunjuk arah', 'Penanda objek'],
    correct: 1
  },
  {
    q: 'Bagaimana mengatakan "1" dalam bahasa Jepang?',
    opts: ['に (ni)', 'さん (san)', 'いち (ichi)', 'よん (yon)'],
    correct: 2
  }
];

let currentQ = 0;
let score = 0;

if (cekLevelBtn) {
  cekLevelBtn.addEventListener('click', () => {
    const levelModal = document.getElementById('levelModal');
    const quizContent = document.getElementById('quizContent');
    const quizResult = document.getElementById('quizResult');

    currentQ = 0;
    score = 0;

    if (quizContent) {
      quizContent.classList.remove('hidden');
    }

    if (quizResult) {
      quizResult.classList.add('hidden');
    }

    loadQuestion();

    if (levelModal) {
      levelModal.classList.add('active');
    }
  });
}

function closeLevelModal() {
  const levelModal = document.getElementById('levelModal');

  if (levelModal) {
    levelModal.classList.remove('active');
  }
}

function loadQuestion() {
  if (currentQ >= quizData.length) {
    showResult();
    return;
  }

  const qNum = document.getElementById('qNum');
  const qProgress = document.getElementById('qProgress');
  const qBar = document.getElementById('qBar');
  const questionText = document.getElementById('questionText');
  const container = document.getElementById('optionsContainer');

  // Kalau modal quiz belum ada di HTML, hentikan agar tidak error
  if (!qNum || !qProgress || !qBar || !questionText || !container) {
    return;
  }

  const q = quizData[currentQ];

  qNum.textContent = currentQ + 1;
  qProgress.textContent = Math.round(((currentQ + 1) / quizData.length) * 100) + '%';
  qBar.style.width = ((currentQ + 1) / quizData.length * 100) + '%';
  questionText.textContent = q.q;

  container.innerHTML = '';

  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');

    btn.className = 'quiz-option w-full text-left px-5 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm text-neutral-300 hover:bg-white/[0.08] hover:border-sakura-400/30 transition-all';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(btn, i);

    container.appendChild(btn);
  });
}

function selectAnswer(btn, idx) {
  const correct = quizData[currentQ].correct;
  const allBtns = document.querySelectorAll('.quiz-option');

  allBtns.forEach((b, i) => {
    b.style.pointerEvents = 'none';

    if (i === correct) {
      b.style.background = 'rgba(16,185,129,0.15)';
      b.style.borderColor = 'rgba(16,185,129,0.5)';
      b.style.color = '#6ee7b7';
    } else if (i === idx && idx !== correct) {
      b.style.background = 'rgba(239,68,68,0.15)';
      b.style.borderColor = 'rgba(239,68,68,0.5)';
      b.style.color = '#fca5a5';
    }
  });

  if (idx === correct) {
    score++;
  }

  setTimeout(() => {
    currentQ++;
    loadQuestion();
  }, 1000);
}

function showResult() {
  const quizContent = document.getElementById('quizContent');
  const quizResult = document.getElementById('quizResult');
  const emoji = document.getElementById('resultEmoji');
  const title = document.getElementById('resultTitle');
  const desc = document.getElementById('resultDesc');

  if (!quizContent || !quizResult || !emoji || !title || !desc) {
    return;
  }

  quizContent.classList.add('hidden');
  quizResult.classList.remove('hidden');

  if (score >= 4) {
    emoji.textContent = '🏆';
    title.textContent = 'Level: N5 Intermediate';
    desc.textContent = 'Hebat! Kamu sudah punya dasar yang bagus. Lanjutkan ke materi lanjutan!';
  } else if (score >= 2) {
    emoji.textContent = '💪';
    title.textContent = 'Level: N5 Pemula';
    desc.textContent = 'Kamu punya sedikit dasar. Mulai dari Hiragana untuk menguatkan fondasimu!';
  } else {
    emoji.textContent = '🌱';
    title.textContent = 'Level: Pemula Total';
    desc.textContent = 'Tidak apa-apa! Semua orang mulai dari nol. Ayo mulai perjalanan Jepangmu!';
  }
}

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');

    if (!href || href === '#') {
      e.preventDefault();
      return;
    }

    const target = document.querySelector(href);

    if (target) {
      e.preventDefault();
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});
