import React from 'react';

const C = {
  primary:     '#009688',
  primaryDark: '#004D40',
  border:      '#E2E8F0',
  textMuted:   '#64748B',
  textLight:   '#94A3B8',
  shadowModal: '0 20px 25px -5px rgba(0,0,0,0.1),0 10px 10px -5px rgba(0,0,0,0.04)',
};

interface ModalProps {
  title:    string;
  subtitle: string;
  onClose:  () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, subtitle, onClose, children }) => (
  <div style={{
    position:'fixed', inset:0,
    backgroundColor:'rgba(15,23,42,0.4)',
    backdropFilter:'blur(8px)',
    display:'flex', alignItems:'center', justifyContent:'center',
    zIndex:1000,
  }} onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
    <div style={{
      backgroundColor:'#fff', width:'100%', maxWidth:540,
      borderRadius:16, boxShadow:C.shadowModal,
      border:`1px solid ${C.border}`, overflow:'hidden',
      animation:'slideUp 0.25s ease-out',
    }}>
      <div style={{
        padding:'24px 28px', borderBottom:`1px solid ${C.border}`,
        display:'flex', justifyContent:'space-between', alignItems:'flex-start',
      }}>
        <div>
          <h2 style={{fontSize:20, fontWeight:700, color:C.primaryDark, margin:0}}>{title}</h2>
          <p style={{fontSize:13, color:C.textMuted, marginTop:4}}>{subtitle}</p>
        </div>
        <button onClick={onClose} style={{
          background:'none', border:'none', fontSize:28, lineHeight:1,
          color:C.textLight, cursor:'pointer',
        }}>×</button>
      </div>
      {children}
    </div>
  </div>
);
