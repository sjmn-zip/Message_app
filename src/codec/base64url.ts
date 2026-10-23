/**
 * UTF-8 <-> Base64URL codec
 *
 * Designed to handle multi-byte UTF-8 characters (Korean, Emoji, etc.)
 * safely via TextEncoder / TextDecoder.
 * Base64URL substitutes '+' with '-' and '/' with '_', and omits padding '='.
 */

export function encodeBase64Url(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decodeBase64Url(base64url: string): string {
  if (!base64url) {
    throw new Error('인코딩된 데이터가 비어 있습니다.');
  }

  // Restore base64 standard characters
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '=' until length is a multiple of 4
  const mod4 = base64.length % 4;
  if (mod4 === 2) {
    base64 += '==';
  } else if (mod4 === 3) {
    base64 += '=';
  } else if (mod4 === 1) {
    throw new Error('유효하지 않은 Base64URL 문자열 길이입니다.');
  }

  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error('Base64 디코딩에 실패했습니다.');
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  const decoder = new TextDecoder('utf-8', { fatal: true });
  try {
    return decoder.decode(bytes);
  } catch {
    throw new Error('UTF-8 텍스트 디코딩에 실패했습니다.');
  }
}
