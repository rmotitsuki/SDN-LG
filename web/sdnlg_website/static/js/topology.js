var DEBUG = false;
// Mock json switch list structures. Used for testing purposes.
var MOCK_JSON_SWITCHES = '[' +
    '{"capabilities": "", "dpid": "0000000000000001", "n_ports": 8, "n_tables": 5},' +
    '{"capabilities": "", "dpid": "0000000000000002", "n_ports": 16, "n_tables": 5},' +
    '{"capabilities": "", "dpid": "0000000000000003", "n_ports": 23, "n_tables": 5},' +
    '{"capabilities": "", "dpid": "0000000000000004", "n_ports": 8, "n_tables": 5},' +
    '{"capabilities": "", "dpid": "0000000000000005", "n_ports": 8, "n_tables": 5},' +
    '{"capabilities": "", "dpid": "0000000000000006", "n_ports": 16, "n_tables": 5},' +
    '{"capabilities": "", "dpid": "0000000000000007", "n_ports": 8, "n_tables": 5}' +
    ']';

// Mock json topology structure. Used for testing purposes.
var MOCK_JSON_TOPOLOGY = '[' +
    '{   "node1": { "dpid": "0000000000000001", "port": { "name": "10Gigabit3", "port_no": 3 } },' +
    '    "node2": { "dpid": "0000000000000002", "port": { "name": "10Gigabit6", "port_no": 6 } },' +
    '    "speed": 10000000000 },' +
    '{   "node1": { "dpid": "0000000000000001", "port": { "name": "10Gigabit5", "port_no": 5 } },' +
    '    "node2": { "dpid": "0000000000000006", "port": { "name": "Gigabit3", "port_no": 3 } },' +
    '    "speed": 1000000000 },' +
    '{   "node1": { "dpid": "0000000000000001", "port": { "name": "10Gigabit8", "port_no": 8 } },' +
    '    "node2": { "dpid": "0000000000000007", "port": { "name": "100Gigabit6", "port_no": 6 } },' +
    '    "speed": 10000000000 },' +
    '{   "node1": { "dpid": "0000000000000002", "port": { "name": "10Gigabit3", "port_no": 3 } },' +
    '    "node2": { "dpid": "0000000000000003", "port": { "name": "10Gigabit4", "port_no": 4 } },' +
    '    "speed": 1000000000 },' +
    '{   "node1": { "dpid": "0000000000000003", "port": { "name": "Gigabit22", "port_no": 22 } },' +
    '    "node2": { "dpid": "0000000000000004", "port": { "name": "Gigabit6", "port_no": 6 } },' +
    '    "speed": 1000000000 },' +
    '{   "node1": { "dpid": "0000000000000003", "port": { "name": "10Gigabit3", "port_no": 3 } },' +
    '    "node2": { "dpid": "0000000000000007", "port": { "name": "100Gigabit4", "port_no": 4 } },' +
    '    "speed": 10000000000 },' +
    '{   "node1": { "dpid": "0000000000000004", "port": { "name": "Gigabit8", "port_no": 8 } },' +
    '    "node2": { "dpid": "0000000000000005", "port": { "name": "Gigabit6", "port_no": 6 } },' +
    '    "speed": 1000000000 },' +
    '{   "node1": { "dpid": "0000000000000005", "port": { "name": "Gigabit3", "port_no": 3 } },' +
    '    "node2": { "dpid": "0000000000000006", "port": { "name": "Gigabit6", "port_no": 6 } },' +
    '    "speed": 1000000000 },' +
    '{   "node1": { "dpid": "0000000000000005", "port": { "name": "Gigabit7", "port_no": 7 } },' +
    '    "node2": { "dpid": "0000000000000007", "port": { "name": "100Gigabit2", "port_no": 2 } },' +
    '    "speed": 1000000000 }' +
    ']';
