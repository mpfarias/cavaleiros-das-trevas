import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, Box, Typography, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import * as THREE from 'three';
import * as CANNON from 'cannon-es';



const ModalContainer = styled(Dialog)({
  '& .MuiDialog-paper': {
    background: 'linear-gradient(135deg, rgba(245,222,179,0.98) 0%, rgba(222,184,135,0.95) 100%)',
    border: '3px solid #8B4513',
    borderRadius: '20px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
    minWidth: '600px',
    maxWidth: '800px',
    padding: '20px',
    overflow: 'hidden'
  }
});

const CanvasContainer = styled(Box)({
  width: '100%',
  height: '400px',
  background: '#0b0d10',
  borderRadius: '12px',
  overflow: 'hidden',
  position: 'relative'
});

const ResultsPanel = styled(Box)({
  position: 'absolute',
  top: '12px',
  right: '12px',
  minWidth: '220px',
  padding: '12px 16px',
  border: '1px solid #2a2f3a',
  borderRadius: '12px',
  background: 'rgba(18,21,26,0.8)',
  backdropFilter: 'blur(6px)',
  color: '#e7e7e7',
  fontFamily: 'ui-monospace, Menlo, Consolas, monospace',
  fontSize: '14px',
  lineHeight: '1.35'
});



interface DiceRollModal3DProps {
  open: boolean;
  numDice: 1 | 2;
  onComplete: (dice: number[], total: number) => void;
  title?: string;
  bonus?: number;
}

