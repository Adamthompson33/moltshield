// ═══════════════════════════════════════════════════════════════
// MoltCops Pro API Key Manager
// Generates, stores, validates, and revokes Pro API keys.
// Storage: JSON file for now. Swap to KV/Redis when scaling.
// ═══════════════════════════════════════════════════════════════

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

export interface ProKey {
  key: string;
  email: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  createdAt: string;
  active: boolean;
}

interface KeyStore {
  keys: ProKey[];
}

// In production, use Vercel KV or Upstash Redis
// For now, env-based keys (MOLTCOPS_PRO_KEYS) + this store
const STORE_PATH = path.join(process.cwd(), '.moltcops-keys.json');

function loadStore(): KeyStore {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf-8'));
  } catch {
    return { keys: [] };
  }
}

function saveStore(store: KeyStore): void {
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
}

/**
 * Generate a new Pro API key for a paying customer.
 */
export function generateProKey(
  email: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
): ProKey {
  const key = `mc_pro_${crypto.randomBytes(24).toString('hex')}`;

  const proKey: ProKey = {
    key,
    email,
    stripeCustomerId,
    stripeSubscriptionId,
    createdAt: new Date().toISOString(),
    active: true,
  };

  const store = loadStore();
  store.keys.push(proKey);
  saveStore(store);

  // Also add to env-based key set for the scan engine
  addToEnvKeys(key);

  return proKey;
}

/**
 * Revoke a Pro API key (subscription cancelled).
 */
export function revokeBySubscription(stripeSubscriptionId: string): boolean {
  const store = loadStore();
  let revoked = false;

  for (const k of store.keys) {
    if (k.stripeSubscriptionId === stripeSubscriptionId && k.active) {
      k.active = false;
      revoked = true;
      removeFromEnvKeys(k.key);
    }
  }

  if (revoked) saveStore(store);
  return revoked;
}

/**
 * Validate a Pro API key.
 */
export function validateKey(key: string): boolean {
  // Check env-based keys first (for manually added keys)
  const envKeys = (process.env.MOLTCOPS_PRO_KEYS || '').split(',').filter(Boolean);
  if (envKeys.includes(key)) return true;

  // Check store
  const store = loadStore();
  return store.keys.some(k => k.key === key && k.active);
}

/**
 * Get key details by email.
 */
export function getKeyByEmail(email: string): ProKey | undefined {
  const store = loadStore();
  return store.keys.find(k => k.email === email && k.active);
}

// ═══ Internal helpers ═══

function addToEnvKeys(key: string): void {
  const existing = (process.env.MOLTCOPS_PRO_KEYS || '').split(',').filter(Boolean);
  if (!existing.includes(key)) {
    existing.push(key);
    process.env.MOLTCOPS_PRO_KEYS = existing.join(',');
  }
}

function removeFromEnvKeys(key: string): void {
  const existing = (process.env.MOLTCOPS_PRO_KEYS || '').split(',').filter(Boolean);
  process.env.MOLTCOPS_PRO_KEYS = existing.filter(k => k !== key).join(',');
}
