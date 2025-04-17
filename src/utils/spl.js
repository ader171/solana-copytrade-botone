"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtaList = getAtaList;
const spl_token_1 = require("@solana/spl-token");
/**
 *
 * @param pubkey
 * @returns
 */
async function getAtaList(connection, pubkey) {
    const filters = [
        {
            dataSize: 165, //size of account (bytes)
        },
        {
            memcmp: {
                offset: 32, //location of our query in the account (bytes)
                bytes: pubkey, //our search criteria, a base58 encoded string
            },
        }
    ];
    const accounts = await connection.getParsedProgramAccounts(spl_token_1.TOKEN_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
    { filters: filters });
    const ataList = accounts.map((account, i) => account.pubkey.toBase58());
    return [pubkey, ...ataList];
}
