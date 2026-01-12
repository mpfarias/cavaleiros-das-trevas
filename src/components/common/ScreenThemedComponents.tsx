import React from 'react';
import { Box, Card, Typography } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import type { ScreenTheme } from '../../constants/screenThemes';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const fadeInImage = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

/**
 * Componentes estilizados que usam temas dinamicamente
 * Esses componentes são criados dentro do componente que os usa para ter acesso ao tema
 */

export const createThemedComponents = (theme: ScreenTheme) => {
  const Container = styled(Box)({
    position: 'relative',
    width: '100%',
    minHeight: '100vh',
    background: theme.container.background,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: '20px',
    overflow: 'visible'
  });

  const CardWrap = styled(Card)({
    maxWidth: '900px',
    width: '100%',
    background: theme.cardWrap.background,
    border: theme.cardWrap.border,
    borderRadius: theme.cardWrap.borderRadius,
    boxShadow: theme.cardWrap.boxShadow,
    position: 'relative',
    animation: `${fadeIn} 1s ease-out`,
    overflow: 'visible'
  });

  const NarrativeText = styled(Typography)({
    fontFamily: '"Spectral", serif',
    fontSize: 'clamp(16px, 2vw, 18px)',
    lineHeight: 1.8,
    color: theme.narrativeText.color,
    textAlign: 'justify',
    marginBottom: '32px',
    textShadow: theme.narrativeText.textShadow
  });

  const ChoiceButton = styled('button')({
    padding: '16px 24px',
    background: theme.choiceButton.background,
    color: theme.choiceButton.color,
    border: theme.choiceButton.border,
    borderRadius: '12px',
    fontSize: '16px',
    fontFamily: '"Cinzel", serif',
    fontWeight: 600,
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    textShadow: theme.choiceButton.textShadow,
    boxShadow: theme.choiceButton.boxShadow,
    width: '100%',
    '&:focus-visible': {
      outline: `2px solid ${theme.choiceButton.hoverBorderColor}`,
      outlineOffset: '2px'
    },
    '&:hover': {
      background: theme.choiceButton.hoverBackground,
      borderColor: theme.choiceButton.hoverBorderColor,
      color: theme.choiceButton.color,
      transform: 'translateY(-2px) scale(1.02)',
      boxShadow: theme.choiceButton.hoverBoxShadow,
      textShadow: theme.choiceButton.hoverTextShadow
    },
    '&:active': {
      transform: 'translateY(0) scale(0.98)'
    },
    '&:disabled': {
      opacity: 0.3,
      cursor: 'not-allowed',
      transform: 'none'
    }
  });

  const StyledLocationLink = styled('span')({
    color: theme.locationLink.color,
    textDecoration: 'underline',
    cursor: 'pointer',
    fontWeight: 600,
    transition: 'color 0.2s ease',
    textShadow: theme.locationLink.textShadow,
    '&:hover': {
      color: theme.locationLink.hoverColor,
      textShadow: theme.locationLink.hoverTextShadow
    }
  });

  // Wrapper component para aceitar onClick
  const LocationLink: React.FC<React.HTMLAttributes<HTMLSpanElement>> = (props) => {
    return <StyledLocationLink {...props} />;
  };

  const HoverImage = styled(Box)({
    position: 'fixed',
    zIndex: 1500,
    pointerEvents: 'none',
    animation: `${fadeInImage} 0.3s ease-out`,
    '& img': {
      maxWidth: '400px',
      maxHeight: '400px',
      borderRadius: '12px',
      border: theme.hoverImage.border,
      boxShadow: theme.hoverImage.boxShadow,
      backgroundColor: 'transparent'
    }
  });

  return {
    Container,
    CardWrap,
    NarrativeText,
    ChoiceButton,
    LocationLink,
    HoverImage
  };
};
