/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015, blue.chu
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of blue.chu nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL blue.chu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

import protocol from './constants';
import numbers from './numbers';
import * as net from 'net';
import * as parser from './parser';

const empty = Buffer.allocUnsafe(0);
const zeroBuf = Buffer.from([0]);
const nextTick = process.nextTick;

const numCache = numbers.cache;
const generateNumber = numbers.generateNumber;
const generateCache = numbers.generateCache;
var writeNumber = writeNumberCached;
var toGenerate = true;

interface Generate {
	(packet: parser.Packet, stream: net.Socket): boolean;
	cacheNumbers: boolean;
}

const generate = <Generate>function(packet: parser.Packet, stream: net.Socket) {
	if (stream.cork) {
		stream.cork()
		nextTick(uncork, stream)
	}

	if (toGenerate) {
		toGenerate = false
		generateCache()
	}

	switch (packet.cmd) {
		case 'connect':
			return connect(packet, stream)
		case 'connack':
			return connack(packet, stream)
		case 'publish':
			return publish(packet, stream)
		case 'puback':
		case 'pubrec':
		case 'pubrel':
		case 'pubcomp':
		case 'unsuback':
			return confirmation(packet, stream)
		case 'subscribe':
			return subscribe(packet, stream)
		case 'suback':
			return suback(packet, stream)
		case 'unsubscribe':
			return unsubscribe(packet, stream)
		case 'pingreq':
		case 'pingresp':
		case 'disconnect':
			return emptyPacket(packet, stream)
		default:
			stream.emit('error', new Error('Unknown command'))
			return false
	}
};

/**
 * Controls numbers cache.
 * Set to "false" to allocate buffers on-the-flight instead of pre-generated cache
 */
Object.defineProperty(generate, 'cacheNumbers', {
	get() {
		return writeNumber === writeNumberCached;
	},
	set(value: boolean) {
		if (value) {
			if (!numCache || Object.keys(numCache).length === 0) toGenerate = true
			writeNumber = writeNumberCached
		} else {
			toGenerate = false
			writeNumber = writeNumberGenerated
		}
	}
});

export default generate;

function uncork (stream: net.Socket) {
	stream.uncork()
}

