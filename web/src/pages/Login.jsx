import { useState } from 'react';
import styles from './Login.module.css';

export default function Login({ auth }) {
  const [mode, setMode] = useState('signin'); // signin | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setNotice(null);
    const ok = mode === 'signin' ? await auth.signIn(email, password) : await auth.signUp(email, password);
    setSubmitting(false);
    if (ok && mode === 'signup') setNotice('Conta criada! Verifique seu email para confirmar e depois entre.');
  };

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={submit}>
        <div className={styles.brand}>
          <div className={styles.badge}>📍</div>
          <div>
            <h1 className={styles.title}>Maps Scraper</h1>
            <p className={styles.subtitle}>Dashboard de leads</p>
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'signin' ? styles.tabActive : ''}`}
            onClick={() => setMode('signin')}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
            onClick={() => setMode('signup')}
          >
            Criar conta
          </button>
        </div>

        <label className={styles.field}>
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
            required
          />
        </label>

        <label className={styles.field}>
          <span>Senha</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            minLength={6}
            required
          />
        </label>

        {auth.authError && <div className={styles.error}>{auth.authError}</div>}
        {notice && <div className={styles.notice}>{notice}</div>}

        <button type="submit" className={styles.submit} disabled={submitting}>
          {submitting ? 'Aguarde...' : mode === 'signin' ? 'Entrar' : 'Criar conta'}
        </button>

        <p className={styles.hint}>
          Use a mesma conta que você criou (ou vai criar) no popup da extensão — os leads sincronizados
          por lá aparecem aqui.
        </p>
      </form>
    </div>
  );
}
