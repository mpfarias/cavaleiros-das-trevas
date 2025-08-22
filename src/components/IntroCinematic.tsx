import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Box, Card, CardContent, Dialog, Typography } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

// Imports dos arquivos de áudio
import bgmIntro from '../assets/sounds/bgm-intro.mp3';
import bgmModal from '../assets/sounds/bgm-modal.mp3';
import rainSound from '../assets/sounds/rainning.mp3';
import { useClickSound } from "../hooks/useClickSound";

const PROJECT_AUDIO_MAP: Record<string, string> = {
  music: bgmIntro,     // Música de fundo principal
  tavern: bgmModal,    // Música de taverna/ambiente
  wind: rainSound,     // Som de chuva/vento para atmosfera
  battle: bgmIntro,    // Usa a mesma música principal para batalha
  steps: rainSound,    // Improvisa passos com chuva baixa
  thunder: rainSound,  // Usa chuva para trovão
};

type AudioMap = Partial<Record<
  | "music"
  | "tavern"
  | "wind"
  | "battle"
  | "steps"
  | "mug"
  | "thunder"
  | "sword"
  , string>>;

type LineKind = "big" | "mid" | "small";

type Scene = {
  t: number; // timestamp em segundos
  lines: Array<[LineKind, string]>; // par: [tipo, html/texto]
  sfx?: (api: SfxAPI) => void;
};

// Timeline baseada no seu texto adaptado
const TIMELINE: Scene[] = [
  {
    t: 0,
    lines: [
      ["big", "Você é um aventureiro da velha guarda."],
      ["mid", "Pronto para empunhar sua espada por qualquer um… quase."],
    ],
    sfx: (s) => {
      s.playTag("music", 0.3, true);  // Música principal volume máximo
      s.wind(true);  // Vento reativado com volume baixo (0.2)
    },
  },
  {
    t: 6,
    lines: [
      ["mid", "O que você procura mesmo é a emoção da aventura."],
      ["mid", "E o gosto pela justiça."],
    ],
  },
  {
    t: 12,
    lines: [
      ["mid", "Já lutou com muitos exércitos…"],
      ["mid", "e fez longas expedições a terras desconhecidas."],
    ],
  },
  {
    t: 18,
    lines: [
      ["mid", "Durante a Guerra dos Quatro Reinos,"],
      ["mid", "lutou por Gallantaria, sua pátria."],
    ],
  },
  {
    t: 24,
    lines: [
      ["mid", "Sua coragem e liderança renderam condecorações…"],
      ["mid", "e o posto de comandante."],
    ],
  },
  {
    t: 30,
    lines: [
      ["mid", "Terminada a guerra, deixou a fama para trás…"],
      ["mid", "e partiu em busca de novas aventuras."],
    ],
  },
  {
    t: 36,
    lines: [
      ["mid", "Cinco anos se passaram."],
      ["mid", "Agora, você está em Royal Lendle."],
    ],
  },
  {
    t: 42,
    lines: [
      ["mid", "Quatro dias na cidade… e já está entediado."],
      ["mid", "Então, vai até a taverna Primeiro Passo."],
    ],
  },
  {
    t: 48,
    lines: [
      ["mid", "Ao terminar a segunda caneca de Lendale,"],
      ["mid", "alguém bate em seu ombro."],
    ],
  },
  {
    t: 54,
    lines: [
      ["mid", "Um homem de rosto preocupado."],
      ["mid", "Camponês da região de fronteira."],
    ],
  },
  {
    t: 58,
    lines: [["mid", "“Por favor, Comandante… precisa nos ajudar em Karnstein.”"]],
  },
  {
    t: 65,
    lines: [
      ["mid", "Ele fala de saques… mortes…"],
      ["mid", "E de um inimigo impossível: o Cavaleiro das Trevas."],
    ],
  },
  {
    t: 72,
    lines: [
      ["mid", "Você conhece a lenda."],
      ["mid", "Criaturas usadas para assustar crianças."],
    ],
  },
  {
    t: 78,
    lines: [["mid", "Mas o terror no rosto dele é real."]],
  },
  {
    t: 82,
    lines: [["mid", "E então você decide:"]],
  },
  {
    t: 86,
    lines: [
      ["mid", "irá para Karnstein…"],
      ["mid", "para enfrentar o que quer que esteja nas sombras."],
    ],
  },
];

