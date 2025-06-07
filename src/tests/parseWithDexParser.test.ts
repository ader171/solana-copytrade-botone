// src/tests/parseWithDexParser.test.ts

import dotenv from 'dotenv';
dotenv.config();

import { Connection, ParsedTransactionWithMeta } from '@solana/web3.js';
import { extractTradesFromParsed } from '../utils/parseWithDexParser';
import { getFinalSwap } from 'solana-dex-parser/src/utils';

describe('DEX Parser Test Suite', () => {
  const rpcUrl = process.env.RPC_ENDPOINT;
  if (!rpcUrl) throw new Error('Missing RPC_ENDPOINT in .env');

  const connection = new Connection(rpcUrl, 'confirmed');

  const dexTests = [
    {
      dex: 'Pump.fun',
      signature: '2dpTLk6AQQMJUAdhNz3dK8guEDBfR3vogUkgHwDg9praDxthgsz5cAYCL4WHrnKuAWBMG3VNquSJ3W9RNbv1pVoo',
    },
    {
      dex: 'PumpSwap',
      signature: '2dpTLk6AQQMJUAdhNz3dK8guEDBfR3vogUkgHwDg9praDxthgsz5cAYCL4WHrnKuAWBMG3VNquSJ3W9RNbv1pVoo',
    },
    {
      dex: 'Jupiter',
      signature: '5RGTTmMdCqtWQ3kSff39iGVpEvHYysnYgAR5qudnbkCuqkWpEkv8LjUZ4kDJQnniK37DRrZf6Mw9fhNqrfNpqCSL',
    },
    {
      dex: 'Raydium',
      signature: '3GLnVK9xavfN9ahGkq6Fncf4GAKhAmMyW5z42MuH1iYRx9mhETJ8UxyKDWcQoEM21v68JACyxJdZ6WMEjBAvUoGS',
    },
    {
      dex: 'Orca',
      signature: '5Fe6mbz9EnEip1ZfyaDLmjvEmW2Vg9pkEZ1ikCqonEKR3mPB9N4x2nqsfq67QpoJ7tLDkzmVuF8Wdvk1EPmJALc3',
    },
    {
      dex: 'Meteora',
      signature: '4p6JgFcFooyDxSCNn96MPjyd7kSBLtbMNvv51SNLv29YiihwrWuZMd9KAPED7KEMaZabBBuXogX2dsy3MHTHznrs',
    },
    {
      dex: 'Moonshot',
      signature: '2v7J2aqr2azikXm3k5NaZn7UyKUJ8MyjF8TWh52nHUAZg2Jj84z6WRqbmPpKHvYr9TH2B4KiTjKXvFMrxAiDJpET',
    },
  ];

  dexTests.forEach(({ dex, signature }) => {
    it(`should parse a valid ${dex} transaction`, async () => {
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      expect(tx).toBeTruthy();
      if (!tx) return;

      const trades = extractTradesFromParsed(tx);
      expect(trades.length).toBeGreaterThan(0);

      const final = getFinalSwap(trades);
      expect(final).toBeTruthy();

      console.log(`✅ Parsed trade for ${dex}:`, final);
    });
  });
});

