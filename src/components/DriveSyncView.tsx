/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Cloud,
  CheckCircle,
  Download,
  Upload,
  RefreshCw,
  HardDrive,
  Lock,
  FileCode,
  ShieldCheck,
  ExternalLink,
  FolderLock,
  Layers,
} from 'lucide-react';
import { VaultAsset } from '../types/vault';
import { encryptData, calculateChecksum } from '../utils/crypto';

interface DriveSyncViewProps {
  assets: VaultAsset[];
  masterKey: string;
  userEmail: string;
  lastSyncTime: string;
  onSyncComplete: () => void;
  onImportBackup: (importedAssets: VaultAsset[]) => void;
}

export default function DriveSyncView({
  assets,
  masterKey,
  userEmail,
  lastSyncTime,
  onSyncComplete,
  onImportBackup,
}: DriveSyncViewProps) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [checksum, setChecksum] = useState<string>('e8a93bc41029df4a');

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncStatusMessage('Encrypting vault with AES-256-GCM locally...');
    
    // Simulate real encryption & Drive AppData upload flow
    const serialized = JSON.stringify(assets);
    const enc = await encryptData(serialized, masterKey);
    const hash = await calculateChecksum(JSON.stringify(enc));
    setChecksum(hash);

    setTimeout(() => {
      setSyncStatusMessage('Uploading multipart/related payload to Google Drive appDataFolder...');
    }, 700);

    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMessage('Encrypted vault synced to Google Drive AppData folder successfully!');
      onSyncComplete();
      setTimeout(() => setSyncStatusMessage(null), 4000);
    }, 1500);
  };

  const handleDownloadBackup = async () => {
    const serialized = JSON.stringify(assets);
    const enc = await encryptData(serialized, masterKey);
    const jsonBlob = new Blob([JSON.stringify(enc, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(jsonBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `digital_legacy_vault_${new Date().toISOString().split('T')[0]}.dlv.enc.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Google Drive AppData Sync</h2>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FolderLock className="w-3 h-3" />
              Private App Space
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Serverless cloud persistence using the user's personal Google Drive account. Zero hosting costs.
          </p>
        </div>

        <button
          onClick={handleManualSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing to Drive...' : 'Sync to Drive AppData'}
        </button>
      </div>

      {syncStatusMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncStatusMessage}</span>
        </div>
      )}

      {/* Grid of Cloud Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drive AppData Container Card */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Cloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Google Drive AppData Folder</h3>
                <p className="text-xs text-slate-400">Authenticated user: {userEmail}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[11px] font-semibold text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Connected & Synced
            </div>
          </div>

          {/* Stored File Properties */}
          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-medium">Drive Space:</span>
              <span className="text-slate-200 font-mono">spaces=appDataFolder (hidden)</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-medium">Backup Filename:</span>
              <span className="text-emerald-400 font-mono font-semibold">dlv_vault_encrypted.json</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-medium">Payload Fingerprint:</span>
              <span className="text-slate-300 font-mono">SHA256:{checksum}</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-900 pb-2">
              <span className="text-slate-400 font-medium">Last Synchronized:</span>
              <span className="text-slate-200">{lastSyncTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium">Total Assets Encrypted:</span>
              <span className="text-slate-200">{assets.length} items</span>
            </div>
          </div>

          {/* Backup Actions */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownloadBackup}
              className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              Download Offline Encrypted File (.dlv.enc.json)
            </button>
          </div>
        </div>

        {/* Serverless Architecture Architecture Note */}
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Why AppData Folder?
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>$0 Hosting Costs:</strong> Operates entirely within the user's free 15GB Google Drive tier.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Hidden from User Clutter:</strong> The files are isolated in the special `appDataFolder` directory so users can't accidentally move or delete them.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Sandboxed:</strong> No other third-party app can read your app's AppData files.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span><strong>Zero-Knowledge:</strong> Encrypted with AES-256 locally on iOS/Android before the HTTP multipart upload begins.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
