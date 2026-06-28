import React, { useEffect, useRef, useState } from 'react';
import useAppStore from '../store/useAppStore';
import spritesManifest from '../store/sprites.json';

export default function AnimatedPet() {
  const { petState, petAction, setPetState } = useAppStore();
  const canvasRef = useRef(null);
  const imagesRef = useRef({});
  const [framesLoaded, setFramesLoaded] = useState(false);

  const getSpritePaths = () => {
    const isTransforming = petState === 'transforming' || petState === 'transforming_dark';
    if (isTransforming) {
      const isDark = petState === 'transforming_dark';
      const folder = isDark ? 'transformation_dark' : 'transformation';
      // Both transformation and transformation_dark have 191 frames (0.png to 190.png)
      return Array.from({ length: 191 }, (_, i) => `/assets/images/ame/${folder}/${i}.png`);
    } else {
      const frameCount = spritesManifest[petAction] || 1;
      return Array.from({ length: frameCount }, (_, i) => `/assets/images/ame/sprites/${petAction}/${i}.png`);
    }
  };

  // Preload frames for current action
  useEffect(() => {
    setFramesLoaded(false);
    const paths = getSpritePaths();
    let loadedCount = 0;

    paths.forEach(src => {
      if (!imagesRef.current[src]) {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          loadedCount++;
          if (loadedCount === paths.length) setFramesLoaded(true);
        };
        img.onerror = () => {
          loadedCount++;
          if (loadedCount === paths.length) setFramesLoaded(true);
        };
        imagesRef.current[src] = img;
      } else {
        loadedCount++;
        if (loadedCount === paths.length) setFramesLoaded(true);
      }
    });
  }, [petAction, petState]);

  useEffect(() => {
    if (!framesLoaded) return;
    
    const currentFrames = getSpritePaths();
    let fps = 10;
    
    const isTransforming = petState === 'transforming' || petState === 'transforming_dark';
    if (isTransforming) {
      fps = 24; // Transform sequence is long, needs higher fps
    } else if (petState === 'kangel') {
      fps = currentFrames.length <= 4 ? 2 : 10; // Slow down small loops
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

          const isTransforming = petState === 'transforming' || petState === 'transforming_dark';
          if (isTransforming) {
            // 변신 모션: 좌우/위아래 꽉 차게 스트레치
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
        const isTransforming = petState === 'transforming' || petState === 'transforming_dark';
        if (isTransforming && frameIdx >= currentFrames.length) {
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
  }, [petState, petAction, framesLoaded, setPetState]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundImage: "url('/assets/images/ame/bg/0.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      position: 'relative'
    }}>
      {/* 영화 감상 모션일 때 전체 화면을 어둡게 덮는 오버레이 */}
      {(petAction === '-1/0/0/1' || petAction === '-1/1/0/1') && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          zIndex: 1
        }} />
      )}
      <canvas ref={canvasRef} width={800} height={800} style={{ width: '100%', height: '100%', objectFit: petState.startsWith('transforming') ? 'fill' : 'contain', zIndex: 2, position: 'relative' }} />
    </div>
  );
}
