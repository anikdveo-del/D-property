/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Terminal,
  FolderTree,
  KeyRound,
  FileCode2,
  Copy,
  Check,
  ShieldCheck,
  Smartphone,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Code,
} from 'lucide-react';
import { ARCHITECTURE_STEPS, StepGuide } from '../data/architectureGuide';

interface MobileArchitectureStudioProps {
  onSelectSimulatorTab?: (tab: string) => void;
}

export default function MobileArchitectureStudio({ onSelectSimulatorTab }: MobileArchitectureStudioProps) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const activeStep = ARCHITECTURE_STEPS[activeStepIndex];

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(id);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold rounded-full uppercase tracking-wider">
                React Native (Expo) Guide
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Serverless & Zero Hosting Cost Architecture
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Digital Legacy Vault Architecture
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Cross-platform mobile implementation for Android & iOS with Google Sign-in, Drive AppData cloud storage, local AES-256 encryption, and autonomous Dead Man's Switch.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Step {activeStep.stepNumber} of 5</span>
          </div>
        </div>

        {/* 5-Step Progress Bar Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-6 pt-5 border-t border-slate-800/80">
          {ARCHITECTURE_STEPS.map((step, idx) => {
            const isActive = activeStepIndex === idx;
            const isCompleted = idx < activeStepIndex;

            return (
              <button
                key={step.stepNumber}
                onClick={() => setActiveStepIndex(idx)}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                    Step {step.stepNumber}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'}`} />
                </div>
                <h4 className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {step.title.replace('The ', '')}
                </h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Active Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Commands & Code */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Header */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest mb-1">
              <span>{activeStep.badge}</span>
              <span>•</span>
              <span>Step {activeStep.stepNumber} of 5</span>
            </div>
            <h3 className="text-xl font-bold text-slate-100">{activeStep.title}</h3>
            <p className="text-xs text-slate-400 mt-1">{activeStep.tagline}</p>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed">
              {activeStep.description}
            </p>
          </div>

          {/* Terminal Commands Block (especially prominent for Step 1) */}
          {activeStep.commands && activeStep.commands.length > 0 && (
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  Terminal Commands (Run in shell)
                </div>
                <button
                  onClick={() => handleCopy(activeStep.commands!.join('\n'), `cmd-${activeStep.stepNumber}`)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors"
                >
                  {copiedIndex === `cmd-${activeStep.stepNumber}` ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Commands</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-black/80 rounded-xl p-4 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed border border-slate-800/80">
                {activeStep.commands.map((cmd, i) => (
                  <div key={i} className={cmd.startsWith('#') ? 'text-slate-500 italic' : cmd === '' ? 'h-2' : 'text-emerald-300'}>
                    {cmd}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Files Included in this Step */}
          {activeStep.codeFiles.map((file, fileIdx) => {
            const copyId = `file-${activeStep.stepNumber}-${fileIdx}`;
            return (
              <div key={file.filename} className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-mono font-bold text-slate-200">{file.filename}</span>
                  </div>

                  <button
                    onClick={() => handleCopy(file.content, copyId)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedIndex === copyId ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Code</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-slate-950/40 text-xs text-slate-400 border-b border-slate-900">
                  {file.commentary}
                </div>

                <div className="p-4 bg-black/90 font-mono text-xs text-slate-200 overflow-x-auto max-h-96">
                  <pre>{file.content}</pre>
                </div>
              </div>
            );
          })}

          {/* Next Step Confirmation Bar */}
          <div className="flex items-center justify-between p-5 bg-slate-900/70 border border-slate-800 rounded-2xl">
            {activeStepIndex > 0 ? (
              <button
                onClick={() => setActiveStepIndex(activeStepIndex - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                ← Back to Step {activeStep.stepNumber - 1}
              </button>
            ) : <div />}

            {activeStepIndex < ARCHITECTURE_STEPS.length - 1 ? (
              <button
                onClick={() => setActiveStepIndex(activeStepIndex + 1)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/50 cursor-pointer"
              >
                Proceed to Step {activeStep.stepNumber + 1}: {ARCHITECTURE_STEPS[activeStepIndex + 1].title.split(' ')[0]}
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-semibold text-emerald-400">
                All 5 Architectural Steps Implemented!
              </span>
            )}
          </div>
        </div>

        {/* Right 1 Column: Key Libraries & Security Rationale */}
        <div className="space-y-5">
          {/* Key Dependencies Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              Libraries for this Step
            </h4>

            <div className="space-y-2.5 text-xs">
              {activeStep.keyLibraries.map(lib => (
                <div key={lib.name} className="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-emerald-400">{lib.name}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                      {lib.versionOrNote}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px]">{lib.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Zero-Hosting Architecture Rationale */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Security & Cost Rules
            </h4>

            <ul className="space-y-2 text-xs text-slate-400">
              {activeStep.securityNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
