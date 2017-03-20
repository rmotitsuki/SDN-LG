var DEBUG = true;
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
// Mock json trace
var MOCK_JSON_TRACE = '["0000000000000001", "0000000000000002", "0000000000000003"]';
var MOCK_JSON_TRACE = '["0000000000000001", "0000000000000002", "0000000000000003"]';


var SPEED_100GB = 100000000000;
var SPEED_10GB = 10000000000;
var SPEED_1GB = 1000000000;



var SIZE = {'switch': 16,
            'port': 8,
            'host': 10};

var DISTANCE = {'switch': 15 * SIZE['switch'],
                'port': SIZE['switch'] + 16,
                'host': 1 * SIZE['port']};

/**
This is the class that will create a graph.
*/
var ForceGraph = function(p_selector, p_data) {
    // Local variable representing the forceGraph data
    var _data = ''
    _data = p_data



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
                    sdntopology.call_get_switch_ports(d.dpid, sdntopology._render_html_popup_ports);
                }
            },
            {
                title: 'Total traffic: 000',
                action: function() {}
            },
            {
                title: 'Trace',
                action: function(elm, d, i) {
                    sdntopology.show_trace_form(d);
                }
            }
        ];
    };

    var width = 960,
        height = 600;

    var highlight_transparency = 0.1;
    // highlight var helpers
    // highlight var helpers
    var focus_node = null;

    var min_zoom = 0.1;
    var max_zoom = 7;

    // flag to outline drawing during ondrag
    var outline = false;

    // node/circle size
    var size = d3.scaleLinear()
      .domain([1,100])
      .range([8,24]);
    var nominal_base_node_size = 8;
    var nominal_stroke = 1.5;

    var _linkedByIndex = new Map();

    function addConnection(a, b) {
        /**
         a: source switch dpid
         b: target switch dpid
        */
        _linkedByIndex.set(a + "," + b, true);
    }

	function isConnected(a, b) {
        return _linkedByIndex.has(a.dpid + "," + b.dpid) || _linkedByIndex.has(b.dpid + "," + a.dpid) || a.dpid == b.dpid;
    }

    // zoom behavior
    var zoomed = function(d) {
        container.attr("transform", "translate(" + d3.event.transform.x + "," + d3.event.transform.y + ")scale(" + d3.event.transform.k + ")");
    }
    // zoom configuration
    var zoom = d3.zoom()
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
    var svg = d3.select(p_selector)
        .append("svg")
            .attr("width", "100%")
            .attr("height", "100%")
            .call(zoom);

    var container = svg.append("g");

    // ForceGraph set data. Remember to redraw the simulation after the set.
    this.data = function(value) {
        if ( typeof value === 'undefined') {
            // accessor
            return _data;
        }
        _data = value;
        console.log(value);

        return this;
    }

    var force = d3.forceSimulation()
        .force("link",
            d3.forceLink()
                .id(function(d) { return d.id })
                .distance(function(d) {
                    if (d.edgetype == 's_p') {
                        return 0;
                    }
                    return DISTANCE['switch'];
                })
                .strength(0.5)
        )
        .force("charge", d3.forceManyBody().strength(-40))
        .force("center", d3.forceCenter(width / 2, height / 2))
    .alphaTarget(0.05)
    .on("tick", ticked);

    // switch node
    var node = container
        .append("g")
        .attr("class", "nodes")
        .selectAll("circle")
    // draw link paths
    var path = container.append("g")
        .attr("class", "paths")
        .selectAll("path");
    // draw switch label
    var text = container.append("g").selectAll("text");
    // draw link label
    var link_label = container.append("g").selectAll("text");


    var _nodeDragstarted = function (d) {
        if (d.type == 'port') { return " node_port"; }
        if (!d3.event.active) force.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }

    var _nodeDragged = function (d) {
        if (d.type == 'port') { return " node_port"; }
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    var _nodeDragended = function (d) {
        if (d.type == 'port') { return " node_port"; }
        if (!d3.event.active) force.alphaTarget(0);
        focus_node = null;
        exit_highlight(d);
    }



    // Highlight onclick functions
    function set_highlight(d) {
        svg.style("cursor","pointer");
        if (focus_node!==null)
            d = focus_node;
        node.attr("fill", function(o) {
                return isConnected(d, o) ? sdncolor.NODE_COLOR_HIGHLIGHT[o.type] : sdncolor.NODE_COLOR[o.type];});
        text.style("font-weight", function(o) {
            return isConnected(d, o) ? "bold" : "normal";});
//
//                source_label.style(towhite, function(o) {
//                    return isConnected(d, o) ? highlight_color : "white";});
//
//                target_label.style(towhite, function(o) {
//                    return isConnected(d, o) ? highlight_color : "white";});
//
//                link_label.style(towhite, function(o) {
//                    return isConnected(d, o) ? highlight_color : "white";});

        path.style("stroke", function(o) {
            return o.source.index == d.index || o.target.index == d.index ? sdncolor.LINK_COLOR_HIGHLIGHT['switch'] : sdncolor.LINK_COLOR['switch'];
        });
    }
    function exit_highlight(d) {
        svg.style("cursor","move");
        node.attr("fill", function(o) { return o.background_color; })
            .style("opacity", 1);
            //.style(towhite, "white");
        path.style("opacity", 1)
            .style("stroke", function(o) { return sdncolor.LINK_COLOR[d.type]; });
        text.style("opacity", 1)
            .style("font-weight", "normal");;
    }


    // focus highlight (on node mousedown)
    function set_switch_focus(d) {
        // Set data info panel
        if(d && d.data) {
            $('#port_panel_info').hide();
            $('#switch_to_panel_info').hide();
            _set_switch_focus_panel_data(d);
        }

        // Set nodes and links opacity to all of them that are not connected to the clicked node
        if (highlight_transparency < 1) {
            node.style("opacity", function(o) {
                return isConnected(d, o) ? 1 : highlight_transparency;
            });
            text.style("opacity", function(o) {
                return isConnected(d, o) ? 1 : highlight_transparency;
            });
            path.style("opacity", function(o) {
                return o.source.index == d.index || o.target.index == d.index ? 1 : highlight_transparency;
            });
        }
        // Set the focused node to the highlight color
        node.attr("fill", function(o) {
                return isConnected(d, o) ? sdncolor.NODE_COLOR_HIGHLIGHT[o.type] : sdncolor.NODE_COLOR[o.type];})
            .style("opacity", function(o) {
                return isConnected(d, o) ? 1 : highlight_transparency;
            });
    }


    /** use with set_switch_focus to set the lateral panel data  */
    function _set_switch_focus_panel_data(d) {
        $('#switch_panel_info').show();
        $('#switch_panel_info_dpid_value').html(d.data.dpid);
        var name = d.data.get_name();
        if (name && name.length > 0) {
            $('#switch_panel_info_name').show();
            $('#switch_panel_info_name_value').html(name);
        } else {
            $('#switch_panel_info_name').hide();
        }
        $('#switch_panel_info_flows_value').html(d.data.n_ports);
    }

    function set_port_focus(d) {
        // Set data info panel
        if(d && d.data) {
            $('#port_panel_info').show();
            var name = d.data.label;
            console.log(name);
            if (name && name.length > 0) {
                $('#port_panel_info_name').show();
                $('#port_panel_info_name_value').html(name);
            } else {
                $('#port_panel_info_name').hide();
            }
            _set_switch_focus_panel_data(d.from_sw);
        }
    }


    function linkArc(d) {
        d3.selectAll("line")
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
    }

    function transform(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }

    function transformNode(d) {
        return_val = '';
        if (d.type == "port") {
            var new_positions = radius_positioning(d.from_sw.x, d.from_sw.y, d.to_sw.x, d.to_sw.y);
            var dx = new_positions[0];
            var dy = new_positions[1];
            return_val = "translate(" + dx + "," + dy + ")";
        } else {
            return_val = "translate(" + d.x + "," + d.y + ")";
        }
        return return_val;
    }
    function transformLabel(d) {
        var dx = d.x;
        var dy = d.y;
        if (d.type == "port") {
            var new_positions = radius_positioning(d.from_sw.x, d.from_sw.y, d.to_sw.x, d.to_sw.y);
            dx = new_positions[0];
            dy = new_positions[1];
            return_val = "translate(" + dx + "," + dy + ")";
        } else {
            dx = dx - SIZE[d.type] / 2.0;
            return_val = "translate(" + dx + "," + dy + ")";
        }
        return return_val;
    }
    function transformLinkSourceLabel(d) {
        var new_positions = radius_positioning(d.source.x, d.source.y, d.target.x, d.target.y);
        var dx = new_positions[0] - SIZE['port'];
        var dy = new_positions[1] + SIZE['port']/2.0;
        return "translate(" + dx + "," + dy + ")";
    }
    function transformLinkTargetLabel(d) {
        var new_positions = radius_positioning(d.target.x, d.target.y, d.source.x, d.source.y);
        var dx = new_positions[0]
        var dy = new_positions[1]
        return "translate(" + dx + "," + dy + ")";
    }
    function transformLinkLabel(d) {
        dx = (d.source.x - d.target.x) * 0.5;
        dy = (d.source.y - d.target.y) * 0.5;
        return "translate(" + (d.target.x + dx) + "," + (d.target.y + dy) + ")";
    }

    // Use elliptical arc path segments to doubly-encode directionality.
    function ticked(d) {

        d3.selectAll("line").attr("d", linkArc);
        d3.selectAll("circle").attr("transform", transformNode);
        d3.selectAll(".node_text").attr("transform", transformLabel);
        d3.selectAll(".speed-label").attr("transform", transformLinkLabel);
    }

    this.draw = function() {
        force.stop();


        // setting edge color
//        for (var x in _data.links) {
//            for (var y in _data.edges_data) {
//                if ((_data.links[x].source.name == _data.edges_data[y].from && _data.links[x].target.name == _data.edges_data[y].to) ||
//                     (_data.links[x].target.name == _data.edges_data[y].from && _data.links[x].source.name == _data.edges_data[y].to)) {
//                    // setting edge color
//                    if (_data.edges_data[y].color) {
//                        if (typeof _data.links[x].color == 'undefined') {
//                            _data.links[x].color = _data.edges_data[y].color;
//                        }
//                    } else {
//                        _data.links[x].color = sdncolor.color_default;
//                    }
//                }
//            }
//        }
//
//        for (var x in _data.links) {
//            // setting highlight helper
//            addConnection(_data.links[x].source.id, _data.links[x].target.id);
//        }


        // reconfigure drag, so switch drag take precedence over panning
        // Per-type markers, as they don't inherit styles.

        // draw link paths
        path = path.data(_data.links, function(d) { return d.id; });

        path = path
            .enter()
                .append("line")
                    .attr("class", function(d) {
                        var return_var = "";
                        if (d.speed >= SPEED_100GB) {
                            return_var = return_var + "link-path link-large";
                        } else if (d.speed >= SPEED_10GB) {
                            return_var = return_var + "link-path link-medium";
                        } else if (d.speed >= SPEED_1GB) {
                            return_var = return_var + "link-path link-thin";
                        }
                        return_var = return_var + "link-path link " + d.type;
                        return return_var;
                    })
                    .attr("marker-end", function(d) { return "url(#" + d.type + ")"; })
                    .style("stroke", function(d) {
                        if (d.edgetype == 's_p') {
                            return '#fff';
                        }
                        return d.color;
                    });

        // switch draw
        node = node.data(_data.nodes, function(d) { return d.id;});

        node = node
            .enter()
                .append("circle")
                //teste
                .attr("r", function(d) { return SIZE[d.type]||nominal_base_node_size; })
                .attr("fill", function(d) { return d.background_color; })
                .style(tocolor, function(d) { return d.background_color; })
                .attr("class", function(d) {
                    if (d.type == 'port') { return " node_port"; }
                    return "";
                })
                .style("visibility", function(d) {
                    if (d.type == 'port') { return "hidden"; }
                    return "visible";
                })
                .on('contextmenu', d3.contextMenu(menu)) // attach menu to element
                .on("mouseover", function(d) {
                    if (d.type == 'port') { return; }
                    if (d.type == 'switch') { set_highlight(d); }
                })
                .on("mousedown", function(d) {
                    d3.event.stopPropagation();
                    if (d.type == 'port') {
                        set_port_focus(d);
                    } else {
                        // focus_node to control highlight events
                        focus_node = d;
                        set_switch_focus(d)
                    }
                })
                .on("mouseout", function(d) {
                    if (d.type == 'port') { return; }
                    if (focus_node === null) { exit_highlight(d); }
                })
                .on("click", function(d) {
                    if (d.type == 'port') { return; }
                    focus_node = null;
                    exit_highlight(d);
                })
                .on("dblclick.zoom", function(d) {
                    d3.event.stopPropagation();
                })
                .call(d3.drag()
                    .on("start", _nodeDragstarted)
                    .on("drag", _nodeDragged)
                    .on("end", _nodeDragended));

    	var tocolor = "fill";
        var towhite = "stroke";
        if (outline) {
            tocolor = "stroke"
            towhite = "fill"
        }
        // draw switch label
        text = text
            .data(_data.nodes, function(d) { return d.id;})
            .enter()
                .append("text")
                    .attr("class", function(d) {
                        if (d.type == 'port') { return "node_text text_port"; }
                        return "node_text";
                    })
                    .attr("x", 0)
                    .attr("y", ".1em")
                    .style("visibility", function(d) {
                        if (d.type == 'port') { return "hidden"; }
                        return "visible";
                    })
                    .text(function(d) { if(d.label) return d.label; return d.name; });

        // draw link label
        link_label = link_label
            .data(_data.links)
            .enter()
                .append("text")
                    .attr("class", "speed-label")
                    .text(function(d) { return format_speed(d.speed); });

        // setting data
        force.nodes(_data.nodes, function(d) { return d.id;});
        force.force("link").links(_data.links, function(d) { return d.source.id + "-" + d.target.id; });

        // restart force animation
        force.restart();
    }
}

