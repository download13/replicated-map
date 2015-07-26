# replicated-map

ReplicatedMap your standard HashMap-type dealio, but with helper methods that make it easy to replicate it's state from one map to the next. Even across the network!


## Basic Map Example

```javascript
var ReplicatedMap = require('replicated-map');

var rm = new ReplicatedMap();

rm.set('testkey', 'somevalue');

console.log(rm.get('testkey')); // somevalue

rm.remove('testkey');

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

// All set and remove commands will be replicated to the follower
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


## Notes

The path of transmission must carry the messages IN ORDER. If the messages are out of order the accuracy of the replication cannot be guaranteed. Imagine doing `set key 3` and `set key 7`. If they are out of the order the older command may overwrite the newer one.

Please note, this is not an exact stand-in for the standard `Map` type. It's backed by an object and so it can on only take primitive values as keys (strings, numbers, booleans).