function connect (opts: parser.Packet, stream: net.Socket) {
	var protocolId = opts.protocolId || 'MQTT'
	var protocolVersion = opts.protocolVersion || 4
	var will = opts.will
	var clean = opts.clean
	var keepalive = opts.keepalive || 0
	var clientId = opts.clientId || ''
	var username = opts.username
	var password = opts.password

	if (clean === undefined) clean = true

	var length = 0

	// Must be a string and non-falsy
	if (!protocolId ||
		 (typeof protocolId !== 'string' && !Buffer.isBuffer(protocolId))
	) {
		stream.emit('error', new Error('Invalid protocolId'))
		return false
	} else {
		length += protocolId.length + 2
	}

	// Must be 3 or 4
	if (protocolVersion !== 3 && protocolVersion !== 4) {
		stream.emit('error', new Error('Invalid protocol version'))
		return false
	} else length += 1

	// ClientId might be omitted in 3.1.1, but only if cleanSession is set to 1
	if ((typeof clientId === 'string' || Buffer.isBuffer(clientId)) &&
		 (clientId || protocolVersion === 4) && (clientId || clean)) {
		length += clientId.length + 2
	} else {
		if (protocolVersion < 4) {
			stream.emit('error', new Error('clientId must be supplied before 3.1.1'))
			return false
		}
		if (!clean) {
			stream.emit('error', new Error('clientId must be given if cleanSession set to 0'))
			return false
		}
	}

	// Must be a two byte number
	if (typeof keepalive !== 'number' ||
			keepalive < 0 ||
			keepalive > 65535 ||
			keepalive % 1 !== 0) {
		stream.emit('error', new Error('Invalid keepalive'))
		return false
	} else length += 2

	// Connect flags
	length += 1

	// If will exists...
	if (will) {
		// It must be an object
		if (typeof will !== 'object') {
			stream.emit('error', new Error('Invalid will'))
			return false
		}
		// It must have topic typeof string
		if (!will.topic || typeof will.topic !== 'string') {
			stream.emit('error', new Error('Invalid will topic'))
			return false
		} else {
			length += Buffer.byteLength(will.topic) + 2
		}

		// Payload
		if (will.payload && will.payload) {
			if (will.payload.length >= 0) {
				if (typeof will.payload === 'string') {
					length += Buffer.byteLength(will.payload) + 2
				} else {
					length += will.payload.length + 2
				}
			} else {
				stream.emit('error', new Error('Invalid will payload'))
				return false
			}
		} else {
			length += 2
		}
	}

	// Username
	var providedUsername = false
	if (username != null) {
		if (isStringOrBuffer(username)) {
			providedUsername = true
			length += Buffer.byteLength(username) + 2
		} else {
			stream.emit('error', new Error('Invalid username'))
			return false
		}
	}

	// Password
	if (password != null) {
		if (!providedUsername) {
			stream.emit('error', new Error('Username is required to use password'))
			return false
		}

		if (isStringOrBuffer(password)) {
			length += byteLength(password) + 2
		} else {
			stream.emit('error', new Error('Invalid password'))
			return false
		}
	}

	// Generate header
	stream.write(protocol.CONNECT_HEADER)

	// Generate length
	writeLength(stream, length)

	// Generate protocol ID
	writeStringOrBuffer(stream, protocolId)
	stream.write(
		protocolVersion === 4 ? protocol.VERSION4 : protocol.VERSION3
	)

	// Connect flags
	var flags = 0
	flags |= (username != null) ? protocol.USERNAME_MASK : 0
	flags |= (password != null) ? protocol.PASSWORD_MASK : 0
	flags |= (will && will.retain) ? protocol.WILL_RETAIN_MASK : 0
	flags |= (will && will.qos) ? will.qos << protocol.WILL_QOS_SHIFT : 0
	flags |= will ? protocol.WILL_FLAG_MASK : 0
	flags |= clean ? protocol.CLEAN_SESSION_MASK : 0

	stream.write(Buffer.from([flags]))

	// Keepalive
	writeNumber(stream, keepalive)

	// Client ID
	writeStringOrBuffer(stream, clientId)

	// Will
	if (will) {
		writeString(stream, will.topic)
		writeStringOrBuffer(stream, will.payload)
	}

	// Username and password
	if (username != null) {
		writeStringOrBuffer(stream, username)
	}
	if (password != null) {
		writeStringOrBuffer(stream, password)
	}
	// This is a small packet that happens only once on a stream
	// We assume the stream is always free to receive more data after this
	return true
}

function connack (opts: parser.Packet, stream: net.Socket) {
	var rc = opts.returnCode

	// Check return code
	if (typeof rc !== 'number') {
		stream.emit('error', new Error('Invalid return code'))
		return false
	}

	stream.write(protocol.CONNACK_HEADER)
	writeLength(stream, 2)
	stream.write(opts.sessionPresent ? protocol.SESSIONPRESENT_HEADER : zeroBuf)

	return stream.write(Buffer.from([rc]))
}

function publish (opts: parser.Packet, stream: net.Socket) {

	var qos = opts.qos || 0
	var retain = opts.retain ? protocol.RETAIN_MASK : 0
	var topic = opts.topic
	var payload = opts.payload || empty
	var id = opts.messageId || 0;

	var length = 0

	// Topic must be a non-empty string or Buffer
	if (typeof topic === 'string')
		length += Buffer.byteLength(topic) + 2
	else if (Buffer.isBuffer(topic))
		length += topic.length + 2
	else {
		stream.emit('error', new Error('Invalid topic'))
		return false
	}

	// Get the payload length
	if (!Buffer.isBuffer(payload)) length += Buffer.byteLength(payload)
	else length += payload.length

	// Message ID must a number if qos > 0
	if (qos && typeof id !== 'number') {
		stream.emit('error', new Error('Invalid messageId'))
		return false
	} else if (qos) length += 2

	// Header
	stream.write(protocol.PUBLISH_HEADER[qos][opts.dup ? 1 : 0][retain ? 1 : 0])

	// Remaining length
	writeLength(stream, length)

	// Topic
	writeNumber(stream, byteLength(topic))
	stream.write(topic)

	// Message ID
	if (qos > 0) writeNumber(stream, id)

	// Payload
	return stream.write(payload)
}

