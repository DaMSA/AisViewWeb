// Attributes
var markerManagerZoom = 8;
var markerManagerRefresh = 60*5000;
var positionUpdate = 60*1000;

// Global variables
var mgr = null;
var map = null;
var selectedMarker = null;
var hoveredMarker = null;
var pastTrack = null;
var batch = [];
var markers = [];
var infoBoxes = [];
var init = true;
var refresh = false;

/**
 * Ship object
 * 
 * @param shipId
 *            Ships unique id
 * @param ship
 *            JSON ship data
 * @param markerScale
 *            Scale of the google maps marker
 * @returns Ship object
 */
function Ship(shipId, ship, markerScale, selected) {
	this.id = shipId;
	this.lat = ship[1];
	this.lon = ship[2];
	this.latlon = new google.maps.LatLng(this.lat, this.lon);
	
	// Set color and ship type
	switch (ship[4]) {
		case "PASSENGER_VESSEL":
			this.color = "blue";
			shipType = "Passenger vessel";
			break;
		case "CARGO_VESSEL":
			this.color = "green";
			shipType = "Cargo vessel";
			break;
		case "TANKER":
			this.color = "red";
			shipType = "Tanker";
			break;
		case "HSC":
			this.color = "yellow";
			shipType = "High speed craft";
			break;
		case "TUG":
			this.color = "turquoise";
			shipType = "Tug boat";
			break;
		case "PILOT":
			this.color = "orange";
			shipType = "Pilot vessel";
			break;
		case "YACHT":
			this.color = "purple";
			shipType = "Yacht";
			break;
		case "UNSPECIFIED":
			this.color = "gray";
			shipType = "Unspecified vessel";
			break;
		default:
			this.color = "gray";
			shipType = "Unspecified vessel";
			break;
	}
	
	// Set ship title (currently unused)
	this.title = shipType;
	
	// Set navigational state
	if (ship[5] == 1) {
		this.state = "moored";
	} else {
		var degree = Math.round(ship[0] / 5.0) * 5;
		if (degree == 360) {
			degree = 0;
		}
		this.state = degree;
	}
	
	// Generate the marker image
	if(!selected) {
		this.markerImage = new google.maps.MarkerImage('icons/ship/ship_' + this.color + '_' + this.state + '.png',
		    // Set marker dimension
		    new google.maps.Size(32 * markerScale, 32 * markerScale),
		    // Set origin
		    new google.maps.Point(0, 0),
		    // Set anchor
		    new google.maps.Point(16 * markerScale, 16 * markerScale),
		    // Set scale
		    new google.maps.Size(32 * markerScale, 32 * markerScale)
	    );
	} else {
		//TODO: generate a path to image when marker is selected.
	}
}

/**
 * Getters for the Ship object
 */
Ship.prototype = {
	get getId() {
		return this.id;
	},
	get getLat() {
		return this.lat;
	},
	get getLon() {
		return this.lon;
	},
	get getColor() {
		return this.color;
	},
	get getTitle() {
		return this.title;
	},
	get getState() {
		return this.state;
	},
	get getLatLon() {
		return this.latlon;
	},
	get getMarkerImage() {
		return this.markerImage;
	}
};

/**
 * Initialize the map
 */
function setupMap() {
    var myOptions = {
        zoom: 10,
        center: new google.maps.LatLng(56.00, 11.00),
        mapTypeId: google.maps.MapTypeId.TERRAIN
    };
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    
    // Initial listener which runs only once when tiles have been loaded
    var initialListener = google.maps.event.addListener(map, 'tilesloaded', function () {
    	updateShipMarkers();
    	google.maps.event.removeListener(initialListener);
    });
    
    // Timing for ship movement
    setInterval("updateShipMarkers()", positionUpdate);
    
    // Timing for new ship target updates
    setInterval("refreshMarkerManager()", markerManagerRefresh);
}

/**
 * Update markers positions, and add new markers without refreshing the
 * MarkerManager.
 * 
 * @returns
 */
