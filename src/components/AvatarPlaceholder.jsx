import React from 'react';
import { User } from 'lucide-react';

const AvatarPlaceholder = ({ src, name = 'User', size = 42, style = {}, className = '' }) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;

  if (src && src.trim() !== '') {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={{
          width: pixelSize,
          height: pixelSize,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--primary)',
          flexShrink: 0,
          ...style
        }}
      />
    );
  }

  // Clean Default Empty Avatar Placeholder
  return (
    <div
      className={className}
      style={{
        width: pixelSize,
        height: pixelSize,
        borderRadius: '50%',
        background: '#fff7ed',
        border: '2px solid var(--primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(255, 85, 0, 0.12)',
        ...style
      }}
      title={name}
    >
      <User size={Math.max(16, Math.round(parseInt(pixelSize) * 0.55))} />
    </div>
  );
};

export default AvatarPlaceholder;