// Mock json port list
var MOCK_JSON_SWITCH_PORTS = '[' +
    '{ "name": "10Gigabit1", "port_no": 1, "speed": 10000000000, "uptime": 726558 },' +
    '{ "name": "10Gigabit2", "port_no": 2, "speed": 10000000000, "uptime": 614493 },' +
    '{ "name": "10Gigabit3", "port_no": 3, "speed": 10000000000, "uptime": 464014 },' +
    '{ "name": "10Gigabit4", "port_no": 4, "speed": 10000000000, "uptime": 997827 },' +
    '{ "name": "10Gigabit5", "port_no": 5, "speed": 10000000000, "uptime": 632296 },' +
    '{ "name": "10Gigabit6", "port_no": 6, "speed": 10000000000, "uptime": 482803 },' +
    '{ "name": "10Gigabit7", "port_no": 7, "speed": 10000000000, "uptime": 1007698},' +
    '{ "name": "10Gigabit8", "port_no": 8, "speed": 10000000000, "uptime": 418707 }' +
    ']';


var SPEED_100GB = 100000000000;
var SPEED_10GB = 10000000000;
var SPEED_1GB = 1000000000;

/**
This is the class that will create a graph.
*/
var ForceGraph = function(selector, data) {
    // Local variable representing the forceGraph data
    var _data = ''
    _data = data



    // Define contextual menu over the circles
    var menu = function(data) {
        return [
            {
                title: function(d) {
                    var sw = sdntopology.get_switch_by_dpid(d.name);
                    return sw.id;
                },
                disabled: true
            },
            {
                divider: true
            },
            {
                title: function(d) {
                    var sw = sdntopology.get_switch_by_dpid(d.name);
                    return 'Name: ' + sw.get_name();
                },
                disabled: true
            },
            {
                title: 'Interfaces (' + data.data.n_ports + ')',
                action: function(elm, d, i) {
                    sdntopology.call_get_switch_ports(d.dpid);
                }
            },
            {
                title: 'Total traffic: 000',
                action: function() {}
            }
        ];
    };

    var width = 960,
        height = 600;

    // gray color like 'disabled' color
    var default_node_color = "#ccc";
    var default_link_color = "#888";

    var highlight_color = "#4D7C9D";
    var highlight_trans = 0.1;
    // highlight var helpers
    // highlight var helpers
    var focus_node = null, highlight_node = null;

    var min_zoom = 0.1;
    var max_zoom = 7;

    // flag to outline drawing during ondrag
    var outline = false;

    // node/circle size
    var size = d3.scale.pow().exponent(1)
      .domain([1,100])
      .range([8,24]);
    var nominal_base_node_size = 8;
    var nominal_stroke = 1.5;

    var linkedByIndex = {};

	function isConnected(a, b) {
        return linkedByIndex[a.dpid + "," + b.dpid] || linkedByIndex[b.dpid + "," + a.dpid] || a.dpid == b.dpid;
    }

	function hasConnections(a) {
		for (var property in linkedByIndex) {
            s = property.split(",");
            if ((s[0] == a.index || s[1] == a.index) && linkedByIndex[property])
                return true;
		}
	    return false;
	}

    var zoomed = function() {
        container.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var zoom = d3.behavior.zoom()
        .scaleExtent([min_zoom, max_zoom])
        .on("zoom", zoomed);
/*
    svg = d3.select(selector)
        .append("div")
        .classed("svg-container", true) //container class to make it responsive
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + width +" "+ height)
        //class to make it responsive
        .classed("svg-content-responsive", true)
        .append("g")
        .call(zoom);
        ;
    */
    var svg = d3.select(selector).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);;

    var container = svg.append("g");

    // Create the initial svg element and the utilities you will need.
    // These are the actions that won't be necessary on update.
    // For example creating the axis objects, your variables, or the svg container

    this.data = function(value) {
        if ( typeof value === 'undefined') {
            // accessor
            return _data;
        }
        _data = value;
        return this;
        // setter, returns the forceGraph object
    }

    this.draw = function() {
        // draw the force graph using data
        var force_nodes = d3.values(_data.nodes);

        // setting node color labels and color
        var temp_nodes = [];

        for (var x in force_nodes) {
            for (var y in _data.nodes_data) {
                if (force_nodes[x].name == _data.nodes_data[y].name) {
                    force_nodes[x].background_color = _data.nodes_data[y].color.background;
                    force_nodes[x].label = _data.nodes_data[y].label;

                    if (_data.nodes_data[y].borderWidth) {
                        force_nodes[x].stroke_width = _data.nodes_data[y].borderWidth;
                    }
                }
            }
        }

        // setting edge color
        for (var x in _data.links) {
            for (var y in _data.edges_data) {
                if ((_data.links[x].source.name == _data.edges_data[y].from && _data.links[x].target.name == _data.edges_data[y].to) ||
                     (_data.links[x].target.name == _data.edges_data[y].from && _data.links[x].source.name == _data.edges_data[y].to)) {
                    // setting edge color
                    if (_data.edges_data[y].color) {
                        if (typeof _data.links[x].color == 'undefined') {
                            _data.links[x].color = _data.edges_data[y].color;
                        }
                    } else {
                        _data.links[x].color = sdncolor.color_default;
                    }
                }
            }
        }

        for (var x in _data.links) {
            // setting highlight helper
            linkedByIndex[_data.links[x].source.dpid + "," + _data.links[x].target.dpid] = true;
        }

        var force = d3.layout.force()
            .nodes(force_nodes)
            .links(_data.links)
            .size([width, height])
            .linkDistance(120)
            .linkStrength(0.5)
            .charge(-300)
            .on("tick", tick)
            .start();
        // reconfigure drag, so switch drag take precedence over panning
/*
        var drag = force.drag();
            //.on("dragstart", dragstarted)
            //.on("drag", dragged)
            //.on("dragend", dragended);
        function dragstarted(d) {
          d3.event.sourceEvent.stopPropagation();
          d3.select(this).classed("dragging", true);
        }

        function dragged(d) {
            //poc: check the translation.
            //d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
        }

        function dragended(d) {
          d3.select(this).classed("dragging", false);
        }
*/
        // Per-type markers, as they don't inherit styles.


        // Clear nodes and paths
        //container.selectAll("g").remove();

        // draw link paths
        var path = container.append("g").selectAll("path")
            .data(force.links())
            .enter().append("svg:path")
            .attr("class", function(d) {
                var return_var = "";
                if (d.speed >= SPEED_100GB) {
                    return_var = return_var + " link-large";
                } else if (d.speed >= SPEED_10GB) {
                    return_var = return_var + " link-medium";
                } else if (d.speed >= SPEED_1GB) {
                    return_var = return_var + " link-thin";
                }
                return_var = return_var + " link " + d.type;
                return return_var;
            })
            .attr("stroke", function(d) { return d.color; })
            .attr("marker-end", function(d) { return "url(#" + d.type + ")"; });


        // switch draw
        var node = container.selectAll(".node")
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            .on('contextmenu', d3.contextMenu(menu)) // attach menu to element
            .call(force.drag);

        node.on("dblclick.zoom", function(d) {
            d3.event.stopPropagation();
            var dcx = (window.innerWidth/2-d.x*zoom.scale());
            var dcy = (window.innerHeight/2-d.y*zoom.scale());
            zoom.translate([dcx,dcy]);
             g.attr("transform", "translate("+ dcx + "," + dcy  + ")scale(" + zoom.scale() + ")");
        });

        // node mouse highlight
	    node.on("mouseover", function(d) {
              set_highlight(d);
          })
          .on("mousedown", function(d) {
              // stop global drag and force node drag
              d3.event.stopPropagation();
              // focus_node to control highlight events
              focus_node = d;
              set_focus(d)
	          if (highlight_node === null) set_highlight(d)
          })
          .on("mouseout", function(d) {
              exit_highlight();
        });
        d3.select(window).on("mouseup", function() {
            if (focus_node!==null) {
                focus_node = null;
                if (highlight_trans < 1) {
                    circle.style("opacity", 1);
                    text.style("opacity", 1);
                    path.style("opacity", 1);
                }
            }
            if (highlight_node === null) exit_highlight();
        });

    	var tocolor = "fill";
        var towhite = "stroke";
        if (outline) {
            tocolor = "stroke"
            towhite = "fill"
        }

        var circle = node.append("path")
          .attr("d", d3.svg.symbol()
            .size(function(d) { return Math.PI*Math.pow(size(6)||nominal_base_node_size,2); }))
          .style(tocolor, function(d) {
            return d.background_color; })
            //.attr("r", function(d) { return size(d.size)||nominal_base_node_size; })
          .style("stroke-width", nominal_stroke)
          .style(towhite, "white");



        /*
        container.selectAll("circle")
            .on("click", function(){
                d3.select(this).attr('r', 25)
                .style("fill","lightcoral")
                .style("stroke","red");
            });
        */

        // draw switch label
        var text = container.append("g").selectAll("text")
            .data(force.nodes())
            .enter().append("text")
            .attr("x", 8)
            .attr("y", ".31em")
            .text(function(d) { if(d.label) return d.label; return d.name; });

        // draw link source label
        var source_label = container.append("g")
            .selectAll("text")
            .data(force.links())
            .enter().append("text")
            .attr("class", "source-label")
            .text(function(d) { return d.source_label.name; });

        // draw link target label
        var target_label = container.append("g").selectAll("text")
           .data(force.links())
           .enter().append("text")
           .attr("class", "target-label")
           .text(function(d) { return d.target_label.name; });

        // draw link label
        var link_label = container.append("g").selectAll("text")
            .data(force.links())
            .enter().append("text")
            .attr("class", "speed-label")
            .text(function(d) {
                return format_speed(d.speed);
            });

        // Use elliptical arc path segments to doubly-encode directionality.
        function tick() {
            path.attr("d", linkArc);
            node.attr("transform", transform);
            text.attr("transform", transform);
            source_label.attr("transform", transformLinkSourceLabel);
            target_label.attr("transform", transformLinkTargetLabel);
            link_label.attr("transform", transformLinkLabel);
        }

        function linkArc(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y;
                //dr = Math.sqrt(dx * dx + dy * dy);
                //return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
        }

        function transform(d) {
            return "translate(" + d.x + "," + d.y + ")";
        }
        function transformLinkSourceLabel(d) {
            dx = (d.target.x - d.source.x) * 0.2;
            dy = (d.target.y - d.source.y) * 0.2;
            return "translate(" + (d.source.x + dx) + "," + (d.source.y + dy) + ")";
        }
        function transformLinkTargetLabel(d) {
            dx = (d.source.x - d.target.x) * 0.2;
            dy = (d.source.y - d.target.y) * 0.2;
            return "translate(" + (d.target.x + dx) + "," + (d.target.y + dy) + ")";
        }
        function transformLinkLabel(d) {
            dx = (d.source.x - d.target.x) * 0.5;
            dy = (d.source.y - d.target.y) * 0.5;
            return "translate(" + (d.target.x + dx) + "," + (d.target.y + dy) + ")";
        }

        // Highlight onclick functions

        function set_highlight(d) {
            svg.style("cursor","pointer");
            if (focus_node!==null)
                d = focus_node;
            highlight_node = d;

            if (highlight_color!="white") {
                circle.style(towhite, function(o) {
                    return isConnected(d, o) ? highlight_color : "white";});
                text.style("font-weight", function(o) {
                    return isConnected(d, o) ? "bold" : "normal";});
                path.style("stroke", function(o) {
                    return o.source.index == d.index || o.target.index == d.index ? highlight_color : default_link_color;
                });
            }
        }
        function exit_highlight() {
            highlight_node = null;
            if (focus_node===null) {
                svg.style("cursor","move");
                if (highlight_color!="white") {
                    circle.style(towhite, "white");
                    text.style("font-weight", "normal");
                    path.style("stroke", function(o) {return default_link_color});
                }
            }
        }
        // focus highlight (onclick)
        function set_focus(d) {
            if (highlight_trans<1) {
                circle.style("opacity", function(o) {
                    return isConnected(d, o) ? 1 : highlight_trans;
                });
			    text.style("opacity", function(o) {
                    return isConnected(d, o) ? 1 : highlight_trans;
                });
                path.style("opacity", function(o) {
                    return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_trans;
                });
	        }
        }
    }
}


