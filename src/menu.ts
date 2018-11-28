
class MenuManager {
    group_container: any;
    message_input: any;
    menu_div: any;
    dim: any;
    group_item: any;
    mouse_leave_lock: boolean;

    constructor() {
        var self: any = this;

        self.group_container = $( '.groups__container' );
        self.message_input = $( '#message-input' );
        self.menu_div = $( '.app__menu' );
        self.dim = $( '.menu__dim' );
        self.group_item = $( '.group' );

        self.mouse_leave_lock = false;

        self.menu_div.mouseleave(function() {
            (!self.mouse_leave_lock) ? self.hideMenu() : self.mouse_leave_lock = false;
        });
    }

    public showMenu() {
        this.mouse_leave_lock = false;
        this.menu_div.stop().animate({
            right: "0",
        }, 280);
        this.dim.css({
            display: 'block',
        })
        this.dim.stop().animate({
            opacity: 0.65,
        }, 280, function() {
        });

        tabManager.resetHubTab();
        tabManager.resetFriendsTab();
    }

    public hideMenu() {
        var self: any = this;
        self.menu_div.stop().animate({
            right: "-400px",
        }, 400, function() {
            self.mouse_leave_lock = false;
        });
        self.dim.stop().animate({
            opacity: 0,
        }, 400, function() {
            self.dim.css({
                display: 'none',
            })
        });
        messageUIManager.focusInput();
    }

}
