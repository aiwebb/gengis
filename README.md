# GenGIS

Pronounce it however you pronounce Genghis. It's a GIS solution for Mongo.

### Installation

Clone this repo, navigate to it, and run `npm install`. You'll be prompted for a database address.

### Why?

Because Postgres has PostGIS, and Mongo's built-in GIS support can't hold a candle to it, and I was sick of not having any viable NoSQL options for applications that require robust GIS query support. You literally can't even check the area of a polygon with the current options out there.

### How?

Mongo supports something kind of like stored procedures via the `system.js` collection, where you can define new functions that can be invoked in the middle of queries. Each of those functions can access the others, and while they're each executed in their own little sandbox, each sandbox is persistent for a given function. This is neat.

I really wanted to be able to plug third party JS libraries directly into Mongo, so I hacked together a `require()` function that plays nice with Mongo's JS environment. The first time you `require()` a library, it's brought into memory with some initial overhead, and then it's available until the database dies.

### Okay, so what exactly does this get me?

It gets you [turf.js](http://github.com/Turfjs/turf) and [lodash](http://github.com/lodash/lodash), in all their glory. According to the Mongo docs, you can use them in `$where` functions and `mapReduce` calls, and that does indeed work. There might be other places where JS support is undocumented, but I'm not sure.

You can `require()` them manually, of course, but the `gengis()` function will automatically pull them in for you:

```js
db.geojson.find({
	$where: `
		gengis()

		var exteriorArea = _(this.geometry.coordinates.slice(1))
			.chain()
			.map(function(ring) {return [ring]})
			.map(turf.polygon)
			.map(turf.area)
			.sum()
			.value()

		return exteriorArea > 100000
	`
})
```

Eventually, this little `gengis` guy will have additional helpers tacked on, like unit conversion between acres and square meters.

### ...this seems kinda half-baked.

It is! Still, I think it has potential... but for now, don't go betting your life on it. And of course, [contributions](CONTRIBUTING.md) are welcome!

### By the way, how *do* you pronounce Genghis?

Funny story. Apparently the man himself would have said it something like "Ching-gus", and whoever Anglicized it heard it as "Jen-gus", and then spelled it Genghis, and it stuck... but English is dumb and that's an incredibly unclear spelling, and for *way too damn long* the Western world pronounced it "gain-gus", to the point where that was actually printed as the authoritative pronunciation in dictionaries.

Fast forward to the modern age, and the West is slowly shifting back to something closer to the correct pronunciation over the course of several generations: more and more people are saying "jen-gus", which is at least a much smaller butchering of it and sounds like we're actually trying.

But, of course, we'll continue to hear "gain-gus", "gain-jiss", and "jen-jiss" for the foreseeable future.