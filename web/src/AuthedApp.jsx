import { Toaster } from 'sonner';
import { useAuth } from './hooks/useAuth.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import styles from './AuthedApp.module.css';

export default function AuthedApp() {
  const auth = useAuth();

  return (
    <>
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            color: 'var(--text)',
          },
        }}
      />
      {auth.loading ? (
        <div className={styles.loading}>Carregando...</div>
      ) : auth.user ? (
        <Dashboard auth={auth} />
      ) : (
        <Login auth={auth} />
      )}
    </>
  );
}
