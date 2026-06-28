import React, { useEffect, useRef } from 'react';
import useAppStore from '../store/useAppStore';

const IDLE_FRAMES = Array.from({length: 30}, (_, i) => `/assets/images/ame/sprites/0/0/0/0/${i}.png`);
const TRANSFORM_FRAMES = Array.from({length: 191}, (_, i) => `/assets/images/ame/transformation/${i}.png`);
const KANGEL_FRAMES = Array.from({length: 2}, (_, i) => `/assets/images/ame/sprites/stream/0/0/${i}.png`);

export default function AnimatedPet() {
  const { petState, setPetState } = useAppStore();
  const canvasRef = useRef(null);
  const imagesRef = useRef({});

  // Preload images
  useEffect(() => {
    const allFrames = [...IDLE_FRAMES, ...TRANSFORM_FRAMES, ...KANGEL_FRAMES];
    allFrames.forEach(src => {
      if (!imagesRef.current[src]) {
        const img = new Image();
        img.src = src;
        imagesRef.current[src] = img;
      }
    });
  }, []);

  useEffect(() => {
    let currentFrames = IDLE_FRAMES;
    let fps = 10;
    
    if (petState === 'transforming') {
      currentFrames = TRANSFORM_FRAMES;
      fps = 24; // Transform sequence is long, needs higher fps
    } else if (petState === 'kangel') {
      currentFrames = KANGEL_FRAMES;
      fps = 2; // Stream idle is very slow (2 frames)
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frameIdx = 0;
    let animationId;
    let lastTime = performance.now();

    const render = (time) => {
      const elapsed = time - lastTime;
      const frameDuration = 1000 / fps;
      
      if (elapsed > frameDuration) {
        lastTime = time;
        const src = currentFrames[frameIdx];
        const img = imagesRef.current[src];
        
        if (img && img.complete && img.width > 0) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          let drawX, drawY, drawW, drawH;

          if (petState === 'transforming') {
            // 변신 모션: 좌우/위아래 꽉 차게 스트레치 (비율 무시하고 정확히 맞춤)
            drawW = canvas.width;
            drawH = canvas.height;
            drawX = 0;
            drawY = 0;
          } else {
            // 아메/초텐쨩: 의자에 앉은 느낌을 위해 크기를 키우고 아래로 내림
            let scale = Math.min(canvas.width / img.width, canvas.height / img.height);
            scale = scale * 1.35; // 크기를 35% 키움
            
            drawW = img.width * scale;
            drawH = img.height * scale;
            
            drawX = (canvas.width - drawW) / 2;
            // 중앙(y) 대신 캔버스 하단으로 붙이면서 약간 여유를 둠
            drawY = canvas.height - drawH + 25; 
          }
          
          ctx.drawImage(img, drawX, drawY, drawW, drawH);
        }
        
        frameIdx++;
        
        // Handle end of transformation sequence
        if (petState === 'transforming' && frameIdx >= currentFrames.length) {
          setPetState('kangel');
          return; // Stop rendering until state updates
        }
        
        // Loop normally
        if (frameIdx >= currentFrames.length) {
          frameIdx = 0;
        }
      }
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => cancelAnimationFrame(animationId);
  }, [petState, setPetState]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: "url('/assets/images/ame/bg/0.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }}>
      <canvas ref={canvasRef} width={800} height={800} style={{ width: '100%', height: '100%', objectFit: petState === 'transforming' ? 'fill' : 'contain' }} />
    </div>
  );
}
