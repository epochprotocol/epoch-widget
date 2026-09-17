import {
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  type Connection,
} from "@solana/web3.js";
import { Buffer } from "buffer";

const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
);
const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
);

/** Anchor discriminator for the deployed escrow program's `open_escrow`. */
const OPEN_ESCROW_DISCRIMINATOR = Buffer.from([
  82, 178, 155, 253, 74, 41, 161, 219,
]);
const U64_MAX = (1n << 64n) - 1n;
const I64_MAX = (1n << 63n) - 1n;

function configPda(programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync([Buffer.from("config")], programId)[0];
}

function escrowPda(
  depositor: PublicKey,
  bindingHash: Buffer,
  programId: PublicKey,
): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("escrow"), depositor.toBuffer(), bindingHash],
    programId,
  )[0];
}

function vaultPda(escrow: PublicKey, programId: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), escrow.toBuffer()],
    programId,
  )[0];
}

function associatedTokenAddress(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID,
  )[0];
}

function bindingHashToBytes(hash: string): Buffer {
  const hex = hash.trim().replace(/^0x/i, "").toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(hex)) {
    throw new Error("Escrow binding hash must be exactly 32 bytes");
  }
  return Buffer.from(hex, "hex");
}

export async function buildOpenEscrowTransaction(
  connection: Connection,
  args: {
    programId: PublicKey;
    depositor: PublicKey;
    mint: PublicKey;
    amount: bigint;
    bindingHash: string;
    reclaimAfter: number;
  },
): Promise<{ transaction: Transaction; escrow: PublicKey }> {
  if (args.amount <= 0n || args.amount > U64_MAX) {
    throw new Error("Escrow amount must be a positive u64 value");
  }
  if (
    !Number.isSafeInteger(args.reclaimAfter) ||
    args.reclaimAfter <= 0 ||
    BigInt(args.reclaimAfter) > I64_MAX
  ) {
    throw new Error("Escrow reclaim time must be a positive safe i64 value");
  }
  const bindingHash = bindingHashToBytes(args.bindingHash);
  const escrow = escrowPda(args.depositor, bindingHash, args.programId);
  const data = Buffer.alloc(56);
  OPEN_ESCROW_DISCRIMINATOR.copy(data, 0);
  bindingHash.copy(data, 8);
  data.writeBigUInt64LE(args.amount, 40);
  data.writeBigInt64LE(BigInt(args.reclaimAfter), 48);

  const instruction = new TransactionInstruction({
    programId: args.programId,
    keys: [
      { pubkey: args.depositor, isSigner: true, isWritable: true },
      { pubkey: args.depositor, isSigner: true, isWritable: true },
      { pubkey: configPda(args.programId), isSigner: false, isWritable: true },
      { pubkey: escrow, isSigner: false, isWritable: true },
      { pubkey: vaultPda(escrow, args.programId), isSigner: false, isWritable: true },
      { pubkey: args.mint, isSigner: false, isWritable: false },
      {
        pubkey: associatedTokenAddress(args.depositor, args.mint),
        isSigner: false,
        isWritable: true,
      },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });

  const transaction = new Transaction().add(instruction);
  transaction.feePayer = args.depositor;
  transaction.recentBlockhash = (
    await connection.getLatestBlockhash("processed")
  ).blockhash;
  return { transaction, escrow };
}
