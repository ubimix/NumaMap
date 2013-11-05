(function(mapConfig) {

    var CONFIG = {
        debug : false,
        maxZoom : 20,
        container : '#map-container',
        dataUrls : [ './data/numa.html', './data/program.html',
                './data/history.html', './data/info.html',
                './data/street-art.json', './data/example.html',
                './data/partners.html' ],
        tilesLayer : 'http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/997/256/{z}/{x}/{y}.png',
        tilesLayer : 'http://{s}.tiles.mapbox.com/v3/guilhemoreau.map-057le4on/{z}/{x}/{y}.png',
        zone : [ [ 2.347303032875061, 48.86909749404887 ],
                [ 2.352399230003357, 48.86683207168444 ] ]
    };

    var TEMPLATE_DEFAULT_DESCRIPTION = ''
            + '<div data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
            + '<h3><a href="javascript:void(0);" data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></a></h3>'
            + '<div class="visible-when-active">'
            + ' <%=feature.properties.description%>'
            + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
            + '</div>' + '</div>';
    var TEMPLATE_DEFAULT_POPUP = '<strong data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></strong>';
    var TEMPLATE_DEFAULT_DIALOG = '<% var dialogId=obj.getId("-dialog"); %>'
            + '<div id="<%=dialogId%>" class="modal hide fade" tabindex="-1" role="dialog" aria-labelledby="<%=dialogId%>-title" aria-hidden="true">'
            + ' <div class="modal-header">'
            + ' <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
            + ' <h3 id="<%=dialogId%>-title"><%=feature.properties.label%></h3>'
            + ' </div>'
            + ' <div class="modal-body">'
            + ' <%=feature.properties.fullContent%>'
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
    var TEMPLATE_DEFAULT_SLIDABLE = {
        dialog : '<% var dialogId=obj.getId("-dialog"); %>'
                + '<div id="<%=dialogId%>" class="modal hide" tabindex="-1" role="dialog" aria-labelledby="<%=dialogId%>-title" aria-hidden="true">'
                + ' <div class="modal-header">'
                + ' <button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>'
                + ' <h3 id="<%=dialogId%>-title"><%=feature.properties.label%></h3>'
                + ' </div>'
                + ' <div class="modal-body">'
                + ' <% var next=obj.getNext();  var prev=obj.getPrevious(); %>'
                + ' <div class="row-fluid">'
                + '     <div class="span1">'
                + '         <% if (prev){%><a href="javascript:void(0);" data-action-click="! var o=obj.getPrevious();if(o)o.expandLayer()"><i class="fa fa-chevron-left"></i></a>&nbsp;<% } %>'
                + '     </div>'
                + '     <div class="span10">'
                + '         <%=feature.properties.fullContent?feature.properties.fullContent:feature.properties.description%>'
                + '     </div>'
                + '     <div class="span1">'
                + '         <% if (next){ %><a href="javascript:void(0);" data-action-click="! var o=obj.getNext();if(o)o.expandLayer()"><i class="fa fa-chevron-right"></i></a>&nbsp;<% } %>'
                + '     </div>'
                + ' </div>'
                + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                + ' </div>'
                + '<div class="modal-footer">'
                + '<button class="btn" data-dismiss="modal" aria-hidden="true">OK</button>'
                + '</div>' + '</div>',
        description : ''
                + '<div data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
                + '<h3><a href="javascript:void(0);" data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></a></h3>'
                + '<div class="visible-when-active">'
                + ' <% var next=obj.getNext();  var prev=obj.getPrevious(); %>'
                + ' <div class="row-fluid">'
                + '     <div class="span1">'
                + '         <% if (prev){%><a href="javascript:void(0);" data-action-click="! var o=obj.getPrevious();if(o)o.activateLayer()"><i class="fa fa-chevron-left"></i></a>&nbsp;<% } %>'
                + '     </div>'
                + '     <div class="span10">'
                + '         <%=feature.properties.description%>'
                + '     </div>'
                + '     <div class="span1">'
                + '         <% if (next){ %><a href="javascript:void(0);" data-action-click="! var o=obj.getNext();if(o)o.activateLayer()"><i class="fa fa-chevron-right"></i></a>&nbsp;<% } %>'
                + '     </div>'
                + ' </div>'
                + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                + '</div>' + '</div>',
    }
    function tmpl(options) {
        var array = [ {}, TEMPLATE_DEFAULT ].concat(_.toArray(arguments));
        return _.extend.apply(null, array);

    }
    function setDivIcon(layer, html) {
        if (layer.setIcon) {
            var icon = L.divIcon({
                className : '',
                html : html
            });
            layer.setIcon(icon);
        }
    }
    var TEMPLATES = {
        ':group' : {
            description : '<div><h2><%=feature.properties.label%></h2></div>'
        },
        'Point' : tmpl({
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(layer, '<i class="fa fa-map-marker fa-lg"'
                        + ' style="color: #00adef;"></i>');
            }
        }),
        'Point:wc' : {
            popup : '<strong>WC</strong>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(layer,
                        '<span style="color: maroon; white-space: nowrap;">'
                                + '<i class="fa fa-male fa-lg"></i>'
                                + '<i class="fa fa-female fa-lg"></i></span>');
            }
        },
        'Point:security' : {
            popup : '<div><strong>Agent de sécurité</strong></div>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(layer,
                        '<i class="fa fa-star-o" style="color: red;"></i>');
            }
        },
        'Point:sos' : {
            popup : '<strong>Poste de secours</strong>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(layer,
                        '<i class="fa fa-plus-square" style="color: red;"></i>');
            }
        },
        'Point:screen' : tmpl({
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(layer,
                        '<i class="fa fa-film fa-lg" style="color: #00adef;"></i>');
            }
        }),
        'Point:sculpture' : tmpl(
                TEMPLATE_DEFAULT_SLIDABLE,
                {
                    updateLayer : function(info) {
                        var layer = info.getMapLayer();
                        setDivIcon(layer,
                                '<i class="fa fa-star fa-lg" style="color: #00adef;"></i>');
                    }
                }),
        'Point:address' : tmpl(
        // TEMPLATE_DEFAULT_SLIDABLE,
        {
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(layer,
                        '<i class="fa fa-star fa-lg" style="color: #00adef;"></i>');
            }
        }),
        'Point:cafe' : tmpl({
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(layer,
                        '<i class="fa fa-glass fa-lg" style="color: white;"></i>');
            }
        }),
        'Point:atelier' : tmpl({
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-lightbulb-o fa-lg" style="color: #fff200;"></i>'
                        });
                layer.setIcon(icon);
            }
        }),
        'Point:organization' : tmpl({
            description : '<div data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
                    + '<h3><a href="javascript:void(0);" data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></a></h3>'
                    + '<div class="visible-when-active">'
                    + '<div class="pull-right"><%=feature.properties.address%></div>'
                    + '<div style="clear:both;"><%=feature.properties.description%></div>'
                    + '<% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                    + '</div>' + '</div>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                var icon = L
                        .divIcon({
                            className : '',
                            html : '<i class="fa fa-glass fa-lg" style="color: white;"></i>'
                        });
                layer.setIcon(icon);
            }
        }),
        'Point:photo' : {
            baseUrl : 'http://ubimix.com:8040/data/images/', // '/data/images/',
            popup : '<span><a href="javascript:void(0);" data-action-click="expandLayer"><img src="<%=template.baseUrl%><%= feature.properties.urls[0] %>" style="width:200px;"/></a></span>',
            dialog : '<% var dialogId=obj.getId("-dialog"); %>'
                    + '<div id="<%=dialogId%>" class="modal hide" tabindex="-1" role="dialog" aria-labelledby="<%=dialogId%>-title" aria-hidden="true">'
                    + ' <% var next=obj.getNext();  var prev=obj.getPrevious(); %>'
                    + ' <div class="modal-header">'
                    + ' <div class="row-fluid">'
                    + '     <div class="span10 thumbnails">'
                    + '         <% if (feature.properties.label) { %>'
                    + '         <h3 id="<%=dialogId%>-title"><%=feature.properties.label%></h3>'
                    + '         <% } %>'
                    + '     </div>'
                    + '     <div class="span2">'
                    + '         <span class="pull-right">'
                    + '         <% if (prev){%><a href="javascript:void(0);" data-action-click="! var o=obj.getPrevious();if(o)o.expandLayer()"><i class="fa fa-chevron-left"></i></a>&nbsp;<% } %>'
                    + '         <% if (next){ %><a href="javascript:void(0);" data-action-click="! var o=obj.getNext();if(o)o.expandLayer()"><i class="fa fa-chevron-right"></i></a>&nbsp;<% } %>'
                    + '         <a type="button" data-dismiss="modal" aria-hidden="true" href="javascript:void(0);"><i class="fa fa-times"></i></a>'
                    + '         </span>'
                    + '     </div>'
                    + ' </div>'
                    + ' </div>'
                    + ' <div class="modal-body">'
                    + ' <div class="row-fluid">'
                    + '     <div class="span12 pagination-centered text-center well">'
                    + '         <img src="<%=template.baseUrl%><%= feature.properties.urls[0] %>"/>'
                    + '     </div>'
                    + ' </div>'
                    + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                    + ' </div>'
                    + '<div class="modal-footer">'
                    + '<button class="btn" data-dismiss="modal" aria-hidden="true">OK</button>'
                    + '</div>' + '</div>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                setDivIcon(
                        layer,
                        '<span style="color: white; white-space: nowrap;">'
                                + '<i class="fa fa-picture-o fa-lg"></i></span>');
            }
        },
        'LineString' : {
            description : '<div><%=feature.properties.description%></div>'
        },
        'LineString:barrage' : {
            popup : '<div>Barrage</div>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    color : 'red',
                    dashArray : '5,5',
                    weight : 3
                });
            }
        },
        'LineString:passage' : tmpl(TEMPLATE_DEFAULT_SLIDABLE, {
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    color : 'yellow',
                    dashArray : '5,5',
                    opacity : 0.1,
                    weight : 5
                });
            }
        }),
        'LineString:rue' : tmpl(TEMPLATE_DEFAULT_SLIDABLE, {
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    opacity : 0.1,
                    color : 'yellow',
                    weight : 10
                });
            }
        }),
        'Polygon' : tmpl({
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    color : 'yellow',
                    weight : 1,
                    fillOpacity : 0.1,
                    opacity : 0.1
                });
            }
        }),
        'Polygon:place' : tmpl(TEMPLATE_DEFAULT_SLIDABLE, {
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    opacity : 0.1,
                    fillOpacity : 0.1,
                    color : 'yellow'
                });
            }
        }),
        'Polygon:numa' : tmpl({
            popup : '<div><h3 data-action-click="activateLayer">NUMA</h3></div>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    color : '#ec008c',
                    weight : 1,
                    fillOpacity : 0.7,
                    opacity : 0.8
                });
            }
        }),
        'Polygon:scene' : tmpl({
            // popup : '<div><strong><a href="javascript:void(0);"
            // data-action-click="activateLayer">'
            // + '<%=feature.properties.label%>'
            // + '</a></strong></div></div>',
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    color : '#00adef',
                    fillColor : '#00adef',
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
        function copy(value, to, toProperty) {
            if (value === undefined)
                return null;
            if (_.isString(value)) {
                value = value.replace(/^\s*|\s*$/gim, '')
                        .replace(/\s+/gim, ' ');
                if (value == '')
                    return null;
            }
            to[toProperty] = value;
            return value;
        }
        e.find('article').each(function() {
            article = $(this);
            var address = article.find('address');
            var geometry = {};
            // Copies the type of this marker
            copy(address.data('geometry'), geometry, 'type');
            // Copies coordinates
            copy(address.data('coordinates'), geometry, 'coordinates');

            // Transforms all 'data-xxx' attributes of the "address" element
            // into a set of options
            var options = {};
            var hasOptions = false;
            var addrElm = address[0];
            if (addrElm) {
                $.each(addrElm.attributes, function(index, attr) {
                    var name = attr.name;
                    if (name != 'data-geometry' && name != 'data-coordinates') {
                        hasOptions = true;
                        name = name.substring('data-'.length);
                        options[name] = attr.value;
                    }
                })
            }
            if (hasOptions) {
                copy(options, geometry, 'options');
            }

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
        this.setMapLayer(options.layer);
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
        getMapLayer : function() {
            return this.options.layer;
        },

        /** Sets a new map layer */
        setMapLayer : function(layer) {
            var that = this;
            that.options.layer = layer;
            if (layer) {
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
                var template = that.getTemplate();
                if (template && template.updateLayer) {
                    template.updateLayer(that);
                }
            }
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

        /** Process the specified template and returns the result */
        _processTemplate : function(str, options) {
            if (!str)
                return null;
            var feature = this.getFeature();
            options = _.extend({
                obj : this,
                feature : feature
            }, (options || {}));
            var result = _.template(str, options)
            return result;
        },

        /** Renders this feature using the specified field of the template */
        render : function(field) {
            var template = this.getTemplate();
            if (!template)
                return null;
            var str = template[field];
            var html = this._processTemplate(str, {
                template : template
            });
            html = $(html);

            var that = this;
            function bindActions(e, event) {
                var action = e.attr('data-action-' + event);
                console.log('ACTION:', e, action)
                if (!action)
                    return;
                var method = null;
                if (action.indexOf('!') == 0) {
                    var actionCode = '<%' + action.substring(1) + '%>';
                    method = function() {
                        that._processTemplate(actionCode);
                    }
                } else {
                    method = that[action];
                }
                if (_.isFunction(method)) {
                    e.on(event, function(event) {
                        event.preventDefault();
                        event.stopPropagation();
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
            var layer = this.getMapLayer();
            if (layer) {
                layer.closePopup();
            }
            // ???
            var map = this.getMap();
            map.closePopup();
        },

        /**
         * Opens a dialog box with additional information about this feature.
         */
        openDialog : function() {
            console.log('openDialog')
            // var feature = this.getFeature();
            // if (!feature.properties.fullContent)
            // return;
            var html = this.render('dialog');
            if (html) {
                _.defer(function() {
                    $(html).modal('show');
                })
            }
        },

        /** Closes already opened popups */
        closeDialog : function() {
            var that = this;
            var dialogId = that.getId('-dialog');
            var elm = $('#' + dialogId);
            elm.modal('hide');
            elm.remove();
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
            var array = [];
            if (geometry && geometry.type) {
                array.push(geometry.type);
            } else {
                array.push('');
            }
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
            console.log('expandLayer')

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

        /* ------------------------------------------------------------------ */
        // Next/previous
        /**
         * Returns a next feature in the parent group.
         */
        getNext : function() {
            return this._getSiblingFeature(+1);
        },

        /**
         * Returns <a previous feature in the parent group.
         */
        getPrevious : function() {
            return this._getSiblingFeature(-1);
        },

        /** Returns the position of this feature in the parent group */
        getPosition : function() {
            var group = this.getGroup();
            return group.getFeaturePosition(this);
        },

        /** Returns a sibling feature at the specified shift position */
        _getSiblingFeature : function(shift) {
            var pos = this.getPosition();
            var group = this.getGroup();
            var result = group.getFeatureAt(pos + shift);
            return result;
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
            this._keys = null;
            this.groupLayer = L.geoJson(null, {
                pointToLayer : function(featureData, latlng) {
                    var layer;
                    var options = featureData.geometry.options || {};
                    var radius = options.radius;
                    if (radius) {
                        layer = new L.Circle(latlng, radius);
                    } else {
                        layer = new L.Marker(latlng);
                    }
                    _.each(options, function(value, key) {
                        var array = key.split('-');
                        var str = array[0];
                        for ( var i = 1; i < array.length; i++) {
                            var segment = array[i];
                            str += segment[0].toUpperCase()
                                    + segment.substring(1);
                        }
                        layer.options[str] = value;
                    })
                    return layer;
                },
                onEachFeature : function(feature, layer) {
                    var info = that.features[feature.id];
                    if (info) {
                        info.setMapLayer(layer);
                    }
                }
            });
            _.each(data.features, function(feature) {
                var info = new FeatureInfo({
                    group : that,
                    feature : feature
                });
                var id = info.getId();
                that.features[id] = info;
                feature.id = id;
                if (feature.geometry && feature.geometry.coordinates
                        && feature.geometry.type) {
                    that.groupLayer.addData([ feature ]);
                } else {
                    var t = info._getFeatureTypeArray();
                    console.log('FEATURE TYPE', t.join(':'));
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

        /** Returns the number of features in this group */
        getLength : function() {
            var featureIds = this.getFeatureIds();
            return featureIds.length;
        },

        /** Returns the position of the specified feature */
        getFeaturePosition : function(feature) {
            var featureId = feature.getId();
            var featureIds = this.getFeatureIds();
            var pos = _.indexOf(featureIds, featureId);
            return pos;
        },

        /** Returns a list of identifiers of all features managed by this group */
        getFeatureIds : function() {
            if (!this._keys) {
                this._keys = _.keys(this.features);
            }
            return this._keys;
        },

        /** Returns a feature from the specified position */
        getFeatureAt : function(pos) {
            var featureIds = this.getFeatureIds();
            if (pos < 0 || pos >= featureIds.length)
                return null;
            var featureId = featureIds[pos];
            return this.features[featureId];
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
                    color : 'white',
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

            /* Show a small popup with the click position */
            if (this.config.debug) {
                var popup = L.popup();
                map.on('click', function(e) {
                    popup.setLatLng(e.latlng).setContent(
                            "<strong>" + e.latlng.lng + ',' + e.latlng.lat
                                    + "</strong>").openOn(map);
                });

            }
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
            e = e || {};
            e.center = true;
            this._focusLayer(e);
            this._fireLayerEvent('layer:active', '_activeLayer', e);
        },
        /** Expand layer information */
        _expandLayer : function(e) {
            this._activateLayer(e);
            this._fireLayerEvent('layer:expand', '_expandedLayer', e);
        },
        /** An internal method used to activate/deactivate layers */
        _fireLayerEvent : function(prefix, field, e) {
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