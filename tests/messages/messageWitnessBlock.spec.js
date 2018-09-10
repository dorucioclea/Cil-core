const {describe, it} = require('mocha');
const {assert} = require('chai');
const sinon = require('sinon');

const factory = require('../testFactory');

const createDummyTx = () => ({
    payload: {
        ins: [{txHash: Buffer.allocUnsafe(32), nTxOutput: parseInt(Math.random() * 1000)}],
        outs: [{amount: parseInt(Math.random() * 1000)}]
    },
    claimProofs: [Buffer.allocUnsafe(32)]
});

describe('MessageWitnessBlock', () => {
    before(async function() {
        this.timeout(15000);
        await factory.asyncLoad();
    });

    after(async function() {
        this.timeout(15000);
    });

    it('should NOT create message', async () => {
        const wrapper = () => new factory.Messages.MsgWitnessBlock();
        assert.throws(wrapper);
    });

    it('should create message', async () => {
        const msg = new factory.Messages.MsgWitnessBlock({groupName: 'test'});
        assert.isOk(msg.isWitnessBlock());
    });

    it('should encode/decode message', async () => {
        const msg = new factory.Messages.MsgWitnessBlock({groupName: 'test'});

        const block = new factory.Block();
        const keyPair = factory.Crypto.createKeyPair();
        const tx = new factory.Transaction(createDummyTx());
        tx.sign(0, keyPair.privateKey);

        block.addTx(tx);
        msg.block = block;
        msg.sign(keyPair.privateKey);

        const buffMsg = msg.encode();
        assert.isOk(Buffer.isBuffer(buffMsg));

        const restoredMsg = new factory.Messages.MsgWitnessBlock(buffMsg);
        assert.isOk(restoredMsg.signature);
        assert.isOk(restoredMsg.publicKey);
        assert.equal(restoredMsg.publicKey, keyPair.publicKey);

        const restoredBlock = restoredMsg.block;
        assert.equal(block.hash, restoredBlock.hash);
        assert.isOk(Array.isArray(restoredBlock.txns));
        assert.equal(restoredBlock.txns.length, 1);

        const restoredTx = new factory.Transaction(restoredBlock.txns[0]);
        assert.isOk(restoredTx.equals(tx));
    });

});
