import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };
  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/dashboard" style={styles.logo}>📝 CollabDocs</Link>
        {user && (
          <div style={styles.userSection}>
            <span style={styles.username}>👤 {user.username}</span>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        )}
      </div>
    </nav>
  );
};
const styles = {
  nav: { backgroundColor: '#007bff', color: 'white', padding: '1rem 0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logo: { fontSize: '24px', fontWeight: 'bold', color: 'white', textDecoration: 'none' },
  userSection: { display: 'flex', alignItems: 'center', gap: '1rem' },
  username: { fontSize: '16px' },
  logoutBtn: { backgroundColor: 'white', color: '#007bff', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '500', transition: 'background-color 0.2s' }
};
export default Navbar;