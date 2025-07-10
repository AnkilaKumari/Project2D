require([
  "esri/Map",
  "esri/views/MapView",
  "esri/Graphic",
  "esri/layers/GraphicsLayer",
  "esri/rest/route",
  "esri/rest/support/RouteParameters",
  "esri/rest/support/FeatureSet",
  "esri/WebMap",
], function(Map, MapView, Graphic, GraphicsLayer, route, RouteParameters, FeatureSet, WebMap) {

  const API_KEY = "2c504234225c47e0b2f31ff514e613e8";
  const ROUTE_SERVICE_URL = "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

  const map = new WebMap({
    portalItem: {
      id: "2c504234225c47e0b2f31ff514e613e8"
    },
  });

  const view = new MapView({
    container: "map-view",
    map: map,
    center: [-118.2437, 34.0522],
    zoom: 12
  });

  const routesLayer = new GraphicsLayer();
  map.add(routesLayer);

  const routeSymbols = {
    optimal: { type: "simple-line", color: "green", width: 4 },
    congestion: { type: "simple-line", color: "red", width: 4 },
    alternate: { type: "simple-line", color: "blue", width: 4 }
  };

  function getRoutes(start, end) {
    routesLayer.removeAll();

    // Pan map to start location
    view.goTo({
      center: [start[1], start[0]], // [lon, lat]
      zoom: 12
    });

    let routeParams = new RouteParameters({
      stops: new FeatureSet({
        features: [
          createStop(start),
          createStop(end)
        ]
      }),
      returnDirections: true,
      returnRoutes: true,
      returnTrafficInfo: true
    });

    route.solve(ROUTE_SERVICE_URL, routeParams)
      .then(response => {
        response.routeResults.forEach((routeResult, index) => {
          let trafficDelay = routeResult.route.attributes.TrafficDelay;
          let symbol = index === 0 ? routeSymbols.optimal : (trafficDelay > 300 ? routeSymbols.congestion : routeSymbols.alternate);
          displayRoute(routeResult.route.geometry, symbol);
        });
      })
      .catch(error => {
        console.error("Error fetching route:", error);
        alert("Failed to fetch route. Check your API key or coordinates.");
      });
  }

  function createStop(coords) {
    return new Graphic({
      geometry: {
        type: "point",
        longitude: coords[1], // lon
        latitude: coords[0]   // lat
      }
    });
  }

  function displayRoute(geometry, symbol) {
    let routeGraphic = new Graphic({
      geometry: geometry,
      symbol: symbol
    });
    routesLayer.add(routeGraphic);
  }

  document.getElementById('simulate-btn').addEventListener('click', function() {
    let startInput = document.getElementById('start-location').value.trim();
    let endInput = document.getElementById('end-location').value.trim();
    
    if (!startInput || !endInput) {
      alert("Please enter valid start and end locations.");
      return;
    }

    let startCoords = startInput.split(",").map(Number);
    let endCoords = endInput.split(",").map(Number);

    if (
      startCoords.length !== 2 || endCoords.length !== 2 ||
      isNaN(startCoords[0]) || isNaN(startCoords[1]) ||
      isNaN(endCoords[0]) || isNaN(endCoords[1])
    ) {
      alert("Invalid coordinates. Enter as LAT,LONG (e.g., 34.0522,-118.2437)");
      return;
    }
    
    getRoutes(startCoords, endCoords);
  });

});
