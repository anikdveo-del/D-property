/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Landmark,
  Scale,
  FileText,
  Plus,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  Lock,
  Trash2,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { VaultAsset, AssetCategory, SecretField } from '../types/vault';
import { encryptData, EncryptedPackage } from '../utils/crypto';

interface VaultViewProps {
  assets: VaultAsset[];
  masterKey: string;
  isCompact?: boolean;
  onAddAsset: (asset: VaultAsset) => void;
  onDeleteAsset: (id: string) => void;
  onSelectAsset?: (asset: VaultAsset) => void;
}

const CATEGORY_ICONS: Record<AssetCategory, React.ElementType> = {
  credentials: KeyRound,
  financial: Landmark,
  legal: Scale,
  notes: FileText,
};

const CATEGORY_COLORS: Record<AssetCategory, { badge: string; border: string; text: string; bg: string }> = {
  credentials: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    border: 'hover:border-emerald-500/40',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
  },
  financial: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    border: 'hover:border-amber-500/40',
    text: 'text-amber-400',
    bg: 'bg-amber-500/10',
  },
  legal: {
    badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    border: 'hover:border-indigo-500/40',
    text: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
  },
  notes: {
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    border: 'hover:border-sky-500/40',
    text: 'text-sky-400',
    bg: 'bg-sky-500/10',
  },
};

