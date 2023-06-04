// Pull earthquake data from usgs
var significantURL = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';
var significantPromise = d3.json(significantURL);

// Define base tileLayers
var street = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var baseMaps = {
    Street: street,
    Topographic: topo
};

// Functions for creating markers
function getFillColor(depth) {
    if (depth <= 10) {
        return 	'#ff0000'
    } else if (depth <= 30) {
        return 	'#ffa700'
    } else if (depth <= 50) {
        return 	'#fff400'
    } else if (depth <= 70) {
        return 	'#a3ff00'
    } else if (depth <= 90) {
        return 	'#2cba00'
    } else {
        return 	'#800080'
    }
};
function getRadius(mag) {
    return mag * 2
};

// Define earthquake overlays
significantPromise.then(function(data) {
    var significantLayer = L.geoJson(data, {
        pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
                radius: getRadius(feature.properties.mag),
                fillColor: getFillColor(feature.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            });
        },
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h1>" + feature.properties.mag +
                "</h1> <hr> <h2>Location: " + Math.round(feature.geometry.coordinates[0] * 1000)/1000 +
                ", " + Math.round(feature.geometry.coordinates[1] * 1000)/1000 +
                "</h2> <h2>Depth: " + Math.round(feature.geometry.coordinates[2] * 1000)/1000
            ); //+ "</h1> <hr> <h2>" + feature.properties.borough + "</h2>");
        }
    });
    layerControl.addOverlay(significantLayer, 'Significant Earthquakes')
    significantLayer.addTo(map)
});

// Create a map object, and set the default layers.
var map = L.map('map', {
    center: [30.505, -0.09],
    zoom: 3,
    layers: [topo]
});

// Create layer control
var layerControl = L.control.layers(baseMaps).addTo(map);

// Create legend for depth
var legend = L.control({position: 'bottomright'});
legend.onAdd = function(map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Depth</strong>'];
    categories = [['-10--10', 0], ['10--30', 20], ['30--50', 40], ['50--70', 60], ['70--90', 80], ['90+', 100]];

    for (var i = 0; i < categories.length; i++) {
        div.innerHTML += labels.push(
            '<i class="circle" style="background:' + getFillColor(categories[i][1]) + '"></i> ' +
            (categories[i][0] ? categories[i][0] : '+')
        );
    }
    div.innerHTML = labels.join('<br>');
return div;
};
legend.addTo(map);