var forcegraph = '';
var sdntopology = '';
var sdncolor = '';

/**
 * SDNColor utility to transform SDN color codes to CSS names.
 */
var SDNColor = function() {
    this.colors = {'1':'darkseagreen', '10':'dodgerblue', '11':'chocolate', '100':'darkorange', '101':'darkviolet', '110':'darkturquoise', '111':'black' }
    this.trace_color_on = '#1AC91A';
    this.trace_color_off = 'lightgray';
    this.color_default = '#8EB5EA';

    /**
     * Get color CSS name.
     *     param code: binary color code
     *     return: CSS color name
     */
    this.get_color = function(code) {
        var result = null;
        $.each( this.colors, function( key, val ) {
            if (key == code) {
                result = val;
            }
        });
        return result;
    }
}


var SDNTopology = function() {
    // switches list. It is used to help render the topology nodes.
    this.switches = [];
    // topology link list
    this.topology = [];

    /**
     * Call ajax to load the switch list.
     */
    this.call_get_switches = function() {
        var ajax_done = function(jsonObj) {
            for (var x = 0; x < jsonObj.length; x++) {
                // storing switch values
                var switch_obj = new Switch(jsonObj[x].dpid);
                switch_obj.n_ports = jsonObj[x].n_ports;
                switch_obj.n_tables = jsonObj[x].n_tables;
                sdntopology.switches.push(switch_obj);
            }
            // sort
            sdntopology.switches = sdntopology.switches.sort();
            // deduplication
            sdntopology.switches = array_unique_fast(sdntopology.switches);
        }

        // AJAX call
        if (DEBUG) {
            json = MOCK_JSON_SWITCHES;
            var jsonobj = $.parseJSON(json);
            ajax_done(jsonobj);
        } else {
            var jqxhr = $.ajax({
                url:"/switches",
                dataType: 'json',
                crossdomain:true,
            }).done(function(json) {
                ajax_done(json);
            })
            .fail(function() {
                console.log( "error" );
            })
            .always(function() {
                console.log( "complete" );
            });
        }
    }

    this.get_switch_by_dpid = function(dpid) {

        // add to topology list to render the html
        for (var key in sdntopology.switches) {
            if (sdntopology.switches[key].id == dpid) {
                return sdntopology.switches[key];
            }
        }
    }

    /**
    * Use this function instead of access the topology attribute.
    */
    this.add_topology = function(link) {

        // add to topology list to render the html
        this.topology.push(link);
    }

    /**
     * Call ajax to load the switch topology.
     */
    this.call_get_topology = function() {
        // hiding topology graphic panel

        $('#topology__canvas').hide();

        var ajax_done = function(json) {
            var jsonObj;
            jsonObj= json;

            // verify if the json is not a '{}' response
            if (!jQuery.isEmptyObject(jsonObj)) {
                $('#topology__elements').show();
                $.each( jsonObj, function( key, link ) {
                    var linkObj = new Link();
                    linkObj.speed = link.speed;

                    linkObj.node1 = new Switch(link.node1.dpid);
                    linkObj.node2 = new Switch(link.node2.dpid);

                    linkObj.label1 = link.node1.port.name;
                    linkObj.label2 = link.node2.port.name;

                    sdntopology.add_topology(linkObj);
                });

                // render HTML data
                sdntopology.render_html_topology();

                // render D3 force
                $('#topology__canvas').show();
                d3lib.render_topology();
            }
        }

        // AJAX call
        if (DEBUG) {
            json = MOCK_JSON_TOPOLOGY;
            var jsonobj = $.parseJSON(json);
            ajax_done(jsonobj);
        } else {
            var jqxhr = $.ajax({
                url: "/links",
                dataType: 'json',
            }).done(function(json) {
                ajax_done(json);
            })
            .fail(function() {
                console.log( "error" );
            })
            .always(function() {
                console.log( "complete" );
            });
        }
    }

    /**
     * Call ajax to load the switch ports data.
     */
    this.call_get_switch_ports = function(dpid) {
        var ajax_done = function(json) {
            var jsonObj;
            jsonObj= json;

            // verify if the json is not a '{}' response
            if (!jQuery.isEmptyObject(jsonObj)) {
                // render D3 popup
                popup_switch(dpid, jsonObj);
            }
        }

        var popup_switch = function(dpid, data) {
            // remove possible popups
            d3.select(".canvas")
                .selectAll(".popup")
                .remove();

             // Build the popup
            popup = d3.select(".canvas")
                .append("div")
                .attr("class", "popup")
                .attr("id", "switch_popup");
            // close icon
            popup.append("button")
                .attr("type", "button")
                .attr("class", "close")
                .append("span")
                    .html('&times;')
                    // removing the popup
                    .on("click", function(d) {
                            d3.select(".canvas")
                            .selectAll(".popup")
                            .remove();
                        });
            // popup content
            popup.append("div").attr("class","popup_header")
                .text(dpid);
            popup.append("div").attr("class","popup_header")
                .text("Interfaces (" + data.length + "):")
            popup.append("hr");
            var popup_body = popup.append("div")
                .attr("class","popup_body")

            var update_popup_body = popup_body.selectAll("p").data(data);
            update_popup_body
                .enter()
                .append("p")
                .append("a")

                // adding click function
                .on("click", function(d) {
                    popup.selectAll(".popup_body").remove();
                    var popup_body = popup.append("div")
                        .attr("class","popup_body")
                    popup_body.append("p").text("Port n.: " + d.port_no);
                    popup_body.append("p").text("Port name: " + d.name);
                    popup_body.append("p").text("Port speed: " + format_speed(d.speed));
                    popup_body.append("p").text("Port uptime: " + d.uptime);
                    // adding back button
                    popup_body.append("p")
                        .append("a")
                        .text("back")
                        .on("click", function() { popup_switch(dpid, data); });
                 })
                .text(function(d) { return d.port_no + " - " + d.name; })
                ;
            update_popup_body.exit();
        }

        // AJAX call
        if (DEBUG) {
            json = MOCK_JSON_SWITCH_PORTS;
            var jsonobj = $.parseJSON(json);
            ajax_done(jsonobj);
        } else {
            var jqxhr = $.ajax({
                url: "/switches/" + dpid + "/ports",
                dataType: 'json',
            }).done(function(json) {
                ajax_done(json);
            })
            .fail(function() {
                console.log( "error" );
            })
            .always(function() {
                console.log( "complete" );
            });
        }
    }


    /**
     * Render HTML of the topology.
     */
    this.render_html_topology = function() {
        if (sdntopology.topology) {

            $('#topology__canvas').show();
            $('#topology__elements').show();

            html_content = ""
            html_content += "<div class='row'>";
            html_content += "<div class='col-sm-12 col-md-12'>"
            html_content += "<table id='switches_topology_table' class='table'><tbody>"

            for (var x = 0; x < sdntopology.topology.length; x++) {
                html_content += "<tr>"
                html_content += "<td>";

                // display nice switch name
                var temp_switch = new Switch(sdntopology.topology[x].node1);
                html_content += temp_switch.get_name_or_id();

                // start left content, origin switch
                html_content += "</td><td>";
                html_content += "</td>";
                // end left content, origin switch

                html_content += "<td><span class='glyphicon glyphicon-arrow-right' aria-hidden='true'></span></td>";
                html_content += "<td>"

                // start right content, destination switch
                if (sdntopology.topology[x].node2) {
                    html_content += "<li>"
                    // display nice switch name
                    var temp_switch = sdntopology.topology[x].node2;
                    html_content += temp_switch.get_name_or_id();
                    html_content += "</li>"
                    html_content += "</td><td>";
                } else {
                    html_content += "</td><td>";
                }
                html_content += "</td></tr>"
                // end right content, destination switch
            }
            html_content += "</tbody></table>";
            html_content += "</div>";

            $('#topology__elements__list').html(html_content);
        }
    }
}

