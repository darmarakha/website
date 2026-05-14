<?php
session_start();
if (!isset($_SESSION['user_role']) || strtolower($_SESSION['user_role']) !== 'owner') {
    header("Location: ../index.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Owner Dashboard - Premium Editor</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        
        body { 
            background-color: #020617; 
            color: #94a3b8; 
            font-family: 'Plus Jakarta Sans', sans-serif; 
        }
        
        .glass {
            background: rgba(15, 23, 42, 0.6);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(51, 65, 85, 0.5);
        }
        
        .packet-card {
            background: rgba(30, 41, 59, 0.4);
            border: 1px solid rgba(51, 65, 85, 0.5);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .packet-card:hover {
            border-color: #3b82f6;
            background: rgba(30, 41, 59, 0.6);
            transform: translateY(-2px);
        }

        .code-editor {
            font-family: 'Fira Code', 'Consolas', monospace;
            background: #0f172a;
            color: #e2e8f0;
            tab-size: 4;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }

        .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
        }
        
        .btn-primary:hover {
            box-shadow: 0 6px 16px rgba(37, 99, 235, 0.3);
        }
    </style>
</head>
<body class="h-screen flex flex-col overflow-hidden">

    <!-- Header -->
    <header class="glass h-16 px-8 flex items-center justify-between z-50">
        <div class="flex items-center gap-4">
            <div class="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <i data-lucide="layout-dashboard" class="w-5 h-5 text-blue-500"></i>
            </div>
            <div>
                <h1 class="text-sm font-bold text-white tracking-tight">OWNER DASHBOARD</h1>
                <p class="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Management System</p>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <div class="flex bg-slate-900/50 rounded-lg p-1 border border-slate-800 mr-4">
                <button onclick="setMode('visual')" id="mode-visual" class="px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 bg-blue-600 text-white">
                    <i data-lucide="sparkles" class="w-3.5 h-3.5"></i> Visual Editor
                </button>
                <button onclick="setMode('code')" id="mode-code" class="px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 text-slate-400 hover:text-white">
                    <i data-lucide="code" class="w-3.5 h-3.5"></i> Code Editor
                </button>
            </div>
            
            <a href="../index.php" class="p-2.5 rounded-lg bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800 transition-all border border-slate-700/50">
                <i data-lucide="external-link" class="w-5 h-5"></i>
            </a>
            
            <button onclick="saveAll()" id="btn-save" class="btn-primary px-6 py-2.5 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2">
                <i data-lucide="save" class="w-4 h-4"></i> SIMPAN PERUBAHAN
            </button>
        </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
        
        <!-- Sidebar Navigation -->
        <aside class="w-20 lg:w-64 glass border-r border-slate-800/50 flex flex-col transition-all">
            <div class="p-6 flex flex-col gap-8">
                <section>
                    <h2 class="hidden lg:block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Content Editor</h2>
                    <nav class="flex flex-col gap-2">
                        <button onclick="loadSection('certs')" id="nav-certs" class="w-full p-3 rounded-xl flex items-center gap-3 transition-all bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <i data-lucide="award" class="w-5 h-5"></i>
                            <span class="hidden lg:block text-xs font-bold">Certificates</span>
                        </button>
                        <button onclick="loadSection('projects')" id="nav-projects" class="w-full p-3 rounded-xl flex items-center gap-3 transition-all text-slate-400 hover:bg-slate-800/50">
                            <i data-lucide="folder-kanban" class="w-5 h-5"></i>
                            <span class="hidden lg:block text-xs font-bold">Projects</span>
                        </button>
                        <button onclick="loadSection('skills')" id="nav-skills" class="w-full p-3 rounded-xl flex items-center gap-3 transition-all text-slate-400 hover:bg-slate-800/50">
                            <i data-lucide="zap" class="w-5 h-5"></i>
                            <span class="hidden lg:block text-xs font-bold">Skills</span>
                        </button>
                    </nav>
                </section>

                <section>
                    <h2 class="hidden lg:block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Advanced</h2>
                    <nav class="flex flex-col gap-2">
                        <button onclick="loadRawFile('../data.js')" class="w-full p-3 rounded-xl flex items-center gap-3 transition-all text-slate-400 hover:bg-slate-800/50">
                            <i data-lucide="file-json" class="w-5 h-5"></i>
                            <span class="hidden lg:block text-xs font-bold">Edit data.js</span>
                        </button>
                    </nav>
                </section>
            </div>
            
            <div class="mt-auto p-6 border-t border-slate-800/50">
                <div class="hidden lg:block bg-slate-900/50 rounded-xl p-4 border border-slate-800/50">
                    <p class="text-[10px] text-slate-500 leading-relaxed italic">
                        "Your content is synchronized across all devices automatically."
                    </p>
                </div>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="flex-1 overflow-y-auto p-8 lg:p-12">
            
            <!-- Visual Editor Container -->
            <div id="visual-editor" class="max-w-6xl mx-auto">
                <div class="flex items-center justify-between mb-10">
                    <div>
                        <h2 id="section-title" class="text-2xl font-bold text-white mb-2">Manage Certificates</h2>
                        <p id="section-desc" class="text-sm text-slate-500">Edit, add, or remove your professional certifications and uploads.</p>
                    </div>
                    <button onclick="addPacket()" class="bg-blue-600 hover:bg-blue-500 text-white w-12 h-12 rounded-2xl shadow-lg shadow-blue-900/20 flex items-center justify-center transition-all active:scale-95">
                        <i data-lucide="plus" class="w-6 h-6"></i>
                    </button>
                </div>

                <!-- Packets Grid -->
                <div id="packets-container" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <!-- Packets will be injected here -->
                </div>
            </div>

            <!-- Code Editor Container (Hidden by default) -->
            <div id="code-editor-container" class="h-full hidden">
                <div class="flex items-center justify-between mb-4">
                    <h2 id="file-name" class="text-sm font-bold text-blue-400 tracking-wider">EDITING: data.js</h2>
                </div>
                <textarea id="editor" spellcheck="false" class="code-editor w-full h-[calc(100%-2rem)] p-8 rounded-2xl border border-slate-800/50 resize-none text-sm focus:outline-none focus:border-blue-500/50"></textarea>
            </div>

        </main>
    </div>

    <!-- Modals / Notifications -->
    <div id="loading-overlay" class="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] hidden items-center justify-center">
        <div class="flex flex-col items-center gap-4">
            <div class="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <p class="text-xs font-bold text-white tracking-[0.2em]">SYNCHRONIZING...</p>
        </div>
    </div>

    <script>
        let currentMode = 'visual';
        let currentSection = 'certs';
        let rawData = '';
        let certs = [];
        let certsI18n = {};
        
        // --- Initialization ---
        window.onload = async () => {
            lucide.createIcons();
            await loadAllData();
        };

        async function loadAllData() {
            showLoading(true);
            try {
                const fd = new FormData();
                fd.append('action', 'load_file');
                fd.append('filename', '../data.js');

                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                
                if(data.status === 'success') {
                    rawData = data.content;
                    parseData(rawData);
                    renderPackets();
                }
            } catch(e) {
                console.error(e);
                alert('Gagal memuat data.');
            } finally {
                showLoading(false);
            }
        }

        function parseData(content) {
            // Very simplified extraction logic for this specific structure
            try {
                const certsMatch = content.match(/const certsData = (\[[\s\S]*?\]);/);
                const i18nMatch = content.match(/const certsI18n = (\{[\s\S]*?\});/);

                if (certsMatch) {
                    // Use eval sparingly, only because we trust the source (our own data.js)
                    // and JSON.parse won't work with JS objects/trailing commas
                    certs = eval(certsMatch[1]);
                }
                if (i18nMatch) {
                    certsI18n = eval('(' + i18nMatch[1] + ')');
                }
            } catch (e) {
                console.error("Parse Error", e);
            }
        }

        // --- UI Logic ---
        function setMode(mode) {
            currentMode = mode;
            document.getElementById('mode-visual').classList.toggle('bg-blue-600', mode === 'visual');
            document.getElementById('mode-visual').classList.toggle('text-white', mode === 'visual');
            document.getElementById('mode-visual').classList.toggle('text-slate-400', mode !== 'visual');
            
            document.getElementById('mode-code').classList.toggle('bg-blue-600', mode === 'code');
            document.getElementById('mode-code').classList.toggle('text-white', mode === 'code');
            document.getElementById('mode-code').classList.toggle('text-slate-400', mode !== 'code');

            document.getElementById('visual-editor').classList.toggle('hidden', mode !== 'visual');
            document.getElementById('code-editor-container').classList.toggle('hidden', mode !== 'code');
            
            if (mode === 'code' && !document.getElementById('editor').value) {
                document.getElementById('editor').value = rawData;
            }
        }

        function loadSection(section) {
            currentSection = section;
            document.querySelectorAll('aside nav button').forEach(btn => {
                btn.classList.remove('bg-blue-500/10', 'text-blue-400', 'border', 'border-blue-500/20');
                btn.classList.add('text-slate-400');
            });
            document.getElementById('nav-' + section).classList.add('bg-blue-500/10', 'text-blue-400', 'border', 'border-blue-500/20');
            document.getElementById('nav-' + section).classList.remove('text-slate-400');
            
            if (section === 'certs') {
                document.getElementById('section-title').textContent = "Manage Certificates";
                document.getElementById('section-desc').textContent = "Edit, add, or remove your professional certifications and uploads.";
                renderPackets();
            } else {
                document.getElementById('packets-container').innerHTML = `<div class="col-span-2 py-20 text-center glass rounded-3xl"><p class="text-slate-500 italic">Editor untuk bagian ini sedang dalam pengembangan. Gunakan Code Editor sementara.</p></div>`;
            }
            lucide.createIcons();
        }

        function renderPackets() {
            const container = document.getElementById('packets-container');
            container.innerHTML = '';

            certs.forEach((c, index) => {
                const title = certsI18n[c.titleKey] || { id: '', en: '' };
                const desc = certsI18n[c.descKey] || { id: '', en: '' };
                const tag = certsI18n[c.tagKey] || { id: '', en: '' };

                const card = document.createElement('div');
                card.className = 'packet-card p-6 rounded-3xl flex flex-col gap-6';
                card.innerHTML = `
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-700">
                                ${index + 1}
                            </div>
                            <span class="text-xs font-bold text-slate-300">CERTIFICATE PACKET</span>
                        </div>
                        <button onclick="removePacket(${index})" class="text-slate-600 hover:text-red-500 transition-colors">
                            <i data-lucide="trash-2" class="w-4 h-4"></i>
                        </button>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul (ID)</label>
                            <input type="text" value="${title.id}" onchange="updatePacket(${index}, 'title_id', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title (EN)</label>
                            <input type="text" value="${title.en}" onchange="updatePacket(${index}, 'title_en', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none">
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Deskripsi (ID)</label>
                        <textarea onchange="updatePacket(${index}, 'desc_id', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none h-20">${desc.id}</textarea>
                    </div>

                    <div class="grid grid-cols-3 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tag (ID)</label>
                            <input type="text" value="${tag.id}" onchange="updatePacket(${index}, 'tag_id', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Icon</label>
                            <input type="text" value="${c.tagIcon}" onchange="updatePacket(${index}, 'tagIcon', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none" placeholder="e.g. code, award">
                        </div>
                        <div class="flex items-center gap-2 pt-6">
                            <input type="checkbox" ${c.featured ? 'checked' : ''} onchange="updatePacket(${index}, 'featured', this.checked)" class="w-4 h-4 rounded border-slate-800 bg-slate-900 text-blue-600">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Featured</label>
                        </div>
                    </div>

                    <div class="flex flex-col gap-3">
                        <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Upload File (PDF / Image)</label>
                        <div class="flex items-center gap-4">
                            <div class="flex-1 h-32 rounded-2xl border border-slate-800 border-dashed flex flex-col items-center justify-center gap-2 relative group overflow-hidden bg-slate-900/50">
                                ${c.imgSrc || c.pdfSrc ? `
                                    <div class="absolute inset-0 z-10 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button onclick="triggerUpload(${index})" class="text-white text-[10px] font-bold bg-blue-600 px-4 py-2 rounded-lg">GANTI FILE</button>
                                    </div>
                                    <div class="w-full h-full flex items-center justify-center p-4">
                                        ${(c.pdfSrc || c.imgSrc || '').toLowerCase().endsWith('.pdf') ? '<i data-lucide="file-text" class="w-8 h-8 text-red-500"></i>' : `<img src="${c.imgSrc}" class="h-full w-full object-contain rounded-lg">`}
                                    </div>
                                ` : `
                                    <button onclick="triggerUpload(${index})" class="text-slate-500 flex flex-col items-center gap-2 hover:text-white transition-all">
                                        <i data-lucide="upload-cloud" class="w-6 h-6"></i>
                                        <span class="text-[10px] font-bold">KLIK UNTUK UPLOAD</span>
                                    </button>
                                `}
                                <input type="file" id="file-${index}" class="hidden" onchange="handleUpload(${index}, this)">
                            </div>
                            <div class="flex flex-col gap-2 flex-1">
                                <p class="text-[10px] text-slate-500 leading-relaxed">
                                    <b class="text-slate-400">Rekomendasi:</b> Gunakan file PDF asli untuk kualitas terbaik di preview.
                                </p>
                                <input type="text" readonly value="${c.pdfSrc || c.imgSrc}" class="bg-transparent border-none text-[10px] text-blue-400 outline-none truncate w-full">
                            </div>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
            lucide.createIcons();
        }

        // --- Actions ---
        function addPacket() {
            const id = Date.now();
            const newCert = {
                imgSrc: '', pdfSrc: '',
                tagKey: `cert.tag_${id}`, tagIcon: 'award',
                titleKey: `cert.t_${id}`, descKey: `cert.d_${id}`,
                featured: false, span: ''
            };
            certsI18n[newCert.tagKey] = { id: 'Sertifikat', en: 'Certificate' };
            certsI18n[newCert.titleKey] = { id: 'Judul Baru', en: 'New Title' };
            certsI18n[newCert.descKey] = { id: 'Deskripsi baru di sini...', en: 'New description here...' };
            
            certs.push(newCert);
            renderPackets();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }

        function removePacket(index) {
            if (confirm('Hapus paket sertifikat ini?')) {
                certs.splice(index, 1);
                renderPackets();
            }
        }

        function updatePacket(index, field, value) {
            const c = certs[index];
            if (field === 'title_id') certsI18n[c.titleKey].id = value;
            else if (field === 'title_en') certsI18n[c.titleKey].en = value;
            else if (field === 'desc_id') certsI18n[c.descKey].id = value;
            else if (field === 'desc_en') certsI18n[c.descKey].en = value;
            else if (field === 'tag_id') certsI18n[c.tagKey].id = value;
            else if (field === 'tagIcon') c.tagIcon = value;
            else if (field === 'featured') c.featured = value;
        }

        function triggerUpload(index) {
            document.getElementById(`file-${index}`).click();
        }

        async function handleUpload(index, input) {
            const file = input.files[0];
            if (!file) return;

            showLoading(true);
            try {
                const fd = new FormData();
                fd.append('action', 'upload_project_file');
                fd.append('project_file', file);

                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();

                if (data.status === 'success') {
                    const url = data.url.replace(/^\//, '../'); // Adjust path for local context
                    if (file.name.toLowerCase().endsWith('.pdf')) {
                        certs[index].pdfSrc = url.replace('../', '');
                        certs[index].imgSrc = url.replace('../', '');
                    } else {
                        certs[index].imgSrc = url.replace('../', '');
                        certs[index].pdfSrc = '';
                    }
                    renderPackets();
                } else {
                    alert(data.message);
                }
            } catch (e) {
                alert('Gagal upload file.');
            } finally {
                showLoading(false);
                input.value = '';
            }
        }

        async function saveAll() {
            showLoading(true);
            try {
                let content = rawData;
                
                if (currentMode === 'code') {
                    content = document.getElementById('editor').value;
                } else {
                    // Regenerate certsData and certsI18n part in rawData
                    const certsStr = "const certsData = " + JSON.stringify(certs, null, 4) + ";";
                    const i18nStr = "const certsI18n = " + JSON.stringify(certsI18n, null, 4) + ";";
                    
                    content = content.replace(/const certsData = \[[\s\S]*?\];/, certsStr);
                    content = content.replace(/const certsI18n = \{[\s\S]*?\};/, i18nStr);
                }

                const fd = new FormData();
                fd.append('action', 'save_file');
                fd.append('filename', '../data.js');
                fd.append('content', content);

                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                
                if (data.status === 'success') {
                    rawData = content;
                    alert('Data berhasil disimpan dan disinkronkan!');
                } else {
                    alert(data.message);
                }
            } catch (e) {
                alert('Gagal menyimpan data.');
            } finally {
                showLoading(false);
            }
        }

        function showLoading(show) {
            document.getElementById('loading-overlay').classList.toggle('hidden', !show);
            document.getElementById('loading-overlay').classList.toggle('flex', show);
        }

        function loadRawFile(filename) {
            setMode('code');
            document.getElementById('file-name').textContent = "EDITING: " + filename.split('/').pop();
        }
    </script>
</body>
</html>