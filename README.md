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
rm.replicate(function(type, key, value) {
	// This function will be called every time
	// there's a new command to replicate

	// Just pretend we set this network connection up earlier
	network.write(JSON.stringify([type, key, value]));
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

	rm.mutate(message[0], message[1], message[2]);
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

You may also listen to changes in the map for arbitrary purposes.

```javascript
map.replicate(function(type, key, value) {
	switch(type) {
	case 'add':
		// Do something with the added key/value pair
		break;
	case 'remove':
		// A key/value pair has been deleted
	}
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
* `.mutate(type, key, value)` - Performs the specified mutate operation on the map
* `.replicate(fn)` - Calls fn(type, key, value) once for each mutate operating needed to replicate the state of this map to another map



## Notes

The method used to stream data must carry the messages IN ORDER. If the messages are out of order the accuracy of the replication cannot be guaranteed. Imagine doing `set key 3` and `set key 7`. If they are out of the order the older command may overwrite the newer one.

Do not call the mutating methods on a following map, this will result in the follower being out of sync with the leader.

This module depends on `Map` and `Set` being available, so if you are targeting a browser without support you may need to `require('core-js/fn/map')` and `require('core-js/fn/set')` the [polyfill](https://github.com/zloirock/core-js).
