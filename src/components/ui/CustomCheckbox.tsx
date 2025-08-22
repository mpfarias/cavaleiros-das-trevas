import { memo, useCallback } from 'react';
import { Box, Typography } from '@mui/material';
import { Check as CheckIcon } from '@mui/icons-material';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = memo(({
  checked,
  onChange,
  label,
  id
}) => {
  const checkboxId = id || `custom-checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const handleToggle = useCallback(() => {
    onChange(!checked);
  }, [checked, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  }, [handleToggle]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box
        role="checkbox"
        aria-checked={checked}
        aria-labelledby={`${checkboxId}-label`}
        tabIndex={0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        sx={{
          width: '20px',
          height: '20px',
          border: '2px solid rgba(179,18,18,0.6)',
          borderRadius: '4px',
          background: checked ? 'rgba(179,18,18,0.8)' : 'transparent',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(179,18,18,0.8)',
            background: checked ? 'rgba(179,18,18,0.9)' : 'rgba(179,18,18,0.1)',
          },
          '&:focus': {
            outline: '2px solid rgba(179,18,18,0.5)',
            outlineOffset: '2px',
          },
        }}
      >
        {checked && (
          <CheckIcon
            sx={{
              width: '16px',
              height: '16px',
              color: 'white',
            }}
          />
        )}
      </Box>
      <Typography 
        id={`${checkboxId}-label`}
        variant="body2" 
        sx={{ 
          color: 'text.secondary',
          cursor: 'pointer',
          userSelect: 'none',
          '&:hover': { color: 'text.primary' }
        }}
        onClick={handleToggle}
      >
        {label}
      </Typography>
    </Box>
  );
});

CustomCheckbox.displayName = 'CustomCheckbox';

export default CustomCheckbox;
