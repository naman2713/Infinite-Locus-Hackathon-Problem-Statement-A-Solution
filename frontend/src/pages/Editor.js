import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { documentsAPI } from '../services/api';
import socketService from '../services/socket';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
const Editor = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const saveTimeoutRef = useRef(null);
  const isRemoteChangeRef = useRef(false);
  useEffect(() => {
    loadDocument();
    socketService.connect();
    return () => { if (id) socketService.leaveDocument(id); socketService.removeAllListeners(); };
  }, [id]);
  useEffect(() => {
    if (document && user) {
      socketService.joinDocument(id, { id: user.id, username: user.username });
      socketService.onDocumentUpdate(({ content: newContent, user: updateUser }) => {
        isRemoteChangeRef.current = true;
        setContent(newContent);
        if (updateUser?.username) console.log(`Update from ${updateUser.username}`);
      });
      socketService.onUserJoined(({ user: joinedUser, activeUsers: users }) => {
        if (joinedUser?.username) console.log(`${joinedUser.username} joined`);
        setActiveUsers(users || []);
      });
      socketService.onUserLeft(({ user: leftUser, activeUsers: users }) => {
        if (leftUser?.username) console.log(`${leftUser.username} left`);
        setActiveUsers(users || []);
      });
      socketService.onActiveUsers((users) => { setActiveUsers(users); });
    }
  }, [document, user, id]);
  const loadDocument = async () => {
    try {
      const response = await documentsAPI.getById(id);
      setDocument(response.data);
      setContent(response.data.content || '');
      setTitle(response.data.title);
    } catch (err) {
      setError('Failed to load document');
      setTimeout(() => navigate('/dashboard'), 2000);
    } finally { setLoading(false); }
  };
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (!isRemoteChangeRef.current && user) socketService.sendDocumentChange(id, newContent, { id: user.id, username: user.username });
    isRemoteChangeRef.current = false;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => { saveDocument(newContent); }, 2000);
  };
  const handleTitleChange = (e) => { setTitle(e.target.value); };
  const saveDocument = async (contentToSave = content) => {
    setSaving(true);
    try { await documentsAPI.update(id, { title, content: contentToSave }); }
    catch (err) { console.error('Save failed:', err); }
    finally { setSaving(false); }
  };
  const handleManualSave = () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); saveDocument(); };
  const loadVersions = async () => {
    try { const response = await documentsAPI.getVersions(id); setVersions(response.data); setShowVersions(true); }
    catch (err) { setError('Failed to load versions'); }
  };
  const handleRevert = async (versionId) => {
    if (!window.confirm('Are you sure you want to revert to this version?')) return;
    try {
      const response = await documentsAPI.revertToVersion(id, versionId);
      setContent(response.data.content);
      setDocument(response.data);
      setShowVersions(false);
      if (user) socketService.sendDocumentChange(id, response.data.content, { id: user.id, username: user.username });
    } catch (err) { setError('Failed to revert version'); }
  };
  const formatDate = (date) => new Date(date).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (loading) return (<div><Navbar /><div style={styles.loading}>Loading document...</div></div>);
  if (error && !document) return (<div><Navbar /><div style={styles.error}>{error}</div></div>);
  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.toolbar}>
          <input type="text" value={title} onChange={handleTitleChange} onBlur={handleManualSave} style={styles.titleInput} />
          <div style={styles.toolbarRight}>
            <div style={styles.activeUsers}>
              👥 {activeUsers.length} user{activeUsers.length !== 1 ? 's' : ''} online
              {activeUsers.length > 0 && (<div style={styles.usersList}>{activeUsers.map((u, idx) => (<span key={idx} style={styles.userBadge}>{u.username}</span>))}</div>)}
            </div>
            <button onClick={loadVersions} style={styles.versionBtn}>📜 History</button>
            <button onClick={handleManualSave} style={styles.saveBtn} disabled={saving}>{saving ? '💾 Saving...' : '💾 Save'}</button>
          </div>
        </div>
        <textarea value={content} onChange={handleContentChange} style={styles.editor} placeholder="Start typing your document..." />
        {showVersions && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h2>Document History</h2>
                <button onClick={() => setShowVersions(false)} style={styles.closeBtn}>✕</button>
              </div>
              {versions.length === 0 ? (<p style={styles.noVersions}>No version history yet</p>) : (
                <div style={styles.versionsList}>
                  {versions.map((version) => (
                    <div key={version._id} style={styles.versionItem}>
                      <div style={styles.versionInfo}>
                        <strong>{version.editedBy?.username || 'Unknown'}</strong>
                        <span style={styles.versionDate}>{formatDate(version.timestamp)}</span>
                      </div>
                      <div style={styles.versionPreview}>{version.content.substring(0, 100)}{version.content.length > 100 ? '...' : ''}</div>
                      <button onClick={() => handleRevert(version._id)} style={styles.revertBtn}>Revert to this version</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const styles = {
  container: { height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' },
  toolbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #dee2e6', gap: '1rem' },
  titleInput: { flex: 1, fontSize: '20px', fontWeight: 'bold', border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem 1rem' },
  toolbarRight: { display: 'flex', gap: '1rem', alignItems: 'center' },
  activeUsers: { position: 'relative', padding: '0.5rem 1rem', backgroundColor: '#e7f3ff', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' },
  usersList: { position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '0.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', zIndex: 10 },
  userBadge: { display: 'block', padding: '0.25rem 0.5rem', fontSize: '14px' },
  versionBtn: { backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' },
  editor: { flex: 1, padding: '2rem', fontSize: '16px', lineHeight: '1.6', border: 'none', resize: 'none', fontFamily: 'inherit', outline: 'none' },
  loading: { textAlign: 'center', padding: '3rem', fontSize: '18px' },
  error: { textAlign: 'center', padding: '2rem', color: '#c33', fontSize: '18px' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContent: { backgroundColor: 'white', borderRadius: '8px', width: '90%', maxWidth: '700px', maxHeight: '80vh', overflow: 'auto', padding: '2rem' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '0' },
  noVersions: { textAlign: 'center', color: '#666', padding: '2rem' },
  versionsList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  versionItem: { border: '1px solid #ddd', borderRadius: '4px', padding: '1rem' },
  versionInfo: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' },
  versionDate: { color: '#666', fontSize: '14px' },
  versionPreview: { backgroundColor: '#f8f9fa', padding: '0.75rem', borderRadius: '4px', fontSize: '14px', marginBottom: '0.75rem', color: '#333' },
  revertBtn: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }
};
export default Editor;