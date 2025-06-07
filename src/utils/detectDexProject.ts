// src/utils/detectDexProject.ts

import { ParsedInstruction } from '@solana/web3.js';

const DEX_PROGRAM_MAP: Record<string, string> = {
  // Route/aggregator and AMM program IDs with labels used by Trader API Client
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'P_JUPITER',
  'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB': 'P_JUPITER',
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'P_RAYDIUM',
  'CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C': 'P_RAYDIUM',
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK': 'P_RAYDIUM',
  '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P': 'P_PUMP',
  'pAMMBay6oceH9fJKBRHGP5D4bD4sWpmSwMn52FMfXEA': 'P_PUMP',
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'P_ORCA',
  'PhoeNiXZ8ByJGLkxNfZRnkUfjvmuYqLR89jjFHGqdXY': 'P_PHOENIX',
  'opnb2LAfJYbRMAHHvqjCwQxanZn7ReEHp1k81EohpZb': 'P_OPENBOOK',
  'LanMV9sAd7wArD4vJFi2qDdfnVhFxYSUg6eADduJ3uj': 'P_RAYDIUM',
  'stkitrT1Uoy18Dk1fTrgPw8W6MVzoCfYoAFT4MLsmhq': 'P_SANCTUM',
};

export function detectDexProject(instructions: ParsedInstruction[]): string | null {
  for (const ix of instructions) {
    if ('programId' in ix && typeof ix.programId === 'string') {
      const mapped = DEX_PROGRAM_MAP[ix.programId];
      if (mapped) return mapped;
    }
    if ('programId' in ix && typeof ix.programId === 'object' && 'toBase58' in ix.programId) {
      const pid = ix.programId.toBase58();
      const mapped = DEX_PROGRAM_MAP[pid];
      if (mapped) return mapped;
    }
  }
  return null;
}

