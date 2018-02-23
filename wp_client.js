// API get IP of contact
var ipAPI = '103.56.158.22:9090/api/visitor/ip';
// API save file upload (file CV)

var save_contact_url = "http://heliosapi.topicanative.asia/helios_save.php"; 
//var save_contact_url = "http://209.58.165.15/helios_save.php"; 

jQuery(document).ready(function () {
    console.log("visitor");
    olmxSendVisitor();
});

var olmxBrowserInfo = function () {
    var nVer = navigator.appVersion;
    var nAgt = navigator.userAgent;
    var browserName = navigator.appName;
    var fullVersion = '' + parseFloat(navigator.appVersion);
    var majorVersion = parseInt(navigator.appVersion, 10);
    var nameOffset, verOffset, ix;
    var device = 'desktop';
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        device = 'mobile';
    }

    // In Opera 15+, the true version is after "OPR/"
    if ((verOffset = nAgt.indexOf("OPR/")) != -1) {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 4);
    }
    // In older Opera, the true version is after "Opera" or after "Version"
    else if ((verOffset = nAgt.indexOf("Opera")) != -1) {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
        browserName = "Microsoft Internet Explorer";
        fullVersion = nAgt.substring(verOffset + 5);
    }
    // In Chrome, the true version is after "Chrome"
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
        browserName = "Chrome";
        fullVersion = nAgt.substring(verOffset + 7);
    }
    // In Safari, the true version is after "Safari" or after "Version"
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
        browserName = "Safari";
        fullVersion = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }
    // In Firefox, the true version is after "Firefox"
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
        browserName = "Firefox";
        fullVersion = nAgt.substring(verOffset + 8);
    }
    // In most other browsers, "name/version" is at the end of userAgent
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) <
            (verOffset = nAgt.lastIndexOf('/'))) {
        browserName = nAgt.substring(nameOffset, verOffset);
        fullVersion = nAgt.substring(verOffset + 1);
        if (browserName.toLowerCase() == browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) != -1)
        fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) != -1)
        fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt('' + fullVersion, 10);
    if (isNaN(majorVersion)) {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    return {
        'browser_name': browserName,
        'full_version': fullVersion,
        'major_version': majorVersion,
        'device': device
    };
};

var olmxLandingPage = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query = window.location.href;
    var vars = query.split("?");
    if (vars.length > 1) {
        return vars[0];
    } else {
        return query;
    }
};

function olmxSearchParams(k) {
    var p = {};
    location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (s, k, v) {
        p[k] = v;
    });
    return k ? p[k] : p;
}

var olmxLoadIp = function () {
    jQuery.ajax({
        method: "GET",
        url: ("https:" == document.location.protocol ? "https://" : "http://") + ipAPI,
        data: {}
    }).success(function (data) {
        olm_ip = data.REMOTE_ADDR;
    });
};

function olmxSendVisitor() {
    olmxLoadIp();
    setTimeout(function () {
        var browser_info = olmxBrowserInfo();
        var session_data = {
            //code: (ClientStorage.get('visitor_code')) ? ClientStorage.get('visitor_code') : null,
            //session_code: session_code,
            ip: olm_ip,
            platform: navigator.platform,
            oscpu: (navigator.oscpu) ? navigator.oscpu : '',
            browser: browser_info.browser_name,
            browser_version: browser_info.full_version,
            user_agent: navigator.userAgent,
            device: browser_info.device,
            cookie_enabled: (navigator.cookieEnabled) ? 1 : 0,
            initial_referrer: olm_referer,
            initial_domain: window.location.href,
            ads_link: window.location.href,
            domain: window.location.protocol + "//" + window.location.hostname,
            landing_page: olmxLandingPage()
        };

        //Get default params of landing page
        if (olm_data) {
            for (var i in olm_data) {
                if (olm_data.hasOwnProperty(i)) {
                    session_data[i] = olm_data[i];
                }
            }
        }
        
        var paramsFromURL = olmxSearchParams();
        if (paramsFromURL) {
            for (var i in paramsFromURL) {
                if (paramsFromURL.hasOwnProperty(i)) {
                    session_data[i] = paramsFromURL[i];
                }
            }
        }

        //call API visitor
        session_data['msg_source'] = "landing_page";
        session_data['msg_type'] = "visitor";

        //get code
        var visitor_code = olmxGetCookie("olmx_visitor_code");
        var session_code = olmxGetCookie("olmx_session_code");
        if (visitor_code === undefined) {
            visitor_code = '';
        }
        if (session_code === undefined) {
            session_code = '';
        }
        session_data['visitor_code'] = visitor_code;
        session_data['session_code'] = session_code;

        jQuery.ajax({
            method: "POST",
            dataType: "jsonp",
            crossDomain: true,
            jsonp: false,
            jsonpCallback: "save_data",
            url: save_contact_url,
            data: {action: "visitor", data: JSON.stringify(session_data)}
        }).success(function (response) {
//            var result = JSON.parse(response);
		var result = response;
            if (result.code === 200) {
                if (result.data.visitor_code !== undefined && result.data.visitor_code.length > 0) {
                    olmxSetCookie("olmx_visitor_code", result.data.visitor_code);
                }
                if (result.data.session_code.length !== undefined && result.data.session_code.length > 0) {
                    olmxSetCookie("olmx_session_code", result.data.session_code);
                }
            }
        });

    }, 200);
}

function olmxSetCookie(cname, cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (60 * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function olmxGetCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function olmxSendContact(form) {
    // get device identify
    var browser_info = olmxBrowserInfo();

    //get code
    var visitor_code = olmxGetCookie("olmx_visitor_code");
    var session_code = olmxGetCookie("olmx_session_code");
    if (visitor_code === undefined) {
        visitor_code = '';
    }
    if (session_code === undefined) {
        session_code = '';
    }

	form = jQuery(form);    
    if (form) {
        var params = form.serializeArray();
        var ajax_data = {};
        if (typeof (olm_data) != 'undefined') {
            ajax_data = olm_data;
        }
        ajax_data.msg_source = "landing_page";
        ajax_data.msg_type = "submitter";
        ajax_data.device = browser_info.device;
        ajax_data.domain = window.location.protocol + "//" + window.location.hostname;
        ajax_data.initial_referrer = document.referrer;
        ajax_data.ads_link = window.location.href;
        ajax_data.landing_page = olmxLandingPage();
        ajax_data.ip = olm_ip;
        ajax_data.platform = navigator.platform;
        ajax_data.oscpu = (navigator.oscpu) ? navigator.oscpu : '';
        ajax_data.browser = browser_info.browser_name;
        ajax_data.browser_version = browser_info.full_version;
        ajax_data.user_agent = navigator.userAgent;
        ajax_data.visitor_code = visitor_code;
        ajax_data.session_code = session_code;
        
        for (i = 0; i < params.length; i++) {           

            ajax_data[params[i].name] = params[i].value;
        }

        var paramsFromURL = olmxSearchParams();
        if (paramsFromURL) {
            for (var i in paramsFromURL) {
                if (paramsFromURL.hasOwnProperty(i)) {
                    ajax_data[i] = paramsFromURL[i];
                }
            }
        }

        
        jQuery.ajax({
            method: "POST",
            dataType: "jsonp",
            crossDomain: true,
            jsonp: false,
            jsonpCallback: "save_data",
            url: save_contact_url,
            data: {action: "contact", data: JSON.stringify(ajax_data)}
        }).success(function (response) {
            var result = JSON.parse(response);
            if (result.code === 200) {
                console.log("helios submit contact success: ", response);
                //uploadForm.unbind().submit();
            }
        });
    }
}


