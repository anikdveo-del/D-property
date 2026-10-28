/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { VaultAsset, Nominee } from '../types/vault';

export const INITIAL_NOMINEE: Nominee = {
  id: 'nom-primary',
  name: 'Eleanor Vance',
  email: 'eleanor.vance@example.org',
  phone: '+1 (555) 729-1940',
  relationship: 'Spouse & Primary Executor',
  emergencyInstructions: 'Contact estate attorney Marcus Vance (+1 555-019-2834) before transferring securities. Master key card is stored in the firesafe behind the study bookshelf.',
  masterKeyHint: 'Card with DLV-XXXX code in physical firesafe',
  addedAt: '2026-08-15T10:00:00Z',
  verificationStatus: 'VERIFIED',
};

export const INITIAL_ASSETS: VaultAsset[] = [
  {
    id: 'asset-1',
    title: 'Primary Google & Gmail Recovery',
    category: 'credentials',
    description: 'Master account recovery codes and 2FA backup keys',
    fields: [
      { id: 'f-1', label: 'Account Email', value: 'legacy.owner@gmail.com', isSensitive: false },
      { id: 'f-2', label: 'Master Password', value: 'Tr0ub4dor&3#921Secure', isSensitive: true },
      { id: 'f-3', label: '8-Digit Backup Codes', value: '8291-0492, 1924-8172, 9921-4401', isSensitive: true },
      { id: 'f-4', label: '2FA Authenticator Seed', value: 'JBSWY3DPEHPK3PXP', isSensitive: true },
    ],
    notes: 'Used to access all cloud backups, Drive AppData, and secondary accounts.',
    tags: ['google', '2fa', 'master'],
    lastUpdated: '2026-10-14T09:30:00Z',
  },
  {
    id: 'asset-2',
    title: 'Vanguard Brokerage & Retirement Index',
    category: 'financial',
    description: 'Roth IRA and Individual Brokerage account access',
    fields: [
      { id: 'f-5', label: 'Account Number', value: 'VNG-9812-441-A', isSensitive: false },
      { id: 'f-6', label: 'Portal Username', value: 'investor_legacy_26', isSensitive: true },
      { id: 'f-7', label: 'PIN / Passcode', value: '849201', isSensitive: true },
      { id: 'f-8', label: 'Security Question: First Pet', value: 'Barnaby', isSensitive: true },
    ],
    notes: 'Primary beneficiary designated as Eleanor Vance (100%).',
    tags: ['investment', 'retirement', 'vanguard'],
    lastUpdated: '2026-09-28T14:15:00Z',
  },
  {
    id: 'asset-3',
    title: 'Cold Storage Hardware Wallet Seed',
    category: 'financial',
    description: 'Ledger Nano X 24-word recovery phrase (BIP-39)',
    fields: [
      { id: 'f-9', label: 'Device Location', value: 'Safety deposit box #312, Chase Downtown', isSensitive: false },
      { id: 'f-10', label: 'Device PIN', value: '719384', isSensitive: true },
      { id: 'f-11', label: '24-Word Recovery Seed', value: 'abandon dignity crystal galaxy flame mirror velvet whisper canyon trigger anchor orbit canvas echo fossil hollow meadow pulse scout silent trophy velvet weapon winter', isSensitive: true },
    ],
    notes: 'Contains BTC, ETH and long-term self-custody assets. NEVER enter this seed into any connected keyboard.',
    tags: ['crypto', 'bitcoin', 'cold-storage'],
    lastUpdated: '2026-07-20T11:00:00Z',
  },
  {
    id: 'asset-4',
    title: 'Last Will and Testament Filing',
    category: 'legal',
    description: 'Signed legal will, healthcare proxy, and power of attorney',
    fields: [
      { id: 'f-12', label: 'Attorney Firm', value: 'Vance, Sterling & Cole LLP', isSensitive: false },
      { id: 'f-13', label: 'Attorney Contact', value: 'marcus@vancestirlinglaw.com', isSensitive: false },
      { id: 'f-14', label: 'Document Safe Location', value: 'Physical safe, combination: 28-14-36', isSensitive: true },
    ],
    notes: 'Original copy stamped by public notary on June 12, 2025. Digital copy mirrored in encrypted Drive folder.',
    tags: ['estate', 'will', 'attorney'],
    lastUpdated: '2026-08-01T16:45:00Z',
  },
  {
    id: 'asset-5',
    title: 'Personal Farewell Letter & Memories',
    category: 'notes',
    description: 'Private message for family members and photo archive location',
    fields: [
      { id: 'f-15', label: 'Archive Hard Drive', value: 'Seagate 4TB labeled "Family Archives 2010-2026"', isSensitive: false },
      { id: 'f-16', label: 'Disk Encryption Password', value: 'FamilySunsetTogether#2026', isSensitive: true },
    ],
    notes: 'Contains compiled photo books, home video digitizations, and letters for the children.',
    tags: ['family', 'personal', 'memories'],
    lastUpdated: '2026-10-02T18:20:00Z',
  },
];
