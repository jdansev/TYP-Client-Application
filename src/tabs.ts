


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

    private resetTabs(){
        // hide all tab content
        $("#tab__content > div").hide();
        // reset id's
        $("#tabs a").attr("id","");
    }

    public emptyHubList() {
        $("#list__hubs").empty();
    }

    public addItemToHubList(id, vis) {
        var h = $('<div/>');
        h.addClass('list__item')
        h.append(id + " (" + vis + ")");
        h.data("id", id);
        h.appendTo('#list__hubs');
        h.on('click', function() {
            goManager.joinHub(id);
        });
    }

}