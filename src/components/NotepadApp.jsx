import React from 'react';
import useAppStore from '../store/useAppStore';

export default function NotepadApp() {
  const { notes, updateNotes } = useAppStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
      {/* Menu bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid #999', backgroundColor: '#dfdfdf', padding: '2px 5px', fontSize: '12px', gap: '15px' }}>
        <span style={{ cursor: 'pointer' }}>파일(F)</span>
        <span style={{ cursor: 'pointer' }}>편집(E)</span>
        <span style={{ cursor: 'pointer' }}>서식(O)</span>
        <span style={{ cursor: 'pointer' }}>보기(V)</span>
        <span style={{ cursor: 'pointer' }}>도움말(H)</span>
      </div>
      
      {/* Text Area */}
      <textarea
        value={notes}
        onChange={(e) => updateNotes(e.target.value)}
        spellCheck="false"
        style={{
          flex: 1,
          width: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          padding: '5px',
          fontFamily: 'PixelMplus10, sans-serif',
          fontSize: '14px',
          boxSizing: 'border-box'
        }}
      />
    </div>
  );
}
