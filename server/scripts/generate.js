const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();

console.log('private key: ', toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log('public key', toHex(publicKey));

/*
* antonweb15@192 ecdsa-node % node server/scripts/generate.js
private key:  ad7e998d958f207d9cc103f8e99f8c91745e21ea2a7049bbca47c790220f2462
public key 043fd0e9c95b3a243045d2794b518c4cb1d25ade2a524f0c9264a6682eb8e81d39d0a8d0b635e6cfe5b0c20c94166f114c54f9e0eed13744832cbed3062783533a
antonweb15@192 ecdsa-node % node server/scripts/generate.js
private key:  71722ac994cef837e5b35b95fe49d9d15be7a5a577047675e596da646b1365dd
public key 04ffa8219947ca4676aabcfb6987836b35ae58871388edb38a80efa5e43840cce4cccf683a9849f99c5516a571300fb1de8f07daa48b2c7719bbf8040eb7da0e6f
antonweb15@192 ecdsa-node % node server/scripts/generate.js
private key:  902d25ee607990103fb3a8ea3a8191fbc0f2538fc3d623c93af09b5be91c41a0
public key 04faa322a676501aa1e3617b99a772cf43131cd043be3643ff119b2c4a255e8b43cf757afcafd81902dfb0e802f6e085a9f32200d80f5aa70d98247327f6fbaf11
*
* */