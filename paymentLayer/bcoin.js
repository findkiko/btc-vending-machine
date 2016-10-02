const log = require('debug')('VM:PaymentLayer:bcoin')

const Kefir = require('kefir')
const Promise = require('bluebird')
const bcoin = require('bcoin').set('testnet');

const config = require('../config')
const addresses = config.map(product => product.address);

function configure(products) {
  var chain = new bcoin.chain({
    db: 'leveldb',
    // A custom chaindb location:
    location: process.env.HOME + '/chain.db',
    spv: true
  });

  var pool = new bcoin.pool({
    chain: chain,
    spv: true,
    size: 1,
    maxPeers: 1
  });

  return Promise.fromCallback(done => {
    pool.open(err => {
      addresses.forEach((a) => pool.watchAddress(a));

      pool.connect();
      pool.startSync();

      pool.on('error', err => { console.log(err) });
      done(null, pool);
    });
  });
}

function parse(tx){
  payment = {
    txid: tx.hash,
    received: tx.value,
    address: tx.outputs.filter(output => addresses.include(output.address.toBase58()))[0]
  }
  console.log(payment);
  return payment;
}

module.exports = configure(products)
  .then(watcher => {
    console.log('Starting up bcoin')
    return Kefir.fromEvents(watcher, 'tx')
      .log('bcoin tx seen')
      .filter(tx => tx.confirmations < 2)
      .map(parse)
    })


/*
let bcoinTxStream = Kefir
    .fromEvents(pool, 'tx')
    .map(tx => {
      return {
        txid: tx.hash,
        received: tx.value,
        address: tx.outputs.filter(output => addresses.include(output.address.toBase58()))[0]
      }
    }).log()

module.exports = Promise.resolve(bcoinTxStream)
*/
