const log = require('debug')('VM:PaymentLayer:bcoin')

const Kefir = require('kefir')
const Promise = require('bluebird')
const bcoin = require('bcoin').set('testnet');

const config = require('../config')
const addresses = config.map(product => product.address);

function parse(tx) {
    payment = {
        txid: tx.hash,
        received: tx.value,
        address: tx.outputs.filter(output => addresses.include(output.address.toBase58()))[0]
    }
    log(payment);
    return payment;
}

var chain = new bcoin.chain({
    db: 'memory',
    spv: true
});

var pool = new bcoin.pool({
    chain: chain,
    spv: true,
    size: 1,
    maxPeers: 1
});

module.exports = Promise.fromCallback(done => {
    pool.open(err => {
        log('pool opened')
        addresses.forEach((address) => {
            log('Watching: ', address)
            pool.watchAddress(address)
        });
        pool.connect();
        pool.startSync();
        done(null, pool)
        })
    })
    .then(pool => {
        Kefir // error logger
            .fromEvents(pool, 'error')
            .onValue(log)

        return Kefir
            .fromEvents(pool, 'tx')
            .map(parse)
            .onValue(log)
    })
