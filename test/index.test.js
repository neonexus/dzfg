const chai = require('chai');
const spies = require('chai-spies');
// eslint-disable-next-line
const should = chai.should();
const utils = require('../utilities');

chai.use(spies);

describe('dzfg - Download Zipball From Github', () => {
    describe('Utility Functions', () => {
        it('should have color options', (done) => {
            utils.colors.should.be.an('object');
            utils.colors.length.should.eq(5);

            should.exist(utils.colors.blue);
            should.exist(utils.colors.bold);
            should.exist(utils.colors.invert);
            should.exist(utils.colors.red);
            should.exist(utils.colors.reset);

            done();
        });

        // it('should create blank lines in the console', (done) => {
        //
        // });
    });
});