function updateShipMarkers() {
	$.getJSON('/api/http/ais?', {
    	swLat:-360,
    	swLon:-360,
    	neLat:360,
    	neLon:360
    }, function (result) {
    	var ships = result.ships;
    	// TODO run from 0 to ships.length to remove old targets...
        for (shipId in ships) {
        	var shipJSON = ships[shipId];
        	var ship = new Ship(shipId, shipJSON, 1);
        	
            if(markers[shipId]) {
            	// Marker exists just update data
            	var marker = markers[shipId];
            	marker.setPosition(ship.getLatLon);
            	marker.setIcon(ship.getMarkerImage);
            } else {
            	// Marker doesn't exist, create a new one
            	var marker = new google.maps.Marker({
            		id: shipId,
                    position: ship.getLatLon,
                    icon: ship.getMarkerImage
                });
            	
            	/* Marker events */
            	
            	// Event on marker mouse over
            	google.maps.event.addListener(marker, 'mouseover', function() {
            		hoveredMarker = this;
            		$.getJSON('/api/http/ais?', {
            			method: 'details',
            			id: this.id
            		}, function(result) {
            			var boxText = document.createElement("div");
            			boxText.className = "shipHover"
            	        boxText.innerHTML = result.name;
            	                
            	        var myOptions = {
            	        	content: boxText,
        	                disableAutoPan: true,
        	                maxWidth: 0,
        	                pixelOffset: new google.maps.Size(-75, 20),
    	                    closeBoxURL: "",
        	                pane: "floatPane",
            	        };
            	        
            	        var infoBox = new InfoBox(myOptions);
            	        infoBox.open(map, hoveredMarker);
            	        infoBoxes.push(infoBox);
            		});
            	});
            	
            	google.maps.event.addListener(marker, 'mouseout', function() {
            		for(infoBox in infoBoxes) {
            			infoBoxes[infoBox].close();
            		}
            	});	
            	
            	// Event on marker mouse click
            	google.maps.event.addListener(marker, 'click', function() {
            		selectedMarker = this;
            		$.getJSON('/api/http/ais?', {
            			method: 'details',
            			past_track: '1',
            			id: this.id
            		}, function(result) {
            			var info = new google.maps.InfoWindow({
            				content: result.navStatus
            			});
            			info.open(map, selectedMarker);
            			
            			var tracks = result.pastTrack.points;
            			createPastTrack(tracks, info);
            		});
            	});
            	
            	/* Add markers to marker manager */
                markers[shipId] = marker;
                if(init) {
                    batch.push(marker);
                } else {
	                mgr.addMarker(marker, markerManagerZoom);
	                refresh = true;
                }
            }
        }
        
        // On first run, initialize the marker manager and batch add the markers.
        if(init) {
        	var mgrOptions = { /* borderPadding: 50, */ maxZoom: 15, trackMarkers: true };
        	mgr = new MarkerManager(map, mgrOptions);
        	google.maps.event.addListener(mgr, 'loaded', function () {
        	    mgr.addMarkers(batch, markerManagerZoom);
        	    mgr.refresh();
        	});
        	var mcOptions = {gridSize: 50, maxZoom: 15};
        	markerManager = new MarkerClusterer(map, batch, mcOptions);
        	init = false;
        }
    });
}

function createPastTrack(tracks, info) {
	var path = [];
	for(track in tracks) {
		currentTrack = tracks[track];
		var latlon = new google.maps.LatLng(currentTrack.lat, currentTrack.lon);
		path.push(latlon);
	}
	pastTrack = new google.maps.Polyline({
			path: path,
			map: map,
			strokeColor: "#FF0000",
			geodesic: true
	});
	pastTrack.setMap(map);

	google.maps.event.addListener(info, 'closeclick', function() {
		pastTrack.setMap(null);
	});
}

function refreshMarkerManager() {
	if(refresh) {
		mgr.refresh();
		refresh = false;
	}
}