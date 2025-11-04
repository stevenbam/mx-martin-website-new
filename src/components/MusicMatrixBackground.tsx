import React, { useRef, useEffect } from 'react';
import './MusicMatrixBackground.css';

const MusicMatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const musicNotes: string[] = ['♪', '♫', '♬', '♩', '♭', '♯', '𝄞', '𝄢', '𝅗𝅥', '𝅘𝅥', '𝅘𝅥𝅮', '𝅘𝅥𝅯', '𝅝', '𝅗𝅥'];
    const fontSize: number = 16;
    const columns: number = Math.floor(canvas.width / fontSize);
    // Initialize drops at random positions for instant animation effect
    const drops: number[] = Array(columns).fill(0).map(() => Math.floor(Math.random() * (canvas.height / fontSize)));

    const colors: string[] = ['#9d4edd', '#b185db', '#7b2cbf', '#228b22', '#2fa52f', '#1a6b1a', '#ff10f0'];

    const draw = (): void => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text: string = musicNotes[Math.floor(Math.random() * musicNotes.length)];
        const color: string = colors[Math.floor(Math.random() * colors.length)];
        ctx.fillStyle = color;

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="music-matrix-background" />;
};

export default MusicMatrixBackground;
