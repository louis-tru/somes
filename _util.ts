/* ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2015, xuewen.chu
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of xuewen.chu nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL xuewen.chu BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK ***** */

const base64_chars =
	'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');

if (typeof __requireNgui__ == 'function') {
	require('ngui/_ext');
} else {
	require('./_ext');
}

const haveNode: boolean = !!globalThis.process;
const haveNgui: boolean = !!globalThis.__requireNgui__;
const haveWeb: boolean = !!globalThis.document;

type Platform = 'aix'
| 'android'
| 'darwin'
| 'freebsd'
| 'linux'
| 'openbsd'
| 'sunos'
| 'win32'
| 'cygwin'
| 'netbsd' | 'web';

var argv: string[];
var webFlags: WebPlatformFlags | null = null;
var platform: Platform;
var exit: (code?: number)=>void;

export interface WebPlatformFlags {
	windows: boolean,
	windowsPhone: boolean,
	linux: boolean,
	android: boolean,
	macos: boolean,
	ios: boolean,
	iphone: boolean,
	ipad: boolean,
	ipod: boolean,
	mobile: boolean,
	touch: boolean,
	trident: boolean,
	presto: boolean,
	webkit: boolean,
	gecko: boolean
}

if (haveNgui) {
	var _util = __requireNgui__('_util');
	platform = <Platform>_util.platform;
	argv = _util.argv;
	exit = _util.exit;
} else if (haveNode) {
	platform = <Platform>process.platform;
	argv = process.argv;
	exit = process.exit;
} else if (haveWeb) {
	let USER_AGENT = navigator.userAgent;
	let mat = USER_AGENT.match(/\(i[^;]+?; (U; )?CPU.+?OS (\d).+?Mac OS X/);
	let ios = !!mat;
	webFlags = {
		windows: USER_AGENT.indexOf('Windows') > -1,
		windowsPhone: USER_AGENT.indexOf('Windows Phone') > -1,
		linux: USER_AGENT.indexOf('Linux') > -1,
		android: /Android|Adr/.test(USER_AGENT),
		macos: USER_AGENT.indexOf('Mac OS X') > -1,
		ios: ios,
		iphone: USER_AGENT.indexOf('iPhone') > -1,
		ipad: USER_AGENT.indexOf('iPad') > -1,
		ipod: USER_AGENT.indexOf('iPod') > -1,
		mobile: USER_AGENT.indexOf('Mobile') > -1 || 'ontouchstart' in globalThis,
		touch: 'ontouchstart' in globalThis,
		//--
		trident: !!USER_AGENT.match(/Trident|MSIE/),
		presto: !!USER_AGENT.match(/Presto|Opera/),
		webkit: 
			USER_AGENT.indexOf('AppleWebKit') > -1 || 
			!!globalThis.WebKitCSSMatrix,
		gecko:
			USER_AGENT.indexOf('Gecko') > -1 &&
			USER_AGENT.indexOf('KHTML') == -1, // || !!globalThis.MozCSSKeyframeRule
	};
	platform = <Platform>'web';
	argv = [location.origin + location.pathname].concat(location.search.substr(1).split('&'));
	exit = ()=>{ window.close() }
} else {
	throw new Error('no support');
}

/**
	* @fun hash # gen hash value
	* @arg input {Object} 
	* @ret {String}
	*/
function hash(data: any): string {
	var value = Object.hashCode(data);
	var retValue = '';
	do
		retValue += base64_chars[value & 0x3F];
	while ( value >>>= 6 );
	return retValue;
}

const nextTick: <A extends any[], R>(cb: (...args: A) => R, ...args: A) => void = 
haveNode ? process.nextTick: function(cb, ...args): void {
	if (typeof cb != 'function')
		throw new Error('callback must be a function');
	if (haveNgui) {
		_util.nextTick(()=>cb(...args));
	} else {
		setImmediate(()=>cb(...args));
	}
};

function unrealized() {
	throw new Error('Unrealized function');
}

export default {
	version: unrealized,
	addNativeEventListener: unrealized,
	removeNativeEventListener: unrealized,
	gc: unrealized,
	runScript: unrealized,
	hashCode: Object.hashCode,
	hash: hash,
	nextTick: nextTick,
	platform: platform,
	haveNode: haveNode,
	haveNgui: haveNgui,
	haveWeb: haveWeb,
	argv: argv,
	webFlags: webFlags,
	exit: exit,
	unrealized: unrealized,
}
