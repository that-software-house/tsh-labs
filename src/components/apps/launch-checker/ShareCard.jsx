import React, { useEffect, useRef, useState } from 'react';
import { Download } from 'lucide-react';

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 675;

const ShareCard = ({ track, overallScore, categoryScores = [] }) => {
  const canvasRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    const background = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    background.addColorStop(0, '#0b1220');
    background.addColorStop(0.5, '#111b2e');
    background.addColorStop(1, '#081019');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    const glow = ctx.createRadialGradient(170, 120, 40, 170, 120, 360);
    glow.addColorStop(0, 'rgba(93,228,199,0.36)');
    glow.addColorStop(1, 'rgba(93,228,199,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    ctx.fillStyle = '#9eb1d4';
    ctx.font = '600 28px Manrope';
    ctx.fillText('That Software House', 64, 76);

    ctx.fillStyle = '#f2f7ff';
    ctx.font = '700 54px "Space Grotesk"';
    ctx.fillText('Launch Readiness Score', 64, 154);

    ctx.fillStyle = '#5de4c7';
    ctx.font = '700 34px "Space Grotesk"';
    ctx.fillText(`${track?.name || 'Launch'} track`, 64, 202);

    ctx.fillStyle = '#f2f7ff';
    ctx.font = '700 150px "Space Grotesk"';
    ctx.fillText(`${Math.max(0, Math.min(100, Number(overallScore) || 0))}%`, 64, 380);

    ctx.fillStyle = '#9eb1d4';
    ctx.font = '500 28px Manrope';
    ctx.fillText('Share this and challenge your team.', 64, 425);

    const startX = 640;
    const startY = 160;
    const trackWidth = 470;
    const barHeight = 22;
    const gap = 76;

    categoryScores.slice(0, 5).forEach((category, index) => {
      const y = startY + index * gap;
      const score = Math.max(0, Math.min(100, Number(category.score) || 0));

      ctx.fillStyle = '#dbe8ff';
      ctx.font = '600 24px Manrope';
      ctx.fillText(category.name, startX, y - 14);

      ctx.fillStyle = 'rgba(219,232,255,0.18)';
      ctx.fillRect(startX, y, trackWidth, barHeight);

      let fillColor = '#ef4444';
      if (score >= 40) fillColor = '#f59e0b';
      if (score >= 70) fillColor = '#5de4c7';
      if (score >= 90) fillColor = '#22c55e';

      ctx.fillStyle = fillColor;
      ctx.fillRect(startX, y, (trackWidth * score) / 100, barHeight);

      ctx.fillStyle = '#f2f7ff';
      ctx.font = '700 22px "Space Grotesk"';
      ctx.fillText(`${score}%`, startX + trackWidth + 16, y + 19);
    });

    ctx.fillStyle = 'rgba(242,247,255,0.72)';
    ctx.font = '500 20px Manrope';
    ctx.fillText('Check yours -> thatsoftwarehouse.com/launch-readiness-checker', 64, CARD_HEIGHT - 44);
  }, [track, overallScore, categoryScores]);

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsDownloading(true);

    try {
      const fileName = `launch-readiness-${track?.id || 'score'}-${Math.round(overallScore || 0)}.png`;
      const triggerDownload = (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
      };

      if (canvas.toBlob) {
        canvas.toBlob((blob) => {
          if (!blob) {
            setIsDownloading(false);
            return;
          }

          const objectUrl = URL.createObjectURL(blob);
          triggerDownload(objectUrl);
          URL.revokeObjectURL(objectUrl);
          setIsDownloading(false);
        }, 'image/png');
      } else {
        triggerDownload(canvas.toDataURL('image/png'));
        setIsDownloading(false);
      }
    } catch {
      setIsDownloading(false);
    }
  };

  return (
    <section className="launch-share-card">
      <div className="launch-share-card__canvas-wrap">
        <canvas ref={canvasRef} className="launch-share-card__canvas" width={CARD_WIDTH} height={CARD_HEIGHT} />
      </div>

      <button type="button" className="launch-btn launch-btn--primary" onClick={handleDownload} disabled={isDownloading}>
        <Download size={16} />
        {isDownloading ? 'Preparing...' : 'Download Card'}
      </button>
    </section>
  );
};

export default ShareCard;
