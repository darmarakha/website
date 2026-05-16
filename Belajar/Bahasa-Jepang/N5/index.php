<?php
$staticExport = __DIR__ . '/out/index.html';
if (is_file($staticExport)) {
    readfile($staticExport);
    exit;
}

function h($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function safe_module_id($value) {
    return preg_replace('/[^a-z0-9\-]/', '', strtolower((string)$value));
}

$modules = [
    'kana' => [
        'id' => 'kana',
        'title' => 'Kana Library',
        'desc' => 'Hiragana dan Katakana dasar dengan latihan baca bertahap.',
        'icon' => 'あ',
        'tag' => 'Kana',
        'level' => 'Dasar',
        'goal' => 'Mengenali bunyi, bentuk, dan pola dasar Hiragana serta Katakana sebelum masuk kosakata.',
        'points' => ['Hiragana dasar: あ, い, う, え, お', 'Katakana dasar: ア, イ, ウ, エ, オ', 'Perbedaan penggunaan Hiragana untuk kata Jepang dan Katakana untuk kata serapan', 'Latihan membaca suku kata pendek tanpa bergantung pada romaji'],
        'sample' => ['jp' => 'あい・いえ・うえ', 'ro' => 'ai・ie・ue', 'id' => 'cinta/sayang, rumah, atas'],
        'practice' => ['Baca 5 kana acak dengan suara pelan.', 'Cocokkan Hiragana dan Katakana yang bunyinya sama.', 'Tulis ulang kana yang paling sering tertukar.'],
        'quiz' => ['q' => 'Huruf 「あ」 dibaca apa?', 'options' => ['a', 'i', 'u', 'e'], 'answer' => 0, 'explain' => '「あ」 dibaca a. Ini huruf pertama dalam deret vokal Hiragana.'],
    ],
    'vocab' => [
        'id' => 'vocab',
        'title' => 'Kosakata N5',
        'desc' => 'Kata penting JLPT N5 untuk percakapan harian dan latihan AI.',
        'icon' => '語',
        'tag' => 'Vocab',
        'level' => 'N5 Core',
        'goal' => 'Menguasai kata dasar yang sering muncul pada perkenalan, sekolah, waktu, arah, belanja, dan restoran.',
        'points' => ['挨拶[あいさつ] atau salam dasar', 'Kata benda harian seperti 学校[がっこう], 駅[えき], 水[みず]', 'Kata tanya seperti 何[なん], どこ, いくら', 'Kata kerja dasar seperti 行[い]きます, 食[た]べます, 飲[の]みます'],
        'sample' => ['jp' => '水[みず]を 飲[の]みます。', 'ro' => 'Mizu o nomimasu.', 'id' => 'Saya minum air.'],
        'practice' => ['Hafalkan 10 kata per tema.', 'Buat 3 kalimat memakai kata kerja ます.', 'Pisahkan kata benda, kata kerja, dan kata tanya.'],
        'quiz' => ['q' => 'Apa arti 「駅[えき]」?', 'options' => ['sekolah', 'stasiun', 'air', 'guru'], 'answer' => 1, 'explain' => '駅[えき] berarti stasiun. Kata ini sering muncul dalam tema arah dan janji.'],
    ],
    'kanji' => [
        'id' => 'kanji',
        'title' => 'Kanji Mastery',
        'desc' => 'Kanji dasar dengan bacaan, arti, dan contoh sederhana.',
        'icon' => '日',
        'tag' => 'Kanji',
        'level' => 'N5 Kanji',
        'goal' => 'Mengenali kanji paling dasar sambil tetap menampilkan furigana agar aman untuk pemula.',
        'points' => ['日[にち/ひ] = hari/matahari', '月[げつ/つき] = bulan', '人[ひと/じん] = orang', '本[ほん] = buku/asal', '語[ご] = bahasa'],
        'sample' => ['jp' => '日本語[にほんご]の 本[ほん]です。', 'ro' => 'Nihongo no hon desu.', 'id' => 'Ini buku bahasa Jepang.'],
        'practice' => ['Baca kanji bersama furigana.', 'Kelompokkan kanji berdasarkan tema waktu, orang, tempat.', 'Buat kartu kecil: kanji, bacaan, arti.'],
        'quiz' => ['q' => 'Kanji 「日」 pada 日本語[にほんご] dibaca apa?', 'options' => ['ひ', 'に', 'にち', 'に'], 'answer' => 1, 'explain' => 'Dalam 日本語, 「日」 dibaca に sebagai bagian dari kata にほんご.'],
    ],
    'grammar' => [
        'id' => 'grammar',
        'title' => 'Grammar Guide',
        'desc' => 'Pola kalimat N5 dari dasar sampai latihan percakapan.',
        'icon' => '文',
        'tag' => 'Bunpou',
        'level' => 'N5 Grammar',
        'goal' => 'Memahami pola kalimat dasar supaya bisa menjawab dan membuat kalimat pendek dengan benar.',
        'points' => ['AはBです = A adalah B', '〜ですか = apakah ...?', 'NをVます = melakukan V pada objek N', '〜ませんか = ajakan halus', '〜てください = tolong lakukan ...'],
        'sample' => ['jp' => '私[わたし]は 学生[がくせい]です。', 'ro' => 'Watashi wa gakusei desu.', 'id' => 'Saya adalah pelajar.'],
        'practice' => ['Ubah kalimat pernyataan menjadi pertanyaan.', 'Buat kalimat memakai は dan を.', 'Buat ajakan memakai ませんか.'],
        'quiz' => ['q' => 'Pola 「〜ですか」 dipakai untuk apa?', 'options' => ['membuat pertanyaan', 'menyebut harga', 'menolak ajakan', 'menyebut arah'], 'answer' => 0, 'explain' => '〜ですか adalah pola pertanyaan sopan dalam N5.'],
    ],
    'flashcards' => [
        'id' => 'flashcards',
        'title' => 'Flashcards',
        'desc' => 'Latihan mengingat aktif untuk kana, kosakata, dan kanji.',
        'icon' => '⚡',
        'tag' => 'Recall',
        'level' => 'Latihan',
        'goal' => 'Menguatkan ingatan jangka panjang melalui latihan lihat, tebak, cek, dan ulang.',
        'points' => ['Kartu kana untuk bunyi dasar', 'Kartu kosakata tema sekolah dan restoran', 'Kartu kanji dengan furigana', 'Mode pengulangan untuk kata yang salah'],
        'sample' => ['jp' => '表[おもて]: 学校[がっこう] / 裏[うら]: sekolah', 'ro' => 'Omote: gakkou / ura: sekolah', 'id' => 'Contoh kartu: depan kata Jepang, belakang arti.'],
        'practice' => ['Tebak arti sebelum membuka jawaban.', 'Ulang kartu salah sebanyak 3 kali.', 'Buat target 15 kartu per sesi.'],
        'quiz' => ['q' => 'Metode flashcard paling baik dipakai untuk apa?', 'options' => ['menghafal aktif', 'menghapus materi', 'mengganti grammar', 'menghindari latihan'], 'answer' => 0, 'explain' => 'Flashcard melatih recall aktif, bukan sekadar membaca ulang.'],
    ],
    'quiz' => [
        'id' => 'quiz',
        'title' => 'Boss Quiz',
        'desc' => 'Tantangan soal untuk menguji pemahaman N5 secara cepat.',
        'icon' => '🎮',
        'tag' => 'Quiz',
        'level' => 'Challenge',
        'goal' => 'Mengukur pemahaman kana, kosakata, partikel, grammar, dan listening cue secara ringkas.',
        'points' => ['Soal pilihan ganda', 'Pembahasan langsung setelah menjawab', 'Materi campuran N5', 'Cocok untuk pemanasan sebelum ujian latihan'],
        'sample' => ['jp' => 'これは 何[なん]ですか。', 'ro' => 'Kore wa nan desu ka.', 'id' => 'Ini apa?'],
        'practice' => ['Jawab tanpa melihat catatan.', 'Catat alasan jawaban salah.', 'Ulang materi dari soal yang gagal.'],
        'quiz' => ['q' => 'Partikel 「は」 sebagai topik dibaca apa?', 'options' => ['ha', 'wa', 'o', 'e'], 'answer' => 1, 'explain' => 'Ketika menjadi partikel topik, は dibaca wa.'],
    ],
    'ai-chat' => [
        'id' => 'ai-chat',
        'title' => 'Gemu AI Chat',
        'desc' => 'Tanya jawab latihan bahasa Jepang berbasis AI dengan konteks N5.',
        'icon' => '🤖',
        'tag' => 'AI',
        'level' => 'AI Helper',
        'goal' => 'Membantu siswa bertanya arti kata, pola kalimat, contoh kalimat, dan koreksi ringan sesuai level N5.',
        'points' => ['Jawaban format JP, RO, ID', 'Kanji wajib diberi furigana', 'Koreksi partikel dasar', 'Batas kosakata memakai kamus N5 internal'],
        'sample' => ['jp' => '日本語[にほんご]を 勉強[べんきょう]しましょう。', 'ro' => 'Nihongo o benkyou shimashou.', 'id' => 'Ayo belajar bahasa Jepang.'],
        'practice' => ['Tanyakan 1 kosakata baru.', 'Minta 2 contoh kalimat.', 'Minta koreksi kalimat pendek buatan sendiri.'],
        'quiz' => ['q' => 'Format jawaban AI yang dipakai modul ini adalah?', 'options' => ['JP, RO, ID', 'PDF saja', 'Audio saja', 'HTML kosong'], 'answer' => 0, 'explain' => 'Format JP, RO, ID membuat siswa melihat Jepang, romaji, dan arti sekaligus.'],
    ],
    'kaiwa' => [
        'id' => 'kaiwa',
        'title' => 'Kaiwa Studio',
        'desc' => 'Latihan percakapan Jepang dengan format JP, RO, ID.',
        'icon' => '🎙️',
        'tag' => 'Speaking',
        'level' => 'Conversation',
        'goal' => 'Melatih respons percakapan pendek yang natural tetapi tetap aman untuk level N5.',
        'points' => ['Salam dan perkenalan', 'Bertanya hobi dan kegiatan', 'Membuat ajakan sederhana', 'Menjawab dengan kalimat pendek dan sopan'],
        'sample' => ['jp' => '一緒[いっしょ]に 映画[えいが]を 見[み]ませんか。', 'ro' => 'Issho ni eiga o mimasen ka.', 'id' => 'Mau menonton film bersama?'],
        'practice' => ['Jawab pertanyaan dengan 1 kalimat Jepang.', 'Gunakan は, を, に dengan benar.', 'Akhiri dengan pertanyaan balik sederhana.'],
        'quiz' => ['q' => 'Kalimat 「〜ませんか」 biasanya dipakai untuk apa?', 'options' => ['mengajak', 'menghitung uang', 'menyebut warna', 'menulis kanji'], 'answer' => 0, 'explain' => '〜ませんか adalah bentuk ajakan halus, misalnya 見ませんか.'],
    ],
    'choukai' => [
        'id' => 'choukai',
        'title' => 'Choukai Lab',
        'desc' => 'Latihan listening dengan dialog, kata kunci, dan pertanyaan.',
        'icon' => '🎧',
        'tag' => 'Listening',
        'level' => 'Listening',
        'goal' => 'Melatih pemahaman percakapan pendek dari kata kunci waktu, tempat, harga, arah, dan pilihan.',
        'points' => ['Dengarkan waktu: 今日[きょう], 明日[あした], 午前[ごぜん], 午後[ごご]', 'Dengarkan arah: 右[みぎ], 左[ひだり], まっすぐ', 'Dengarkan harga: 円[えん], 百[ひゃく], 三百[さんびゃく]', 'Cari jawaban dari kata yang diulang pembicara'],
        'sample' => ['jp' => '午後[ごご] 三時[さんじ]に 駅[えき]で 会[あ]います。', 'ro' => 'Gogo sanji ni eki de aimasu.', 'id' => 'Bertemu jam tiga sore di stasiun.'],
        'practice' => ['Tulis kata kunci yang terdengar.', 'Tebak waktu/tempat sebelum melihat teks.', 'Ulang audio bagian yang salah.'],
        'quiz' => ['q' => 'Pada kalimat contoh, mereka bertemu di mana?', 'options' => ['sekolah', 'stasiun', 'restoran', 'rumah'], 'answer' => 1, 'explain' => 'Ada kata 駅[えき]で yang berarti di stasiun.'],
    ],
    'writing' => [
        'id' => 'writing',
        'title' => 'Menulis Kana',
        'desc' => 'Latihan menulis dan mengenali bentuk huruf Jepang.',
        'icon' => '✍️',
        'tag' => 'Writing',
        'level' => 'Stroke',
        'goal' => 'Melatih bentuk huruf agar siswa tidak hanya bisa membaca, tetapi juga bisa menulis kana dengan urutan yang masuk akal.',
        'points' => ['Mulai dari kana vokal', 'Perhatikan arah garis', 'Bandingkan huruf mirip seperti さ dan ち', 'Latihan kecil tapi rutin'],
        'sample' => ['jp' => 'あ → い → う → え → お', 'ro' => 'a → i → u → e → o', 'id' => 'Urutan latihan vokal dasar.'],
        'practice' => ['Tulis 5 kana vokal sebanyak 3 baris.', 'Lingkari kana yang bentuknya belum rapi.', 'Ulang hanya huruf yang salah.'],
        'quiz' => ['q' => 'Mana yang termasuk Hiragana?', 'options' => ['あ', 'ア', 'A', '1'], 'answer' => 0, 'explain' => 'あ adalah Hiragana. ア adalah Katakana.'],
    ],
    'kazu' => [
        'id' => 'kazu',
        'title' => 'Latihan Angka',
        'desc' => 'Angka, harga, jam, dan hitungan sederhana.',
        'icon' => '一',
        'tag' => 'Number',
        'level' => 'Angka',
        'goal' => 'Menguasai angka N5 untuk jam, harga, jumlah barang, dan percakapan toko/restoran.',
        'points' => ['一[いち], 二[に], 三[さん]', 'Jam: 一時[いちじ], 二時[にじ], 三時[さんじ]', 'Harga: 百円[ひゃくえん], 三百円[さんびゃくえん]', 'Counter umum: 一つ[ひとつ], 二つ[ふたつ], 三つ[みっつ]'],
        'sample' => ['jp' => '全部[ぜんぶ]で 三百五十円[さんびゃくごじゅうえん]です。', 'ro' => 'Zenbu de sanbyaku gojuu en desu.', 'id' => 'Total semuanya 350 yen.'],
        'practice' => ['Baca angka 1 sampai 10.', 'Latih jam 1 sampai 12.', 'Buat contoh harga 100 sampai 900 yen.'],
        'quiz' => ['q' => '三百円[さんびゃくえん] artinya berapa yen?', 'options' => ['100 yen', '200 yen', '300 yen', '500 yen'], 'answer' => 2, 'explain' => '三百円[さんびゃくえん] berarti 300 yen.'],
    ],
    'exam' => [
        'id' => 'exam',
        'title' => 'Ujian Latihan',
        'desc' => 'Simulasi soal untuk mengukur kesiapan N5.',
        'icon' => '🏆',
        'tag' => 'Exam',
        'level' => 'Review',
        'goal' => 'Mengecek kesiapan akhir setelah belajar kana, kosakata, grammar, kaiwa, dan choukai.',
        'points' => ['Review kana dan kanji dasar', 'Soal kosakata harian', 'Soal partikel dan grammar', 'Soal pemahaman dialog pendek'],
        'sample' => ['jp' => '明日[あした] 学校[がっこう]へ 行[い]きます。', 'ro' => 'Ashita gakkou e ikimasu.', 'id' => 'Besok saya pergi ke sekolah.'],
        'practice' => ['Kerjakan tanpa membuka catatan.', 'Tandai topik yang nilainya rendah.', 'Ulangi modul terkait sebelum tes berikutnya.'],
        'quiz' => ['q' => 'Partikel arah pada kalimat 学校へ行きます adalah?', 'options' => ['へ', 'を', 'か', 'も'], 'answer' => 0, 'explain' => 'へ menjadi partikel arah/tujuan dan dibaca e.'],
    ],
];

$moduleId = safe_module_id($_GET['module'] ?? 'overview');
if (!isset($modules[$moduleId])) {
    $moduleId = 'overview';
}

$overview = [
    'id' => 'overview',
    'title' => 'Alur Belajar N5',
    'desc' => 'Mulai dari kana, lanjut kosakata dan grammar, lalu gunakan Kaiwa dan Choukai untuk melatih respons serta pendengaran.',
    'icon' => 'N5',
    'tag' => 'Roadmap',
    'level' => 'Mulai',
    'goal' => 'Membuat jalur belajar yang jelas dari nol sampai siap latihan soal N5.',
    'points' => ['Kana dulu agar tidak bergantung pada romaji', 'Kosakata dan grammar untuk membangun kalimat', 'Kaiwa untuk bicara, Choukai untuk listening', 'Quiz dan ujian latihan untuk mengukur hasil'],
    'sample' => ['jp' => '私[わたし]は 日本語[にほんご]を 勉強[べんきょう]します。', 'ro' => 'Watashi wa nihongo o benkyou shimasu.', 'id' => 'Saya belajar bahasa Jepang.'],
    'practice' => ['Pilih satu modul dari kartu di atas.', 'Baca target belajar dan contoh kalimat.', 'Kerjakan kuis kecil di panel ini.'],
    'quiz' => ['q' => 'Urutan belajar paling aman untuk pemula adalah?', 'options' => ['Kana → Kosakata → Grammar → Latihan', 'Ujian dulu tanpa materi', 'Kanji sulit dulu', 'Lewati semua latihan'], 'answer' => 0, 'explain' => 'Pemula lebih aman mulai dari kana, lalu kosakata, grammar, dan latihan.'],
];

$selected = $moduleId === 'overview' ? $overview : $modules[$moduleId];

$dictionaryFile = __DIR__ . '/src/lib/n5-dictionary.ts';
$pageFile = __DIR__ . '/src/app/page.tsx';
$packageFile = __DIR__ . '/package.json';
$hasDictionary = is_file($dictionaryFile);
$hasNextPage = is_file($pageFile);
$hasPackage = is_file($packageFile);

if (($_GET['api'] ?? '') === 'module') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['ok' => true, 'module' => $selected, 'modules' => array_values($modules)], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$modulesJson = json_encode($modules, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
$selectedJson = json_encode($selected, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT);
?>
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#0f766e">
    <title>Gemu Nihongo N5 | Bahasa Jepang</title>
    <meta name="description" content="Modul belajar bahasa Jepang JLPT N5 GemuYokai: Kana, kosakata, kanji, grammar, kaiwa, choukai, flashcards, dan latihan ujian.">
    <style>
        :root{--bg:#f7fbfa;--panel:rgba(255,255,255,.82);--panel-strong:rgba(255,255,255,.96);--text:#10201d;--muted:#60726e;--line:rgba(15,118,110,.16);--teal:#0f766e;--mint:#14b8a6;--emerald:#10b981;--rose:#fb7185;--amber:#f59e0b;--shadow:0 24px 70px rgba(15,118,110,.16)}
        *{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-height:100vh;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--text);background:radial-gradient(circle at 14% 12%,rgba(20,184,166,.20),transparent 30%),radial-gradient(circle at 86% 6%,rgba(251,113,133,.16),transparent 28%),linear-gradient(135deg,#f8fffd 0%,#eefbf8 45%,#fff7f8 100%);overflow-x:hidden}body::before{content:'';position:fixed;inset:0;pointer-events:none;opacity:.42;background-image:linear-gradient(rgba(15,118,110,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(15,118,110,.045) 1px,transparent 1px);background-size:36px 36px;mask-image:linear-gradient(to bottom,#000,transparent 78%)}a{color:inherit;text-decoration:none}.wrap{width:min(1180px,calc(100% - 32px));margin:0 auto;position:relative;z-index:2}.topbar{position:sticky;top:0;z-index:20;backdrop-filter:blur(18px);background:rgba(247,251,250,.76);border-bottom:1px solid rgba(15,118,110,.11)}.nav{height:72px;display:flex;align-items:center;justify-content:space-between;gap:18px}.brand{display:flex;align-items:center;gap:12px;font-weight:900;letter-spacing:-.04em}.brand-mark{width:44px;height:44px;border-radius:16px;display:grid;place-items:center;color:white;background:linear-gradient(135deg,var(--teal),var(--mint));box-shadow:0 12px 32px rgba(20,184,166,.32);font-weight:900}.nav-links{display:flex;align-items:center;gap:10px;color:var(--muted);font-weight:800;font-size:13px}.nav-links a{padding:10px 13px;border-radius:999px;border:1px solid transparent}.nav-links a:hover{color:var(--teal);background:rgba(20,184,166,.08);border-color:rgba(20,184,166,.16)}.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;border:0;cursor:pointer;border-radius:999px;padding:13px 18px;font-weight:900;color:white;background:linear-gradient(135deg,var(--teal),var(--emerald));box-shadow:0 18px 42px rgba(16,185,129,.28);transition:transform .2s ease,box-shadow .2s ease}.btn:hover{transform:translateY(-2px);box-shadow:0 22px 50px rgba(16,185,129,.36)}.btn.secondary{color:var(--teal);background:rgba(255,255,255,.72);border:1px solid var(--line);box-shadow:none}.hero{padding:78px 0 44px;display:grid;grid-template-columns:1.04fr .96fr;gap:36px;align-items:center}.eyebrow{display:inline-flex;align-items:center;gap:8px;margin-bottom:18px;border:1px solid rgba(20,184,166,.24);background:rgba(255,255,255,.72);color:var(--teal);border-radius:999px;padding:8px 13px;font-size:12px;font-weight:950;text-transform:uppercase;letter-spacing:.12em}h1{margin:0;font-size:clamp(42px,7vw,86px);line-height:.92;letter-spacing:-.08em}h1 span{display:block;background:linear-gradient(135deg,var(--teal),var(--mint),var(--rose));-webkit-background-clip:text;background-clip:text;color:transparent}.lead{max-width:680px;color:var(--muted);font-size:clamp(16px,2vw,19px);line-height:1.8;margin:22px 0 0}.hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.hero-card{border:1px solid var(--line);border-radius:34px;padding:22px;background:var(--panel);box-shadow:var(--shadow);position:relative;overflow:hidden}.hero-card::before{content:'日本語';position:absolute;right:-12px;top:-22px;font-size:112px;font-weight:950;color:rgba(20,184,166,.08);letter-spacing:-.14em;pointer-events:none}.kanji-card{min-height:370px;border-radius:28px;padding:28px;background:linear-gradient(135deg,#0f766e,#14b8a6 48%,#fb7185);color:white;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}.kanji-card::after{content:'';position:absolute;inset:16px;border:1px solid rgba(255,255,255,.24);border-radius:22px;pointer-events:none}.big-kana{font-size:clamp(92px,16vw,180px);line-height:1;font-weight:950;letter-spacing:-.12em;text-shadow:0 18px 46px rgba(0,0,0,.18)}.mini-line{display:flex;align-items:center;justify-content:space-between;gap:14px}.pill{display:inline-flex;align-items:center;gap:7px;padding:8px 11px;border-radius:999px;background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.2);font-size:12px;font-weight:900}.status-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:22px 0 0}.status{padding:16px;border-radius:22px;background:rgba(255,255,255,.62);border:1px solid var(--line)}.status b{display:block;font-size:22px;color:var(--teal)}.status span{display:block;margin-top:4px;color:var(--muted);font-size:12px;font-weight:800}.section{padding:42px 0}.section-head{display:flex;align-items:end;justify-content:space-between;gap:18px;margin-bottom:22px}.section-title{margin:0;font-size:clamp(26px,3.5vw,42px);letter-spacing:-.05em}.section-sub{margin:8px 0 0;color:var(--muted);line-height:1.7;max-width:680px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.module{min-height:245px;padding:18px;border-radius:26px;border:1px solid var(--line);background:var(--panel-strong);box-shadow:0 14px 44px rgba(15,118,110,.08);position:relative;overflow:hidden;transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.module:hover,.module.active{transform:translateY(-5px);border-color:rgba(20,184,166,.38);box-shadow:0 20px 58px rgba(15,118,110,.16)}.module::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 80% 0%,rgba(20,184,166,.14),transparent 42%);pointer-events:none}.module-top{position:relative;display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.icon{width:52px;height:52px;border-radius:18px;display:grid;place-items:center;color:white;font-size:24px;font-weight:950;background:linear-gradient(135deg,var(--teal),var(--mint));box-shadow:0 12px 34px rgba(20,184,166,.28)}.tag{color:var(--teal);background:rgba(20,184,166,.10);border:1px solid rgba(20,184,166,.15);padding:7px 10px;border-radius:999px;font-size:11px;font-weight:950}.module h3{position:relative;margin:22px 0 8px;font-size:19px;letter-spacing:-.035em}.module p{position:relative;margin:0 0 54px;color:var(--muted);line-height:1.6;font-size:14px}.module form{position:absolute;left:18px;right:18px;bottom:16px}.module button,.quiz-option{width:100%;border:0;border-radius:16px;padding:11px 14px;cursor:pointer;color:var(--teal);background:rgba(20,184,166,.09);font-weight:950}.module button:hover,.quiz-option:hover{background:rgba(20,184,166,.15)}.panel{border:1px solid var(--line);border-radius:30px;background:rgba(255,255,255,.78);box-shadow:var(--shadow);padding:24px;display:grid;grid-template-columns:1.04fr .96fr;gap:24px;align-items:stretch}.lesson-box{border-radius:24px;padding:22px;background:linear-gradient(135deg,rgba(15,118,110,.10),rgba(251,113,133,.09));border:1px solid rgba(15,118,110,.13)}.lesson-box h3{margin:0 0 10px;font-size:24px;letter-spacing:-.04em}.lesson-box p,.lesson-box li{color:var(--muted);line-height:1.7}.module-meta{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px}.module-meta span{padding:7px 10px;border-radius:999px;background:rgba(15,118,110,.09);color:var(--teal);font-size:12px;font-weight:900}.jp-sample{margin-top:16px;border-radius:22px;padding:18px;background:#0f172a;color:#dffcf5;font-weight:800;box-shadow:inset 0 0 0 1px rgba(255,255,255,.08)}.jp-sample .jp{font-size:clamp(20px,3vw,28px);line-height:1.35}.jp-sample .ro{color:#67e8f9;margin-top:10px}.jp-sample .id{color:#fbcfe8;margin-top:6px}.steps{display:grid;gap:12px}.step{border-radius:20px;padding:16px;border:1px solid var(--line);background:rgba(255,255,255,.76);display:flex;gap:14px;align-items:flex-start}.num{width:32px;height:32px;border-radius:12px;display:grid;place-items:center;flex:0 0 auto;color:white;background:var(--teal);font-weight:950}.step b{display:block;margin-bottom:3px}.step span{color:var(--muted);line-height:1.55;font-size:14px}.quiz-box{margin-top:16px;border:1px solid rgba(15,118,110,.16);border-radius:22px;padding:16px;background:rgba(255,255,255,.74)}.quiz-box h4{margin:0 0 10px}.quiz-options{display:grid;grid-template-columns:1fr 1fr;gap:10px}.quiz-result{margin-top:12px;display:none;padding:12px;border-radius:16px;font-weight:800}.quiz-result.show{display:block}.quiz-result.ok{color:#047857;background:rgba(16,185,129,.14)}.quiz-result.no{color:#be123c;background:rgba(251,113,133,.16)}.footer{margin-top:34px;padding:32px 0 42px;color:var(--muted);text-align:center}.hide-mobile{display:inline-flex}@media(max-width:980px){.hero,.panel{grid-template-columns:1fr}.grid{grid-template-columns:repeat(2,minmax(0,1fr))}.nav-links{display:none}.hero{padding-top:52px}}@media(max-width:640px){.wrap{width:min(100% - 22px,1180px)}.nav{height:66px}.brand-text small{display:none}.hero-actions .btn{width:100%}.hero-card{padding:14px;border-radius:26px}.kanji-card{min-height:310px;border-radius:22px;padding:22px}.status-grid,.grid,.quiz-options{grid-template-columns:1fr}.section-head{align-items:flex-start;flex-direction:column}.panel{padding:16px;border-radius:24px}.hide-mobile{display:none}}
    </style>
</head>
<body>
    <header class="topbar">
        <div class="wrap nav">
            <a class="brand" href="./index.php" aria-label="Gemu Nihongo N5"><span class="brand-mark">N5</span><span class="brand-text">Gemu Nihongo<br><small style="color:var(--muted);letter-spacing:0;font-weight:800">JLPT N5 Learning Hub</small></span></a>
            <nav class="nav-links" aria-label="Navigasi N5"><a href="#modul">Modul</a><a href="#belajar">Belajar</a><a href="../index.php">Bahasa Jepang</a></nav>
            <a class="btn secondary hide-mobile" href="../index.php">← Kembali</a>
        </div>
    </header>

    <main>
        <section class="wrap hero">
            <div>
                <div class="eyebrow">🌸 GemuYokai Bahasa Jepang</div>
                <h1>Belajar Jepang <span>Level N5</span></h1>
                <p class="lead">Halaman ini adalah gerbang modul N5 di folder <b>Belajar/Bahasa-Jepang/N5</b>. Semua tombol modul sekarang membaca isi dari backend PHP, jadi setiap klik menampilkan materi, contoh, latihan, dan kuis kecil.</p>
                <div class="hero-actions"><a class="btn" href="#modul">Mulai dari Modul N5 →</a><a class="btn secondary" href="#belajar">Lihat Alur Belajar</a></div>
                <div class="status-grid" aria-label="Status project N5"><div class="status"><b><?php echo $hasPackage ? 'Aktif' : 'Cek'; ?></b><span>package.json</span></div><div class="status"><b><?php echo $hasNextPage ? 'Ada' : 'Belum'; ?></b><span>src/app/page.tsx</span></div><div class="status"><b><?php echo $hasDictionary ? 'Siap' : 'Cek'; ?></b><span>Kamus N5 AI</span></div></div>
            </div>
            <aside class="hero-card" aria-label="Kartu pembuka N5"><div class="kanji-card"><div class="mini-line"><span class="pill">JLPT N5</span><span class="pill">Kaiwa + Choukai</span></div><div><div class="big-kana">日本語</div><p style="margin:8px 0 0;font-weight:800;line-height:1.7">Nihongo • Bahasa Jepang • Dasar sampai siap latihan.</p></div><div class="mini-line"><span>あ い う え お</span><span>文法・語彙・聴解</span></div></div></aside>
        </section>

        <section class="wrap section" id="modul">
            <div class="section-head"><div><h2 class="section-title">Modul N5</h2><p class="section-sub">Disusun dari kana, kosakata, kanji, tata bahasa, latihan AI, kaiwa, choukai, sampai ujian latihan. Setiap tombol punya isi backend sendiri dan fallback URL.</p></div><a class="btn secondary" href="../index.php">Halaman Bahasa Jepang</a></div>
            <div class="grid">
                <?php foreach ($modules as $module): ?>
                    <article class="module <?php echo $module['id'] === $selected['id'] ? 'active' : ''; ?>">
                        <div class="module-top"><span class="icon"><?php echo h($module['icon']); ?></span><span class="tag"><?php echo h($module['tag']); ?></span></div>
                        <h3><?php echo h($module['title']); ?></h3>
                        <p><?php echo h($module['desc']); ?></p>
                        <form method="get" action="./index.php#belajar">
                            <input type="hidden" name="module" value="<?php echo h($module['id']); ?>">
                            <button type="submit" data-module="<?php echo h($module['id']); ?>">Buka isi modul</button>
                        </form>
                    </article>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="wrap section" id="belajar">
            <div class="panel">
                <div class="lesson-box">
                    <div class="module-meta"><span id="focusLevel"><?php echo h($selected['level']); ?></span><span id="focusTag"><?php echo h($selected['tag']); ?></span></div>
                    <h3 id="focusTitle"><?php echo h($selected['title']); ?></h3>
                    <p id="focusDesc"><?php echo h($selected['desc']); ?></p>
                    <p><b>Target:</b> <span id="focusGoal"><?php echo h($selected['goal']); ?></span></p>
                    <div class="jp-sample"><div class="jp" id="sampleJp"><?php echo h($selected['sample']['jp']); ?></div><div class="ro" id="sampleRo"><?php echo h($selected['sample']['ro']); ?></div><div class="id" id="sampleId"><?php echo h($selected['sample']['id']); ?></div></div>
                    <div class="quiz-box" id="quizBox">
                        <h4>Kuis cepat</h4>
                        <p id="quizQuestion"><?php echo h($selected['quiz']['q']); ?></p>
                        <div class="quiz-options" id="quizOptions">
                            <?php foreach ($selected['quiz']['options'] as $idx => $option): ?>
                                <button class="quiz-option" type="button" data-answer="<?php echo (int)$idx; ?>"><?php echo h($option); ?></button>
                            <?php endforeach; ?>
                        </div>
                        <div class="quiz-result" id="quizResult" data-correct="<?php echo (int)$selected['quiz']['answer']; ?>" data-explain="<?php echo h($selected['quiz']['explain']); ?>"></div>
                    </div>
                </div>
                <div class="steps">
                    <div class="step"><span class="num">1</span><div><b>Materi inti</b><span id="pointList"><?php echo h(implode(' • ', $selected['points'])); ?></span></div></div>
                    <div class="step"><span class="num">2</span><div><b>Latihan aktif</b><span id="practiceList"><?php echo h(implode(' • ', $selected['practice'])); ?></span></div></div>
                    <div class="step"><span class="num">3</span><div><b>Contoh wajib</b><span>Gunakan contoh JP, RO, ID di samping sebagai pola latihan utama.</span></div></div>
                    <div class="step"><span class="num">4</span><div><b>Status backend</b><span>Isi panel ini berasal dari array PHP <code>$modules</code> dan bisa dipanggil lewat <code>?api=module&module=<?php echo h($selected['id']); ?></code>.</span></div></div>
                </div>
            </div>
        </section>
    </main>

    <footer class="wrap footer"><b>GemuYokai N5</b> • Semua tombol modul di <code>N5/index.php</code> sudah punya isi backend dan fallback URL.</footer>

    <script>
        const MODULES = <?php echo $modulesJson; ?>;
        let selectedModule = <?php echo $selectedJson; ?>;
        const el = (id) => document.getElementById(id);
        const setText = (id, value) => { const node = el(id); if (node) node.textContent = value || '-'; };

        function renderModule(module) {
            if (!module) return;
            selectedModule = module;
            setText('focusLevel', module.level);
            setText('focusTag', module.tag);
            setText('focusTitle', module.title);
            setText('focusDesc', module.desc);
            setText('focusGoal', module.goal);
            setText('sampleJp', module.sample?.jp);
            setText('sampleRo', module.sample?.ro);
            setText('sampleId', module.sample?.id);
            setText('pointList', (module.points || []).join(' • '));
            setText('practiceList', (module.practice || []).join(' • '));
            setText('quizQuestion', module.quiz?.q);
            const result = el('quizResult');
            if (result) {
                result.className = 'quiz-result';
                result.textContent = '';
                result.dataset.correct = String(module.quiz?.answer ?? 0);
                result.dataset.explain = module.quiz?.explain || 'Pembahasan belum tersedia.';
            }
            const options = el('quizOptions');
            if (options) {
                options.innerHTML = '';
                (module.quiz?.options || []).forEach((option, index) => {
                    const button = document.createElement('button');
                    button.className = 'quiz-option';
                    button.type = 'button';
                    button.dataset.answer = String(index);
                    button.textContent = option;
                    options.appendChild(button);
                });
            }
            document.querySelectorAll('.module').forEach(card => card.classList.remove('active'));
            const activeButton = document.querySelector(`[data-module="${module.id}"]`);
            activeButton?.closest('.module')?.classList.add('active');
        }

        document.querySelectorAll('[data-module]').forEach((button) => {
            button.addEventListener('click', (event) => {
                const moduleId = button.getAttribute('data-module');
                const module = MODULES[moduleId];
                if (!module) return;
                event.preventDefault();
                renderModule(module);
                const url = new URL(window.location.href);
                url.searchParams.set('module', moduleId);
                window.history.pushState({}, '', `${url.pathname}?${url.searchParams.toString()}#belajar`);
                el('belajar')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });

        document.addEventListener('click', (event) => {
            const button = event.target.closest('.quiz-option');
            if (!button) return;
            const result = el('quizResult');
            if (!result) return;
            const correct = Number(result.dataset.correct || 0);
            const selected = Number(button.dataset.answer || 0);
            const isCorrect = correct === selected;
            result.className = `quiz-result show ${isCorrect ? 'ok' : 'no'}`;
            result.textContent = `${isCorrect ? 'Benar.' : 'Belum tepat.'} ${result.dataset.explain || ''}`;
        });
    </script>
</body>
</html>
