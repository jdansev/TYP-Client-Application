


class TabManager {

    public initialiseTabs() {
        var self: any = this;
    
        var myUrl = window.location.href;
        var myUrlTab = myUrl.substring(myUrl.indexOf("#"));
        var myUrlTabName = myUrlTab.substring(0,4);
    
        // hide all content initially
        $("#tab__content > div").hide();
    
        // activate the first tab
        $("#tabs li:first a").attr("id","current");

        // show the first tab contents
        $("#tab__content > div:first").fadeIn();
        
        $("#tabs a").on("click",function(e) {

            switch ($(this).attr('name')) {
                case '#tab__hubs':
                    self.resetHubTab();
                    break;
                case '#tab__people':
                    self.resetFriendsTab();
                    break;
                default:
            }
    
            // identify the current tab
            if ($(this).attr("id") == "current") {
                return
            }
            else {
                self.resetTabs();
                $(this).attr("id","current");
                $($(this).attr('name')).fadeIn();
            }

        });
    
        for (var i = 1; i <= $("#tabs li").length; i++) {
            if (myUrlTab == myUrlTabName + i) {
                self.resetTabs();
                $("a[name='"+myUrlTab+"']").attr("id","current");
                $(myUrlTab).fadeIn();
            }
        }

    }

    public resetFriendsTab() {
        $('#friends__title').text('Your Friends');
        $("#user-search").val('');
        $('#tab__people > .results-count').empty();
        goManager.loadFriends();
    }

    public resetHubTab() {
        $('#hubs__title').text('Your Hubs');
        $('#create-hub').show();
        $("#hub-search").val('');
        $('#tab__hubs > .results-count').empty();
        goManager.loadHubs();
    }

    private resetTabs(){
        // hide all tab content
        $("#tab__content > div").hide();
        // reset id's
        $("#tabs a").attr("id","");
    }

    public resultsCount(n, div) {
        var s = ' results';
        if (n == 1) s = ' result';
        div.text(n + s);
    }

    public emptyFriendList() {
        $("#list__friends").empty();
    }

    public addItemToFriendList(username) {

        var f = $('<div/>');
        f.addClass('list__item');
        f.appendTo('#list__friends');
        f.on('click', function() {
            console.log('friend clicked');
        });

        var name = $('<span/>');
        name.addClass('item--name');
        name.append(username);
        name.appendTo(f);
    }


    public emptyHubList() {
        $("#list__hubs").empty();
    }

    public addItemToHubList(id, vis) {

        /* Structure:
        <div class="list__item">
            <span class="item--name"> NAME </span>
            <span class="item--tag"> VISIBILITY </span>
        </div>
        */

        var h = $('<div/>');
        h.addClass('list__item')
        h.addClass('list__item--hub')
        h.on('click', function() {
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
    }

}