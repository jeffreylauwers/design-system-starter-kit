/**
 * Copies text to the clipboard. Falls back to a hidden textarea where the
 * Clipboard API is missing or refused (plain HTTP, denied permission).
 */
export async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    // Fall back below.
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.className = 'dsn-visually-hidden';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Kopiëren is niet gelukt');
}