// =======================
// Áudio Manager + SFX API
// =======================

type SfxAPI = {
  playTag: (name: keyof Required<AudioMap>, vol?: number, loop?: boolean) => void;
  fade: (name: keyof Required<AudioMap>, to: number, dur?: number) => void;
  wind: (on?: boolean) => void;
  boom: () => void;
  thunder: () => void;
  sword: () => void;
  mug: () => void;
  steps: () => void;
  battle: () => void;
};

function useAudioManager(audioSources: AudioMap | undefined) {
  // Usa áudios do projeto se não fornecidos via props
  const finalAudioSources = useMemo(() => {
    return audioSources || PROJECT_AUDIO_MAP;
  }, [audioSources]);
  const audioTags = useRef<Record<string, HTMLAudioElement>>({});
  const AC = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const noiseBuf = useRef<AudioBuffer | null>(null);
  const windNode = useRef<{ src: AudioBufferSourceNode; gain: GainNode } | null>(
    null
  );

  // carrega HTMLAudio quando URLs são fornecidas
  const loadTags = async () => {
    if (!finalAudioSources) return;

    console.log('🎵 [IntroCinematic] Iniciando carregamento de áudios...');
    
    const entries = Object.entries(finalAudioSources);
    const promises = entries.map(([k, url]) => new Promise<void>((res, rej) => {
      const a = new Audio(url);
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      a.loop = ["music", "tavern", "wind", "battle"].includes(k);
      // Volumes otimizados para os áudios do projeto
      a.volume = k === "music" ? 0.3 :     // bgm-intro volume máximo
                 k === "tavern" ? 0.6 :    // bgm-modal para taverna
                 k === "wind" ? 0.2 :      // rain.wav bem baixo para não sobrepor
                 k === "mug" ? 0.8 :       // laugh.wav para taverna
                 k === "thunder" ? 0.7 :   // rain.wav para trovão
                 0.9;
      
      // Timeout de segurança para cada áudio
      const timeout = setTimeout(() => {
        console.warn(`⚠️ [IntroCinematic] Timeout carregando áudio: ${k}`);
        rej(new Error(`Timeout: ${k}`));
      }, 10000);
      
      audioTags.current[k] = a;
      
      const handleCanPlay = () => {
        clearTimeout(timeout);
        console.log(`✅ [IntroCinematic] Áudio carregado: ${k}`);
        res();
      };
      
      const handleError = (error: Event) => {
        clearTimeout(timeout);
        console.error(`❌ [IntroCinematic] Erro carregando áudio ${k}:`, error);
        rej(new Error(`Falha ao carregar: ${k}`));
      };
      
      a.addEventListener("canplaythrough", handleCanPlay, { once: true });
      a.addEventListener("error", handleError, { once: true });
      
      // Tentar carregar
      try {
        a.load();
      } catch (error) {
        clearTimeout(timeout);
        console.error(`❌ [IntroCinematic] Erro ao chamar load() para ${k}:`, error);
        rej(error);
      }
    }));
    
    try {
      await Promise.all(promises);
      console.log('🎵 [IntroCinematic] Todos os áudios carregados com sucesso');
    } catch (error) {
      console.error('❌ [IntroCinematic] Erro ao carregar áudios:', error);
      throw error;
    }
  };

  // inicializa WebAudio (fallback)
  const ensureAudioContext = () => {
    if (AC.current) return;
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    AC.current = ctx;
    const g = ctx.createGain();
    g.gain.value = 0.85;
    g.connect(ctx.destination);
    master.current = g;
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.9;
    noiseBuf.current = buf;
  };

  const playTag = (name: string, vol?: number, loop?: boolean) => {

    const a = audioTags.current[name];
    if (!a) {

      return;
    }

    if (typeof vol === "number") a.volume = vol;
    if (typeof loop === "boolean") a.loop = loop;
    a.currentTime = 0;
    
    // Garantir que está carregado
    if (a.readyState < 2) {

    }
    
    a.play().then(() => {

    }).catch((_error) => {

    });
  };

  const stopTag = (name: string) => {
    const a = audioTags.current[name];
    if (!a) return;
    a.pause();
  };

  const fade = (name: string, to = 0, dur = 1200) => {
    const a = audioTags.current[name];
    if (!a) return;
    const from = a.volume;
    const steps = 24;
    const dt = dur / steps;
    let i = 0;
    const t = setInterval(() => {
      i++;
      a.volume = from + (to - from) * (i / steps);
      if (i >= steps) {
        clearInterval(t);
        if (to === 0) a.pause();
      }
    }, dt);
  };

  // SFX sintetizados (fallback)
  const synth = {
    boom: () => {
      if (!AC.current || !master.current) return;
      const o = AC.current.createOscillator();
      o.type = "sine";
      const g = AC.current.createGain();
      g.gain.setValueAtTime(0.0001, AC.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.6, AC.current.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.current.currentTime + 0.6);
      o.frequency.setValueAtTime(68, AC.current.currentTime);
      o.connect(g).connect(master.current);
      o.start();
      o.stop(AC.current.currentTime + 0.65);
    },
    thunder: () => {
      if (!AC.current || !master.current || !noiseBuf.current) return;
      const src = AC.current.createBufferSource();
      src.buffer = noiseBuf.current;
      const bp = AC.current.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 120;
      bp.Q.value = 0.6;
      const g = AC.current.createGain();
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.6, AC.current.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.current.currentTime + 2.0);
      src.connect(bp).connect(g).connect(master.current);
      src.start();
      src.stop(AC.current.currentTime + 2.1);
    },
    sword: () => {
      if (!AC.current || !master.current || !noiseBuf.current) return;
      const src = AC.current.createBufferSource();
      src.buffer = noiseBuf.current;
      const hp = AC.current.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 1200;
      const g = AC.current.createGain();
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.7, AC.current.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.current.currentTime + 0.5);
      src.connect(hp).connect(g).connect(master.current);
      src.start();
      src.stop(AC.current.currentTime + 0.55);
    },
    steps: () => {
      if (!AC.current || !master.current) return;
      const o = AC.current.createOscillator();
      o.type = "triangle";
      const g = AC.current.createGain();
      g.gain.setValueAtTime(0.0001, AC.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.25, AC.current.currentTime + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.current.currentTime + 0.18);
      o.frequency.setValueAtTime(110, AC.current.currentTime);
      o.connect(g).connect(master.current);
      o.start();
      o.stop(AC.current.currentTime + 0.2);
    },
    mug: () => {
      if (!AC.current || !master.current) return;
      const o = AC.current.createOscillator();
      o.type = "square";
      const g = AC.current.createGain();
      g.gain.setValueAtTime(0.0001, AC.current.currentTime);
      g.gain.exponentialRampToValueAtTime(0.4, AC.current.currentTime + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.current.currentTime + 0.2);
      o.frequency.setValueAtTime(2200, AC.current.currentTime);
      o.connect(g).connect(master.current);
      o.start();
      o.stop(AC.current.currentTime + 0.22);
    },
    battle: () => {
      if (!AC.current || !master.current || !noiseBuf.current) return;
      const src = AC.current.createBufferSource();
      src.buffer = noiseBuf.current;
      const bp = AC.current.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 300;
      bp.Q.value = 1;
      const g = AC.current.createGain();
      g.gain.value = 0.0001;
      g.gain.exponentialRampToValueAtTime(0.25, AC.current.currentTime + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, AC.current.currentTime + 1.5);
      src.connect(bp).connect(g).connect(master.current);
      src.start();
      src.stop(AC.current.currentTime + 1.6);
    },
    wind: (on = true) => {
      if (audioTags.current["wind"]) {
        if (on) playTag("wind", 0.2, true);
        else stopTag("wind");
        return;
      }
      if (!AC.current || !master.current || !noiseBuf.current) return;
      if (on && !windNode.current) {
        const src = AC.current.createBufferSource();
        src.buffer = noiseBuf.current;
        src.loop = true;
        const lp = AC.current.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 400;
        const g = AC.current.createGain();
        g.gain.value = 0.18;
        src.connect(lp).connect(g).connect(master.current);
        src.start();
        windNode.current = { src, gain: g };
      } else if (!on && windNode.current) {
        windNode.current.gain.gain.exponentialRampToValueAtTime(
          0.0001,
          AC.current.currentTime + 1.2
        );
        windNode.current.src.stop(AC.current.currentTime + 1.3);
        windNode.current = null;
      }
    },
  } as const;

  const api = useMemo((): SfxAPI => ({
    playTag: (n, v, l) => playTag(n, v, l),
    fade: (n, to, d) => fade(n, to, d),
    wind: (on) => synth.wind(on),
    boom: synth.boom,
    thunder: synth.thunder,
    sword: synth.sword,
    mug: synth.mug,
    steps: synth.steps,
    battle: synth.battle,
  }), []);

  return {
    ensureAudioContext,
    loadTags,
    api,
  };
}

