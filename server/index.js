const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

// Crypto imports for signing/verification
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes, toHex, hexToBytes } = require("ethereum-cryptography/utils");

app.use(cors());
app.use(express.json());

// Public keys as addresses with initial balances
const balances = {
  "043fd0e9c95b3a243045d2794b518c4cb1d25ade2a524f0c9264a6682eb8e81d39d0a8d0b635e6cfe5b0c20c94166f114c54f9e0eed13744832cbed3062783533a": 100,
  "04ffa8219947ca4676aabcfb6987836b35ae58871388edb38a80efa5e43840cce4cccf683a9849f99c5516a571300fb1de8f07daa48b2c7719bbf8040eb7da0e6f": 50,
  "04faa322a676501aa1e3617b99a772cf43131cd043be3643ff119b2c4a255e8b43cf757afcafd81902dfb0e802f6e085a9f32200d80f5aa70d98247327f6fbaf11": 75,
};

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

// Deterministic hash of the transfer intent (must match the client)
function getMessageHash(message) {
  // message: { amount: number, recipient: string }
  const msgBytes = utf8ToBytes(JSON.stringify(message));
  return keccak256(msgBytes);
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  try {
    // Do NOT trust `sender` from the client anymore
    const { amount, recipient, signature, recoveryBit } = req.body;

    // Basic validation of body
    if (
      amount === undefined ||
      !recipient ||
      !signature ||
      (recoveryBit !== 0 && recoveryBit !== 1)
    ) {
      return res.status(400).send({ message: "Invalid request body" });
    }
    if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
      return res.status(400).send({ message: "Amount must be a positive number" });
    }

    // Build the same message the client signed
    const message = { amount, recipient };
    const msgHash = getMessageHash(message);

    // Convert signature (hex string) to bytes
    const sigBytes = hexToBytes(signature);

    // Recover public key (sender) from signature + recovery bit
    const recoveredPubKey = secp.recoverPublicKey(msgHash, sigBytes, recoveryBit);
    const sender = toHex(recoveredPubKey);

    // Optionally verify signature explicitly
    const isValid = secp.verify(sigBytes, msgHash, recoveredPubKey);
    if (!isValid) {
      return res.status(400).send({ message: "Invalid signature" });
    }

    setInitialBalance(sender);
    setInitialBalance(recipient);

    if (balances[sender] < amount) {
      return res.status(400).send({ message: "Not enough funds!" });
    }

    // Apply transfer
    balances[sender] -= amount;
    balances[recipient] += amount;

    return res.send({ balance: balances[sender] });
  } catch (err) {
    console.error(err);
    return res.status(400).send({ message: "Bad request" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
