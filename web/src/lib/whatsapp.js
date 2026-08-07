// Builds a wa.me click-to-chat link pre-filled with a message, from
// whatever phone-shaped data the lead has (the stored whatsapp URL,
// falling back to the plain telefone field).

function digitsFrom(str) {
  return (str || '').match(/\d{8,15}/)?.[0] ?? null;
}

/** Returns a bare international-format number string, or null if none found. */
export function extractWhatsappNumber(whatsappUrl, telefone) {
  const fromUrl = digitsFrom(whatsappUrl);
  if (fromUrl) return fromUrl;

  const digits = (telefone || '').replace(/\D/g, '');
  if (!digits) return null;
  // Brazilian numbers scraped from Maps come without the country code
  // (10-11 digits: DDD + number) — prepend 55 so wa.me resolves it.
  return digits.length <= 11 ? '55' + digits : digits;
}

export function buildChatLink(number, message) {
  const base = `https://wa.me/${number}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
