


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

    public initHubPages() {

        $("#tab__hubs > div").hide();
        $("#tab__hubs > div[name='hub-main']").show();

        $("#create-hub").on("click", function() {
            $("#tab__hubs > div").hide();
            $("#tab__hubs > div[name='create-hub']").fadeIn();
        })

    }

    public resetFriendsTab() {
        $('#friends__title').text('Your Friends');
        $("#user-search").val('');
        $('#tab__people .results-count').empty();
        goManager.loadFriends();
    }

    public resetHubTab() {
        $('#hubs__title').text('Your Hubs');
        $('#create-hub').show();
        $("#hub-search").val('');
        $('#tab__hubs .results-count').empty();

        $("#tab__hubs > div").hide();
        $("#tab__hubs > div[name='hub-main']").show();

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

    public showHubInfo() {

        $("#tab__hubs > div").hide();
        $("#tab__hubs > div[name='hub-info']").fadeIn();

    }

    public addColorBand(h, s) {

        // turn this into a separate method
        var colorBand = $('<span/>');
        colorBand.addClass('color-band');
        colorBand.appendTo(h);
        colorBand[0].style.backgroundImage = "linear-gradient("+s.Start+", "+s.End+")";

    }

    public addItemToHubList(id, vis, spec) {
        var self: any = this;

        /* Structure:
        <div class="list__item">
            <span class="item--name"> NAME </span>
            <span class="item--tag"> VISIBILITY </span>
        </div>
        */

        var h = $('<div/>');
        h.addClass('list__item');
        h.addClass('list__item--hub');
        h.on('click', function() {
            console.log(h.data('Spectrum'));
            goManager.joinHub(id);
            groupUIManager.hideMenu();
            var spectrum = $(this).data('Spectrum');
            colorFade.changeTheme([spectrum.Start, spectrum.End]);
            messageUIManager.setColorScheme(spectrum.End);
        });

        var longPress;
        h.on("mousedown",function(){
            longPress = setTimeout(function(){
                self.showHubInfo();
            }, 600);
        }).on("mouseup mouseleave",function(){
            clearTimeout(longPress);
        });


        h.data('Spectrum', spec);
        this.addColorBand(h, spec);


        var name = $('<div/>');
        name.addClass('item--name');
        name.append(id);
        name.appendTo(h);

        var tag = $('<div/>');
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