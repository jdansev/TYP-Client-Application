var NotifcationAlertBadge = /** @class */ (function () {
    function NotifcationAlertBadge() {
        var self = this;
        self.notificationBadgeElement = $('#notification-alert-badge');
    }
    NotifcationAlertBadge.prototype.setAlertCount = function (n) {
        var self = this;
        if (n > 0) {
            self.notificationBadgeElement.css({
                'visibility': 'visible'
            });
            self.notificationBadgeElement.html(n);
        }
        else {
            self.notificationBadgeElement.css({
                'visibility': 'hidden'
            });
        }
    };
    return NotifcationAlertBadge;
}());