export default function VaultView({
  assets,
  masterKey,
  isCompact = false,
  onAddAsset,
  onDeleteAsset,
}: VaultViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [revealedFields, setRevealedFields] = useState<Record<string, boolean>>({});
  const [copiedFieldId, setCopiedFieldId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeEncryptionPreview, setActiveEncryptionPreview] = useState<{
    assetTitle: string;
    pkg: EncryptedPackage;
  } | null>(null);

  // Form state for new asset modal
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<AssetCategory>('credentials');
  const [newDescription, setNewDescription] = useState('');
  const [newFields, setNewFields] = useState<{ id: string; label: string; value: string; isSensitive: boolean }[]>([
    { id: '1', label: 'Username / Account', value: '', isSensitive: false },
    { id: '2', label: 'Password / Secret', value: '', isSensitive: true },
  ]);
  const [newNotes, setNewNotes] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);

  const toggleFieldReveal = (fieldId: string) => {
    setRevealedFields(prev => ({ ...prev, [fieldId]: !prev[fieldId] }));
  };

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedFieldId(fieldId);
      setTimeout(() => setCopiedFieldId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleAddFieldRow = () => {
    setNewFields(prev => [
      ...prev,
      { id: Date.now().toString(), label: '', value: '', isSensitive: true },
    ]);
  };

  const handleRemoveFieldRow = (id: string) => {
    if (newFields.length > 1) {
      setNewFields(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsEncrypting(true);
    try {
      const assetData: VaultAsset = {
        id: 'asset-' + Date.now(),
        title: newTitle.trim(),
        category: newCategory,
        description: newDescription.trim() || 'No description provided',
        fields: newFields.filter(f => f.label.trim() || f.value.trim()),
        notes: newNotes.trim(),
        tags: newTagInput.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
        lastUpdated: new Date().toISOString(),
      };

      // Perform real AES-256 client-side encryption
      const encryptedBlob = await encryptData(JSON.stringify(assetData), masterKey);
      assetData.encryptedBlob = encryptedBlob;

      onAddAsset(assetData);
      setIsAddModalOpen(false);
      resetForm();
    } finally {
      setIsEncrypting(false);
    }
  };

  const resetForm = () => {
    setNewTitle('');
    setNewCategory('credentials');
    setNewDescription('');
    setNewFields([
      { id: '1', label: 'Username / Account', value: '', isSensitive: false },
      { id: '2', label: 'Password / Secret', value: '', isSensitive: true },
    ]);
    setNewNotes('');
    setNewTagInput('');
  };

  const handleInspectEncryption = async (asset: VaultAsset) => {
    let pkg = asset.encryptedBlob;
    if (!pkg) {
      pkg = await encryptData(JSON.stringify(asset), masterKey);
    }
    setActiveEncryptionPreview({ assetTitle: asset.title, pkg });
  };

  const filteredAssets = assets.filter(asset => {
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesQuery =
      asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const categoryCounts = {
    all: assets.length,
    credentials: assets.filter(a => a.category === 'credentials').length,
    financial: assets.filter(a => a.category === 'financial').length,
    legal: assets.filter(a => a.category === 'legal').length,
    notes: assets.filter(a => a.category === 'notes').length,
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Digital Asset Vault</h2>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Shield className="w-3 h-3" />
              AES-256 Sealed
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Zero-knowledge encrypted locally before saving to Google Drive AppData folder.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Digital Asset
        </button>
      </div>

      {/* Category Pills & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search credentials, accounts, tags..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'credentials', 'financial', 'legal', 'notes'] as const).map(cat => {
            const count = categoryCounts[cat];
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <span className="capitalize">{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Asset Cards Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <Shield className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No assets found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? 'Try modifying your search or clearing category filters.'
              : 'Add your first password, financial record, or secret note to the vault.'}
          </p>
        </div>
      ) : (
        <div className={`grid gap-4 ${isCompact ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
          {filteredAssets.map(asset => {
            const Icon = CATEGORY_ICONS[asset.category];
            const styling = CATEGORY_COLORS[asset.category];

            return (
              <div
                key={asset.id}
                className={`bg-slate-900/70 border border-slate-800/90 rounded-2xl p-5 transition-all flex flex-col justify-between ${styling.border} shadow-sm hover:shadow-md`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl ${styling.bg} ${styling.text}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100 text-base">{asset.title}</h3>
                        <span className={`text-[11px] font-medium uppercase px-2 py-0.5 rounded-full border ${styling.badge}`}>
                          {asset.category}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title="View AES-256 Raw Ciphertext"
                        onClick={() => handleInspectEncryption(asset)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-slate-800/80 transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        title="Delete asset"
                        onClick={() => onDeleteAsset(asset.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">{asset.description}</p>

                  {/* Secret Fields */}
                  <div className="space-y-2 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 mb-3">
                    {asset.fields.map(field => {
                      const isRevealed = !field.isSensitive || revealedFields[field.id];
                      const isCopied = copiedFieldId === field.id;

                      return (
                        <div key={field.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-900 last:border-0">
                          <span className="text-slate-400 font-medium">{field.label}:</span>
                          <div className="flex items-center gap-2 font-mono">
                            <span className={field.isSensitive && !isRevealed ? 'text-slate-500 select-none' : 'text-slate-200'}>
                              {field.isSensitive && !isRevealed ? '••••••••••••' : field.value}
                            </span>

                            {field.isSensitive && (
                              <button
                                onClick={() => toggleFieldReveal(field.id)}
                                className="text-slate-500 hover:text-slate-300 transition-colors p-0.5"
                                title={isRevealed ? 'Mask' : 'Reveal'}
                              >
                                {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            )}

                            <button
                              onClick={() => copyToClipboard(field.value, field.id)}
                              className="text-slate-500 hover:text-emerald-400 transition-colors p-0.5"
                              title="Copy to clipboard"
                            >
                              {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {asset.notes && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-900/40 p-2 rounded-lg border border-slate-800/40 mb-3">
                      "{asset.notes}"
                    </p>
                  )}
                </div>

                {/* Card Footer: Tags & Timestamp */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-500">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {asset.tags.map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-slate-800/80 rounded text-slate-400">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span>Updated {new Date(asset.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Add New Vault Asset</h3>
                  <p className="text-xs text-slate-400">Will be encrypted using AES-256 before storage</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-lg leading-none p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-4 mt-4">
              {/* Category Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['credentials', 'financial', 'legal', 'notes'] as AssetCategory[]).map(cat => {
                    const Icon = CATEGORY_ICONS[cat];
                    const isSelected = newCategory === cat;
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => setNewCategory(cat)}
                        className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                            : 'bg-slate-800/50 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="capitalize">{cat}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fidelity 401(k) / Home Deed"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <input
                  type="text"
                  placeholder="Brief note or summary for your nominee"
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Secret Fields */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Confidential Fields (AES-256 Encrypted)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddFieldRow}
                    className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Add Field
                  </button>
                </div>

                <div className="space-y-2">
                  {newFields.map(f => (
                    <div key={f.id} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Label (e.g. PIN)"
                        value={f.label}
                        onChange={e => {
                          const val = e.target.value;
                          setNewFields(newFields.map(item => item.id === f.id ? { ...item, label: val } : item));
                        }}
                        className="w-1/3 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600"
                      />
                      <input
                        type="text"
                        placeholder="Secret value"
                        value={f.value}
                        onChange={e => {
                          const val = e.target.value;
                          setNewFields(newFields.map(item => item.id === f.id ? { ...item, value: val } : item));
                        }}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFieldRow(f.id)}
                        disabled={newFields.length <= 1}
                        className="text-slate-500 hover:text-rose-400 disabled:opacity-30 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Private Instructions / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Instructions for the nominee upon unlocking this asset..."
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. banking, estate, primary"
                  value={newTagInput}
                  onChange={e => setNewTagInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs text-slate-100 placeholder-slate-600"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEncrypting || !newTitle.trim()}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isEncrypting ? 'Encrypting with AES-256...' : 'Encrypt & Seal to Vault'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Encryption Inspector Modal */}
      {activeEncryptionPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    AES-256 Ciphertext Inspector
                  </h3>
                  <p className="text-xs text-slate-400">{activeEncryptionPreview.assetTitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveEncryptionPreview(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <p className="text-slate-300">
                This exact encrypted JSON envelope is what gets uploaded to the user's hidden Google Drive AppData folder:
              </p>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto max-h-60">
                <pre>{JSON.stringify(activeEncryptionPreview.pkg, null, 2)}</pre>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 font-medium">Cipher Algorithm:</span>
                  <p className="text-slate-200 font-mono">AES-GCM (256-bit)</p>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-slate-500 font-medium">Key Derivation:</span>
                  <p className="text-slate-200 font-mono">PBKDF2 (100k rounds)</p>
                </div>
              </div>
            </div>

            <div className="mt-5 text-right">
              <button
                onClick={() => setActiveEncryptionPreview(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
