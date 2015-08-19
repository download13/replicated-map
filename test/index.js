var ReplicatedMap = require('../');

var assert = require('assert');


describe('ReplicatedMap', function() {
	it('is creatable', function() {
		var el = new ReplicatedMap();

		assert(el instanceof ReplicatedMap);
	});

	it('has a get method', function() {
		var el = new ReplicatedMap();

		assert(el.get);
	});

	it('has a has method', function() {
		var el = new ReplicatedMap();

		assert(el.has);
	});

	it('has a keys method', function() {
		var el = new ReplicatedMap();

		assert(el.keys);
	});

	it('has a values method', function() {
		var el = new ReplicatedMap();

		assert(el.values);
	});

	it('has a entries method', function() {
		var el = new ReplicatedMap();

		assert(el.entries);
	});

	it('has a forEach method', function() {
		var el = new ReplicatedMap();

		assert(el.forEach);
	});

	it('has an replicate method', function() {
		var el = new ReplicatedMap();

		assert(el.replicate);
	});

	it('has an mutate method', function() {
		var el = new ReplicatedMap();

		assert(el.mutate);
	});

	it('has a set method', function() {
		var el = new ReplicatedMap();

		assert(el.set);
	});

	it('has a delete method', function() {
		var el = new ReplicatedMap();

		assert(el.delete);
	});

	it('has a clear method', function() {
		var el = new ReplicatedMap();

		assert(el.clear);
	});

	it('can initialize with a map', function() {
		var el = new ReplicatedMap(new Map([[0, 4], ['t', 'g']]));

		assert.equal(el.get(0), 4);
		assert.equal(el.get('t'), 'g');
	});

	it('can initialize with an object', function() {
		var el = new ReplicatedMap({t: 'g', 0: 4});

		assert.equal(el.get('0'), 4);
		assert.equal(el.get('t'), 'g');
	});

	it('can set', function() {
		var el = new ReplicatedMap();

		el.set('test', 'val');

		assert.equal(el.get('test'), 'val');
	});

	it('can delete', function() {
		var el = new ReplicatedMap([false, true]);

		el.set('test', 'val');

		el.delete('test');

		assert(!el.has('test'));
		assert.equal(el.get('test'), undefined);
	});

	it('can clear', function() {
		var el = new ReplicatedMap({t: 'g', g: 4});

		el.clear();

		assert(!el.has('t'));
		assert(!el.has('g'));
		assert.deepEqual(el.keys(), []);
	});

	it('emits events when listened to', function(done) {
		var el = new ReplicatedMap({t: 'g', g: 4});

		var stage = 0;
		el.replicate(function(type, key, value) {
			switch(stage) {
			case 0:
				assert.equal(type, 'add');
				assert.equal(key, 't');
				assert.equal(value, 'g');
				stage++;
				break;
			case 1:
				assert.equal(type, 'add');
				assert.equal(key, 'g');
				assert.equal(value, 4);
				done();
			}
		});
	});

	it('stops emitting events when no longer listened too', function(done) {
		var el = new ReplicatedMap();

		var stage = 0;
		var removeListener = el.replicate(function(type, key, value) {
			switch(stage) {
			case 0:
				assert.equal(type, 'add');
				assert.equal(key, 't');
				assert.equal(value, 'g');
				stage++;
				break;
			case 1:
				assert(false);
			}
		});

		el.set('t', 'g');

		removeListener();

		el.set('t', 4);

		setTimeout(function() {
			done();
		}, 10);
	});

	it('emits an event when set', function(done) {
		var el = new ReplicatedMap();

		el.replicate(function(type, index, item) {
			assert.equal(type, 'add');
			assert.equal(index, 't');
			assert.equal(item, 4);

			done();
		});

		setTimeout(function() {
			el.set('t', 4);
		}, 10);
	});

	it('emits an event when deleted', function(done) {
		var el = new ReplicatedMap({t: 4});

		el.replicate(function(type, index, item) {
			if(type === 'add') return;

			assert.equal(type, 'remove');
			assert.equal(index, 't');
			assert.equal(item, 4);

			done();
		});

		el.delete('t');
	});

	it('emits event(s) when cleared', function(done) {
		var el = new ReplicatedMap({t: 0, g: 1});

		var stage = 0;
		el.replicate(function(type, key, value) {
			if(type === 'add') return;

			switch(stage) {
			case 0:
				assert.equal(type, 'remove');
				assert.equal(key, 't');
				assert.equal(value, 0);
				stage++;
				break;
			case 1:
				assert.equal(type, 'remove');
				assert.equal(key, 'g');
				assert.equal(value, 1);
				done();
			}
		});

		el.clear();
	});

	it('accepts mutations from a compatible map', function() {
		var el = new ReplicatedMap({v: 5, t: 0, g: 1, h: 'got'});

		el.mutate('remove', 't');
		el.mutate('remove', 'g');

		assert(!el.has('t'));
		assert(!el.has('g'));

		el.mutate('add', 'b', 'y');
		el.mutate('add', false, 'ten');

		assert.equal(el.get('v'), 5);
		assert.equal(el.get('h'), 'got');
		assert.equal(el.get('b'), 'y');
		assert.equal(el.get(false), 'ten');
	});
});
