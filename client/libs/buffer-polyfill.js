/**
 * Simple Buffer polyfill for browsers
 * This provides just enough Buffer implementation for Colyseus to work
 */
(function(global) {
    // Check if Buffer is already defined
    if (typeof global.Buffer !== 'undefined') return;

    const K_MAX_LENGTH = 0x7fffffff;

    function createBuffer(length) {
        if (length > K_MAX_LENGTH) {
            throw new RangeError('The value "' + length + '" is invalid for option "size"');
        }
        const buf = new Uint8Array(length);
        Object.setPrototypeOf(buf, Buffer.prototype);
        return buf;
    }

    class Buffer extends Uint8Array {
        constructor(arg, encodingOrOffset, length) {
            if (typeof arg === 'number') {
                super(arg);
            } else if (typeof arg === 'string') {
                const buf = new Uint8Array(Buffer.byteLength(arg, encodingOrOffset));
                const len = buf.length;
                for (let i = 0; i < len; ++i) {
                    buf[i] = arg.charCodeAt(i);
                }
                super(buf);
            } else if (arg instanceof ArrayBuffer || ArrayBuffer.isView(arg)) {
                if (arg instanceof Buffer) {
                    super(arg);
                } else {
                    super(arg, encodingOrOffset, length);
                }
            } else {
                throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object');
            }
        }

        static alloc(size) {
            return createBuffer(size);
        }

        static from(value, encodingOrOffset, length) {
            if (typeof value === 'string') {
                return new Buffer(value, encodingOrOffset);
            }
            if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) {
                return new Buffer(value, encodingOrOffset, length);
            }
            throw new TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object');
        }

        static isBuffer(obj) {
            return obj != null && obj instanceof Buffer;
        }

        static byteLength(string) {
            return string.length;
        }

        static concat(list, totalLength) {
            if (totalLength === undefined) {
                totalLength = 0;
                for (const buf of list) {
                    totalLength += buf.length;
                }
            }
            const result = createBuffer(totalLength);
            let pos = 0;
            for (const buf of list) {
                const len = buf.length;
                for (let i = 0; i < len; ++i) {
                    result[pos++] = buf[i];
                }
            }
            return result;
        }

        write(string, offset) {
            offset = offset || 0;
            const length = string.length;
            for (let i = 0; i < length; i++) {
                this[offset + i] = string.charCodeAt(i);
            }
            return length;
        }

        toString(encoding, start, end) {
            start = start || 0;
            end = end || this.length;
            let result = '';
            for (let i = start; i < end; i++) {
                result += String.fromCharCode(this[i]);
            }
            return result;
        }

        slice(start, end) {
            const newBuf = super.slice(start, end);
            Object.setPrototypeOf(newBuf, Buffer.prototype);
            return newBuf;
        }
    }

    global.Buffer = Buffer;
})(typeof window !== 'undefined' ? window : global);