var Link = function() {
    // Switch obj
    this.node1 = null;
    this.node2 = null;

    // String
    this.label1 = null;
    this.label2 = null;

    // number. Bits per second.
    this.speed = null;

}

/**
 * Switch representation.
 */
var Switch = function(switch_id) {
    this.id = switch_id;
    this.dpid = switch_id;

    this.n_ports;
    this.n_tables;

    /**
     * Get switch fantasy name from configuration data.
     */
    this.get_name = function() {
        if (typeof SDNLG_CONF != 'undefined') {
            var name = SDNLG_CONF.dict[this.id];
            if (name != undefined) {
                return name;
            }
        }
        return null;
    }

    /**
     * Get switch fantasy name from configuration data.
     * If there is no name return the switch ID.
     */
    this.get_name_or_id = function() {
        if (typeof SDNLG_CONF != 'undefined') {
            var name = SDNLG_CONF.dict[this.id];
            if (name != undefined) {
                return name;
            }
        }
        return this.id;
    }

    /**
     * Get switch fantasy name from configuration data.
     * Return verbose name as: <ID> - <NAME>
     */
    this.get_verbose_name = function() {
        if (typeof SDNLG_CONF != 'undefined') {
            var name = SDNLG_CONF.dict[this.id];
            if (name != undefined) {
                return this.id + ' - ' + name;
            }
        }
        return this.id;
    }

    /**
     * Get switch fantasy name from configuration data.
     * Return verbose name to be used on vis.js: <ID>\n<NAME>
     */
    this.get_node_name = function() {
        if (typeof SDNLG_CONF != 'undefined') {
            var name = SDNLG_CONF.dict[this.id];
            if (name != undefined) {
                return name;
            }
        }
        return this.id;
    }
}
// Return switch id if the class is used with strings
Switch.prototype.toString = function(){ return this.id; };


