var TabManager = /** @class */ (function () {
    function TabManager() {
    }
    TabManager.prototype.initialiseTabs = function () {
        var self = this;
        var myUrl = window.location.href;
        var myUrlTab = myUrl.substring(myUrl.indexOf("#"));
        var myUrlTabName = myUrlTab.substring(0, 4);
        // hide all content initially
        $("#tab__content > div").hide();
        // activate the first tab
        $("#tabs li:first a").attr("id", "current");
        // show the first tab contents
        $("#tab__content > div:first").fadeIn();
        $("#tabs a").on("click", function (e) {
            // identify the current tab
            if ($(this).attr("id") == "current") {
                return;
            }
            else {
                self.resetTabs();
                $(this).attr("id", "current");
                $($(this).attr('name')).fadeIn();
            }
        });
        for (var i = 1; i <= $("#tabs li").length; i++) {
            if (myUrlTab == myUrlTabName + i) {
                self.resetTabs();
                $("a[name='" + myUrlTab + "']").attr("id", "current");
                $(myUrlTab).fadeIn();
            }
        }
    };
    TabManager.prototype.resetTabs = function () {
        // hide all tab content
        $("#tab__content > div").hide();
        // reset id's
        $("#tabs a").attr("id", "");
    };
    TabManager.prototype.emptyFriendList = function () {
        $("#list__friends").empty();
    };
    TabManager.prototype.addItemToFriendList = function (username) {
        var f = $('<div/>');
        f.addClass('list__item');
        f.appendTo('#list__friends');
        f.on('click', function () {
            console.log('friend clicked');
        });
        var name = $('<span/>');
        name.addClass('item--name');
        name.append(username);
        name.appendTo(f);
    };
    TabManager.prototype.emptyHubList = function () {
        $("#list__hubs").empty();
    };
    TabManager.prototype.addItemToHubList = function (id, vis) {
        /* Structure:
        <div class="list__item">
            <span class="item--name"> NAME </span>
            <span class="item--tag"> VISIBILITY </span>
        </div>
        */
        var h = $('<div/>');
        h.addClass('list__item');
        h.on('click', function () {
            goManager.joinHub(id);
            groupUIManager.hideMenu();
        });
        var name = $('<span/>');
        name.addClass('item--name');
        name.append(id);
        name.appendTo(h);
        var tag = $('<span/>');
        tag.addClass('item--tag');
        tag.append(vis);
        tag.appendTo(h);
        switch (vis) {
            case "public":
                tag.addClass('tag--public');
                break;
            case "private":
                tag.addClass('tag--private');
                break;
            case "secret":
                tag.addClass('tag--secret');
                break;
            default:
        }
        h.appendTo('#list__hubs');
    };
    return TabManager;
}());
