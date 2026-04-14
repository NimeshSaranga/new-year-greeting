document.addEventListener('DOMContentLoaded', () => {
    const greetBtn = document.getElementById('greetBtn');
    const greetingBox = document.getElementById('greetingBox');
    const festivalElements = document.getElementById('festivalDecorations');

    let audioCtx;
    let masterNoiseBuffer;

    // --- REALISTIC PROCEDURAL AUDIO SYNTHESIS ---
    function initAudio() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            // Pre-generate white noise for explosions
            const bufferSize = audioCtx.sampleRate * 2; // 2 seconds of noise
            masterNoiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
            const data = masterNoiseBuffer.getChannelData(0);
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1; 
            }
        }
        if (audioCtx.state === 'suspended') audioCtx.resume();
    }

    // Realistic Rocket Launch (Thump + Hiss)
    function playLaunch() {
        if (!audioCtx || !masterNoiseBuffer) return;
        const time = audioCtx.currentTime;

        // 1. The Thump (Low frequency kick)
        const osc = audioCtx.createOscillator();
        const oscGain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, time);
        osc.frequency.exponentialRampToValueAtTime(40, time + 0.2);
        oscGain.gain.setValueAtTime(0.5, time);
        oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        osc.connect(oscGain); oscGain.connect(audioCtx.destination);
        osc.start(time); osc.stop(time + 0.2);

        // 2. The Hiss (Rocket tail)
        const noise = audioCtx.createBufferSource();
        noise.buffer = masterNoiseBuffer;
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1500; // Gritty air sound
        const noiseGain = audioCtx.createGain();
        noiseGain.gain.setValueAtTime(0, time);
        noiseGain.gain.linearRampToValueAtTime(0.15, time + 0.1);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.8);
        noise.connect(filter); filter.connect(noiseGain); noiseGain.connect(audioCtx.destination);
        noise.start(time); noise.stop(time + 0.8);
    }

    // Realistic Explosion (Sharp Crack + Deep Boom)
    function playBoom() {
        if (!audioCtx || !masterNoiseBuffer) return;
        const time = audioCtx.currentTime;

        // 1. The Crack (High frequency snap)
        const crack = audioCtx.createBufferSource();
        crack.buffer = masterNoiseBuffer;
        const crackFilter = audioCtx.createBiquadFilter();
        crackFilter.type = 'highpass';
        crackFilter.frequency.value = 2500;
        const crackGain = audioCtx.createGain();
        crackGain.gain.setValueAtTime(0.8, time);
        crackGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15); // Very fast
        crack.connect(crackFilter); crackFilter.connect(crackGain); crackGain.connect(audioCtx.destination);
        crack.start(time); crack.stop(time + 0.15);

        // 2. The Boom (Deep rumbling explosion)
        const boom = audioCtx.createBufferSource();
        boom.buffer = masterNoiseBuffer;
        const boomFilter = audioCtx.createBiquadFilter();
        boomFilter.type = 'lowpass';
        boomFilter.frequency.value = 200; // Deep low end
        const boomGain = audioCtx.createGain();
        boomGain.gain.setValueAtTime(1, time);
        boomGain.gain.exponentialRampToValueAtTime(0.01, time + 1.8); // Long echo fade out
        boom.connect(boomFilter); boomFilter.connect(boomGain); boomGain.connect(audioCtx.destination);
        boom.start(time); boom.stop(time + 1.8);
    }

    // Realistic Rathigngna (Chaotic String of sharp snaps)
    function playCrackerChain() {
        if (!audioCtx || !masterNoiseBuffer) return;
        
        // Simulate a string of 8 to 15 rapid firecrackers
        let numPops = Math.floor(Math.random() * 8) + 8; 
        
        for(let j = 0; j < numPops; j++) {
            // Randomly stagger the timing
            let offset = audioCtx.currentTime + (Math.random() * 0.8); 
            
            const pop = audioCtx.createBufferSource();
            pop.buffer = masterNoiseBuffer;
            
            const filter = audioCtx.createBiquadFilter();
            filter.type = 'bandpass';
            // Vary pitch slightly for realism
            filter.frequency.value = 1000 + (Math.random() * 2000); 
            
            const gain = audioCtx.createGain();
            // Vary volume slightly
            gain.gain.setValueAtTime(0.3 + (Math.random() * 0.3), offset);
            gain.gain.exponentialRampToValueAtTime(0.01, offset + 0.08); // Sharp cutoff
            
            pop.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
            pop.start(offset); pop.stop(offset + 0.08);
        }
    }
    // ----------------------------------------------------

    if (greetBtn) {
        greetBtn.addEventListener('click', () => {
            initAudio(); 

            greetBtn.style.transform = 'scale(0)';
            greetBtn.style.opacity = '0';
            setTimeout(() => greetBtn.style.display = 'none', 400);
            
            greetingBox.classList.remove('hidden');
            greetingBox.classList.add('reveal-anim');

            festivalActive = true;
            document.body.classList.add('festival-mode');
            festivalElements.classList.remove('hidden');
            
            createLightBulbs();
            createParticles(window.innerWidth / 2, window.innerHeight / 3);
            playBoom(); 
            setTimeout(() => playCrackerChain(), 400); // Start crackers just after explosion
        });
    }

    // Subtle 3D Card Hover
    const card = document.getElementById('mainCard');
    document.addEventListener('mousemove', (e) => {
        if (window.innerWidth > 768) {
            let xAxis = (window.innerWidth / 2 - e.pageX) / 60;
            let yAxis = (window.innerHeight / 2 - e.pageY) / 60;
            card.style.transform = `rotateY(${xAxis}deg) rotateX(${yAxis}deg)`;
        }
    });
    document.addEventListener('mouseleave', () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
        card.style.transition = 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)';
    });
    card.addEventListener('mouseenter', () => { card.style.transition = 'none'; });

    // --- Canvas Physics ---
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });

    let fireworks = [];
    let particles = [];
    let festivalActive = false;

    class Firework {
        constructor(sx, sy, tx, ty) {
            this.x = sx; this.y = sy;
            this.tx = tx; this.ty = ty;
            this.distanceTraveled = 0;
            this.coordinates = [];
            this.coordinateCount = 3;
            while(this.coordinateCount--) { this.coordinates.push([this.x, this.y]); }
            this.angle = Math.atan2(ty - sy, tx - sx);
            this.speed = 3; 
            this.acceleration = 1.05;
            this.brightness = Math.random() * 50 + 50;
            playLaunch(); 
        }
        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            this.speed *= this.acceleration;
            let vx = Math.cos(this.angle) * this.speed;
            let vy = Math.sin(this.angle) * this.speed;
            this.distanceTraveled = Math.sqrt(Math.pow(this.x - this.tx, 2) + Math.pow(this.y - this.ty, 2));
            
            if(this.distanceTraveled < this.speed) {
                createParticles(this.tx, this.ty);
                playBoom(); 
                fireworks.splice(index, 1);
            } else {
                this.x += vx;
                this.y += vy;
            }
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsl(${Math.random() * 360}, 100%, ${this.brightness}%)`;
            ctx.lineWidth = 3;
            ctx.stroke();
        }
    }

    class Particle {
        constructor(x, y) {
            this.x = x; this.y = y;
            this.coordinates = [];
            this.coordinateCount = 5;
            while(this.coordinateCount--) { this.coordinates.push([this.x, this.y]); }
            this.angle = Math.random() * Math.PI * 2;
            this.speed = Math.random() * 10 + 2; 
            this.friction = 0.93; 
            this.gravity = 1; 
            this.hue = Math.random() * 60 + 15; 
            this.brightness = Math.random() * 50 + 50;
            this.alpha = 1;
            this.decay = Math.random() * 0.02 + 0.01;
        }
        update(index) {
            this.coordinates.pop();
            this.coordinates.unshift([this.x, this.y]);
            this.speed *= this.friction;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed + this.gravity;
            this.alpha -= this.decay;
            
            if(this.alpha <= this.decay) { particles.splice(index, 1); }
        }
        draw() {
            ctx.beginPath();
            ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
            ctx.lineTo(this.x, this.y);
            ctx.strokeStyle = `hsla(${this.hue}, 100%, ${this.brightness}%, ${this.alpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    function createParticles(x, y) {
        let particleCount = 80;
        while(particleCount--) { particles.push(new Particle(x, y)); }
    }

    function launchContinuousFireworks() {
        if(!festivalActive) return;
        
        if(Math.random() < 0.04) {  
            let startX = Math.random() * canvas.width;
            let startY = canvas.height;
            let targetX = startX + (Math.random() * 200 - 100);
            let targetY = Math.random() * (canvas.height / 2);
            fireworks.push(new Firework(startX, startY, targetX, targetY));
        }
        
        if(Math.random() < 0.05) { 
            let cx = Math.random() * canvas.width;
            let cy = canvas.height - (Math.random() * 100 + 50); 
            createParticles(cx, cy); 
            playCrackerChain(); 
        }
    }

    function animateLoop() {
        requestAnimationFrame(animateLoop);
        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'lighter';
        
        let i = fireworks.length;
        while(i--) { fireworks[i].draw(); fireworks[i].update(i); }
        
        let j = particles.length;
        while(j--) { particles[j].draw(); particles[j].update(j); }
        
        launchContinuousFireworks();
    }

    function createLightBulbs() {
        const string = document.getElementById('lightString');
        if (!string.hasChildNodes()) {
            const colors = ['red', 'gold', 'green'];
            let bulbCount = Math.floor(window.innerWidth / 40);
            for(let i=0; i < bulbCount; i++) {
                let bulb = document.createElement('div');
                bulb.className = `bulb ${colors[i % colors.length]}`;
                string.appendChild(bulb);
            }
        }
    }

    animateLoop();
});