import assert from 'node:assert/strict';
import test from 'node:test';
import { AccountId, Address, NoteType, createP2IDNote } from '@miden-sdk/miden-sdk';

test('public P2ID delivery accepts the connected private Miden recipient', () => {
  const recipient = AccountId.fromHex('0x0e9089055fb6f54170bbf6159da028');
  assert.equal(recipient.isPublic(), false);
  const faucet = Address.fromBech32(
    'mm1arnfum9xuwwlrvgvrefejwvlavn3vk24_qr7qqq9wr6w',
  ).accountId();
  // Construct a note locally; no client, proof, or network submission is used.
  const note = createP2IDNote({
    from: '0x5d38246547d94e5165c9e0fafbc667',
    to: recipient,
    assets: [{ token: faucet, amount: 10000n }],
    type: 'public',
  });
  assert.equal(note.metadata().noteType(), NoteType.Public);
  assert.match(note.id().toString(), /^0x[0-9a-f]{64}$/);
});
