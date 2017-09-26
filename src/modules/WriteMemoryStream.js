const stream = require('stream');
const util = require('util');
const Writable = stream.Writable ||
  require('readable-stream').Writable;

class WriteMemoryStream extends Writable {
  constructor(options) {
    super(options);

    this.memoryBuffer = new Buffer('');
  }

  _write(chunk, enc, cb) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);

    this.memoryBuffer = Buffer.concat([this.memoryBuffer, buffer]);

    cb();
  }

  getMemoryBuffer() {
    return this.memoryBuffer;
  }
}

module.exports = WriteMemoryStream;