// ==UserScript==
// @name        GitHub Enhancement Suite
// @namespace   http://evan.pro/
// @description Adding a little extra awesome to GitHub.
// @include     https://github.com/*
// @include     https://*.github.com/*
// @version     1
// ==/UserScript==

var GES = {
    gh: {},
    handlers: {},
};

GES.settings = [
    {
        label:  'OAuth Token',
        key:    'oauth-token',
        type:   'text'
    }
];

GES.storage = function(key, value) {
    key = 'ges-' + key;
    if (value == undefined) {
        return localStorage[key];
    }
    localStorage[key] = value;
}

GES.gh.isProfilePage = function() {
    return ($('.settings-content .boxed-group h3:first').text() == 'Public Profile');
};

GES.gh.renderSettings = function() {
    if (!GES.gh.isProfilePage()) return;
    if ($('div.boxed-group.ges').length > 0) return;
    $('.settings-content').append('<div class="boxed-group clearfix ges"><h3>GitHub Enhancement Suite</h3><div class="boxed-group-inner clearfix"></div></div>');
    $(GES.settings).each(function(i, setting) {
        switch (setting.type)
        {
            case 'text':
                input = '<input class="ges-autosave" type="text" name="' + setting.key + '" value="' + GES.storage(setting.key) + '">';
                break;
        }
        $('div.boxed-group.ges div.boxed-group-inner').append('<dl class="form"><dt><label>'+setting.label+'</label></dt><dd>' + input + '</dd></dl>');
    });
};

GES.gh.oauthCheck = function(connected, notConnected) {
    if (!GES.storage('oauth-key')) {
        return notConnected();
    } else {
        return connected();
    }
};

/**
 * Parse the window location (current URL) to figure out where exactly we are.
 */
GES.gh.detectCurrentRequest = function() {
    var url = document.createElement('a');
    url.href = window.location;
    pathParts = url.pathname.split('/');
    user = pathParts[1];
    repo = pathParts[2];
    page = pathParts[3];
    query = url.search.substring(1);
    GES.gh.currentPage = {
        user: pathParts[1],
        repo: pathParts[2],
        page: pathParts[3],
        query: url.search.substring(1)
    };
};

GES.handlers.pulls = function() {
    page = GES.gh.currentPage;
    url = 'https://api.github.com/repos/' + page.user + '/' + page.repo + '/pulls?access_token=' + GES.storage('oauth-token') + '&' + page.query + '&per_page=25';
    $.getJSON(url, function(data) {
        $(data).each(function(i, pull) {
            prEl = $('h4.list-group-item-name > a[href$="pull/' + pull.number + '"]').parent().parent();
            GES.gh.highlightMergedPullRequests(pull, prEl);
            GES.gh.showPullRequestTargetBranch(pull, prEl);
        });
    });
}

GES.gh.highlightMergedPullRequests = function(pull, prEl) {
    if (pull.merged_at) {
        prEl.find('h4.list-group-item-name').find('span.type-icon').css('color', '#B0C4CE');
    }
};

GES.gh.showPullRequestTargetBranch = function(pull, prEl) {
    prEl.find('ul.list-group-item-meta li.branch-name').append('<span class="css-truncate css-truncate-target"> &raquo; ' + pull.base.ref + '</span>');
};

GES.init = function() {
    GES.gh.detectCurrentRequest();
    if (GES.handlers[GES.gh.currentPage.page]) GES.handlers[GES.gh.currentPage.page]();

    GES.gh.renderSettings();

    var changeValue = function() {
        GES.storage($(this).attr('name'), $(this).val());
    }
    $('input.ges-autosave').keypress(changeValue).change(changeValue);
};


/**
 * Start everything once the dom is ready...
 */
$(document).ready(function(){
    GES.init();
});

/**
 * Handle fancy pushState stuff...
 */
(function (old) {
    window.history.pushState = function () {
        old.apply(window.history, arguments);
        setTimeout(function(){ GES.init(); }, 200);
    }
})(window.history.pushState);
