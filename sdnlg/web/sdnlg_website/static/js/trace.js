
/* global forcegraph, MOCK, SDNLG_CONF, d3lib */

/** @constant */
var REST_TRACE_TYPE = {'STARTING':'starting', 'LAST':'last', 'TRACE':'trace', 'INTERTRACE':'intertrace'};
/** @constant */
var REST_TRACE_REASON = {'ERROR':'error', 'DONE':'done', 'LOOP':'loop'};


var SDNTraceUtil = function() {
    this.tracePanelHtml = function(jsonObj) {
        /**
        * Render trace result html info.
        */
        var htmlContent = "";
        htmlContent += "<div class='row'>";
        htmlContent += "<div class='col-sm-12'>";
        htmlContent += "<strong>Start from:</strong>";
        if(jsonObj.result) {
            // FIXME workaround for multiple starting type
            var _flag_multiple_starting_counter = 0;
            for (var i = 0, len = jsonObj.result.length; i < len; i++) {
                if (jsonObj.result[i].type === REST_TRACE_TYPE.STARTING && (_flag_multiple_starting_counter === 0)) {
                    htmlContent += "<span> <strong>DPID:</strong> ";
                    htmlContent += jsonObj.result[i].dpid;
                    htmlContent += "</span><span> <strong>Port:</strong>";
                    htmlContent += jsonObj.result[i].port;
                    htmlContent += "</span>";

                    _flag_multiple_starting_counter++;
                }
            }
        } else {
            htmlContent += " <span>---</span>";
        }

        htmlContent += "</div>";
        htmlContent += "</div>";

        htmlContent += "<div class='row'><div class='col-sm-12'>";
        htmlContent += "<strong>Start time: </strong>" + (jsonObj.start_time || "---");
        htmlContent += "</div></div>";

        htmlContent += "<div class='row'><div class='col-sm-12'>";
        htmlContent += "<strong>Total time: </strong>" + (jsonObj.total_time || "---");
        htmlContent += "</div></div>";
        if(jsonObj.result) {
            htmlContent += "<hr>";
            htmlContent += "<div class='col-sm-12'>";
            htmlContent += "<table class='table table-striped'>";
            htmlContent += "<thead><tr><th></th><th>Switch/DPID</th><th>Incoming Port</th><th>Time</th></tr></thead>";
            htmlContent += "<tbody>";

            var _flag_multiple_starting_counter = 0;
            for (var i = 0, len = jsonObj.result.length; i < len; i++) {

                // FIXME: workaround for multiple starting type
                if (jsonObj.result[i].type !== REST_TRACE_TYPE.STARTING || (jsonObj.result[i].type === REST_TRACE_TYPE.STARTING && _flag_multiple_starting_counter > 0)) {
                    htmlContent += "<tr data-type="+ jsonObj.result[i].type +">";
                    htmlContent += "<td>" + (i) + "</td>";
                }

                // FIXME: workaround for multiple starting type
                if (jsonObj.result[i].type === REST_TRACE_TYPE.STARTING && (_flag_multiple_starting_counter === 0)) {
                    _flag_multiple_starting_counter = _flag_multiple_starting_counter + 1;
                // FIXME: workaround for multiple starting type
                } else if ((jsonObj.result[i].type === REST_TRACE_TYPE.STARTING && _flag_multiple_starting_counter > 0) || jsonObj.result[i].type === REST_TRACE_TYPE.TRACE) {
                    htmlContent += "<td>" + jsonObj.result[i].dpid + "</td>";
                    htmlContent += "<td>" + jsonObj.result[i].port + "</td>";
                    htmlContent += "<td>" + jsonObj.result[i].time + "</td>";
                } else if (jsonObj.result[i].type === REST_TRACE_TYPE.INTERTRACE) {
                    htmlContent += "<td colspan='3'><strong>Interdomain: " + jsonObj.result[i].domain + "</strong></td>";
                } else if (jsonObj.result[i].type === REST_TRACE_TYPE.LAST) {
                    htmlContent += "<td colspan='3'>";
                    if (jsonObj.result[i].reason === REST_TRACE_REASON.ERROR) {
                        htmlContent += "<span class='trace_result_item_error'>Error: ";
                        htmlContent += jsonObj.result[i].msg || "";
                        htmlContent += "</span>";
                    } else if (jsonObj.result[i].reason === REST_TRACE_REASON.DONE) {
                        htmlContent += "<span class='trace_result_item_done'>Trace completed. ";
                        if (jsonObj.result[i].msg !== 'none') {
                            htmlContent += jsonObj.result[i].msg || "";
                        }
                        htmlContent += "</span>";
                    } else if (jsonObj.result[i].reason === REST_TRACE_REASON.LOOP) {
                        htmlContent += "<span class='trace_result_item_loop'>Trace completed with loop. ";
                        htmlContent += jsonObj.result[i].msg || "";
                        htmlContent += "</span>";
                    }
                    htmlContent += "</td>";
                } else if (jsonObj.result[i].type === REST_TRACE_TYPE.ERROR) {
                    htmlContent += "<td colspan='3'>" + jsonObj.result[i].message + "</td>";
                }
                htmlContent += "</tr>";
            }

            htmlContent += "</tbody></table></div>";
        }
        htmlContent += "</div>";

        return htmlContent;
    };
};
var sdntraceutil = new SDNTraceUtil();



