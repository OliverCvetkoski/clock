// All the needed query selectors.

const clock = document.querySelector(".clock");
const stationName = document.querySelector(".name");
const contentContainer = document.querySelector(".toStation");
const destinationStation = document.querySelector(".destinationStation");
const departureTimeContainer = document.querySelector(".departureTime");
const remainingTimeContainer = document.querySelector(".remainingTime");

// Function for getting the current local time.

function getTime() {
  const date = new Date();
  const timeString = date.toLocaleTimeString([], { hour12: false });
  clock.textContent = timeString;
}

setInterval(getTime, 1000);
getTime();

const myHeaders = new Headers();
myHeaders.append("Content-Type", "application/json");

const graphql = JSON.stringify({
  query:
    'fragment estimatedCallsParts on EstimatedCall {\n      realtime\n      cancellation\n      serviceJourney {\n        id\n      }\n      destinationDisplay {\n        frontText\n      }\n      \n  situations {\n    severity\n    situationNumber\n    reportType\n    summary {\n      value\n      language\n    }\n    description {\n      value\n      language\n    }\n    validityPeriod {\n      startTime\n      endTime\n    }\n  }\n      quay {\n        publicCode\n        id\n        stopPlace {\n          parent {\n            id\n          }\n          id\n        }\n      }\n      expectedDepartureTime\n      actualDepartureTime\n      aimedDepartureTime\n      serviceJourney {\n        id\n        line {\n          id\n          publicCode\n          transportMode\n        }        \n      }\n} query {board1: stopPlaces(ids: ["NSR:StopPlace:59872"]) {\n    name\n    estimatedCalls(whiteListedModes: [rail,bus,metro,tram,water,coach], numberOfDepartures: 200, arrivalDeparture: departures, includeCancelledTrips: true, timeRange: 14400) {\n      ...estimatedCallsParts\n    }\n  } }',
  variables: {},
});
const requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: graphql,
  redirect: "follow",
};

let trainTime;

function fetchAndDisplayData() {
  fetch("https://api.entur.io/journey-planner/v3/graphql", requestOptions)
    .then((response) => response.json())
    .then((result) => {
      destinationStation.innerHTML = "";
      departureTimeContainer.innerHTML = "";
      stationName.innerHTML = `From station ${result.data.board1[0].name} </br> To `;
      result.data.board1[0].estimatedCalls.slice(0, 10).map((departure) => {
        trainTime = result.data.board1[0].estimatedCalls;

        // Get the station name and exact time when the train leaves and append to the page.
        const date = new Date(departure.expectedDepartureTime);
        const trainHours = date.getHours();
        const trainMinutes = date.getMinutes();
        const trainSeconds = date.getSeconds();
        const departureTime = document.createElement("h4");
        departureTime.innerText = `${`
          ${trainHours.toString().padStart(2, "0")}:${trainMinutes
          .toString()
          .padStart(2, "0")}:${trainSeconds.toString().padStart(2, "0")}`}`;

        const destinationName = document.createElement("h3");
        destinationName.innerText = departure.destinationDisplay.frontText;

        destinationStation.appendChild(destinationName);
        departureTimeContainer.appendChild(departureTime);
      });
    })
    .catch((error) => console.error(error));
}

fetchAndDisplayData();

// Calculating the remaining time you have to reach the next train.

function updateRemainingTimes() {
  remainingTimeContainer.innerHTML = "";

  if (trainTime) {
    trainTime.slice(0, 10).forEach((departure) => {
      const remainingTimeInMillis =
        new Date(departure.expectedDepartureTime).getTime() -
        new Date().getTime();

      const remainingMinutes = Math.max(
        Math.floor(remainingTimeInMillis / (1000 * 60)),
        0
      );
      const remainingSeconds = Math.max(
        Math.floor(((remainingTimeInMillis / 1000) % 60) + 1),
        0
      );

      const remainingTime = document.createElement("h4");
      remainingTime.innerText = `${remainingMinutes} minutes and ${remainingSeconds} seconds`;
      remainingTimeContainer.appendChild(remainingTime);

      if (remainingMinutes <= 0 && remainingSeconds <= 0) {
        fetchAndDisplayData();
      }
    });
  }
}

updateRemainingTimes();
setInterval(updateRemainingTimes, 1000);
