import { useAuth } from './hooks/useAuth.js';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import styles from './AuthedApp.module.css';

export default function AuthedApp() {
  const auth = useAuth();

  if (auth.loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return auth.user ? <Dashboard auth={auth} /> : <Login auth={auth} />;
}
