# replicated-map

ReplicatedMap is your standard HashMap-type dealio, but with helper methods that make it easy to replicate it's state from one map to the next. Even across the network!


## Basic Map Example

```javascript
var ReplicatedMap = require('replicated-map');

var rm = new ReplicatedMap();

rm.set('testkey', 'somevalue');

console.log(rm.get('testkey')); // somevalue

rm.delete('testkey');

console.log(rm.has('testkey')); // false
```

Pretty standard stuff for a map type. Here's what makes this one interesting though.


## Replication Example

### Leader

```javascript
// Can also be called without new
var rm = require('replicated-map')();

rm.set('some_existing', 'value');

// Start replicating
rm.replicate(function(cmd, args) {
	// This function will be called every time
	// there's a new command to replicate

	// Just pretend we set this network connection up earlier
	network.write(JSON.stringify({
		cmd: cmd,
		args: args
	}));
});

// All set and delete commands will be replicated to the follower
// keeping it in a consistent state with this one
rm.set('another_new', 'val');
```

### Follower

```javascript
var rm = require('replicated-map')();

// Again, just pretend
network.on('data', function(message) {
	message = JSON.parse(message);

	rm.cmd(message.cmd, message.args);
});

// rm will now follow the leader at the other end of the
// network stream and stay in sync with it

// Give it some time to replicate
setTimeout(function() {
	console.log(rm.get('some_existing')); // value

	console.log(rm.get('another_new')); // val
}, 100);
```


## Events

The map is also an event emitter which emits the following events.

```javascript
rm.on('set', function(value, key, oldValue) {
	// Update some state or something
	console.log(key + ' is now ' + value + ' but was ' + oldValue);
});

rm.on('delete', function(key, oldValue) {
	console.log(key + ' has been deleted but was ' + oldValue);
});

rm.on('clear', function() {
	console.log('Oh no! Everything is gone!');
});
```

## Methods

* `.has(key)` - Returns whether or not the map contains a key
* `.get(key)` - Returns value of key
* `.set(key, value)` - Set value of key
* `.delete(key)` - Removes a key from the map
* `.clear()` - Clears all key/value pairs from the map
* `.keys()` - Returns an array of the map keys
* `.values()` - Returns an array of the map values
* `.forEach(fn)` - fn(value, key) is executed once for each key/value pair
* `.cmd(command, arguments)` - Executes the given command on this map
* `.replicate(fn)` - Calls fn(cmd, args) once for each command needed to replicate the state of this map to another map



## Notes

The method used to stream data must carry the messages IN ORDER. If the messages are out of order the accuracy of the replication cannot be guaranteed. Imagine doing `set key 3` and `set key 7`. If they are out of the order the older command may overwrite the newer one.

Please note, this is not an exact stand-in for the standard `Map` type. It's backed by an object and so it can on only take primitive values as keys (strings, numbers, booleans).

Do not call the mutating methods on a following map, this will result in the follower being out of sync with the leader.
