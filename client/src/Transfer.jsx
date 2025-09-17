import { useState } from "react";
import server from "./server";
import * as secp from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils";

function Transfer({ privateKey, setBalance }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  // Must match server hashing logic exactly
  function getMessageHash(message) {
    const msgBytes = utf8ToBytes(JSON.stringify(message));
    return keccak256(msgBytes);
  }

  async function transfer(evt) {
    evt.preventDefault();

    const amount = parseInt(sendAmount, 10);

    // Validate inputs without throwing exceptions that are caught locally
    if (!privateKey) {
      alert("Private key is required to sign the transaction");
      return;
    }
    if (!recipient) {
      alert("Recipient is required");
      return;
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      alert("Amount must be a positive integer");
      return;
    }

    try {
      // Build the message to be signed: do NOT include sender
      const message = { amount, recipient };
      const msgHash = getMessageHash(message);

      // Sign and get both signature and recovery bit (0 or 1)
      const [signature, recoveryBit] = await secp.sign(msgHash, privateKey, { recovered: true });

      const {
        data: { balance },
      } = await server.post(`send`, {
        amount,
        recipient,
        signature: toHex(signature), // send signature as hex string
        recoveryBit,                 // send recovery bit used to recover the public key
      });

      setBalance(balance);
    } catch (ex) {
      const msg = ex?.response?.data?.message || ex.message || "Unknown error";
      alert(msg);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Paste a public key"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
