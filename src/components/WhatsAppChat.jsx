import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, CheckCheck, Search } from 'lucide-react';

const ATHLETE_QUICK_SUGGESTIONS = [
  "How is my knee flexion form looking?",
  "Felt slight tightness during single-leg squats today.",
  "When is our next live video review?",
  "Logged today's workout video proof successfully!"
];

const PHYSIO_QUICK_SUGGESTIONS = [
  "Great job on today's video proof! Form looks solid.",
  "Please focus on keeping your knee aligned over your toes.",
  "I've updated your workout plan for this week.",
  "Let's schedule a 10-minute live video call to review flexion."
];

const WhatsAppChat = ({
  currentUser,
  recipient = {
    name: "Dr. Sarah Jenkins, PT",
    role: "Lead Physiotherapist",
    status: "Online • Active Now",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=SarahJenkins&backgroundColor=b6e3f4"
  },
  messages = [],
  onSendMessage,
  onRequestCall
}) => {
  const [inputText, setInputText] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef(null);

  // Deduplicate messages by id just in case
  const uniqueMessages = React.useMemo(() => {
    const seen = new Set();
    return messages.filter((m) => {
      if (!m.id) return true;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [uniqueMessages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (text) => {
    onSendMessage(text);
  };

  const currentRole = currentUser?.role || 'athlete';
  const quickSuggestions = currentRole === 'physio' ? PHYSIO_QUICK_SUGGESTIONS : ATHLETE_QUICK_SUGGESTIONS;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '580px',
        width: '100%',
        maxWidth: '850px',
        margin: '0 auto',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08)',
        background: '#ffffff'
      }}
    >
      {/* WHATSAPP TOP HEADER BAR */}
      <div
        style={{
          background: '#0f172a', // Sleek dark slate WhatsApp Web header
          color: '#ffffff',
          padding: '0.9rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={recipient.avatar}
              alt={recipient.name}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid #fc4c02'
              }}
            />
            <span
              style={{
                position: 'absolute',
                bottom: '1px',
                right: '1px',
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: '#22c55e', // Green online status indicator
                border: '2px solid #0f172a'
              }}
            ></span>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: '#ffffff', lineHeight: 1.2 }}>
              {recipient.name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block', marginTop: '2px' }}>
              {recipient.role} • <span style={{ color: '#4ade80', fontWeight: 600 }}>Online</span>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onRequestCall && (
            <button
              onClick={onRequestCall}
              title="Schedule / Call"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#ffffff',
                padding: '0.5rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                transition: 'background 0.2s ease'
              }}
            >
              <Video size={16} color="#fc4c02" />
              <span>Video Call</span>
            </button>
          )}

          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '0.4rem'
            }}
          >
            <Search size={18} />
          </button>
          <button
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              cursor: 'pointer',
              padding: '0.4rem'
            }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* WHATSAPP CHAT WALLPAPER & MESSAGES AREA */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          background: '#f8fafc', // Clean modern chat canvas
          backgroundImage: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
          backgroundSize: '20px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}
      >
        {/* Date Divider */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
          <span
            style={{
              background: '#ffffff',
              color: '#64748b',
              fontSize: '0.725rem',
              fontWeight: 700,
              padding: '0.25rem 0.85rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Encrypted Clinical Direct Line
          </span>
        </div>

        {/* Message Items */}
        {uniqueMessages.map((m) => {
          const isMe = m.sender === currentRole || (currentRole === 'athlete' && m.sender === 'athlete') || (currentRole === 'physio' && m.sender === 'physio');

          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                width: '100%'
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '0.75rem 1rem',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  background: isMe ? '#fc4c02' : '#ffffff',
                  color: isMe ? '#ffffff' : '#0f172a',
                  boxShadow: isMe
                    ? '0 4px 14px rgba(252, 76, 2, 0.25)'
                    : '0 2px 8px rgba(15, 23, 42, 0.06)',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  position: 'relative',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  lineHeight: 1.5,
                  wordBreak: 'break-word'
                }}
              >
                {!isMe && (
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#fc4c02',
                      display: 'block',
                      marginBottom: '0.25rem'
                    }}
                  >
                    {m.senderName}
                  </span>
                )}

                <div>{m.text}</div>

                {/* Footer Time & Double Read Checkmark */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.3rem',
                    marginTop: '0.35rem',
                    fontSize: '0.68rem',
                    color: isMe ? 'rgba(255,255,255,0.95)' : '#64748b',
                    fontWeight: 600
                  }}
                >
                  <span>{m.time}</span>
                  {isMe && <CheckCheck size={14} color="#ffffff" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* QUICK SUGGESTION PILLS */}
      {showQuickReplies && (
        <div
          className="no-scrollbar"
          style={{
            background: '#ffffff',
            padding: '0.5rem 1rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            gap: '0.5rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {quickSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => handleQuickReply(suggestion)}
              style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                color: '#fc4c02',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.775rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* WHATSAPP INPUT CONTROL DOCK */}
      <form
        onSubmit={handleSend}
        style={{
          background: '#ffffff',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <button
          type="button"
          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          title="Attachment"
        >
          <Paperclip size={20} />
        </button>

        <button
          type="button"
          style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}
          title="Emojis"
        >
          <Smile size={20} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type a message to ${recipient.name}...`}
          style={{
            flex: 1,
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: 'var(--radius-full)',
            padding: '0.75rem 1.25rem',
            fontSize: '0.9rem',
            color: '#0f172a',
            outline: 'none'
          }}
        />

        <button
          type="submit"
          className="btn-primary"
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
          title="Send Message"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default WhatsAppChat;
