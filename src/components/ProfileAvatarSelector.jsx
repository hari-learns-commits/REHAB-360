import React, { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Check, Trash2, X, RotateCcw, Sparkles } from 'lucide-react';
import AvatarPlaceholder from './AvatarPlaceholder';

const makeSvgUrl = (svgString) => `data:image/svg+xml;utf8,${encodeURIComponent(svgString.replace(/\n/g, '').replace(/\s+/g, ' '))}`;

// Curated Pixar-style Round Cartoon Avatars (matching user reference design)
const PRESET_AVATARS = [
  {
    id: 'a1',
    name: 'Alex - Athlete',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#ecc94b"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#ff5500"/>
      <path d="M 40 78 L 50 88 L 60 78 Z" fill="#ffffff"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#fbd38d"/>
      <circle cx="50" cy="44" r="24" fill="#fbd38d"/>
      <circle cx="26" cy="44" r="5" fill="#fbd38d"/>
      <circle cx="74" cy="44" r="5" fill="#fbd38d"/>
      <path d="M 26 40 C 24 16, 76 16, 74 40 C 68 28, 32 28, 26 40 Z" fill="#2d3748"/>
      <path d="M 32 28 Q 50 18 64 26 Q 50 24 32 28" fill="#4a5568"/>
      <path d="M 34 33 Q 41 29 46 33" stroke="#2d3748" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M 54 33 Q 59 29 66 33" stroke="#2d3748" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <circle cx="40" cy="40" r="4.5" fill="#2d3748"/>
      <circle cx="60" cy="40" r="4.5" fill="#2d3748"/>
      <circle cx="41.5" cy="38.5" r="1.5" fill="#ffffff"/>
      <circle cx="61.5" cy="38.5" r="1.5" fill="#ffffff"/>
      <ellipse cx="33" cy="46" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <ellipse cx="67" cy="46" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <path d="M 38 49 C 38 61, 62 61, 62 49 Z" fill="#9b2c2c"/>
      <path d="M 39 49 C 45 53, 55 53, 61 49 C 58 52, 42 52, 39 49 Z" fill="#ffffff"/>
      <path d="M 44 57 C 47 54, 53 54, 56 57 C 53 60, 47 60, 44 57 Z" fill="#feb2b2"/>
    </svg>`)
  },
  {
    id: 'a2',
    name: 'Dr. Sarah - Physio',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#319795"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#ffffff"/>
      <path d="M 45 74 L 50 86 L 55 74 Z" fill="#319795"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#fed7aa"/>
      <circle cx="76" cy="44" r="12" fill="#7b341e"/>
      <circle cx="50" cy="44" r="24" fill="#fed7aa"/>
      <circle cx="26" cy="44" r="5" fill="#fed7aa"/>
      <path d="M 24 40 C 24 16, 76 16, 76 40 Q 50 22 24 40 Z" fill="#7b341e"/>
      <rect x="33" y="36" width="14" height="11" rx="3" fill="none" stroke="#2d3748" stroke-width="2.5"/>
      <rect x="53" y="36" width="14" height="11" rx="3" fill="none" stroke="#2d3748" stroke-width="2.5"/>
      <line x1="47" y1="41" x2="53" y2="41" stroke="#2d3748" stroke-width="2.5"/>
      <circle cx="40" cy="41.5" r="3" fill="#2d3748"/>
      <circle cx="60" cy="41.5" r="3" fill="#2d3748"/>
      <circle cx="41" cy="40.5" r="1" fill="#ffffff"/>
      <circle cx="61" cy="40.5" r="1" fill="#ffffff"/>
      <ellipse cx="32" cy="46" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <ellipse cx="68" cy="46" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <path d="M 40 50 C 40 60, 60 60, 60 50 Z" fill="#9b2c2c"/>
      <path d="M 41 50 C 46 53, 54 53, 59 50 Z" fill="#ffffff"/>
    </svg>`)
  },
  {
    id: 'a3',
    name: 'Dr. Valli - Ortho',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#805ad5"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#ffffff"/>
      <path d="M 42 75 L 50 86 L 58 75 Z" fill="#3182ce"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#fbd38d"/>
      <circle cx="50" cy="44" r="24" fill="#fbd38d"/>
      <circle cx="26" cy="44" r="5" fill="#fbd38d"/>
      <circle cx="74" cy="44" r="5" fill="#fbd38d"/>
      <path d="M 26 38 C 24 16, 76 16, 74 38 C 66 26, 34 26, 26 38 Z" fill="#1a202c"/>
      <circle cx="40" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="60" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="41.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <circle cx="61.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <ellipse cx="33" cy="47" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <ellipse cx="67" cy="47" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <path d="M 38 50 C 38 62, 62 62, 62 50 Z" fill="#9b2c2c"/>
      <path d="M 39 50 C 45 53, 55 53, 61 50 Z" fill="#ffffff"/>
    </svg>`)
  },
  {
    id: 'a4',
    name: 'Maya - Runner',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#ed64a6"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#dd6b20"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#feebc8"/>
      <circle cx="50" cy="44" r="24" fill="#feebc8"/>
      <path d="M 22 46 C 18 20, 82 20, 78 46 Q 50 18 22 46 Z" fill="#2c5282"/>
      <rect x="25" y="30" width="50" height="7" rx="3.5" fill="#e53e3e"/>
      <circle cx="40" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="60" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="41.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <circle cx="61.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <ellipse cx="32" cy="47" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <ellipse cx="68" cy="47" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <path d="M 39 51 C 39 61, 61 61, 61 51 Z" fill="#9b2c2c"/>
      <path d="M 40 51 C 45 54, 55 54, 60 51 Z" fill="#ffffff"/>
    </svg>`)
  },
  {
    id: 'a5',
    name: 'Marcus - Coach',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#ed8936"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#2b6cb0"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#c67d5a"/>
      <circle cx="50" cy="44" r="24" fill="#c67d5a"/>
      <circle cx="26" cy="44" r="5" fill="#c67d5a"/>
      <circle cx="74" cy="44" r="5" fill="#c67d5a"/>
      <path d="M 26 38 C 24 16, 76 16, 74 38 C 66 26, 34 26, 26 38 Z" fill="#1a202c"/>
      <circle cx="40" cy="41" r="4" fill="#1a202c"/>
      <circle cx="60" cy="41" r="4" fill="#1a202c"/>
      <circle cx="41" cy="40" r="1.5" fill="#ffffff"/>
      <circle cx="61" cy="40" r="1.5" fill="#ffffff"/>
      <path d="M 36 50 C 36 63, 64 63, 64 50 Z" fill="#ffffff"/>
      <path d="M 38 50 C 44 54, 56 54, 62 50 Z" fill="#718096"/>
    </svg>`)
  },
  {
    id: 'a6',
    name: 'Emma - Tennis Pro',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#38a169"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#d69e2e"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#fbd38d"/>
      <circle cx="50" cy="44" r="24" fill="#fbd38d"/>
      <path d="M 24 44 C 22 16, 78 16, 76 44 Q 50 22 24 44 Z" fill="#ecc94b"/>
      <rect x="25" y="30" width="50" height="7" rx="3.5" fill="#ffffff"/>
      <circle cx="40" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="60" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="41.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <circle cx="61.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <ellipse cx="32" cy="47" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <ellipse cx="68" cy="47" rx="4.5" ry="2.5" fill="#f6ad55" opacity="0.6"/>
      <path d="M 39 51 C 39 61, 61 61, 61 51 Z" fill="#9b2c2c"/>
      <path d="M 40 51 C 45 54, 55 54, 60 51 Z" fill="#ffffff"/>
    </svg>`)
  },
  {
    id: 'a7',
    name: 'Leo - Cyclist',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#3182ce"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#38a169"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#fed7aa"/>
      <circle cx="50" cy="44" r="24" fill="#fed7aa"/>
      <path d="M 24 38 C 24 16, 76 16, 76 38 Z" fill="#319795"/>
      <rect x="28" y="34" width="44" height="12" rx="6" fill="#2d3748"/>
      <rect x="31" y="36" width="17" height="8" rx="3" fill="#63b3ed"/>
      <rect x="52" y="36" width="17" height="8" rx="3" fill="#63b3ed"/>
      <path d="M 40 52 C 40 60, 60 60, 60 52 Z" fill="#9b2c2c"/>
    </svg>`)
  },
  {
    id: 'a8',
    name: 'Liam - Gym Lifter',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#e53e3e"/>
      <path d="M 20 100 C 20 72, 80 72, 80 100 Z" fill="#805ad5"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#fbd38d"/>
      <circle cx="50" cy="44" r="25" fill="#fbd38d"/>
      <path d="M 25 38 C 25 18, 75 18, 75 38 Z" fill="#1a202c"/>
      <rect x="25" y="29" width="50" height="7" rx="3.5" fill="#805ad5"/>
      <circle cx="40" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="60" cy="41" r="4.5" fill="#2d3748"/>
      <circle cx="41.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <circle cx="61.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <path d="M 37 50 C 37 63, 63 63, 63 50 Z" fill="#ffffff"/>
    </svg>`)
  },
  {
    id: 'a9',
    name: 'Dr. Chen - Senior Ortho',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#4a5568"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#ffffff"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#fed7aa"/>
      <circle cx="50" cy="44" r="24" fill="#fed7aa"/>
      <path d="M 26 40 C 24 16, 76 16, 74 40 Q 50 24 26 40 Z" fill="#cbd5e0"/>
      <rect x="33" y="36" width="14" height="11" rx="3" fill="none" stroke="#2d3748" stroke-width="2.5"/>
      <rect x="53" y="36" width="14" height="11" rx="3" fill="none" stroke="#2d3748" stroke-width="2.5"/>
      <line x1="47" y1="41" x2="53" y2="41" stroke="#2d3748" stroke-width="2.5"/>
      <circle cx="40" cy="41.5" r="3" fill="#2d3748"/>
      <circle cx="60" cy="41.5" r="3" fill="#2d3748"/>
      <path d="M 40 51 C 40 60, 60 60, 60 51 Z" fill="#ffffff"/>
    </svg>`)
  },
  {
    id: 'a10',
    name: 'Sophia - Soccer Pro',
    url: makeSvgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="50" fill="#d69e2e"/>
      <path d="M 22 100 C 22 75, 78 75, 78 100 Z" fill="#38a169"/>
      <rect x="43" y="58" width="14" height="15" rx="5" fill="#c67d5a"/>
      <circle cx="50" cy="44" r="24" fill="#c67d5a"/>
      <path d="M 24 44 C 22 16, 78 16, 76 44 Q 50 20 24 44 Z" fill="#1a202c"/>
      <circle cx="40" cy="41" r="4.5" fill="#1a202c"/>
      <circle cx="60" cy="41" r="4.5" fill="#1a202c"/>
      <circle cx="41.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <circle cx="61.5" cy="39.5" r="1.5" fill="#ffffff"/>
      <path d="M 38 50 C 38 62, 62 62, 62 50 Z" fill="#ffffff"/>
    </svg>`)
  }
];

