/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Digital Legacy Vault - Cryptography Engine
 * Pure client-side zero-knowledge AES-256-GCM encryption with PBKDF2 (SHA-256, 100,000 iterations).
 * Uses standard Web Crypto API supported in both Modern Browsers and React Native (via expo-crypto / react-native-quick-crypto).
 */

export interface EncryptedPackage {
  algorithm: 'AES-GCM';
  keyDerivation: 'PBKDF2-SHA256';
  iterations: number;
  salt: string; // Hex encoded 16-byte salt
  iv: string;   // Hex encoded 12-byte initialization vector
  ciphertext: string; // Base64 encoded ciphertext + auth tag
  version: number;
  timestamp: string;
}

// Helper: Convert ArrayBuffer to Hex string
export function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert Hex string to Uint8Array
export function hexToBuffer(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Helper: ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper: Base64 to Uint8Array
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Derives a 256-bit AES-GCM key from a user passphrase or Master Key using PBKDF2.
 */
export async function deriveKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = 100000
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts arbitrary plaintext string using AES-256-GCM.
 */
export async function encryptData(
  plainText: string,
  masterKey: string
): Promise<EncryptedPackage> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV recommended for AES-GCM
  const key = await deriveKey(masterKey, salt);

  const encoder = new TextEncoder();
  const encodedText = encoder.encode(plainText);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
    },
    key,
    encodedText as any
  );

  return {
    algorithm: 'AES-GCM',
    keyDerivation: 'PBKDF2-SHA256',
    iterations: 100000,
    salt: bufferToHex(salt),
    iv: bufferToHex(iv),
    ciphertext: bufferToBase64(encryptedBuffer),
    version: 1,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Decrypts an EncryptedPackage using the provided Master Key.
 */
export async function decryptData(
  pkg: EncryptedPackage,
  masterKey: string
): Promise<string> {
  const salt = hexToBuffer(pkg.salt);
  const iv = hexToBuffer(pkg.iv);
  const key = await deriveKey(masterKey, salt, pkg.iterations || 100000);

  const ciphertextBytes = base64ToBuffer(pkg.ciphertext);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: iv as any,
    },
    key,
    ciphertextBytes as any
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Generates an ergonomically formatted, secure Master Key.
 * Format: DLV-XXXX-XXXX-XXXX-XXXX (e.g. for printing in recovery kits)
 */
export function generateMasterKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Base32 without ambiguous 0/O, 1/I
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  const blocks: string[] = [];
  
  for (let i = 0; i < 4; i++) {
    let block = '';
    for (let j = 0; j < 4; j++) {
      const idx = randomBytes[i * 4 + j] % chars.length;
      block += chars[idx];
    }
    blocks.push(block);
  }
  
  return `DLV-${blocks.join('-')}`;
}

/**
 * Calculates SHA-256 fingerprint for vault data verification.
 */
export async function calculateChecksum(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer).substring(0, 16);
}
