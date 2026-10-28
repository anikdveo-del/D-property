import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveKey,
  encryptData,
  decryptData,
  generateMasterKey,
  calculateChecksum,
} from './crypto';

test('generateMasterKey produces valid DLV format', () => {
  const key = generateMasterKey();
  assert.match(key, /^DLV-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
});

test('encryptData and decryptData perform zero-knowledge AES-256 roundtrip', async () => {
  const secretPayload = JSON.stringify({
    title: 'Swiss Bank Account',
    accountNumber: 'CH93-0000-1234-5678',
    passcode: 'UltraSecret99#',
  });
  const masterKey = 'DLV-TEST-KEY1-KEY2-KEY3';

  const encrypted = await encryptData(secretPayload, masterKey);

  assert.equal(encrypted.algorithm, 'AES-GCM');
  assert.equal(encrypted.keyDerivation, 'PBKDF2-SHA256');
  assert.ok(encrypted.ciphertext.length > 20);
  assert.ok(encrypted.iv.length === 24); // 12 bytes = 24 hex chars
  assert.ok(encrypted.salt.length === 32); // 16 bytes = 32 hex chars

  // Decrypt with correct key
  const decrypted = await decryptData(encrypted, masterKey);
  assert.equal(decrypted, secretPayload);

  const parsed = JSON.parse(decrypted);
  assert.equal(parsed.passcode, 'UltraSecret99#');
});

test('decryptData fails with incorrect master key', async () => {
  const secretPayload = 'Confidential Will and Testament';
  const masterKey = 'DLV-CORRECT-KEY1-KEY2';
  const wrongKey = 'DLV-WRONGGG-KEY1-KEY2';

  const encrypted = await encryptData(secretPayload, masterKey);

  await assert.rejects(
    async () => {
      await decryptData(encrypted, wrongKey);
    },
    /operation failed|bad decrypt|tag/i
  );
});

test('calculateChecksum produces consistent 16-char hex fingerprint', async () => {
  const text = 'test vault content';
  const hash1 = await calculateChecksum(text);
  const hash2 = await calculateChecksum(text);
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 16);
});
