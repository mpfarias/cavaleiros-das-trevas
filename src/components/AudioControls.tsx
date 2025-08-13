import React from 'react';
import { 
  Box, 
  IconButton, 
  Tooltip,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { useAudio } from '../hooks/useAudio';

const AudioControls: React.FC = () => {
  const { 
    isPlaying, 
    isMuted, 
    volume, 
    autoplayBlocked,
    togglePlay, 
    toggleMute, 
    setVolume 
  } = useAudio();

  // Função para ajustar volume
  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '1px 16px',
        background: 'rgba(15,17,20,0.8)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '12px',
        backdropFilter: 'blur(1px)',
      }}
    >
      {/* Botão Play/Pause */}
      <Tooltip title={isPlaying ? 'Pausar música' : 'Tocar música'}>
        <IconButton
          onClick={togglePlay}
          sx={{
            color: isPlaying ? '#B31212' : '#E0DFDB',
            '&:hover': {
              background: 'rgba(179,18,18,0.1)',
            },
          }}
        >
          {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
        </IconButton>
      </Tooltip>
      
      {/* Indicador de autoplay bloqueado */}
      {autoplayBlocked && (
        <Box
          sx={{
            position: 'absolute',
            top: '-30px',
            right: '0',
            background: 'rgba(179,18,18,0.9)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          Clique para ativar som
        </Box>
      )}

      {/* Controle de Volume */}
      <Tooltip title={isMuted ? 'Desmutar' : 'Mutado'}>
        <IconButton
          onClick={toggleMute}
          sx={{
            color: isMuted ? '#B31212' : '#E0DFDB',
            '&:hover': {
              background: 'rgba(179,18,18,0.1)',
            },
            fontSize: '10px'
          }}
        >
          {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
        </IconButton>
      </Tooltip>

      {/* Slider de Volume */}
      <input
        type="range"
        min="0"
        max="1"
        step="0.1"
        value={isMuted ? 0 : volume}
        onChange={handleVolumeChange}
        style={{
          width: '80px',
          height: '2px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '2px',
          outline: 'none',
          cursor: 'pointer',
          WebkitAppearance: 'none',
        }}
        onMouseDown={(e) => {
          const target = e.target as HTMLInputElement;
          target.style.background = 'rgba(179,18,18,0.6)';
        }}
        onMouseUp={(e) => {
          const target = e.target as HTMLInputElement;
          target.style.background = 'rgba(255,255,255,0.2)';
        }}
      />
    </Box>
  );
};

export default AudioControls;
