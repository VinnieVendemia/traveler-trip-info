'use strict';

var airlineService = require('./api/airlines.service');
var profilesService = require('./api/profiles.service');
var tripService = require('./api/trip.service');

// Helper function for creating a new traveler
function createNewTraveler(id, name) {
  return {
    id: id,
    name: name,
    flights: []
  }
}

// Helper function for creating a new leg of a flight
function createNewLeg(code, airlineName, flightNumber, frequentFlyerNumber) {
  return {
    airlineCode: code,
    airlineName: airlineName,
    flightNumber: flightNumber,
    frequentFlyerNumber: frequentFlyerNumber
  }
}

function getTravelersFlightInfo() {
  return new Promise((resolve, reject) => {
    Promise.all([
      airlineService.get(),
      profilesService.get(),
      tripService.get()
    ]).then(function (responses) {
      var airlineData = responses[0]['airlines'];
      var profilesData = responses[1]['profiles'];
      var tripData = responses[2]['trip'];

      var travelers = [];
      // Iterate over each trip to build out the list of travelers
      for(const trip of tripData['flights']) {
        for(const travelerId of trip['travelerIds']) {
          var travelerFound = travelers.find(t => t['id'] === travelerId);
          var profile = profilesData.find(p => p['personId'] === travelerId);

          // Add a new traveler to our list if we haven't created that record yet
          if(travelerFound === undefined) {
            travelerFound = createNewTraveler(travelerId, profile['name']);
            travelers.push(travelerFound);
          }

          // Add each leg of the flight to a list, finding additional data
          // that we need associated to each leg
          var flight = { legs: [] }
          for(const leg of trip['legs']) {
            var airlineName = airlineData.find(a => a['code'] === leg['airlineCode'])['name'];
            var frequentFlyerNumber = profile['rewardPrograms']['air'][leg['airlineCode']] || '';
            flight['legs'].push(
              createNewLeg(leg['airlineCode'], airlineName, leg['flightNumber'], frequentFlyerNumber)
            )
          }
          travelerFound['flights'].push(flight);
        }
      }

      resolve({ travelers: travelers });
    }).catch(function (error) {
      console.log(error);
      reject(error);
    });
  });
}

module.exports = { getTravelersFlightInfo }
