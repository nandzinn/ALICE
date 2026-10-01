/* ============================================================
   NOCTURNE — Celebração das Sombras
   JavaScript Principal
   
   Este arquivo controla:
   1. Player de música (tocar, pausar, avançar, voltar, volume)
   2. Rotação do vinil (animação do disco girando)
   3. Galeria de fotos (lightbox)
   4. Partículas de fundo (efeito visual)
   5. Scroll reveal (animações ao rolar)
   6. Navegação ativa
   
   COMO ADICIONAR MÚSICAS:
   Edite o array 'tracks' abaixo com suas músicas.
   Cada objeto precisa de: src, title, artist, duration
   ============================================================ */

// ============================================================
// CONFIGURAÇÃO DAS MÚSICAS
// ALTERE: Adicione ou remova músicas neste array
// ============================================================
const tracks = [
    {
        src: 'assets/music/Pyramids - Frank Ocean.mp3',
        title: 'Pyramids',
        artist: 'Frank Ocean',
        duration: '9:52'
    },
    {
        src: 'assets/music/Lana Del Rey - Shades Of Cool - LanaDelReyVEVO.mp3',
        title: 'Shades Of Cool',
        artist: 'Lana Del Rey',
        duration: '5:43'
    },
    {
        src: 'assets/music/Deftones –  Risk (Official Visualizer) - Deftones.mp3',
        title: 'Risk',
        artist: 'Deftones',
        duration: '3:38'
    },
    {
        src: 'assets/music/Michael Jackson - Heaven Can Wait (Official Audio) - michaeljacksonVEVO.mp3',
        title: 'Heaven Can Wait',
        artist: 'Michael Jackson',
        duration: '4:49'
    },
    {
        src: 'assets/music/Wonderwall (Remastered) - Oasis.mp3',
        title: 'Wonderwall',
        artist: 'Oasis',
        duration: '4:18'
    }
    /*
        PARA ADICIONAR MAIS MÚSICAS:
        {
            src: 'assets/music/NOME_DO_ARQUIVO.mp3',
            title: 'Nome da Música',
            artist: 'Nome do Artista',
            duration: 'M:SS'
        },
    */
];

// ============================================================
// VARIÁVEIS DO PLAYER
// ============================================================
let currentTrackIndex = 0;    // Índice da música atual
let isPlaying = false;        // Se está tocando
let isShuffling = false;      // Se está no modo aleatório
let repeatMode = 0;           // 0 = sem repetir, 1 = repetir todas, 2 = repetir uma
let audio = new Audio();      // Elemento de áudio HTML5
audio.volume = 0.7;           // Volume inicial (0.0 a 1.0)

// Referências aos elementos do DOM
const vinylDisc = document.getElementById('vinyl-disc');
const vinylArm = document.getElementById('vinyl-arm');
const playIcon = document.getElementById('play-icon');
const btnPlay = document.getElementById('btn-play');
const nowPlayingSong = document.getElementById('now-playing-song');
const nowPlayingArtist = document.getElementById('now-playing-artist');
const progressFill = document.getElementById('progress-fill');
const currentTimeEl = document.getElementById('current-time');
const totalTimeEl = document.getElementById('total-time');
const waveIcon = document.getElementById('wave-icon');
const tracklist = document.getElementById('tracklist');

// ============================================================
// FUNÇÕES DO PLAYER DE MÚSICA
// ============================================================

/**
 * Alterna entre tocar e pausar a música
 * Também controla a animação do vinil e da agulha
 */
function togglePlay() {
    if (isPlaying) {
        pauseTrack();
    } else {
        playTrack();
    }
}

/**
 * Toca a música atual
 * Inicia a rotação do vinil e move a agulha
 */
