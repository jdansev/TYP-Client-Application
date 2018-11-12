var ColorFade = /** @class */ (function () {
    function ColorFade(theme_colors) {
        var self = this;
        self.gradient_factory = new GradientFactory();
        self.container = $('.messages__container');
        self.scroll_container = $('.scroll__container');
        self.container_height = self.container.outerHeight();
        self.theme_colors = theme_colors;
        self.gradient_list = self.gradient_factory.generate({
            from: self.theme_colors[0],
            to: self.theme_colors[1],
            stops: self.container_height,
        });
        messageUIManager.setColorScheme(self.theme_colors[1]);
        self.scroll_container.on({
            scroll: function () { self.refreshGradients(); }
        });
        self.refreshGradients();
    }
    ColorFade.prototype.changeTheme = function (new_colors) {
        var self = this;
        self.gradient_list = self.gradient_factory.generate({
            from: new_colors[0],
            to: new_colors[1],
            stops: self.container_height,
        });
        self.refreshGradients();
    };
    ColorFade.prototype.refreshGradients = function () {
        var self = this;
        var scrollTop = document.getElementsByClassName('scroll__container')[0].scrollTop;
        var message_list = document.getElementsByClassName('message');
        // optimized for speed using javascript, no jquery
        for (var i = 0; i < message_list.length; i++) {
            var message_pos = message_list[i].parentNode.offsetTop - scrollTop;
            if (message_pos < 0) {
                message_list[i].style.backgroundColor = self.gradient_list[0];
                continue;
            }
            if (message_pos > self.container_height) {
                message_list[i].style.backgroundColor = self.gradient_list[self.gradient_list.length - 1];
                break;
            }
            message_list[i].style.backgroundColor = self.gradient_list[Math.round(message_pos)];
        }
    };
    return ColorFade;
}());
