


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

        /* Structure:
        <div class="list__item">
            <span class="item--name"> NAME </span>
        </div>
        */

        var f = $('<div/>');
        f.addClass('list__item');
        f.appendTo('#list__friends');
        f.on('click', function() {
            console.log('friend clicked');
        });

        var jdenticon = $('<svg style="float:left" height="40" width="40" data-jdenticon-value="'+username+'"></svg>');
        jdenticon.appendTo(f);

        var name = $('<span/>');
        name.addClass('item--name');
        name.append(username);
        name.appendTo(f);

    }


    public emptyHubList() {
        $("#list__hubs").empty();
    }

    public showHubInfo(hub_info) {

        console.log(hub_info);

        $("#hub-info-name").text(hub_info.ID);

        $("#tab__hubs > div").hide();
        $("#tab__hubs > div[name='hub-info']").fadeIn();

    }

    public addColorBand(h, s) {

        var colorBand = $('<span/>');
        colorBand.addClass('color-band');
        colorBand.appendTo(h);
        colorBand[0].style.backgroundImage = "linear-gradient("+s.Start+", "+s.End+")";

    }

    public addItemToHubList(id, vis, spec, msg) {
        var self: any = this;

        /* Structure:
        <div class="list__item">
            <div class="color-band"></div>
            <div class="item--name">NAME</div>
            <div class="item--message-preview">LAST MESSAGE</div>
            <div class="item--tag">VISIBILITY</div>
        </div>
        */

        var h = $('<div/>');
        h.data('id', id);
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
        h.on("mousedown",function() {
            longPress = setTimeout(function(){
                console.log(id);
                goManager.getHubInfo(id);
                // console.log(hub_info);
                // self.showHubInfo(hub_info);
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

        var mp = $('<div class="item--message-preview">'+msg+'</div>');
        mp.appendTo(h);
        

        var tag = $('<div/>');
        tag.addClass('item--tag');
        tag.append(vis);
        tag.appendTo(h);

        h.on('mouseenter', function() {

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
            
        });

        h.on('mouseleave', function() {
            tag.removeClass();
            tag.addClass('item--tag');
        });

        h.appendTo('#list__hubs');
    }



}