function playTrack() {
    // Carrega a música se ainda não estiver carregada
    if (!audio.src || audio.src !== window.location.origin + '/' + tracks[currentTrackIndex].src) {
        audio.src = tracks[currentTrackIndex].src;
    }
    
    // Tenta tocar (pode falhar se o arquivo não existir)
    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
        playPromise.then(() => {
            // Música tocando com sucesso
        }).catch(error => {
            // Se o arquivo não existir, mostra aviso no console
            console.warn('⚠️ Arquivo de música não encontrado:', tracks[currentTrackIndex].src);
            console.info('💡 Coloque seus arquivos .mp3 na pasta assets/music/');
        });
    }
    
    isPlaying = true;
    
    // Ativa animação do vinil (disco gira)
    vinylDisc.classList.add('spinning');
    
    // Move a agulha para a posição de tocar
    vinylArm.classList.add('playing');
    
    // Muda ícone de play para pause
    playIcon.innerHTML = '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>';
    
    // Ativa animação das barras de onda
    const waveBars = waveIcon.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => bar.classList.remove('paused'));
    
    // Atualiza informações na tela
    updateNowPlaying();
    updateTracklistHighlight();
}

/**
 * Pausa a música atual
 * Para a rotação do vinil e recolhe a agulha
 */
function pauseTrack() {
    audio.pause();
    isPlaying = false;
    
    // Para animação do vinil
    vinylDisc.classList.remove('spinning');
    
    // Recolhe a agulha
    vinylArm.classList.remove('playing');
    
    // Muda ícone de pause para play
    playIcon.innerHTML = '<path d="M8 5v14l11-7z"/>';
    
    // Pausa animação das barras de onda
    const waveBars = waveIcon.querySelectorAll('.wave-bar');
    waveBars.forEach(bar => bar.classList.add('paused'));
}

/**
 * Avança para a próxima música
 */
function nextTrack() {
    if (isShuffling) {
        // No modo aleatório, escolhe uma música diferente da atual
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * tracks.length);
        } while (newIndex === currentTrackIndex && tracks.length > 1);
        currentTrackIndex = newIndex;
    } else {
        // Avança para a próxima (volta ao início se estiver na última)
        currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    }
    
    audio.src = tracks[currentTrackIndex].src;
    updateNowPlaying();
    updateTracklistHighlight();
    
    if (isPlaying) {
        playTrack();
    }
}

/**
 * Volta para a música anterior
 */
function prevTrack() {
    // Se já passou mais de 3 segundos, recomeça a música atual
    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }
    
    // Volta para a anterior (vai para a última se estiver na primeira)
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    
    audio.src = tracks[currentTrackIndex].src;
    updateNowPlaying();
    updateTracklistHighlight();
    
    if (isPlaying) {
        playTrack();
    }
}

/**
 * Seleciona uma música específica pela lista
 * @param {number} index - Índice da música na lista
 */
function selectTrack(index) {
    currentTrackIndex = index;
    audio.src = tracks[currentTrackIndex].src;
    updateNowPlaying();
    updateTracklistHighlight();
    playTrack();
}

/**
 * Atualiza o nome da música e artista exibidos na tela
 */
function updateNowPlaying() {
    nowPlayingSong.textContent = tracks[currentTrackIndex].title;
    nowPlayingArtist.textContent = tracks[currentTrackIndex].artist;
}

/**
 * Destaca a música ativa na lista
 */
