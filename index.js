(function(mapConfig) {

    var CONFIG = {
        maxZoom : 20,
        container : '#map-container',
        dataUrls : [ './data/history.json', './data/program.json',
                './data/data.json' ],
        dataUrls : [ './data/data.html', './data/history.html',
                './data/program.html', './data/info-pratique.html' ],
        tilesLayer : 'http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/997/256/{z}/{x}/{y}.png',
        tilesLayer : 'http://{s}.tiles.mapbox.com/v3/guilhemoreau.map-057le4on/{z}/{x}/{y}.png',
        zone : [ [ 2.347533702850342, 48.86933038212292 ],
                [ 2.351717948913574, 48.86660622956524 ] ]
    };

    var TEMPLATE_DEFAULT_DESCRIPTION = '<div data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
            + '<h3><a href="javascript:void(0);" data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></a></h3>'
            + '<div class="visible-when-active">'
            + '<div><%=feature.properties.description%></div>'
            + '<% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
            + '</div>' + '</div>';
    var TEMPLATE_DEFAULT_POPUP = '<div><strong data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></strong></div>';
    var TEMPLATE_DEFAULT_DIALOG = '<% var dialogId=info.getId("-dialog"); %>'
            + '<div id="<%=dialogId%>" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="<%=dialogId%>-title" aria-hidden="true">'
            + ' <div class="modal-header">'
            + ' <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
            + ' <h3 id="<%=dialogId%>-title"><%=feature.properties.label%></h3>'
            + ' </div>'
            + ' <div class="modal-body">'
            + ' <div><%=feature.properties.fullContent%></div>'
            + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
            + ' </div>'
            + '<div class="modal-footer">'
            + '<button class="btn" data-dismiss="modal" aria-hidden="true">OK</button>'
            + '</div>' + '</div>';
    var TEMPLATE_DEFAULT = {
        popup : TEMPLATE_DEFAULT_POPUP,
        description : TEMPLATE_DEFAULT_DESCRIPTION,
        dialog : TEMPLATE_DEFAULT_DIALOG
    }
    function tmpl(options) {
        return _.extend({}, TEMPLATE_DEFAULT, options)

    }
    var TEMPLATES = {
        'Point' : tmpl({
            updateLayer : function(info) {
                var layer = info.getLayer();
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-map-marker fa-lg" style="color: red;"></i>'
                        });
                layer.setIcon(icon);
            }
        }),
        'Point:wc' : {
            popup : '<strong>WC</strong>',
            updateLayer : function(info) {
                var layer = info.getLayer();
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
            popup : '<div><strong>Agent de sécurité</strong></div>',
            updateLayer : function(info) {
                var layer = info.getLayer();
                var icon = L.divIcon({
                    className : '',
                    html : '<i class="fa fa-star-o" style="color: red;"></i>'
                });
                layer.setIcon(icon);
            }
        },
        'Point:sos' : {
            popup : '<strong>Poste de secours</strong>',
            updateLayer : function(info) {
                var layer = info.getLayer();
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-plus-square" style="color: red;"></i>'
                        });
                layer.setIcon(icon);
            }
        },
        'Point:screen' : tmpl({
            updateLayer : function(info) {
                var layer = info.getLayer();
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-film fa-lg" style="color: blue;"></i>'
                        });
                layer.setIcon(icon);
            }
        }),
        'Point:cafe' : tmpl({
            updateLayer : function(info) {
                var layer = info.getLayer();
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-coffee fa-lg" style="color: white;"></i>'
                        });
                layer.setIcon(icon);
            }
        }),
        'LineString' : {
            description : '<div><%=feature.properties.description%></div>'
        },
        'LineString:barrage' : {
            popup : '<div>Barrage</div>',
            updateLayer : function(info) {
                var layer = info.getLayer();
                _.extend(layer.options, {
                    color : "gray",
                    dashArray : "5,5",
                    weight : 3
                });
            }
        },
        'LineString:passage' : tmpl({
            updateLayer : function(info) {
                var layer = info.getLayer();
                _.extend(layer.options, {
                    color : "yellow",
                    dashArray : "5,5",
                    opacity : 0.1,
                    weight : 5
                });
            }
        }),
        'LineString:rue' : tmpl({
            updateLayer : function(info) {
                var layer = info.getLayer();
                _.extend(layer.options, {
                    opacity : 0.1,
                    color : "yellow",
                    weight : 10
                });
            }
        }),
        'Polygon' : tmpl({
            description : '<div><%=feature.properties.label%></div>',
            updateLayer : function(info) {
                var layer = info.getLayer();
                _.extend(layer.options, {
                    color : "yellow",
                    weight : 1,
                    fillOpacity : 0.7,
                    opacity : 0.8
                });
            }
        }),
        'Polygon:numa' : tmpl({
            popup : '<div><h3 data-action-click="activateLayer">NUMA</h3></div>',
            updateLayer : function(info) {
                var layer = info.getLayer();
                _.extend(layer.options, {
                    color : "yellow",
                    weight : 1,
                    fillOpacity : 0.7,
                    opacity : 0.8
                });
            }
        }),
        'Polygon:scene' : tmpl({
            popup : '<div><strong><a href="javascript:void(0);" data-action-click="activateLayer">'
                    + '<%=feature.properties.label%>'
                    + '</a></strong></div></div>',
            updateLayer : function(info) {
                var layer = info.getLayer();
                _.extend(layer.options, {
                    color : 'white',
                    fillColor : 'white',
                    fillOpacity : 0.5,
                    weight : 2,
                    opacity : 0.2
                });
            }
        })
    }

    /* ---------------------------------------------------------------------- */

    /** Return a promise for the data loaded from the specified URL */
    function load(url) {
        var deferred = Q.defer();
        $.get(url, function(data) {
            deferred.resolve(data);
        }).fail(function(error) {
            deferred.reject(error);
        });
        return deferred.promise.then(function(data) {
            return data;
        });
    }

    /**
     * Parses the specified HTML content and transforms it into a valid GeoJSON
     * feature object
     */
    function parseHTML(url, data) {
        var str = '' + data;
        var e = $('<div></div>').append(data);
        var features = [];
        var json = {
            id : url,
            type : "FeatureCollection",
            features : features
        };
        var label = e.find('title').text();
        json.label = label;
        var meta = e.find('meta[name="visible"]');
        var visible = meta.attr('content') == 'true';
        json.visible = visible;
        function isEmpty(str) {
            return !str || str.replace(/^s+|\s+$/gi, '') == '';
        }
        function copy(str, to, toProperty) {
            if (!str)
                return null;
            str = str.replace(/^\s*|\s*$/gim, '').replace(/\s+/gim, ' ');
            if (str == '')
                return null;
            to[toProperty] = str;
            return str;
        }
        e.find('article').each(function() {
            article = $(this);
            var address = article.find('address');
            var geometry = {
                type : address.data('geometry') || 'Point',
                coordinates : address.data('coordinates')
            };
            var properties = {
                type : article.data('type')
            } // 
            var feature = {
                type : "Feature",
                geometry : geometry,
                properties : properties
            };
            features.push(feature);
            // Fill individual properties
            copy(address.html(), properties, 'address');
            copy(article.find('header').text(), properties, 'label');
            copy(article.find('aside').html(), properties, 'description');
            copy(article.find('section').html(), properties, 'fullContent');
            copy(article.find('footer').html(), properties, 'references');
            // console.log(' * ', JSON.stringify(feature))
        })
        return json;
    }

    /**
     * Loads data and visualizes them on the map. This method is called when the
     * DOM construction is finished.
     */
    $(function() {
        var map = new NumaMap(CONFIG, TEMPLATES);
        /**
         * This method is used to re-size the map element to fit to the screen.
         * It is called each time when the main window changes its size.
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
            map.refreshView();
            return Q();
        }

        $(window).resize(_.throttle(updateSize, 100));
        Q
        // Loads data for all map layers
        .all(_.map(CONFIG.dataUrls, function(url) {
            return load(url).then(function(data) {
                if (_.isObject(data)) {
                    return data;
                }
                var str = data + '';
                var obj = parseHTML(url, str);
                return obj;
            });
        }))
        // Visualize data for all layers on the map
        .then(function(layersData) {
            _.each(layersData, function(data) {
                map.addFeatureGroup(data);
            })
        })
        // Refresh the map size after the data loading is finished
        .then(function() {
            updateSize();
        })
        // Handle errors
        .fail(function(error) {
            console.log('LOADING ERROR:', error)
        }).done();
    });

    /* ---------------------------------------------------------------------- */

    /** Class representation of a feature visualized on the map. */
    function FeatureInfo(options) {
        var that = this;
        this.options = options;
        var template = that.getTemplate();
        if (template && template.updateLayer) {
            template.updateLayer(that);
        }
        var layer = this.getLayer();
        layer.on('mouseover', function(e) {
            that.setLatLng(e.latlng);
            that.focusLayer({
                layer : that
            });
        });
        layer.on('click', function(e) {
            that.setLatLng(e.latlng);
            that.activateLayer({
                layer : that
            });
        })

    }
    _.extend(FeatureInfo.prototype, {

        /** Returns a unique identifier of the feature */
        getId : function(suffix) {
            var feature = this.options.feature;
            if (!feature.id) {
                feature.id = _.uniqueId('feature-');
            }
            var id = feature.id;
            if (suffix) {
                id += suffix;
            }
            return id;
        },

        /** Sets a new "active" lat/lng pair for this layer */
        setLatLng : function(latlng) {
            this.latlng = latlng;
        },

        /** Returns an "active" lat/lng pair for this layer */
        getLatLng : function() {
            var latlng = this.latlng;
            if (!latlng) {
                var layer = this.options.layer;
                if (layer.getLatLng) {
                    latlng = layer.getLatLng();
                } else if (layer.getBounds) {
                    latlng = layer.getBounds().getCenter();
                }
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

        /** Returns the map corresponding to this layer */
        getMap : function() {
            var group = this.getGroup();
            return group.getMap();
        },

        /** Returns a map layer associated with this feature */
        getLayer : function() {
            return this.options.layer;
        },

        /** Returns the internal feature (as a JSON object) */
        getFeature : function() {
            return this.options.feature;
        },

        /** Returns the main application */
        getApp : function() {
            var group = this.getGroup();
            return group.getApp();
        },

        /** Returns a FeatureGroup object */
        getGroup : function() {
            return this.options.group;
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
                info : this,
                feature : feature,
                template : template
            })
            html = $(html);

            var that = this;
            function bindActions(e, event) {
                var action = e.attr('data-action-' + event);
                if (!action)
                    return;
                var method = that[action];
                if (_.isFunction(method)) {
                    e.on(event, function(evt) {
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
        },

        /** Hides popups and dialog boxes associated with this feature */
        hide : function() {
            this.closeDialog();
            this.closePopup();
        },

        /**
         * Render description and return the resulting jQuery wrapper for the
         * view.
         */
        renderDescription : function() {
            var html = this.render('description');
            if (html) {
                html.addClass('feature')
                var featureId = this.getId();
                html.attr('id', featureId);
            }
            return html;
        },

        /** Focus currently acitve description (changes its class names). */
        focusDescription : function() {
            var featureId = this.getId();
            var element = $('#' + featureId);
            if (!element[0])
                return;
            var cls = 'feature-active';
            var container = this.getApp().getListContainer();
            container.find('.' + cls).each(function() {
                $(this).removeClass(cls);
            })
            var top = element.position().top + container.scrollTop()
                    - container.position().top;
            container.animate({
                scrollTop : top
            }, 300);
            element.addClass(cls);
        },

        /** Opens a popup window on the this feature. */
        openPopup : function(center) {
            var isPoint = this.isPoint();
            var html = this.render('popup');
            if (html) {
                var latlng = this.getLatLng();
                var offset = new L.Point(0, -10);
                var map = this.getMap();
                new L.Rrose({
                    offset : offset,
                    closeButton : false,
                    autoPan : true
                }).setContent($(html)[0]).setLatLng(latlng).openOn(map);
                if (center) {
                    map.panTo(latlng);
                }
            }
        },

        /** Closes already opened popups */
        closePopup : function() {
            var layer = this.getLayer();
            layer.closePopup();
            // ???
            var map = this.getMap();
            map.closePopup();
        },

        /**
         * Opens a dialog box with additional information about this feature.
         */
        openDialog : function() {
            // var feature = this.getFeature();
            // if (!feature.properties.fullContent)
            // return;
            var html = this.render('dialog');
            if (html) {
                $(html).modal('show');
            }
        },

        /** Closes already opened popups */
        closeDialog : function() {
            var dialogId = this.getId('-dialog');
            $('#' + dialogId).modal('hide');
        },

        /**
         * Returns a template object corresponding to the specified feature. It
         * can retur <code>null</code> if there is no templates for this type
         * of features.
         */
        getTemplate : function() {
            var array = this._getFeatureTypeArray();
            var template = null;
            var app = this.getApp();
            var templates = app.getTemplates();
            while (array.length) {
                var type = array.join(':');
                template = templates[type];
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

        /* ------------------------------------------------------------------ */
        // Activation/deactivation methods firing events
        /** Focus the specified layer */
        focusLayer : function(e) {
            var app = this.getApp();
            app._focusLayer(this._expandEvent(e));
        },
        /** Focus the specified layer */
        activateLayer : function(e) {
            var app = this.getApp();
            app._activateLayer(this._expandEvent(e));
        },
        /** Expand layer information */
        expandLayer : function(e) {
            var app = this.getApp();
            app._expandLayer(this._expandEvent(e));
        },
        /** Copies an event and adds this layer to it */
        _expandEvent : function(e) {
            var event = _.clone(e || {});
            event = _.extend(event, {
                layer : this
            });
            return event;
        },
    })

    /* ---------------------------------------------------------------------- */
    /** Class representation of a feature visualized on the map. */
    function FeatureGroup(options, data) {
        this.options = options;
        this.features = {};
        this.setData(data);
    }
    _.extend(FeatureGroup.prototype, {

        /** Returns the main application */
        getApp : function() {
            return this.options.app;
        },

        /** Returns the map corresponding to this group */
        getMap : function() {
            var app = this.getApp();
            return app.getMap();
        },

        /** Returns a unique identifier of this group */
        getId : function(suffix) {
            if (!this.id) {
                this.id = _.uniqueId('feature-group-');
            }
            var id = this.id;
            if (suffix) {
                id += suffix;
            }
            return id;
        },

        /** Adds all features in this group */
        setData : function(data) {
            this.hide();
            delete this.groupLayer;
            var that = this;
            this.groupLayer = L.geoJson(data, {
                onEachFeature : function(feature, layer) {
                    var info = new FeatureInfo({
                        group : that,
                        feature : feature,
                        layer : layer
                    });
                    var id = info.getId();
                    that.features[id] = info;
                }
            });
        },

        /** Returns <code>true</code> if this group is visible */
        isVisible : function() {
            return this.visible ? true : false;
        },

        /** Toggles the visibility of this group */
        toggle : function() {
            if (this.isVisible()) {
                this.hide();
            } else {
                this.show();
            }
        },

        /** Shows this group on the map and in the list */
        show : function() {
            if (this.isVisible()) {
                return;
            }
            if (this.groupLayer) {
                var map = this.getMap();
                map.addLayer(this.groupLayer);
            }
            var container = this.getApp().getListContainer();
            this.groupContainer = $('<div></div>');
            container.append(this.groupContainer);
            _.each(this.features, function(info) {
                var html = info.renderDescription();
                this.groupContainer.append(html);
            }, this);
            this.visible = true;
        },

        /** Hides this group of features from the map and from the list */
        hide : function() {
            if (!this.isVisible()) {
                return;
            }
            _.each(this.features, function(info) {
                info.hide();
            });
            if (this.groupLayer) {
                var map = this.getMap();
                map.removeLayer(this.groupLayer);
            }
            if (this.groupContainer) {
                this.groupContainer.remove();
                delete this.groupContainer;
            }
            this.visible = false;
        },

    });

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
        this._featureGroups = {};
        this._groupVisibility = {};
        this._bindEvents();
        this.getListContainer().html('')
    }
    _.extend(NumaMap.prototype, L.Mixin.Events);
    _.extend(NumaMap.prototype, {

        /** Returns the map */
        getMap : function() {
            return this._map;
        },

        /** Refreshes this map view */
        refreshView : function() {
            this._map.invalidateSize();
        },

        /**
         * Returns templates for this application. Used by the "render" method
         * in individual features (see the FeatureInfo class).
         */
        getTemplates : function() {
            return this.templates;
        },

        /** Returns the DOM element using as a container for list items */
        getListContainer : function() {
            var htmlContainer = $(this.config.container).find('.info');
            return htmlContainer;
        },

        /** Adds a new logical layer to this map */
        addFeatureGroup : function(data) {
            var that = this;
            var map = this._map;
            var group = new FeatureGroup({
                app : this
            }, data);
            var groupId = group.getId();
            this._featureGroups[groupId] = group;
            // FIXME:
            var nav = $(this.config.container).find('.navbar .nav');
            if (data.label) {
                var ref = $('<a href="javascript:void(0);"></a>').text(
                        data.label);
                var li = $('<li data-ref="' + groupId + '"></li>').append(ref);
                nav.append(li);
                ref.click(function(e) {
                    // that.fire('group:toggle', )
                    that.toggleGroupVisibility(groupId);
                })
                that.on('groupVisibilityChanged', function() {
                    var visible = that.getGroupVisibility(groupId);
                    if (visible) {
                        li.addClass('active');
                    } else {
                        li.removeClass('active');
                    }
                })
            }
            that.setGroupVisibility(groupId, data.visible);
            return group;
        },

        /** Returns the visibility of the group with the specified identifier */
        getGroupVisibility : function(groupId) {
            return this._groupVisibility[groupId] ? true : false;
        },
        /** Toggles the visibility of a group with the specified identifier. */
        toggleGroupVisibility : function(groupId) {
            var visible = this._groupVisibility[groupId] ? true : false;
            this.setGroupVisibility(groupId, !visible);
        },
        /** Changes the visibility of the group with the specified identifier. */
        setGroupVisibility : function(groupId, visible) {
            var alreadyVisible = this._groupVisibility[groupId];
            this._groupVisibility[groupId] = visible;
            if (alreadyVisible != visible) {
                this.fire('groupVisibilityChanged');
            }
        },

        /**
         * Binds event handlers showing/hiding popups and additional information
         * in side panels.
         */
        _bindEvents : function() {
            var that = this;
            // Show popup when a layer is focused (mouseover)
            that.on('layer:focus:on', function(e) {
                e.layer.openPopup(e.center);
            }, that);
            // Hide popup when user removes the focus from the currently active
            // feature/layer
            that.on('layer:focus:off', function(e) {
                e.layer.closePopup();
            }, that);
            // Shows description associated with the activated feature.
            // (Corresponds to user's clicks)
            that.on('layer:active:on', function(e) {
                e.layer.focusDescription();
            }, that)
            // Expand (open a popup) with additional information about the
            // feature.
            that.on('layer:expand:on', function(e) {
                e.layer.openDialog();
            }, that)
            // Closes a dialog box associated with the feature.
            that.on('layer:expand:off', function(e) {
                e.layer.closeDialog();
            }, that)

            // Adds a circle allowing to re-zoom to the required region
            that.on('layers:show', function(e) {
                if (!that._centerMarker)
                    return;
                that._map.removeLayer(that._centerMarker);
                that._centerMarker = null;
                that._groupVisibilityBlocked = false;
                that.fire('groupVisibilityChanged');
            })
            that.on('layers:hide', function(e) {
                if (that._centerMarker)
                    return;

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
                that._groupVisibilityBlocked = true;
                that.fire('groupVisibilityChanged');
            })
            that.on('groupVisibilityChanged', function() {
                _.each(that._featureGroups, function(group, groupId) {
                    var visible = that.getGroupVisibility(groupId);
                    if (visible && !that._groupVisibilityBlocked) {
                        group.show();
                    } else {
                        group.hide();
                    }
                })
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
                    if (layersVisible) {
                        that.fire('layers:show', event);
                    } else {
                        that.fire('layers:hide', event);
                    }
                }
            });
            return map;
        },

        /* ------------------------------------------------------------------ */
        // Layer-specific event methods
        /** Focus the specified layer */
        _focusLayer : function(e) {
            this._fireLayerEvent('layer:focus', '_focusedLayer', e);
        },
        /** Focus the specified layer */
        _activateLayer : function(e) {
            this._focusLayer(e);
            this._fireLayerEvent('layer:active', '_activeLayer', e);
        },
        /** Expand layer information */
        _expandLayer : function(e) {
            this._fireLayerEvent('layer:expand', '_expandedLayer', e);
        },
        /** An internal method used to activate/deactivate layers */
        _fireLayerEvent : function(prefix, field, e) {
            console.log(prefix, field, e)
            var app = this;
            if (app[field] && app[field].layer != e.layer) {
                if (app[field].layer) {
                    app.fire(prefix + ':off', app[field]);
                }
                delete app[field];
            }
            if (e.layer) {
                app[field] = e;
                app.fire(prefix + ':on', app[field]);
            }
        }
    });

})();