const ProfileAvatarSelector = ({ currentAvatar = '', userName = 'User', role = 'athlete', onUpdateAvatar }) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleStartCamera = async () => {
    setCapturedPhoto(null);
    setCameraError(null);
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraError("Unable to access camera. Please check camera permissions in your browser.");
    }
  };

  const handleTakeSnap = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext('2d');
    const startX = (video.videoWidth - size) / 2;
    const startY = (video.videoHeight - size) / 2;

    ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedPhoto(dataUrl);
    stopCamera();
  };

  const handleSaveCapturedPhoto = () => {
    if (capturedPhoto) {
      onUpdateAvatar(capturedPhoto);
      setIsCameraOpen(false);
      setCapturedPhoto(null);
    }
  };

  const handleCloseCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
    setCapturedPhoto(null);
    setCameraError(null);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onUpdateAvatar(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="p-4 mb-4"
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
      }}
    >
      {/* Sleek Compact Header & Actions Row */}
      <div className="flex items-center justify-between gap-4 flex-wrap mb-3 pb-3" style={{ borderBottom: '1px solid #f1f5f9' }}>
        <div className="flex items-center gap-3">
          <AvatarPlaceholder src={currentAvatar} name={userName} size={54} />
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-main">{userName}</h4>
              {currentAvatar ? (
                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800 }}>
                  Custom Photo Active
                </span>
              ) : (
                <span style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', background: '#f1f5f9', color: '#64748b', fontWeight: 700 }}>
                  No Photo Set
                </span>
              )}
            </div>
            <span className="text-xs text-muted block">Select an avatar or add your photo</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <label className="btn-primary flex items-center gap-1.5" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', cursor: 'pointer' }}>
            <Upload size={14} /> Upload
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>

          <button onClick={handleStartCamera} className="btn-outline flex items-center gap-1.5" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem' }}>
            <Camera size={14} /> Take Photo
          </button>

          {currentAvatar && (
            <button onClick={() => onUpdateAvatar('')} className="btn-outline flex items-center gap-1.5" style={{ padding: '0.4rem 0.85rem', fontSize: '0.78rem', color: '#ef4444', borderColor: '#fca5a5' }}>
              <Trash2 size={14} /> Remove
            </button>
          )}
        </div>
      </div>

      {/* Single-Row Preset Avatars Gallery */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles size={14} style={{ color: 'var(--primary)' }} />
          <span className="text-xs font-bold text-main">Choose Your Avatar:</span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
          {PRESET_AVATARS.map((preset) => {
            const isSelected = currentAvatar === preset.url;
            return (
              <button
                key={preset.id}
                onClick={() => onUpdateAvatar(preset.url)}
                title={preset.name}
                style={{
                  position: 'relative',
                  border: isSelected ? '2px solid var(--primary)' : '2px solid transparent',
                  borderRadius: '50%',
                  padding: '2px',
                  background: 'none',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: isSelected ? '0 0 10px rgba(255, 85, 0, 0.4)' : 'none'
                }}
              >
                <img
                  src={preset.url}
                  alt={preset.name}
                  style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                />
                {isSelected && (
                  <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', background: 'var(--primary)', color: '#fff', borderRadius: '50%', padding: '1px', display: 'flex' }}>
                    <Check size={10} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* Camera Capture Modal */}
      {isCameraOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            className="glass-card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: '440px',
              background: '#ffffff',
              borderRadius: '1.25rem',
              padding: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)'
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Camera size={20} style={{ color: 'var(--primary)' }} />
                <h3 className="text-lg font-bold text-main">Take Profile Photo</h3>
              </div>
              <button onClick={handleCloseCamera} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                width: '100%',
                aspectRatio: '1/1',
                borderRadius: '1rem',
                overflow: 'hidden',
                background: '#0f172a',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {capturedPhoto ? (
                <img src={capturedPhoto} alt="Captured Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
                />
              )}

              {cameraError && (
                <div className="p-4 text-center text-sm font-semibold text-red-500 bg-red-50 m-4 rounded-md">
                  {cameraError}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              {capturedPhoto ? (
                <>
                  <button onClick={handleStartCamera} className="btn-outline flex items-center gap-2" style={{ padding: '0.55rem 1.15rem' }}>
                    <RotateCcw size={16} /> Retake
                  </button>
                  <button onClick={handleSaveCapturedPhoto} className="btn-primary flex items-center gap-2" style={{ padding: '0.55rem 1.15rem' }}>
                    <Check size={16} /> Save Photo
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleCloseCamera} className="btn-outline" style={{ padding: '0.55rem 1.15rem' }}>
                    Cancel
                  </button>
                  <button onClick={handleTakeSnap} disabled={!cameraStream || !!cameraError} className="btn-primary flex items-center gap-2" style={{ padding: '0.55rem 1.15rem', opacity: (!cameraStream || !!cameraError) ? 0.6 : 1 }}>
                    <Camera size={16} /> Snap Photo
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileAvatarSelector;
