/**
 * Verifies a Discord Ed25519 signature using the Web Crypto API.
 * Called from Python via subprocess.
 *
 * Usage: node verify.mjs <publicKey> <signature> <timestamp> <body>
 * Exits with code 0 if valid, 1 if invalid.
 */

const [, , publicKey, signature, timestamp, body] = process.argv;

async function verify(publicKey, signature, timestamp, body) {
  const encoder = new TextEncoder();

  const keyBytes = Uint8Array.from(publicKey.match(/.{2}/g).map(b => parseInt(b, 16)));
  const sigBytes = Uint8Array.from(signature.match(/.{2}/g).map(b => parseInt(b, 16)));
  const message = encoder.encode(timestamp + body);

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "Ed25519" },
    false,
    ["verify"]
  );

  const isValid = await crypto.subtle.verify(
    { name: "Ed25519" },
    cryptoKey,
    sigBytes,
    message
  );

  return isValid;
}

verify(publicKey, signature, timestamp, body)
  .then(isValid => {
    process.exit(isValid ? 0 : 1);
  })
  .catch(err => {
    console.error("Verification error:", err.message);
    process.exit(1);
  });