/**
 * Switch port representation.
 */
var Port = function(port_id, label) {
    this.id = port_id;
    this.label = label;
}
// Return switch port id if the class is used with strings
Port.prototype.toString = function(){ return this.id; };


var D3JS = function() {
    this.nodes = null;
    this.edges = null;
    /**
     * Render topology using topology data saved in sdntopology object.
     * It uses the vis.js graph library.
     * You must load the sdntopology switch and topology data before trying to render the topology.
     */
    this.render_topology = function() {
        this._render_network(false, false);
    }
    this.render_topology_colors = function() {
        this._render_network(true, false);
    }

    /**
     * Create D3JS network nodes.
     * We use the sdntopology.switch list to create the nodes and expect that the topology will have the same
     * node identification to draw the network edges.
     */
    this._create_network_nodes = function(with_colors, with_trace) {
        // create an array with nodes
        var nodesArray = [];
        for (x = 0; x < sdntopology.switches.length; x++) {
            node_id = sdntopology.switches[x].id;
            // positioning in spiral mode to help the physics animation and prevent crossing lines
            angle = 0.1 * x;
            node_obj = {id: node_id, dpid: node_id, name: node_id, data:sdntopology.switches[x], label:sdntopology.switches[x].get_node_name(), x:(1+angle)*Math.cos(angle), y:(1+angle)*Math.sin(angle), physics:true, mass:2, borderWidth:1};
            // Trace coloring
            if (typeof(node_obj.color)==='undefined') {
                node_obj.color = {'background' : sdncolor.color_default};
            }
            nodesArray.push(node_obj);
        }
        this.nodes = nodesArray;
    }

    /**
     * Check if edge object already exists inside an array of edges.
     * It check from->to and to->from edges.
     * Returns the array object if exists, or false.
     */
    this._has_edge_path = function(edge_array, edge) {
        for (var x = 0; x < edge_array.length; x++) {
            if ((edge.from == edge_array[x].from && edge.to == edge_array[x].to) ||
                (edge.to == edge_array[x].from && edge.from == edge_array[x].to)) {

                return edge_array[x];
            }
        }
        return false;
    }

    /**
     * Create D3JS network edges.
     * This function can be used to create the topology, topology with color and
     * topology with tracing.
     */
    this._create_network_edges = function(with_colors, with_trace) {
        var edgesArray = [];

        // verify topology to create edges
        for (var x = 0; x < sdntopology.topology.length; x++) {
            node_from_id = sdntopology.topology[x].node1;
            node_to_id = sdntopology.topology[x].node2;

            label_from = sdntopology.topology[x].label1;
            label_to = sdntopology.topology[x].label2;

            speed = sdntopology.topology[x].speed;


            edgeObj = {id:x, name:x, source: node_from_id, target: node_to_id, source_label:label_from, target_label:label_to, speed:speed, arrows:'to', type: "suit"};
            // Verify trace to change edge colors and labels.
            has_edge_path_obj = this._has_edge_path(edgesArray, edgeObj);
            edgesArray.push(edgeObj);
        }
        this.edges = edgesArray;
    }

    this._render_network = function(with_colors, with_trace) {
        with_colors = typeof with_colors !== 'undefined' ? with_colors : true;
        with_trace = typeof with_trace !== 'undefined' ? with_trace : true;

        this.resetAllNodes();

        // create an array with nodes
        this._create_network_nodes(with_colors, with_trace);

        // create an array with edges
        this._create_network_edges(with_colors, with_trace);

        // create a network
        var selector = "#topology__canvas";
        var data = {
            nodes: [],
            links: []
        };

        // Node attribute to store json data
        data.nodes_data = this.nodes;

        // creating Force Graph paths
        for (var key in this.nodes) {
            data.nodes[this.nodes[key].dpid] = this.nodes[key];
        }

        // creating Force Graph paths
        for (var key in this.edges) {
            data.links.push(this.edges[key]);
        }

        // Compute the distinct nodes from the links.
        data.links.forEach(function(link) {
          link.source = data.nodes[link.source] || (data.nodes[link.source] = {name: link.source});
          link.target = data.nodes[link.target] || (data.nodes[link.target] = {name: link.target});

          link.source_label = {name: link.source_label};
          link.target_label = {name: link.target_label};
          //link.speed = link.speed;
        });

        // Link attribute to store json data
        data.edges_data = this.edges;

        // creating Force Graph nodes
        // Set the new data
        forcegraph.data(data);
        // Create the graph object
        // Having myGraph in the global scope makes it easier to call it from a json function or anywhere in the code (even other js files).
        forcegraph.draw();
        // Draw the graph for the first time
    }

    this.resetAllNodes = function() {
        if (this.nodes) {
            this.nodes = [];
        }
        if (this.edges) {
            this.edges = [];
        }
    }
}

