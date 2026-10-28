/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Activity,
  HeartPulse,
  AlertTriangle,
  Clock,
  Send,
  RotateCcw,
  FastForward,
  CheckCircle2,
  Mail,
  ShieldAlert,
  BellRing,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { evaluateDeadMansSwitch, SwitchConfig, SwitchStatusType, buildNomineeEmailPayload } from '../utils/switchLogic';
import { Nominee } from '../types/vault';

interface DeadMansSwitchViewProps {
  config: SwitchConfig;
  nominee: Nominee;
  assetCount: number;
  userEmail: string;
  userName: string;
  onUpdateConfig: (newConfig: SwitchConfig) => void;
  onCheckIn: () => void;
}

export default function DeadMansSwitchView({
  config,
  nominee,
  assetCount,
  userEmail,
  userName,
  onUpdateConfig,
  onCheckIn,
}: DeadMansSwitchViewProps) {
  // Current simulated time offset in days
  const [simulatedDayOffset, setSimulatedDayOffset] = useState<number>(0);
  const [now, setNow] = useState<number>(Date.now());
  const [justCheckedIn, setJustCheckedIn] = useState<boolean>(false);
  const [showEmailModal, setShowEmailModal] = useState<boolean>(false);

  // Keep clock ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const simulatedCurrentTime = now + simulatedDayOffset * 24 * 60 * 60 * 1000;
  const evaluation = evaluateDeadMansSwitch(config, simulatedCurrentTime);

  const handleCheckInClick = () => {
    setSimulatedDayOffset(0);
    onCheckIn();
    setJustCheckedIn(true);
    setTimeout(() => setJustCheckedIn(false), 3000);
  };

  const statusColors: Record<SwitchStatusType, { bg: string; text: string; ring: string; border: string }> = {
    ACTIVE: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      ring: 'stroke-emerald-500',
      border: 'border-emerald-500/30',
    },
    WARNING: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      ring: 'stroke-amber-500',
      border: 'border-amber-500/30',
    },
    GRACE_PERIOD: {
      bg: 'bg-orange-500/10',
      text: 'text-orange-400',
      ring: 'stroke-orange-500',
      border: 'border-orange-500/30',
    },
    TRIGGERED: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      ring: 'stroke-rose-500',
      border: 'border-rose-500/30',
    },
  };

  const currentStyling = statusColors[evaluation.status];

  const emailPayload = buildNomineeEmailPayload({
    ownerName: userName,
    ownerEmail: userEmail,
    nominee,
    assetCount,
    encryptedBackupUrl: 'https://drive.google.com/drive/u/0/folders/appdata/dlv_vault_encrypted.json',
    masterKeyHint: nominee.masterKeyHint,
  });

  return (
    <div className="space-y-6">
      {/* Header status bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-5 rounded-2xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-100">Dead Man's Switch Engine</h2>
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentStyling.bg} ${currentStyling.text} ${currentStyling.border} flex items-center gap-1.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              STATUS: {evaluation.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous heartbeat monitor. If check-ins lapse, nominee is alerted via serverless email.
          </p>
        </div>

        <button
          onClick={() => setShowEmailModal(true)}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-emerald-400" />
          Preview Nominee Dispatch
        </button>
      </div>

      {/* Main Switch Countdown Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Countdown Heartbeat Card */}
        <div className={`lg:col-span-2 bg-slate-900/70 border ${currentStyling.border} rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xl`}>
          {/* Subtle background glow */}
          <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-10 pointer-events-none ${evaluation.isTriggered ? 'bg-rose-500' : 'bg-emerald-500'}`} />

          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className={`p-2.5 rounded-xl ${currentStyling.bg} ${currentStyling.text}`}>
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Check-In Countdown
                </span>
                <h3 className="text-lg font-bold text-slate-100">
                  {evaluation.isTriggered
                    ? 'Dead Man Switch Executed'
                    : evaluation.isInGracePeriod
                    ? 'Emergency Grace Period Active'
                    : 'System Armed & Monitoring'}
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Cadence Interval</span>
              <span className="text-xs font-semibold text-slate-200">{config.checkInIntervalDays} Days</span>
            </div>
          </div>

          {/* Big countdown stats */}
          <div className="my-8 flex flex-col sm:flex-row items-center justify-around gap-6 text-center">
            {evaluation.isTriggered ? (
              <div className="text-rose-400 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl max-w-md">
                <ShieldAlert className="w-12 h-12 mx-auto mb-2 text-rose-500" />
                <h4 className="font-bold text-base text-rose-200">Switch Triggered</h4>
                <p className="text-xs text-rose-300/80 mt-1">
                  Automated notification transmitted to {nominee.name} ({nominee.email}). Master recovery protocol initiated.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4 w-full max-w-md">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-3xl font-extrabold text-slate-100 font-mono">
                    {evaluation.daysRemaining}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium uppercase mt-1">
                    Days Left
                  </span>
                </div>
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-3xl font-extrabold text-slate-100 font-mono">
                    {evaluation.hoursRemaining}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium uppercase mt-1">
                    Hours
                  </span>
                </div>
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <span className="text-3xl font-extrabold text-slate-100 font-mono">
                    {evaluation.minutesRemaining}
                  </span>
                  <span className="block text-[11px] text-slate-400 font-medium uppercase mt-1">
                    Minutes
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Time Elapsed ({evaluation.percentElapsed}%)</span>
              <span>Next Check-in: {new Date(evaluation.nextCheckInDueDate).toLocaleDateString()}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  evaluation.isTriggered
                    ? 'bg-rose-500'
                    : evaluation.isInGracePeriod
                    ? 'bg-orange-500'
                    : evaluation.status === 'WARNING'
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, evaluation.percentElapsed)}%` }}
              />
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={handleCheckInClick}
              className={`flex-1 w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer ${
                justCheckedIn
                  ? 'bg-emerald-500 text-white scale-[1.02]'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95 shadow-emerald-950/50'
              }`}
            >
              {justCheckedIn ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  Checked In! Timer Reset (30 Days)
                </>
              ) : (
                <>
                  <HeartPulse className="w-5 h-5" />
                  Check In Now (I'm Alive)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Configuration & Reminders Panel */}
        <div className="space-y-4">
          {/* Settings Box */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-slate-200 text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Check-in Configuration
            </h4>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Check-in Interval</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[7, 14, 30, 60].map(days => (
                    <button
                      key={days}
                      onClick={() => onUpdateConfig({ ...config, checkInIntervalDays: days })}
                      className={`py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        config.checkInIntervalDays === days
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {days}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Emergency Grace Period</label>
                <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="text-slate-300 font-medium">Extra Grace Time</span>
                  <span className="text-emerald-400 font-mono font-bold">+{config.gracePeriodDays} Days</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Urgent local alerts sent during grace period before nominee notification is triggered.
                </p>
              </div>
            </div>
          </div>

          {/* Push Reminder Schedule (Expo Notifications Simulation) */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h4 className="font-semibold text-slate-200 text-sm mb-2 flex items-center gap-2">
              <BellRing className="w-4 h-4 text-emerald-400" />
              Scheduled Local Reminders
            </h4>
            <p className="text-[11px] text-slate-400 mb-3">
              Powered by <code className="text-emerald-400 font-mono">expo-notifications</code> on device:
            </p>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">7 Days Prior</span>
                <span className="text-emerald-400 font-mono text-[11px]">Gentle Reminder</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">3 Days Prior</span>
                <span className="text-amber-400 font-mono text-[11px]">Action Required</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-300">1 Day Prior</span>
                <span className="text-rose-400 font-mono text-[11px]">Critical Alert</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator / Time Machine Controls */}
      <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FastForward className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-slate-200">
              Interactive Time Machine & Trigger Testing
            </h4>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Offset: +{simulatedDayOffset} days
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          Test how the app reacts to elapsed time without waiting 30 real days. Fast-forward into warning states or trigger the Dead Man's Switch:
        </p>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => setSimulatedDayOffset(0)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            Reset to Today (Day 0)
          </button>
          <button
            onClick={() => setSimulatedDayOffset(10)}
            className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
          >
            +10 Days (Normal Active)
          </button>
          <button
            onClick={() => setSimulatedDayOffset(25)}
            className="px-3.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium rounded-xl border border-amber-500/30 transition-colors"
          >
            +25 Days (Warning Zone)
          </button>
          <button
            onClick={() => setSimulatedDayOffset(32)}
            className="px-3.5 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-300 text-xs font-medium rounded-xl border border-orange-500/30 transition-colors"
          >
            +32 Days (Grace Period)
          </button>
          <button
            onClick={() => setSimulatedDayOffset(38)}
            className="px-3.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium rounded-xl border border-rose-500/30 transition-colors"
          >
            +38 Days (Trigger Switch)
          </button>
        </div>
      </div>

      {/* Nominee Dispatch Preview Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Automated Nominee Email Dispatch
                  </h3>
                  <p className="text-xs text-slate-400">Dispatched via serverless EmailJS or Google Apps Script</p>
                </div>
              </div>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-900 pb-2">
                  <span>To: <strong className="text-slate-200">{emailPayload.to_name} &lt;{emailPayload.to_email}&gt;</strong></span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Serverless REST</span>
                </div>
                <div className="text-slate-400 border-b border-slate-900 pb-2">
                  <span>Subject: <strong className="text-slate-200">{emailPayload.subject}</strong></span>
                </div>
                <div className="font-mono text-[11px] text-slate-300 whitespace-pre-line leading-relaxed pt-2 bg-slate-900/50 p-3 rounded-lg border border-slate-800/60">
                  {emailPayload.message_body}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Zero-Knowledge Security Note:</strong> Notice that the user's Master Key is NOT included in this automated email! The nominee uses the physical Master Key card previously provided in escrow to unlock the encrypted payload.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
