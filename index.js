(function(context) {

    var attribution = '#map-container .numa-attribution';
    var attributionRef = '#map-container .numa-attribution-ref';

    var CONFIG = {
        debug : false,
        maxZoom : 21,
        container : '#map-container',
        navbar : '#map-container .navbar .nav',
        attribution : '<div style="padding:0.3em;"><a  class="numa-attribution-ref" href="javascript:void(0);">Crédits</a></div>',
        dataUrls : [ './data/environnement.html',
                './data/solidarite.html', './data/emploi.html',  './data/formation.html'
        // './data/info.html',
        // './data/street-art.json',
        // './data/example.html',
        // './data/partners.html'
        ],
        tilesLayer : 'http://{s}.tile.cloudmade.com/d4fc77ea4a63471cab2423e66626cbb6/997/256/{z}/{x}/{y}.png',
        tilesLayer : 'http://{s}.tiles.mapbox.com/v3/guilhemoreau.map-057le4on/{z}/{x}/{y}.png',
        zone : [ [ 0.3474317789077754, 42.86851174046499 ],
                [ 8.350752353668213, 49.86728022412167 ] ]
    };

    var TEMPLATE_DEFAULT_DESCRIPTION = ''
            + '<div data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
            + '<h3><a href="javascript:void(0);" data-action-click="activateLayer"><%=feature.properties.label%></a></h3>'
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
        iconName : 'svg-icon',
        popup : TEMPLATE_DEFAULT_POPUP,
        description : TEMPLATE_DEFAULT_DESCRIPTION,
        dialog : TEMPLATE_DEFAULT_DIALOG,
        updateLayer : function(info) {
            doUpdateLayer(this, info)
        }
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
                + '         <% if (prev){%><a href="javascript:void(0);" data-action-click="! var o=obj.getPrevious();if(o)o.expandLayer()"><div class="fa fa-chevron-left"></div></a>&nbsp;<% } %>'
                + '     </div>'
                + '     <div class="span10">'
                + '         <%=feature.properties.fullContent?feature.properties.fullContent:feature.properties.description%>'
                + '     </div>'
                + '     <div class="span1">'
                + '         <% if (next){ %><a href="javascript:void(0);" data-action-click="! var o=obj.getNext();if(o)o.expandLayer()"><div class="fa fa-chevron-right"></div></a>&nbsp;<% } %>'
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
                + '         <% if (prev){%><a href="javascript:void(0);" data-action-click="! var o=obj.getPrevious();if(o)o.activateLayer()"><div class="fa fa-chevron-left"></div></a>&nbsp;<% } %>'
                + '     </div>'
                + '     <div class="span10">'
                + '         <%=feature.properties.description%>'
                + '     </div>'
                + '     <div class="span1">'
                + '         <% if (next){ %><a href="javascript:void(0);" data-action-click="! var o=obj.getNext();if(o)o.activateLayer()"><div class="fa fa-chevron-right"></div></a>&nbsp;<% } %>'
                + '     </div>'
                + ' </div>'
                + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                + '</div>' + '</div>',
    }
    function tmpl(options) {
        var array = [ {}, TEMPLATE_DEFAULT ].concat(_.toArray(arguments));
        return _.extend.apply(null, array);

    }
    function doUpdateLayer(template, info, options) {
        if (info.isPoint()) {
            var feature = info.getFeature();
            options = options || {};
            options = _.extend({}, template,
                    feature.geometry ? feature.geometry.options : {});
            var iconName = options.iconName;
            if (!iconName) {
                if (!options.iconUrl) {
                    iconName = 'fa fa-map-marker fa-lg';
                } else {
                    iconName = '';
                }
            }
            var iconStyle = options.iconStyle || '';
            var html = '';
            if (options.iconUrl) {
                html += '<img src="' + options.iconUrl + '" ';
            } else {
                html += '<div ';
            }
            html += 'class="map-icon ' + iconName + '" style="' + iconStyle
                    + '"';
            html += ' />';
            // console.log('ICON : ', html, feature.geometry.options)
            var layer = info.getMapLayer();
            setDivIcon(layer, html);
        }
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
        'Point' : tmpl({}),
        'Point:wc' : {
            popup : '<strong>WC</strong>'
        },
        'Point:security' : {
            popup : '<div><strong>Agent de sécurité</strong></div>',
            iconStyle : ' color: red;'
        },
        'Point:screen' : tmpl({
            iconName : 'svg-icon',
            iconUrl : './data/icons/projection.svg'
        }),
        'Point:cafe' : {
            iconName : 'svg-icon',
            popup : '<span><a href="javascript:void(0);" data-action-click="expandLayer"><img src="./images/bloc.png" style="width:200px;"/></a></span><strong><%=feature.properties.label||feature.properties.name%></strong>',
            updateLayer : function(info) {
                doUpdateLayer(this, info)
            }
        },
        'Point:bar' : tmpl({
            iconName : 'svg-icon',
            iconUrl : './data/icons/boissons.svg'
        }),
        'Point:artist' : tmpl({
            iconName : 'svg-icon',
            iconUrl : './data/icons/artiste.svg'
        }),
        'Point:atelier' : tmpl({
            iconName : 'svg-icon',
            iconUrl : './data/icons/projection.svg'
        }),
        'Point:organization' : tmpl({
            iconName : 'fa fa-glass fa-lg',
            iconStyle : 'color:white;',
            description : '<div data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
                    + '<h3><a href="javascript:void(0);" data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></a></h3>'
                    + '<div class="visible-when-active">'
                    + '<div class="pull-right"><%=feature.properties.address%></div>'
                    + '<div style="clear:both;"><%=feature.properties.description%></div>'
                    + '<% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                    + '</div>' + '</div>'
        }),
        'Point:photo' : tmpl(
                TEMPLATE_DEFAULT_SLIDABLE,
                {
                    iconName : 'svg-icon',
                    iconUrl : './data/icons/photo.svg',
                    baseUrl : './data/',
                    popup : '<span><a href="javascript:void(0);" data-action-click="expandLayer"><img src="<%=template.baseUrl%><%= feature.properties.urls[0] %>" style="width:200px;"/></a></span>',
                    description : ''
                            + '<div data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
                            + '<h3><a href="javascript:void(0);" data-action-click="activateLayer"><%=feature.properties.label||feature.properties.name%></a></h3>'
                            + '<div class="visible-when-active">'
                            + ' <% var next=obj.getNext();  var prev=obj.getPrevious(); %>'
                            + ' <div class="row-fluid">'
                            + '     <div class="span1">'
                            + '         <% if (prev){%><a href="javascript:void(0);" class="pull-left" data-action-click="! var o=obj.getPrevious();if(o)o.activateLayer()"><div class="fa fa-chevron-left"></div></a>&nbsp;<% } %>'
                            + '     </div>'
                            + '     <div class="span10">'
                            + '         <% for(var i=0, urls=feature.properties.urls; i<urls.length; i++) {%><p><a href="javascript:void(0);" data-action-click="expandLayer"><img class="thumbnail" src="<%=template.baseUrl%><%=urls[i]%>" /></a></p><%}%>'
                            + '     </div>'
                            + '     <div class="span1">'
                            + '         <% if (next){ %><a href="javascript:void(0);" class="pull-right" data-action-click="! var o=obj.getNext();if(o)o.activateLayer()"><div class="fa fa-chevron-right"></div></a>&nbsp;<% } %>'
                            + '     </div>'
                            + '     <div class="span10">'
                            + '         <%=feature.properties.description%>'
                            + '     </div>'
                            + ' </div>'
                            + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                            + '</div>' + '</div>',
                    dialog : '<% var dialogId=obj.getId("-dialog"); %>'
                            + '<div id="<%=dialogId%>" class="modal hide photoviewer" tabindex="-1" role="dialog" aria-labelledby="<%=dialogId%>-title" aria-hidden="true">'
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
                            + '         <% if (prev){%><a href="javascript:void(0);" data-action-click="! var o=obj.getPrevious();if(o)o.expandLayer()"><div class="fa fa-chevron-left"></div></a>&nbsp;<% } %>'
                            + '         <% if (next){ %><a href="javascript:void(0);" data-action-click="! var o=obj.getNext();if(o)o.expandLayer()"><div class="fa fa-chevron-right"></div></a>&nbsp;<% } %>'
                            + '         <a type="button" data-dismiss="modal" aria-hidden="true" href="javascript:void(0);"><div class="fa fa-times"></div></a>'
                            + '         </span>'
                            + '     </div>'
                            + ' </div>'
                            + ' </div>'
                            + ' <div class="modal-body">'
                            + ' <div class="row-fluid">'
                            + '     <div class="span12 pagination-centered text-center well">'
                            + '         <a href="javascript:void(0);" data-action-click="expandLayer"><img src="<%=template.baseUrl%><%= feature.properties.urls[0] %>"/></a>'
                            + '     </div>'
                            + ' </div>'
                            + ' <div class="row-fluid">'
                            + '     <div class="span2"></div>'
                            + '     <div class="span8">'
                            + '         <%=feature.properties.description%>'
                            + '     </div>'
                            + '     <div class="span2"></div>'
                            + ' </div>'
                            + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                            + ' </div>'
                            + '</div>'
                }),
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
                    opacity : 0.5,
                    weight : 5
                });
            }
        }),
        'LineString:rue' : tmpl(TEMPLATE_DEFAULT_SLIDABLE, {
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    opacity : 0.5,
                    color : 'yellow',
                    weight : 10
                });
            }
        }),
        'LineString:installation' : tmpl({
            updateLayer : function(info) {
                var layer = info.getMapLayer();
                _.extend(layer.options, {
                    opacity : 1,
                    color : 'green',
                    weight : 3
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
            description : '<div class="numa" data-type="<%=feature.geometry.type%>:<%=feature.properties.type%>">'
                    + '<h3 style="margin-bottom: 1em;"><a href="javascript:void(0);" data-action-click="activateLayer"><img src="./data/images/mediapost.jpg" style="width-max: 100%"/></a></h3>'
                    + '<div class="visible-when-active">'
                    + ' <%=feature.properties.description%>'
                    + ' <% if(feature.properties.references){ %><div class="references"><%=feature.properties.references%></div><% } %>'
                    + '</div>' + '</div>',
            popup : '<div style="width:150px"><a href="javascript:void(0);" data-action-click="activateLayer"><img style="width:150px" src="./data/images/mediapost.jpg" style="width-max: 100%" title="NUMA"/></a></div>',
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

    /**
     * Loads data and visualizes them on the map. This method is called when the
     * DOM construction is finished.
     */
    $(function() {
        var map = new InteractiveView(CONFIG, TEMPLATES);

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
            return InteractiveUtils.load(url).then(function(data) {
                if (_.isObject(data)) {
                    return data;
                }
                var str = data + '';
                var obj = InteractiveUtils.parseHTML(url, str);
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
        // Bind attribution dialog box
        .then(function() {
            var r = $(attributionRef);
            r.on('click', function(event) {
                var elm = $(attribution);
                elm.modal('show');
                event.preventDefault();
                event.stopPropagation();
            })
        })
        // Handle errors
        .fail(function(error) {
            console.log('LOADING ERROR:', error)
        }).done();
    });

})();