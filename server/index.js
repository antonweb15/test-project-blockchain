const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "043fd0e9c95b3a243045d2794b518c4cb1d25ade2a524f0c9264a6682eb8e81d39d0a8d0b635e6cfe5b0c20c94166f114c54f9e0eed13744832cbed3062783533a": 100,
  "04ffa8219947ca4676aabcfb6987836b35ae58871388edb38a80efa5e43840cce4cccf683a9849f99c5516a571300fb1de8f07daa48b2c7719bbf8040eb7da0e6f": 50,
  "04faa322a676501aa1e3617b99a772cf43131cd043be3643ff119b2c4a255e8b43cf757afcafd81902dfb0e802f6e085a9f32200d80f5aa70d98247327f6fbaf11": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
