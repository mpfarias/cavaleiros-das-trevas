import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Card, CardContent, Dialog, Typography } from "@mui/material";
import { styled, keyframes } from "@mui/material/styles";

// Imports dos arquivos de áudio
import bgmIntro from '../assets/sounds/bgm-intro.mp3';
import bgmModal from '../assets/sounds/bgm-modal.mp3';
import rainSound from '../assets/sounds/rain.wav';
import laughSound from '../assets/sounds/laugh.wav';

/**
 * IntroCinematic.tsx — Abertura cinematográfica (TypeScript + React + MUI)
 *
 * - Exibe a narrativa de Royal Lendle em blocos com pausas dramáticas
 * - Partículas, vinheta, fade e sons sincronizados
 * - Suporte a áudios reais por props + fallback com WebAudio sintetizado
 * - Controles: Pular, Rever, Iniciar Aventura
 *
 * Como usar:
 * <IntroCinematic
 *   onFinish={() => navigate("/ficha-personagem")}
 * />
 * 
 * Áudios mapeados automaticamente:
 * - bgm-intro.mp3: Música de fundo principal
 * - bgm-modal.mp3: Música de taverna/ambiente
 * - rain.wav: Chuva/vento para atmosfera
 * - laugh.wav: Risadas de taverna
 */

// ==========================
// Tipos & Timeline narrativa
// ==========================

// Mapeamento automático dos áudios do projeto
const PROJECT_AUDIO_MAP: Record<string, string> = {
  music: bgmIntro,     // Música de fundo principal
  tavern: bgmModal,    // Música de taverna/ambiente
  wind: rainSound,     // Som de chuva/vento para atmosfera
  battle: bgmIntro,    // Usa a mesma música principal para batalha
  steps: rainSound,    // Improvisa passos com chuva baixa
  mug: laughSound,     // Som de taverna
  thunder: rainSound,  // Usa chuva para trovão
  sword: laughSound,   // Improvisa com áudio disponível
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
      console.log('🎬 Cena 1: Iniciando aventura');
      s.wind(true);
      s.playTag("music", 0.7, true);  // Música principal mais alta
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
    sfx: (s) => {
      console.log('🎬 Cena 3: Memórias de guerra');
      s.battle();
      s.fade("music", 0.4, 500); // Diminui música para dar destaque à batalha
    },
  },
  {
    t: 18,
    lines: [
      ["mid", "Durante a Guerra dos Quatro Reinos,"],
      ["mid", "lutou por Gallantaria, sua pátria."],
    ],
    sfx: (s) => {
      console.log('🎬 Cena 4: Guerra épica');
      s.boom();
      s.thunder(); // Efeito dramático adicional
    },
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
    sfx: (s) => {
      console.log('🎬 Cena 6: Fim da guerra');
      s.fade("music", 0.7, 1000); // Música volta ao normal
    },
  },
  {
    t: 36,
    lines: [
      ["mid", "Cinco anos se passaram."],
      ["mid", "Agora, você está em Royal Lendle."],
    ],
    sfx: (s) => {
      console.log('🎬 Cena 7: Royal Lendle');
      s.wind(true); // Vento da cidade
    },
  },
  {
    t: 42,
    lines: [
      ["mid", "Quatro dias na cidade… e já está entediado."],
      ["mid", "Então, vai até a taverna Primeiro Passo."],
    ],
    sfx: (s) => {
      console.log('🎬 Cena 8: Entrando na taverna');
      s.playTag("tavern", 0.6, true); // Música de taverna
      s.steps();
      s.fade("wind", 0.2, 800); // Diminui vento ao entrar
    },
  },
  {
    t: 48,
    lines: [
      ["mid", "Ao terminar a segunda caneca de Lendale,"],
      ["mid", "alguém bate em seu ombro."],
    ],
    sfx: (s) => {
      console.log('🎬 Cena 9: Na taverna');
      s.mug(); // Som de taverna (laugh.wav)
    },
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
      ["mid", "E de um inimigo impossível: os Cavaleiros das Trevas."],
    ],
    sfx: (s) => {
      console.log('🎬 Cena 11: Cavaleiros das Trevas mencionados');
      s.thunder(); // Efeito dramático (rain.wav)
      s.fade("tavern", 0.3, 600); // Diminui música de taverna para criar tensão
    },
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
    sfx: (s) => {
      console.log('🎬 Cena 13: Decisão tomada');
      s.sword(); // Efeito de decisão
      s.fade("tavern", 0.6, 800); // Música volta um pouco
    },
  },
  {
    t: 86,
    lines: [
      ["mid", "irá para Karnstein…"],
      ["mid", "para enfrentar o que quer que esteja nas sombras."],
    ],
    sfx: (s) => {
      console.log('🎬 Cena 14: Partindo para Karnstein');
      s.wind(false); // Para o vento
      s.boom(); // Efeito épico final
      s.fade("tavern", 0, 1200); // Fade out da taverna
      s.fade("music", 0.4, 1200); // Música principal continua mais baixa
    },
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
    console.log('🎵 Carregando áudios da cinematográfica:', finalAudioSources);
    for (const [k, url] of Object.entries(finalAudioSources)) {
      const a = new Audio(url);
      a.preload = "auto";
      a.crossOrigin = "anonymous";
      a.loop = ["music", "tavern", "wind", "battle"].includes(k);
      // Volumes otimizados para os áudios do projeto
      a.volume = k === "music" ? 0.7 :     // bgm-intro mais alto
                 k === "tavern" ? 0.6 :    // bgm-modal para taverna
                 k === "wind" ? 0.4 :      // rain.wav mais suave para vento
                 k === "mug" ? 0.8 :       // laugh.wav para taverna
                 k === "thunder" ? 0.7 :   // rain.wav para trovão
                 0.9;
      audioTags.current[k] = a;
      await new Promise<void>((res) => {
        const done = () => res();
        a.addEventListener("canplaythrough", done, { once: true });
        a.load();
      });
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
    if (!a) return;
    if (typeof vol === "number") a.volume = vol;
    if (typeof loop === "boolean") a.loop = loop;
    a.currentTime = 0;
    a.play();
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
        if (on) playTag("wind", 0.3, true);
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

  const api: SfxAPI = {
    playTag: (n, v, l) => playTag(n, v, l),
    fade: (n, to, d) => fade(n, to, d),
    wind: (on) => synth.wind(on),
    boom: synth.boom,
    thunder: synth.thunder,
    sword: synth.sword,
    mug: synth.mug,
    steps: synth.steps,
    battle: synth.battle,
  };

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
    "radial-gradient(1200px 600px at 50% 20%, #151822 0%, #0a0b0f 40%, #07080b 100%)",
  color: "#e8e6e3",
  overflow: "hidden",
  userSelect: "none",
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
  animation: `${grainAnim} 1.5s steps(6) infinite`,
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"200\" height=\"200\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.7\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"100%\" height=\"100%\" filter=\"url(%23n)\" opacity=\"0.05\"/></svg>')",
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
  }));