// reference to the trace form dialog
var sdn_trace_form_dialog = '';

var sdntrace = '';

var SDNTrace = function() {

    var _self = this;

    // last trace id executing
    this.lastTraceID = "";


    this.clearTraceInterface = function() {
        /**
        * Clear trace forms, result, result pannel, dialog modal, graph highlight, graph trace
        */
        $('#trace-result-content').html('');
        $('#trace_panel_info .loading-icon-div').hide();

        // clear d3 graph highlight nodes, links
        forcegraph.endHighlight();

        // clear d3 graph trace classes
        $("path").removeClass("node-trace-active");
        $("line").removeClass("link-trace-active");
        $("line").removeClass("link-trace-cp");
        $("path").each(function() {
            if ($(this).attr("data-nodeid")) {
            }
        });

        // close modal trace form
        sdn_trace_form_dialog.dialog( "close" );

        // hide right panel data
        $('#trace_panel_info').hide();
        $('#trace_cp_panel_info').hide();
    };


    this.highlightPath = function(selector) {
        /**
        * Highlight path. Receive selector var.
        */
        $(selector).addClass("new-link link-trace-active");
    };



    this.callTraceRequestId = function(json_data) {
        /**
         * Call ajax to trace.
         * Param:
         *    json_data: Data in json String format to send as PUT method.
         */
        _self.clearTraceInterface();

        var ajaxDone = function(json) {
            // Stopping any ongoing trace.
            _self.traceStop();
            _self.traceReset();

            // Trigger AJAX to retrieve the trace result
            var json_obj = $.parseJSON(json);
            _self.triggerTraceListener(json_obj.result.trace_id);
        };

        // show loading icon
        $('#trace_panel_info .loading-icon-div').show();

        // AJAX call
        $.ajax({
            url: SDNLG_CONF.trace_server + "/sdntrace/trace",
            type: 'PUT',
            contentType: 'application/json',
            data: json_data
        })
        .done(function(json) {
            ajaxDone(json);
        })
        .fail(function(responseObj) {
            if (responseObj.responseJSON) {
                $('#trace-result-content').html("<div class='bg-danger'>"+responseObj.responseJSON.error+"</div>");
            } else {
                $('#trace-result-content').html("<div class='bg-danger'>Trace error.</div>");
            }
            _self.traceStop();
            console.warn("call_trace_request_id ajax error" );
        })
        .always(function() {
            $('#trace_panel_info').show();
        });
    };

    this.renderHtmlTraceFormPorts = function(dpid, port_data) {
        /**
        Callback to be used with the AJAX that retrieve switch ports.
        */
        $('#sdn_trace_form__switch-hidden').val(dpid);
        $('#sdn_trace_form__switch-port-hidden').val('');
        $('#sdn_trace_form__switch-ports-content select').html('');

        $('#sdn_trace_form__switch-ports-content select').change(function() {
            $('#sdn_trace_form__switch-port-hidden').val(this.value);
        });

//        $.each(port_data, function(index, value){
//            console.log(this);
//            $('<option/>', {
//                'value': this.port_no,
//                'text': this.port_no + " - " + this.name
//            }).appendTo('#sdn_trace_form__switch-ports-content select');
//
//            if (index === "1") {
//                // insert port
//                $('#sdn_trace_form__switch-port-hidden').val(this.port_no);
//            }
//        });

        // Changed to render array of Port objects
        $.each(port_data, function(index, value){
            $('<option/>', {
                'value': this.number,
                'text': this.number + " - " + this.label
            }).appendTo('#sdn_trace_form__switch-ports-content select');

            if (index === 0) {
                // insert port
                $('#sdn_trace_form__switch-port-hidden').val(this.number);
            }
        });
    };

    /**
     * Build json string from form fields to send to trace layer 2 ajax.
     */
    this.buildTraceLayer2JSON = function() {
        var layer2 = new Object();
        var l2Trace = new Object();

        var l2Switch = new Object();
        l2Switch.dpid = $('#sdn_trace_form__switch-hidden').val();
        l2Switch.in_port = $('#sdn_trace_form__switch-port-hidden').val();
        if (l2Switch.in_port) {
            l2Switch.in_port = parseInt(l2Switch.in_port, 10);
        }
        l2Trace.switch = l2Switch;

        var l2Eth = new Object();
        l2Eth.dl_src = $('#l2_dl_src').val();
        l2Eth.dl_dst = $('#l2_dl_dst').val();
        l2Eth.dl_vlan = $('#l2_dl_vlan').val();
        if (l2Eth.dl_vlan) {
            l2Eth.dl_vlan = parseInt(l2Eth.dl_vlan, 10);
        }
        l2Eth.dl_type = $('#l2_dl_type').val();
        if (l2Eth.dl_type) {
            l2Eth.dl_type = parseInt(l2Eth.dl_type, 10);
        }
        l2Trace.eth = l2Eth;
        
        layer2.trace = l2Trace;

        layer2 = removeEmptyJsonValues(layer2);
        var layer2String = JSON.stringify(layer2);

        return layer2String;
    };

    /**
     * Build json string from form fields to send to trace layer 3 ajax.
     */
    this._build_trace_layer3_json = function() {
        var layer3 = new Object();
        var l3Trace = new Object();

        var l3Switch = new Object();
        l3Switch.dpid = $('#sdn_trace_form__switch-hidden').val();
        l3Switch.in_port = $('#sdn_trace_form__switch-port-hidden').val();
        if (l3Switch.in_port) {
            l3Switch.in_port = parseInt(l3Switch.in_port, 10);
        }
        l3Trace.switch = l3Switch;
        

        var l3Eth = new Object();
        l3Eth.dl_vlan = $('#l3_dl_vlan').val();
        if (l3Eth.dl_vlan) {
            l3Eth.dl_vlan = parseInt(l3Eth.dl_vlan, 10);
        }
        l3Trace.eth = l3Eth;

        var l3Ip = new Object();
        l3Ip.nw_src = $('#l3_nw_src').val();
        l3Ip.nw_dst = $('#l3_nw_dst').val();
        l3Ip.nw_tos = $('#l3_nw_tos').val();
        if (l3Ip.nw_tos) {
            l3Ip.nw_tos = parseInt(l3Ip.nw_tos, 10);
        }
        l3Trace.ip = l3Ip;

        var l3Tp = new Object();
        l3Tp.tp_src = $('#l3_tp_src').val();
        l3Tp.tp_dst = $('#l3_tp_dst').val();
        if (l3Tp.tp_dst) {
            l3Tp.tp_dst = parseInt(l3Tp.tp_dst, 10);
        }
        l3Trace.tp = l3Tp;
        
        layer3 = removeEmptyJsonValues(layer3);
        var layer3String = JSON.stringify(layer3);

        return layer3String;
    };

    /**
     * Build json string from form fields to send to full trace ajax.
     */
    this._build_trace_layerfull_json = function() {
        var layerfull = new Object();
        var lfTrace = new Object();

        var lfSwitch = new Object();
        lfSwitch.dpid = $('#sdn_trace_form__switch-hidden').val();
        lfSwitch.in_port = $('#sdn_trace_form__switch-port-hidden').val();
        if (lfSwitch.in_port) {
            lfSwitch.in_port = parseInt(lfSwitch.in_port, 10);
        }
        lfTrace.switch = lfSwitch;

        var lfEth = new Object();
        lfEth.dl_src = $('#lf_dl_src').val();
        lfEth.dl_dst = $('#lf_dl_dst').val();
        lfEth.dl_vlan = $('#lf_dl_vlan').val();
        if (lfEth.dl_vlan) {
            lfEth.dl_vlan = parseInt(lfEth.dl_vlan, 10);
        }
        lfEth.dl_type = $('#lf_dl_type').val();
        if (lfEth.dl_type) {
            lfEth.dl_type = parseInt(lfEth.dl_type, 10);
        }
        lfTrace.eth = lfEth;

        var lfIp = new Object();
        lfIp.nw_src = $('#lf_nw_src').val();
        lfIp.nw_dst = $('#lf_nw_dst').val();
        lfIp.nw_tos = $('#lf_nw_tos').val();
        if (lfIp.nw_tos) {
            lfIp.nw_tos = parseInt(lfIp.nw_tos, 10);
        }
        lfTrace.ip = lfIp;
        
        var lfTp = new Object();
        lfTp.tp_src = $('#lf_tp_src').val();
        lfTp.tp_dst = $('#lf_tp_dst').val();
        if (lfTp.tp_dst) {
            lfTp.tp_dst = parseInt(lfTp.tp_dst, 10);
        }
        lfTrace.tp = lfTp;
        
        layerfull.trace = lfTrace;

        layerfull = removeEmptyJsonValues(layerfull);
        var layerfullString = JSON.stringify(layerfull);

        return layerfullString;
    };
    

    var _flagCallTraceListenerAgain = true;
    // Timeout flag to stop the trace listener
    var _threadTraceListener = "";
    // Time to trigger the next call in ms
    var _traceTimerTriggerCall = 1000;
    // Total time to trigger the call. After that trigger timeout method.
    var _traceTimerMax = 30000;

    var _traceTimerCounter = 0;

    this.triggerTraceListener = function(traceId) {
        _self.lastTraceID = traceId;

        // show load icon
        $('#trace_panel_info .loading-icon-div').show();

        // Clearing the trace panel
        $('#trace-result-content').html("");
        $('#trace_panel_info_collapse').collapse("hide");

        // Call to AJAX to retrieve the trace result
        _self.callTraceListener(traceId);
    };

    // Reset all variables to start the trace
    this.traceReset = function() {
        clearTimeout(_threadTraceListener);
        _threadTraceListener = "";
        _traceTimerCounter = 0;
        _flagCallTraceListenerAgain = true;
    };
    
    // Stop trace thread and block all variables.
    this.traceStop = function() {

        clearTimeout(_threadTraceListener);

        _threadTraceListener = "";
        _traceTimerCounter = 100000;
        _flagCallTraceListenerAgain = false;

        // hide loading icon
        $('#trace_panel_info .loading-icon-div').hide();
    };



    this.callTraceListener = function(traceId) {
        var htmlRender = function(jsonObj) {
            /**
            * Render trace result html info.
            */
            var htmlContent = "";
            htmlContent += sdntraceutil.tracePanelHtml(jsonObj);

            $('#trace-result-content').html(htmlContent);
            $('#trace_panel_info_collapse').collapse("show");
        };

        var _addNewHtmlNode = function(_id) {
            /**
            Add html data selector after add a new node
            */
            var html_selector = "#node-" + _id;
            $(html_selector).addClass("new-node node-trace-active");
            $(html_selector).attr("data-nodeid", _id);
        };

        var _addNewHtmlLink = function(_idFrom, _idTo) {
            /**
            Add html data selector after add a new link
            */
            var html_selector = "#link-" + _idFrom +"-"+ _idTo;
            _self.highlightPath(html_selector);

            $(html_selector).attr("data-linkid", _idFrom +"-"+ _idTo);
        };

        var ajaxDone = function(jsonObj) {
            if (jsonObj && jsonObj === "0") {
                return;
            }

            try {
                if (jsonObj.result && jsonObj.result.length > 0) {
                    var flag_has_domain = false;
                    // temporary var to last node
                    var last_node_id = null;
                    // temporary var to last interdomain
                    var last_domain_id = null;

                    for (var i = 0, len = jsonObj.result.length; i < len; i++) {
                        var result_item = jsonObj.result[i];
                        var _id = null;

                        if (result_item.hasOwnProperty("domain")) {
                            // Add new domain node
                            _label = result_item.domain;
                            // add node data do d3
                            var node_domain = d3lib.addNewNodeDomain(result_item.domain, _label);
                            _id = node_domain.id;
                            // add html data
                            _addNewHtmlNode(_id);

                            // Add new link
                            d3lib.addNewLink(last_node_id, _id);
                            _addNewHtmlLink(last_node_id, _id);

                            flag_has_domain = true;
                            last_domain_id = _id;
                        }
                        if (result_item.hasOwnProperty("dpid")) {
                            _id = result_item.dpid;
                            if (flag_has_domain) {
                                // Add new switch node related to new domain
                                d3lib.addNewNode(_id, "", last_domain_id);
                                _addNewHtmlNode(_id);

                                // Add new link
                                d3lib.addNewLink(last_node_id, _id);
                                _addNewHtmlLink(last_node_id, _id);
                            }
                            $(document.getElementById("node-" + _id)).addClass("node-trace-active");
                        }


                        if (i > 0 && jsonObj.result[i-1].hasOwnProperty("dpid") && jsonObj.result[i].hasOwnProperty("dpid")) {
                            // Add new link between nodes
                            var css_selector = document.getElementById("link-" + jsonObj.result[i-1].dpid +"-"+ jsonObj.result[i].dpid);
                            _self.highlightPath(css_selector);

                            // Activate the return link too

                            css_selector = document.getElementById("link-" + jsonObj.result[i].dpid +"-"+ jsonObj.result[i-1].dpid);
                            _self.highlightPath(css_selector);
                        }

                        last_node_id = _id;
                    }

                    var last_result_item = jsonObj.result[jsonObj.result.length - 1];
                    if (last_result_item.type === REST_TRACE_TYPE.LAST) {
                        // FLAG to stop the trigger loop
                        if (_self._flagCallTraceListenerAgainCounter < 12) {
                            _self._flagCallTraceListenerAgainCounter = _self._flagCallTraceListenerAgainCounter + 1;
                        } else {
                            console.log('type last');
                            // stop the interval loop
                            _self.traceStop();
                        }
                    } else if (last_result_item.type === REST_TRACE_TYPE.ERROR) {
                        console.log('type error');
                        // stop the interval loop
                        _self.traceStop();
                    }
                }
                htmlRender(jsonObj);
            } catch(err) {
                _self.traceStop();
                console.error(err);
                throw err;
            }
        };

        // counting the trace time elapsed
        _traceTimerCounter = _traceTimerCounter + _traceTimerTriggerCall;

        // Timeout. Stopping the trace.
        if(_traceTimerCounter > _traceTimerMax) {
            _self.traceStop();
        }

        // AJAX call
        $.ajax({
            url: SDNLG_CONF.trace_server + "/sdntrace/trace/" + traceId + "?q=" + Math.random(),
            type: 'GET',
            dataType: 'json',
            crossdomain:true
        })
        .done(function(json) {
            ajaxDone(json);
            console.log('call_trace_listener  ajax done');
        })
        .fail(function() {
            console.warn("call_trace_listener ajax error" );
            // Stop trace
            _self.traceStop();
        })
        .always(function() {
            console.log( "call_trace_listener ajax complete" );
        });

        if (_flagCallTraceListenerAgain) {
            _threadTraceListener = setTimeout(_self.callTraceListener, _traceTimerTriggerCall, traceId);
        }
    };
 }; // SDNTrace



