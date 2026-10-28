/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LifeBuoy,
  KeyRound,
  Unlock,
  Lock,
  AlertCircle,
  CheckCircle,
  FileText,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { decryptData, encryptData, EncryptedPackage } from '../utils/crypto';
import { VaultAsset } from '../types/vault';

interface NomineeRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleEncryptedData?: string;
  defaultMasterKey?: string;
}

export default function NomineeRecoveryModal({
  isOpen,
  onClose,
  sampleEncryptedData,
  defaultMasterKey = '',
}: NomineeRecoveryModalProps) {
  const [encryptedPayloadText, setEncryptedPayloadText] = useState(sampleEncryptedData || '');
  const [enteredMasterKey, setEnteredMasterKey] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unlockedAssets, setUnlockedAssets] = useState<VaultAsset[] | null>(null);

  if (!isOpen) return null;

  const handleDecrypt = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setUnlockedAssets(null);
    setIsDecrypting(true);

    try {
      if (!encryptedPayloadText.trim()) {
        throw new Error('Please provide the encrypted JSON payload.');
      }
      if (!enteredMasterKey.trim()) {
        throw new Error('Please enter the 16-character Master Key from the Recovery Kit.');
      }

      const parsedPackage: EncryptedPackage = JSON.parse(encryptedPayloadText.trim());
      const decryptedPlaintext = await decryptData(parsedPackage, enteredMasterKey.trim());
      const parsedAssets: VaultAsset[] = JSON.parse(decryptedPlaintext);

      setUnlockedAssets(parsedAssets);
    } catch (err: any) {
      setErrorMessage(err.message || 'Decryption failed. Check that your Master Key and payload are correct.');
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleFillDemoKey = () => {
    if (defaultMasterKey) {
      setEnteredMasterKey(defaultMasterKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <LifeBuoy className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Nominee Emergency Recovery Portal
              </h3>
              <p className="text-xs text-slate-400">Zero-knowledge client-side decryption simulator</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        {unlockedAssets ? (
          /* Successfully Decrypted View */
          <div className="mt-5 space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <h4 className="font-bold text-sm text-emerald-300">Vault Successfully Decrypted!</h4>
                <p className="text-emerald-400/90 mt-0.5">
                  AES-256 integrity tag passed. {unlockedAssets.length} legacy assets unlocked in secure memory.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {unlockedAssets.map(asset => (
                <div key={asset.id} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-100 text-sm">{asset.title}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-0.5 bg-slate-800 rounded">
                      {asset.category}
                    </span>
                  </div>
                  <p className="text-slate-400">{asset.description}</p>
                  <div className="space-y-1.5 pt-1">
                    {asset.fields.map(f => (
                      <div key={f.id} className="flex justify-between font-mono bg-slate-900/80 p-2 rounded-lg">
                        <span className="text-slate-400">{f.label}:</span>
                        <span className="text-emerald-400 font-semibold">{f.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setUnlockedAssets(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
            >
              Lock Vault Again & Test Another Key
            </button>
          </div>
        ) : (
          /* Decryption Form */
          <form onSubmit={handleDecrypt} className="mt-4 space-y-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-400 leading-relaxed">
              As a Nominee receiving an automated emergency dispatch email, you hold the designated recipient Master Key. Enter the key below to locally decrypt the vault contents.
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Encrypted Vault Payload (JSON Envelope)
              </label>
              <textarea
                rows={4}
                required
                value={encryptedPayloadText}
                onChange={e => setEncryptedPayloadText(e.target.value)}
                placeholder='{"algorithm":"AES-GCM","salt":"...","iv":"...","ciphertext":"..."}'
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-300 font-mono text-[11px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-400 font-semibold">
                  Nominee Master Key (from physical card)
                </label>
                {defaultMasterKey && (
                  <button
                    type="button"
                    onClick={handleFillDemoKey}
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Auto-fill Vault Owner's Key
                  </button>
                )}
              </div>
              <input
                type="text"
                required
                placeholder="DLV-XXXX-XXXX-XXXX-XXXX"
                value={enteredMasterKey}
                onChange={e => setEnteredMasterKey(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-emerald-400 font-mono tracking-wider"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isDecrypting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-semibold text-xs rounded-xl shadow-lg flex items-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                {isDecrypting ? 'Decrypting AES-256...' : 'Unlock & Decrypt Assets'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