/* Initial data lod */
/* Call ajax to load switches and topology */
var _initial_data_load = function() {
    // Clearing contents
    $('#switches_select').html("<option>---</option>");
    $('#switch-ports-content').html('');
    $('#topology__elements__list').html('');

    // Hiding panels
    $('#switch-ports').hide();
    $('#trace-result-panel').hide();
    $('#topology__elements').hide();
    $('#topology__canvas').hide();

    // load switches data
    sdntopology.call_get_switches();
    // load topology data
    sdntopology.call_get_topology();
}

/* Initial load */
$(function() {
    // Configure toolbar handlers
    // Topology port labels handler
    $('#topology__toolbar__btn__label__link').click(function() {
        if ($(this).hasClass("active")) {
            $('.target-label').hide();
            $('.source-label').hide();
        } else {
            $('.target-label').show();
            $('.source-label').show();
        }
    });
    // Topology speed link labels handler
    $('#topology__toolbar__btn__label__speed').click(function() {
        if ($(this).hasClass("active")) {
            $('.speed-label').hide();
        } else {
            $('.speed-label').show();
        }
    });

    // Initialize classes
    sdncolor = new SDNColor();

    sdntopology = new SDNTopology();

    // Initialize D3 Topology force graph
    d3lib = new D3JS();
    var selector = "#topology__canvas";
    var data = {
        nodes: [],
        links: []
    };
    forcegraph = new ForceGraph(selector,data);

    // initial data load (switch list, topology, colors)
    _initial_data_load();
});
