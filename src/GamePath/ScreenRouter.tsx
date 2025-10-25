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
import Screen384 from '../components/Screen384';
import Screen7 from '../components/Screen7';
import Screen26 from '../components/Screen26';
import Screen13 from '../components/Screen13';
import Screen74 from '../components/Screen74';
import Screen123 from '../components/Screen123';
import Screen110 from '../components/Screen110';
import Screen78 from '../components/Screen78';
import Screen175 from '../components/Screen175';
import Screen38 from '../components/Screen38';
import Screen60 from '../components/Screen60';
import Screen126 from '../components/Screen126';
import Screen134 from '../components/Screen134';
import Screen208 from '../components/Screen208';
import Screen233 from '../components/Screen233';
import Screen272 from '../components/Screen272';
import Screen301 from '../components/Screen301';
import Screen351 from '../components/Screen351';
import Screen145 from '../components/Screen145';
import Screen190 from '../components/Screen190';
import Screen28 from '../components/Screen28';
import GameOverScreen from '../components/GameOverScreen';
import type { Ficha } from '../types';

type ScreenRouterProps = {
  ficha: Ficha;
  onGameResult: (won: boolean, goldChange: number) => void;
  onAdjustSorte: (delta: number) => void;
  onFichaChange: (ficha: Ficha) => void;
};

const ScreenRouter: React.FC<ScreenRouterProps> = ({ ficha: fichaFromProps, onGameResult, onAdjustSorte, onFichaChange }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const screenId = Number(id);

  // 🔥 SOLUÇÃO: Sempre usar a ficha mais recente do localStorage
  // Isso garante que mudanças feitas na tela anterior sejam refletidas imediatamente
  const [ficha, setFicha] = React.useState<Ficha>(() => {
    try {
      const saved = localStorage.getItem('cavaleiro:ficha');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Erro ao ler ficha do localStorage:', e);
    }
    return fichaFromProps;
  });

  // Atualizar ficha quando a tela mudar (garantir sincronização)
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('cavaleiro:ficha');
      if (saved) {
        const parsed = JSON.parse(saved);
        setFicha(parsed);
        return;
      }
    } catch (e) {
      console.error('Erro ao ler ficha do localStorage:', e);
    }
    setFicha(fichaFromProps);
  }, [fichaFromProps, screenId]);

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

  if (screenId === 384) {
    return (
      <Screen384 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 13) {
    return (
      <Screen13 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 175) {
    return (
      <Screen175 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 38) {
    return (
      <Screen38 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} onAdjustSorte={onAdjustSorte} />
    );
  }

  if (screenId === 123) {
    return (
      <Screen123 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 110) {
    return (
      <Screen110 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 78) {
    return (
      <Screen78 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 74) {
    return (
      <Screen74 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 60) {
    return (
      <Screen60 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }
  if (screenId === 126) {
    return (
      <Screen126 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }
  if (screenId === 134) {
    return (
      <Screen134 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} onAdjustSorte={onAdjustSorte} />
    );
  }
  if (screenId === 208) {
    return (
      <Screen208 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 233) {
    return (
      <Screen233 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 272) {
    return (
      <Screen272 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 301) {
    return (
      <Screen301 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} onAdjustSorte={onAdjustSorte} />
    );
  }

  if (screenId === 351) {
    return (
      <Screen351 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 222) {
    return (
      <Screen222 onGoToScreen={goToScreen} ficha={ficha} onFichaChange={onFichaChange} />
    );
  }

  if (screenId === 145) {
    return (
      <Screen145 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 190) {
    return (
      <Screen190 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 28) {
    return (
      <Screen28 onGoToScreen={goToScreen} ficha={ficha} onUpdateFicha={onFichaChange} />
    );
  }

  if (screenId === 999) {
    return (
      <GameOverScreen
        onRestart={() => {
          console.log('🔄 [ScreenRouter] Reiniciando jogo...');
          window.location.reload();
        }}
        onContinue={() => {
          console.log('📁 [ScreenRouter] Continuando aventura...');
          navigate('/game/0');
        }}
        deathReason="Sua aventura chegou ao fim"
        deathLocation="Um lugar desconhecido"
      />
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



