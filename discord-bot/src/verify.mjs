/**
 * Persistent Node.js worker for Discord signature verification.
 * Communicates via stdin/stdout instead of CLI args.
 */

process.stdin.setEncoding("utf-8");

process.stdin.on("data", async (chunk) => {
  try {
    const { publicKey, signature, timestamp, body } = JSON.parse(chunk);

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

    process.stdout.write(JSON.stringify({ valid: isValid }) + "\n");

  } catch (err) {
    process.stdout.write(JSON.stringify({ valid: false }) + "\n");
  }
});