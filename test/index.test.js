const chai = require('chai');
// eslint-disable-next-line
const should = chai.should();
const utils = require('../utilities');

chai.use(require('chai-spies'));

const consoleLogSpy = chai.spy.on(console, 'log');

describe('dzfg - Download Zipball From Github', () => {
    describe('Utility Functions', () => {
        it('should have color options', (done) => {
            utils.colors.should.be.an('object');
            Object.keys(utils.colors).should.have.lengthOf(5);

            should.exist(utils.colors.blue);
            should.exist(utils.colors.bold);
            should.exist(utils.colors.invert);
            should.exist(utils.colors.red);
            should.exist(utils.colors.reset);

            done();
        });

        it('should create blank lines in the console', (done) => {
            utils.blankLine();

            consoleLogSpy.should.have.been.called.once.with('');

            done();
        });

        it('should fix time calculations', (done) => {
            const oneMilli = 1000000; // 1 million nanoseconds in 1 millisecond

            const milliseconds = utils.fixTime([0, oneMilli * 3]);
            milliseconds.should.eq('3.00 ms');

            const seconds = utils.fixTime([2, oneMilli * 750]);
            seconds.should.eq('2.75 s');

            const minutes = utils.fixTime([240, oneMilli * 12000]);
            minutes.should.eq('4.20 m');

            done();
        });

        it('should format bytes', (done) => {
            const zeroBytes = utils.formatBytes(0);
            zeroBytes.should.eq('0 Bytes');

            const someBytes = utils.formatBytes(512);
            someBytes.should.eq('512 Bytes');

            const kilobytes = utils.formatBytes(2048);
            kilobytes.should.eq('2.00 KiB');

            const megabytes = utils.formatBytes(44480594);
            megabytes.should.eq('42.42 MiB');

            const gigabytes = utils.formatBytes(3382300000);
            gigabytes.should.eq('3.15 GiB');

            const terabytes = utils.formatBytes(76328100000000);
            terabytes.should.eq('69.42 TiB');

            done();
        });

        it('should be able to ask the user questions in the console', (done) => {
            const readline = chai.spy.interface({
                question: (q, a) => {
                    q.should.eq('Test: ');
                    a('neat');
                },
                close: chai.spy()
            });

            utils.question(
                'Test',
                (a) => {
                    a.should.eq('neat');
                },
                {
                    createInterface: (input) => {
                        input.should.have.property('input', process.stdin);
                        input.should.have.property('output', process.stdout);

                        return readline;
                    }
                }
            );

            readline.close.should.have.been.called.once;

            done();
        });
    });
});
