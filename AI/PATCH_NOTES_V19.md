# GEMU v19 — Real Multi-Agent Hardening

Fokus revisi ini mengikuti kritik v18: multi-agent tidak boleh cuma label, tidak boleh membuat file laporan sebagai draft website, dan semua keputusan edit harus berbasis bukti file.

## Perubahan utama

1. **3 role agent benar-benar berdiskusi**
   - GEMU Frontline memahami bahasa Darma dan UX.
   - GEMU Backend membaca file lokal, mencari bukti target, membuat patch kecil.
   - GEMU Sistem memberi skor, hard-block, dan keputusan akhir.

2. **Minimal 3 ronde diskusi agent**
   - Ronde 1: Frontline memahami intent, Backend membaca kandidat file, Sistem memberi skor awal.
   - Ronde 2: Backend men-tag Sistem bila bukti kurang/ada risiko, Sistem men-tag Frontline untuk format laporan.
   - Ronde 3+: bila skor < 80 atau ada hard-block, agent berdiskusi ulang dan tidak membuat draft spekulatif.

3. **Evidence-based file targeting**
   - GEMU tidak cukup menebak dari prompt.
   - GEMU membaca kandidat file lokal dan menghitung target certainty.
   - Kata ambigu seperti “logo”, “ini”, atau “itu” dibatasi oleh hard-block bila tidak ada bukti file kuat.

4. **Gate skor 0–100**
   - Pemahaman intent: 20
   - Keamanan perubahan: 25
   - Kesesuaian file target: 15
   - Risiko bug kecil: 15
   - Test dasar lolos: 15
   - UX/tampilan tidak rusak: 10

5. **Tidak ada draft laporan palsu**
   - Bila GEMU tidak punya patch teknis aman, hasilnya menjadi `analysis_only`.
   - GEMU tidak lagi membuat file laporan HTML sebagai draft website.
   - Tombol ✓/× hanya muncul untuk draft/decision yang benar-benar actionable.

6. **Log dan terminal lebih rapi**
   - Log dibagi per kolom: Sistem, Draft/Edit, Belajar/Security.
   - Idle agent dialogue ditampilkan sebagai kartu ringkas.
   - Terminal aktif menampilkan aktivitas 5 menit terakhir dan refresh tetap 5 detik.

7. **Cron idle agent**
   - Cron menyimpan dialog ringan ke `AI/agents/idle-dialogue.json`.
   - Mode idle hanya monitoring dan belajar ringan, bukan menulis website.

## Catatan keamanan

Tidak ada sistem yang bisa dijanjikan 100% tanpa error di hosting PHP/cPanel tanpa browser test penuh. Revisi ini menurunkan risiko dengan: bukti file lokal, hard-block, skor agent, staged edit, approval owner, backup, dan test syntax.
