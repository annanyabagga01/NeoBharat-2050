document.addEventListener('DOMContentLoaded', () => {

    // ══════════════════════════════════
    // NARRATION ENGINE (Voice Assistant)
    // ══════════════════════════════════
    class NarrationEngine {
        constructor() {
            this.enabled = false;
        }
        speak() {}
        speakForce() {}
        stop() {}
        toggle() {}
    }

    const narrator = new NarrationEngine();

    // Section narration map
    const NARRATIONS = {
        'hero'     : 'नियो भारत में आपका स्वागत है। सिंधु घाटी की जड़ों से दो हज़ार पचास की ऊंचाइयों तक का एक सिनेमाई सफर।',
        'delhi'    : 'अध्याय एक। नियो दिल्ली। स्मारकों का शहर अब बादलों को छूते ऊर्ध्वाधर जंगलों में बदल चुका है।',
        'education': 'अध्याय दो। न्यूरल लिंक। हजारों वर्षों का ज्ञान, अब कुछ ही सेकंड में आपके मस्तिष्क में।',
        'politics' : 'अध्याय तीन। एल्गोरिथम रिपब्लिक। अरबों सिमुलेशन द्वारा बनाई गई नीतियां, जो केवल जनता की खुशी सुनिश्चित करती हैं।',
        'climate'  : 'अध्याय चार। महान संतुलन। हमने धर्म का मार्ग चुना, अपनी पवित्र नदियों और आकाश को फिर से जीवित किया।',
        'voting'   : 'अध्याय पांच। डिजिटल लोकतंत्र। दो प्रकार के मत — एआई न्यूरल वोट और मानव विवेक मत — भारत का भविष्य तय करते हैं।',
        'predictor': 'स्कैनर में कदम रखें। एआई को दो हज़ार पचास में आपकी सही भूमिका चुनने दें।',
        'mars'     : 'अंतिम अध्याय। मंगलयान कॉलोनी। भारत की आत्मा, अब सितारों के पार।'
    };

    // Military briefing text (for ARIA)
    const MILITARY_BRIEFING =
        'Ministry of National Defense briefing initiated. ' +
        'Bio-augmented army strength: 52 lakh soldiers. ' +
        'Oceanic and orbital navy: 18 lakh personnel. ' +
        'Hypersonic air force: 24 lakh personnel. ' +
        'Conflict record since 1947: 14 wins, 1 stalemate, zero losses. ' +
        'Strategic dominance status: ABSOLUTE. ' +
        'Neo Bharat remains the supreme military force in the solar system.';

    // ══════════════════════════════
    // VOICE INDICATOR (bottom-left)
    // ══════════════════════════════
    const voiceIndicator = document.getElementById('voice-indicator');
    const viText         = document.getElementById('vi-text');

    function showVoiceIndicator(text) {
        if (!voiceIndicator) return;
        const short = text.length > 50 ? text.slice(0, 50) + '…' : text;
        if (viText) viText.textContent = short;
        voiceIndicator.classList.remove('hidden');
    }
    function hideVoiceIndicator() {
        if (voiceIndicator) voiceIndicator.classList.add('hidden');
    }

    // ══════════════════
    // SOUND ENGINE
    // ══════════════════
    class SoundEngine {
        constructor() { this.ctx = null; this.ambientOsc = null; this.gainNode = null; this.initialized = false; }

        init() {
            if (this.initialized) return;
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.ctx.createGain();
            this.gainNode.connect(this.ctx.destination);
            this.gainNode.gain.value = 0.05;
            this.initialized = true;
        }

        startAmbient() {
            this.init();
            if (this.ambientOsc) return;
            this.ambientOsc = this.ctx.createOscillator();
            this.ambientOsc.type = 'sawtooth';
            this.ambientOsc.frequency.setValueAtTime(55, this.ctx.currentTime);
            const lpf = this.ctx.createBiquadFilter();
            lpf.type = 'lowpass';
            lpf.frequency.setValueAtTime(200, this.ctx.currentTime);
            this.ambientOsc.connect(lpf);
            lpf.connect(this.gainNode);
            this.ambientOsc.start();
        }

        playBeep(freq = 880, duration = 0.1) {
            this.init();
            const osc = this.ctx.createOscillator();
            const g   = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            osc.connect(g);
            g.connect(this.ctx.destination);
            g.gain.setValueAtTime(0.1, this.ctx.currentTime);
            g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        }
    }

    const sounds = new SoundEngine();

    // ══════════════════════
    // LENIS SMOOTH SCROLL
    // ══════════════════════
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
    });

    function raf(time) {
        lenis.raf(time);
        const progress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        const bar = document.getElementById('scroll-progress');
        if (bar) bar.style.width = progress + '%';
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // ══════════════════════════════
    // SECTION OBSERVER (blur + narrate)
    // ══════════════════════════════
    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                const id = entry.target.id;
                if (NARRATIONS[id]) narrator.speak(NARRATIONS[id], id);
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, { threshold: 0.15 });

    document.querySelectorAll('.section').forEach(s => sectionObserver.observe(s));

    // ══════════════════════
    // THREE.JS BACKGROUND
    // ══════════════════════
    const canvas   = document.querySelector('#bg-canvas');
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    const particlesGeometry = new THREE.BufferGeometry();
    const posArray = new Float32Array(5000 * 3).map(() => (Math.random() - 0.5) * 10);
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    const particlesMaterial = new THREE.PointsMaterial({ size: 0.005, color: 0x00f2ff, transparent: true, opacity: 0.5 });
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);
    camera.position.z = 5;

    const shapesGroup = new THREE.Group();
    scene.add(shapesGroup);
    const geos = [new THREE.TorusGeometry(0.5, 0.2, 16, 100), new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.IcosahedronGeometry(0.5)];
    for (let i = 0; i < 15; i++) {
        const mat  = new THREE.MeshPhongMaterial({ color: Math.random() > 0.5 ? 0x00f2ff : 0xbc00ff, wireframe: true, transparent: true, opacity: 0.3 });
        const mesh = new THREE.Mesh(geos[Math.floor(Math.random() * geos.length)], mat);
        mesh.position.set((Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15, (Math.random() - 0.5) * 15);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        shapesGroup.add(mesh);
    }
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const pointLight = new THREE.PointLight(0x00f2ff, 1);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    let mouseX = 0, mouseY = 0;
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth - 0.5;
        mouseY = e.clientY / window.innerHeight - 0.5;
        if (cursorGlow) gsap.to(cursorGlow, { left: e.clientX, top: e.clientY, duration: 0.1, ease: 'power2.out' });
    });

    (function animate() {
        requestAnimationFrame(animate);
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += (mouseY * 0.05 - particlesMesh.rotation.x) * 0.05;
        particlesMesh.rotation.y += (mouseX * 0.05 - particlesMesh.rotation.y) * 0.05;
        shapesGroup.children.forEach((s, i) => {
            s.rotation.x += 0.01; s.rotation.y += 0.01;
            s.position.y += Math.sin(Date.now() * 0.001 + i) * 0.002;
        });
        renderer.render(scene, camera);
    })();

    // ══════════════════
    // GSAP ANIMATIONS
    // ══════════════════
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.reveal-text', { opacity: 1, y: 0, duration: 1, stagger: 0.3, ease: 'power4.out' });

    document.querySelectorAll('.section').forEach(section => {
        const content = section.querySelector('.content-box');
        const visual  = section.querySelector('.visual-box');
        if (content) gsap.from(content, { scrollTrigger: { trigger: section, start: 'top 80%' }, x: -50, opacity: 0, duration: 1, ease: 'power3.out' });
        if (visual)  gsap.from(visual,  { scrollTrigger: { trigger: section, start: 'top 80%' }, x: 50, rotateY: 20, opacity: 0, duration: 1.2, ease: 'power3.out' });
    });

    window.addEventListener('load', () => {
        setTimeout(() => {
            gsap.to('#loader', { opacity: 0, duration: 1, onComplete: () => { document.querySelector('#loader').style.display = 'none'; } });
        }, 1500);
    });

    // ══════════════════════
    // SKILL CHIP INTERACTION
    // ══════════════════════
    const chip = document.getElementById('skill-chip');
    const slot = document.getElementById('chip-slot');
    if (chip) {
        chip.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', 'skill'); chip.style.opacity = '0.5'; });
        chip.addEventListener('dragend',   () => { chip.style.opacity = '1'; });
        slot.addEventListener('dragover',  e => { e.preventDefault(); slot.style.borderColor = 'var(--accent-blue)'; });
        slot.addEventListener('drop', e => {
            e.preventDefault();
            if (e.dataTransfer.getData('text/plain') === 'skill') {
                slot.innerHTML = '<div class="success">SKILL UPLOADED: AI ARCHITECT</div>';
                slot.style.background = 'rgba(0,242,255,0.1)';
                gsap.to('body', { backgroundColor: '#00f2ff', duration: 0.1, yoyo: true, repeat: 1, onComplete: () => gsap.to('body', { backgroundColor: '#050505', duration: 0.5 }) });
            }
        });
    }

    // ══════════════════
    // PREDICTOR LOGIC
    // ══════════════════
    const predictBtn = document.getElementById('predict-btn');
    const resultDiv  = document.getElementById('prediction-result');
    const mapping = {
        teacher: 'Mind-Upload Mentor & Neural Educator', doctor: 'Nano-Medic & Bio-Digital Surgeon',
        engineer: 'Quantum Infrastructure Architect', farmer: 'Vertical Forest Cultivator & DNA Harvester',
        pilot: 'Hypersonic Orbital Navigator', lawyer: 'Algorithmic Ethics Arbitrator',
        artist: 'Holographic Sensory Composer', driver: 'Autonomous Swarm Coordinator',
        chef: 'Molecular Nutrient Designer', soldier: 'Bio-Augmented Peacekeeper',
        police: 'Cyber-Security Sentinel', manager: 'Human-AI Collaboration Maestro',
        accountant: 'Blockchain Reality Auditor', writer: 'Multi-Verse Narrative Designer',
        student: 'Neural-Link Knowledge Syncing Cadet'
    };

    if (predictBtn) {
        predictBtn.addEventListener('click', () => {
            const name  = document.getElementById('user-name').value.trim();
            const skill = document.getElementById('user-skill').value.toLowerCase().trim();
            if (!name || !skill) { resultDiv.innerText = 'Please provide your data for the 2050 scan.'; return; }

            let role = '';
            for (const key in mapping) { if (skill.includes(key)) { role = mapping[key]; break; } }
            if (!role) {
                const pre = ['Quantum','Neural','Orbital','Holographic','Bio-Digital','Synthetic','Interstellar'];
                const suf = ['Architect','Maestro','Strategist','Guardian','Curator','Analyst','Designer'];
                role = `${pre[Math.floor(Math.random() * pre.length)]} ${skill.charAt(0).toUpperCase() + skill.slice(1)} ${suf[Math.floor(Math.random() * suf.length)]}`;
            }

            resultDiv.style.opacity = 0;
            sounds.playBeep(600, 0.5);
            setTimeout(() => {
                resultDiv.innerText = `${name}, in 2050, your profession has evolved into: ${role}`;
                gsap.to(resultDiv, { opacity: 1, duration: 1, color: 'var(--accent-blue)' });
                narrator.speakForce(`${name}, in the year 2050, your profession has evolved into: ${role}`);
            }, 500);
        });
    }

    // ════════════════════════════════════════
    // CHAPTER 05 — VOTING SYSTEM
    // ════════════════════════════════════════
    let aiVotes    = 620000000;
    let humanVotes = 380000000;
    let hasVoted   = null; // 'ai' | 'human' | null

    const aiBar      = document.getElementById('ai-bar');
    const humanBar   = document.getElementById('human-bar');
    const aiPct      = document.getElementById('ai-pct');
    const humanPct   = document.getElementById('human-pct');
    const aiVoteNum  = document.getElementById('ai-votes');
    const humVoteNum = document.getElementById('human-votes');
    const termLog    = document.getElementById('terminal-log');

    function formatVotes(n) { return n.toLocaleString('en-IN'); }

    function updateBars() {
        const total = aiVotes + humanVotes;
        const ap = Math.round((aiVotes / total) * 100);
        const hp = 100 - ap;
        if (aiBar)    { aiBar.style.width    = ap + '%'; }
        if (humanBar) { humanBar.style.width = hp + '%'; }
        if (aiPct)    aiPct.textContent    = ap + '%';
        if (humanPct) humanPct.textContent = hp + '%';
        if (aiVoteNum)  aiVoteNum.textContent  = formatVotes(aiVotes);
        if (humVoteNum) humVoteNum.textContent = formatVotes(humanVotes);
    }

    function addTerminalLine(text, cls = '') {
        if (!termLog) return;
        const p = document.createElement('p');
        p.className = 'log-line' + (cls ? ' ' + cls : '');
        p.textContent = '> ' + text;
        termLog.appendChild(p);
        termLog.scrollTop = termLog.scrollHeight;
    }

    // Simulate live incoming votes every 3s
    setInterval(() => {
        aiVotes    += Math.floor(Math.random() * 12000 + 3000);
        humanVotes += Math.floor(Math.random() * 7000  + 1000);
        updateBars();
    }, 3000);

    const castAiBtn    = document.getElementById('cast-ai-vote');
    const castHumanBtn = document.getElementById('cast-human-vote');
    const aiFeedback   = document.getElementById('ai-feedback');
    const humFeedback  = document.getElementById('human-feedback');

    if (castAiBtn) {
        castAiBtn.addEventListener('click', () => {
            if (hasVoted) { addTerminalLine('DUPLICATE VOTE DETECTED — Neural signature already registered.', 'err'); return; }
            hasVoted = 'ai';
            aiVotes += 1;
            updateBars();
            sounds.playBeep(1200, 0.15);
            if (aiFeedback) aiFeedback.textContent = '✓ NEURAL VOTE CONFIRMED';
            castAiBtn.disabled    = true;
            castHumanBtn.disabled = true;
            addTerminalLine('Citizen neural vote received — AI consensus registered on blockchain.');
            addTerminalLine('Hash: 0x' + Math.random().toString(16).slice(2, 18).toUpperCase());
            narrator.speakForce('आपका न्यूरल वोट सफलतापूर्वक ब्लॉकचेन पर दर्ज हो गया है। धन्यवाद, नागरिक।');
        });
    }

    if (castHumanBtn) {
        castHumanBtn.addEventListener('click', () => {
            if (hasVoted) { addTerminalLine('DUPLICATE VOTE DETECTED — Neural signature already registered.', 'err'); return; }
            hasVoted = 'human';
            humanVotes += 1;
            updateBars();
            sounds.playBeep(600, 0.2);
            if (humFeedback) humFeedback.textContent = '✓ CONSCIENCE VOTE CONFIRMED';
            castAiBtn.disabled    = true;
            castHumanBtn.disabled = true;
            addTerminalLine('Human override vote received — Conscience record sealed.', 'warn');
            addTerminalLine('Override hash: 0x' + Math.random().toString(16).slice(2, 18).toUpperCase(), 'warn');
            narrator.speakForce('आपका मानव विवेक मत दर्ज हो गया है। आपका साहस सराहनीय है, नागरिक।');
        });
    }

    updateBars();

    // ════════════════════════════════
    // MINISTRY PORTAL MODAL
    // ════════════════════════════════
    const modal    = document.getElementById('portal-modal');
    const trigger  = document.getElementById('portal-trigger');
    const closeBtn = document.querySelector('.close-modal');
    const mvBtn    = document.getElementById('mv-speak-btn');
    const mvStatus = document.getElementById('mv-status');

    if (trigger) {
        trigger.addEventListener('click', () => {
            modal.style.display = 'block';
            gsap.from('.modal-content', { scale: 0.8, opacity: 0, duration: 0.5, ease: 'back.out(1.7)' });

            document.querySelectorAll('.stat-value').forEach(val => {
                const target = parseInt(val.getAttribute('data-target'));
                const obj = { count: 0 };
                gsap.to(obj, { count: target, duration: 2, ease: 'power3.out', onUpdate: () => { val.innerText = Math.floor(obj.count).toLocaleString(); } });
            });
            gsap.from('.war-count', { innerText: 0, duration: 1.5, snap: { innerText: 1 }, stagger: 0.2 });

            // Auto-play military briefing if voice is enabled
            if (narrator.enabled) {
                setTimeout(() => triggerMilitaryBriefing(), 1000);
            }
        });
    }

    function triggerMilitaryBriefing() {
        if (!mvBtn || !mvStatus) return;
        mvBtn.textContent = '⏹ STOP';
        mvBtn.classList.add('speaking');
        mvStatus.textContent = 'ARIA is delivering classified briefing...';
        narrator.speakForce(MILITARY_BRIEFING);
        // Revert button when done
        const checkDone = setInterval(() => {
            if (!narrator.synth.speaking) {
                clearInterval(checkDone);
                mvBtn.textContent = '▶ PLAY BRIEFING';
                mvBtn.classList.remove('speaking');
                mvStatus.textContent = 'Briefing complete.';
            }
        }, 500);
    }

    if (mvBtn) {
        mvBtn.addEventListener('click', () => {
            if (narrator.synth.speaking) {
                narrator.stop();
                mvBtn.textContent = '▶ PLAY BRIEFING';
                mvBtn.classList.remove('speaking');
                if (mvStatus) mvStatus.textContent = 'Briefing stopped.';
            } else {
                // Enable narrator temporarily if needed
                const wasEnabled = narrator.enabled;
                narrator.enabled = true;
                triggerMilitaryBriefing();
                if (!wasEnabled) {
                    // Restore after briefing
                    const restore = setInterval(() => {
                        if (!narrator.synth.speaking) { narrator.enabled = wasEnabled; clearInterval(restore); }
                    }, 500);
                }
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            narrator.stop();
            if (mvBtn) { mvBtn.textContent = '▶ PLAY BRIEFING'; mvBtn.classList.remove('speaking'); }
            gsap.to('.modal-content', { scale: 0.8, opacity: 0, duration: 0.3, onComplete: () => { modal.style.display = 'none'; } });
        });
    }

    // ══════════════════
    // IMAGE ZOOM
    // ══════════════════
    const zoomOverlay = document.getElementById('image-zoom-overlay');
    const zoomedImg   = document.getElementById('zoomed-image');
    const closeZoom   = document.querySelector('.close-zoom');

    document.querySelectorAll('.visual-box img, #mars img').forEach(img => {
        img.addEventListener('click', () => {
            zoomedImg.src = img.src;
            zoomOverlay.style.display = 'flex';
            setTimeout(() => zoomOverlay.classList.add('active'), 10);
            sounds.playBeep(1200, 0.05);
        });
    });
    if (zoomOverlay) {
        const hideZoom = () => { zoomOverlay.classList.remove('active'); setTimeout(() => zoomOverlay.style.display = 'none', 300); };
        zoomOverlay.addEventListener('click', hideZoom);
        if (closeZoom) closeZoom.addEventListener('click', hideZoom);
    }

    // ════════════════════════════════════════════════════
    // FIRST INTERACTION — enable sound + voice assistant
    // ════════════════════════════════════════════════════
    let experienceStarted = false;
    document.addEventListener('mousedown', () => {
        if (experienceStarted) return;
        experienceStarted = true;
        sounds.startAmbient();
        narrator.toggle(true); // auto-enable voice on first click

        const active = document.querySelector('.section.active');
        if (active && NARRATIONS[active.id]) narrator.speak(NARRATIONS[active.id], active.id);
    }, { once: false });

    // ══════════════════
    // THEME TOGGLE
    // ══════════════════
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            sounds.playBeep(1200, 0.05);
            particlesMaterial.color.setHex(document.body.classList.contains('light-mode') ? 0xbc00ff : 0x00f2ff);
        });
    }

    // Beep on all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => sounds.playBeep(1000, 0.02));
        btn.addEventListener('click',      () => sounds.playBeep(800, 0.1));
    });

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});
