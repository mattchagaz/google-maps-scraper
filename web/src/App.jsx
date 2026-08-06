import { configured } from './lib/supabase.js';
import AuthedApp from './AuthedApp.jsx';
import styles from './App.module.css';

// Kept as a separate component (not a conditional early-return inside
// AuthedApp) so AuthedApp can call useAuth() unconditionally — it only
// ever mounts once Supabase is actually configured.
export default function App() {
  if (!configured) {
    return (
      <div className={styles.configError}>
        <div className={styles.configCard}>
          <h1>Dashboard não configurado</h1>
          <p>
            Faltam as credenciais do Supabase. Copie <code>.env.example</code> para <code>.env</code>,
            preencha <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> com os dados
            do seu projeto e faça o build/deploy de novo.
          </p>
        </div>
      </div>
    );
  }

  return <AuthedApp />;
}