// ============
// Estilização
// ============

const grainAnim = keyframes`
  to { transform: translate3d(-10px, 10px, 0); }
`;

const fallAnim = keyframes`
  from { transform: translateY(-10vh); }
  to   { transform: translateY(110vh); }
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Screen = styled(Box)(() => ({
  position: "relative",
  width: "100%",
  height: "100vh",
  display: "grid",
  placeItems: "center",
  background:
    "radial-gradient(1200px 600px at 50% 20%, #151822 0%, #0a0b0f 40%, #07080b 100%) !important",
  backgroundImage: "none !important",
  backgroundColor: "#07080b !important",
  color: "#e8e6e3",
  overflow: "hidden",
  userSelect: "none",
  "&::before": {
    display: "none !important"
  },
  "&::after": {
    display: "none !important"
  }
}));

const Vignette = styled(Box)({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  boxShadow: "inset 0 0 180px 80px #000",
});

const Grain = styled(Box)({
  position: "absolute",
  inset: "-20%",
  mixBlendMode: "soft-light" as any,
  pointerEvents: "none", // IMPORTANTE: Não bloquear cliques
  animation: `${grainAnim} 1.5s steps(6) infinite`,
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.7\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.05\"/></svg>')",
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none'
  }
});

const ParticlesWrap = styled(Box)({
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
});

const Particle = styled("i")<{ duration: number; top: number; left: number; opacity: number }>(
  ({ duration, top, left, opacity }) => ({
    position: "absolute",
    width: 2,
    height: 2,
    background: "rgba(255,255,255,.2)",
    borderRadius: "50%",
    filter: "blur(.5px)",
    animation: `${fallAnim} ${duration}s linear forwards`,
    top: `${top}vh`,
    left: `${left}vw`,
    opacity,
    '@media (prefers-reduced-motion: reduce)': {
      animation: 'none'
    }
  }));

const Center = styled(Box)({
  position: "relative",
  maxWidth: 900,
  padding: 40,
  textAlign: "center",
});

const Line = styled(Typography)<{ kind: LineKind; delay?: number }>(({ kind, delay = 0 }) => ({
  animation: `${fadeInUp} 1.2s ease both`,
  animationDelay: `${delay}s`,
  filter: "drop-shadow(0 8px 24px rgba(0,0,0,.6))",
  marginTop: 8,
  transition: "opacity 0.6s ease-in-out",
  ...(kind === "big"
    ? { fontSize: "clamp(24px, 4.2vw, 44px)", letterSpacing: ".02em", lineHeight: 1.25 }
    : kind === "mid"
    ? { fontSize: "clamp(18px, 2.6vw, 26px)", color: "#d9d7d3" }
    : { fontSize: "clamp(16px, 2vw, 20px)", color: "#a7a6a2" }),
  '@media (prefers-reduced-motion: reduce)': {
    animation: 'none'
  }
}));

const TopBar = styled(Box)({
  position: "absolute",
  top: 12,
  left: 12,
  right: 12,
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
});

const FooterHint = styled(Box)({
  position: "absolute",
  bottom: 12,
  width: "100%",
  textAlign: "center",
  color: "#bdbbb6",
  fontSize: 14,
  opacity: 0.8,
});

// ==================
// Botões estilizados
// ==================

const TopButtonSkip = styled('button')({
  padding: '12px 24px',
  background: 'linear-gradient(135deg, rgba(11,11,13,0.95) 0%, rgba(23,23,27,0.85) 50%, rgba(15,15,18,0.95) 100%)',
  color: '#d6d4cf',
  border: '1px solid rgba(179,18,18,0.4)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1000,
  '&:focus-visible': {
    outline: '2px solid rgba(179,18,18,0.8)',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,0.2) 0%, rgba(139,0,0,0.3) 50%, rgba(179,18,18,0.2) 100%)',
    borderColor: 'rgba(179,18,18,0.8)',
    color: '#ffffff',
    boxShadow: '0 6px 20px rgba(179,18,18,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    transform: 'translateY(-1px)'
  },
  '&:active': {
    transform: 'translateY(0)'
  }
});

const TopButtonReplay = styled('button')({
  padding: '12px 24px',
  background: 'linear-gradient(135deg, rgba(11,11,13,0.95) 0%, rgba(23,23,27,0.85) 50%, rgba(15,15,18,0.95) 100%)',
  color: '#d6d4cf',
  border: '1px solid rgba(182,123,3,0.4)',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.3s ease',
  backdropFilter: 'blur(8px)',
  boxShadow: '0 4px 16px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
  textShadow: '0 1px 2px rgba(0,0,0,0.8)',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 1000,
  '&:focus-visible': {
    outline: '2px solid rgba(182,123,3,0.8)',
    outlineOffset: '2px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(182,123,3,0.2) 0%, rgba(218,165,32,0.3) 50%, rgba(182,123,3,0.2) 100%)',
    borderColor: 'rgba(182,123,3,0.8)',
    color: '#ffffff',
    boxShadow: '0 6px 20px rgba(182,123,3,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
    transform: 'translateY(-1px)'
  },
  '&:active': {
    transform: 'translateY(0)'
  }
});

const CTAButton = styled('button')({
  padding: '15px 30px',
  background: 'linear-gradient(135deg, rgba(139,0,0,0.95) 0%, rgba(179,18,18,0.9) 100%)',
  color: '#F5DEB3',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '2px',
  textShadow: '2px 2px 4px rgba(0,0,0,1)',
  boxShadow: '0 6px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  userSelect: 'none',
  position: 'relative',
  zIndex: 9999,
  '&:focus-visible': {
    outline: '2px solid rgba(179,18,18,0.9)',
    outlineOffset: '3px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,1) 0%, rgba(139,0,0,0.95) 100%)',
    color: '#e68585ff',
    transform: 'scale(1.05)',
    boxShadow: '0 8px 25px rgba(179,18,18,0.7), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  '&:active': {
    transform: 'scale(0.95)'
  }
});

const GateButton = styled('button')({
  padding: '10px 24px',
  background: 'linear-gradient(135deg, rgba(139,0,0,0.95) 0%, rgba(179,18,18,0.9) 100%)',
  color: '#F5DEB3',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: '"Cinzel", serif',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '2px',
  textShadow: '2px 2px 4px rgba(0,0,0,1)',
  boxShadow: '0 6px 20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  outline: 'none',
  userSelect: 'none',
  position: 'relative',
  zIndex: 9999,
  '&:focus-visible': {
    outline: '2px solid rgba(179,18,18,0.9)',
    outlineOffset: '3px'
  },
  '&:hover': {
    background: 'linear-gradient(135deg, rgba(179,18,18,1) 0%, rgba(139,0,0,0.95) 100%)',
    color: '#FFFFFF',
    transform: 'scale(1.05)',
    boxShadow: '0 8px 25px rgba(179,18,18,0.7), inset 0 1px 0 rgba(255,255,255,0.2)'
  },
  '&:active': {
    transform: 'scale(0.95)'
  }
});

// ==========
// Partículas
// ==========

function Particles() {
  const [ps, setPs] = useState<{
    duration: number;
    top: number;
    left: number;
    opacity: number;
    id: number;
  }[]>([]);
  const timeoutRef = useRef<number | null>(null);
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const spawn = () => {
    const count = 40;
    const arr = Array.from({ length: count }).map((_, i) => ({
      id: i,
      duration: 6 + Math.random() * 8,
      top: -10 - Math.random() * 90,
      left: Math.random() * 100,
      opacity: 0.15 + Math.random() * 0.35,
    }));
    setPs(arr);
  };

  useEffect(() => {
    if (prefersReducedMotion.current) {
      setPs([]);
      return;
    }
    spawn();
    const onResize = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = window.setTimeout(() => {
        spawn();
        timeoutRef.current = null;
      }, 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  return (
    <ParticlesWrap>
      {ps.map((p) => (
        <Particle key={p.id} duration={p.duration} top={p.top} left={p.left} opacity={p.opacity} />
      ))}
    </ParticlesWrap>
  );
}

// =========
// Componente
// =========

export interface IntroCinematicProps {
  audioSources?: AudioMap; // mapeamento personalizado (opcional - usa áudios do projeto por padrão)
  onFinish?: () => void;   // chamado ao final ou no botão "Iniciar Aventura"
}

export default function IntroCinematic({ audioSources, onFinish }: IntroCinematicProps) {
  const [gateOpen, setGateOpen] = useState(true);
  const [lines, setLines] = useState<Array<[LineKind, string]>>([]);
  const [ended, setEnded] = useState(false);
  const [fadeKey, setFadeKey] = useState(0); // Para forçar re-render com nova animação
  const [isLoading, setIsLoading] = useState(false); // Novo estado para controle de carregamento
  const running = useRef(false);
  const raf = useRef<number | null>(null);
  const audioLoaded = useRef(false); // Novo ref para controlar se o áudio foi carregado

  const playClick = useClickSound(1);

  const { ensureAudioContext, loadTags, api } = useAudioManager(audioSources);

  // Controles da timeline
  const stopTimeline = useCallback(() => {
    running.current = false;
    if (raf.current) cancelAnimationFrame(raf.current);
  }, []);

  const playTimeline = useCallback(() => {
    if (!audioLoaded.current) {
      console.warn('🎵 [IntroCinematic] Áudio ainda não carregado, aguardando...');
      setTimeout(() => playTimeline(), 100);
      return;
    }

    setEnded(false);
    setLines([]);
    running.current = true;
    const t0 = performance.now();
    let idx = 0;

    const step = (now: number) => {
      if (!running.current) return;
      const elapsed = (now - t0) / 1000;
      while (idx < TIMELINE.length && elapsed >= TIMELINE[idx].t) {
        const scene = TIMELINE[idx++];
        
        // Fade-out das linhas anteriores e fade-in das novas
        setFadeKey(prev => prev + 1);
        setTimeout(() => {
          setLines(scene.lines);
        }, 100); // Pequeno delay para o fade-out
        
        scene.sfx?.(api);
      }
      if (idx >= TIMELINE.length) {
        running.current = false;
        setEnded(true);

        return;
      }
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [api]);

  const replay = useCallback(() => {
    setGateOpen(false); // Fecha modal se estiver aberto
    stopTimeline();
    setFadeKey(0); // Reset do fade
    setLines([]); // Limpa linhas
    // Reinicia música principal
    api.playTag("music", 0.7, true);
    setTimeout(() => playTimeline(), 100); // Pequeno delay para garantir que parou
  }, [stopTimeline, playTimeline, api]);

  const skip = useCallback(() => {
    setGateOpen(false); // Fecha modal se estiver aberto
    stopTimeline();
    api.wind(false);
    api.boom();
    setFadeKey(prev => prev + 1); // Novo fade para o texto final
    setLines([["big", "Você está em Gallantaria… as sombras aguardam."]]);
    setEnded(true);
  }, [stopTimeline, api]);

  // Gate para habilitar áudio por gesto do usuário
  const begin = async () => {
    try {
      setIsLoading(true);
      setGateOpen(false);

      console.log('🎬 [IntroCinematic] Iniciando carregamento de áudio...');
      
      // Garantir que o contexto de áudio está disponível
      ensureAudioContext();
      
      // Carregar áudios com timeout de segurança
      const loadPromise = loadTags();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout carregando áudio')), 5000)
      );
      
      await Promise.race([loadPromise, timeoutPromise]);
      
      console.log('🎵 [IntroCinematic] Áudio carregado com sucesso');
      audioLoaded.current = true;
      
      // Pequeno delay para garantir que tudo está pronto
      setTimeout(() => {
        api.playTag("music", 0.3, true);
        playTimeline();
        setIsLoading(false);
      }, 200);
      
    } catch (error) {
      console.error('❌ [IntroCinematic] Erro ao carregar áudio:', error);
      
      // Fallback: continuar mesmo sem áudio
      audioLoaded.current = true;
      setIsLoading(false);
      
      setTimeout(() => {
        playTimeline();
      }, 100);
    }
  };

  // Atalhos de teclado
  useEffect(() => {
    if (gateOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        skip();
      } else if (e.code === "Enter") {
        e.preventDefault();
        replay();
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        replay();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gateOpen, skip, replay]);

  // Cleanup: Para todos os áudios quando o componente for desmontado
  useEffect(() => {
    return () => {
      // Para a música de fundo quando sair da cinematográfica
      try {
        // Cancela timeline e áudios residuais
        stopTimeline();
        api.fade("music", 0, 300); // Fade out rápido da música
        api.fade("tavern", 0, 300); // Fade out rápido da taverna
        api.wind(false);
      } catch (error) {
        console.warn('⚠️ [IntroCinematic] Erro no cleanup:', error);
      }
    };
  }, []); // ← Mantém vazio para executar apenas no unmount

  return (
    <Screen 
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
        <TopBar>
        <TopButtonSkip
          onClick={(e) => {
            e.stopPropagation();
            skip();
            playClick();
          }}
        >
          Pular
        </TopButtonSkip>
        <TopButtonReplay
          onClick={(e) => {
            e.stopPropagation();
            replay();
            playClick();
          }}
        >
          Rever
        </TopButtonReplay>
      </TopBar>

      <Particles />

      <Center aria-live="polite" aria-atomic="true">
        <Box key={fadeKey}>
          {lines.map(([kind, html], i) => (
            <Line 
              key={`${fadeKey}-${i}`} 
              kind={kind} 
              delay={i * 0.3} 
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          ))}
        </Box>
        <Box sx={{ mt: 2, opacity: ended ? 1 : 0, transform: `translateY(${ended ? 0 : 10}px)`, transition: ".6s ease all" }}>
          <CTAButton
            onClick={(e) => {
              playClick();
              e.stopPropagation();

              if (onFinish) {
                onFinish();
              } else {
                console.warn('⚠️ [IntroCinematic] onFinish não fornecido');
              }
            }}
          >
            Ir para o mapa de Gallantaria
          </CTAButton>
        </Box>
      </Center>

      <Vignette />
      <Grain />

      <FooterHint>Pressione ESPAÇO para pular • ENTER para avançar • R para recomeçar</FooterHint>

      <Dialog open={gateOpen} maxWidth="sm" fullWidth>
        <Card sx={{ background: "linear-gradient(160deg, rgba(255,255,255,.06), rgba(255,255,255,.03))", border: "1px solid rgba(255,255,255,.1)", color: "#e8e6e3", bgcolor: "#0a0b0f" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h5" gutterBottom>Introdução</Typography>
            <Typography variant="body1" sx={{ color: "#d6d4cf", mb: 4 }}>
              Prepare-se para adentrar o mundo sombrio do Cavaleiro das Trevas.
            </Typography>
            <GateButton
              onClick={(e) => {
                e.stopPropagation();
                begin();
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Carregando...' : 'Ok'}
            </GateButton>
          </CardContent>
        </Card>
      </Dialog>
    </Screen>
  );
}