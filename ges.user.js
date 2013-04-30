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
    },
    {
        label: 'Convert Issue IDs to Links',
        key:   'link-issues',
        type:  'checkbox'
    },
    {
        label: 'Issue ID Pattern',
        key:   'issue-pattern',
        type:  'text'
    },
    {
        label: 'JIRA URL (with trailing slash)',
        key:   'jira-url',
        type:  'text'
    },
    {
        label: 'Light GitHub Favicon',
        key:   'lt-gh-icon',
        type:  'checkbox'
    },
];

GES.storage = function(key, value) {
    key = 'ges-' + key;
    if (value === undefined) {
        if (localStorage[key] === 'true') return true;
        if (localStorage[key] === 'false') return false;
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
            case 'checkbox':
                input = '<input class="ges-autosave" type="checkbox" name="' + setting.key + '" value="yes" ' + (GES.storage(setting.key) ? 'checked="checked"' : '') + '>';
                break;
        }
        $('div.boxed-group.ges div.boxed-group-inner').append('<dl class="form"><dt><label>'+setting.label+'</label></dt><dd>' + input + '</dd></dl>');
    });
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

GES.gh.setAlternateFavicon = function() {
    if (!GES.storage('lt-gh-icon')) return;
    var link  = document.createElement('link');
    link.type = 'image/png';
    link.rel  = 'shortcut icon';
    link.href = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAYFJREFUeNqM098rQ2EYwPGziY3IzeJijZgaV278KmlFpsRcuFAuLeFv8RcoJUtqhbhQ5GbcsEIuSKv5UVJ+G00R2/F9t+fodNqapz47O0/vec7zvud9NV3XNYsuzCOOFyRxiWX0W8fb1I9EOWYxjROsI440mjCIHsnP4CH7lFSqwDaeEcjTlaEdCZyiRuXs8nb15k4MwIcAnHCjTv53oA8jcr+IElW1Tc9FEHb8yP2VzP8N1/iUfD1akMGoJgt2LC024l0vHGn4ZewKdtUU/FiTqYRQpRUOuyyyighaVcKFc0k2aMXDI9cEHKqADRlJ3v6jwL21pVd45T6MjyIFwnJVX+dbFYhhCKVqW2AYW38bJRdJRDGODckFsxuNleyVFe5GCBMow4Jp9Xckp5m+1hcmjcQqLuDBHA6RMhW4QbWMrUQMR3AaBVw4ky2qNpYbB5YCDnixh0f4sufI1FYtNqW1JenIiKScxpR012w8l+/AjCGKO9muKp6wjynLWmi/AgwAaeUU1t5lRsgAAAAASUVORK5CYII=';
    document.getElementsByTagName('head')[0].appendChild(link);
};

GES.gh.convertIssuesToLinks = function() {
    if (!GES.storage('link-issues')) return;
    // GH has some event that overrides/rewrites the links later
    setTimeout(function() {
        var find = new RegExp('\\b\(' + GES.storage('issue-pattern') + '\)\\b', 'gi');
        replaceInElement(document.body, find, function(match) {
            var link = document.createElement('a');
            link.href = GES.storage('jira-url') + 'browse/' + match[0].replace(/([A-Z]+)(\d+)/,'\$1-\$2');
            link.appendChild(document.createTextNode(match[0]));
            return link;
        });
    }, 900);
};

GES.init = function() {
    GES.gh.detectCurrentRequest();
    if (GES.handlers[GES.gh.currentPage.page]) GES.handlers[GES.gh.currentPage.page]();

    GES.gh.renderSettings();
    GES.gh.setAlternateFavicon();
    GES.gh.convertIssuesToLinks();

    var changeValue = function() {
        if ($(this).attr('type') == 'checkbox') {
            value = this.checked;
        } else {
            value = $(this).val();
        }
        GES.storage($(this).attr('name'), value);
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



/**
 * Random utils / scripts
 */

// Source: http://stackoverflow.com/questions/1444409/in-javascript-how-can-i-replace-text-in-an-html-page-without-affecting-the-tags
function replaceInElement(element, find, replace) {
    for (var i= element.childNodes.length; i-->0;) {
        var child= element.childNodes[i];
        if (child.nodeType==1) {
            var tag= child.nodeName.toLowerCase();
            if (tag!='style' && tag!='script')
                replaceInElement(child, find, replace);
        } else if (child.nodeType==3) { // TEXT_NODE
            replaceInText(child, find, replace);
        }
    }
}
function replaceInText(text, find, replace) {
    var match;
    var matches= [];
    while (match= find.exec(text.data))
        matches.push(match);
    for (var i= matches.length; i-->0;) {
        match= matches[i];
        text.splitText(match.index);
        text.nextSibling.splitText(match[0].length);
        text.parentNode.replaceChild(replace(match), text.nextSibling);
    }
}
