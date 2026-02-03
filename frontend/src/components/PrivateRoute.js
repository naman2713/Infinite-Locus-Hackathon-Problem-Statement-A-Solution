import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return (<div style={styles.loading}><div style={styles.spinner}></div><p>Loading...</p></div>);
  return isAuthenticated ? children : <Navigate to="/login" />;
};
const styles = {
  loading: { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', fontSize: '18px' },
  spinner: { width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #007bff', borderRadius: '50%', animation: 'spin 1s linear infinite' }
};
export default PrivateRoute;