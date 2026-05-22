class AudioManager {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.muted = false;
    }

    init() {
        if (this.ctx) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.value = 0.3; // Default low overall SFX volume
            this.masterGain.connect(this.ctx.destination);
        } catch (e) {
            console.warn("Web Audio API not supported in this browser", e);
        }
    }

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(err => console.log("Failed to resume audio context:", err));
        }
    }

    mute() {
        this.muted = true;
    }

    unmute() {
        this.muted = false;
    }

    // Helper to check if audio is ready to play
    canPlay() {
        this.resume();
        return this.ctx && !this.muted;
    }

    // Helper to generate white noise buffer (reusable or recreated quickly)
    _getNoiseNode() {
        if (!this.ctx) return null;
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds of noise
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;
        return noiseNode;
    }

    // Protester Megaphone Blast:
    // A mid-range bandpassed square wave with a fast pitch sweep to sound like a megaphone honk.
    playProtesterShot() {
        if (!this.canPlay()) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'square';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.12);

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1000, now);
        filter.Q.setValueAtTime(4, now);

        gainNode.gain.setValueAtTime(0.01, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    // Lawyer Gavel Tap:
    // A rapid decay sine wave at ~300Hz coupled with a very short burst of noise for the transient tap.
    playLawyerShot() {
        if (!this.canPlay()) return;

        const now = this.ctx.currentTime;
        
        // 1. Gavel wood body pop
        const osc = this.ctx.createOscillator();
        const bodyGain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);

        bodyGain.gain.setValueAtTime(0.4, now);
        bodyGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(bodyGain);
        bodyGain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.08);

        // 2. High-frequency click transient (paper snap / gavel strike)
        const noise = this._getNoiseNode();
        if (noise) {
            const noiseGain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            filter.type = 'highpass';
            filter.frequency.setValueAtTime(1500, now);

            noiseGain.gain.setValueAtTime(0.2, now);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

            noise.connect(filter);
            filter.connect(noiseGain);
            noiseGain.connect(this.masterGain);

            noise.start(now);
            noise.stop(now + 0.02);
        }
    }

    // Security Heavy Shot:
    // A lowpass filtered triangle wave with a steep pitch drop representing a heavy punch or blast.
    playSecurityShot() {
        if (!this.canPlay()) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.22);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(250, now);

        gainNode.gain.setValueAtTime(0.6, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.22);

        // Subtly add a low-frequency heavy transient pop
        const subOsc = this.ctx.createOscillator();
        const subGain = this.ctx.createGain();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(75, now);
        subGain.gain.setValueAtTime(0.8, now);
        subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        subOsc.connect(subGain);
        subGain.connect(this.masterGain);
        subOsc.start(now);
        subOsc.stop(now + 0.07);
    }

    // Defender Placement Sound:
    // A nice warm rising bubble sweep.
    playPlace() {
        if (!this.canPlay()) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.12);

        gainNode.gain.setValueAtTime(0.25, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    // Enemy Defeat Sound:
    // Satisfying quick arpeggio (C5 to E5) to indicate earning money.
    playEnemyDefeat() {
        if (!this.canPlay()) return;

        const now = this.ctx.currentTime;
        
        // Note 1 (C5 - 523.25Hz)
        const osc1 = this.ctx.createOscillator();
        const gain1 = this.ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now);
        gain1.gain.setValueAtTime(0.12, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc1.connect(gain1);
        gain1.connect(this.masterGain);
        osc1.start(now);
        osc1.stop(now + 0.08);

        // Note 2 (E5 - 659.25Hz) slightly delayed
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now + 0.06);
        gain2.gain.setValueAtTime(0.15, now + 0.06);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc2.connect(gain2);
        gain2.connect(this.masterGain);
        osc2.start(now + 0.06);
        osc2.stop(now + 0.18);
    }

    // Projectile Hit Sound:
    // A quiet highpass filtered noise burst to simulate a paper smack or chemical fizz.
    playHit() {
        if (!this.canPlay()) return;

        const now = this.ctx.currentTime;
        const noise = this._getNoiseNode();
        if (!noise) return;

        const filter = this.ctx.createBiquadFilter();
        const gainNode = this.ctx.createGain();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.Q.setValueAtTime(3, now);

        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.05);
    }
}

export const audio = new AudioManager();
