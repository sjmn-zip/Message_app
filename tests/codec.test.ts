import { describe, expect, it } from 'vitest';
import { decodeBase64Url, encodeBase64Url } from '../src/codec/base64url';
import {
  createPayload,
  createShareUrl,
  decodePayload,
  encodePayload,
  MAX_MESSAGE_LENGTH,
  validateMessage
} from '../src/codec/payload';

describe('Base64URL Codec', () => {
  it('README 명세의 예시 데이터와 정확히 일치해야 함', () => {
    const rawJson = '{"v":1,"m":"사실 그때 고마웠어"}';
    const encoded = encodeBase64Url(rawJson);
    expect(encoded).toBe('eyJ2IjoxLCJtIjoi7IKs7IukIOq3uOuVjCDqs6Drp4jsm6DslrQifQ');
    const decoded = decodeBase64Url(encoded);
    expect(decoded).toBe(rawJson);
  });

  it('한글, 영어, 특수문자, 이모지가 포함된 문자열을 왕복 인코딩/디코딩해야 함', () => {
    const sample = '안녕! Hello 🐉 TechNyong 💌 ✨\n새 줄 바꿈 & 특수문자 + / = - _';
    const encoded = encodeBase64Url(sample);
    // Base64URL은 +, /, = 문자를 포함하지 않아야 함
    expect(encoded).not.toContain('+');
    expect(encoded).not.toContain('/');
    expect(encoded).not.toContain('=');

    const decoded = decodeBase64Url(encoded);
    expect(decoded).toBe(sample);
  });

  it('빈 문자열 디코딩 시 에러를 던져야 함', () => {
    expect(() => decodeBase64Url('')).toThrow('인코딩된 데이터가 비어 있습니다.');
  });
});

describe('Payload Codec & Validation', () => {
  it('유효한 메시지로 페이로드를 생성하고 인코딩/디코딩해야 함', () => {
    const message = '테크뇽이 전하는 첫 번째 메시지입니다!';
    const encoded = encodePayload(message);
    const decoded = decodePayload(encoded);

    expect(decoded).toEqual({
      v: 1,
      m: message
    });
  });

  it('URL fragment 형태 (#c=...)에서도 페이로드를 올바르게 디코딩해야 함', () => {
    const message = '고마웠어 정말로.';
    const shareUrl = createShareUrl(message, 'https://message.example.com/');
    expect(shareUrl).toContain('https://message.example.com/#c=');

    const decoded = decodePayload(shareUrl);
    expect(decoded.m).toBe(message);
    expect(decoded.v).toBe(1);
  });

  it('공백 문자열이나 빈 메시지는 유효성 검사 실패', () => {
    expect(validateMessage('').valid).toBe(false);
    expect(validateMessage('   \n  \t  ').valid).toBe(false);
    expect(() => createPayload('   ')).toThrow();
  });

  it(`최대 글자 수(${MAX_MESSAGE_LENGTH}자) 경계값 테스트`, () => {
    const exact200 = '가'.repeat(200);
    expect(validateMessage(exact200).valid).toBe(true);
    expect(createPayload(exact200).m.length).toBe(200);

    const over200 = '가'.repeat(201);
    expect(validateMessage(over200).valid).toBe(false);
    expect(() => createPayload(over200)).toThrow();
  });

  it('이모지가 포함된 경우에도 유니코드 문자 수가 정확히 계산되어야 함', () => {
    // 🐉는 1자(코드포인트)로 계산되어야 함
    const emojiStr = '🐉'.repeat(200);
    expect(validateMessage(emojiStr).valid).toBe(true);

    const emojiStrOver = '🐉'.repeat(201);
    expect(validateMessage(emojiStrOver).valid).toBe(false);
  });

  it('손상되었거나 변조된 Base64URL 입력 시 적절한 예외 발생', () => {
    expect(() => decodePayload('#c=invalid-base64-%%')).toThrow();
    expect(() => decodePayload('#c=dGVzdA')).toThrow(); // Valid base64 but not JSON
  });

  it('지원하지 않는 버전(v: 2 등) 수신 시 예외 발생', () => {
    const invalidVersionJson = JSON.stringify({ v: 99, m: '미래 버전' });
    const encoded = encodeBase64Url(invalidVersionJson);
    expect(() => decodePayload(encoded)).toThrow('지원하지 않는 메시지 버전입니다');
  });
});