/* Puback, pubrec, pubrel and pubcomp */
function confirmation (opts: parser.Packet, stream: net.Socket) {
	type T = 'unsuback' | 'puback' | 'pubcomp' | 'pubrel' | 'pubrec';
	var type = <T>opts.cmd || 'puback';
	var id = opts.messageId
	var dup = (opts.dup && type === 'pubrel') ? protocol.DUP_MASK : 0;
	var qos = 0

	if (type === 'pubrel')
		qos = 1;

	// Check message ID
	if (typeof id !== 'number') {
		stream.emit('error', new Error('Invalid messageId'))
		return false
	}

	// Header
	stream.write(protocol.ACKS[type][qos][dup][0])

	// Length
	writeLength(stream, 2)

	// Message ID
	return writeNumber(stream, id)
}

function subscribe (opts: parser.Packet, stream: net.Socket) {
	var dup = opts.dup ? protocol.DUP_MASK : 0
	var id = opts.messageId
	var subs = opts.subscriptions

	var length = 0

	// Check message ID
	if (typeof id !== 'number') {
		stream.emit('error', new Error('Invalid messageId'))
		return false
	} else length += 2

	// Check subscriptions
	if (typeof subs === 'object' && subs.length) {
		for (var i = 0; i < subs.length; i += 1) {
			var itopic = subs[i].topic
			var iqos = subs[i].qos

			if (typeof itopic !== 'string') {
				stream.emit('error', new Error('Invalid subscriptions - invalid topic'))
				return false
			}
			if (typeof iqos !== 'number') {
				stream.emit('error', new Error('Invalid subscriptions - invalid qos'))
				return false
			}

			length += Buffer.byteLength(itopic) + 2 + 1
		}
	} else {
		stream.emit('error', new Error('Invalid subscriptions'))
		return false
	}

	// Generate header
	stream.write(protocol.SUBSCRIBE_HEADER[1][dup ? 1 : 0][0])

	// Generate length
	writeLength(stream, length)

	// Generate message ID
	writeNumber(stream, id)

	var result = true

	// Generate subs
	for (var j = 0; j < subs.length; j++) {
		var sub = subs[j]
		var jtopic = sub.topic
		var jqos = sub.qos

		// Write topic string
		writeString(stream, jtopic)

		// Write qos
		result = stream.write(protocol.QOS[jqos])
	}

	return result
}

function suback(opts: parser.Packet, stream: net.Socket) {
	var id = opts.messageId
	var granted = opts.granted

	var length = 0

	// Check message ID
	if (typeof id !== 'number') {
		stream.emit('error', new Error('Invalid messageId'))
		return false
	} else length += 2

	// Check granted qos vector
	if (typeof granted === 'object' && granted.length) {
		for (var i = 0; i < granted.length; i += 1) {
			if (typeof granted[i] !== 'number') {
				stream.emit('error', new Error('Invalid qos vector'))
				return false
			}
			length += 1
		}
	} else {
		stream.emit('error', new Error('Invalid qos vector'))
		return false
	}

	// header
	stream.write(protocol.SUBACK_HEADER)

	// Length
	writeLength(stream, length)

	// Message ID
	writeNumber(stream, id)

	return stream.write(Buffer.from(granted))
}

