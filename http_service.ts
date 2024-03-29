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

import util from './util';
import {Cookie} from './cookie';
import {Service} from './service';
import {StaticService} from './static_service';
import {Session} from './session';
import * as http from 'http';
import * as zlib from 'zlib';
import {IncomingForm,IFileStream} from './incoming_form';
import {RuleResult} from './router';
import errno from './errno';

var StaticService_onAction = StaticService.prototype.onAction;

/**
 * @private
 */
function returnJSON(self: HttpService, data: any) {
	var type = self.server.getMime(self.jsonpCallback ? 'js' : 'json');
	try {
		var rev = JSON.stringify(data);
	} catch(err) {
		self.returnError(err);
		return;
	}
	if (self.jsonpCallback) {
		data = self.jsonpCallback + '(' + rev + ')';
	}
	return self.returnString(rev, type);
}

/** 
 * @class HttpService
 * @bases staticService::StaticService
 */
export class HttpService extends StaticService {

	private m_cookie: Cookie | undefined;
	private m_session: Session | undefined;
	private _id: number;
	private _st: number;

	/**
	 * @func markReturnInvalid() mark action return invalid
	 */
	markReturnInvalid() {
		this.markCompleteResponse();
	}

	/**
	 * site cookie
	 * @type {Cookie}
	 */
	get cookie(): Cookie {
		if (!this.m_cookie)
			this.m_cookie = new Cookie(this.request, this.response);
		return this.m_cookie;
	}

	get session(): Session {
		if (!this.m_session)
			this.m_session = new Session(this);
		return this.m_session;
	}

	/**
	 * ajax jsonp callback name
	 * @tpye {String}
	 */
	readonly jsonpCallback: string;

	/**
	 * post form
	 * @type {IncomingForm}
	 */
	form: IncomingForm | null = null;

	/**
	 * post form data
	 * @type {Object}
	 */
	readonly data: Dict;

	/**
	 * @constructor
	 * @arg req {http.IncomingMessage}
	 * @arg res {http.ServerResponse}
	 */
	constructor(req: http.IncomingMessage, res: http.ServerResponse) {
		super(req, res);
		this.jsonpCallback = this.params.callback || '';
		this.data = {};
		this._id = util.getId();
		this._st = Date.now();
	}

	/** 
	 * @overwrite
	 */
	onOptionsRequest(rule: RuleResult) {
		var self = this;
		if (self.server.allowOrigin == '*') {
			var access_headers = '';
			//'Content-Type,Access-Control-Allow-Headers,Authorization,X-Requested-With';
			var access_headers_req = self.request.headers['access-control-request-headers'];
			if (access_headers_req) {
				access_headers += access_headers_req;
			}
			self.response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
			self.response.setHeader('Access-Control-Allow-Headers', access_headers);
		}
		self.setDefaultHeader();
		self.response.writeHead(200);
		self.response.end();
	}

	/** 
	 * @overwrite
	 */
	async onAction(rule: RuleResult) {
		var self = this;
		var action = rule.action;

		/*
		 * Note:
		 * The network fault tolerance,
		 * the browser will cause strange the second request,
		 * this error only occurs on the server restart,
		 * the BUG caused by the request can not respond to
		 */

		//Filter private function
		if (/^_/.test(action)) { // private method, disable call
			return StaticService_onAction.call(this, rule);
		}
		
		var fn = (this as any)[action];

		if (action in HttpService.prototype) { // base method, disable call
			return self.returnError(Error.new(errno.ERR_FORBIDDEN_ACCESS));
		}
		if (!fn || typeof fn != 'function') {
			return StaticService_onAction.call(this, rule);
		}
		
		var handleCall = async function() {
			var auth: boolean = false;
			try {
				auth = await self.onAuth(rule);
			} catch(e) {
				console.warn('HttpService#action#1', 'auth error', e);
			}

			if (self.server.printLog) {
				console.log(`REQUEST  ID${self._id}`, ...(auth ? []: ['ILLEGAL ACCESS, onAuth']),
					self.pathname, self.headers, self.params, self.data);
			}

			if (!auth) {
				self.returnError(Error.new(errno.ERR_ILLEGAL_ACCESS));
				return;
			}

			var { service, action, ..._rule } = rule;
			var data = Object.assign({}, self.params, self.data, _rule);
			var err, r;
			try {
				r = await (self as any)[action](data);
			} catch(e) {
				err = e;
			}
			if (!self.isCompleteResponse || err) {
				if (err) {
					if (self.server.printLog) {
						console.warn('HttpService#action#2', err);
					}
					if (self.isCompleteResponse) {
						console.warn('HttpService#action#3', err);
						(self as any).m_markCompleteResponse = false;
					}
					self.returnError(err);
				} else {
					self.returnJSON(r);
				}
			}
		};

		if (this.request.method == 'POST') {
			try {
				this.form = this.onIncomingForm(rule);
			} catch(err) {
				return self.returnError(err);
			}
			let form = this.form;
			form.onEnd.on(function() {
				Object.assign(self.data, form.fields);
				Object.assign(self.data, form.files);
				handleCall();
			});
			form.parse();
		} else {
			this.request.on('end', handleCall);
		}
	}

