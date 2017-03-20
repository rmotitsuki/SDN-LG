// reference to the trace form dialog
var sdn_trace_form_dialog = '';

var sdntrace = '';

var SDNTrace = function() {
    /**
     * Call ajax to trace.
     * Param:
     *    json_data: Data in json String format to send as PUT method.
     */
    this.call_trace_port = function(json_data) {
        $('#trace-result-content').html('');
        $('.loading-icon-div').show();

        var ajax_done = function(json) {
            console.log('call_trace_port ajax_done');
            console.log(json);

            var jsonObj;
            jsonObj= json;

            // reseting sdntrace tracing variables
            sdntrace.has_trace_loop = false;
            sdntrace.trace = [];

            // storing first element of trace;
            sdntrace.trace.push({id:$('#switches_select').val(), port:$('#switch_port_hidden').val()});

            html_content = ""
            html_content += "<div class='row'><div class='col-sm-12'>Trace result: </div></div><div class='row'>";
            html_content += "<div class='col-sm-10 col-md-5'><table class='table table-striped'>"
            html_content += "<thead><tr><th>Switch/DPID</th><td>Incoming Port</th></tr></thead>"
            html_content += "<tbody>"

            $.each( jsonObj, function( key, val ) {
                if (val == 'loop') {
                    html_content += "<tr><td>" + val + "</td></tr>";
                    // flag looping switch.
                    sdntrace.has_trace_loop = true;
                } else {
                    html_content += "<tr><td>";

                    var temp_switch = new Switch(val['trace']['dpid']);
                    html_content += temp_switch.get_name_or_id();

                    html_content += "</td>";
                    html_content += "<td>" + val['trace']['port'] + "</td></tr>";
                    sdntrace.trace.push({id:val['trace']['dpid'], port:val['trace']['port']});
                }
            });
            html_content += "</tbody></table></div></div>";

            $('#trace-result-content').html(html_content);
        }

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
            $('#trace-result-panel').show();
        });
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
 } // SDNTrace


/* Initial load */
$(function() {

    sdntrace = new SDNTrace();

    console.log(sdn_trace_form_dialog);
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

    console.log(sdn_trace_form_dialog);

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