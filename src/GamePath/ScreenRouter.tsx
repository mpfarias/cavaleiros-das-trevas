import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BartolphGameScreen from '../components/BartolphGameScreen';
import Screen54 from '../components/Screen54';
import Screen43 from '../components/Screen43';
import Screen115 from '../components/Screen115';
import Screen140 from '../components/Screen140';
import Screen151 from '../components/Screen151';
import Screen94 from '../components/Screen94';
import Screen162 from '../components/Screen162';
import Screen30 from '../components/Screen30';
import Screen222 from '../components/Screen222';
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
      <BartolphGameScreen
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
      <Screen94 onGoToScreen={goToScreen} ficha={ficha} />
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



