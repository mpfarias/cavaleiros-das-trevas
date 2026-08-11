import type { Ficha } from '../types';

const CHANNEL = 'redram';
const VERSION = 1;
const GAME_ID = 'cavaleiros-das-trevas';
const REQUEST_TIMEOUT_MS = 8000;
const CORE_KEYS = new Set([
  'cavaleiro:ficha',
  'cavaleiro:lastScreen',
  'cavaleiro:screenId',
  'cavaleiro:checkpoint',
  'cavaleiro:volume',
]);

const ALLOWED_PLATFORM_ORIGINS = new Set(
  (
    import.meta.env.VITE_REDRAM_ORIGINS ??
    'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean),
);

export interface ProgressSnapshot {
  ficha: Ficha;
  lastScreen?: string;
  screenId?: string;
  checkpoint?: string;
  flags?: Record<string, string>;
  version: string;
  savedAt: string;
}

interface BridgeResponse {
  channel: typeof CHANNEL;
  v: typeof VERSION;
  type: 'PROGRESS_LOADED' | 'PROGRESS_SAVED' | 'ERROR' | 'PLATFORM_HELLO';
  requestId: string;
  gameId: string;
  ok?: boolean;
  data?: ProgressSnapshot | null;
  atualizadoEm?: string;
  code?: string;
  message?: string;
}

function getPlatformOrigin(): string | null {
  if (window.parent === window || !document.referrer) {
    return null;
  }

  try {
    const origin = new URL(document.referrer).origin;
    return ALLOWED_PLATFORM_ORIGINS.has(origin) ? origin : null;
  } catch {
    return null;
  }
}

function createRequestId(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

function requestPlatform<T extends BridgeResponse>(
  type: 'GAME_READY' | 'LOAD_PROGRESS' | 'SAVE_PROGRESS',
  data?: ProgressSnapshot,
): Promise<T> {
  const platformOrigin = getPlatformOrigin();

  if (!platformOrigin) {
    return Promise.reject(new Error('RedRAM bridge indisponível'));
  }

  const requestId = createRequestId();

  return new Promise<T>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', handleResponse);
      reject(new Error('Tempo limite da sincronização excedido'));
    }, REQUEST_TIMEOUT_MS);

    function handleResponse(event: MessageEvent) {
      if (
        event.origin !== platformOrigin ||
        event.source !== window.parent ||
        !event.data ||
        typeof event.data !== 'object'
      ) {
        return;
      }

      const response = event.data as Partial<BridgeResponse>;
      if (
        response.channel !== CHANNEL ||
        response.v !== VERSION ||
        response.gameId !== GAME_ID ||
        response.requestId !== requestId
      ) {
        return;
      }

      window.clearTimeout(timeout);
      window.removeEventListener('message', handleResponse);

      if (response.type === 'ERROR') {
        reject(new Error(response.message ?? 'Falha na sincronização'));
        return;
      }

      resolve(response as T);
    }

    window.addEventListener('message', handleResponse);
    window.parent.postMessage(
      {
        channel: CHANNEL,
        v: VERSION,
        type,
        requestId,
        gameId: GAME_ID,
        ...(data ? { data } : {}),
      },
      platformOrigin,
    );
  });
}

export function isRedRamEmbedded(): boolean {
  return getPlatformOrigin() !== null;
}

/**
 * Sincronização com a conta só acontece quando explicitamente habilitada.
 * Mantém o fluxo local intacto enquanto o jogo está em desenvolvimento.
 */
export function isProgressSyncEnabled(): boolean {
  return isRedRamEmbedded() && import.meta.env.VITE_REDRAM_SYNC === 'true';
}

export function collectProgressSnapshot(ficha: Ficha): ProgressSnapshot {
  const flags: Record<string, string> = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key?.startsWith('cavaleiro:') || CORE_KEYS.has(key)) {
      continue;
    }

    const value = localStorage.getItem(key);
    if (value !== null) {
      flags[key] = value;
    }
  }

  return {
    ficha,
    lastScreen: localStorage.getItem('cavaleiro:lastScreen') ?? window.location.pathname,
    screenId: localStorage.getItem('cavaleiro:screenId') ?? undefined,
    checkpoint: localStorage.getItem('cavaleiro:checkpoint') ?? undefined,
    flags,
    version: '1.0.0',
    savedAt: new Date().toISOString(),
  };
}

export function applyProgressToStorage(snapshot: ProgressSnapshot): void {
  localStorage.setItem('cavaleiro:ficha', JSON.stringify(snapshot.ficha));

  if (snapshot.lastScreen) {
    localStorage.setItem('cavaleiro:lastScreen', snapshot.lastScreen);
  }
  if (snapshot.screenId) {
    localStorage.setItem('cavaleiro:screenId', snapshot.screenId);
  }
  if (snapshot.checkpoint) {
    localStorage.setItem('cavaleiro:checkpoint', snapshot.checkpoint);
  }

  for (const [key, value] of Object.entries(snapshot.flags ?? {})) {
    if (key.startsWith('cavaleiro:') && !CORE_KEYS.has(key)) {
      localStorage.setItem(key, value);
    }
  }
}

export async function loadRemoteProgress(): Promise<ProgressSnapshot | null> {
  const response = await requestPlatform<BridgeResponse>('LOAD_PROGRESS');
  return response.type === 'PROGRESS_LOADED' ? (response.data ?? null) : null;
}

export async function saveRemoteProgress(
  snapshot: ProgressSnapshot,
): Promise<string | null> {
  const response = await requestPlatform<BridgeResponse>('SAVE_PROGRESS', snapshot);
  return response.type === 'PROGRESS_SAVED' ? (response.atualizadoEm ?? null) : null;
}
