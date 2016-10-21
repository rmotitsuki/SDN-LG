    /* Initial configuration */
    var _initial_configuration = function() {
        if (typeof SDNLG_CONF != 'undefined') {
            // header logo img src
            $('#header__logo img').attr("src", SDNLG_CONF.header_logo_img_src);
            // header name
            // $('#header__name').text(SDNLG_CONF.header_name);
            // SDN LG version
            $('#about__version').text(SDNLG_CONF.version);
            $('#about__roadmap').html(SDNLG_CONF.about_roadmap);
        }
    }

    /* Initial load */
    $(function() {
        console.log('init');
        // Load js configuration data
        _initial_configuration();
    });