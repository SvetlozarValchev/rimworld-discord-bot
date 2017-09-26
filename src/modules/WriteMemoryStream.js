const stream = require('stream');
const util = require('util');
const Writable = stream.Writable ||
  require('readable-stream').Writable;

class WriteMemoryStream extends Writable {
  constructor(options) {
    super(options);

    this.memoryBuffer = new Buffer('');
  }

  /**
   * @param {Buffer|Number|Array|String} chunk
   * @param {String?} enc
   * @param {Function} callback
   * @private
   */
  _write(chunk, enc, callback) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : new Buffer(chunk, enc);

    this.memoryBuffer = Buffer.concat([this.memoryBuffer, buffer]);

    callback();
  }

  /**
   * @returns {Buffer}
   */
  getMemoryBuffer() {
    return this.memoryBuffer;
  }
}

module.exports = WriteMemoryStream;
