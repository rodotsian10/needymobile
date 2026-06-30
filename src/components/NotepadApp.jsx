import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import Markdown from 'react-markdown';
import { playExecuteSound, playOpenSound } from '../utils/audio';

export default function NotepadApp() {
  const { notes, currentNoteId, addNote, updateNote, deleteNote, setCurrentNote, petState, setPetAction, settings } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState('');
  const [localContent, setLocalContent] = useState('');
  
  // Timeout for reverting motion when typing stops
  const [typingTimeout, setTypingTimeout] = useState(null);
  const prevActionRef = useRef(null);

  const safeNotes = Array.isArray(notes) ? notes : [];
  const currentNote = safeNotes.find(n => n.id === currentNoteId);

  useEffect(() => {
    if (currentNote) {
      setLocalTitle(currentNote.title);
      setLocalContent(currentNote.content);
    } else {
      setLocalTitle('');
      setLocalContent('');
      setIsEditing(false);
    }
  }, [currentNoteId, currentNote]);

  const handleCreateNote = () => {
    playExecuteSound();
    const newNote = {
      id: Date.now().toString(),
      title: '새 메모',
      content: '# 새로운 메모입니다\\n여기에 마크다운 문법으로 내용을 입력하세요.',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    addNote(newNote);
    setIsEditing(true);
  };

  const handleSave = () => {
    playExecuteSound();
    if (currentNoteId) {
      updateNote(currentNoteId, localContent, localTitle);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    playExecuteSound();
    if (currentNoteId && window.confirm('정말 이 메모를 삭제하시겠습니까?')) {
      deleteNote(currentNoteId);
    }
  };

  // Motion automation
  const handleTyping = () => {
    if (!settings.autoMotionEnabled) return;
    
    // Save the previous action before we started typing
    if (!typingTimeout && petAction !== '-1/1/0/0' && petAction !== 'stream/18/0') {
      prevActionRef.current = petAction;
    }

    if (typingTimeout) clearTimeout(typingTimeout);
    
    // Change motion when typing
    if (petState === 'idle') {
      setPetAction('-1/1/0/0'); // Ame gaming (normal)
    } else if (petState === 'kangel') {
      setPetAction('stream/18/0'); // KAngel gaming
    }

    // Revert after 2 seconds of inactivity
    const timeout = setTimeout(() => {
      setTypingTimeout(null);
      if (prevActionRef.current) {
        setPetAction(prevActionRef.current);
      } else {
        if (petState === 'idle') setPetAction('0/0/0/0');
        else if (petState === 'kangel') setPetAction('stream/0/0');
      }
    }, 2000);
    
    setTypingTimeout(timeout);
  };

  return (
    <div style={{ display: 'flex', height: '100%', backgroundColor: '#dfdfdf', padding: '2px', boxSizing: 'border-box' }}>
      
      {/* Sidebar - Note List */}
      <div style={{ width: '120px', border: '2px inset #dfdfdf', backgroundColor: '#dfdfdf', display: 'flex', flexDirection: 'column', marginRight: '4px' }}>
        <button 
          onClick={handleCreateNote}
          className="retro-btn"
          style={{ margin: '5px', padding: '5px', color: '#000' }}
        >
          + 새 메모
        </button>
        <div style={{ overflowY: 'auto', flex: 1, borderTop: '2px solid #000', borderLeft: '2px solid #000', borderRight: '2px solid #fff', borderBottom: '2px solid #fff', backgroundColor: '#fff' }}>
          {safeNotes.map(note => (
            <div 
              key={note.id}
              onClick={() => { playOpenSound(); setCurrentNote(note.id); setIsEditing(false); }}
              style={{
                padding: '8px 5px',
                borderBottom: '1px solid #dfdfdf',
                backgroundColor: currentNoteId === note.id ? '#000080' : 'transparent',
                color: currentNoteId === note.id ? '#fff' : '#000',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontSize: '12px'
              }}
            >
              {note.title || '제목 없음'}
            </div>
          ))}
          {safeNotes.length === 0 && (
            <div style={{ padding: '10px', fontSize: '11px', color: '#000', textAlign: 'center', fontFamily: 'PixelMplus10, sans-serif' }}>메모가 없습니다</div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '2px solid #dfdfdf', borderTopColor: '#000', borderLeftColor: '#000', borderRightColor: '#fff', borderBottomColor: '#fff', backgroundColor: '#fff' }}>
        
        {currentNote ? (
          <>
            {/* Toolbar */}
            <div style={{ display: 'flex', borderBottom: '2px solid #dfdfdf', backgroundColor: '#dfdfdf', padding: '4px', gap: '4px', alignItems: 'center' }}>
              <button className="retro-btn" style={{ padding: '2px 8px', color: '#000' }} onClick={() => { playExecuteSound(); setIsEditing(!isEditing); }}>
                {isEditing ? '👁️ 보기 (View)' : '✏️ 편집 (Edit)'}
              </button>
              {isEditing && (
                <button className="retro-btn" style={{ padding: '2px 8px', color: '#000' }} onClick={handleSave}>
                  💾 저장
                </button>
              )}
              <div style={{ flex: 1 }} />
              <button className="retro-btn" style={{ padding: '2px 8px', color: '#000' }} onClick={handleDelete}>
                🗑️ 삭제
              </button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '10px', boxSizing: 'border-box' }}>
              {isEditing ? (
                <>
                  <input
                    value={localTitle}
                    onChange={(e) => { setLocalTitle(e.target.value); handleTyping(); }}
                    placeholder="제목을 입력하세요"
                    style={{
                      width: '100%', border: '2px solid #dfdfdf', borderTopColor: '#000', borderLeftColor: '#000', borderRightColor: '#fff', borderBottomColor: '#fff', padding: '5px', 
                      marginBottom: '10px', fontFamily: 'PixelMplus10, sans-serif', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#fff'
                    }}
                  />
                  <textarea
                    value={localContent}
                    onChange={(e) => { setLocalContent(e.target.value); handleTyping(); }}
                    placeholder="마크다운 문법으로 메모를 작성하세요..."
                    spellCheck="false"
                    style={{
                      flex: 1, width: '100%', border: '2px solid #dfdfdf', borderTopColor: '#000', borderLeftColor: '#000', borderRightColor: '#fff', borderBottomColor: '#fff', padding: '10px',
                      outline: 'none', resize: 'none', fontFamily: 'PixelMplus10, sans-serif', 
                      fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#fff'
                    }}
                  />
                </>
              ) : (
                <div style={{ 
                  flex: 1, overflowY: 'auto', padding: '0 10px', 
                  fontFamily: 'PixelMplus10, sans-serif', color: '#000' 
                }}>
                  <h1 style={{ marginTop: '5px', borderBottom: '2px dashed #dfdfdf', paddingBottom: '10px' }}>{currentNote.title}</h1>
                  <div className="markdown-body">
                    <Markdown>{currentNote.content}</Markdown>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', flexDirection: 'column', backgroundColor: '#dfdfdf' }}>
            <p>선택된 메모가 없습니다</p>
            <button className="retro-btn" onClick={handleCreateNote} style={{ color: '#000' }}>새 메모 만들기</button>
          </div>
        )}

      </div>
    </div>
  );
}
