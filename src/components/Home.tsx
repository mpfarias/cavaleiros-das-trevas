import { Box, Typography, Button, Divider } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

interface HomeProps {
  onStart: () => void;
}

const Home: React.FC<HomeProps> = ({ onStart }) => {
  return (
    <Box
      sx={{
        maxWidth: 1100,
        margin: '6vh auto',
        padding: { xs: '20px', sm: '32px', md: '48px' },
        background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0)), rgba(15,17,20,0.55)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '0 30px 80px rgba(0,0,0,0.6), inset 0 0 120px rgba(255,255,255,0.03)',
        borderRadius: '24px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: { xs: '28px', sm: '42px', md: '56px' },
          margin: '0 0 0.25rem',
          lineHeight: 1.1,
          textShadow: '0 6px 22px rgba(0,0,0,0.7)',
        }}
      >
        A Lenda do Cavaleiro das Trevas
      </Typography>
      
      <Typography
        variant="subtitle1"
        sx={{
          color: 'text.secondary',
          margin: '0 0 2rem',
          fontSize: { xs: '14px', sm: '16px', md: '18px' },
        }}
      >
        um jogo‑livro de terror gótico
      </Typography>

      <Divider
        sx={{
          width: '120px',
          height: '2px',
          margin: '1rem 0 2rem',
          background: 'linear-gradient(90deg, transparent, #B31212, transparent)',
          borderRadius: '999px',
        }}
      />

      <Typography
        variant="body1"
        sx={{
          marginBottom: '2rem',
          fontSize: { xs: '16px', sm: '18px' },
          lineHeight: 1.6,
        }}
      >
        Sob a lua sem brilho, um sussurro percorre os campos encharcados.
        Falam de um cavaleiro com cabeça de abóbora ardente, condenado a rondar a noite e a cobrar dívidas antigas.
        Alguns juram tê‑lo visto. Poucos voltaram para contar.
      </Typography>

      <Button
        variant="contained"
        size="large"
        onClick={onStart}
        startIcon={<PlayArrowIcon />}
        sx={{
          background: 'linear-gradient(180deg, rgba(179,18,18,0.85), rgba(179,18,18,0.7))',
          border: '1px solid rgba(255,255,255,0.14)',
          padding: '14px 22px',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          boxShadow: '0 10px 28px rgba(179,18,18,0.35)',
          transition: 'transform 0.12s, box-shadow 0.2s, background 0.2s',
          '&:hover': {
            transform: 'translateY(-1px)',
            background: 'linear-gradient(180deg, rgba(182,123,3,0.95), rgba(179,18,18,0.85))',
            boxShadow: '0 12px 36px rgba(182,123,3,0.35)',
          },
        }}
      >
        Iniciar aventura
      </Button>
    </Box>
  );
};

export default Home;