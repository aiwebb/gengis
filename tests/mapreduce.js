// Hits test.gengis_geojson with a map/reduce call to sum up the area

var mongojs = require('mongojs')
var db      = mongojs('test')

var cursor = db.collection('gengis_geojson')
	.mapReduce(
		function() {
			gengis()

			emit('total', {
				area: turf.area(this),
				polys: 1
			})
		},
		function (key, values) {
			var total = {area: 0, polys: 0}

			values.forEach(function(value) {
				total.area  += value.area
				total.polys += value.polys
			})

			return total
		},
		{
			out: 'gengis_test_mapreduce'
		},
		function(err, res) {
			if (err) {
				console.log('Error running map/reduce function')
				console.log(err)
				process.exit()
			}

			// console.log(res)

			db.collection('gengis_test_mapreduce').findOne(function(err, res) {
				if (err) {
					console.log('Error retrieving result')
					console.log(err)
					process.exit()
				}

				console.log('Total area across ' + res.value.polys + ' polys: ' + res.value.area)

				process.exit()
			})
		})