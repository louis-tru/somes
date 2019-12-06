
var utils = require('../util');
var cli = require('./cli');
var log = require('../log');

// require('../ws/cli/conv').USE_GZIP_DATA = false;
// log.defaultConsole.makeDefault();

var host = utils.options.host;

if (host) {
	host = `192.168.${host}`;
} else {
	host = `127.0.0.1`;
}

async function test() {
	var a = new cli.FMTClient('a', `fmt://${host}:8091/`);
	var b = new cli.FMTClient('b', `fmt://${host}:8092/`);
	var c = new cli.FMTClient('c', `fmt://${host}:8093/`);
	var d = new cli.FMTClient('d', `fmt://${host}:8094/`);
	var e = new cli.FMTClient('e', `fmt://${host}:8094/`);

	var st = Date.now();
	var _resolve;

	function log(e) {
		var now = Date.now();
		console.log(e.data, now - st);
		st = now;
		if (_resolve) {
			_resolve();
			_resolve = null;
		}
	}
	
	var limit = true;

	function trigger(that, event, data) {
		return new Promise((resolve,reject)=>{
			if (limit) {
				if (_resolve)
					return reject('err');
				_resolve = resolve;
			}
			that.trigger(event, data).then(e=>limit||resolve()).catch(reject);
		});
	}

	a.addEventListener('A', log);
	b.addEventListener('A', log);
	c.addEventListener('A', log);
	d.addEventListener('A', log);
	e.addEventListener('A', log);

	await utils.sleep(1000);

	for (var i = 0; i < 1e6; i++) {
		try {
			await trigger(b.that('a'), 'A', 'A-' + i);
			await trigger(a.that('b'), 'A', 'B-' + i);
			await trigger(a.that('c'), 'A', 'C-' + i);
			await trigger(c.that('d'), 'A', 'D-' + i);
			await trigger(b.that('e'), 'A', 'E-' + i);
		} catch(err) {
			console.error(err);
		}
	}

	console.log('ok');
}

test();