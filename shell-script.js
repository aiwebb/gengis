try {
	process
	console.log('\nWrong script! Execute "node install.js" instead.\n')
	process.exit()
} catch (e) {}

db.system.js.save({
	_id: 'gengis',
	value: function() {
		try {
			__gengis__
		}
		catch (e) {
			module     = {exports: {}}
			__gengis__ = {moduleCache: {}, exportQueue: [], module: module}

			require('javascript.util',     true)
			turf   =     require('turf',   true)
			lodash = _ = require('lodash', true)

			// Shortcut so you can use gengis().turf(...) in queries
			__gengis__.turf = turf
			__gengis__._    = _

			// Bin for temp storage
			__gengis__.tmp = {}
		}

		return __gengis__
	}
})

db.system.js.save({
	_id: 'pretty',
	value: function prettyFn(item, spaces) {
		print(JSON.stringify(item, null, spaces))
	}
})

db.system.js.save({
	_id: 'require',
	value: function requireFn(moduleName, skipGengisInit) {
		if (!skipGengisInit) {
			gengis()
		}

		// See if it's cached, return early if it is
		var result = __gengis__.moduleCache[moduleName]

		if (result) {
			return result
		}

		// Push previous exports object onto stack, if it exists
		try {
			__gengis__.exportQueue.push(module.exports)
		} catch (e) {}

		// Create a new exports object
		module.exports = exports = {}

		// Execute the code!
		var code = eval('__code_for_' + moduleName.replace('.', ''))

		try {
			// First method: pretend to be node (we already have module/exports/require set up)
			result = eval(code)

			// If they didn't put anything in module.exports, use the result
			if (typeof module.exports == 'object' && !Object.keys(module.exports).length) {
				module.exports = result
			}

			// Cache it
			__gengis__.moduleCache[moduleName] = module.exports
		}
		catch (e) {
			// Second method: pretend to be a browser, since our faux-node isn't quite good enough
			var fakeGlobal = {}
			_module  = module
			_exports = exports
			_require = require
			delete module
			delete exports
			delete require

			try {
				result = eval(code)

				// Whatever items were added to fakeGlobal scope, cache them as modules
				Object.extend(__gengis__.moduleCache, fakeGlobal)

				// If there was exactly one thing added, make sure we cache it by the supplied moduleName
				if (Object.keys(fakeGlobal).length == 1) {
					var key = Object.keys(fakeGlobal)[0]
					__gengis__.moduleCache[moduleName] = fakeGlobal[key]
				}
			}
			catch (e) {
			}
			finally {
				// Stop pretending to be a browser
				delete fakeGlobal
				require = _require
				module  = _module
				module.exports = exports = _exports
			}
		}

		// Reinstate old exports object
		module.exports = exports = __gengis__.exportQueue.pop()

		return __gengis__.moduleCache[moduleName]
	}
})