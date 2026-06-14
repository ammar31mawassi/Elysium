export function normalizeWhatsAppNumber(value = "") {
  const trimmed = value.trim();
  if (!trimmed) return "";
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 9) digits = `972${digits.slice(1)}`;
  return digits.length >= 8 ? digits : "";
}

export function buildWhatsAppUrl(phoneNumber, message = "") {
  const number = normalizeWhatsAppNumber(phoneNumber);
  if (!number) return "";
  return `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