const Center = styled(Box)({
  position: "relative",
  maxWidth: 900,
  padding: 40,
  textAlign: "center",
});

const Line = styled(Typography)<{ kind: LineKind }>(({ kind }) => ({
  animation: `${fadeInUp} .8s ease both`,
  filter: "drop-shadow(0 8px 24px rgba(0,0,0,.6))",
  marginTop: 8,
  ...(kind === "big"
    ? { fontSize: "clamp(24px, 4.2vw, 44px)", letterSpacing: ".02em", lineHeight: 1.25 }
    : kind === "mid"
    ? { fontSize: "clamp(18px, 2.6vw, 26px)", color: "#d9d7d3" }
    : { fontSize: "clamp(16px, 2vw, 20px)", color: "#a7a6a2" }),
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
    spawn();
    const onResize = () => {
      const t = setTimeout(spawn, 250);
      return () => clearTimeout(t);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
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
  const running = useRef(false);
  const raf = useRef<number | null>(null);

  const { ensureAudioContext, loadTags, api } = useAudioManager(audioSources);

  // Tick da timeline
  const playTimeline = () => {
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
        setLines(scene.lines);
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
  };

  const stopTimeline = () => {
    running.current = false;
    if (raf.current) cancelAnimationFrame(raf.current);
  };

  const replay = () => {
    stopTimeline();
    console.log('🔄 Reiniciando cinematográfica');
    // Reinicia música principal
    api.playTag("music", 0.7, true);
    playTimeline();
  };

  const skip = () => {
    stopTimeline();
    api.wind(false);
    api.boom();
    setLines([["big", "Você parte para Karnstein… as sombras aguardam."]]);
    setEnded(true);
  };

  // Gate para habilitar áudio por gesto do usuário
  const begin = async () => {
    setGateOpen(false);
    console.log('🎬 Iniciando cinematográfica com áudios do projeto');
    ensureAudioContext();
    await loadTags().catch((err) => {
      console.warn('Erro ao carregar áudios:', err);
    });
    playTimeline();
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
  }, [gateOpen]);

  return (
    <Screen>
      <TopBar>
        <Button variant="contained" color="inherit" onClick={skip} sx={{ bgcolor: "rgba(255,255,255,.08)", textTransform: "none" }}>
          Pular
        </Button>
        <Button variant="contained" color="inherit" onClick={replay} sx={{ bgcolor: "rgba(255,255,255,.08)", textTransform: "none" }}>
          Rever
        </Button>
      </TopBar>

      <Particles />

      <Center aria-live="polite" aria-atomic="true">
        <Box>
          {lines.map(([kind, html], i) => (
            <Line key={i} kind={kind} dangerouslySetInnerHTML={{ __html: html }} />
          ))}
        </Box>
        <Box sx={{ mt: 2, opacity: ended ? 1 : 0, transform: `translateY(${ended ? 0 : 10}px)`, transition: ".6s ease all" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => onFinish?.()}
            sx={{ textTransform: "none", borderRadius: 999 }}
          >
            Iniciar Aventura
          </Button>
        </Box>
      </Center>

      <Vignette />
      <Grain />

      <FooterHint>Pressione ESPAÇO para pular • ENTER para avançar • R para recomeçar</FooterHint>

      <Dialog open={gateOpen} maxWidth="sm" fullWidth>
        <Card sx={{ background: "linear-gradient(160deg, rgba(255,255,255,.06), rgba(255,255,255,.03))", border: "1px solid rgba(255,255,255,.1)", color: "#e8e6e3", bgcolor: "#0a0b0f" }}>
          <CardContent sx={{ textAlign: "center", p: 4 }}>
            <Typography variant="h5" gutterBottom>Introdução</Typography>
            <Typography variant="body1" sx={{ color: "#d6d4cf", mb: 2 }}>
              Prepare-se para adentrar o mundo sombrio dos Cavaleiros das Trevas.
            </Typography>
            <Button variant="contained" onClick={begin} sx={{ textTransform: "none", borderRadius: 999 }}>
              Começar
            </Button>
          </CardContent>
        </Card>
      </Dialog>
    </Screen>
  );
}