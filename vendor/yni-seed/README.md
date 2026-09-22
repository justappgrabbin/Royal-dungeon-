# Synthia Standalone + YOU-N-I-VERSE Extension Seed v0.1.0

This is an **untethered extraction** of Synthia from the verified 59,269,155-byte Acode residence.

- Source donor SHA-256: `fb4da41c27838139a3d6c0d0317f4eb3e7f30ce9973c43d01006ea85f48839bb`
- Original Synthia suite: **110/110 PASS**
- `src/synthia/` is preserved from the donor.
- Acode/Cordova does **not** participate in the new boot path.
- `host/you-n-i-verse-host.mjs` is the new injected hands/browser/network/files adapter.
- Permissions default OFF.

## Run the core
`node START-SYNTHIA.mjs "hello"`

## Verify the untethered seed
`node VERIFY-STANDALONE.mjs`

## Browser / phone surface
Serve this folder from the YOU-N-I-VERSE browser/runtime and open `extension/index.html`. If the browser exposes `globalThis.YNIHost`, Synthia can bind those capabilities. Without it, Synthia still runs; the hands remain unavailable rather than faked.

## Important
This is the first untethered seed, not yet the finished Android self-building residence. The donor's own readiness document says the modern Android toolchain/self-build automaton still needs wiring.
