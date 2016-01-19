var prompt  = require('prompt')
var http    = require('http')
var fs      = require('fs')
var mongojs = require('mongojs')
var request = require('request')

// We need to fetch these and throw them into the system.js collection
var dependencies = {
	'javascript.util': 'http://github.com/bjornharrtell/javascript.util/releases/download/0.12.12/javascript.util.min.js',
	lodash:            'http://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.0.0/lodash.js',
	turf:              'http://api.tiles.mapbox.com/mapbox.js/plugins/turf/v2.0.0/turf.min.js'
}

console.log()
console.log('Installing GenGIS')
console.log('=================')

// Get database address from user
prompt.start()
prompt.get({
	properties: {
		address: {
			description: 'Database address (e.g. foo, 192.169.0.5/foo, 192.169.0.5:9999/foo)',
			default: 'test',
			required: true
		}
	}
}, function (err, result) {
	console.log()

	// Connect to DB
	var address = result.address
	var db      = mongojs(address, ['system.js'])

	// Loop through dependencies and make promises to insert the code into the DB
	var promises = []

	for (var key in dependencies) {
		promises.push(promiseCodeInsert(db, key, dependencies[key]))
	}

	// When all are done, execute the mongo shell script
	Promise.all(promises).then(() => {
		var exec  = require('child_process').exec
		var child = exec('mongo ' + address + ' shell-script.js', (err, stdout, stderr) => {
			if (err) {
				console.log()
				console.log(err)
				console.log('\nGenGIS died.\n')
			}
			else {
				console.log('\nGenGIS is now available.\n')
			}

			process.exit()
		})

	}).catch(err => {
		console.log()
		console.log(err)
		console.log('\nGenGIS died.\n')
		process.exit()
	})
})

function promiseCodeInsert(db, key, url) {
	var promise = new Promise(function(resolve, reject) {
		// Grab the URL
		request(url, function(err, res, body) {
			if (err) {
				console.log(err)
				reject()
				return
			}

			// Insert the code into system.js
			db['system.js'].insert(
				{
					_id:   '__code_for_' + key.replace('.', ''),
					value: body
				},
				err => {
					if (err) {
						if (err.message.includes('duplicate')) {
							console.log(' - system.js already has ' + key)
						}
						else {
							// Bail if this is something other than a duplicate issue
							console.log(err.message)
							reject()
							return
						}
					}

					resolve()
				}
			)
		})
	})

	return promise
}