const DiceRollModal3D: React.FC<DiceRollModal3DProps> = ({
  open,
  numDice,
  onComplete,

  bonus = 0
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isRolling, setIsRolling] = useState(true); // Começa rolando automaticamente
  const [results, setResults] = useState<number[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  // Refs para Three.js e Cannon.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const worldRef = useRef<CANNON.World | null>(null);
  const diceRef = useRef<Array<{mesh: THREE.Mesh, body: CANNON.Body, size: number}>>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Configurações
  const POWER_MULT = 2.0;
  const WORLD_UP = new THREE.Vector3(0, 1, 0);
  
  // Face normais para detectar valores dos dados
  const FACE_NORMALS = [
    { n: new THREE.Vector3( 0, 1, 0), value: 1 },
    { n: new THREE.Vector3( 0,-1, 0), value: 6 },
    { n: new THREE.Vector3( 1, 0, 0), value: 3 },
    { n: new THREE.Vector3(-1, 0, 0), value: 4 },
    { n: new THREE.Vector3( 0, 0, 1), value: 2 },
    { n: new THREE.Vector3( 0, 0,-1), value: 5 },
  ];

  // Criar textura para faces dos dados
  const createFaceTexture = useCallback((size: number, value: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    
    // Fundo creme
    ctx.fillStyle = "#f1efe9";
    ctx.fillRect(0, 0, size, size);
    
    // Borda
    ctx.strokeStyle = "#d7d1c0";
    ctx.lineWidth = size * 0.06;
    ctx.strokeRect(ctx.lineWidth/2, ctx.lineWidth/2, size-ctx.lineWidth, size-ctx.lineWidth);
    
    // Pips pretos
    const pip = (x: number, y: number) => {
      ctx.beginPath();
      ctx.fillStyle = "#0f0f10";
      ctx.arc(x, y, size * 0.075, 0, Math.PI * 2);
      ctx.fill();
    };
    
    const g = size / 6;
    const positions: { [key: number]: number[][] } = {
      1: [[3,3]], 2: [[1,1],[5,5]], 3: [[1,1],[3,3],[5,5]],
      4: [[1,1],[1,5],[5,1],[5,5]], 5: [[1,1],[1,5],[3,3],[5,1],[5,5]],
      6: [[1,1],[1,3],[1,5],[5,1],[5,3],[5,5]]
    };
    
    positions[value].forEach(([cx, cy]) => pip(cx * g, cy * g));
    return new THREE.CanvasTexture(canvas);
  }, []);

  // Criar dado físico
  const createDie = useCallback((size: number = 0.45) => {
    const order = [3, 4, 1, 6, 2, 5];
    const faces = order.map(v => new THREE.MeshPhysicalMaterial({
      map: createFaceTexture(256, v),
      roughness: 0.35,
      metalness: 0.0,
      clearcoat: 0.2,
      clearcoatRoughness: 0.6
    }));
    
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), faces);
    mesh.castShadow = true;

    const shape = new CANNON.Box(new CANNON.Vec3(size/2, size/2, size/2));
    const body = new CANNON.Body({
      mass: 1,
      material: new CANNON.Material('dice'),
      linearDamping: 0.12,
      angularDamping: 0.16,
      sleepSpeedLimit: 0.06,
      sleepTimeLimit: 0.35
    });
    
    body.addShape(shape);
    return { mesh, body, size };
  }, [createFaceTexture]);

  // Inicializar cena 3D
  const initScene = useCallback(() => {
    if (!canvasRef.current) {
      return;
    }

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0d10');
    sceneRef.current = scene;

    // Camera ortográfica (top-down)
    const orthoSize = 2.1;
    const aspect = canvasRef.current.clientWidth / canvasRef.current.clientHeight;
    const camera = new THREE.OrthographicCamera(
      -orthoSize * aspect, orthoSize * aspect, orthoSize, -orthoSize, 0.1, 50
    );
    const target = new THREE.Vector3(0, 0.6, 0);
    camera.position.set(0, 9, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(target);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(canvasRef.current.clientWidth, canvasRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    


    // Luzes
    scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.9));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(0, 8, 0);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(1024, 1024);
    scene.add(dirLight);

    // Mesa de feltro
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(3, 1, 3),
      new THREE.MeshStandardMaterial({ color: '#123325', roughness: 0.95 })
    );
    table.position.y = -0.5;
    table.receiveShadow = true;
    scene.add(table);

    // Bordas de madeira
    const borderMat = new THREE.MeshStandardMaterial({ 
      color: '#8B5A2B', 
      roughness: 0.6, 
      metalness: 0.1 
    });
    
    const inner = 3;
    const wallT = 0.30;
    const wallH = 1.40;
    const yBorder = wallH / 2;

    // Frente/trás
    const front = new THREE.Mesh(
      new THREE.BoxGeometry(inner + wallT*2, wallH, wallT), 
      borderMat
    );
    front.position.set(0, yBorder, inner/2 + wallT/2);
    front.castShadow = true;
    scene.add(front);

    const back = front.clone();
    back.position.set(0, yBorder, -inner/2 - wallT/2);
    scene.add(back);

    // Direita/esquerda
    const sideG = new THREE.BoxGeometry(wallT, wallH, inner + wallT*2);
    const right = new THREE.Mesh(sideG, borderMat);
    right.position.set(inner/2 + wallT/2, yBorder, 0);
    right.castShadow = true;
    scene.add(right);

    const left = right.clone();
    left.position.set(-inner/2 - wallT/2, yBorder, 0);
    scene.add(left);

    // Mundo físico
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);
    world.broadphase = new CANNON.SAPBroadphase(world);
    world.allowSleep = true;
    worldRef.current = world;

    const groundMat = new CANNON.Material('ground');
    const diceMat = new CANNON.Material('dice');

    // Materiais de contato
    world.addContactMaterial(new CANNON.ContactMaterial(groundMat, diceMat, {
      friction: 0.24,
      restitution: 0.08,
      contactEquationStiffness: 1e7,
      contactEquationRelaxation: 3
    }));

    world.addContactMaterial(new CANNON.ContactMaterial(diceMat, diceMat, {
      friction: 0.30,
      restitution: 0.06
    }));

    // Adicionar corpos estáticos
    const addStaticBox = (x: number, y: number, z: number, sx: number, sy: number, sz: number, mat: CANNON.Material = groundMat) => {
      const shape = new CANNON.Box(new CANNON.Vec3(sx/2, sy/2, sz/2));
      const body = new CANNON.Body({ mass: 0, material: mat });
      body.addShape(shape);
      body.position.set(x, y, z);
      world.addBody(body);
      return body;
    };

    // Chão
    addStaticBox(0, -0.5, 0, inner, 1, inner, groundMat);

    // Bordas físicas
    const wallLen = inner + wallT*2 + 0.02;
    addStaticBox(inner/2 + wallT/2, yBorder, 0, wallT, wallH, wallLen, groundMat);
    addStaticBox(-inner/2 - wallT/2, yBorder, 0, wallT, wallH, wallLen, groundMat);
    addStaticBox(0, yBorder, inner/2 + wallT/2, wallLen, wallH, wallT, groundMat);
    addStaticBox(0, yBorder, -inner/2 - wallT/2, wallLen, wallH, wallT, groundMat);

    // Tetos invisíveis
    const ceilSize = inner + wallT*2 + 0.40;
    addStaticBox(0, wallH + 0.8, 0, ceilSize, 0.3, ceilSize, groundMat);

    // Adicionar dados
    diceRef.current = [];
    for (let i = 0; i < numDice; i++) {
      const die = createDie(0.45);
      die.body.position.set(-0.55 + i*1.1, 0.9, (i === 0 ? -0.45 : +0.45));
      scene.add(die.mesh);
      world.addBody(die.body);
      diceRef.current.push(die);
    }

    // Loop de animação
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      if (worldRef.current) {
        worldRef.current.step(1/60, 1/60, 3);
      }

      // Sincronizar posições
      diceRef.current.forEach((die) => {
        die.mesh.position.set(
          die.body.position.x,
          die.body.position.y,
          die.body.position.z
        );
        die.mesh.quaternion.set(
          die.body.quaternion.x,
          die.body.quaternion.y,
          die.body.quaternion.z,
          die.body.quaternion.w
        );
        

      });

      renderer.render(scene, camera);
    };

    animate();
  }, [numDice, createDie]);

  // Limpar recursos
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (rendererRef.current && canvasRef.current) {
      rendererRef.current.dispose();
      canvasRef.current.innerHTML = '';
    }
    
    if (worldRef.current) {
      worldRef.current = null;
    }
    
    diceRef.current = [];
  }, []);

  // Rolar dados
  const rollDice = useCallback(() => {
    if (!worldRef.current || !diceRef.current.length) {
      return;
    }
    setIsRolling(true);
    setResults(null);
    setTotal(null);

    diceRef.current.forEach((die, i) => {
      die.body.velocity.setZero();
      die.body.angularVelocity.setZero();
      die.body.force.set(0, 0, 0);
      die.body.torque.set(0, 0, 0);
      die.body.wakeUp();

      // Posição inicial
      const startX = -1.35 + Math.random() * 0.1;
      const baseZ = (i === 0 ? -0.5 : +0.5);
      const startZ = baseZ + (Math.random() * 0.15 - 0.075);
      const startY = 0.95 + Math.random() * 0.15;
      die.body.position.set(startX, startY, startZ);

      // Impulso
      const fx = (1.8 + Math.random() * 1.8) * POWER_MULT;
      const fy = (1.2 + Math.random() * 0.8);
      const fz = (Math.random() * 2 - 1) * 0.35;
      const impulse = new CANNON.Vec3(fx, fy, fz);

      // Aplicar impulso fora do centro para rotação
      const r = new CANNON.Vec3(
        0.09 * (Math.random() * 2 - 1),
        0.10,
        0.09 * (Math.random() * 2 - 1)
      );
      die.body.applyImpulse(impulse, die.body.position.vadd(r));

      // Spin
      const spin = 12 * POWER_MULT;
      die.body.angularVelocity.set(
        (Math.random() * 2 - 1) * spin,
        (Math.random() * 2 - 1) * spin,
        (Math.random() * 2 - 1) * spin
      );
    });

    // Aguardar dados pararem e ler resultado
    setTimeout(async () => {
      const results = await readDiceResults();
      const finalTotal = results.reduce((sum, val) => sum + val, 0) + bonus;
      
      setResults(results);
      setTotal(finalTotal);
      setIsRolling(false);

      // Não fechar automaticamente - usuário clica em "Ok"
    }, 2000);
  }, [bonus, onComplete]);

  // Ler resultados dos dados
  const readDiceResults = useCallback(async (): Promise<number[]> => {
    return new Promise((resolve) => {
      const checkStable = () => {
        if (!worldRef.current || !diceRef.current.length) {
          resolve([]);
          return;
        }

        const allSlow = diceRef.current.every(die => 
          die.body.sleepState === CANNON.Body.SLEEPING ||
          (die.body.velocity.length() < 0.05 && die.body.angularVelocity.length() < 0.05)
        );



        if (allSlow) {
          // Ler valores finais
          const results = diceRef.current.map(die => {
            const q = new THREE.Quaternion(
              die.body.quaternion.x,
              die.body.quaternion.y,
              die.body.quaternion.z,
              die.body.quaternion.w
            );
            
            let bestDot = -Infinity;
            let bestVal = 1;
            
            for (const { n, value } of FACE_NORMALS) {
              const dot = n.clone().applyQuaternion(q).dot(WORLD_UP);
              if (dot > bestDot) {
                bestDot = dot;
                bestVal = value;
              }
            }
            
            return bestVal;
          });
          
          resolve(results);
        } else {
          setTimeout(checkStable, 50);
        }
      };

      checkStable();
    });
  }, []);

  // Efeitos
  useEffect(() => {
    if (open) {
      // Resetar estados imediatamente quando o modal abre
      setIsRolling(true);
      setResults(null);
      setTotal(null);
      
      // Aguardar o DOM ser renderizado antes de inicializar
      const timer = setTimeout(() => {
        initScene();
        // Rolar automaticamente após inicializar a cena
        setTimeout(() => {
          rollDice();
        }, 1000);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      cleanup();
    }

    return cleanup;
  }, [open, initScene, cleanup, rollDice]);

  // Redimensionar
  useEffect(() => {
    const handleResize = () => {
      if (rendererRef.current && canvasRef.current) {
        rendererRef.current.setSize(
          canvasRef.current.clientWidth,
          canvasRef.current.clientHeight
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatResult = () => {
    if (!results || total === null) return '';
    
    if (numDice === 1) {
      return bonus > 0 
        ? `Dado: ${results[0]} + Bônus: ${bonus} = Total: ${total}`
        : `Resultado: ${results[0]}`;
    } else {
      return bonus > 0 
        ? `Dados: ${results.join(' + ')} + Bônus: ${bonus} = Total: ${total}`
        : `Resultado: ${results.join(' + ')} = ${total}`;
    }
  };

  return (
    <ModalContainer
      open={open}
      onClose={() => {}} // Não permite fechar manualmente
      maxWidth="lg"
      fullWidth
    >
      <DialogContent sx={{ padding: '20px', textAlign: 'center' }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: '"Cinzel", serif',
            fontWeight: '700',
            color: '#4a2c00',
            marginBottom: '20px'
          }}
        >
          {isRolling ? 'Rolando...' : 'Resultado'}
        </Typography>

        <CanvasContainer ref={canvasRef} />

        {results && (
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="h6"
              sx={{
                fontFamily: '"Cinzel", serif',
                fontWeight: '700',
                color: '#4a2c00',
                textShadow: '1px 1px 2px rgba(245,222,179,0.8)'
              }}
            >
              {formatResult()}
            </Typography>
            
            <Button
              variant="contained"
              onClick={() => onComplete(results, total!)}
              sx={{
                mt: 2,
                background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
                color: '#ffffff',
                fontWeight: '600',
                padding: '10px 24px',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(79,70,229,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4338ca 0%, #5b21b6 100%)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 6px 16px rgba(79,70,229,0.45)'
                }
              }}
            >
              Ok
            </Button>
          </Box>
        )}

        <ResultsPanel>
          <strong>Resultado</strong>
          <div style={{ marginTop: '8px' }}>
            {results ? (
              <>
                Dados: [ {results.join(' + ')} ]<br/>
                <strong>Total: {total}</strong>
              </>
            ) : (
              '—'
            )}
          </div>
        </ResultsPanel>
      </DialogContent>
    </ModalContainer>
  );
};

export default DiceRollModal3D;
