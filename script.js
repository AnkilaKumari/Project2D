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

//  API keys 
  const API_KEY = "2c504234225c47e0b2f31ff514e613e8";
  const ROUTE_SERVICE_URL = "https://route.arcgis.com/arcgis/rest/services/World/Route/NAServer/Route_World";

  // map create kar rha hai
  const map = new WebMap({
    portalItem: { //  Portal item id 
      id: "2c504234225c47e0b2f31ff514e613e8"
    },
  });

  //  map view create kar rha hai
  const view = new MapView({
    container: "map-view",
    map: map,
    center: [-118.2437, 34.0522], // Default hai Los Angeles
    zoom: 12
  });

  //  routes ke liye layer add kra hai
  const routesLayer = new GraphicsLayer();
  map.add(routesLayer);

  // Define kiya route colors
  const routeSymbols = {
    optimal: { type: "simple-line", color: "green", width: 4 },
    congestion: { type: "simple-line", color: "red", width: 4 },
    alternate: { type: "simple-line", color: "blue", width: 4 }
  };

  // function bnaya to fetch and display routes
  function getRoutes(start, end) {
    routesLayer.removeAll(); // Clear previous routes

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

    // Call Esri's routing service
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
      });
  }

  // Function to create a stop (point) for routing
  function createStop(coords) {
    return new Graphic({
      geometry: {
        type: "point",
        longitude: coords[1],
        latitude: coords[0]
      }
    });
  }

  // Function to display route on the map
  function displayRoute(geometry, symbol) {
    let routeGraphic = new Graphic({
      geometry: geometry,
      symbol: symbol
    });
    routesLayer.add(routeGraphic);
  }

  // Simulate button event
  document.getElementById('simulate-btn').addEventListener('click', function() {
    let startInput = document.getElementById('start-location').value;
    let endInput = document.getElementById('end-location').value;
    
    if (!startInput || !endInput) {
      alert("Please enter valid start and end locations.");
      return;
    }
    
    let startCoords = startInput.split(",").map(Number);
    let endCoords = endInput.split(",").map(Number);
    
    getRoutes(startCoords, endCoords);
  });

});