function unsubscribe(opts: parser.Packet, stream: net.Socket) {
	var id = opts.messageId
	var dup = opts.dup ? protocol.DUP_MASK : 0
	var unsubs = opts.unsubscriptions;
	var length = 0

	// Check message ID
	if (typeof id !== 'number') {
		stream.emit('error', new Error('Invalid messageId'))
		return false
	} else {
		length += 2
	}
	// Check unsubs
	if (typeof unsubs === 'object' && unsubs.length) {
		for (var i = 0; i < unsubs.length; i += 1) {
			if (typeof unsubs[i] !== 'string') {
				stream.emit('error', new Error('Invalid unsubscriptions'))
				return false
			}
			length += Buffer.byteLength(unsubs[i]) + 2
		}
	} else {
		stream.emit('error', new Error('Invalid unsubscriptions'))
		return false
	}

	// Header
	stream.write(protocol.UNSUBSCRIBE_HEADER[1][dup ? 1 : 0][0])

	// Length
	writeLength(stream, length)

	// Message ID
	writeNumber(stream, id)

	// Unsubs
	var result = true
	for (var j = 0; j < unsubs.length; j++) {
		writeString(stream, unsubs[j]);
		result = false;
	}

	return result
}

function emptyPacket(opts: parser.Packet, stream: net.Socket) {
	type T = 'pingreq' | 'pingresp' | 'disconnect';
	var cmd = <T>opts.cmd;
	return stream.write(protocol.EMPTY[cmd])
}

/**
 * calcLengthLength - calculate the length of the remaining
 * length field
 *
 * @api private
 */
function calcLengthLength (length: number) {
	if (length >= 0 && length < 128) return 1
	else if (length >= 128 && length < 16384) return 2
	else if (length >= 16384 && length < 2097152) return 3
	else if (length >= 2097152 && length < 268435456) return 4
	else return 0
}

function genBufLength (length: number) {
	var digit = 0
	var pos = 0
	var buffer = Buffer.allocUnsafe(calcLengthLength(length))

	do {
		digit = length % 128 | 0
		length = length / 128 | 0
		if (length > 0) digit = digit | 0x80

		buffer.writeUInt8(digit, pos++)
	} while (length > 0)

	return buffer
}

/**
 * writeLength - write an MQTT style length field to the buffer
 *
 * @param <Buffer> buffer - destination
 * @param <Number> pos - offset
 * @param <Number> length - length (>0)
 * @returns <Number> number of bytes written
 *
 * @api private
 */
const lengthCache: { [prop: number]: Buffer } = {};
function writeLength (stream: net.Socket, length: number) {
	var buffer = lengthCache[length]

	if (!buffer) {
		buffer = genBufLength(length)
		if (length < 16384)
			lengthCache[length] = buffer
	}

	stream.write(buffer)
}

/**
 * writeString - write a utf8 string to the buffer
 *
 * @param <Buffer> buffer - destination
 * @param <Number> pos - offset
 * @param <String> string - string to write
 * @return <Number> number of bytes written
 *
 * @api private
 */

function writeString(stream: net.Socket, string: string) {
	var strlen = Buffer.byteLength(string)
	writeNumber(stream, strlen)

	stream.write(string, 'utf8')
}

/**
 * writeNumber - write a two byte number to the buffer
 *
 * @param <Buffer> buffer - destination
 * @param <Number> pos - offset
 * @param <String> number - number to write
 * @return <Number> number of bytes written
 *
 * @api private
 */
function writeNumberCached(stream: net.Socket, number: number) {
	return stream.write(numCache[number])
}

function writeNumberGenerated(stream: net.Socket, number: number) {
	return stream.write(generateNumber(number))
}

/**
 * writeStringOrBuffer - write a String or Buffer with the its length prefix
 *
 * @param <Buffer> buffer - destination
 * @param <Number> pos - offset
 * @param <String> toWrite - String or Buffer
 * @return <Number> number of bytes written
 */
function writeStringOrBuffer (stream: net.Socket, toWrite: string | Buffer) {
	if (typeof toWrite === 'string') {
		writeString(stream, toWrite)
	} else if (toWrite) {
		writeNumber(stream, toWrite.length)
		stream.write(toWrite)
	} else writeNumber(stream, 0)
}

function byteLength(bufOrString: Buffer | string) {
	if (!bufOrString)
		return 0
	else if (bufOrString instanceof Buffer) 
		return bufOrString.length
	else
		return Buffer.byteLength(bufOrString)
}

function isStringOrBuffer (field: string | Buffer) {
	return typeof field === 'string' || field instanceof Buffer
}
