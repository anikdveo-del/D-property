import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateDeadMansSwitch,
  buildNomineeEmailPayload,
  SwitchConfig,
  Nominee,
} from './switchLogic';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

test('evaluateDeadMansSwitch returns ACTIVE when recent check-in', () => {
  const now = Date.now();
  const config: SwitchConfig = {
    checkInIntervalDays: 30,
    gracePeriodDays: 7,
    warningRemindersDays: [7, 3, 1],
    lastCheckInTimestamp: now - 5 * MS_PER_DAY, // 5 days ago
  };

  const evalResult = evaluateDeadMansSwitch(config, now);
  assert.equal(evalResult.status, 'ACTIVE');
  assert.equal(evalResult.isOverdue, false);
  assert.equal(evalResult.isInGracePeriod, false);
  assert.equal(evalResult.isTriggered, false);
  assert.ok(evalResult.daysRemaining >= 31); // 25 + 7 grace = 32
});

test('evaluateDeadMansSwitch returns WARNING within 7 days of deadline', () => {
  const now = Date.now();
  const config: SwitchConfig = {
    checkInIntervalDays: 30,
    gracePeriodDays: 7,
    warningRemindersDays: [7, 3, 1],
    lastCheckInTimestamp: now - 25 * MS_PER_DAY, // 25 days ago (5 days left)
  };

  const evalResult = evaluateDeadMansSwitch(config, now);
  assert.equal(evalResult.status, 'WARNING');
  assert.equal(evalResult.isOverdue, false);
});

test('evaluateDeadMansSwitch returns GRACE_PERIOD when interval passed but within grace window', () => {
  const now = Date.now();
  const config: SwitchConfig = {
    checkInIntervalDays: 30,
    gracePeriodDays: 7,
    warningRemindersDays: [7, 3, 1],
    lastCheckInTimestamp: now - 32 * MS_PER_DAY, // 32 days ago (2 days into 7-day grace)
  };

  const evalResult = evaluateDeadMansSwitch(config, now);
  assert.equal(evalResult.status, 'GRACE_PERIOD');
  assert.equal(evalResult.isOverdue, true);
  assert.equal(evalResult.isInGracePeriod, true);
  assert.equal(evalResult.isTriggered, false);
});

test('evaluateDeadMansSwitch returns TRIGGERED after grace period expires', () => {
  const now = Date.now();
  const config: SwitchConfig = {
    checkInIntervalDays: 30,
    gracePeriodDays: 7,
    warningRemindersDays: [7, 3, 1],
    lastCheckInTimestamp: now - 38 * MS_PER_DAY, // 38 days ago (over 30+7)
  };

  const evalResult = evaluateDeadMansSwitch(config, now);
  assert.equal(evalResult.status, 'TRIGGERED');
  assert.equal(evalResult.isTriggered, true);
  assert.equal(evalResult.isOverdue, true);
});

test('buildNomineeEmailPayload populates correct details', () => {
  const nominee: Nominee = {
    id: 'nom-1',
    name: 'Sarah Connor',
    email: 'sarah@example.com',
    relationship: 'Sister & Executor',
  };

  const payload = buildNomineeEmailPayload({
    ownerName: 'John Doe',
    ownerEmail: 'john@example.com',
    nominee,
    assetCount: 8,
    encryptedBackupUrl: 'https://drive.google.com/drive/u/0/appdata/...',
    masterKeyHint: 'Stored in fireproof lockbox #4',
  });

  assert.equal(payload.to_name, 'Sarah Connor');
  assert.equal(payload.to_email, 'sarah@example.com');
  assert.ok(payload.message_body.includes('John Doe'));
  assert.ok(payload.message_body.includes('8 items'));
  assert.ok(payload.message_body.includes('Stored in fireproof lockbox #4'));
  assert.ok(payload.message_body.includes('AES-256'));
});
