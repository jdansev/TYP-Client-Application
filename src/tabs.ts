
class TabManager {

    public initialiseTabs() {
        var self: any = this;
    
        // hide all content initially
        $("#tab__content > div").hide();

        // hub create button
        $("#create-hub").on("click", function() {
            $("#tab__hubs > div").hide();
            $("#tab__hubs > div[name='create-hub']").fadeIn();
        });

        // show the first tab contents
        const firstTab = $('#tabs a:first').attr('name');
        $(firstTab).fadeIn();

        // activate the first tab
        $("#tabs li:first a").attr("id","current");
        
        // on tab click
        $("#tabs a").on("click",function(e) {

            self.resetTabs();

            const tabName = $(this).attr('name');

            switch(tabName) {
                case '#tab__hubs':
                    self.resetHubTab();
                    hubAlertBadge.clearAlertCount();
                    break;
                case '#tab__people':
                    self.resetFriendsTab();
                    peopleAlertBadge.clearAlertCount();
                    break;
                case '#tab__notifications':
                    notificationAlertBadge.clearAlertCount();
                    break;
                default:
            }

            $(tabName).fadeIn();
            $(this).attr("id","current");

        });

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

    public resetTabs(){
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

    public addItemToFriendList(user: User) {

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

        var jdenticon = $('<svg style="float:left" height="40" width="40" data-jdenticon-value="'+user.username+'"></svg>');
        jdenticon.appendTo(f);

        var name = $('<span/>');
        name.addClass('item--name');
        name.append(user.username);
        name.appendTo(f);

    }


    public emptyHubList() {
        $("#list__hubs").empty();
    }

    public showHubDetails(hub: Hub) {

        console.log(hub);

        $("#hub-info-name").text(hub.id);

        $("#tab__hubs > div").hide();
        $("#tab__hubs > div[name='hub-info']").fadeIn();

    }

    public addColorBand(h, s) {

        var colorBand = $('<span/>');
        colorBand.addClass('color-band');
        colorBand.appendTo(h);
        colorBand[0].style.backgroundImage = "linear-gradient("+s.Start+", "+s.End+")";

    }

    public addItemToHubList(hub) {
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
        h.data('id', hub.id);
        h.addClass('list__item');
        h.addClass('list__item--hub');
        h.on('click', function() {
            h.find('.item--message-preview').removeClass('item--message-preview--unread');
            goManager.joinHub(hub.id);
            menuManager.hideMenu();
            var spectrum = $(this).data('Spectrum');
            colorFade.changeTheme([spectrum.Start, spectrum.End]);
            messageUIManager.setColorScheme(spectrum.End);
        });

        var longPress;
        h.on("mousedown",function() {
            longPress = setTimeout(function(){
                console.log(hub.id);
                goManager.getHubInfo(hub.id);
                // console.log(hub_info);
                // self.showHubInfo(hub_info);
            }, 600);
        }).on("mouseup mouseleave",function(){
            clearTimeout(longPress);
        });

        h.data('Spectrum', hub.spectrum);
        this.addColorBand(h, hub.spectrum);

        var name = $('<div/>');
        name.addClass('item--name');
        name.append(hub.id);
        name.appendTo(h);

        // message preview
        var mp = $('<div class="item--message-preview">'+hub.lastMessage+'</div>');
        if (hub.readLatest != undefined && !hub.readLatest) {
            mp.addClass('item--message-preview--unread');
        }
        mp.appendTo(h);
        

        var tag = $('<div/>');
        tag.addClass('item--tag');
        tag.append(hub.visibility);
        tag.appendTo(h);

        h.on('mouseenter', function() {

            switch (hub.visibility) {
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