// Mock json trace
var MOCK_JSON_TRACE = '80001';
var MOCK_JSON_TRACE_RESULT = '{"total_time": "0:00:03.520170","start_time": "2017-03-21 13:30:42.024902",'+
    '"result": ['+
    '{"time": "2017-03-21 13:30:42.024902","type": "starting","port": "s1-eth1","dpid": "0000000000000001"},'+
    '{"time": "0:00:00.510086","type": "trace","port": "s2-eth2","dpid": "0000000000000002"},'+
    '{"time": "0:00:01.012277","type": "trace","port": "s3-eth2","dpid": "0000000000000003"},'+
    '{"time": "0:00:01.514501","type": "trace","port": "s4-eth2","dpid": "0000000000000004"},'+
    '{"msg": null,"reason": "done","type": "last","time": "0:00:03.519943"}],'+
    '"request_id": 80001}';


// reference to the trace form dialog
var sdn_trace_form_dialog = '';

var sdntrace = '';

var SDNTrace = function() {

    // last trace id executing
    this.last_trace_id = "";

    this.clear_trace_interface = function() {
        /**
        * Clear trace forms, result, result pannel, dialog modal, graph highlight, graph trace
        */
        $('#trace-result-content').html('');
        $('.loading-icon-div').show();

        // clear d3 graph highlight nodes, links
        forcegraph.exit_highlight();

        // clear d3 graph trace classes
        $("circle").removeClass("node-trace-active");
        $("line").removeClass("link-trace-active");

        // close modal trace form
        sdn_trace_form_dialog.dialog( "close" );
    }

    this.call_trace_port = function(json_data) {
        /**
         * Call ajax to trace.
         * Param:
         *    json_data: Data in json String format to send as PUT method.
         */
        sdntrace.clear_trace_interface();


        var ajax_done = function(json) {
            // Trigger AJAX to retrieve the trace result
            sdntrace.trigger_trace_listener(json);
        }

        // AJAX call
        if (DEBUG) {
            json = MOCK_JSON_TRACE;
            var jsonobj = $.parseJSON(json);
            ajax_done(jsonobj);

        } else {
            var jqxhr = $.ajax({
                url: SDNLG_CONF.trace_server + "/sdntrace/trace",
                type: 'PUT',
                dataType: 'json',
                data: json_data
            }).done(function(json) {
                ajax_done(json);
            })
            .fail(function(responseObj) {
                if (responseObj.responseJSON) {
                    $('#trace-result-content').html("<div class='bg-danger'>"+responseObj.responseJSON.error+"</div>");
                } else {
                    $('#trace-result-content').html("<div class='bg-danger'>Trace error.</div>");
                }
            })
            .always(function() {
                $('.loading-icon-div').hide();
                $('#trace_panel_info').show();
            });
        }
    }

    this._render_html_trace_form_ports = function(dpid, porta_data) {
        /**
        Callback to be used with the AJAX that retrieve switch ports.
        */

        $('#sdn-trace-form-switch-hidden').val(dpid);
        $('#sdn-trace-form-switch-port-hidden').val('');

        $('#sdn-trace-form-switch-ports-content select').change(function() {
            $('#sdn-trace-form-switch-port-hidden').val(this.value);
        });

        $.each(porta_data, function(){
            $('<option/>', {
                'value': this.port_no,
                'text': this.port_no + " - " + this.name
            }).appendTo('#sdn-trace-form-switch-ports-content select');
        });
    }


    /**
     * Build json string from form fields to send to trace layer 2 ajax.
     */
    this._build_trace_layer2_json = function() {
        var layer2 = new Object();
        layer2.trace = new Object();

        layer2.trace.switch = new Object();
        layer2.trace.switch.dpid = $('#switches_select').val();
        layer2.trace.switch.in_port = $('#switch_port_hidden').val();
        if (layer2.trace.switch.in_port) {
            layer2.trace.switch.in_port = parseInt(layer2.trace.switch.in_port, 10);
        }

        layer2.trace.eth = new Object();
        layer2.trace.eth.dl_src = $('#l2_dl_src').val();
        layer2.trace.eth.dl_dst = $('#l2_dl_dst').val();
        layer2.trace.eth.dl_vlan = $('#l2_dl_vlan').val();
        if (layer2.trace.eth.dl_vlan) {
            layer2.trace.eth.dl_vlan = parseInt(layer2.trace.eth.dl_vlan, 10);
        }
        layer2.trace.eth.dl_type = $('#l2_dl_type').val();
        if (layer2.trace.eth.dl_type) {
            layer2.trace.eth.dl_type = parseInt(layer2.trace.eth.dl_type, 10);
        }

        layer2 = sdntrace._remove_empty_json_values(layer2);
        var layer2String = JSON.stringify(layer2);
        return layer2String;
    }

    /**
     * Build json string from form fields to send to trace layer 3 ajax.
     */
    this._build_trace_layer3_json = function() {
        var layer3 = new Object();
        layer3.trace = new Object();

        layer3.trace.switch = new Object();
        layer3.trace.switch.dpid = $('#switches_select').val();
        layer3.trace.switch.in_port = $('#switch_port_hidden').val();
        if (layer3.trace.switch.in_port) {
            layer3.trace.switch.in_port = parseInt(layer3.trace.switch.in_port, 10);
        }

        layer3.trace.eth = new Object();
        layer3.trace.eth.dl_vlan = $('#l3_dl_vlan').val();
        if (layer3.trace.eth.dl_vlan) {
            layer3.trace.eth.dl_vlan = parseInt(layer3.trace.eth.dl_vlan, 10);
        }

        layer3.trace.ip = new Object();
        layer3.trace.ip.nw_src = $('#l3_nw_src').val();
        layer3.trace.ip.nw_dst = $('#l3_nw_dst').val();
        layer3.trace.ip.nw_tos = $('#l3_nw_tos').val();
        if (layer3.trace.ip.nw_tos) {
            layer3.trace.ip.nw_tos = parseInt(layer3.trace.ip.nw_tos, 10);
        }

        layer3.trace.tp = new Object();
        layer3.trace.tp.tp_src = $('#l3_tp_src').val();
        layer3.trace.tp.tp_dst = $('#l3_tp_dst').val();
        if (layer3.trace.tp.tp_dst) {
            layer3.trace.tp.tp_dst = parseInt(layer3.trace.tp.tp_dst, 10);
        }
        layer3 = sdntrace._remove_empty_json_values(layer3);
        var layer3String = JSON.stringify(layer3);

        return layer3String;
    }

    /**
     * Build json string from form fields to send to full trace ajax.
     */
    this._build_trace_layerfull_json = function() {
        var layerfull = new Object();
        layerfull.trace = new Object();

        layerfull.trace.switch = new Object();
        layerfull.trace.switch.dpid = $('#switches_select').val();
        layerfull.trace.switch.in_port = $('#switch_port_hidden').val();
        if (layerfull.trace.switch.in_port) {
            layerfull.trace.switch.in_port = parseInt(layerfull.trace.switch.in_port, 10);
        }

        layerfull.trace.eth = new Object();
        layerfull.trace.eth.dl_src = $('#lf_dl_src').val();
        layerfull.trace.eth.dl_dst = $('#lf_dl_dst').val();
        layerfull.trace.eth.dl_vlan = $('#lf_dl_vlan').val();
        if (layerfull.trace.eth.dl_vlan) {
            layerfull.trace.eth.dl_vlan = parseInt(layerfull.trace.eth.dl_vlan, 10);
        }

        layerfull.trace.eth.dl_type = $('#lf_dl_type').val();
        if (layerfull.trace.eth.dl_type) {
            layerfull.trace.eth.dl_type = parseInt(layerfull.trace.eth.dl_type, 10);
        }

        layerfull.trace.ip = new Object();
        layerfull.trace.ip.nw_src = $('#lf_nw_src').val();
        layerfull.trace.ip.nw_dst = $('#lf_nw_dst').val();
        layerfull.trace.ip.nw_tos = $('#lf_nw_tos').val();
        if (layerfull.trace.ip.nw_tos) {
            layerfull.trace.ip.nw_tos = parseInt(layerfull.trace.ip.nw_tos, 10);
        }
        layerfull.trace.tp = new Object();
        layerfull.trace.tp.tp_src = $('#lf_tp_src').val();
        layerfull.trace.tp.tp_dst = $('#lf_tp_dst').val();
        if (layerfull.trace.tp.tp_dst) {
            layerfull.trace.tp.tp_dst = parseInt(layerfull.trace.tp.tp_dst, 10);
        }

        layerfull = sdntrace._remove_empty_json_values(layerfull);
        var layerfullString = JSON.stringify(layerfull);

        return layerfullString;
    }
    /**
     * Helper function to remove attributes with empty values from a json object.
     */
    this._remove_empty_json_values = function(obj) {
        for (var i in obj) {
            for (var j in obj[i]) {
                for (var w in obj[i][j]) {
                    if (obj[i][j][w] === null || obj[i][j][w] == '') {
                        delete obj[i][j][w];
                    }
                }
                if (jQuery.isEmptyObject(obj[i][j])) {
                    delete obj[i][j];
                }
            }
            if (jQuery.isEmptyObject(obj[i])) {
                delete obj[i];
            }
        }
        return obj;
    }


    // Timeout flag to stop the trace listener
    var _thread_trace_listener = "";
    // Time to trigger the next call in ms
    var _trace_timer_trigger_call = 1000;
    // Total time to trigger the call. After that trigger timeout method.
    var _trace_timer_max = 20000;

    var _trace_timer_counter = 0;

    this.trigger_trace_listener = function(trace_id) {
        sdntrace.last_trace_id = trace_id;

        // Stopping any ongoing trace.
        sdntrace.trace_stop();

        // Clearing the trace panel
        $('#trace-result-content').html("");
        $('#trace_panel_info_collapse').collapse("hide");

        // Call to AJAX to retrieve the trace result
        this.call_trace_listener(trace_id);
    }

    this.trace_stop = function() {
        _thread_trace_listener = "";
        _trace_timer_counter = 0;

        clearTimeout(_thread_trace_listener);
    }

    this.call_trace_listener = function(trace_id) {

        var html_render = function(jsonObj) {
            /**
            * Render trace result html info.
            */
            html_content = ""
            html_content += "<div class='row'>";
            html_content += "<div class='col-sm-12'>";
            html_content += "<strong>Start time:</strong>" + jsonObj.start_time;
            html_content += "<br>";
            html_content += "<strong>Total time:</strong>" + jsonObj.total_time;
            html_content += "<hr>";
            html_content += "</div>";
            html_content += "<div class='col-sm-12'>";
            html_content += "<table class='table table-striped'>";
            html_content += "<thead><tr><th></th><th>Switch/DPID</th><th>Incoming Port</th><th>Time</th></tr></thead>";
            html_content += "<tbody>";

            for (var i = 0, len = jsonObj.result.length; i < len; i++) {
                html_content += "<tr data-type="+ jsonObj.result[i].type +">";
                html_content += "<td>" + (i+1) + "</td>";
                if (jsonObj.result[i].type == "starting") {
                    html_content += "<td>" + jsonObj.result[i].dpid + "</td>";
                    html_content += "<td>" + jsonObj.result[i].port + "</td>";
                    html_content += "<td>" + "</td>";
                } else if (jsonObj.result[i].type == "trace") {
                    html_content += "<td>" + jsonObj.result[i].dpid + "</td>";
                    html_content += "<td>" + jsonObj.result[i].port + "</td>";
                    html_content += "<td>" + jsonObj.result[i].time + "</td>";
                } else if (jsonObj.result[i].type = "last") {
                    html_content += "<td></td>";
                    html_content += "<td></td>";
                    html_content += "<td>" + jsonObj.result[i].time + "</td>";
                } else if (jsonObj.result[i].type = "error") {
                    html_content += "<td colspan='3'>" + jsonObj.result[i].message + "</td>";
                }
                html_content += "</tr>";
            }

            html_content += "</tbody></table></div></div>";

            $('#trace-result-content').html(html_content);
            $('#trace_panel_info_collapse').collapse("show");
        }

        var ajax_done = function(jsonObj) {
            if (_thread_trace_listener == "") {
                return;
            }
            console.log("call_trace_listener jsonObj");
            console.log(jsonObj);

            if (jsonObj.result.length > 0) {
                for (var i = 0, len = jsonObj.result.length; i < len; i++) {
                    var result_item = jsonObj.result[i];
                    console.log(result_item);

                    if (result_item.hasOwnProperty("dpid")) {
                        var css_selector = "#node-" + result_item.dpid;
                        $(css_selector).addClass("node-trace-active");
                    }
                    if (i > 0 && jsonObj.result[i-1].hasOwnProperty("dpid") && jsonObj.result[i].hasOwnProperty("dpid")) {
                        var css_selector = "#link-" + jsonObj.result[i-1].dpid +"-"+ jsonObj.result[i].dpid;
                        $(css_selector).addClass("link-trace-active");
                    }
                }

                var last_result_item = jsonObj.result[jsonObj.result.length - 1];
                if (last_result_item.type == "last") {
                    // stop the interval loop
                    sdntrace.trace_stop();

                    // TODO: show messages
                    console.log("trace last item type OK. Total time:" + jsonObj.total_time);
                }
            }
            html_render(jsonObj);
        }

        // counting the trace time elapsed
        _trace_timer_counter = _trace_timer_counter + _trace_timer_trigger_call;

        // Timeout. Stopping the trace.
        if(_trace_timer_counter > _trace_timer_max) {
            sdntrace.trace_stop();
            return;
        }

        // AJAX call
        if (DEBUG) {
            json = MOCK_JSON_TRACE_RESULT;
            var jsonobj = $.parseJSON(json);
            ajax_done(jsonobj);

        } else {
            var jqxhr = $.ajax({
                url:"/sdntrace/trace",
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

        _thread_trace_listener = setTimeout(this.call_trace_listener, _trace_timer_trigger_call);
    }

    /**
     * Call ajax to load trace result.
     */
    this.call_get_trace = function() {
        var ajax_done = function(jsonObj) {
            last_trace = jsonObj;
        }

        // AJAX call
        if (DEBUG) {
            json = MOCK_JSON_TRACE;
            var jsonobj = $.parseJSON(json);
            ajax_done(jsonobj);

            // render D3 force
            d3lib.render_topology();

        } else {
            var jqxhr = $.ajax({
                url:"/sdntrace/trace",
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
 } // SDNTrace


/* Initial load */
$(function() {

    sdntrace = new SDNTrace();

    // Trace form modal
    sdn_trace_form_dialog = $( "#sdn-trace-form" ).dialog({
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
        jsonStr = sdntrace._build_trace_layer2_json();
        sdntrace.call_trace_port(jsonStr);
    });
    $('#layer3_btn').click(function() {
        jsonStr = sdntrace._build_trace_layer3_json();
        sdntrace.call_trace_port(jsonStr);
    });
    $('#layerfull_btn').click(function() {
        jsonStr = sdntrace._build_trace_layerfull_json();
        sdntrace.call_trace_port(jsonStr);
    });
});