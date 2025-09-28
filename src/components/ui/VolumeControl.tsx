import React, { useState, useEffect } from 'react';
import { Box, IconButton, Tooltip, Slider, Fade } from '@mui/material';
import { styled } from '@mui/material/styles';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useAudio } from '../../hooks/useAudio';
import { useClickSound } from '../../hooks/useClickSound';

const VolumeContainer = styled(Box)({
  position: 'fixed',
  bottom: '20px',
  right: '80px', // Posicionado ao lado do botão de música
  zIndex: 1000,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  background: 'rgba(15,17,20,0.8)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  padding: '8px 12px',
  backdropFilter: 'blur(10px)',
});

const VolumeSlider = styled(Slider)({
  width: '100px',
  color: '#B31212',
  '& .MuiSlider-thumb': {
    backgroundColor: '#B31212',
    border: '2px solid #E0DFDB',
    '&:hover': {
      backgroundColor: '#FFD700',
    },
  },
  '& .MuiSlider-track': {
    backgroundColor: '#B31212',
  },
  '& .MuiSlider-rail': {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
});

interface VolumeControlProps {
  showSlider?: boolean;
}

const VolumeControl: React.FC<VolumeControlProps> = ({ showSlider = false }) => {
  const { volume, setVolume } = useAudio();
  const playClick = useClickSound(0.1);
  const [sliderVisible, setSliderVisible] = useState(showSlider);

  // Salvar volume no localStorage
  useEffect(() => {
    const savedVolume = localStorage.getItem('cavaleiro:volume');
    if (savedVolume) {
      const volumeValue = parseFloat(savedVolume);
      if (volumeValue >= 0 && volumeValue <= 1) {
        setVolume(volumeValue);
      }
    }
  }, [setVolume]);

  // Salvar volume quando mudar
  useEffect(() => {
    localStorage.setItem('cavaleiro:volume', volume.toString());
  }, [volume]);

  const handleVolumeChange = (_event: Event, newValue: number | number[]) => {
    const volumeValue = Array.isArray(newValue) ? newValue[0] : newValue;
    setVolume(volumeValue / 100); // Converter de 0-100 para 0-1
    playClick();
  };

  const toggleSlider = () => {
    setSliderVisible(!sliderVisible);
    playClick();
  };

  return (
    <VolumeContainer>
      <Tooltip title="Ajustar volume">
        <IconButton
          onClick={toggleSlider}
          sx={{
            color: '#E0DFDB',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'rgba(179,18,18,0.2)',
              color: '#FFD700',
            },
          }}
        >
          <VolumeUpIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Fade in={sliderVisible}>
        <Box sx={{ display: sliderVisible ? 'block' : 'none' }}>
          <VolumeSlider
            value={Math.round(volume * 100)}
            onChange={handleVolumeChange}
            min={0}
            max={100}
            step={5}
            size="small"
            aria-label="Volume"
          />
        </Box>
      </Fade>
    </VolumeContainer>
  );
};

export default VolumeControl;