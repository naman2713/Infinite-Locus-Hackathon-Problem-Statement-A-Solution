import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { documentsAPI } from '../services/api';
import Navbar from '../components/Navbar';
const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newDocTitle, setNewDocTitle] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => { fetchDocuments(); }, []);
  const fetchDocuments = async () => {
    try {
      const response = await documentsAPI.getAll();
      setDocuments(response.data);
    } catch (err) { setError('Failed to load documents'); }
    finally { setLoading(false); }
  };
  const handleCreateDocument = async (e) => {
    e.preventDefault();
    if (!newDocTitle.trim()) return;
    try {
      const response = await documentsAPI.create({ title: newDocTitle });
      setDocuments([response.data, ...documents]);
      setNewDocTitle('');
      setShowModal(false);
      navigate(`/editor/${response.data._id}`);
    } catch (err) { setError('Failed to create document'); }
  };
  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await documentsAPI.delete(id);
      setDocuments(documents.filter((doc) => doc._id !== id));
    } catch (err) { setError('Failed to delete document'); }
  };
  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  if (loading) return (<div><Navbar /><div style={styles.loading}>Loading...</div></div>);
  return (
    <div>
      <Navbar />
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>📄 All Documents</h1>
          <button onClick={() => setShowModal(true)} style={styles.createBtn}>➕ New Document</button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        {documents.length === 0 ? (<div style={styles.empty}><p>No documents yet. Create your first document!</p></div>) : (
          <div style={styles.grid}>
            {documents.map((doc) => (
              <div key={doc._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{doc.title}</h3>
                  <button onClick={() => handleDeleteDocument(doc._id)} style={styles.deleteBtn}>🗑️</button>
                </div>
                <p style={styles.cardMeta}>Owner: {doc.owner?.username || 'Unknown'}</p>
                <p style={styles.cardMeta}>Last edited: {formatDate(doc.updatedAt)}</p>
                {doc.lastEditedBy && <p style={styles.cardMeta}>By: {doc.lastEditedBy.username}</p>}
                <button onClick={() => navigate(`/editor/${doc._id}`)} style={styles.openBtn}>Open Document →</button>
              </div>
            ))}
          </div>
        )}
        {showModal && (
          <div style={styles.modal}>
            <div style={styles.modalContent}>
              <h2>Create New Document</h2>
              <form onSubmit={handleCreateDocument}>
                <input type="text" value={newDocTitle} onChange={(e) => setNewDocTitle(e.target.value)} placeholder="Document title" style={styles.input} autoFocus />
                <div style={styles.modalButtons}>
                  <button type="submit" style={styles.submitBtn}>Create</button>
                  <button type="button" onClick={() => { setShowModal(false); setNewDocTitle(''); }} style={styles.cancelBtn}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' },
  createBtn: { backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', fontWeight: '500' },
  error: { backgroundColor: '#fee', color: '#c33', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' },
  loading: { textAlign: 'center', padding: '2rem', fontSize: '18px' },
  empty: { textAlign: 'center', padding: '3rem', color: '#666', fontSize: '18px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' },
  card: { backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', transition: 'box-shadow 0.2s' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' },
  cardTitle: { fontSize: '20px', margin: 0, flex: 1 },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0.25rem' },
  cardMeta: { fontSize: '14px', color: '#666', margin: '0.5rem 0' },
  openBtn: { backgroundColor: '#007bff', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', width: '100%', marginTop: '1rem' },
  modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' },
  input: { width: '100%', padding: '0.75rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', marginTop: '1rem', boxSizing: 'border-box' },
  modalButtons: { display: 'flex', gap: '1rem', marginTop: '1.5rem' },
  submitBtn: { flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' },
  cancelBtn: { flex: 1, backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '0.75rem', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }
};
export default Dashboard;