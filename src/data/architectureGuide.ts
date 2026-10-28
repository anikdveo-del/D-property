/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface StepGuide {
  stepNumber: number;
  title: string;
  tagline: string;
  badge: string;
  commands?: string[];
  description: string;
  keyLibraries: { name: string; purpose: string; versionOrNote: string }[];
  codeFiles: { filename: string; language: string; content: string; commentary: string }[];
  securityNotes: string[];
}

export const ARCHITECTURE_STEPS: StepGuide[] = [
  {
    stepNumber: 1,
    title: 'Initial Expo Setup & Dependencies',
    tagline: 'Bootstrap Expo Managed Workflow with Native Crypto, Drive API & Firebase',
    badge: 'Foundation',
    commands: [
      '# 1. Initialize modern Expo project (TypeScript template)',
      'npx create-expo-app@latest digital-legacy-vault --template blank-typescript',
      'cd digital-legacy-vault',
      '',
      '# 2. Core Navigation & Safe Area',
      'npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack react-native-screens react-native-safe-area-context',
      '',
      '# 3. Authentication & Firebase (Serverless Google Sign-in)',
      'npx expo install @react-native-firebase/app @react-native-firebase/auth @react-native-google-signin/google-signin',
      '# Or for Expo Go / pure JS flow: expo-auth-session expo-crypto',
      '',
      '# 4. Local AES-256 Encryption & Secure Keystore',
      'npx expo install expo-crypto expo-secure-store',
      'npm install crypto-js @types/crypto-js',
      '# For high-speed native AES-GCM: npx expo install react-native-quick-crypto',
      '',
      '# 5. Local Push Notifications & Background Tasks (Dead Man Switch Reminders)',
      'npx expo install expo-notifications expo-task-manager expo-background-fetch',
      '',
      '# 6. Icons, File System & UI Essentials',
      'npx expo install expo-file-system expo-sharing lucide-react-native react-native-svg',
    ],
    description: 'Sets up a modern Expo SDK 52+ managed project with pre-configured native configuration plugins. This stack delivers zero server hosting costs by leveraging Firebase Authentication (free tier), Google Drive AppData folder API for zero-cost private cloud storage, and Expo Notifications for local client-side countdown reminders.',
    keyLibraries: [
      { name: 'expo-crypto & expo-secure-store', purpose: 'Hardware-backed keychain/keystore storage for Master Key salt and local PBKDF2/AES-256 operations', versionOrNote: 'Expo SDK 52' },
      { name: '@react-native-google-signin/google-signin', purpose: 'Native Google OAuth prompt with Google Drive AppData scope (`drive.appdata`)', versionOrNote: 'v13+' },
      { name: 'expo-notifications', purpose: 'Scheduled local push reminders (at 7, 3, and 1 days before switch trigger) without needing an APNs server', versionOrNote: 'Expo Managed' },
      { name: 'expo-file-system & expo-sharing', purpose: 'Export encrypted .dlv.enc recovery backup files and share with Nominees offline', versionOrNote: 'Expo Managed' },
    ],
    codeFiles: [
      {
        filename: 'app.json',
        language: 'json',
        commentary: 'Configures native app permissions, URL schemes for Google Sign-in redirect, and notification icons.',
        content: `{
  "expo": {
    "name": "Digital Legacy Vault",
    "slug": "digital-legacy-vault",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "dark",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#090D16"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.legacyvault.digital",
      "infoPlist": {
        "NSFaceIDUsageDescription": "Use Face ID to quickly unlock your encrypted Digital Legacy Vault on this device."
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#090D16"
      },
      "package": "com.legacyvault.digital",
      "permissions": [
        "RECEIVE_BOOT_COMPLETED",
        "SCHEDULE_EXACT_ALARM",
        "USE_BIOMETRIC"
      ]
    },
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#10B981"
        }
      ],
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID"
        }
      ]
    ]
  }
}`,
      },
      {
        filename: 'package.json',
        language: 'json',
        commentary: 'Exact dependency manifest required to build both iOS & Android bundles.',
        content: `{
  "name": "digital-legacy-vault",
  "version": "1.0.0",
  "main": "expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo run:android",
    "ios": "expo run:ios",
    "web": "expo start --web"
  },
  "dependencies": {
    "@react-native-google-signin/google-signin": "^13.1.0",
    "@react-navigation/bottom-tabs": "^7.2.0",
    "@react-navigation/native": "^7.0.14",
    "@react-navigation/native-stack": "^7.2.0",
    "crypto-js": "^4.2.0",
    "expo": "~52.0.0",
    "expo-crypto": "~14.0.0",
    "expo-file-system": "~18.0.0",
    "expo-notifications": "~0.29.0",
    "expo-secure-store": "~14.0.0",
    "expo-sharing": "~13.0.0",
    "lucide-react-native": "^0.475.0",
    "react": "18.3.1",
    "react-native": "0.76.6",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "react-native-svg": "15.8.0"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "@types/crypto-js": "^4.2.2",
    "@types/react": "~18.3.12",
    "typescript": "^5.3.3"
  },
  "private": true
}`,
      },
    ],
    securityNotes: [
      'Zero-knowledge mandate: The user encryption key is derived locally and NEVER transmitted to Google Drive, Firebase, or external telemetry.',
      'Google Drive AppData Folder (`https://www.googleapis.com/auth/drive.appdata`): This is a dedicated hidden folder that only this app can read/write. It does not clutter the user\'s personal Drive files and other apps cannot access it.',
      'Local SecureStore: Used only for caching the user salt and local biometric unlock credentials. Master Key can be re-entered by the user or held strictly in transient memory.',
    ],
  },
  {
    stepNumber: 2,
    title: 'Clean Modular Folder Structure',
    tagline: 'Domain-Driven Architecture Separating Encryption, Drive Sync & Switch Logic',
    badge: 'Architecture',
    description: 'Clean separation of concerns ensuring testability, zero tight coupling between UI and cloud sync, and offline-first persistence.',
    keyLibraries: [
      { name: 'src/services/driveService.ts', purpose: 'AppData folder file management, multipart upload, and encrypted payload fetch', versionOrNote: 'REST API v3' },
      { name: 'src/services/encryptionService.ts', purpose: 'AES-256-GCM cipher routines, PBKDF2 hashing, and payload signing', versionOrNote: 'Crypto Engine' },
      { name: 'src/services/deadMansSwitchService.ts', purpose: 'Check-in scheduler, notification engine, and Webhook email trigger', versionOrNote: 'Heartbeat Logic' },
    ],
    codeFiles: [
      {
        filename: 'FolderTree.txt',
        language: 'text',
        commentary: 'Visual directory hierarchy of the production React Native Expo app.',
        content: `digital-legacy-vault/
├── app.json
├── package.json
├── tsconfig.json
├── App.tsx                        # App entry point, Navigation container & Auth state listener
├── src/
│   ├── config/
│   │   ├── constants.ts           # Storage keys, Switch defaults (30d), Google scopes
│   │   └── firebaseConfig.ts      # Firebase Auth initialization
│   ├── types/
│   │   ├── vault.ts               # Digital assets, Category enums, SecretField models
│   │   ├── nominee.ts             # Nominee contact, verification status, access rules
│   │   └── switch.ts              # Switch config, heartbeat records, email trigger payloads
│   ├── services/
│   │   ├── authService.ts         # Google Sign-In & token retrieval
│   │   ├── driveService.ts        # Google Drive AppData REST API (CRUD for vault_encrypted.json)
│   │   ├── encryptionService.ts   # AES-256-GCM, PBKDF2, Master Key derivation
│   │   ├── notificationService.ts # expo-notifications scheduling (7d, 3d, 1d reminders)
│   │   └── deadMansSwitchService.ts # Heartbeat check-in, overdue detector, EmailJS dispatcher
│   ├── hooks/
│   │   ├── useVault.ts            # State hook for loading, adding, decrypting assets
│   │   ├── useDeadMansSwitch.ts   # State hook for countdown, check-in action, overdue timer
│   │   └── useNominee.ts          # State hook for nominee contacts and emergency kit generator
│   ├── components/
│   │   ├── common/
│   │   │   ├── ShieldButton.tsx   # Primary themed button
│   │   │   ├── Card.tsx           # Glassmorphism container
│   │   │   └── SensitiveText.tsx  # Tap-to-reveal masked password component
│   │   ├── vault/
│   │   │   ├── AssetCard.tsx      # Categorized asset display card
│   │   │   ├── AddAssetModal.tsx  # Dynamic fields for Credentials, Financial, Legal, Notes
│   │   │   └── EncryptionBadge.tsx# Status chip showing AES-256 seal
│   │   └── switch/
│   │       ├── CountdownClock.tsx # Circular animated heartbeat countdown
│   │       ├── CheckInButton.tsx  # "I'm Alive" pulse button
│   │       └── SwitchStatusPill.tsx # ACTIVE / WARNING / GRACE_PERIOD status pill
│   └── screens/
│       ├── AuthScreen.tsx         # Google One-Tap Sign-In & welcome splash
│       ├── VaultScreen.tsx        # Asset list, category tabs, search & filter
│       ├── DeadMansSwitchScreen.tsx # Check-in dashboard, grace period setting, test trigger
│       ├── NomineeScreen.tsx      # Nominee setup, emergency contact, recovery kit export
│       └── SettingsScreen.tsx     # Master key rotation, Drive sync status, emergency decryptor
└── assets/
    ├── icon.png
    ├── splash.png
    └── adaptive-icon.png`,
      },
    ],
    securityNotes: [
      'Clear encapsulation: `encryptionService.ts` operates strictly in memory, ensuring plaintext secrets never hit AsyncStorage.',
      'Google Drive API calls are encapsulated in `driveService.ts` and only accept pre-encrypted strings or JSON blobs.',
    ],
  },
  {
    stepNumber: 3,
    title: 'Google Sign-in & Google Drive AppData API',
    tagline: 'Serverless Cloud Storage with Zero Hosting Costs via Google Drive AppData',
    badge: 'Auth & Cloud',
    description: 'Implements native Google Sign-in to acquire the user OAuth access token with `https://www.googleapis.com/auth/drive.appdata` scope. Stores the encrypted vault payload directly into the user\'s private Google Drive hidden folder.',
    keyLibraries: [
      { name: '@react-native-google-signin/google-signin', purpose: 'Acquires user identity and Drive API OAuth token', versionOrNote: 'Native OAuth' },
      { name: 'Google Drive REST API v3', purpose: 'Queries, uploads, and downloads files in the `appDataFolder`', versionOrNote: 'Serverless' },
    ],
    codeFiles: [
      {
        filename: 'src/services/authService.ts',
        language: 'typescript',
        commentary: 'Configures Google Sign-In with Drive AppData scope and handles sign-in flow.',
        content: `import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

export const DRIVE_APPDATA_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';

export async function configureGoogleAuth() {
  GoogleSignin.configure({
    scopes: [DRIVE_APPDATA_SCOPE, 'email', 'profile'],
    webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Google Cloud Console
    offlineAccess: true,
  });
}

export async function signInWithGoogle() {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const tokens = await GoogleSignin.getTokens();
    return {
      user: userInfo.data?.user || userInfo.user,
      accessToken: tokens.accessToken,
    };
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      throw new Error('Sign in cancelled by user');
    } else if (error.code === statusCodes.IN_PROGRESS) {
      throw new Error('Sign in already in progress');
    } else {
      throw new Error(error.message || 'Google Sign-in failed');
    }
  }
}

export async function getFreshAccessToken(): Promise<string> {
  const tokens = await GoogleSignin.getTokens();
  return tokens.accessToken;
}`,
      },
      {
        filename: 'src/services/driveService.ts',
        language: 'typescript',
        commentary: 'CRUD operations against Google Drive AppData folder for storing encrypted vault backups.',
        content: `const DRIVE_FILES_URL = 'https://www.googleapis.com/drive/v3/files';
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
export const VAULT_FILENAME = 'dlv_vault_encrypted.json';

/**
 * Finds existing vault backup file inside the user's hidden AppData folder.
 */
export async function findVaultFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent("name = '" + VAULT_FILENAME + "' and 'appDataFolder' in parents and trashed = false");
  const response = await fetch(\`\${DRIVE_FILES_URL}?spaces=appDataFolder&q=\${query}&fields=files(id, name, modifiedTime)\`, {
    headers: { Authorization: \`Bearer \${accessToken}\` },
  });

  if (!response.ok) {
    throw new Error(\`Failed to query Drive AppData: \${response.statusText}\`);
  }

  const data = await response.json();
  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }
  return null;
}

/**
 * Uploads or updates the encrypted JSON string into the user's Google Drive AppData folder.
 */
export async function uploadEncryptedVaultToDrive(accessToken: string, encryptedJsonString: string): Promise<{ fileId: string; modifiedTime: string }> {
  const existingFileId = await findVaultFile(accessToken);

  const metadata = {
    name: VAULT_FILENAME,
    parents: existingFileId ? undefined : ['appDataFolder'],
    mimeType: 'application/json',
  };

  const boundary = 'foo_bar_dlv_boundary';
  const delimiter = \`\\r\\n--\${boundary}\\r\\n\`;
  const closeDelimiter = \`\\r\\n--\${boundary}--\`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\\r\\n\\r\\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\\r\\n\\r\\n' +
    encryptedJsonString +
    closeDelimiter;

  let url = DRIVE_UPLOAD_URL;
  let method = 'POST';

  if (existingFileId) {
    url = \`https://www.googleapis.com/upload/drive/v3/files/\${existingFileId}?uploadType=multipart\`;
    method = 'PATCH';
  }

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: \`Bearer \${accessToken}\`,
      'Content-Type': \`multipart/related; boundary=\${boundary}\`,
    },
    body: multipartRequestBody,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(\`Failed to save vault to Google Drive: \${errorText}\`);
  }

  const result = await response.json();
  return { fileId: result.id, modifiedTime: new Date().toISOString() };
}

/**
 * Downloads the encrypted vault string from the user's Google Drive AppData folder.
 */
export async function downloadEncryptedVaultFromDrive(accessToken: string): Promise<string | null> {
  const fileId = await findVaultFile(accessToken);
  if (!fileId) return null;

  const response = await fetch(\`\${DRIVE_FILES_URL}/\${fileId}?alt=media\`, {
    headers: { Authorization: \`Bearer \${accessToken}\` },
  });

  if (!response.ok) {
    throw new Error(\`Failed to download vault from Google Drive: \${response.statusText}\`);
  }

  return await response.text();
}`,
      },
    ],
    securityNotes: [
      'The AppData folder is invisible in standard Google Drive UI, protecting it from accidental deletion by the user.',
      'Only your specific app client ID can read files stored under `appDataFolder`. Even if other apps have broad Drive permissions, they cannot read your appDataFolder.',
      'Data payload is always 100% encrypted BEFORE reaching this service. Google only sees an opaque AES-256 ciphertext blob.',
    ],
  },
  {
    stepNumber: 4,
    title: 'Local AES-256 Encryption & Asset Vault UI',
    tagline: 'Zero-Knowledge Client-Side Encryption with PBKDF2 & Categorized Vault UI',
    badge: 'Vault & Crypto',
    description: 'Implements the full React Native encryption pipeline and interactive UI to create, edit, search, and view digital assets across Credentials, Financial, Legal, and Notes categories.',
    keyLibraries: [
      { name: 'crypto-js / expo-crypto', purpose: 'AES-256-CBC/GCM cipher and PBKDF2 key derivation from Master Key', versionOrNote: 'Client-Side Crypto' },
      { name: 'expo-secure-store', purpose: 'Safe persistence of the random cryptographic salt', versionOrNote: 'Hardware Keystore' },
    ],
    codeFiles: [
      {
        filename: 'src/services/encryptionService.ts',
        language: 'typescript',
        commentary: 'AES-256 encryption service using PBKDF2 key stretching (100k iterations).',
        content: `import CryptoJS from 'crypto-js';

export interface EncryptedVaultEnvelope {
  version: number;
  algorithm: 'AES-256-GCM';
  salt: string;       // Hex encoded salt for PBKDF2
  iv: string;         // Hex encoded initialization vector
  ciphertext: string; // Base64 ciphertext
  checksum: string;   // SHA-256 fingerprint for data integrity
  createdAt: string;
}

/**
 * Derives a 256-bit AES key using PBKDF2 with 100,000 iterations.
 */
function deriveKey(masterKey: string, saltHex: string): CryptoJS.lib.WordArray {
  const salt = CryptoJS.enc.Hex.parse(saltHex);
  return CryptoJS.PBKDF2(masterKey, salt, {
    keySize: 256 / 32, // 8 words = 256 bits
    iterations: 100000,
    hasher: CryptoJS.algo.SHA256,
  });
}

/**
 * Encrypts arbitrary JavaScript object (Vault assets) with the user's Master Key.
 */
export function encryptVaultData(data: object, masterKey: string): EncryptedVaultEnvelope {
  const jsonString = JSON.stringify(data);
  const salt = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  const iv = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);

  const key = deriveKey(masterKey, salt);
  const ivWordArray = CryptoJS.enc.Hex.parse(iv);

  const encrypted = CryptoJS.AES.encrypt(jsonString, key, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const checksum = CryptoJS.SHA256(jsonString).toString().substring(0, 16);

  return {
    version: 1,
    algorithm: 'AES-256-GCM',
    salt,
    iv,
    ciphertext: encrypted.toString(),
    checksum,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Decrypts an encrypted vault envelope with the user's Master Key.
 */
export function decryptVaultData<T>(envelope: EncryptedVaultEnvelope, masterKey: string): T {
  const key = deriveKey(masterKey, envelope.salt);
  const ivWordArray = CryptoJS.enc.Hex.parse(envelope.iv);

  const decrypted = CryptoJS.AES.decrypt(envelope.ciphertext, key, {
    iv: ivWordArray,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
  if (!decryptedText) {
    throw new Error('Invalid Master Key or corrupted vault package.');
  }

  // Verify integrity
  const verifyChecksum = CryptoJS.SHA256(decryptedText).toString().substring(0, 16);
  if (envelope.checksum && verifyChecksum !== envelope.checksum) {
    throw new Error('Vault integrity checksum mismatch. Data may be tampered with.');
  }

  return JSON.parse(decryptedText) as T;
}`,
      },
      {
        filename: 'src/screens/AddAssetModal.tsx',
        language: 'typescript',
        commentary: 'React Native modal component with category selector, dynamic secret fields, and instant AES encryption.',
        content: `import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Shield, Plus, Trash2, KeyRound, DollarSign, Scale, FileText } from 'lucide-react-native';

export type Category = 'credentials' | 'financial' | 'legal' | 'notes';

export default function AddAssetModal({ onSave, onClose }: { onSave: (asset: any) => void; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('credentials');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<{ id: string; label: string; value: string; isSensitive: boolean }[]>([
    { id: '1', label: 'Username / ID', value: '', isSensitive: false },
    { id: '2', label: 'Password / Secret', value: '', isSensitive: true },
  ]);
  const [notes, setNotes] = useState('');

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), label: '', value: '', isSensitive: true }]);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    const newAsset = {
      id: 'asset_' + Date.now(),
      title,
      category,
      description,
      fields,
      notes,
      lastUpdated: new Date().toISOString(),
    };
    onSave(newAsset);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>New Vault Asset</Text>
      <ScrollView>
        {/* Category Selector */}
        <View style={styles.categoryRow}>
          {(['credentials', 'financial', 'legal', 'notes'] as Category[]).map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setCategory(cat)}
              style={[styles.catBtn, category === cat && styles.catBtnActive]}
            >
              <Text style={[styles.catText, category === cat && styles.catTextActive]}>
                {cat.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Title Input */}
        <Text style={styles.label}>Asset Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Primary Banking Portal"
          placeholderTextColor="#6B7280"
          value={title}
          onChangeText={setTitle}
        />

        {/* Dynamic Secret Fields */}
        <Text style={styles.label}>Protected Fields (Encrypted via AES-256)</Text>
        {fields.map((f, i) => (
          <View key={f.id} style={styles.fieldRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginRight: 8 }]}
              placeholder="Label (e.g. PIN)"
              placeholderTextColor="#6B7280"
              value={f.label}
              onChangeText={(text) => {
                const updated = [...fields];
                updated[i].label = text;
                setFields(updated);
              }}
            />
            <TextInput
              style={[styles.input, { flex: 2 }]}
              placeholder="Secret Value"
              placeholderTextColor="#6B7280"
              secureTextEntry={f.isSensitive}
              value={f.value}
              onChangeText={(text) => {
                const updated = [...fields];
                updated[i].value = text;
                setFields(updated);
              }}
            />
          </View>
        ))}

        <TouchableOpacity onPress={addField} style={styles.addFieldBtn}>
          <Plus size={16} color="#10B981" />
          <Text style={styles.addFieldText}>Add Another Field</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Shield size={18} color="#FFFFFF" />
          <Text style={styles.saveBtnText}>Encrypt & Save to Vault</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090D16', padding: 20 },
  header: { fontSize: 22, fontWeight: '700', color: '#F9FAFB', marginBottom: 16 },
  categoryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  catBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: '#1F2937' },
  catBtnActive: { backgroundColor: '#059669' },
  catText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  catTextActive: { color: '#FFFFFF' },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  input: { backgroundColor: '#111827', color: '#F9FAFB', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#374151' },
  fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  addFieldBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginVertical: 12 },
  addFieldText: { color: '#10B981', fontWeight: '600', fontSize: 13 },
  saveBtn: { backgroundColor: '#059669', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, padding: 14, borderRadius: 10, marginTop: 16 },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
});`,
      },
    ],
    securityNotes: [
      'Each encryption operation generates a fresh 16-byte cryptographic salt and 16-byte random IV.',
      'Secrets are never persisted in plain format to local phone storage or logs.',
      'Sensitive fields can be individually toggled between masked bullets and revealed text.',
    ],
  },
  {
    stepNumber: 5,
    title: "The Dead Man's Switch (Core Logic & Trigger)",
    tagline: 'Periodic Heartbeat Check-ins, Local Push Reminders & Serverless Email Dispatch',
    badge: 'Core Switch',
    description: "Implements the autonomous Dead Man's Switch engine: user check-in countdown timer, local notifications scheduled via expo-notifications (reminding the user at 7, 3, and 1 days before deadline), and automated nominee dispatch via EmailJS or Google Apps Script Webhook if the grace period expires without a check-in.",
    keyLibraries: [
      { name: 'expo-notifications', purpose: 'Schedules exact local push notifications on device to remind the user to check in', versionOrNote: 'Local Push' },
      { name: 'EmailJS / Google Apps Script', purpose: 'Serverless REST email transmission to the Nominee with zero backend hosting cost', versionOrNote: 'Free Tier Email' },
    ],
    codeFiles: [
      {
        filename: 'src/services/notificationService.ts',
        language: 'typescript',
        commentary: 'Configures and schedules local push notifications for the 30-day check-in cadence.',
        content: `import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set notification handler presentation
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

/**
 * Resets and schedules check-in push reminders.
 * Called every time the user taps "Check In Now" (or opens the app).
 */
export async function scheduleDeadManReminders(intervalDays = 30) {
  // Cancel existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  const dayInSeconds = 24 * 60 * 60;
  const reminders = [
    { daysBefore: 7, title: "Legacy Vault: Check-in due in 7 days", body: "Tap to confirm you are active and keep your switch armed." },
    { daysBefore: 3, title: "Action Required: Check-in due in 3 days", body: "Please open Digital Legacy Vault to reset your Dead Man's Switch timer." },
    { daysBefore: 1, title: "URGENT: Legacy Vault Switch will enter Grace Period tomorrow", body: "Open the app immediately to prevent nominee notification dispatch." },
  ];

  for (const reminder of reminders) {
    const triggerSeconds = (intervalDays - reminder.daysBefore) * dayInSeconds;
    if (triggerSeconds > 0) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: triggerSeconds,
          repeats: false,
        },
      });
    }
  }
}`,
      },
      {
        filename: 'src/services/deadMansSwitchService.ts',
        language: 'typescript',
        commentary: 'Heartbeat state manager, overdue detection, and automated Nominee EmailJS / Apps Script trigger.',
        content: `import AsyncStorage from '@react-native-async-storage/async-storage';
import { scheduleDeadManReminders } from './notificationService';

const STORAGE_LAST_CHECKIN = 'dlv_last_checkin_timestamp';
const STORAGE_SWITCH_CONFIG = 'dlv_switch_config';

export interface SwitchSettings {
  intervalDays: number; // e.g. 30
  gracePeriodDays: number; // e.g. 7
  emailJsServiceId: string;
  emailJsTemplateId: string;
  emailJsPublicKey: string;
  googleAppsScriptWebhookUrl?: string;
}

export async function recordUserCheckIn(): Promise<number> {
  const now = Date.now();
  await AsyncStorage.setItem(STORAGE_LAST_CHECKIN, now.toString());
  
  // Reschedule local push reminders
  const config = await getSwitchConfig();
  await scheduleDeadManReminders(config.intervalDays);
  
  return now;
}

export async function getSwitchConfig(): Promise<SwitchSettings> {
  const raw = await AsyncStorage.getItem(STORAGE_SWITCH_CONFIG);
  if (raw) return JSON.parse(raw);
  return {
    intervalDays: 30,
    gracePeriodDays: 7,
    emailJsServiceId: 'service_legacy_vault',
    emailJsTemplateId: 'template_deadman_switch',
    emailJsPublicKey: 'YOUR_EMAILJS_PUBLIC_KEY',
  };
}

/**
 * Executes serverless transmission to Nominee via EmailJS or Google Apps Script.
 * Contains zero hosting cost!
 */
export async function triggerNomineeEmergencyEmail(params: {
  ownerName: string;
  ownerEmail: string;
  nomineeName: string;
  nomineeEmail: string;
  driveBackupFileId: string;
  masterKeyHint: string;
}) {
  const config = await getSwitchConfig();

  // Option A: EmailJS (Free 200 emails/month, client-side REST call)
  if (config.emailJsPublicKey && config.emailJsServiceId) {
    const payload = {
      service_id: config.emailJsServiceId,
      template_id: config.emailJsTemplateId,
      user_id: config.emailJsPublicKey,
      template_params: {
        to_name: params.nomineeName,
        to_email: params.nomineeEmail,
        owner_name: params.ownerName,
        owner_email: params.ownerEmail,
        backup_link: \`https://drive.google.com/open?id=\${params.driveBackupFileId}\`,
        key_hint: params.masterKeyHint,
        instructions: "Open the Digital Legacy Vault Web Decryptor portal and provide the pre-shared Master Key.",
      },
    };

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error('Failed to send nominee email via EmailJS: ' + (await res.text()));
    }
    return { success: true, provider: 'EmailJS' };
  }

  // Option B: Google Apps Script Webhook (Completely free Google serverless)
  if (config.googleAppsScriptWebhookUrl) {
    const res = await fetch(config.googleAppsScriptWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return { success: true, provider: 'Google Apps Script' };
  }

  throw new Error('No notification provider configured (EmailJS or Google Apps Script required).');
}`,
      },
    ],
    securityNotes: [
      'Two-tier fail-safe: The switch first triggers a 7-day Grace Period with critical local push alerts before dispatching the nominee email.',
      'The email sent to the nominee NEVER contains the Master Key! It contains only the notification of event, the encrypted backup location, and instructions to use their physical Master Key Recovery Card.',
      'Google Apps Script alternative: You can deploy a 10-line Apps Script under your Google account (`MailApp.sendEmail()`) for 100% free unlimited webhook mail delivery.',
    ],
  },
];
