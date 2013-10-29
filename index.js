(function(mapConfig) {

    var CONFIG = {
        maxZoom : 20,
        mapElement : '#map-container .map',
        descriptionElement : '#map-container .info',
        dataUrl : './data/history.json',
        dataUrl : './data/data.json',
        tilesLayer : 'http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/997/256/{z}/{x}/{y}.png',
        tilesLayer : 'http://{s}.tiles.mapbox.com/v3/guilhemoreau.map-057le4on/{z}/{x}/{y}.png',
        zone : [ [ 2.347533702850342, 48.86933038212292 ],
                [ 2.351717948913574, 48.86660622956524 ] ]
    };

    var TEMPLATES = {
        'Point' : {
            popup : '<strong><%=JSON.stringify(feature)%></strong>',
            setLayerStyle : function(layer, feature) {
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-map-marker fa-lg" style="color: red;"></i>'
                        });
                layer.setIcon(icon);
            }
        },
        'Point:wc' : {
            popup : '<strong>WC</strong>',
            setLayerStyle : function(layer, feature) {
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<span style="color: maroon; white-space: nowrap;"><i class="fa fa-male fa-lg"></i>'
                                    + '<i class="fa fa-female fa-lg"></i></span>'
                        });
                layer.setIcon(icon);
            }
        },
        'Point:security' : {
            popup : '<strong>Agent de sécurité</strong>',
            setLayerStyle : function(layer, feature) {
                var icon = L.divIcon({
                    className : '',
                    html : '<i class="fa fa-star-o" style="color: red;"></i>'
                });
                layer.setIcon(icon);
            }
        },
        'Point:sos' : {
            popup : '<strong>Sécurité</strong>',
            setLayerStyle : function(layer, feature) {
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-plus-square" style="color: red;"></i>'
                        });
                layer.setIcon(icon);
            }
        },
        'Point:screen' : {
            popup : '<div><%=JSON.stringify(feature)%></div>',
            setLayerStyle : function(layer, feature) {
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-film fa-lg" style="color: blue;"></i>'
                        });
                layer.setIcon(icon);
            }
        },
        'LineString' : {
            description : '<div><%=feature.properties.description%></div>',
            setLayerStyle : function(layer, feature) {
            }
        },
        'LineString:barrage' : {
            popup : '<div>Barrage</div>',
            setLayerStyle : function(layer, feature) {
                _.extend(layer.options, {
                    color : "gray",
                    dashArray : "5,5",
                    weight : 3
                });
            }
        },
        'LineString:passage' : {
            description : '<div><%=feature.properties.description%></div>',
            setLayerStyle : function(layer, feature) {
                _.extend(layer.options, {
                    color : "yellow",
                    dashArray : "5,5",
                    weight : 5
                });
            }
        },
        'LineString:rue' : {
            description : '<div><%=feature.properties.description%></div>',
            setLayerStyle : function(layer, feature) {
                _.extend(layer.options, {
                    color : "yellow",
                    weight : 10
                });
            }
        },
        'Polygon' : {
            description : '<div><%=feature.properties.label%></div>',
            setLayerStyle : function(layer, feature) {
                _.extend(layer.options, {
                    color : "yellow",
                    weight : 1,
                    fillOpacity: 0.7,
                    opacity : 0.8
                });
            }
        },
        'Polygon:scene' : {
            description : '<div>SCENE: <%=feature.properties.description%></div>',
            popup : '<div>COUCOU: <%=feature.properties%></div>',
            setLayerStyle : function(layer, feature) {
                _.extend(layer.options, {
                    color : 'white',
                    fillColor : 'white',
                    fillOpacity : 0.5,
                    weight : 2,
                    opacity : 0.2
                });
            }
        }
    }

    /* ---------------------------------------------------------------------- */

    /**
     * Loads data and visualizes them on the map. This method is called when the
     * DOM construction is finished.
     */
    $(function() {
        var map = new NumaMap(CONFIG, TEMPLATES);
        $.getJSON(CONFIG.dataUrl, function(data) {
            map.addLayer(data);
        }).error(function(err) {
            console.log('LOADING ERROR:', err)
        })
    });

    /* ---------------------------------------------------------------------- */

    /**
     * The main constructor of this class. It initializes the map in the
     * specified DOM element.
     */
    function NumaMap(config, templates) {
        this.config = config;
        this.templates = templates;
        this._openPopup = _.throttle(this._openPopup, 10);
        this._map = this._newMap();
        this._bindRezoomingCircle();
        this._layerGroups = [];
    }
    _.extend(NumaMap.prototype, {
        /** Adds a new logical layer to this map */
        addLayer : function(data) {
            var that = this;
            var layer = L.geoJson(data, {
                onEachFeature : function(feature, layer) {
                    that._addFeature(feature, layer);
                }
            });
            layer.addTo(this._map);
            this._layerGroups.push(layer);
            return layer;
        },
        /* ------------------------------------------------------------------ */
        // Private methods
        /**
         * Checks the specified feature and returns <code>true</code> if it is
         * a point.
         */
        _isPoint : function(feature) {
            if (!feature)
                return false;
            var type = feature.geometry.type;
            return (type == 'Point')
        },
        /** Adds an individual feature and layer to this map */
        _addFeature : function(feature, layer) {
            var that = this;
            var template = this._getFeatureTemplate(feature);
            if (template && template.setLayerStyle) {
                template.setLayerStyle(layer, feature);
            }
            layer.on('mouseover', function(e) {
                that._closePopup();
                that._setActiveLayer(feature, layer, e.latlng);
                that._openPopup();
            });
            layer.on('click', function(e) {
                that._setActiveLayer(feature, layer, e.latlng);
                var html = that._renderDescription();
                if (html) {
                    var htmlContainer = $(that.config.descriptionElement);
                    htmlContainer.html(html);
                }
            })
        },
        /** Sets the specified feature/layer as an active ones */
        _setActiveLayer : function(feature, layer, latlng) {
            this._activeFeature = feature;
            this._activeLayer = layer;
            this._activeLatLng = latlng;
        },
        /** Closes already opened popups */
        _closePopup : function() {
            if (!this._activeLayer)
                return;
            this._activeLayer.closePopup();
            this._map.closePopup();
        },
        /** Opens a popup window on the currently active feature */
        _openPopup : function() {
            if (!this._activeFeature)
                return;
            var isPoint = this._isPoint(this._activeFeature);
            var html = this._renderPopup();
            if (html) {
                if (isPoint) {
                    this._activeLayer.bindPopup($(html)[0]).openPopup();
                } else {
                    L.popup({
                        offset : L.point(0, -20)
                    }).setContent($(html)[0]).setLatLng(this._activeLatLng)
                            .openOn(this._map);
                }
            }
        },

        /** Adds a circle allowing to re-zoom to the required region */
        _bindRezoomingCircle : function() {
            var that = this;
            that._map.on('layers:show', function(e) {
                if (that._centerMarker) {
                    that._map.removeLayer(that._centerMarker);
                    that._centerMarker = null;
                }
            })
            that._map.on('layers:hide', function(e) {
                if (!that._centerMarker) {
                    var center = e.center;
                    var minZoom = e.minZoom;
                    var circle = L.circleMarker(center, {
                        // fillColor : 'yellow',
                        fillOpacity : 0.1,
                        weight : 20,
                        color : 'yellow',
                        opacity : 0.5,
                        radius : 100
                    });
                    circle.on('click', function() {
                        that._map.setView(center, minZoom);
                    })
                    var myIcon = L.divIcon({
                        className : '',
                    // html : "<strong style='color: white; white-space:
                    // nowrap;'>C'est ici!</strong>"
                    });
                    var label = L.marker(center, {
                        icon : myIcon
                    });
                    that._centerMarker = L.layerGroup([ circle, label ]);
                    that._map.addLayer(that._centerMarker);
                }
            })
        },
        /** Creates and returns a new map */
        _newMap : function() {
            var that = this;
            function getLatLngBounds(zone) {
                zone = zone || [];
                function getLatLng(point) {
                    point = point || [ 0, 0 ];
                    return L.latLng(point[1], point[0]);
                }
                var zone = that.config.zone || [];
                var bounds = L.latLngBounds(getLatLng(zone[0]),
                        getLatLng(zone[1]));
                return bounds;
            }
            var element = $(that.config.mapElement);
            element.html('');
            var map = L.map(element[0], {
                loadingControl : true
            });
            L.tileLayer(that.config.tilesLayer, {
                attribution : that.config.attribution,
                maxZoom : that.config.maxZoom
            }).addTo(map);

            var bounds = getLatLngBounds(that.config.zone);
            var center = bounds.getCenter();
            map.fitBounds(bounds);
            var minZoom = map.getZoom() - 1;
            var layersVisible = true;
            map.on('zoomend', function() {
                var zoom = map.getZoom();
                var update = false;
                if (zoom < minZoom) {
                    update = true;
                    layersVisible = false;
                } else {
                    if (!layersVisible) {
                        update = true;
                    }
                    layersVisible = true;
                }
                if (update) {
                    var event = {
                        center : center,
                        zoom : zoom,
                        minZoom : minZoom
                    }
                    _.each(that._layerGroups, function(layer) {
                        if (layersVisible) {
                            map.addLayer(layer);
                            map.fire('layers:show', event);
                        } else {
                            map.removeLayer(layer);
                            map.fire('layers:hide', event);
                        }
                    })
                }
            });
            // bounds = map.getBounds();
            // map.setMaxBounds(bounds);
            return map;
        },
        /**
         * Detects the type of the specified feature and returns an array of
         * 'type segments'. These type segments are used to recursively detect
         * template objects corresponding to this feature. This method is used
         * internally by the '_getFeatureTemplate(..)' method.
         */
        _getFeatureTypeArray : function(feature) {
            if (!feature)
                return [];
            var geometry = feature.geometry || {};
            var array = [ (geometry.type || '') ];
            var properties = feature.properties || {};
            var type = properties.type || '';
            if (type != '') {
                array.push(type);
            }
            return array;
        },
        /**
         * Returns a template object corresponding to the specified feature. It
         * can retur <code>null</code> if there is no templates for this type
         * of features.
         */
        _getFeatureTemplate : function(feature) {
            var array = this._getFeatureTypeArray(feature);
            var template = null;
            while (array.length) {
                var type = array.join(':');
                template = this.templates[type];
                if (template)
                    break;
                array.pop();
            }
            return template;
        },
        /**
         * Renders the specified feature using the given template field. The
         * field parameter defines name of the template field used for
         * visualization.
         */
        _renderFeature : function(feature, field) {
            var template = this._getFeatureTemplate(feature);
            if (!template)
                return '';
            var str = template[field];
            if (!str)
                return '';
            return _.template(str, {
                feature : feature,
                template : template
            })
        },
        /**
         * Renders content of the pop-up window for the currently active
         * feature.
         */
        _renderPopup : function() {
            return this._renderFeature(this._activeFeature, 'popup');
        },
        /**
         * Renders content of the detail window for the currently active
         * feature.
         */
        _renderDescription : function() {
            return this._renderFeature(this._activeFeature, 'description');
        }

    });

})();