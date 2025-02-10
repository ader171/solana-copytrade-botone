"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAtaList = getAtaList;
const spl_token_1 = require("@solana/spl-token");
/**
 *
 * @param pubkey
 * @returns
 */
function getAtaList(connection, pubkey) {
    return __awaiter(this, void 0, void 0, function* () {
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
        const accounts = yield connection.getParsedProgramAccounts(spl_token_1.TOKEN_PROGRAM_ID, //new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA")
        { filters: filters });
        const ataList = accounts.map((account, i) => account.pubkey.toBase58());
        return [pubkey, ...ataList];
    });
}
