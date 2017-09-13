
/* global Switch, DEBUG, d3, d3lib, MOCK */

var SDNTopology = function() {
    // switches list. It is used to help render the topology nodes.
    this.switches = [];
    // topology link list
    this.topology = [];
    // topology domains
    this.domains = [];
    
    var _self = this;

    // Map to optimize the topology connections verification by index.
    var _linkedByIndex = new Map();

    /**
     * Add two nodes as connections to the verification Map.
     * @param {type} nodeA Source node
     * @param {type} nodeB Target node
     */
    var addTopologyConnection = function(nodeA, nodeB, prefix_id="") {
        _linkedByIndex.set((prefix_id||"") + nodeA.id + "-" + nodeB.id, true);
    };
    
    /**
     * Verify if node A and node B are connected.
     * @param {type} nodeA
     * @param {type} nodeB
     * @returns {Boolean}
     */
    var isTopologyConnected = function(nodeA, nodeB, prefix_id="") {
        return _linkedByIndex.has((prefix_id||"") + nodeA.id + "-" + nodeB.id) ||
               _linkedByIndex.has((prefix_id||"") + nodeB.id + "-" + nodeA.id) ||
               nodeA.id === nodeB.id;
    };


    this.sdntraceGetSwitches = function(jsonObj) {
        for (var x = 0; x < jsonObj.nodes.length; x++) {
            var json_node = jsonObj.nodes[x];

            if (json_node.type === "switch") {
                // storing switch values
                var switch_obj = new Switch(json_node.dpid);
                _self.switches.push(switch_obj);

                _self.sdntraceGetSwitchInfo(jsonObj, json_node);

                _self.callSdntraceGetSwitchFlows(json_node, json_node.dpid);
            }

            if (json_node.type === "host") {
//                // storing switch values
//                var switch_obj = new Switch(json_node.id);
//                _self.switches.push(switch_obj);

                //_self.sdntraceGetSwitchInfo(jsonObj, json_node.id);

                //_self.callSdntraceGetSwitchFlows(jsonObj[x]);
            }
        }

        // sort
        _self.switches = _self.switches.sort();
        // deduplication
        _self.switches = arrayRemoveDuplicates(_self.switches);
    };

    this.sdntraceGetSwitchInfo = function(jsonObj, jsonNode) {
        var switch_obj = _self.get_node_by_id(jsonNode.dpid);

//        switch_obj.n_ports = jsonObj.n_ports;
//        switch_obj.n_tables = jsonObj.n_tables;
//
//        switch_obj.name = jsonObj.switch_name;
//        switch_obj.switch_color = jsonObj.switch_color;
        switch_obj.ip_address = jsonNode.connection;
        switch_obj.openflow_version = jsonNode.ofp_version;
        switch_obj.switch_vendor = jsonNode.manufacturer;

        if(jsonNode.connection && jsonNode.connection.length > 0) {
            var patt = new RegExp("(.*){1}:([0-9]*$)");
            var res = patt.exec(jsonNode.connection);
            switch_obj.ip_address = res[1];
            switch_obj.tcp_port = res[2];
            //switch_obj.number_flows = jsonObj.number_flows;
        }

        _self.sdntraceGetSwitchPorts(jsonObj, jsonNode.dpid);
    };
    
    this.callSdntraceGetSwitchFlows = function(jsonObj, p_dpid, callback=null) {
        var ajax_done = function(jsonObj, p_callback) {
            var switch_obj = _self.get_node_by_id(p_dpid);

            switch_obj.number_flows = jsonObj.number_flows;

            switch_obj.flow_stat = {};
            switch_obj.flow_stat.dpid = p_dpid;
            switch_obj.flow_stat.flows = [];

            for(var x in jsonObj.data) {
                var jsonFlow = jsonObj.data[x];

                var flowObj = {};
                flowObj.idle_timeout = jsonFlow.idle_timeout;
                flowObj.cookie = jsonFlow.cookie;
                flowObj.priority = jsonFlow.priority;
                flowObj.hard_timeout = jsonFlow.hard_timeout;
                flowObj.byte_count = jsonFlow.stats.Bps;
//                flowObj.duration_nsec = jsonFlow.duration_nsec;
                flowObj.packet_count= jsonFlow.stats.pps;
                flowObj.duration_sec = jsonFlow.duration_sec;
                flowObj.table_id = jsonFlow.table_id;

                flowObj.actions = [];
                for(var y in jsonFlow.actions) {
                    var jsonAction = jsonFlow.actions[y];

                    var flowActionObj = {};
                    flowActionObj.max_len = jsonAction.max_len;
                    flowActionObj.type = jsonAction.type;
                    flowActionObj.port = jsonAction.port;
                    flowActionObj.vlan_vid = jsonAction.vlan_vid;
                    flowObj.actions.push(flowActionObj);
                }

                flowObj.match = {};
                /*
                flowObj.match.wildcards = jsonFlow.match.wildcards;
                flowObj.match.in_port = jsonFlow.match.in_port;
                flowObj.match.dl_vlan = jsonFlow.match.dl_vlan;
                flowObj.match.dl_src = jsonFlow.match.dl_src;
                flowObj.match.dl_dst = jsonFlow.match.dl_dst;
                flowObj.match.dl_type = jsonFlow.match.dl_type;
                */
                flowObj.match.in_port = jsonFlow.in_port;
                flowObj.match.dl_vlan = jsonFlow.dl_vlan;
                flowObj.match.dl_src = jsonFlow.dl_src;
                flowObj.match.dl_dst = jsonFlow.dl_dst;
                flowObj.match.dl_type = jsonFlow.dl_type;

                switch_obj.flow_stat.flows.push(flowObj);
            }

            switch_obj.flow_pivot = [];


            for(var x in jsonObj.data) {
                var jsonFlow = jsonObj.data[x];

                var pivot = {};
                pivot.dpid = p_dpid;

                pivot.idle_timeout = jsonFlow.idle_timeout;
                pivot.cookie = jsonFlow.cookie;
                pivot.priority = jsonFlow.priority;
                pivot.hard_timeout = jsonFlow.hard_timeout;
                pivot.byte_count = jsonFlow.stats.Bps;
                //pivot.duration_nsec = jsonFlow.duration_nsec;
                pivot.packet_count= jsonFlow.stats.pps;
                pivot.duration_sec = jsonFlow.duration_sec + (jsonFlow.duration_nsec / 1000000000.0);

                pivot.table_id = jsonFlow.table_id || '';

//                pivot.match__wildcards = jsonFlow.match.wildcards || '';
                pivot.match__in_port = jsonFlow.in_port || ' ';
                pivot.match__dl_vlan = jsonFlow.dl_vlan || '';
                pivot.match__dl_src = jsonFlow.dl_src || '';
                pivot.match__dl_dst = jsonFlow.dl_dst || '';
                pivot.match__dl_type = jsonFlow.dl_type || '';

                if (jsonFlow.actions) {
                    for(var y in jsonFlow.actions) {
                        var jsonAction = jsonFlow.actions[y];

                        if(y > 0) {
                            pivot.action__max_len = pivot.action__max_len +"<br>"+ (jsonAction.max_len || '--');
                            pivot.action__type = pivot.action__type +"<br>"+ (jsonAction.type || '--');
                            pivot.action__port = pivot.action__port +"<br>"+ (jsonAction.port || '--');
                            pivot.action__vlan_vid = pivot.action__vlan_vid +"<br>"+ (jsonAction.vlan_vid || '--');
                        } else {
                            pivot.action__max_len = (jsonAction.max_len || '--');
                            pivot.action__type = (jsonAction.type || '--');
                            pivot.action__port = (jsonAction.port || '--');
                            pivot.action__vlan_vid = (jsonAction.vlan_vid || '--');
                        }
                    }
                }
                switch_obj.flow_pivot.push(pivot);
            }

            if (p_callback !== null) {
                console.log('callSdntraceGetSwitchFlows callback');
                try {
                    //callback();
                } catch(err) {
                    console.log("Error callback function: " + callback);
                    throw err;
                }
            }
        };

        // AJAX call
        $.ajax({
            url:"/kytos/stats/" + p_dpid + "/flows",
            dataType: 'json',
            crossdomain:true
        })
        .done(function(json) {
            ajax_done(json, callback);
        })
        .fail(function() {
            console.log( "callSdntraceGetSwitchFlows ajax error" );
        })
        .always(function() {
            console.log( "callSdntraceGetSwitchFlows ajax complete" );
        });
    };

    /**
     * Get node by id.
     * Returns Switch, Domain or Host
     * @param {type} p_id Node id
     * @returns {Node}
     */
    this.get_node_by_id = function(p_id) {
        // add to topology list to render the html
        for (var key in _self.switches) {
            if (_self.switches[key].id === p_id) {
                return _self.switches[key];
            }
        }
        
        for (var key in _self.domains) {
            if (_self.domains[key].id === p_id) {
                return _self.domains[key];
            }
        }
    };

   /**
    * Use this function instead of access the topology attribute.
    * @param {Link} link Link object
    */
    this.add_topology = function(link) {
        if (isTopologyConnected(link.node1, link.node2, link.prefix_id) === false) {
            addTopologyConnection(link.node1, link.node2, link.prefix_id);
            // add to topology list to render the html
            this.topology.push(link);
        }
    };

   /**
    * Use this function to get the topology link object.
    * Nodes parameters can be in any order.
    * 
    * @param {Node} node1 Node object
    * @param {Node} node2 Node object
    * @returns {Link} Link object
    */
    this.get_topology_link = function(node1, node2, prefix) {
        if (isTopologyConnected(node1, node2, prefix)) {
            for (var x in this.topology) {
                if ((this.topology[x].node1.id === node1.id && this.topology[x].node2.id === node2.id) ||
                   (this.topology[x].node1.id === node2.id && this.topology[x].node2.id === node1.id)) {

                    return this.topology[x];
                }
            }
        }
        return null;
    };

    /**
     * Call ajax to load the switch topology.
     * 
     * @param {function} callback Callback function
     */
    this.callSdntraceGetTopology = function(callback=null) {
        // hiding topology graphic panel
        $('#topology__canvas').hide();

        var ajaxDone = function(json) {
            var jsonObj = json;

            // new
            _self.sdntraceGetSwitches(jsonObj);

            // verify if the json is not a '{}' response
            if (!jQuery.isEmptyObject(jsonObj)) {


                for (var x = 0; x < jsonObj.links.length; x++) {
                    var json_link = jsonObj.links[x];

                    // Check if the node is a HOST
                    if (isMacAddress(json_link.source) || isMacAddress(json_link.target)) {
                        json_link.type = "host";
                    }

                    if (json_link.type === "link") {
                        var dpid1 = '';
                        var port1 = '';
                        var dpid2 = '';
                        var port2 = '';

                        if (isMacAddress(json_link.source)) {
                            dpid1 = json_link.source;
                        } else {
                            var patt = new RegExp("(.*){1}:([0-9]*$)");
                            var res = patt.exec(json_link.source);
                            dpid1 = res[1];
                            port1 = res[2];
                        }
                        if (isMacAddress(json_link.target)) {
                            dpid2 = json_link.target;
                        } else {
                            res = patt.exec(json_link.target);
                            dpid2 = res[1];
                            port2 = res[2];
                        }

                        var linkObj = new Link();

                        // creating switch
                        var _switch1 = _self.get_node_by_id(dpid1);
                        var _switch2 = _self.get_node_by_id(dpid2);

                        var switch1 = Switch.clone_obj(_switch1);
                        var switch2 = Switch.clone_obj(_switch2);

                        if(isTopologyConnected(switch1, switch2)) {
                            //linkObj = _self.get_topology_link(switch1, switch2);
                            linkObj = null;
                        } else {
                            linkObj.node1 = switch1;
                            linkObj.node2 = switch2;

                            linkObj.node1.ports = [];
                            linkObj.node2.ports = [];

                            // creating switch ports from node1
                            var node1_port = _switch1.get_port_by_id(dpid1, port1);
                            if (node1_port === null) {
                                node1_port = new Port(dpid1, port1, port1, port1);
                                linkObj.node1.ports.push(node1_port);
                            } else {
                                linkObj.node1.ports.push(node1_port);
                            }
                            linkObj.label1 = node1_port.label;

                            // creating switch ports from node2
                            var node2_port = _switch2.get_port_by_id(dpid2, port2);
                            if (node2_port === null) {
                                node2_port = new Port(dpid2, port2, port2, port2);
                                linkObj.node2.ports.push(node2_port);
                            } else {
                                linkObj.node2.ports.push(node2_port);
                            }
                            linkObj.label2 = node2_port.label;

                            // link speed
                            if(node1_port && node1_port.speed) {
                                linkObj.speed = node1_port.speed;
                            } else if(node2_port && node2_port.speed) {
                                linkObj.speed = node2_port.speed;
                            }
                        }
                    } else if (json_link.type === "host") {
                        // Add new host node
                        var _host_label = "";

                        var dpid1 = '';
                        var port1 = '';
                        var dpid2 = '';
                        var port2 = '';

                        if (isMacAddress(json_link.source)) {
                            _host_label = json_link.source;
                        } else {
                            var patt = new RegExp("(.*){1}:([0-9]*$)");
                            var res = patt.exec(json_link.source);
                            dpid1 = res[1];
                            port1 = res[2];
                        }
                        if (isMacAddress(json_link.target)) {
                            _host_label = json_link.target;
                        } else {
                            res = patt.exec(json_link.target);
                            dpid2 = res[1];
                            port2 = res[2];
                        }

                        var linkObj = new Link();

                        // add node data do d3
                        var _switch1 = _self.get_node_by_id(dpid1);
                        var switch1 = Switch.clone_obj(_switch1);
                        linkObj.node1 = switch1;
                        linkObj.node1.ports = [];

                        // creating switch ports from node1
                        var node1_port = _switch1.get_port_by_id(dpid1, port1);
                        if (node1_port === null) {
                            node1_port = new Port(dpid1, port1, port1, port1);
                            linkObj.node1.ports.push(node1_port);
                        } else {
                            linkObj.node1.ports.push(node1_port);
                        }
                        linkObj.label1 = node1_port.label;

                        var host_obj = d3lib.addNewNodeHost(dpid1, port1, _host_label);

                        linkObj.node2 = host_obj;

                        // creating host ports
                        var node2_port = new Port(host_obj.id +'_'+ port2, port2, "");

                        linkObj.node2.ports = [node2_port];
                        linkObj.label_num2 = port2;
                    } else if (json_link.type === "interdomain") {
                        // Add new host node
                        var _domain_label = "";
                        if (typeof(p_neighbor.domain_name)!=='undefined') {
                            _domain_label = p_neighbor.domain_name;
                        }

                        // add node data do d3
                        var linkObj = new Link();

                        var _switch1 = _self.get_node_by_id(dpid1);
                        var switch1 = Switch.clone_obj(_switch1);
                        linkObj.node1 = switch1;
                        linkObj.node1.ports = [];

                        // creating switch ports from node1
                        var node1_port = _switch1.get_port_by_id(dpid1, port1);
                        if (node1_port === null) {
                            node1_port = new Port(dpid1, port1, port1, port1);
                            linkObj.node1.ports.push(node1_port);
                        } else {
                            linkObj.node1.ports.push(node1_port);
                        }
                        linkObj.label1 = node1_port.label;

                        var domainObj = d3lib.addNewNodeDomain(_domain_label, _domain_label);
                        linkObj.node2 = domainObj;
                    }
                    // Add the node the the topology
                    if (linkObj) {
                        _self.add_topology(linkObj);
                    }
                }

                // render D3 force
                d3lib.render_topology();
                _self.showTopologyCanvas();
            }
        };

        // AJAX call
        $.ajax({
            url: "/kytos/topology",
            dataType: 'json'
        })
        .done(function(json) {
            ajaxDone(json);
        })
        .fail(function() {
            console.log( "call_get_topology ajax error" );
        })
        .always(function() {
            console.log( "call_get_topology ajax complete" );
        });
    };

    /**
     * Call ajax to load the switch ports data.
     */
    this.callGetSwitchPorts = function(dpid, callback=null) {
        var ajaxDone = function(json) {
            var jsonObj = json;

            // verify if the json is not a '{}' response
            if (callback !== null && !jQuery.isEmptyObject(jsonObj)) {
                // render D3 popup
                try {
                    callback(dpid, jsonObj);
                }
                catch(err) {
                    console.log("Error callback function: " + callback);
                    throw err;
                }
            }
        };

        // AJAX call
        $.ajax({
            url: "/sdnlg/switches/" + dpid + "/ports",
            dataType: 'json'
        })
        .done(function(json) {
            ajaxDone(json);
        })
        .fail(function() {
            console.log( "callGetSwitchPorts ajax error" );
        })
        .always(function() {
            console.log( "callGetSwitchPorts ajax complete" );
        });
    };

    /**
     * Call ajax to load the switch ports data.
     */
    this.sdntraceGetSwitchPorts = function(jsonObj, p_dpid, callback=null) {
        var switchObj = _self.get_node_by_id(p_dpid);

        if (switchObj) {
            for (var x = 0; x < jsonObj.nodes.length; x++) {
                var json_node = jsonObj.nodes[x];

                if (json_node.type === "interface" && json_node.switch === p_dpid) {
                    var p_port_data = json_node;

                    var portObj = switchObj.get_port_by_id(p_dpid, p_port_data.port_number);

                    if (portObj === null) {
                        portObj = new Port(p_dpid, p_port_data.port_number, p_port_data.port_number, p_port_data.name);

                        // create Port object and push to the switch ports
                        if (switchObj.ports === null) { switchObj.ports = []; }
                        switchObj.ports.push(portObj);
                    } else {
                        console.log('Found port ' + p_dpid + " _ " + p_port_data.port_number);
                    }
                    portObj.speed = p_port_data.speed;
                    portObj.label = p_port_data.name;
                    portObj.number = p_port_data.port_number;
                    //portObj.status = p_port_data.status;
                }
            }

        }

    };

    /**
     * Callback to be used with the AJAX that retrieve switch ports.
     * @param {type} nodeId Node Id that contains the ports
     * @param {type} jsonObj JSON object with port data
     */
    this._render_html_popup_ports = function(nodeId, jsonObj) {
        var popupSwitch = function(nodeId, data) {
            // remove possible popups
            d3.select(".canvas")
                .selectAll(".popup")
                .remove();

             // Build the popup
            var popup = d3.select(".canvas")
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
            // popup content Header
            popup.append("div")
                .attr("class","popup_header")
                .text(nodeId);
            popup.append("div")
                .attr("class","popup_header")
                .text("Interfaces (" + data.length + "):");
            // popup header separator
            popup.append("hr");
            // popup content
            var popupBody = popup
                .append("div")
                .attr("class","popup_body");
            var updatePopupBody = popupBody
                .selectAll("p")
                .data(data)
                .enter()
                    .append("p")
                        .append("a")
                            // adding click function
                            .on("click", function(d) {
                                popup.selectAll(".popup_body").remove();
                                var popup_body = popup.append("div").attr("class","popup_body");
                                popup_body.append("p").text("Port n.: " + d.port_no);
                                popup_body.append("p").text("Port name: " + d.name);
                                popup_body.append("p").text("Port speed: " + SDNTopology.formatSpeed(d.speed));
                                popup_body.append("p").text("Port uptime: " + d.uptime);
                                // adding back button
                                popup_body.append("p")
                                    .append("a")
                                    .text("back")
                                    .on("click", function() { popupSwitch(nodeId, data); });
                             })
                            .text(function(d) { return d.port_no + " - " + d.name; });
            updatePopupBody.exit();
        };
        
        popupSwitch(nodeId, jsonObj);
    };

    /**
     * Render HTML of the topology.
     */
    this.renderHtmlTopology = function() {
        if (this.topology) {
            $('#topology__canvas').show();
            $('#topology__elements').show();

            var htmlContent = "";
            htmlContent += "<div class='row'>";
            htmlContent += "<div class='col-sm-12 col-md-12'>";
            htmlContent += "<table id='switches_topology_table' class='table'><tbody>";

            for (var x = 0; x < this.topology.length; x++) {
                htmlContent += "<tr>";
                htmlContent += "<td>";

                // display nice switch name
                var tempSwitch = new Switch(this.topology[x].node1);
                htmlContent += tempSwitch.getNameOrId();

                // start left content, origin switch
                htmlContent += "</td><td>";
                htmlContent += "</td>";
                // end left content, origin switch

                htmlContent += "<td><span class='glyphicon glyphicon-arrow-right' aria-hidden='true'></span></td>";
                htmlContent += "<td>";

                // start right content, destination switch
                if (this.topology[x].node2) {
                    htmlContent += "<li>";
                    // display nice switch name
                    var tempSwitch = this.topology[x].node2;
                    htmlContent += tempSwitch.getNameOrId();
                    htmlContent += "</li>";
                    htmlContent += "</td><td>";
                } else {
                    htmlContent += "</td><td>";
                }
                htmlContent += "</td></tr>";
                // end right content, destination switch
            }
            htmlContent += "</tbody></table>";
            htmlContent += "</div>";

            $('#topology__elements__list').html(htmlContent);
        }
    };

    /**
     * Show the trace form to trigger the SDN Trace.
     * It has three forms, to L2, L3 and full trace.
     * We use modal forms over the layout.
     */
    this.showTraceForm = function(d) {
        // setting switch label
        $('#sdn_trace_form__switch-content').html(d.label + " - " + d.dpid);

        //this.callSdntraceGetSwitchPorts(d.dpid, sdntrace.renderHtmlTraceFormPorts);


        var switch_obj = _self.get_node_by_id(d.dpid);

        sdntrace.renderHtmlTraceFormPorts(d.dpid, switch_obj.ports);

        // open modal dialog
        sdn_trace_form_dialog.dialog("open");
    };

    this.showTopologyCanvas = function() {
        $('#topology__canvas').show();
    };
};

/**
 * Format link speed.
 * @param {type} speed
 * @returns {String}
 */
SDNTopology.formatSpeed = function(speed) {
    if (speed % 1000000000 >= 0) {
        return (speed / 1000000000) + "GB";
    } else if (speed % 1000000 >= 0) {
        return (speed / 1000000) + "MB";
    } else if (speed % 1000 >= 0) {
        return (speed / 1000) + "KB";
    }
};
