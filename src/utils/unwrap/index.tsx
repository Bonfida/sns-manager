import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
  AccountLayout,
} from "@solana/spl-token";
import {
  withdrawTokens,
  NAME_TOKENIZER_ID,
  NftRecord,
  getMint,
  redeemNft,
} from "@bonfida/name-tokenizer";
import { checkAccountExists } from "../account";
import { getDomainKeySync } from "@bonfida/spl-name-service";

export const redeemSol = async (
  connection: Connection,
  recordKey: PublicKey,
  publicKey: PublicKey,
  tokenAccountLen: number,
  nftMint: PublicKey
) => {
  const instructions: TransactionInstruction[] = [];
  const recordInfo = await connection.getAccountInfo(recordKey);
  if (!recordInfo) {
    throw new Error("Record info not found");
  }
  const minRent = await connection.getMinimumBalanceForRentExemption(
    recordInfo?.data.length
  );
  if (
    recordInfo.lamports > minRent &&
    tokenAccountLen === 0 // If > 0 the native SOL will be withdrawn in another ix
  ) {
    const ataDestination = await getAssociatedTokenAddress(
      NATIVE_MINT,
      publicKey
    );
    if (!(await checkAccountExists(connection, ataDestination))) {
      instructions.push(
        createAssociatedTokenAccountInstruction(
          publicKey,
          ataDestination,
          publicKey,
          NATIVE_MINT
        )
      );
    }
    const ataSource = await getAssociatedTokenAddress(
      NATIVE_MINT,
      recordKey,
      true
    );
    const createAta = createAssociatedTokenAccountInstruction(
      publicKey,
      ataSource,
      recordKey,
      NATIVE_MINT
    );
    const withdrawIx = await withdrawTokens(
      nftMint,
      NATIVE_MINT,
      publicKey,
      recordKey,
      NAME_TOKENIZER_ID
    );
    instructions.push(createAta, ...withdrawIx);
  }
  return instructions;
};

export const unwrap = async (
  connection: Connection,
  domain: string,
  publicKey: PublicKey
) => {
  const instructions: TransactionInstruction[] = [];
  const { pubkey } = getDomainKeySync(domain);
  const [recordKey] = await NftRecord.findKey(pubkey, NAME_TOKENIZER_ID);
  const mint = getMint(pubkey);

  const recordTokenAccounts = await connection.getTokenAccountsByOwner(
    recordKey,
    { programId: TOKEN_PROGRAM_ID }
  );

  for (let tokenAcc of recordTokenAccounts.value) {
    const des = AccountLayout.decode(tokenAcc.account.data);
    const ata = await getAssociatedTokenAddress(des.mint, publicKey);
    if (!(await checkAccountExists(connection, ata))) {
      const ix = createAssociatedTokenAccountInstruction(
        publicKey,
        ata,
        publicKey,
        des.mint
      );
      instructions.push(ix);
    }
    const ix = await withdrawTokens(
      mint,
      des.mint,
      publicKey,
      recordKey,
      NAME_TOKENIZER_ID
    );
    instructions.push(...ix);
  }
  const withdrawNativeSol = await redeemSol(
    connection,
    recordKey,
    publicKey,
    recordTokenAccounts.value.length,
    mint
  );
  instructions.push(...withdrawNativeSol);

  const ix = await redeemNft(pubkey, publicKey, NAME_TOKENIZER_ID);
  instructions.push(...ix);

  return instructions;
};
