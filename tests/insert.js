// Inserts 10,000 random polygons into test.gengis_geojson for something to test against

var mongojs = require('mongojs')
var db      = mongojs('test')
var turf    = require('turf')

db.createCollection('gengis_geojson', function(err) {
	var promises = []

	for (var i = 0; i < 100; i++) {
		var promise = new Promise(function(resolve) {
			var collection = turf.random('polygons', 100, {
				bbox: [-95, 35, -85, 45]
			})

			var bulk = db.collection('gengis_geojson').initializeOrderedBulkOp()

			collection.features.forEach(feature => {
				bulk.insert(feature)
			})

			bulk.execute(function(err, res) {
				if (err) {console.log(err)}
				resolve()
			})
		})

		promises.push(promise)
	}

	Promise.all(promises).then(() => {
		console.log('Done!')
		process.exit()
	}).catch(err => {
		console.log(err)
		process.exit()
	})
})