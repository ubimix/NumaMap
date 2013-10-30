(function(mapConfig) {

    var CONFIG = {
        maxZoom : 20,
        container : '#map-container',
        dataUrl : './data/history.json',
        dataUrl : './data/data.json',
        dataUrl : './data/program.json',
        tilesLayer : 'http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/997/256/{z}/{x}/{y}.png',
        tilesLayer : 'http://{s}.tiles.mapbox.com/v3/guilhemoreau.map-057le4on/{z}/{x}/{y}.png',
        zone : [ [ 2.347533702850342, 48.86933038212292 ],
                [ 2.351717948913574, 48.86660622956524 ] ]
    };

    var TEMPLATES = {
        'Point' : {
            popup : '<div><strong data-action-click="focusDescription"><%=feature.properties.label||feature.properties.name%></strong></div>',
            description : '<div><h3 data-action-click="focusDescription"><%=feature.properties.label||feature.properties.name%></h3>'
                    + '<div><%=feature.properties.description%></div>'
                    + '</div>',
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
                    fillOpacity : 0.7,
                    opacity : 0.8
                });
            }
        },
        'Polygon:numa' : {
            description : '<div><%=feature.properties.label%></div>',
            popup : '<div><h3 data-action-click="focusDescription">NUMA</h3></div>',
            setLayerStyle : function(layer, feature) {
                _.extend(layer.options, {
                    color : "yellow",
                    weight : 1,
                    fillOpacity : 0.7,
                    opacity : 0.8
                });
            }
        },
        'Polygon:scene' : {
            description : '<div><h3>'
                    + '<a href="javascript:void(0);" data-action-click="openPopup">'
                    + '<%=feature.properties.label%>' + '</a>'
                    + '</h3></div></div>',
            popup : '<div><h3><a href="javascript:void(0);" data-action-click="focusDescription">'
                    + '<%=feature.properties.label%>' + '</a></h3></div></div>',
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
     * This method is used to re-size the map element to fit to the screen. It
     * is called each time when the main window changes its size.
     */
    function updateSize() {
        var container = $(CONFIG.container);
        var shift = container.find('.navbar').height() || 0;
        shift += 20;
        var height = $(window).height() - shift;
        container.find('.map-block').each(function() {
            var el = $(this);
            el.height(height);
        })
    }

    /**
     * Loads data and visualizes them on the map. This method is called when the
     * DOM construction is finished.
     */
    $(function() {
        $(window).resize(_.throttle(updateSize, 100));
        var map = new NumaMap(CONFIG, TEMPLATES);
        $.getJSON(CONFIG.dataUrl, function(data) {
            map.addLayer(data);
            updateSize();
        }).error(function(err) {
            console.log('LOADING ERROR:', err)
        })
    });

    /* ---------------------------------------------------------------------- */

    /** Class representation of a feature visualized on the map. */
    function LayerInfo(options) {
        this.options = options;
    }
    _.extend(LayerInfo.prototype, {

        /** Returns a unique identifier of the feature */
        getId : function() {
            var feature = this.options.feature;
            if (!feature.id) {
                feature.id = _.uniqueId('feature-');
            }
            return feature.id;
        },

        /** Sets a new "active" lat/lng pair for this layer */
        setLatLng : function(latlng) {
            this.latlng = latlng;
        },

        /** Returns an "active" lat/lng pair for this layer */
        getLatLng : function() {
            var latlng = this.latlng;
            if (!latlng) {
                latlng = this.options.layer.getBounds().getCenter();
            }
            return latlng;
        },
        /**
         * Checks the specified feature and returns <code>true</code> if it is
         * a point.
         */
        isPoint : function() {
            var feature = this.getFeature();
            if (!feature)
                return false;
            var type = feature.geometry.type;
            return (type == 'Point')
        },

        /** Returns a map layer associated with this feature */
        getLayer : function() {
            return this.options.layer;
        },

        /** Returns the internal feature (as a JSON object) */
        getFeature : function() {
            return this.options.feature;
        },

        /** Renders this feature using the specified field of the template */
        render : function(field) {
            var template = this.getTemplate();
            if (!template)
                return null;
            var str = template[field];
            if (!str)
                return null;
            var feature = this.getFeature();
            var html = _.template(str, {
                feature : feature,
                template : template
            })
            html = $(html);
            return html;
        },

        /**
         * Returns a template object corresponding to the specified feature. It
         * can retur <code>null</code> if there is no templates for this type
         * of features.
         */
        getTemplate : function() {
            var array = this._getFeatureTypeArray();
            var template = null;
            while (array.length) {
                var type = array.join(':');
                template = this.options.templates[type];
                if (template)
                    break;
                array.pop();
            }
            return template;
        },

        /**
         * Detects the type of the specified feature and returns an array of
         * 'type segments'. These type segments are used to recursively detect
         * template objects corresponding to this feature. This method is used
         * internally by the 'getTemplate(..)' method.
         */
        _getFeatureTypeArray : function() {
            var feature = this.getFeature();
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
    })

    /* ---------------------------------------------------------------------- */
    /**
     * The main constructor of this class. It initializes the map in the
     * specified DOM element.
     */
    function NumaMap(config, templates) {
        this.config = config;
        this.templates = templates;
        this.openPopup = _.throttle(this.openPopup, 10, this);
        this._map = this._newMap();
        this._bindRezoomingCircle();
        this._featureGroups = [];
    }
    _.extend(NumaMap.prototype, L.Mixin.Events);
    _.extend(NumaMap.prototype, {
        /** Adds a new logical layer to this map */
        addLayer : function(data) {
            var that = this;
            var htmlContainer = $(that.config.container).find('.info');
            htmlContainer.html('');
            var layer = L.geoJson(data, {
                onEachFeature : function(feature, layer) {
                    var info = new LayerInfo({
                        feature : feature,
                        layer : layer,
                        templates : that.templates
                    });

                    var html = that._renderLayer(info, 'description');
                    if (html) {
                        html.addClass('feature')
                        var featureId = info.getId();
                        html.attr('id', featureId);
                        htmlContainer.append(html);
                    }
                    that._formatLayer(info);
                }
            });
            layer.addTo(this._map);
            this._featureGroups.push(layer);
            console.log(htmlContainer.html())
            return layer;
        },

        /** Focus currently acitve description in the list. */
        focusDescription : function() {
            var that = this;
            var active = this.getActiveLayer();
            var featureId = active.getId();
            var element = $('#' + featureId);
            var container = element.parent();
            var cls = 'feature-active';
            container.find('.' + cls).each(function() {
                $(this).removeClass(cls);
            })
            var top = element.offsetParent();
            container.animate({
                scrollTop : top
            }, 300);
            element.addClass(cls);
        },

        /** Closes already opened popups */
        closePopup : function() {
            var active = this.getActiveLayer();
            if (!active)
                return;
            var layer = active.getLayer();
            layer.closePopup();
            this._map.closePopup();
        },

        /** Opens a popup window on the currently active feature */
        openPopup : function(center) {
            var activeInfo = this.getActiveLayer();
            if (!activeInfo)
                return;
            var isPoint = activeInfo.isPoint();
            var html = this._renderLayer(activeInfo, 'popup');
            if (html) {
                var latlng = activeInfo.getLatLng();
                var offset = new L.Point(0, -10);
                new L.Rrose({
                    offset : offset,
                    closeButton : false,
                    autoPan : true
                }).setContent($(html)[0]).setLatLng(latlng).openOn(this._map);
                if (center !== false) {
                    this._map.panTo(latlng);
                }
            }
        },

        /** Sets the specified feature/layer as an active ones */
        setActiveLayer : function(info) {
            this._activeLayer = info;
        },

        /** Returns the currently active layer information. */
        getActiveLayer : function() {
            return this._activeLayer;
        },

        /* ------------------------------------------------------------------ */
        // Private methods
        /** Returns an identifier of this feature */
        _getFeatureId : function(feature) {
            var featureId = feature.id = feature.id || _.uniqueId('feature-');
            return featureId;
        },

        /** Adds an individual feature object to this map and in the side block */
        _formatLayer : function(info) {
            var feature = info.getFeature();
            var template = info.getTemplate();
            if (template && template.setLayerStyle) {
                var layer = info.getLayer();
                template.setLayerStyle(layer, feature);
            }
            var that = this;
            layer.on('mouseover', function(e) {
                that.closePopup();
                info.setLatLng(e.latlng);
                that.setActiveLayer(info);
                that.openPopup(false);
            });
            layer.on('click', function(e) {
                info.setLatLng(e.latlng);
                that.setActiveLayer(info);
                that.focusDescription();
            })
        },

        /** Adds a circle allowing to re-zoom to the required region */
        _bindRezoomingCircle : function() {
            var that = this;
            that.on('layers:show', function(e) {
                if (that._centerMarker) {
                    that._map.removeLayer(that._centerMarker);
                    that._centerMarker = null;
                }
            })
            that.on('layers:hide', function(e) {
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
            var element = $(that.config.container).find('.map');
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
            var minZoom = map.getZoom();
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
                    _.each(that._featureGroups, function(layer) {
                        if (layersVisible) {
                            map.addLayer(layer);
                            that.fire('layers:show', event);
                        } else {
                            that.closePopup();
                            map.removeLayer(layer);
                            that.fire('layers:hide', event);
                        }
                    })
                }
            });
            // bounds = map.getBounds();
            // map.setMaxBounds(bounds);
            return map;
        },
        /**
         * Renders the specified feature using the given template field. The
         * field parameter defines name of the template field used for
         * visualization.
         */
        _renderLayer : function(info, field) {
            var html = info.render(field);
            if (!html)
                return;
            var that = this;
            function bindActions(e, event) {
                var action = e.attr('data-action-' + event);
                if (!action)
                    return;
                var method = that[action];
                if (_.isFunction(method)) {
                    e.on(event, function(evt) {
                        that.setActiveLayer(info);
                        method.call(that);
                    });
                }
            }
            // Bind actions to marked elements
            html.find('[data-action-click]').each(function() {
                bindActions($(this), 'click');
            })
            html.find('[data-action-mouseover]').each(function() {
                bindActions($(this), 'mouseover');
            })
            html.find('[data-action-mouseout]').each(function() {
                bindActions($(this), 'mouseout');
            })
            return html;
        }

    });

})();