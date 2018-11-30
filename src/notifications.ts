
// Notifications
class AlertBadge {
    alertBadgeElement: any;
    alertCount: number;

    constructor(element: any) {
        var self: any = this;
        self.alertCount = 0;
        self.alertBadgeElement = element;
    }

    incrementAlertCount() {
        var self: any = this;
        self.setAlertCount(++self.alertCount);
    }

    setAlertCount(n) {
        var self: any = this;
        self.alertCount = n;
        if (n > 0) {
            self.alertBadgeElement.css({
                'visibility': 'visible'
            });
            self.alertBadgeElement.html(self.alertCount);
        } else {
            self.alertBadgeElement.css({
                'visibility': 'hidden'
            });
        }
    }

    clearAlertCount() {
        var self: any = this;
        self.alertBadgeElement.css({
            'visibility': 'hidden'
        });
        self.setAlertCount(0);
    }

}