import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Screen86 from '../components/Screen86';
import Screen54 from '../components/Screen54';
import Screen43 from '../components/Screen43';
import Screen115 from '../components/Screen115';
import Screen140 from '../components/Screen140';
import Screen151 from '../components/Screen151';
import Screen94 from '../components/Screen94';
import Screen162 from '../components/Screen162';
import Screen30 from '../components/Screen30';
import Screen66 from '../components/Screen66';
import Screen82 from '../components/Screen82';
import Screen222 from '../components/Screen222';

import Screen321 from '../components/Screen321';
import Screen199 from '../components/Screen199';
import Screen299 from '../components/Screen299';
import Screen338 from '../components/Screen338';
import Screen7 from '../components/Screen7';
import Screen26 from '../components/Screen26';
import type { Ficha } from '../types';

type ScreenRouterProps = {
  ficha: Ficha;
  onGameResult: (won: boolean, goldChange: number) => void;
  onAdjustSorte: (delta: number) => void;
  onFichaChange: (ficha: Ficha) => void;
};

const ScreenRouter: React.FC<ScreenRouterProps> = ({ ficha, onGameResult, onAdjustSorte, onFichaChange }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const screenId = Number(id);



  // Verificação de segurança: se a ficha for inválida, redireciona para a tela inicial
  if (!ficha || !ficha.bolsa || !Array.isArray(ficha.bolsa)) {
    console.warn('🎲 [ScreenRouter] Ficha inválida detectada, redirecionando para início');
    navigate('/', { replace: true });
    return null;
  }

  const goToScreen = (nextId: number) => {
    try { localStorage.setItem('cavaleiro:screenId', String(nextId)); } catch {}
    navigate(`/game/${nextId}`, { replace: true });
  };

  if (screenId === 86) {
    return (
      <Screen86
        ficha={ficha}
        onGameResult={onGameResult}
        onNavigateToScreen={goToScreen}
      />
    );
  }

  if (screenId === 54) {
    return (
      <Screen54 
        onGoToScreen={goToScreen} 
        ficha={ficha} 
        onUpdateFicha={onFichaChange} 
      />
    );
  }

  if (screenId === 43) {
    return (
      <Screen43 onGoToScreen={goToScreen} ficha={ficha} />
    );
  }

  if (screenId === 115) {
    return (
      <Screen115 onGoToScreen={goToScreen} ficha={ficha} onAdjustSorte={onAdjustSorte} />
    );
  }

  if (screenId === 94) {
    return (
      <Screen94 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 140) {
    return (
      <Screen140 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 151) {
    return (
      <Screen151 onGoToScreen={goToScreen} />
    );
  }

  if (screenId === 162) {
    return (
      <Screen162 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 30) {
    return (
      <Screen30 onGoToScreen={goToScreen} />
    );
  }

  if (screenId === 66) {
    return (
      <Screen66 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 82) {
    return (
      <Screen82 
        onGoToScreen={goToScreen} 
        ficha={ficha} 
        onUpdateFicha={onFichaChange} 
      />
    );
  }



  if (screenId === 321) {
    return (
      <Screen321 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 7) {
    return (
      <Screen7 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 26) {
    return (
      <Screen26 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 199) {
    return (
      <Screen199 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 299) {
    return (
      <Screen299 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 338) {
    return (
      <Screen338 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 222) {
    return (
      <Screen222 onGoToScreen={goToScreen} ficha={ficha} onFichaChange={onFichaChange} />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2>Tela {screenId} não encontrada</h2>
      <button onClick={() => navigate('/')}>Ir para início</button>
    </div>
  );
};

export default ScreenRouter;



