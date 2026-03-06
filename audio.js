/* ============================================
   audio.js — Music Player Controller
   Birthday Wishes for Love
   ============================================ */

const AudioPlayer = (() => {
    let audioElement = null;
    let audioContext = null;
    let analyser = null;
    let source = null;
    let gainNode = null;
    let isPlaying = false;
    let isInitialized = false;
    let playerBtn = null;
    let waveformBars = [];
    let animFrameId = null;
    let dataArray = null;

    function init() {
        playerBtn = Utils.$('#music-toggle');
        if (!playerBtn) return;

        // Create audio element
        audioElement = new Audio();
        audioElement.loop = true;
        audioElement.preload = 'auto';
        audioElement.volume = 0.5;

        // Generate a soft romantic ambient track using oscillators
        setupWebAudio();

        // Create waveform bars
        createWaveformBars();

        // Event listeners
        playerBtn.addEventListener('click', toggle);

        // Show the player button with delay
        setTimeout(() => {
            playerBtn.classList.add('visible');
        }, 3000);
    }

    function setupWebAudio() {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 64;
            gainNode = audioContext.createGain();
            gainNode.gain.value = 0;

            dataArray = new Uint8Array(analyser.frequencyBinCount);

            // Create ambient melody using oscillators
            createAmbientMusic();
        } catch (e) {
            console.warn('Web Audio API not supported:', e);
        }
    }

    function createAmbientMusic() {
        if (!audioContext) return;

        // Romantic chord progression: Am - F - C - G
        const chords = [
            [220, 261.63, 329.63],  // Am
            [174.61, 220, 261.63],  // F
            [261.63, 329.63, 392],  // C
            [196, 246.94, 293.66]   // G
        ];

        const duration = 4; // seconds per chord
        const totalDuration = chords.length * duration;
        const sampleRate = audioContext.sampleRate;
        const totalSamples = totalDuration * sampleRate;

        const buffer = audioContext.createBuffer(2, totalSamples, sampleRate);
        const leftChannel = buffer.getChannelData(0);
        const rightChannel = buffer.getChannelData(1);

        for (let i = 0; i < totalSamples; i++) {
            const time = i / sampleRate;
            const chordIndex = Math.floor(time / duration) % chords.length;
            const chord = chords[chordIndex];

            // Smooth crossfade between chords
            const chordTime = time % duration;
            let envelope = 1;
            if (chordTime < 0.3) envelope = chordTime / 0.3;
            if (chordTime > duration - 0.3) envelope = (duration - chordTime) / 0.3;

            let sample = 0;
            for (const freq of chord) {
                // Sine wave with soft harmonics
                sample += Math.sin(2 * Math.PI * freq * time) * 0.15;
                sample += Math.sin(2 * Math.PI * freq * 2 * time) * 0.03; // soft harmonic
            }

            // Add subtle pad/shimmer
            sample += Math.sin(2 * Math.PI * chord[0] * 0.5 * time) * 0.05;

            // Gentle tremolo
            const tremolo = 0.85 + Math.sin(2 * Math.PI * 3 * time) * 0.15;
            sample *= tremolo * envelope;

            // Stereo spread
            leftChannel[i] = sample * (0.8 + Math.sin(time * 0.5) * 0.2);
            rightChannel[i] = sample * (0.8 + Math.cos(time * 0.5) * 0.2);
        }

        const sourceNode = audioContext.createBufferSource();
        sourceNode.buffer = buffer;
        sourceNode.loop = true;

        sourceNode.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(audioContext.destination);

        source = sourceNode;
    }

    function createWaveformBars() {
        const waveformContainer = Utils.$('.waveform-bars');
        if (!waveformContainer) return;

        waveformContainer.innerHTML = '';
        const barCount = 5;

        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('span');
            bar.className = 'waveform-bar';
            bar.style.animationDelay = `${i * 0.1}s`;
            waveformContainer.appendChild(bar);
            waveformBars.push(bar);
        }
    }

    function updateWaveform() {
        if (!isPlaying || !analyser || !dataArray) return;

        analyser.getByteFrequencyData(dataArray);

        const step = Math.floor(dataArray.length / waveformBars.length);
        waveformBars.forEach((bar, i) => {
            const value = dataArray[i * step] || 0;
            const height = Math.max(3, (value / 255) * 20);
            bar.style.height = `${height}px`;
        });

        animFrameId = requestAnimationFrame(updateWaveform);
    }

    function play() {
        if (!audioContext) return;

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        if (!isInitialized && source) {
            try {
                source.start(0);
                isInitialized = true;
            } catch (e) {
                // Source already started, recreate
                createAmbientMusic();
                if (source) {
                    source.start(0);
                    isInitialized = true;
                }
            }
        }

        // Fade in
        if (gainNode) {
            gainNode.gain.cancelScheduledValues(audioContext.currentTime);
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.5);
        }

        isPlaying = true;
        playerBtn?.classList.add('playing');
        waveformBars.forEach(bar => bar.classList.add('active'));
        updateWaveform();
    }

    function pause() {
        if (!audioContext || !gainNode) return;

        // Fade out
        gainNode.gain.cancelScheduledValues(audioContext.currentTime);
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);

        isPlaying = false;
        playerBtn?.classList.remove('playing');
        waveformBars.forEach(bar => bar.classList.remove('active'));

        if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
        }

        // Reset bar heights
        waveformBars.forEach(bar => {
            bar.style.height = '3px';
        });
    }

    function toggle() {
        if (isPlaying) {
            pause();
        } else {
            play();
        }
    }

    function setVolume(vol) {
        if (gainNode && audioContext) {
            gainNode.gain.cancelScheduledValues(audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                Utils.clamp(vol, 0, 1),
                audioContext.currentTime + 0.1
            );
        }
    }

    function getIsPlaying() {
        return isPlaying;
    }

    return {
        init,
        play,
        pause,
        toggle,
        setVolume,
        isPlaying: getIsPlaying
    };
})();

window.AudioPlayer = AudioPlayer;
