
var index = require('./index');
var stuff = index.getTravelersFlightInfo().then(data => {
	console.log(JSON.stringify(data, undefined, 2));
})