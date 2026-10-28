/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Digital Legacy Vault - Dead Man's Switch Logic
 * Manages check-in intervals, grace period evaluation, notification triggers,
 * and payload generation for EmailJS / Google Apps Script.
 */

export interface SwitchConfig {
  checkInIntervalDays: number; // e.g. 30 days
  gracePeriodDays: number;     // e.g. 7 days before final dispatch
  warningRemindersDays: number[]; // e.g. [7, 3, 1] days prior to expiry
  lastCheckInTimestamp: number; // Unix ms
}

export type SwitchStatusType = 'ACTIVE' | 'WARNING' | 'GRACE_PERIOD' | 'TRIGGERED';

export interface SwitchEvaluation {
  status: SwitchStatusType;
  remainingMs: number;
  daysRemaining: number;
  hoursRemaining: number;
  minutesRemaining: number;
  percentElapsed: number; // 0 to 100
  isOverdue: boolean;
  isInGracePeriod: boolean;
  isTriggered: boolean;
  nextCheckInDueDate: string;
  triggerExecutionDate: string;
  formattedRemaining: string;
}

export interface Nominee {
  id: string;
  name: string;
  email: string;
  relationship: string;
  notes?: string;
  notifyOnWarning?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  userId: string;
  createdAt: string;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

/**
 * Computes switch countdown, grace period, and status based on current time.
 */
export function evaluateDeadMansSwitch(
  config: SwitchConfig,
  currentTimeMs: number = Date.now()
): SwitchEvaluation {
  const checkInIntervalMs = config.checkInIntervalDays * MS_PER_DAY;
  const gracePeriodMs = config.gracePeriodDays * MS_PER_DAY;
  
  const dueDateMs = config.lastCheckInTimestamp + checkInIntervalMs;
  const triggerDateMs = dueDateMs + gracePeriodMs;
  
  const totalWindowMs = checkInIntervalMs + gracePeriodMs;
  const elapsedMs = Math.max(0, currentTimeMs - config.lastCheckInTimestamp);
  
  const percentElapsed = Math.min(100, Math.max(0, (elapsedMs / totalWindowMs) * 100));
  
  const remainingUntilDueMs = dueDateMs - currentTimeMs;
  const remainingUntilTriggerMs = triggerDateMs - currentTimeMs;
  
  let status: SwitchStatusType = 'ACTIVE';
  let isOverdue = false;
  let isInGracePeriod = false;
  let isTriggered = false;

  if (currentTimeMs >= triggerDateMs) {
    status = 'TRIGGERED';
    isTriggered = true;
    isOverdue = true;
  } else if (currentTimeMs >= dueDateMs) {
    status = 'GRACE_PERIOD';
    isInGracePeriod = true;
    isOverdue = true;
  } else if (remainingUntilDueMs <= 7 * MS_PER_DAY) {
    status = 'WARNING';
  } else {
    status = 'ACTIVE';
  }

  const effectiveRemainingMs = Math.max(0, remainingUntilTriggerMs);
  const daysRemaining = Math.floor(effectiveRemainingMs / MS_PER_DAY);
  const hoursRemaining = Math.floor((effectiveRemainingMs % MS_PER_DAY) / MS_PER_HOUR);
  const minutesRemaining = Math.floor((effectiveRemainingMs % MS_PER_HOUR) / MS_PER_MINUTE);

  let formattedRemaining = '';
  if (isTriggered) {
    formattedRemaining = 'Dead Man\'s Switch Triggered';
  } else if (isInGracePeriod) {
    formattedRemaining = `Grace Period: ${daysRemaining}d ${hoursRemaining}h remaining`;
  } else {
    formattedRemaining = `${daysRemaining}d ${hoursRemaining}h ${minutesRemaining}m`;
  }

  return {
    status,
    remainingMs: effectiveRemainingMs,
    daysRemaining,
    hoursRemaining,
    minutesRemaining,
    percentElapsed: Math.round(percentElapsed * 10) / 10,
    isOverdue,
    isInGracePeriod,
    isTriggered,
    nextCheckInDueDate: new Date(dueDateMs).toISOString(),
    triggerExecutionDate: new Date(triggerDateMs).toISOString(),
    formattedRemaining,
  };
}

/**
 * Creates email payload template for EmailJS or Google Apps Script Webhook.
 */
export function buildNomineeEmailPayload(params: {
  ownerName: string;
  ownerEmail: string;
  nominee: Nominee;
  assetCount: number;
  encryptedBackupUrl: string;
  masterKeyHint?: string;
  timestamp?: string;
}) {
  const { ownerName, ownerEmail, nominee, assetCount, encryptedBackupUrl, masterKeyHint, timestamp } = params;
  
  return {
    service: 'EmailJS / Google Apps Script',
    to_name: nominee.name,
    to_email: nominee.email,
    from_name: `${ownerName} via Digital Legacy Vault`,
    reply_to: ownerEmail,
    subject: `[IMPORTANT] Digital Legacy Vault Access - Message from ${ownerName}`,
    message_body: `Dear ${nominee.name},

You were designated as a trusted nominee by ${ownerName} (${ownerEmail}) in their Digital Legacy Vault.

${ownerName} has been inactive and missed the scheduled check-in window and emergency grace period. As specified in their pre-arranged security protocol, this automated notification is being transmitted to you.

--- VAULT DETAILS ---
Total Encrypted Assets: ${assetCount} items
Encrypted Backup Storage: ${encryptedBackupUrl}
Date of Release: ${timestamp || new Date().toUTCString()}
Master Key Hint: ${masterKeyHint || 'Physical Recovery Kit provided to you in advance'}

--- ACCESS INSTRUCTIONS ---
1. Open the Digital Legacy Vault Web/Mobile Nominee Recovery Portal.
2. Load or paste the encrypted vault payload from Google Drive.
3. Enter the 16-character Master Key (DLV-XXXX-XXXX-XXXX-XXXX) pre-shared with you.
4. The client-side AES-256 decryption will unlock credentials, financial documents, and confidential notes.

No server or third-party holds the decryption key. All decryption occurs entirely on your device.`,
  };
}
