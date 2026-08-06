import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import AuthBar from './components/AuthBar.jsx';
import AlertBanner from './components/AlertBanner.jsx';
import LimitControl from './components/LimitControl.jsx';
import ProgressPanel from './components/ProgressPanel.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import ActionBar from './components/ActionBar.jsx';
import Disclaimer from './components/Disclaimer.jsx';
import Footer from './components/Footer.jsx';
import { useScraper } from './hooks/useScraper.js';
import { useAuth } from './hooks/useAuth.js';
import { useCloudSync } from './hooks/useCloudSync.js';
import { applyFilters } from './lib/filters.js';
import { downloadXLS } from './lib/xlsExport.js';
import styles from './App.module.css';

export default function App() {
  const { tabReady, collectedData, isRunning, limit, setLimit, progress, error, start, stop } =
    useScraper();

  const auth = useAuth();
  const { status: syncStatus } = useCloudSync({ isRunning, collectedData, user: auth.user });

  const [activeKeys, setActiveKeys] = useState([]);
  const [search, setSearch] = useState('');

  const toggleFilter = (key) =>
    setActiveKeys((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  // What "Baixar Excel" actually exports — respects active filters,
  // so "só quem não tem website" pode ser exportado direto.
  const exportData = useMemo(
    () => applyFilters(collectedData, activeKeys, search),
    [collectedData, activeKeys, search]
  );

  const showResults = !isRunning && collectedData.length > 0;

  return (
    <div className={styles.container}>
      <Header />

      {auth.cloudConfigured && <AuthBar {...auth} syncStatus={syncStatus} />}

      {!tabReady && <AlertBanner />}

      <LimitControl value={limit} onChange={setLimit} disabled={isRunning} />

      {(isRunning || error) && <ProgressPanel progress={progress} error={isRunning ? null : error} />}

      {showResults && (
        <ResultsPanel
          data={collectedData}
          activeKeys={activeKeys}
          onToggleFilter={toggleFilter}
          search={search}
          onSearchChange={setSearch}
        />
      )}

      <ActionBar
        isRunning={isRunning}
        hasResults={showResults}
        downloadCount={exportData.length}
        disabled={!tabReady}
        onStart={start}
        onStop={stop}
        onDownload={() => downloadXLS(exportData)}
      />

      <Disclaimer />
      <Footer />
    </div>
  );
}
