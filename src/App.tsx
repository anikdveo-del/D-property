/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Shield,
  KeyRound,
  HeartPulse,
  Users,
  Cloud,
  Code2,
  Smartphone,
  Maximize2,
  LifeBuoy,
  CheckCircle,
  FolderLock,
  ChevronRight,
  Info,
} from 'lucide-react';
import { VaultAsset, Nominee, UserSession } from './types/vault';
import { INITIAL_ASSETS, INITIAL_NOMINEE } from './data/sampleData';
import { SwitchConfig } from './utils/switchLogic';
import { generateMasterKey, encryptData } from './utils/crypto';
import VaultView from './components/VaultView';
import DeadMansSwitchView from './components/DeadMansSwitchView';
import NomineesView from './components/NomineesView';
import DriveSyncView from './components/DriveSyncView';
import NomineeRecoveryModal from './components/NomineeRecoveryModal';
import MobileArchitectureStudio from './components/MobileArchitectureStudio';

export default function App() {
  // App navigation modes: 'simulator' or 'architecture'
  const [activeAppMode, setActiveAppMode] = useState<'simulator' | 'architecture'>('architecture');
  const [simulatorTab, setSimulatorTab] = useState<'vault' | 'switch' | 'nominees' | 'drive'>('vault');
  const [isPhoneFrameMode, setIsPhoneFrameMode] = useState<boolean>(false);

  // Core application state
  const [masterKey, setMasterKey] = useState<string>('DLV-98B2-X9K4-L2M8-P7Q1');
  const [assets, setAssets] = useState<VaultAsset[]>(INITIAL_ASSETS);
  const [nominee, setNominee] = useState<Nominee>(INITIAL_NOMINEE);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now (Google Drive AppData)');
  const [isNomineeModalOpen, setIsNomineeModalOpen] = useState<boolean>(false);
  const [sampleEncryptedBlob, setSampleEncryptedBlob] = useState<string>('');

  // Switch configuration
  const [switchConfig, setSwitchConfig] = useState<SwitchConfig>({
    checkInIntervalDays: 30,
    gracePeriodDays: 7,
    warningRemindersDays: [7, 3, 1],
    lastCheckInTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago default
  });

  // User session
  const userSession: UserSession = {
    isLoggedIn: true,
    email: 'anik.dveo@gmail.com',
    displayName: 'Anik (Vault Owner)',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
    driveSyncStatus: 'synced',
    lastDriveSync: lastSyncTime,
    storageUsedBytes: 42800,
  };

  // Pre-generate sample encrypted payload for nominee testing
  useEffect(() => {
    async function initEncryptedBlob() {
      const serialized = JSON.stringify(INITIAL_ASSETS);
      const pkg = await encryptData(serialized, masterKey);
      setSampleEncryptedBlob(JSON.stringify(pkg, null, 2));
    }
    initEncryptedBlob();
  }, [masterKey]);

  const handleAddAsset = (newAsset: VaultAsset) => {
    setAssets(prev => [newAsset, ...prev]);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleCheckIn = () => {
    setSwitchConfig(prev => ({
      ...prev,
      lastCheckInTimestamp: Date.now(),
    }));
  };

  const handleSyncComplete = () => {
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Top Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Logo & Status */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  Digital Legacy Vault
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SERVERLESS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Zero-Knowledge AES-256 • Google Drive AppData • Dead Man's Switch
              </p>
            </div>
          </div>

          {/* Mode Switcher & Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-2xl">
              <button
                onClick={() => setActiveAppMode('architecture')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeAppMode === 'architecture'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                Mobile Architecture (Step 1-5)
              </button>
              <button
                onClick={() => setActiveAppMode('simulator')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeAppMode === 'simulator'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                Live Vault Simulator
              </button>
            </div>

            {/* Nominee Decryptor Portal Button */}
            <button
              onClick={() => setIsNomineeModalOpen(true)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Test Nominee Decryption Portal"
            >
              <LifeBuoy className="w-3.5 h-3.5 text-amber-400" />
              Nominee Portal
            </button>

            {/* Authenticated User Badge */}
            <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-800 text-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 text-[11px]">
                {userSession.displayName[0]}
              </div>
              <div className="text-[11px]">
                <span className="font-semibold text-slate-200 block leading-tight">{userSession.email}</span>
                <span className="text-emerald-400 text-[10px] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Drive AppData Connected
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {activeAppMode === 'architecture' ? (
          /* Step-by-Step React Native & Expo Architecture Studio */
          <MobileArchitectureStudio
            onSelectSimulatorTab={tab => {
              setActiveAppMode('simulator');
              setSimulatorTab(tab as any);
            }}
          />
        ) : (
          /* Interactive Digital Legacy Vault App Simulator */
          <div className="space-y-6">
            {/* Simulator Control Bar */}
            <div className="flex items-center justify-between bg-slate-900/40 p-2.5 rounded-2xl border border-slate-800/80">
              {/* Simulator Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto">
                <button
                  onClick={() => setSimulatorTab('vault')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    simulatorTab === 'vault'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Asset Vault ({assets.length})
                </button>
                <button
                  onClick={() => setSimulatorTab('switch')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    simulatorTab === 'switch'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <HeartPulse className="w-3.5 h-3.5" />
                  Dead Man's Switch
                </button>
                <button
                  onClick={() => setSimulatorTab('nominees')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    simulatorTab === 'nominees'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Nominee & Recovery
                </button>
                <button
                  onClick={() => setSimulatorTab('drive')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    simulatorTab === 'drive'
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Cloud className="w-3.5 h-3.5" />
                  Drive AppData Sync
                </button>
              </div>

              {/* Phone Frame Toggle */}
              <button
                onClick={() => setIsPhoneFrameMode(!isPhoneFrameMode)}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-colors ${
                  isPhoneFrameMode
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {isPhoneFrameMode ? (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    Expanded View
                  </>
                ) : (
                  <>
                    <Smartphone className="w-3.5 h-3.5" />
                    Mobile Phone Frame
                  </>
                )}
              </button>
            </div>

            {/* Container (either responsive or phone frame) */}
            <div className={isPhoneFrameMode ? 'flex justify-center py-4' : 'w-full'}>
              <div
                className={
                  isPhoneFrameMode
                    ? 'w-full max-w-[420px] bg-slate-950 border-[8px] border-slate-800 rounded-[48px] p-4 shadow-2xl overflow-hidden'
                    : 'w-full'
                }
              >
                {isPhoneFrameMode && (
                  /* Phone Notch & Status bar */
                  <div className="flex items-center justify-between text-[11px] text-slate-400 px-4 pt-1 pb-4">
                    <span>9:41</span>
                    <div className="w-20 h-4 bg-slate-800 rounded-full" />
                    <span>100% ⚡</span>
                  </div>
                )}

                {/* Sub-view rendering */}
                {simulatorTab === 'vault' && (
                  <VaultView
                    assets={assets}
                    masterKey={masterKey}
                    isCompact={isPhoneFrameMode}
                    onAddAsset={handleAddAsset}
                    onDeleteAsset={handleDeleteAsset}
                  />
                )}

                {simulatorTab === 'switch' && (
                  <DeadMansSwitchView
                    config={switchConfig}
                    nominee={nominee}
                    assetCount={assets.length}
                    userEmail={userSession.email}
                    userName={userSession.displayName}
                    onUpdateConfig={setSwitchConfig}
                    onCheckIn={handleCheckIn}
                  />
                )}

                {simulatorTab === 'nominees' && (
                  <NomineesView
                    nominee={nominee}
                    masterKey={masterKey}
                    userName={userSession.displayName}
                    userEmail={userSession.email}
                    onUpdateNominee={setNominee}
                  />
                )}

                {simulatorTab === 'drive' && (
                  <DriveSyncView
                    assets={assets}
                    masterKey={masterKey}
                    userEmail={userSession.email}
                    lastSyncTime={lastSyncTime}
                    onSyncComplete={handleSyncComplete}
                    onImportBackup={setAssets}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Nominee Decryption Portal Modal */}
      <NomineeRecoveryModal
        isOpen={isNomineeModalOpen}
        onClose={() => setIsNomineeModalOpen(false)}
        sampleEncryptedData={sampleEncryptedBlob}
        defaultMasterKey={masterKey}
      />
    </div>
  );
}
