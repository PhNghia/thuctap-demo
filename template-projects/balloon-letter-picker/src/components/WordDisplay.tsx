// src/components/WordDisplay.tsx
import React, { useEffect, useState } from 'react';
import type { WordData } from '../types/game.types';

interface WordDisplayProps {
  currentWord: WordData;
  currentProgress: string[];
  score: number;
  level: number;
  totalWords: number;
}

const WordDisplay: React.FC<WordDisplayProps> = ({ 
  currentWord,
  currentProgress,
  score,
  level,
  totalWords
}) => {
  const [wordImage, setWordImage] = useState<HTMLImageElement | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = currentWord.imageUrl;
    img.onload = () => setWordImage(img);
  }, [currentWord]);

  const wordProgress = (currentProgress.filter(l => l !== '_').length / currentWord.word.length) * 100;
  
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  // Kích thước responsive
  const containerPadding = isMobile ? '12px' : '20px 25px';
  const imageSize = isMobile ? 70 : isTablet ? 100 : 140;
  const letterBoxSize = isMobile ? 45 : isTablet ? 55 : 70;
  const letterFontSize = isMobile ? 24 : isTablet ? 30 : 36;
  const hintFontSize = isMobile ? 14 : isTablet ? 18 : 24;
  const hintPadding = isMobile ? '6px 12px' : '10px 30px';
  const gap = isMobile ? 15 : 25;
  const flexDirection = isMobile ? 'column' : 'row';
  const scoreFontSize = isMobile ? 16 : 20;
  const levelFontSize = isMobile ? 14 : 16;

  return (
    <div style={{
      backgroundColor: 'white',
      padding: containerPadding,
      borderRadius: '16px',
      marginBottom: '15px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      width: '100%',           // Thay đổi: 100% thay vì cố định
      maxWidth: '1200px',      // Giữ maxWidth để không quá to
      boxSizing: 'border-box'
    }}>
      {/* Thanh tiến trình và điểm */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        gap: '10px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          height: '6px',
          background: '#e0e0e0',
          borderRadius: '3px',
          overflow: 'hidden',
          minWidth: '100px'
        }}>
          <div style={{
            width: `${wordProgress}%`,
            height: '100%',
            background: '#667eea',
            borderRadius: '3px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{
          fontSize: `${scoreFontSize}px`,
          fontWeight: '600',
          color: '#764ba2',
          background: '#f3e8ff',
          padding: isMobile ? '2px 10px' : '4px 16px',
          borderRadius: '20px',
          whiteSpace: 'nowrap'
        }}>
          {score}
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: `${gap}px`,
        alignItems: 'center',
        flexDirection: flexDirection
      }}>
        {/* Hình ảnh */}
        <div style={{
          width: `${imageSize}px`,
          height: `${imageSize}px`,
          border: '2px solid #667eea',
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          margin: isMobile ? '0 auto' : '0'
        }}>
          {wordImage ? (
            <img 
              src={wordImage.src} 
              alt="hình minh họa"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          ) : (
            <div style={{ color: '#999', fontSize: `${letterFontSize - 10}px` }}>📷</div>
          )}
        </div>

        {/* Khu vực ô chữ */}
        <div style={{ 
          flex: 1,
          minWidth: 0,
          width: '100%'
        }}>
          {/* Hàng ô chữ */}
          <div style={{
            display: 'flex',
            gap: isMobile ? '6px' : '12px',
            justifyContent: 'center',
            marginBottom: isMobile ? '12px' : '20px',
            flexWrap: 'wrap'
          }}>
            {currentProgress.map((letter, index) => (
              <div key={index} style={{
                width: `${letterBoxSize}px`,
                height: `${letterBoxSize}px`,
                border: '2px solid #667eea',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: `${letterFontSize}px`,
                fontWeight: 'bold',
                backgroundColor: letter !== '_' ? '#f0f7ff' : '#fafafa',
                color: '#333',
                transition: 'all 0.2s ease',
                boxShadow: letter !== '_' ? '0 2px 8px rgba(102, 126, 234, 0.2)' : 'none'
              }}>
                {letter}
              </div>
            ))}
          </div>
          
          {/* Hint */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '0 5px'
          }}>
            <span style={{
              fontSize: `${hintFontSize}px`,
              color: '#2c3e50',
              fontWeight: '500',
              fontStyle: 'italic',
              background: '#f0f7ff',
              padding: hintPadding,
              borderRadius: '40px',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)',
              border: '1px solid #e0e7ff',
              textAlign: 'center',
              wordBreak: 'break-word'
            }}>
              {currentWord.hint}
            </span>
          </div>
          
          {!isMobile && (
            <div style={{
              textAlign: 'center',
              marginTop: '10px',
              fontSize: `${levelFontSize}px`,
              color: '#888'
            }}>
              Level {level}/{totalWords}
            </div>
          )}
        </div>
      </div>
      
      {isMobile && (
        <div style={{
          textAlign: 'center',
          marginTop: '10px',
          fontSize: `${levelFontSize}px`,
          color: '#888'
        }}>
          Level {level}/{totalWords}
        </div>
      )}
    </div>
  );
};

export default WordDisplay;