	/**
	 * @func onIncomingForm(info) 传入表单
	 */
	onIncomingForm(rule: RuleResult) {
		return new IncomingForm(this);
	}

	/**
	 * @func hasAcceptFilestream(info) 接收文件流
	 */
	onAcceptFilestream(path: string, name: string, type: string): IFileStream | null {
		return null;
	}

	/**
	 * @func auth(info)
	 */
	onAuth(rule: RuleResult): Promise<boolean> | boolean {
		return true;
	}

	/**
	 * @fun returnData() return data to browser
	 * @arg type {String} #    MIME type
	 * @arg data {Object} #    data
	 */
	returnData(type: string, data: any): void {

		var self = this;
		var res = this.response;
		var ae = <string>this.request.headers['accept-encoding'];
		this.markCompleteResponse();

		this.setDefaultHeader();
		res.setHeader('Content-Type', type);

		if (typeof data == 'string' && 
				this.server.agzip && ae && ae.match(/gzip/i)) {
			zlib.gzip(data, function (err, data) {
				res.setHeader('Content-Encoding', 'gzip');
				res.writeHead(200);
				res.end(data);
				if (self.server.printLog)
					console.log(`RESPONSE ID${self._id}`, 'Time:', Date.now() - self._st, self.pathname);
			});
		} else {
			res.writeHead(200);
			res.end(data);

			if (self.server.printLog)
				console.log(`RESPONSE ID${self._id}`, 'Time:', Date.now() - self._st, self.pathname);
		}
	}

	/**
	 * @fun returnString # return string to browser
	 * @arg type {String} #    MIME type
	 * @arg str {String}
	 */
	returnString(str: string, type: string = 'text/plain'): void {
		return this.returnData(type + ';charset=utf-8', str);
	}

	/**
	 * @fun returnHtml # return html to browser
	 * @arg html {String}  
	 */
	returnHtml(html: string): void {
		var type = this.server.getMime('html');
		return this.returnString(html, type);
	}

	/**
	 * @fun rev # return data to browser
	 * @arg data {JSON}
	 */
	returnJSON(data: any): void {
		this.setNoCache();
		return returnJSON(this, { data: data, errno: 0, code: 0, st: new Date().valueOf() });
	}

	/**
	 * @fun rev # return data to browser
	 * @arg data {JSON}
	 */
	returnJSONNoWrap(data: any) {
		this.setNoCache();
		return returnJSON(this, data);
	}

	/**
	 * @fun returnError() return error to browser
	 * @arg [err] {Error} 
	 */
	returnError(err: any) {
		this.setNoCache();
		var accept = this.request.headers.accept || '';
		if (/text\/html|application\/xhtml/.test(accept)) {
			return this.returnHtmlError(err);
		} else {
			return this.returnJSONError(err);
		}
	}

	/**
	 * @func returnJSONError(err)
	 */
	returnJSONError(err: any) {
		err = Error.toJSON(err);
		err.st = new Date().valueOf();
		if ( !err.errno ) {
			err.errno = -1;
		}
		err.st = new Date().valueOf();
		return returnJSON(this, err);
	}

	/**
	 * @func returnHtmlError()
	 */
	returnHtmlError(err: any) {
		err = Error.toJSON(err);
		var msg = [];
		if (err.message) msg.push(err.message);
		if (err.errno) msg.push('Errno: ' + err.errno);
		if (err.exception) msg.push('Exception: ' + err.exception);
		if (err.path) msg.push('Path: ' + err.path);
		if (err.stack) msg.push(err.stack);
		var text = '<h4><pre style="color:#f00">' + msg.join('\n') + '</pre></h4>';
		if (err.description) {
			text += '<br/><h4>Description:</h4><br/>';
			text += err.description;
		}
		return this.returnErrorStatus(500, text);
	}

	// @end
}

/** 
 * @class HttpService
 */
export class Descriptors extends HttpService {

	descriptors() {
		let res: Dict = {};

		for (let key of this.server.services) {
			let service = this.server.getService(key);
			if (!/^(StaticService|fmt)$/.test(key) && key[0] != '_' && service.public) {
				let methods: string[] = [], events: string[] = [];
				let item = { type: service.type, methods, events };
				let self = service.prototype as any;

				Object.entries(Object.getOwnPropertyDescriptors(self)).forEach(([k, v])=>{
					if ( !/(^(constructor|auth|requestAuth)$)|(^(_|\$|m_))/i.test(k) ) {
						if (/^on[a-zA-Z]/.test(k)) { // event
							if (typeof v.value != 'function')
								events.push(k.substring(2));
						} else { // methods
							if (typeof v.value == 'function') {
								if (!self[`__internalapi_${k}`])
									methods.push(k);
							}
						}
					}
				});

				self = self.__proto__;

				while (self !== Service.prototype) {
					Object.entries(Object.getOwnPropertyDescriptors(self)).forEach(([k, v])=>{
						if (/^on[a-zA-Z]/.test(k) && typeof v.value != 'function') { // event notice
							events.push(k.substring(2));
						}
					});
					self = self.__proto__;
				}
				
				res[key] = item;
			}
		}

		return res;
	}

}
