
/* Global Splitter object */
var splitter = null;
/* Global Splitter initial position */
var splitter_initial_position = null;

var reset_right_pannel = function() {
    splitter = $('#splitter__div').height(700).split({
        orientation: 'vertical',
        limit: 10,
        position: '100%', // if there is no percentage it interpret it as pixels
    });
    splitter_initial_position = splitter.position();
    $('#domain_panel_info').hide();
    $('#switch_panel_info').hide();
    $('#port_panel_info').hide();
    $('#trace_panel_info').hide();
    $('#trace_cp_panel_info').hide();
};

var show_right_pannel = function() {
    if (splitter.position() === splitter_initial_position) {
        splitter.settings.position = '70%';
        splitter.position('70%');
    }
};


/* Initial load */
$(function() {
    reset_right_pannel();
});