export default class ReplicatedMap {
	constructor(map) {
		this.mutate = this.mutate.bind(this);

		this._handlers = new Set();

		this._state = new Map();

		if(map instanceof Map) {
			map.forEach((value, key) => {
				this._state.set(key, value);
			});
		} else if(typeof map === 'object') {
			Object.keys(map).forEach(key => {
				this._state.set(key, map[key]);
			});
		}
	}

	get(key) {
		return this._state.get(key);
	}

	has(key) {
		return this._state.has(key);
	}

	keys() {
		return this._state.keys();
	}

	values() {
		return this._state.values();
	}

	entries() {
		return this._state.entries();
	}

	forEach(fn) {
		this._state.forEach(fn);
	}


	set(key, value) {
		this.delete(key);

		this._state.set(key, value);

		this._emit('add', key, value);
	}

	delete(key) {
		if(this.has(key)) {
			let removedValue = this.get(key);

			this._state.delete(key);

			this._emit('remove', key, removedValue);
		}
	}

	clear() {
		this._state.forEach((_, key) => {
			this.delete(key);
		});
	}


	mutate(type, key, value) {
		switch(type) {
		case 'add':
			this.set(key, value);
			break;
		case 'remove':
			this.delete(key);
		}
	}

	replicate(fn) {
		if(typeof fn !== 'function') {
			throw new Error('Argument must be a function, ' + fn + ' is a ' + typeof fn);
		}

		this._handlers.add(fn);

		this._state.forEach((value, key) => {
			fn('add', key, value);
		});

		return () => {
			this._handlers.delete(fn);
		};
	}

	_emit(type, key, value) {
		this._handlers.forEach(fn => {
			fn(type, key, value);
		});
	}
}
