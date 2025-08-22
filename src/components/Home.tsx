import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useAudio } from '../hooks/useAudio';
import AudioControls from './AudioControls';
import bgmModal from '../assets/sounds/bgm-modal.mp3';
import { useClickSound } from '../hooks/useClickSound';

interface HomeProps {
  onStart: () => void;
  onRecoverGame?: (ficha: any, lastScreen: string) => void;
}

const Home: React.FC<HomeProps> = ({ onStart, onRecoverGame }) => {
  const [modalExplicativoOpen, setModalExplicativoOpen] = useState(false);
  const [modalRecuperacaoOpen, setModalRecuperacaoOpen] = useState(false);
  const [fichaRecuperada, setFichaRecuperada] = useState<any>(null);
  const { changeTrack, tryStartMusic } = useAudio();

  // Inicializa a música de fundo quando o componente monta
  useEffect(() => {
    // 🔍 FASE 2: Verificar se há dados para recuperar ANTES de limpar
    const checkForRecovery = () => {
      try {
        const unexpectedExit = localStorage.getItem('cavaleiro:unexpectedExit');
        const savedFicha = localStorage.getItem('cavaleiro:ficha');
        
        if (unexpectedExit === 'true' && savedFicha) {
          console.log('🔄 [Home] Saída inesperada detectada - oferecendo recuperação');
          const parsed = JSON.parse(savedFicha);
          
          // Verificar se a ficha tem dados significativos (não está vazia)
          const hasData = parsed.nome || 
                          parsed.pericia?.inicial > 0 || 
                          parsed.forca?.inicial > 0 || 
                          parsed.sorte?.inicial > 0 ||
                          (parsed.bolsa && parsed.bolsa.length > 0);
                          
                  if (hasData) {
          console.log('🔄 [Home] Dados válidos encontrados para recuperação:', parsed);
          setFichaRecuperada(parsed);
          setModalRecuperacaoOpen(true);
          return true; // Indica que deve PAUSAR a limpeza
        } else {
          console.log('🔄 [Home] Dados insuficientes para recuperação - limpando');
        }
        }
      } catch (error) {
        console.warn('🔄 [Home] Erro ao verificar recuperação:', error);
      }
      return false; // Indica que pode limpar normalmente
    };

    const shouldPauseCleaning = checkForRecovery();

    if (!shouldPauseCleaning) {
      // 🧹 FASE 1: Limpar localStorage apenas se NÃO houver recuperação
      console.log('🏠 [Home] Limpando localStorage para nova sessão');
      try {
        localStorage.removeItem('cavaleiro:ficha');
        localStorage.removeItem('cavaleiro:screenId');
        localStorage.removeItem('cavaleiro:unexpectedExit');
        console.log('🏠 [Home] localStorage limpo com sucesso');
      } catch (error) {
        console.warn('🏠 [Home] Erro ao limpar localStorage:', error);
      }
    }

    // Usa uma função assíncrona para carregar a música
    const loadMusic = async () => {
      try {
        await changeTrack(bgmModal);
  
      } catch (error) {
  
      }
    };

    loadMusic();
  }, []);

  const handleIniciarAventura = () => {
    tryStartMusic();
    setModalExplicativoOpen(true);
  };

  const handleCiente = () => {
    setModalExplicativoOpen(false);
    onStart();
  };

  // 🔄 FASE 2: Handlers para recuperação
  const handleContinuarJogo = () => {
    console.log('🔄 [Home] Jogador escolheu continuar de onde parou');
    setModalRecuperacaoOpen(false);
    
    // 🎯 Recuperar última tela jogada
    const lastScreen = localStorage.getItem('cavaleiro:lastScreen') || '/sheet';
    console.log('🔄 [Home] Redirecionando para última tela:', lastScreen);
    
    // 🎮 Se tiver função de recuperação, usar ela
    if (onRecoverGame && fichaRecuperada) {
      onRecoverGame(fichaRecuperada, lastScreen);
    } else {
      // Fallback: ir para a ficha
      onStart();
    }
  };

  const handleNovaPartida = () => {
    console.log('🔄 [Home] Jogador escolheu começar nova partida');
    setModalRecuperacaoOpen(false);
    setFichaRecuperada(null);
    
    // Limpar localStorage agora
    try {
      localStorage.removeItem('cavaleiro:ficha');
      localStorage.removeItem('cavaleiro:screenId');
      localStorage.removeItem('cavaleiro:unexpectedExit');
      console.log('🏠 [Home] localStorage limpo após escolha de nova partida');
    } catch (error) {
      console.warn('🏠 [Home] Erro ao limpar localStorage:', error);
    }
    
    onStart();
  };

  const playClick = useClickSound(0.2);

  return (
    <>
      <AudioControls />

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
          Um jogo de terror macabro
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
          Falam de um cavaleiro sombrio, vindo das trevas, condenado a rondar a noite e a cobrar dívidas antigas.
          Alguns juram tê‑lo visto. Poucos voltaram para contar.
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => {
            playClick();
            handleIniciarAventura();}}
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
              background: 'linear-gradient(180deg, rgba(179,18,18,0.85))',
              boxShadow: '0 12px 36px rgba(179,18,18,0.85)',
              color: 'rgba(226, 143, 143, 0.85)'
            },
          }}
        >
          Iniciar aventura
        </Button>

        {/* Modal Explicativo - Como Jogar */}
        <Dialog
          open={modalExplicativoOpen}
          onClose={() => setModalExplicativoOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, rgba(15,17,20,0.98), rgba(25,27,30,0.98))',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #B31212, #8B0000)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(179,18,18,0.4)',
                }}
              >
                <PlayArrowIcon sx={{ color: 'white', fontSize: '28px' }} />
              </Box>
              <Typography variant="h5" sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontFamily: '"Spectral", serif',
                background: 'linear-gradient(135deg, #E0DFDB, #B8B5B0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Bem-vindo, aventureiro!
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.primary',
                fontSize: '16px',
                fontFamily: '"Spectral", serif',
              }}>
                O mundo à sua frente é sombrio, repleto de perigos ocultos e mistérios antigos. Você está prestes a caminhar por florestas densas onde sombras sussurram, explorar ruínas esquecidas onde o ar é pesado de histórias e enfrentar criaturas que só existem nos piores pesadelos.
              </Typography>

              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '15px',
                fontFamily: '"Spectral", serif',
              }}>
                Antes que sua jornada tenha início, há rituais que todo herói deve cumprir. Não tema — tudo será revelado passo a passo, conforme você avança. Mas, por agora, sua missão é forjar a essência do seu personagem.
              </Typography>

              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '15px',
                fontFamily: '"Spectral", serif',
              }}>
                Na sua <b>Ficha do Personagem</b>, você definirá seus atributos mais importantes:
              </Typography>

              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '16px',
                fontFamily: '"Spectral", serif',
              }}>
                <b>Perícia</b> – sua habilidade e destreza.<br />

                <b>Força</b> – o vigor que sustentará sua espada e sua coragem.<br />

                <b>Sorte</b> – o capricho do destino que poderá salvar sua vida... ou condená-la.
              </Typography>

              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '15px',
                fontFamily: '"Spectral", serif',
              }}>
                Para determinar cada atributo, clique no botão "Definir atributo (Perícia, Força e Sorte)".
                Se preferir sentir o peso do destino em suas próprias mãos, tenha à disposição <b>dois dados de seis lados</b> e role-os para decidir seus valores, conforme instruções abaixo:<br />
                1 - Para definir sua <b>PERÍCIA</b>, role 1 dado e some 6 ao resultado.<br />
                2 - Para definir sua <b>FORÇA</b>, role 2 dados e some 12 ao resultado.<br />
                3 - Para definir sua <b>SORTE</b>, role 1 dado e some 6 ao resultado.<br />
                </Typography>
              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '15px',
                fontFamily: '"Spectral", serif',
              }}>
                <b>Lembre-se: só poderá rolar os dados no máximo 3 vezes por atributo!</b>
              </Typography>

              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '16px',
                fontFamily: '"Spectral", serif',
              }}>
                Sua aventura começará de forma humilde: apenas uma <b>espada simples</b> será sua companheira inicial. Não se deixe enganar pela sua aparência modesta; ela pode ser tudo o que separa sua vida da morte nos primeiros passos. Com o tempo, novos equipamentos, artefatos e tesouros cruzarão seu caminho... se você sobreviver tempo suficiente para encontrá-los.
              </Typography>

              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '16px',
                fontFamily: '"Spectral", serif',
              }}>
                Agora, respire fundo, saque sua espada, firme suas mãos e dê o primeiro passo. As sombras aguardam.
              </Typography>

              <Box sx={{
                p: 3,
                background: 'rgba(179,18,18,0.1)',
                border: '1px solid rgba(179,18,18,0.2)',
                borderRadius: '12px',
                borderLeft: '4px solid #B31212',
              }}>
                <Typography variant="body2" sx={{
                  color: 'text.primary',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  fontSize: '14px',
                }}>
                  💡 <strong>Dica:</strong> Lembre-se de salvar sua ficha após definir todos os atributos para não perder seu progresso!
                </Typography>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
              onClick={()=>{
                playClick();
                handleCiente();}}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #B31212, #8B0000)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 32px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(179,18,18,0.4)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B0000, #B31212)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(179,18,18,0.6)',
                },
              }}
            >
              Ciente
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modal de Recuperação - FASE 2 */}
        <Dialog
          open={modalRecuperacaoOpen}
          onClose={() => {}} // Impedir fechamento acidental
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              background: 'linear-gradient(135deg, rgba(15,17,20,0.98), rgba(25,27,30,0.98))',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              boxShadow: '0 25px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.05)',
              backdropFilter: 'blur(20px)',
            }
          }}
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #B67B03, #8B4513)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 24px rgba(182,123,3,0.4)',
                }}
              >
                <Typography sx={{ color: 'white', fontSize: '28px' }}>🔄</Typography>
              </Box>
              <Typography variant="h5" sx={{
                color: 'text.primary',
                fontWeight: 700,
                fontFamily: '"Spectral", serif',
                background: 'linear-gradient(135deg, #E0DFDB, #B8B5B0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                Sessão Anterior Detectada
              </Typography>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Box sx={{ py: 2 }}>
              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.primary',
                fontSize: '16px',
                fontFamily: '"Spectral", serif',
              }}>
                Identificamos que você saiu inesperadamente da sessão anterior.
              </Typography>

              {fichaRecuperada && (
                <Box sx={{
                  p: 3,
                  background: 'rgba(182,123,3,0.1)',
                  border: '1px solid rgba(182,123,3,0.2)',
                  borderRadius: '12px',
                  borderLeft: '4px solid #B67B03',
                  mb: 3
                }}>
                  <Typography variant="body2" sx={{
                    color: 'text.primary',
                    fontWeight: 500,
                    fontSize: '14px',
                    mb: 1
                  }}>
                    📊 <strong>Dados da sessão anterior:</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    {fichaRecuperada.nome && `• Nome: ${fichaRecuperada.nome}`}
                    {fichaRecuperada.nome && <br />}
                    {fichaRecuperada.pericia?.inicial > 0 && `• Perícia: ${fichaRecuperada.pericia.inicial}`}
                    {fichaRecuperada.pericia?.inicial > 0 && <br />}
                    {fichaRecuperada.forca?.inicial > 0 && `• Força: ${fichaRecuperada.forca.inicial}`}
                    {fichaRecuperada.forca?.inicial > 0 && <br />}
                    {fichaRecuperada.sorte?.inicial > 0 && `• Sorte: ${fichaRecuperada.sorte.inicial}`}
                    {fichaRecuperada.sorte?.inicial > 0 && <br />}
                    {fichaRecuperada.bolsa?.length > 0 && `• Itens na bolsa: ${fichaRecuperada.bolsa.length}`}
                  </Typography>
                </Box>
              )}

              <Typography variant="body1" sx={{
                mb: 3,
                lineHeight: 1.8,
                color: 'text.secondary',
                fontSize: '15px',
                fontFamily: '"Spectral", serif',
              }}>
                <strong>Deseja continuar de onde parou ou começar uma nova partida?</strong>
              </Typography>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1, gap: 2 }}>
            <Button
              onClick={() => {
                playClick();
                handleNovaPartida();
              }}
              variant="outlined"
              size="large"
              sx={{
                borderColor: 'rgba(255,255,255,0.3)',
                color: 'text.secondary',
                padding: '12px 24px',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.5)',
                  color: 'text.primary',
                },
              }}
            >
              Nova Partida
            </Button>
            <Button
              onClick={() => {
                playClick();
                handleContinuarJogo();
              }}
              variant="contained"
              size="large"
              sx={{
                background: 'linear-gradient(135deg, #B67B03, #8B4513)',
                border: '1px solid rgba(255,255,255,0.1)',
                padding: '12px 32px',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 8px 24px rgba(182,123,3,0.4)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #8B4513, #B67B03)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 32px rgba(182,123,3,0.6)',
                },
              }}
            >
              Continuar de onde parou
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default Home;