

class NotifcationAlertBadge {
    notificationBadgeElement: any;

    constructor() {
        var self: any = this;
        self.notificationBadgeElement = $( '#notification-alert-badge' );
    }

    setAlertCount(n) {
        var self: any = this;
        if (n > 0) {
            self.notificationBadgeElement.css({
                'visibility': 'visible'
            });
            self.notificationBadgeElement.html(n);
        } else {
            self.notificationBadgeElement.css({
                'visibility': 'hidden'
            });
        }
    }

}