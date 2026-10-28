/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { EncryptedPackage } from '../utils/crypto';

export type AssetCategory = 'credentials' | 'financial' | 'legal' | 'notes';

export interface SecretField {
  id: string;
  label: string;
  value: string;
  isSensitive?: boolean;
}

export interface VaultAsset {
  id: string;
  title: string;
  category: AssetCategory;
  description: string;
  fields: SecretField[];
  notes?: string;
  tags: string[];
  lastUpdated: string;
  encryptedBlob?: EncryptedPackage;
}

export interface Nominee {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  emergencyInstructions: string;
  masterKeyHint: string;
  addedAt: string;
  verificationStatus: 'VERIFIED' | 'PENDING';
}

export interface UserSession {
  isLoggedIn: boolean;
  email: string;
  displayName: string;
  avatarUrl: string;
  driveSyncStatus: 'synced' | 'syncing' | 'offline' | 'pending';
  lastDriveSync?: string;
  driveFileId?: string;
  storageUsedBytes: number;
}
