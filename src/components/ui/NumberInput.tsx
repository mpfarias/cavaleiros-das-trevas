import { memo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

interface NumberInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: string;
  placeholder?: string;
  'aria-describedby'?: string;
}

const NumberInput: React.FC<NumberInputProps> = memo(({
  value,
  onChange,
  min,
  max,
  label,
  placeholder,
  'aria-describedby': ariaDescribedBy
}) => {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    const clampedValue = Math.max(min, Math.min(max, newValue));
    onChange(clampedValue);
  }, [onChange, min, max]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  }, []);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography 
        variant="caption" 
        color="text.secondary" 
        sx={{ display: 'block', mb: 1 }}
        component="label"
        htmlFor={`number-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
      >
        {label} (entre {min} e {max}):
      </Typography>
      <StyledInput
        id={`number-input-${label.toLowerCase().replace(/\s+/g, '-')}`}
        type="number"
        min={min}
        max={max}
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-describedby={ariaDescribedBy}
        aria-label={`${label}, valor entre ${min} e ${max}`}
      />
    </Box>
  );
});

NumberInput.displayName = 'NumberInput';

export default NumberInput;

// Mantém o mesmo visual e move focus/hover para CSS
const StyledInput = styled('input')({
  width: '100%',
  padding: '8px 12px',
  fontSize: '14px',
  fontFamily: '"Spectral", serif',
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(179,18,18,0.4)',
  borderRadius: '6px',
  color: '#E0DFDB',
  outline: 'none',
  transition: 'all 0.2s ease',
  '&:focus': {
    border: '1px solid rgba(179,18,18,0.7)',
    background: 'rgba(255,255,255,0.12)'
  }
});
