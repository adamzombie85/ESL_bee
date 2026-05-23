/**
 * ESL-Bee PvP Battle Canvas Engine
 */
class PvPBattleCanvas {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width = this.canvas.clientWidth;
        this.height = this.canvas.height = this.canvas.clientHeight;
        
        // Resize listener
        window.addEventListener('resize', () => {
            this.resize();
        });

        // Assets
        this.images = {};
        
        // State
        this.p1 = null; // { isLocal: true, pokeImg, hp, maxHp, rage, name }
        this.p2 = null;
        
        this.particles = [];
        this.animations = [];
        this.lastTime = 0;
        this.isRunning = false;
        
        // Background effects
        this.bgOffset = 0;
    }

    resize() {
        if (this.canvas) {
            this.width = this.canvas.width = this.canvas.clientWidth;
            this.height = this.canvas.height = this.canvas.clientHeight;
        }
    }

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastTime = performance.now();
        requestAnimationFrame((t) => this.loop(t));
    }

    stop() {
        this.isRunning = false;
    }

    updateState(p1Data, p2Data) {
        this.p1 = p1Data;
        this.p2 = p2Data;
        
        // Load images if not loaded
        if (this.p1 && !this.images[this.p1.pokeImg]) this.loadImage(this.p1.pokeImg);
        if (this.p2 && !this.images[this.p2.pokeImg]) this.loadImage(this.p2.pokeImg);
    }

    loadImage(src) {
        const img = new Image();
        img.src = src;
        this.images[src] = img;
    }

    triggerAttack(attackerIsP1, isCrit) {
        const startX = attackerIsP1 ? this.width * 0.2 : this.width * 0.8;
        const startY = this.height * 0.6;
        const endX = attackerIsP1 ? this.width * 0.8 : this.width * 0.2;
        const endY = this.height * 0.6;
        
        this.animations.push({
            type: 'projectile',
            x: startX, y: startY,
            targetX: endX, targetY: endY,
            progress: 0,
            color: isCrit ? '#ef4444' : '#3b82f6', // Red for crit, blue for normal
            isCrit: isCrit,
            attackerIsP1: attackerIsP1
        });
    }

    createExplosion(x, y, isCrit) {
        const color = isCrit ? '#ef4444' : '#f59e0b';
        const count = isCrit ? 50 : 10;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x, y: y,
                vx: (Math.random() - 0.5) * (isCrit ? 15 : 10),
                vy: (Math.random() - 0.5) * (isCrit ? 15 : 10),
                life: 1.0,
                color: color,
                size: Math.random() * (isCrit ? 8 : 5) + 2,
                isCrit: isCrit
            });
        }
        
        // Screen shake
        this.animations.push({
            type: 'shake',
            progress: 0,
            intensity: isCrit ? 25 : 5,
            isCrit: isCrit
        });
    }

    loop(time) {
        if (!this.isRunning) return;
        const dt = (time - this.lastTime) / 1000;
        this.lastTime = time;

        this.update(dt);
        this.draw();

        requestAnimationFrame((t) => this.loop(t));
    }

    update(dt) {
        this.bgOffset += dt * 20;

        // Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= dt * (p.isCrit ? 1 : 2); // Crits fade slower
            if (p.life <= 0) this.particles.splice(i, 1);
        }

        // Animations
        for (let i = this.animations.length - 1; i >= 0; i--) {
            let a = this.animations[i];
            
            if (a.type === 'projectile') {
                a.progress += dt * 2; // 0.5s duration
                if (a.progress >= 1) {
                    this.createExplosion(a.targetX, a.targetY, a.isCrit);
                    this.animations.splice(i, 1);
                }
            } else if (a.type === 'shake') {
                a.progress += dt * (a.isCrit ? 1.5 : 3); // ~0.66s for crit, ~0.33s normal
                if (a.progress >= 1) {
                    this.animations.splice(i, 1);
                }
            }
        }
    }

    draw() {
        let offsetX = 0, offsetY = 0;
        const shakeAnim = this.animations.find(a => a.type === 'shake');
        if (shakeAnim) {
            offsetX = (Math.random() - 0.5) * shakeAnim.intensity * (1 - shakeAnim.progress);
            offsetY = (Math.random() - 0.5) * shakeAnim.intensity * (1 - shakeAnim.progress);
        }

        this.ctx.save();
        this.ctx.translate(offsetX, offsetY);

        // Draw background
        this.drawBackground();

        // Draw players
        if (this.p1) this.drawPlayer(this.p1, true);
        if (this.p2) this.drawPlayer(this.p2, false);

        // Draw projectiles
        this.animations.filter(a => a.type === 'projectile').forEach(a => {
            const x = a.x + (a.targetX - a.x) * a.progress;
            const y = a.y + (a.targetY - a.y) * a.progress;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, a.isCrit ? 15 : 10, 0, Math.PI * 2);
            this.ctx.fillStyle = a.color;
            this.ctx.fill();
            this.ctx.shadowBlur = 20;
            this.ctx.shadowColor = a.color;
        });

        // Draw particles
        this.ctx.shadowBlur = 0;
        this.particles.forEach(p => {
            this.ctx.globalAlpha = Math.max(0, p.life);
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.restore();
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#1e1b4b'); // indigo-950
        gradient.addColorStop(1, '#000000');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Grid lines effect
        this.ctx.strokeStyle = 'rgba(79, 70, 229, 0.2)'; // indigo-500/20
        this.ctx.lineWidth = 2;
        const spacing = 50;
        const offset = this.bgOffset % spacing;

        this.ctx.beginPath();
        for (let x = -spacing; x < this.width + spacing; x += spacing) {
            this.ctx.moveTo(x + offset, 0);
            this.ctx.lineTo(x - this.height/2 + offset, this.height);
        }
        for (let y = 0; y < this.height; y += spacing) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
        }
        this.ctx.stroke();
    }

    drawPlayer(player, isP1) {
        const x = isP1 ? this.width * 0.2 : this.width * 0.8;
        const y = this.height * 0.6;
        const direction = isP1 ? 1 : -1;

        // Draw Shadow
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 60, 40, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw Pokemon Image
        const img = this.images[player.pokeImg];
        if (img && img.complete) {
            this.ctx.save();
            this.ctx.translate(x, y);
            this.ctx.scale(direction, 1); // Flip P2
            
            // Hop animation
            const hop = Math.sin(Date.now() / 200 + (isP1 ? 0 : Math.PI)) * 5;
            this.ctx.drawImage(img, -50, -50 + hop, 100, 100);
            this.ctx.restore();
        }

        // Draw UI Elements (HP Bar, Name, Rage)
        this.drawUI(player, x, y - 80);
    }

    drawUI(player, x, y) {
        // Name
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(player.name + (player.isLocal ? ' (你)' : ''), x, y - 20);

        // HP Bar Background
        const barW = 100;
        const barH = 10;
        this.ctx.fillStyle = '#374151'; // gray-700
        this.ctx.fillRect(x - barW/2, y, barW, barH);
        
        // HP Bar Foreground
        const hpPercent = Math.max(0, player.hp / player.maxHp);
        this.ctx.fillStyle = hpPercent > 0.5 ? '#22c55e' : (hpPercent > 0.2 ? '#eab308' : '#ef4444');
        this.ctx.fillRect(x - barW/2, y, barW * hpPercent, barH);

        // Rage Bar (3 segments)
        const segmentW = 30;
        const segmentH = 6;
        const startX = x - (segmentW * 3 + 4) / 2;
        for(let i=0; i<3; i++) {
            this.ctx.fillStyle = player.rage > i ? '#fbbf24' : '#1f2937'; // amber-400 / gray-800
            this.ctx.fillRect(startX + i * (segmentW + 2), y + 14, segmentW, segmentH);
        }

        // Remaining Pokemon Indicator (Pokeballs)
        // Two dots under the rage bar
        const pokeIndicatorY = y + 28;
        const pokeIndicatorX = x - 10;
        
        // Draw 2 dots
        for (let i = 0; i < 2; i++) {
            this.ctx.beginPath();
            this.ctx.arc(pokeIndicatorX + i * 20, pokeIndicatorY, 4, 0, Math.PI * 2);
            
            // Logic: 
            // If active == 'main', both dots are green (alive).
            // If active == 'support', 1st dot is red/gray (dead), 2nd dot is green (alive).
            let isAlive = true;
            if (player.active === 'support' && i === 0) {
                isAlive = false;
            } else if (player.hp <= 0 && player.active === 'support') {
                isAlive = false; // both dead
            }

            this.ctx.fillStyle = isAlive ? '#22c55e' : '#4b5563'; // green-500 / gray-600
            this.ctx.fill();
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = '#111827';
            this.ctx.stroke();
        }
    }
}
