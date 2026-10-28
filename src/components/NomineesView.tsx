/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  UserCheck,
  Shield,
  KeyRound,
  FileCheck,
  Printer,
  Copy,
  Check,
  Mail,
  Phone,
  AlertCircle,
  HelpCircle,
  Edit2,
  Lock,
} from 'lucide-react';
import { Nominee } from '../types/vault';

interface NomineesViewProps {
  nominee: Nominee;
  masterKey: string;
  userName: string;
  userEmail: string;
  onUpdateNominee: (updated: Nominee) => void;
}

export default function NomineesView({
  nominee,
  masterKey,
  userName,
  userEmail,
  onUpdateNominee,
}: NomineesViewProps) {
  const [copiedKey, setCopiedKey] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showRecoveryCard, setShowRecoveryCard] = useState(false);

  // Edit form state
  const [name, setName] = useState(nominee.name);
  const [email, setEmail] = useState(nominee.email);
  const [phone, setPhone] = useState(nominee.phone);
  const [relationship, setRelationship] = useState(nominee.relationship);
  const [instructions, setInstructions] = useState(nominee.emergencyInstructions);
  const [masterKeyHint, setMasterKeyHint] = useState(nominee.masterKeyHint);

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(masterKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleSaveNominee = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateNominee({
      ...nominee,
      name,
      email,
      phone,
      relationship,
      emergencyInstructions: instructions,
      masterKeyHint,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Trusted Nominee & Recovery</h2>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <UserCheck className="w-3 h-3" />
              1 Nominee Designated
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            The trusted individual who receives access instructions if the Dead Man's Switch fires.
          </p>
        </div>

        <button
          onClick={() => setShowRecoveryCard(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 active:scale-95 cursor-pointer"
        >
          <KeyRound className="w-4 h-4" />
          View Physical Recovery Kit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Nominee Profile Card */}
        <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center font-bold text-lg text-white shadow-md">
                {nominee.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{nominee.name}</h3>
                <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {nominee.relationship}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Edit Nominee Info"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Mail className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-500 block text-[10px]">Email Address</span>
                <span className="text-slate-200 font-medium">{nominee.email}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <Phone className="w-4 h-4 text-slate-400" />
              <div>
                <span className="text-slate-500 block text-[10px]">Phone Number</span>
                <span className="text-slate-200 font-medium">{nominee.phone}</span>
              </div>
            </div>
          </div>

          {/* Special Instructions */}
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Custom Emergency Instructions for {nominee.name}
              </span>
              <span className="text-[10px] text-slate-500">Included in notification</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed italic">
              "{nominee.emergencyInstructions}"
            </p>
          </div>

          {/* Master Key Hint */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">
                Physical Master Key Location Hint
              </span>
              <span className="text-slate-200 font-medium">{nominee.masterKeyHint}</span>
            </div>
            <Lock className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        {/* Security & Escrow Explainer */}
        <div className="space-y-4">
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              Zero-Knowledge Escrow
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              In traditional cloud vaults, servers store keys or passcodes. Digital Legacy Vault uses <strong>Zero-Knowledge Architecture</strong>.
            </p>
            <div className="space-y-2 text-xs pt-1">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-emerald-400 font-semibold block mb-0.5">1. Physical Hand-off</span>
                <p className="text-slate-400 text-[11px]">
                  Provide the printed Master Key card to your nominee or attorney in advance.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-emerald-400 font-semibold block mb-0.5">2. Serverless Transmission</span>
                <p className="text-slate-400 text-[11px]">
                  If switch triggers, nominee receives the encrypted drive payload via EmailJS / Apps Script.
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
                <span className="text-emerald-400 font-semibold block mb-0.5">3. Local Decryption</span>
                <p className="text-slate-400 text-[11px]">
                  Nominee unlocks the data in the Web Decryptor using their physical Master Key.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Nominee Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100">Edit Nominee Information</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNominee} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Relationship</label>
                <input
                  type="text"
                  value={relationship}
                  onChange={e => setRelationship(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Custom Emergency Instructions</label>
                <textarea
                  rows={3}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Master Key Location Hint</label>
                <input
                  type="text"
                  value={masterKeyHint}
                  onChange={e => setMasterKeyHint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl"
                >
                  Save Nominee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recovery Kit Modal */}
      {showRecoveryCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Nominee Recovery Kit</h3>
                  <p className="text-xs text-slate-400">Physical Emergency Hand-off Card</p>
                </div>
              </div>
              <button onClick={() => setShowRecoveryCard(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            {/* Printable Physical Card Representation */}
            <div className="mt-4 p-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border-2 border-emerald-500/40 text-center space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-2">
                <span className="font-bold text-emerald-400">DIGITAL LEGACY VAULT</span>
                <span>EMERGENCY ACCESS CARD</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold mb-1">
                  Designated Recipient
                </span>
                <h4 className="text-base font-bold text-slate-100">{nominee.name}</h4>
                <p className="text-xs text-slate-400">From: {userName} ({userEmail})</p>
              </div>

              {/* Master Key Box */}
              <div className="p-4 bg-black/60 rounded-xl border border-emerald-500/40 space-y-1">
                <span className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-widest block">
                  AES-256 MASTER RECOVERY KEY
                </span>
                <span className="text-lg font-mono font-extrabold text-emerald-400 tracking-wider select-all block">
                  {masterKey}
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-tight">
                Store this card in a fireproof safe, bank lockbox, or with your designated estate attorney. Do not photograph or email this key.
              </p>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <button
                onClick={handleCopyKey}
                className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-colors"
              >
                {copiedKey ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copiedKey ? 'Master Key Copied!' : 'Copy Key'}
              </button>
              <button
                onClick={() => window.print()}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print Recovery Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
