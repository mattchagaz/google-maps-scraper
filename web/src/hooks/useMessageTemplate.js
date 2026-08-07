import { useState } from 'react';

const KEY = 'mapsScraperWaMessage';
const DEFAULT_MESSAGE = 'Olá! Vi sua empresa no Google Maps e gostaria de conversar sobre uma oportunidade.';

/** Persists the WhatsApp outreach message template in this browser (per device, not synced). */
export function useMessageTemplate() {
  const [message, setMessageState] = useState(() => localStorage.getItem(KEY) || DEFAULT_MESSAGE);

  const setMessage = (value) => {
    setMessageState(value);
    localStorage.setItem(KEY, value);
  };

  return [message, setMessage];
}