function radius_positioning(cx, cy, x, y) {
  delta_x = x - cx;
  delta_y = y - cy;
  rad = Math.atan2(delta_y, delta_x);
  new_x = cx + Math.cos(rad) * DISTANCE['port'];
  new_y = cy + Math.sin(rad) * DISTANCE['port'];

  return [new_x, new_y];
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


    this.NODE_COLOR = {'switch': '#8EB5EA',
                      'port': "#0cc"};
    this.NODE_COLOR_HIGHLIGHT = {'switch': "#4D7C9D",
                                'port': "#007C9D"};

    //var NODE_BORDER_COLOR = {'switch': 30,
    //                         'port': 5};

    this.LINK_COLOR = {'switch': "#888",
                      'port': "#888"};
    //var NODE_BORDER_COLOR_HIGHLIGHT = {'switch': 30,
    //                                   'port': 5};
    this.LINK_COLOR_HIGHLIGHT = {'switch': "#4D7C9D"};
    this.LINK_COLOR_HIDE = {'switch': 'white'};

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
                console.log( "call_get_switches ajax error" );
            })
            .always(function() {
                console.log( "call_get_switches ajax complete" );
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

                    // creating switch
                    linkObj.node1 = new Switch(link.node1.dpid);
                    linkObj.node2 = new Switch(link.node2.dpid);

                    // creating switch ports
                    var node1_port = new Port(link.node1.dpid +'_'+ link.node1.port.port_no, link.node1.port.port_no, link.node1.port.name);
                    linkObj.node1.ports = [];
                    linkObj.node1.ports.push(node1_port);

                    // creating switch ports
                    var node2_port = new Port(link.node2.dpid +'_'+ link.node2.port.port_no, link.node2.port.port_no, link.node2.port.name);
                    linkObj.node2.ports = [];
                    linkObj.node2.ports.push(node2_port);


                    linkObj.label1 = link.node1.port.name;
                    linkObj.label2 = link.node2.port.name;

                    linkObj.label_num1 = link.node1.port.port_no;
                    linkObj.label_num2 = link.node2.port.port_no;

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
                console.log( "call_get_topology ajax error" );
            })
            .always(function() {
                console.log( "call_get_topology ajax complete" );
            });
        }
    }

    /**
     * Call ajax to load the switch ports data.
     */
    this.call_get_switch_ports = function(dpid, callback=null) {
        var ajax_done = function(json) {
            var jsonObj;
            jsonObj= json;

            // verify if the json is not a '{}' response
            if (callback != null && !jQuery.isEmptyObject(jsonObj)) {
                // render D3 popup
                try {
                    callback(dpid, jsonObj);
                }
                catch(err) {
                    console.log("Error callback function: " + callback);
                    throw err;
                }

            }
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
                console.log( "call_get_switch_ports ajax error" );
            })
            .always(function() {
                console.log( "call_get_switch_ports ajax complete" );
            });
        }
    }

    this._render_html_popup_ports = function(dpid, jsonObj) {
        /**
        Callback to be used with the AJAX that retrieve switch ports.
        */

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
            popup.append("div")
                .attr("class","popup_header")
                .text(dpid);
            popup.append("div")
                .attr("class","popup_header")
                .text("Interfaces (" + data.length + "):")
            popup.append("hr");
            var popup_body = popup
                .append("div")
                .attr("class","popup_body")

            var update_popup_body = popup_body
                .selectAll("p")
                .data(data)
                .enter()
                    .append("p")
                        .append("a")
                            // adding click function
                            .on("click", function(d) {
                                popup.selectAll(".popup_body").remove();
                                var popup_body = popup.append("div").attr("class","popup_body")
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
                            .text(function(d) { return d.port_no + " - " + d.name; });
            update_popup_body.exit();
        }

        popup_switch(dpid, jsonObj);

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

    /**
     * Show the trace form to trigger the SDN Trace.
     * It has three forms, to L2, L3 and full trace.
     * We use modal forms over the layout.
     */
    this.show_trace_form = function(d) {
        // setting switch label
        $('#sdn-trace-form-switch-content').html(d.label + " - " + d.dpid);

        sdntopology.call_get_switch_ports(d.dpid, sdntrace._render_html_trace_form_ports);


        // open modal dialog
        sdn_trace_form_dialog.dialog("open");
    }

}

var Link = function() {
    // Switch obj
    this.node1 = null;
    this.node2 = null;

    // String
    this.label1 = null;
    this.label2 = null;

    // String
    this.label_num1 = null;
    this.label_num2 = null;

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

    this.ports;

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

    this.get_d3js_data = function() {
        node_id = this.id;
        node_obj = {id: node_id, dpid: node_id, name: node_id, data:this, label:this.get_node_name(), physics:true, mass:2, stroke_width:1, type:"switch"};
        // Trace coloring
        if (typeof(node_obj.color)==='undefined') {
            node_obj.background_color = sdncolor.NODE_COLOR[node_obj.type];
        }
        return node_obj;
    }
}
// Return switch id if the class is used with strings
Switch.prototype.toString = function(){ return this.id; };


/**
 * Switch port representation.
 */
var Port = function(port_id, number, label) {
    this.id = port_id;
    this.number = number;
    this.label = label;

    this.get_d3js_data = function() {
        node_id = this.id;
        node_obj = {id: node_id, name: null, data:this, label:this.label, physics:true, from_sw:'', to_sw:'', mass:2, stroke_width:1, type:"port"};
        node_obj.background_color = sdncolor.NODE_COLOR[node_obj.type];

        return node_obj;
    }

}
// Return switch port id if the class is used with strings
Port.prototype.toString = function(){ return this.id; };


var D3JS = function() {
    this.nodes = null;
    this.edges = null;

    this.findNode = function(id) {
        for (var k in this.nodes){
            if (this.nodes.hasOwnProperty(k) && this.nodes[k].id == id) {
                 return this.nodes[k];
            }
        }
        return null;
    }

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
    this._create_network_nodes = function(with_colors, with_trace, update_current=false) {
        // create an array with nodes
        var nodesArray = [];
        for (x = 0; x < sdntopology.switches.length; x++) {
            // positioning in spiral mode to help the physics animation and prevent crossing lines
            node_obj = sdntopology.switches[x].get_d3js_data()

            if (update_current) {
                for (y = 0; y < this.nodes.length; y++) {
                    if (this.nodes[y].id == node_obj.id) {
                        node_obj = this.nodes[y];
                    }
                }
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
    this._create_network_edges = function(with_colors, with_trace, update_current=false) {
        var edgesArray = [];

        // verify topology to create edges
        for (var x = 0; x < sdntopology.topology.length; x++) {
            node_from_id = sdntopology.topology[x].node1;
            node_to_id = sdntopology.topology[x].node2;

            label_from = sdntopology.topology[x].label1;
            label_to = sdntopology.topology[x].label2;

            label_num_from = sdntopology.topology[x].label_num1;
            label_num_to = sdntopology.topology[x].label_num2;

            speed = sdntopology.topology[x].speed;

            source = this.findNode(node_from_id) || this.nodes.push({dpid:node_from_id, name: node_from_id});
            target = this.findNode(node_to_id) || this.nodes.push({dpid:node_to_id, name: node_to_id});

            source_label = {name: label_from, num: label_num_from};
            target_label = {name: label_to, num: label_num_to};

            id = source.dpid + "," + target.dpid;

            edgeObj = {id:id, name:x, source: source, target: target, source_label:source_label, target_label:target_label, speed:speed, arrows:'to', type: "suit"};
            edgeObj.color = sdncolor.LINK_COLOR['switch'];

            // Verify trace to change edge colors and labels.
            has_edge_path_obj = this._has_edge_path(edgesArray, edgeObj);

            // Update current link instead of creating a new one
            if (update_current) {
                for (y = 0; y < this.edges.length; y++) {
                    if (this.edges[y].id == edgeObj.id) {
                        edgeObj = this.edges[y];
                    }
                }
            }

            edgesArray.push(edgeObj);

            // adding port as a node
            var node_port_obj_from;
            var node_port_obj_to;
            if (node_from_id.ports && node_from_id.ports.length > 0) {
                node_port_obj_from = node_from_id.ports[0].get_d3js_data()
                node_port_obj_from.from_sw = source;
                node_port_obj_from.to_sw = target;
                this.nodes.push(node_port_obj_from);

                //edgePortObj = {id:x+"_1", edgetype:"s_p", name:label_num_from, source: node_from_id, target: node_from_id.ports[0], arrows:'to'};
                //edgesArray.push(edgePortObj);
            }

            if (node_to_id.ports && node_to_id.ports.length > 0) {
                node_port_obj_to = node_to_id.ports[0].get_d3js_data()
                node_port_obj_to.from_sw = target;
                node_port_obj_to.to_sw = source;

                this.nodes.push(node_port_obj_to);

                //this.nodes.push(node_port_obj_to);
                //edgePortObj = {id:x+"_2", edgetype:"s_p", name:label_num_from, source: node_to_id.ports[0], target: node_to_id, arrows:'to'};
                //edgesArray.push(edgePortObj);
            }
            //edgePortObj = {id:x+"_3", edgetype:"p_p", name:label_num_from, source: node_from_id.ports[0], target: node_to_id.ports[0], arrows:'to'};
            //edgesArray.push(edgePortObj);
        }

        this.edges = edgesArray;
    }

    this._render_network = function(with_colors, with_trace) {
        with_colors = typeof with_colors !== 'undefined' ? with_colors : true;
        with_trace = typeof with_trace !== 'undefined' ? with_trace : true;

        // create a network
        var selector = "#topology__canvas";
        var data = {
            nodes: [],
            links: []
        };

        this.resetAllNodes();

        // create an array with nodes
        this._create_network_nodes(with_colors, with_trace);
        data.nodes = this.nodes;

        // create an array with edges
        this._create_network_edges(with_colors, with_trace);
        data.links = this.edges;

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


    this.add_new_node = function() {
        with_colors = typeof with_colors !== 'undefined' ? with_colors : true;
        with_trace = typeof with_trace !== 'undefined' ? with_trace : true;

        var data = forcegraph.data();

        // create a network
        var selector = "#topology__canvas";

        // fake id TODO: test new node
        var fake_dpid = Math.floor((Math.random() * 100000000) + 1);;
        var fake_switch_obj = new Switch(fake_dpid);
        sdntopology.switches.push(fake_switch_obj);

        // create an array with nodes
        this._create_network_nodes(with_colors, with_trace, true);
        data.nodes = this.nodes;

        // TODO: fake link
        var fake_link = {node1: "0000000000000001" , node2:fake_dpid, label1:"", label2:"", speed:"1"}
        sdntopology.topology.push(fake_link);

        // create an array with edges
        this._create_network_edges(with_colors, with_trace, true);
        data.links = this.edges;

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
            d3.selectAll(".node_port").style("visibility", "hidden");
            d3.selectAll(".text_port").style("visibility", "hidden");
        } else {
            $('.target-label').show();
            $('.source-label').show();
            d3.selectAll(".node_port").style("visibility", "visible");
            d3.selectAll(".text_port").style("visibility", "visible");
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

    // TODO: test adding node to the force graph
    $('#topology__toolbar__btn__add_node').click(function() {
        d3lib.add_new_node();
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




