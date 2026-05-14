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
                <div id="packets-container" class="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20">
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
        let currentFile = '../data.js';
        let rawData = '';
        
        let certs = [];
        let certsI18n = {};
        let skills = [];
        let skillsI18n = {};
        let projects = [];
        let projectsI18n = {};
        
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
            try {
                const certsMatch = content.match(/const certsData = (\[[\s\S]*?\]);/);
                const certsI18nMatch = content.match(/const certsI18n = (\{[\s\S]*?\});/);
                const skillsMatch = content.match(/const skillsData = (\[[\s\S]*?\]);/);
                const skillsI18nMatch = content.match(/const skillsI18n = (\{[\s\S]*?\});/);
                const projMatch = content.match(/const projData = (\[[\s\S]*?\]);/);
                const projI18nMatch = content.match(/const projI18n = (\{[\s\S]*?\});/);

                if (certsMatch) certs = eval(certsMatch[1]);
                if (certsI18nMatch) certsI18n = eval('(' + certsI18nMatch[1] + ')');
                if (skillsMatch) skills = eval(skillsMatch[1]);
                if (skillsI18nMatch) skillsI18n = eval('(' + skillsI18nMatch[1] + ')');
                if (projMatch) projects = eval(projMatch[1]);
                if (projI18nMatch) projectsI18n = eval('(' + projI18nMatch[1] + ')');
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
            currentFile = '../data.js';
            setMode('visual');
            
            document.querySelectorAll('aside nav button').forEach(btn => {
                btn.classList.remove('bg-blue-500/10', 'text-blue-400', 'border', 'border-blue-500/20');
                btn.classList.add('text-slate-400');
            });
            document.getElementById('nav-' + section).classList.add('bg-blue-500/10', 'text-blue-400', 'border', 'border-blue-500/20');
            document.getElementById('nav-' + section).classList.remove('text-slate-400');
            
            const title = document.getElementById('section-title');
            const desc = document.getElementById('section-desc');

            if (section === 'certs') {
                title.textContent = "Manage Certificates";
                desc.textContent = "Edit, add, or remove your professional certifications and uploads.";
            } else if (section === 'projects') {
                title.textContent = "Manage Projects";
                desc.textContent = "Showcase your work, technical stacks, and project details.";
            } else if (section === 'skills') {
                title.textContent = "Manage Skills";
                desc.textContent = "Update your technical proficiency levels and icons.";
            }
            renderPackets();
            lucide.createIcons();
        }

        function renderPackets() {
            const container = document.getElementById('packets-container');
            container.innerHTML = '';

            if (currentSection === 'certs') {
                renderCertPackets(container);
            } else if (currentSection === 'skills') {
                renderSkillPackets(container);
            } else if (currentSection === 'projects') {
                renderProjectPackets(container);
            }
        }

        function renderCertPackets(container) {
            certs.forEach((c, index) => {
                const title = certsI18n[c.titleKey] || { id: '', en: '' };
                const desc = certsI18n[c.descKey] || { id: '', en: '' };
                const tag = certsI18n[c.tagKey] || { id: '', en: '' };

                const card = document.createElement('div');
                card.className = 'packet-card p-6 rounded-3xl flex flex-col gap-6';
                card.innerHTML = `
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-700">${index + 1}</div>
                            <span class="text-xs font-bold text-slate-300">CERTIFICATE PACKET</span>
                        </div>
                        <button onclick="removePacket(${index})" class="text-slate-600 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
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
                            <input type="text" value="${c.tagIcon}" onchange="updatePacket(${index}, 'tagIcon', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-blue-500 outline-none">
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
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function renderSkillPackets(container) {
            skills.forEach((s, index) => {
                const name = skillsI18n[s.key] || { id: s.key, en: s.key };
                const card = document.createElement('div');
                card.className = 'packet-card p-6 rounded-3xl flex flex-col gap-4';
                card.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20"><i data-lucide="${s.icon}" class="w-4 h-4"></i></div>
                            <span class="text-xs font-bold text-slate-300">SKILL PACKET</span>
                        </div>
                        <button onclick="removePacket(${index})" class="text-slate-600 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama (ID)</label>
                            <input type="text" value="${name.id}" onchange="updatePacket(${index}, 'skill_name', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Name (EN)</label>
                            <input type="text" value="${name.en}" onchange="updatePacket(${index}, 'skill_name_en', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white">
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Icon Name (Lucide)</label>
                            <input type="text" value="${s.icon}" onchange="updatePacket(${index}, 'icon', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Percentage (%)</label>
                            <input type="number" value="${s.pct}" onchange="updatePacket(${index}, 'pct', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white">
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        function renderProjectPackets(container) {
            projects.forEach((p, index) => {
                const title = projectsI18n[p.titleKey] || { id: '', en: '' };
                const desc = projectsI18n[p.descKey] || { id: '', en: '' };
                const detail = projectsI18n[p.detailKey] || { id: '', en: '' };

                const card = document.createElement('div');
                card.className = 'packet-card p-6 rounded-3xl flex flex-col gap-6';
                card.innerHTML = `
                    <div class="flex items-start justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-xs font-bold border border-slate-700">${index + 1}</div>
                            <span class="text-xs font-bold text-slate-300">PROJECT PACKET</span>
                        </div>
                        <button onclick="removePacket(${index})" class="text-slate-600 hover:text-red-500 transition-colors"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Judul (ID)</label>
                            <input type="text" value="${title.id}" onchange="updatePacket(${index}, 'p_title_id', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Title (EN)</label>
                            <input type="text" value="${title.en}" onchange="updatePacket(${index}, 'p_title_en', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500">
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Ringkasan (ID)</label>
                            <textarea onchange="updatePacket(${index}, 'p_desc_id', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white h-20 outline-none focus:border-blue-500">${desc.id}</textarea>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Summary (EN)</label>
                            <textarea onchange="updatePacket(${index}, 'p_desc_en', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white h-20 outline-none focus:border-blue-500">${desc.en}</textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detail Lengkap (ID)</label>
                            <textarea onchange="updatePacket(${index}, 'p_detail_id', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white h-32 outline-none focus:border-blue-500" placeholder="Jelaskan lebih detail tentang proyek ini...">${detail.id}</textarea>
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Full Details (EN)</label>
                            <textarea onchange="updatePacket(${index}, 'p_detail_en', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white h-32 outline-none focus:border-blue-500" placeholder="Explain project details in English...">${detail.en}</textarea>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Cover Image Upload -->
                        <div class="flex flex-col gap-3">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cover Image</label>
                            <div class="relative group h-40 rounded-2xl border border-slate-800 border-dashed bg-slate-900/50 overflow-hidden flex flex-col items-center justify-center">
                                ${p.imgSrc ? `
                                    <img src="${p.imgSrc}" class="w-full h-full object-cover opacity-40">
                                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/60">
                                        <button onclick="triggerProjectUpload(${index}, 'img')" class="px-4 py-2 bg-blue-600 text-[10px] font-bold text-white rounded-lg">GANTI COVER</button>
                                    </div>
                                ` : `
                                    <button onclick="triggerProjectUpload(${index}, 'img')" class="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors">
                                        <i data-lucide="image" class="w-6 h-6"></i>
                                        <span class="text-[10px] font-bold">UPLOAD COVER</span>
                                    </button>
                                `}
                                <input type="file" id="p-img-${index}" class="hidden" onchange="handleProjectUpload(${index}, 'img', this)">
                            </div>
                            <input type="text" value="${p.imgSrc}" onchange="updatePacket(${index}, 'imgSrc', this.value)" class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-slate-400 outline-none" placeholder="Atau paste URL gambar...">
                        </div>

                        <!-- Project File Upload -->
                        <div class="flex flex-col gap-3">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project File / Link</label>
                            <div class="relative group h-40 rounded-2xl border border-slate-800 border-dashed bg-slate-900/50 overflow-hidden flex flex-col items-center justify-center">
                                ${p.fileUrl ? `
                                    <div class="flex flex-col items-center gap-2">
                                        <i data-lucide="${p.fileUrl.endsWith('.pdf') ? 'file-text' : 'link'}" class="w-8 h-8 text-blue-500"></i>
                                        <span class="text-[10px] font-medium text-slate-400 truncate max-w-[150px]">${p.fileUrl.split('/').pop()}</span>
                                    </div>
                                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-950/60">
                                        <button onclick="triggerProjectUpload(${index}, 'file')" class="px-4 py-2 bg-blue-600 text-[10px] font-bold text-white rounded-lg">GANTI FILE</button>
                                    </div>
                                ` : `
                                    <button onclick="triggerProjectUpload(${index}, 'file')" class="flex flex-col items-center gap-2 text-slate-500 hover:text-white transition-colors">
                                        <i data-lucide="file-up" class="w-6 h-6"></i>
                                        <span class="text-[10px] font-bold">UPLOAD FILE</span>
                                    </button>
                                `}
                                <input type="file" id="p-file-${index}" class="hidden" onchange="handleProjectUpload(${index}, 'file', this)">
                            </div>
                            <input type="text" value="${p.fileUrl}" onchange="updatePacket(${index}, 'fileUrl', this.value)" class="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-[10px] text-blue-400 outline-none" placeholder="Atau paste URL/Link...">
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tags (pisahkan koma)</label>
                            <input type="text" value="${(p.tags || []).join(', ')}" onchange="updatePacket(${index}, 'tags', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500" placeholder="e.g. Python, AI, React">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Label</label>
                            <input type="text" value="${p.fileLabel || ''}" onchange="updatePacket(${index}, 'fileLabel', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500" placeholder="e.g. Website Belajar">
                        </div>
                        <div class="flex flex-col gap-2">
                            <label class="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Project Span (Grid Layout)</label>
                            <select onchange="updatePacket(${index}, 'span', this.value)" class="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-blue-500">
                                <option value="" ${p.span === '' ? 'selected' : ''}>Normal (1 Column)</option>
                                <option value="sm:col-span-2" ${p.span === 'sm:col-span-2' ? 'selected' : ''}>Wide (2 Columns)</option>
                                <option value="sm:col-span-2 md:col-span-3" ${p.span === 'sm:col-span-2 md:col-span-3' ? 'selected' : ''}>Full (3 Columns)</option>
                            </select>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });
        }

        // --- Actions ---
        function addPacket() {
            const id = Date.now();
            if (currentSection === 'certs') {
                certs.push({
                    imgSrc: '', pdfSrc: '',
                    tagKey: `cert.tag_${id}`, tagIcon: 'award',
                    titleKey: `cert.t_${id}`, descKey: `cert.d_${id}`,
                    featured: false, span: ''
                });
                certsI18n[`cert.tag_${id}`] = { id: 'Sertifikat', en: 'Certificate' };
                certsI18n[`cert.t_${id}`] = { id: 'Judul Baru', en: 'New Title' };
                certsI18n[`cert.d_${id}`] = { id: 'Deskripsi...', en: 'Description...' };
            } else if (currentSection === 'skills') {
                const key = `Skill_${id}`;
                skills.push({ icon: 'code-2', key: key, pct: 50 });
                skillsI18n[key] = { id: 'Skill Baru', en: 'New Skill' };
            } else if (currentSection === 'projects') {
                projects.push({
                    imgSrc: '', fullSrc: '', fileUrl: '', fileLabel: '', tags: [],
                    titleKey: `proj.t_${id}`, descKey: `proj.d_${id}`, detailKey: `proj.detail_${id}`, span: '', linkUrl: ''
                });
                projectsI18n[`proj.t_${id}`] = { id: 'Proyek Baru', en: 'New Project' };
                projectsI18n[`proj.d_${id}`] = { id: 'Ringkasan...', en: 'Summary...' };
                projectsI18n[`proj.detail_${id}`] = { id: 'Detail...', en: 'Detail...' };
            }
            renderPackets();
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }

        function removePacket(index) {
            if (!confirm('Hapus item ini?')) return;
            if (currentSection === 'certs') certs.splice(index, 1);
            else if (currentSection === 'skills') skills.splice(index, 1);
            else if (currentSection === 'projects') projects.splice(index, 1);
            renderPackets();
        }

        function updatePacket(index, field, value) {
            if (currentSection === 'certs') {
                const c = certs[index];
                if (field === 'title_id') certsI18n[c.titleKey].id = value;
                else if (field === 'title_en') certsI18n[c.titleKey].en = value;
                else if (field === 'desc_id') certsI18n[c.descKey].id = value;
                else if (field === 'tag_id') certsI18n[c.tagKey].id = value;
                else if (field === 'tagIcon') c.tagIcon = value;
                else if (field === 'featured') c.featured = value;
            } else if (currentSection === 'skills') {
                const s = skills[index];
                if (field === 'skill_name') skillsI18n[s.key].id = value;
                else if (field === 'icon') s.icon = value;
                else if (field === 'pct') s.pct = parseInt(value) || 0;
            } else if (currentSection === 'projects') {
                const p = projects[index];
                if (field === 'p_title_id') projectsI18n[p.titleKey].id = value;
                else if (field === 'p_title_en') projectsI18n[p.titleKey].en = value;
                else if (field === 'p_desc_id') projectsI18n[p.descKey].id = value;
                else if (field === 'p_desc_en') projectsI18n[p.descKey].en = value;
                else if (field === 'p_detail_id') projectsI18n[p.detailKey].id = value;
                else if (field === 'p_detail_en') projectsI18n[p.detailKey].en = value;
                else if (field === 'fileUrl') p.fileUrl = value;
                else if (field === 'fileLabel') p.fileLabel = value;
                else if (field === 'imgSrc') p.imgSrc = value;
                else if (field === 'tags') p.tags = value.split(',').map(t => t.trim()).filter(t => t !== '');
                else if (field === 'span') p.span = value;
            }
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
                fd.append('action', 'upload_image'); // Di api.php, upload_image simpan ke uploads/
                fd.append('image', file);
                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.status === 'success') {
                    const url = '/' + data.url.replace(/^\//, '');
                    if (file.name.toLowerCase().endsWith('.pdf')) {
                        certs[index].pdfSrc = url;
                        certs[index].imgSrc = url;
                    } else {
                        certs[index].imgSrc = url;
                        certs[index].pdfSrc = '';
                    }
                    renderPackets();
                    lucide.createIcons();
                } else alert(data.message);
            } catch(e) { alert('Upload gagal.'); }
            finally { showLoading(false); }
        }

        function triggerProjectUpload(index, type) {
            if (type === 'img') document.getElementById(`p-img-${index}`).click();
            else document.getElementById(`p-file-${index}`).click();
        }

        async function handleProjectUpload(index, type, input) {
            const file = input.files[0];
            if (!file) return;
            showLoading(true);
            try {
                const fd = new FormData();
                if (type === 'img') {
                    fd.append('action', 'upload_image');
                    fd.append('image', file);
                } else {
                    fd.append('action', 'upload_project_file');
                    fd.append('project_file', file);
                }
                
                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                
                if (data.status === 'success') {
                    const url = data.url.startsWith('/') ? data.url : '/' + data.url;
                    if (type === 'img') {
                        projects[index].imgSrc = url;
                        projects[index].fullSrc = url;
                    } else {
                        projects[index].fileUrl = url;
                    }
                    renderPackets();
                    lucide.createIcons();
                } else {
                    alert(data.message);
                }
            } catch(e) {
                console.error(e);
                alert('Upload gagal.');
            } finally {
                showLoading(false);
            }
        }

        async function saveAll() {
            showLoading(true);
            try {
                let content = rawData;
                if (currentMode === 'code') content = document.getElementById('editor').value;
                else {
                    // Update regex to be more resilient (handle spaces/newlines/missing semicolons)
                    content = content.replace(/const certsData\s*=\s*\[[\s\S]*?\]\s*;?/, "const certsData = " + JSON.stringify(certs, null, 4) + ";");
                    content = content.replace(/const certsI18n\s*=\s*\{[\s\S]*?\}\s*;?/, "const certsI18n = " + JSON.stringify(certsI18n, null, 4) + ";");
                    content = content.replace(/const skillsData\s*=\s*\[[\s\S]*?\]\s*;?/, "const skillsData = " + JSON.stringify(skills, null, 4) + ";");
                    content = content.replace(/const skillsI18n\s*=\s*\{[\s\S]*?\}\s*;?/, "const skillsI18n = " + JSON.stringify(skillsI18n, null, 4) + ";");
                    content = content.replace(/const projData\s*=\s*\[[\s\S]*?\]\s*;?/, "const projData = " + JSON.stringify(projects, null, 4) + ";");
                    content = content.replace(/const projI18n\s*=\s*\{[\s\S]*?\}\s*;?/, "const projI18n = " + JSON.stringify(projectsI18n, null, 4) + ";");
                }
                const fd = new FormData();
                fd.append('action', 'save_file');
                fd.append('filename', currentFile);
                fd.append('content', content);
                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                if (data.status === 'success') { 
                    rawData = content; 
                    alert('Data disinkronkan!'); 
                    if (currentFile !== '../data.js') {
                        // Jika mengedit file sistem lain, muat ulang datanya agar konsisten
                        location.reload();
                    }
                }
                else alert(data.message);
            } catch(e) { console.error(e); alert('Simpan gagal.'); }
            finally { showLoading(false); }
        }

        function showLoading(show) {
            document.getElementById('loading-overlay').classList.toggle('hidden', !show);
            document.getElementById('loading-overlay').classList.toggle('flex', show);
        }

        async function loadRawFile(filename) {
            showLoading(true);
            try {
                const fd = new FormData();
                fd.append('action', 'load_file');
                fd.append('filename', filename);

                const res = await fetch('api.php', { method: 'POST', body: fd });
                const data = await res.json();
                
                if(data.status === 'success') {
                    currentFile = filename;
                    setMode('code');
                    document.getElementById('editor').value = data.content;
                    document.getElementById('file-name').textContent = "EDITING: " + filename.split('/').pop();
                }
            } catch(e) {
                alert('Gagal memuat file.');
            } finally {
                showLoading(false);
            }
        }
    </script>
</body>
</html>