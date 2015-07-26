var ReplicatedMap = require('../index');

var assert = require('assert');

var through2 = require('through2');

var EventEmitter = require('events').EventEmitter;


describe('ReplicatedMap', function() {
	it('is creatable', function() {
		var rm1 = new ReplicatedMap();

		var rm2 = ReplicatedMap();

		assert(rm1 instanceof ReplicatedMap);

		assert(rm2 instanceof ReplicatedMap);
	});

	it('sets/gets', function() {
		var rm = new ReplicatedMap();

		rm.set('teststring', 'string');

		rm.set('testnumber', 0);

		rm.set('testbool', true);

		rm.set('testarray', [5]);

		rm.set('testobject', {t: 1});

		assert.deepEqual(rm._state, {
			teststring: 'string',
			testnumber: 0,
			testbool: true,
			testarray: [5],
			testobject: {t: 1}
		});


		assert.equal(rm.get('teststring'), 'string');

		assert.equal(rm.get('testnumber'), 0);

		assert.equal(rm.get('testbool'), true);

		assert.deepEqual(rm.get('testarray'), [5]);

		assert.deepEqual(rm.get('testobject'), {t: 1});
	});

	it('removes/has', function() {
		var rm = new ReplicatedMap();

		rm.set('test', true);

		assert(rm.has('test'));

		rm.remove('test');

		assert(!rm.has('test'));
	});

	it('takes cmds', function() {
		var rm = new ReplicatedMap();

		rm.cmd('set', ['j', 'k']);

		assert.equal(rm._state.j, 'k');

		rm.cmd('remove', ['j']);

		assert.deepEqual(rm._state, {});
	});

	it('replicates cmds', function(done) {
		var rmSender = new ReplicatedMap();

		var rmRecver = new ReplicatedMap();


		rmSender.set('existing', true);

		// Use a stream to simulate a network connection
		var s = pretendNetwork();

		s.on('data', function(msg) {
			rmRecver.cmd(msg.cmd, msg.args);
		});

		var stop = rmSender.replicate(function(cmd, args) {
			s.write({cmd: cmd, args: args});
		});

		rmSender.set('new', true);


		setTimeout(function() {
			assert.deepEqual(rmRecver._state, {
				existing: true,
				new: true
			});

			done();
		}, 50);
	});
});


function pretendNetwork() {
	return through2.obj(function(item, enc, next) {
		var self = this;

		setTimeout(function() {
			self.push(item);

			next();
		}, 5);
	});
}