var sdntracecp = '';

var SDNTraceCP = function() {
    var _self = this;


    this.highlightPath = function(selector) {
        /**
        * Highlight path. Receive selector var.
        */
        $(selector).addClass("new-link link-trace-cp");
    };


    this.callTraceRequestId = function(json_data) {
        /**
         * Call ajax to trace.
         * Param:
         *    json_data: Data in json String format to send as PUT method.
         */

        var ajaxDone = function(json) {


            // Trigger AJAX to retrieve the trace result
            var json_obj = $.parseJSON(json);
            console.log('SDNTraceCP callTraceRequestId ajaxDone ' + json_obj.result.trace_id);
            _self.triggerTraceListener(json_obj.result.trace_id);
        };

        // show loading icon
        $('#trace_panel_info .loading-icon-div').show();

        // AJAX call
        $.ajax({
            //url: "/api/amlight/sdntrace_cp/trace",
            url: "/kytos/sdntrace_cp/trace",
            type: 'PUT',
            contentType: 'application/json',
            data: json_data
        })
        .done(function(json) {
            ajaxDone(json);
        })
        .fail(function(responseObj) {
            if (responseObj.responseJSON) {
                $('#trace-result-content').html("<div class='bg-danger'>"+responseObj.responseJSON.error+"</div>");
            } else {
                $('#trace-result-content').html("<div class='bg-danger'>Trace error.</div>");
            }
            console.warn("call_trace_request_id ajax error" );
        })
        .always(function() {
            $('#trace_panel_info').show();
        });
    };



    // Timeout flag to stop the trace listener
    var _threadTraceListener = "";
    // Time to trigger the next call in ms
    var _traceTimerTriggerCall = 1000;
    // Total time to trigger the call. After that trigger timeout method.
    var _traceTimerMax = 30000;

    var _traceTimerCounter = 0;


    // Reset all variables to start the trace
    this.traceReset = function() {
        clearTimeout(_threadTraceListener);
        _threadTraceListener = "";
        _traceTimerCounter = 0;
        _flagCallTraceListenerAgain = true;
    };

    // Stop trace thread and block all variables.
    this.traceStop = function() {

        clearTimeout(_threadTraceListener);

        _threadTraceListener = "";
        _traceTimerCounter = 100000;
        _flagCallTraceListenerAgain = false;

        // hide loading icon
        $('#trace_panel_info .loading-icon-div').hide();
    };

    var _flagCallTraceListenerAgain = true;


    this.triggerTraceListener = function(traceId) {
        console.log('SDNTraceCP triggerTraceListener ' + traceId);

        // show load icon
        $('#trace_cp_panel_info').show();
        $('#trace_cp_panel_info .loading-icon-div').show();

        // Clearing the trace panel
        $('#trace-result-content').html("");
        $('#trace_cp_panel_info_collapse').collapse("hide");

        // Call to AJAX to retrieve the trace result
        _self.callTraceListener(traceId);
    };


    var _flagCallTraceListenerAgain = true;

    this.callTraceListener = function(traceId) {
        var htmlRender = function(jsonObj) {
            /**
            * Render trace result html info.
            */
            var htmlContent = "";
            htmlContent += "<div class='row'>";
            htmlContent += "</div>";
            htmlContent += sdntraceutil.tracePanelHtml(jsonObj);

            $('#trace-cp-result-content').html(htmlContent);
            $('#trace_cp_panel_info_collapse').collapse("show");
        };

        var _addNewHtmlNode = function(_id) {
            /**
            Add html data selector after add a new node
            */
            var html_selector = "#node-" + _id;
            $(html_selector).addClass("new-node node-trace-active");
            $(html_selector).attr("data-nodeid", _id);
        };

        var _addNewHtmlLink = function(_idFrom, _idTo) {
            /**
            Add html data selector after add a new link
            */
            var html_selector = "#link-CP" + _idFrom +"-"+ _idTo;
            _self.highlightPath(html_selector);
            $(html_selector).attr("data-linkid", _idFrom +"-"+ _idTo);
        };

        var ajaxDone = function(jsonObj) {
            if (jsonObj && jsonObj === "0") {
                return;
            }

            try {
                if (jsonObj.result && jsonObj.result.length > 0) {
                    var flag_has_domain = false;
                    // temporary var to last node
                    var last_node_id = null;
                    // temporary var to last interdomain
                    var last_domain_id = null;

                    for (var i = 0, len = jsonObj.result.length; i < len; i++) {
                        var result_item = jsonObj.result[i];
                        var _id = null;

                        if (result_item.hasOwnProperty("domain")) {
                            // Add new domain node
                            _label = result_item.domain;
                            // add node data do d3
                            var node_domain = d3lib.addNewNodeDomain(result_item.domain, _label);
                            _id = node_domain.id;
                            // add html data
                            _addNewHtmlNode(_id);

                            // Add new link
                            d3lib.addNewLink(last_node_id, _id);
                            _addNewHtmlLink(last_node_id, _id);

                            flag_has_domain = true;
                            last_domain_id = _id;
                        }
                        if (result_item.hasOwnProperty("dpid")) {
                            _id = result_item.dpid;

                            if (last_node_id == null) {
                                last_node_id = _id;
                            } else {
//                            if (flag_has_domain) {
//                                // Add new switch node related to new domain
//                                d3lib.addNewNode(_id, "", last_domain_id);
//                                _addNewHtmlNode(_id);

                                // Add new link
                                d3lib.addNewLink(last_node_id, _id, "CP");
                                _addNewHtmlLink(last_node_id, _id, "CP");
//                            }
                                $(document.getElementById("node-" + _id)).addClass("node-trace-active");
                            }
                        }


                        if (i > 0 && jsonObj.result[i-1].hasOwnProperty("dpid") && jsonObj.result[i].hasOwnProperty("dpid")) {
                            // Add new link between nodes
                            var css_selector = document.getElementById("link-CP" + jsonObj.result[i-1].dpid +"-"+ jsonObj.result[i].dpid);
                            _self.highlightPath(css_selector);
                            // Activate the return link too

                            css_selector = document.getElementById("link-CP" + jsonObj.result[i].dpid +"-"+ jsonObj.result[i-1].dpid);
                            _self.highlightPath(css_selector);
                        }

                        last_node_id = _id;


                    console.log("trace result");
                    console.log(jsonObj.result[jsonObj.result.length - 1]);

                        var last_result_item = jsonObj.result[jsonObj.result.length - 1];
                        if (last_result_item.type === REST_TRACE_TYPE.LAST) {
                            // FLAG to stop the trigger loop
                            if (_self._flagCallTraceListenerAgainCounter < 12) {
                                _self._flagCallTraceListenerAgainCounter = _self._flagCallTraceListenerAgainCounter + 1;
                            } else {
                                console.log('type last');
                                // stop the interval loop
                                _self.traceStop();
                            }
                        } else if (last_result_item.type === REST_TRACE_TYPE.ERROR) {
                            console.log('type error');
                            // stop the interval loop
                            _self.traceStop();
                        }

                    }

                }
                htmlRender(jsonObj);
            } catch(err) {
                console.error(err);
                _self.traceStop();
                throw err;
            }
        };


        // counting the trace time elapsed
        _traceTimerCounter = _traceTimerCounter + _traceTimerTriggerCall;

        // Timeout. Stopping the trace.
        if(_traceTimerCounter > _traceTimerMax) {
            _self.traceStop();
        }


        // AJAX call
        $.ajax({
            url: "/kytos/sdntrace_cp/trace/" + traceId + "?t=CP&q=" + Math.random(),
            type: 'GET',
            dataType: 'json',
            crossdomain:true
        })
        .done(function(json) {
            /* MOCK JSON RESPONSE */
            //var json_dump = MOCK.JSON_TRACE_CONTROL_PLANE;
            //var jsonobj = $.parseJSON(json);

            ajaxDone(json);
            console.log('SDNTrace Control plane call_trace_listener  ajax done');
        })
        .fail(function() {
            console.warn("SDNTrace Control plane call_trace_listener ajax error" );
            _self.traceStop();
        })
        .always(function() {
            console.log( "SDNTrace Control plane call_trace_listener ajax complete" );

            $('#trace_cp_panel_info .loading-icon-div').hide();
        });

        console.log('_flagCallTraceListenerAgain = ' + _flagCallTraceListenerAgain);
        if (_flagCallTraceListenerAgain) {
            _threadTraceListener = setTimeout(_self.callTraceListener, _traceTimerTriggerCall, traceId);
        }
    };
 }; // SDNTrace Control plane




/* Initial load */
$(function() {
    sdntrace = new SDNTrace();
    sdntracecp = new SDNTraceCP();

    // Trace form modal
    sdn_trace_form_dialog = $( "#sdn_trace_form" ).dialog({
        autoOpen: false,
        height: 600,
        width: 750,
        modal: true,
        buttons: {
            Cancel: function() {
              sdn_trace_form_dialog.dialog( "close" );
            }
        },
        close: function() {
         sdn_trace_form_dialog.dialog( "close" );
        }
    });

    // Trace form click events to submit forms
    $('#layer2_btn').click(function() {
        var jsonStr = sdntrace.buildTraceLayer2JSON();
        sdntrace.callTraceRequestId(jsonStr);
        sdntracecp.callTraceRequestId(jsonStr);
    });
    $('#layer3_btn').click(function() {
        var jsonStr = sdntrace._build_trace_layer3_json();
        sdntrace.callTraceRequestId(jsonStr);
        sdntracecp.callTraceRequestId(jsonStr);
    });
    $('#layerfull_btn').click(function() {
        var jsonStr = sdntrace._build_trace_layerfull_json();
        sdntrace.callTraceRequestId(jsonStr);
        sdntracecp.callTraceRequestId(jsonStr);
    });
});