function updateTracklistHighlight() {
    const items = tracklist.querySelectorAll('.track-item');
    items.forEach((item, i) => {
        if (i === currentTrackIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Alterna o modo aleatório (shuffle)
 */
function toggleShuffle() {
    isShuffling = !isShuffling;
    const btn = document.getElementById('btn-shuffle');
    btn.style.color = isShuffling ? 'var(--gold)' : 'var(--ivory)';
    btn.style.background = isShuffling ? 'rgba(201, 168, 76, 0.15)' : '';
}

/**
 * Alterna o modo de repetição
 * 0 = sem repetir → 1 = repetir todas → 2 = repetir uma → 0
 */
function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    const btn = document.getElementById('btn-repeat');
    
    switch (repeatMode) {
        case 0: // Sem repetir
            btn.style.color = 'var(--ivory)';
            btn.style.background = '';
            break;
        case 1: // Repetir todas
            btn.style.color = 'var(--gold)';
            btn.style.background = 'rgba(201, 168, 76, 0.15)';
            break;
        case 2: // Repetir uma
            btn.style.color = 'var(--crimson-glow)';
            btn.style.background = 'rgba(178, 34, 34, 0.15)';
            break;
    }
}

/**
 * Altera o volume do player
 * @param {number} value - Valor de 0 a 100
 */
function changeVolume(value) {
    audio.volume = value / 100;
}

/**
 * Permite clicar na barra de progresso para pular para um ponto
 * @param {Event} event - Evento de clique
 */
function seekTrack(event) {
    const progressBar = document.getElementById('progress-bar');
    const rect = progressBar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    
    if (audio.duration) {
        audio.currentTime = percent * audio.duration;
    }
}

/**
 * Formata segundos para o formato M:SS
 * @param {number} seconds - Tempo em segundos
 * @returns {string} Tempo formatado (ex: "3:45")
 */
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================
// EVENTOS DO ÁUDIO
// ============================================================

// Atualiza a barra de progresso e tempo enquanto a música toca
audio.addEventListener('timeupdate', () => {
    if (audio.duration) {
        const percent = (audio.currentTime / audio.duration) * 100;
        progressFill.style.width = `${percent}%`;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

// Quando a música termina, decide o que fazer (próxima, repetir, etc.)
audio.addEventListener('ended', () => {
    switch (repeatMode) {
        case 0: // Sem repetir — avança e para na última
            if (currentTrackIndex < tracks.length - 1) {
                nextTrack();
            } else {
                pauseTrack();
                currentTrackIndex = 0;
                audio.src = tracks[0].src;
                updateNowPlaying();
                updateTracklistHighlight();
                progressFill.style.width = '0%';
                currentTimeEl.textContent = '0:00';
            }
            break;
        case 1: // Repetir todas — avança normalmente
            nextTrack();
            break;
        case 2: // Repetir uma — recomeça a mesma
            audio.currentTime = 0;
            playTrack();
            break;
    }
});

// ============================================================
// GALERIA — LIGHTBOX
// ============================================================

/**
 * Abre a foto em tela cheia (lightbox)
 * @param {HTMLElement} element - Elemento da galeria clicado
 */
function openLightbox(element) {
    const img = element.querySelector('img');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    
    // Impede scroll do body enquanto lightbox está aberto
    document.body.style.overflow = 'hidden';
}

/**
 * Fecha o lightbox
 */
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Fecha lightbox com a tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// ============================================================
// PARTÍCULAS DE FUNDO — Efeito visual flutuante
// ============================================================

/**
 * Cria e anima partículas brilhantes no fundo
 * Efeito sutil de pontos flutuantes que dão profundidade
 */
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    
    // Ajusta o canvas para o tamanho da tela
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Configuração das partículas
    const particleCount = 60; // ALTERE: quantidade de partículas
    const particles = [];
    
    // Cores das partículas (tons dourados e carmesim)
    const colors = [
        'rgba(201, 168, 76, 0.3)',  // Dourado
        'rgba(166, 137, 58, 0.2)',  // Dourado suave
        'rgba(139, 26, 26, 0.2)',   // Carmesim
        'rgba(232, 160, 160, 0.15)' // Rosa
    ];
    
    // Cria as partículas com posições e velocidades aleatórias
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
            opacity: Math.random() * 0.5 + 0.2,
            pulse: Math.random() * Math.PI * 2 // Para efeito de pulsação
        });
    }
    
    // Loop de animação
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            // Atualiza posição
            p.x += p.speedX;
            p.y += p.speedY;
            p.pulse += 0.01;
            
            // Efeito de pulsação no tamanho
            const pulsedSize = p.size + Math.sin(p.pulse) * 0.5;
            
            // Wraparound — quando sai de um lado, aparece no outro
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
            
            // Desenha a partícula
            ctx.beginPath();
            ctx.arc(p.x, p.y, pulsedSize, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });
        
        requestAnimationFrame(animate);
    }
    
    animate();
}

