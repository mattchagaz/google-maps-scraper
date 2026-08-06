import { useEffect, useRef, useState, useCallback } from 'react';
import { getMapsTab, saveSession, loadSession, sleep } from '../lib/chromeApi.js';

/**
 * Owns all scraping state + chrome messaging for the popup.
 * Session (chrome.storage.session) is kept in sync automatically so
 * closing/reopening the popup restores progress and collected data.
 */
export function useScraper() {
  const [tabReady, setTabReady] = useState(true);
  const [collectedData, setCollectedData] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [limit, setLimit] = useState(20);
  const [progress, setProgress] = useState(null); // { current, total, company }
  const [error, setError] = useState(null);

  const loadedRef = useRef(false);

  // ── Restore session on mount ─────────────────────────────────
  useEffect(() => {
    (async () => {
      const tab = await getMapsTab();
      setTabReady(!!tab);

      const session = await loadSession();
      if (session) {
        setCollectedData(session.collectedData || []);
        setIsRunning(session.isRunning || false);
        if (session.limit) setLimit(session.limit);
        if (session.progress) setProgress(session.progress);
      }
      loadedRef.current = true;
    })();
  }, []);

  // ── Persist session whenever relevant state changes ──────────
  useEffect(() => {
    if (!loadedRef.current) return;
    saveSession({ collectedData, isRunning, limit, progress });
  }, [collectedData, isRunning, limit, progress]);

  // ── Listen for messages from the content script ──────────────
  useEffect(() => {
    function onMessage(msg) {
      switch (msg.type) {
        case 'PROGRESS':
          setProgress({ current: msg.current, total: msg.total, company: msg.company });
          break;
        case 'COMPANY_FOUND':
          setCollectedData((prev) => [...prev, msg.data]);
          break;
        case 'SCRAPE_DONE':
          if (msg.allData?.length) setCollectedData(msg.allData);
          setIsRunning(false);
          break;
        case 'SCRAPE_ERROR':
          setError(msg.error);
          setIsRunning(false);
          break;
        default:
          break;
      }
    }
    chrome.runtime.onMessage.addListener(onMessage);
    return () => chrome.runtime.onMessage.removeListener(onMessage);
  }, []);

  const start = useCallback(async () => {
    const tab = await getMapsTab();
    if (!tab) {
      setTabReady(false);
      return;
    }

    setError(null);
    setCollectedData([]);
    setProgress(null);
    setIsRunning(true);

    const config = { limit, delay: 2000 };

    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    } catch (_) {
      /* content script may already be injected */
    }
    await sleep(300);

    chrome.tabs.sendMessage(tab.id, { action: 'PING' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.ok) {
        setError('Não foi possível conectar. Recarregue o Google Maps (F5) e tente novamente.');
        setIsRunning(false);
        return;
      }
      chrome.tabs.sendMessage(tab.id, { action: 'START_SCRAPE', config }, (r) => {
        if (chrome.runtime.lastError || !r?.ok) {
          setError('Erro ao iniciar. Recarregue (F5) e tente novamente.');
          setIsRunning(false);
        }
      });
    });
  }, [limit]);

  const stop = useCallback(async () => {
    const tab = await getMapsTab();
    if (tab) chrome.tabs.sendMessage(tab.id, { action: 'STOP_SCRAPE' }, () => {});
    setIsRunning(false);
  }, []);

  return { tabReady, collectedData, isRunning, limit, setLimit, progress, error, start, stop };
}
