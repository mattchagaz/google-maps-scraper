import { useState } from 'react';
import styles from './AuthBar.module.css';

const DASHBOARD_URL = import.meta.env.VITE_DASHBOARD_URL;

function openDashboard() {
  if (!DASHBOARD_URL) return;
  chrome.tabs.create({ url: DASHBOARD_URL });
}

function SyncStatus({ status }) {
  if (status === 'syncing') return <span className={styles.status}>Sincronizando...</span>;
  if (status === 'done') return <span className={styles.statusOk}>✓ Sincronizado</span>;
  if (status === 'error') return <span className={styles.statusErr}>⚠ Falhou ao sincronizar</span>;
  return null;
}

export default function AuthBar({ user, loading, authError, signIn, signUp, signOut, syncStatus }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  if (loading) return null;

  if (user) {
    return (
      <div className={styles.bar}>
        <span className={styles.email} title={user.email}>
          ☁️ {user.email}
        </span>
        <SyncStatus status={syncStatus} />
        <div className={styles.actions}>
          {DASHBOARD_URL && (
            <button type="button" className={styles.link} onClick={openDashboard}>
              Dashboard ↗
            </button>
          )}
          <button type="button" className={styles.link} onClick={signOut}>
            Sair
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <div className={styles.bar}>
        <span className={styles.email}>☁️ Sincronize suas coletas no dashboard</span>
        <button type="button" className={styles.link} onClick={() => setOpen(true)}>
          Conectar
        </button>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    const ok = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setSubmitting(false);
    if (ok) {
      if (mode === 'signup') setNotice('Conta criada! Verifique seu email para confirmar.');
      else setOpen(false);
    }
  };

  return (
    <form className={styles.form} onSubmit={submit}>
      <div className={styles.formHeader}>
        <span>{mode === 'signin' ? 'Entrar' : 'Criar conta'}</span>
        <button type="button" className={styles.close} onClick={() => setOpen(false)}>
          ✕
        </button>
      </div>
      <input
        className={styles.input}
        type="email"
        placeholder="email@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      {authError && <div className={styles.error}>{authError}</div>}
      {notice && <div className={styles.notice}>{notice}</div>}
      <button type="submit" className={styles.submit} disabled={submitting}>
        {submitting ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
      </button>
      <button
        type="button"
        className={styles.switch}
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
      </button>
    </form>
  );
}