// ============================================================
// SCROLL REVEAL — Animação ao rolar a página
// ============================================================

/**
 * Observa elementos com a classe 'reveal' e os torna visíveis
 * quando entram na viewport (área visível da tela)
 */
function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Opcional: para de observar após revelar
                // observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1, // Ativa quando 10% do elemento está visível
        rootMargin: '0px 0px -50px 0px' // Margem inferior para ativar um pouco antes
    });
    
    revealElements.forEach(el => observer.observe(el));
}

// ============================================================
// NAVEGAÇÃO ATIVA — Destaca o item da navbar atual
// ============================================================

/**
 * Monitora o scroll para destacar o item de navegação
 * correspondente à seção visível
 */
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item[data-section]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.getAttribute('id');
                
                navItems.forEach(item => {
                    if (item.getAttribute('data-section') === sectionId) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            }
        });
    }, {
        threshold: 0.3
    });
    
    sections.forEach(section => observer.observe(section));
}

// ============================================================
// EFEITO NO BOTÃO "ETERNIZAR"
// ============================================================

/**
 * Animação de coração ao clicar no botão Eternizar
 */
function initEternizeEffect() {
    const btn = document.querySelector('.btn-eternize');
    if (!btn) return;
    
    btn.addEventListener('click', () => {
        // Cria corações flutuantes
        for (let i = 0; i < 5; i++) {
            const heart = document.createElement('span');
            heart.textContent = '♥';
            heart.style.cssText = `
                position: fixed;
                font-size: ${Math.random() * 20 + 14}px;
                color: var(--rose);
                pointer-events: none;
                z-index: 9999;
                left: ${btn.getBoundingClientRect().left + Math.random() * btn.offsetWidth}px;
                top: ${btn.getBoundingClientRect().top}px;
                opacity: 1;
                transition: all 1.5s ease-out;
            `;
            document.body.appendChild(heart);
            
            // Anima o coração subindo e sumindo
            requestAnimationFrame(() => {
                heart.style.top = `${btn.getBoundingClientRect().top - 100 - Math.random() * 80}px`;
                heart.style.left = `${parseFloat(heart.style.left) + (Math.random() - 0.5) * 60}px`;
                heart.style.opacity = '0';
            });
            
            // Remove após a animação
            setTimeout(() => heart.remove(), 1500);
        }
    });
}

// ============================================================
// EFEITO NO BOTÃO "GRAVAR NO LIVRO"
// ============================================================

/**
 * Efeito visual ao clicar no botão de salvar mensagem
 */
function saveMessage() {
    const btn = document.querySelector('.btn-save-message');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--rose)"><path d="M20 6L9 17l-5-5"/></svg>
        Gravado com sucesso!
    `;
    btn.style.borderColor = 'var(--gold)';
    btn.style.color = 'var(--gold)';
    
    // Volta ao normal após 2 segundos
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.borderColor = '';
        btn.style.color = '';
    }, 2000);
}

// ============================================================
// INICIALIZAÇÃO — Executa quando a página carrega
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Inicia as partículas de fundo
    initParticles();
    
    // Inicia o scroll reveal
    initScrollReveal();
    
    // Inicia a navegação ativa
    initActiveNav();
    
    // Inicia efeito do botão eternizar
    initEternizeEffect();
    
    // Define a primeira música como ativa
    updateNowPlaying();
    updateTracklistHighlight();
    
    // Log informativo no console
    console.log('%c🦇 Nocturne • Celebração das Sombras', 
        'color: #c9a84c; font-size: 18px; font-weight: bold; font-family: serif;');
    console.log('%c💡 Para adicionar músicas, coloque arquivos .mp3 em assets/music/', 
        'color: #8a8a96; font-size: 12px;');
    console.log('%c💡 Para adicionar fotos, coloque imagens em assets/images/', 
        'color: #8a8a96; font-size: 12px;');
});
