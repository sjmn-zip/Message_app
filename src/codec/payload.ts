import { decodeBase64Url, encodeBase64Url } from './base64url';

export const MAX_MESSAGE_LENGTH = 200;
export const CURRENT_SCHEMA_VERSION = 1;

export interface PayloadV1 {
  v: 1;
  m: string;
}

export type MessagePayload = PayloadV1;

export function validateMessage(message: string): { valid: boolean; error?: string } {
  if (typeof message !== 'string') {
    return { valid: false, error: '메시지가 올바른 문자열 형식이 아닙니다.' };
  }

  const trimmed = message.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: '메시지를 입력해 주세요.' };
  }

  // Count string characters (supporting Unicode surrogate pairs correctly)
  const charCount = Array.from(message).length;
  if (charCount > MAX_MESSAGE_LENGTH) {
    return {
      valid: false,
      error: `메시지는 최대 ${MAX_MESSAGE_LENGTH}자까지 입력할 수 있습니다. (현재: ${charCount}자)`
    };
  }

  return { valid: true };
}

export function createPayload(message: string): MessagePayload {
  const validation = validateMessage(message);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return {
    v: CURRENT_SCHEMA_VERSION,
    m: message
  };
}

export function encodePayload(message: string): string {
  const payload = createPayload(message);
  const jsonStr = JSON.stringify(payload);
  return encodeBase64Url(jsonStr);
}

export function createShareUrl(message: string, origin?: string): string {
  const encoded = encodePayload(message);
  const base = origin || (typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '');
  return `${base}#c=${encoded}`;
}

export function extractEncodedString(input: string): string {
  let raw = input.trim();

  // If full URL with fragment, extract hash
  const hashIndex = raw.indexOf('#');
  if (hashIndex !== -1) {
    raw = raw.slice(hashIndex + 1);
  }

  // If fragment begins with c=
  if (raw.startsWith('c=')) {
    raw = raw.slice(2);
  } else if (raw.includes('c=')) {
    const params = new URLSearchParams(raw);
    const c = params.get('c');
    if (c) return c;
  }

  return raw;
}

export function decodePayload(input: string): MessagePayload {
  const encoded = extractEncodedString(input);
  if (!encoded) {
    throw new Error('링크에 메시지 데이터(#c=)가 없습니다.');
  }

  let jsonStr: string;
  try {
    jsonStr = decodeBase64Url(encoded);
  } catch (err) {
    throw new Error(`링크 데이터 디코딩 실패: ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error('메시지 데이터가 유효한 JSON 형식이 아닙니다.');
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('메시지 페이로드 형식이 올바르지 않습니다.');
  }

  const obj = parsed as Record<string, unknown>;

  if (obj.v !== 1) {
    throw new Error(`지원하지 않는 메시지 버전입니다: ${String(obj.v)}`);
  }

  if (typeof obj.m !== 'string') {
    throw new Error('메시지 본문 필드(m)가 누락되었거나 문자열이 아닙니다.');
  }

  const validation = validateMessage(obj.m);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return {
    v: 1,
    m: obj.m
  };
}
