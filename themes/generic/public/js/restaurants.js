var markersLocation = [];
var bounds = new google.maps.LatLngBounds();

$(window).load(function () {
    /** Analytics **/
    var params = {};
    params[Properties.CONTENT_NAME] = "restaurants";
    Analytics.track(EVENTS.VIEW_CONTENT, params);
    /** **/
    restaurants.setup();
});

/**
 * app de restaurantes
 * @type {Vue}
 */
var restaurants = new Vue({
    data: {
        location: "",
        image: '/generic/images/market.png',
        addressUrl: "",
        map: {}
    },
    methods: {
        /**
         * función inicial
         */
        setup: function () {
            this.googleMaps();
            apiAjax("pointsales", "post", {}).then(result => {
                if (result) {
                    this.pointSales(result, this.toDrawMarkers);
                }
            }, error => {
                console.error("ERROR", error);
            });
        },
        /**
         *  inicializa el mapa.
         */
        googleMaps: function () {
            let addressSelected = JSON.parse(getLocalStorage("selected_address"));
            if (addressSelected) {
                $('#address').val(addressSelected["city"]);
                this.location = addressSelected["location"];
            } else {
                this.location = new google.maps.LatLng(11.011668, -74.840412)
            }

            this.map = new google.maps.Map(document.getElementById('map'), {
                zoom: 14,
                scrollwheel: false,
                icon: this.image,
                center: this.location,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });
        },
        /**
         * forma el objecto de punto de venta a mostrar en el mapa
         * @param pointSales :: object point sales
         * @param callback
         */
        pointSales: function (pointSales, callback) {
            var locations = [];
            for (var pointSale of pointSales) {
                var point = {
                    "id": pointSale.id,
                    "address": pointSale.address,
                    "city": pointSale.city,
                    "phone": pointSale.phone,
                    "name": pointSale.name,
                    "lat": pointSale.location.latitude,
                    "lng": pointSale.location.longitude,
                    "label": "",
                    "search_city": getCleanedString(pointSale.city),
                    "marker": "",
                    "coverage":pointSale.coverageEncode
                };
                var loc = new google.maps.LatLng(point.lat, point.lng);
                bounds.extend(loc);
                locations.push(point);
            }
            callback(locations);
        },
        /**
         * pinta los markers  en el mapa.
         * @param locations
         */
        toDrawMarkers: function (locations) {
            var marker;
            var i;
            var infowindow = new google.maps.InfoWindow({});
            for (i = 0; i < locations.length; i++) {
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(locations[i].lat, locations[i].lng),
                    icon: this.image,
                    map: this.map
                });
                google.maps.event.addListener(marker, 'click', (function (marker, i) {
                    return function () {
                        infowindow.setContent(locations[i].name);
                        infowindow.open(this.map, marker);
                    }
                })(marker, i));

                locations[i].marker = marker;
                markersLocation.push(locations[i]);
                search.searchPointSale($('#address').val());
            }
            this.map.fitBounds(bounds);
        },
        /**
         * obtiene el geocode a partir de una dirección
         */
         geocodeAddress: function(resultsMap, addressUrl) {
            new google.maps.Geocoder().geocode({'address': this.addressUrl}, function (results, status) {
                if (status === 'OK') {
                    var location = results[0].geometry.location;
                    resultsMap.setCenter(location);
                    search.searchPointSale(address);
                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    notificationGeneral("tu información no retorna resultados", {type: 'warning'});
                }
                console.log('Geocode was not successful for the following reason: ', status);
            });
        }
    }
});

/**
 * toma la dirección digita por el usuario
 * y va consultando en google maps
 */
$("#address").keypress(function (e) {
    let address = $("#address").val();
    if (e.keyCode === 13) {
        if (address) {
            restaurants.addressUrl = 'colombia' + "," + address;
            restaurants.geocodeAddress(restaurants.map, restaurants.addressUrl);
        } else if (!address.trim() && markersLocation) {
            search.allMarker(markersLocation);
        }
    }
});

/**
 * buscador de restaurantes
 * @type {Vue}
 */
var search = new Vue({
    el: '.bg_restaurant',
    data: {
        result: '0',
        city: "...",
        status: false,
        pointsale: []
    },
    methods: {
        /**
         * busca un punto de venta en una lista
         * @param address :: datos de la dirección
         */
        searchPointSale: function (address) {
            var ok = 0;
            var searchChain = getCleanedString(address);
            this.pointsale = [];
            this.city = "...";
            this.result = "0";
            this.status = true;
            var bounds = new google.maps.LatLngBounds();
            for (var pointsale of markersLocation) {
                if (pointsale.search_city.includes(searchChain)) {
                    var loc = new google.maps.LatLng(pointsale.marker.position.lat(), pointsale.marker.position.lng());
                    bounds.extend(loc);
                    this.pointsale.push(pointsale);
                    this.paintCoverage(pointsale.coverage);
                    ok = ok + 1;
                }
            }
            if (ok > 0) {
                restaurants.map.fitBounds(bounds);
                restaurants.map.setZoom(10);
            }
            this.searchResult(ok, address.toUpperCase());
        },
        /**
         * dibuja la cobertura para un  punto de venta
         * @param coverageEncode
         */
        paintCoverage: function (coverageEncode) {
            var decodedPath = google.maps.geometry.encoding.decodePath(coverageEncode);
            var color = getRandomColor();
            var setRegion = new google.maps.Polygon({
                path: decodedPath,
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: color,
                fillOpacity: 0.35
            });
            setRegion.setMap(null);
            setRegion.setMap(restaurants.map);
        },
        /**
         * resultado de la consulta
         * @param count
         * @param city
         */
        searchResult: function (count, city) {
            this.result = count;
            this.city = city;
        },
        /**
         * mustra todos los markers
         * @param markers
         */
        allMarker(markers) {
            var ok = 0;
            this.status = true;
            this.pointsale = [];
            for (point of markers) {
                this.pointsale.push(point);
                ok++;
            }
            this.searchResult(ok, "colombia".toUpperCase())
        },
        /**
         * evento de cuando se da click sobre el marke
         * @param marker
         */
        marker(marker) {
            window.location.href = "#google_maps";
            new google.maps.event.trigger(marker, 'click');
        }
    }
});