var each = require('foreach');

var EventEmitter = require('events').EventEmitter;

var hasOwnProperty = Object.prototype.hasOwnProperty;


function ReplicatedMap() {
	if(!(this instanceof ReplicatedMap)) {
		return new ReplicatedMap();
	}

	EventEmitter.call(this);

	// Bind so people can shortcut events handlers
	this.cmd = this.cmd.bind(this);

	this._state = Object.create(null);
}

ReplicatedMap.prototype = Object.create(EventEmitter.prototype);

ReplicatedMap.prototype.get = function(key) {
	return this._state[key];
};

ReplicatedMap.prototype.has = function(key) {
	return hasOwnProperty.call(this._state, key);
};

ReplicatedMap.prototype.forEach = function(fn) {
	each(this._state, fn);
};

ReplicatedMap.prototype.set = function(key, value) {
	var oldValue = this._state[key];

	this._state[key] = value;

	this.emit('set', key, value, oldValue);
};

ReplicatedMap.prototype.remove = function(key) {
	var oldValue = this._state[key];

	delete this._state[key];

	this.emit('remove', key, oldValue);
};

// This should be called by a function bringing in new
// data from a remote location
ReplicatedMap.prototype.cmd = function(cmd, args) {
	if(cmd === 'set' || cmd === 'remove') {
		this[cmd].apply(this, args);
	}
};

// fn will be called repeatedly with (cmd, args)
// until the entire current state of this map has
// been replicated at the output (whatever that might be)
// of fn
ReplicatedMap.prototype.replicate = function(fn) {
	var self = this;

	each(self._state, function(value, key) {
		fn('set', [key, value]);
	});

	function set(key, value) {
		fn('set', [key, value]);
	}

	function remove(key) {
		fn('remove', [key]);
	}

	self.on('set', set);
	self.on('remove', remove);

	// Call this to stop replicating
	return function() {
		self.removeListener('set', set);
		self.removeListener('remove', remove);
	};
};


module.exports = ReplicatedMap;
