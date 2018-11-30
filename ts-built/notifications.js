// Notifications
var AlertBadge = /** @class */ (function () {
    function AlertBadge(element) {
        var self = this;
        self.alertCount = 0;
        self.alertBadgeElement = element;
    }
    AlertBadge.prototype.incrementAlertCount = function () {
        var self = this;
        self.setAlertCount(++self.alertCount);
    };
    AlertBadge.prototype.setAlertCount = function (n) {
        var self = this;
        self.alertCount = n;
        if (n > 0) {
            self.alertBadgeElement.css({
                'visibility': 'visible'
            });
            self.alertBadgeElement.html(self.alertCount);
        }
        else {
            self.alertBadgeElement.css({
                'visibility': 'hidden'
            });
        }
    };
    AlertBadge.prototype.clearAlertCount = function () {
        var self = this;
        self.alertBadgeElement.css({
            'visibility': 'hidden'
        });
        self.setAlertCount(0);
    };
    return AlertBadge;
}());
