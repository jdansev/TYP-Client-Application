var HubManager = /** @class */ (function () {
    function HubManager() {
        this.hubs = new Array();
    }
    HubManager.prototype.appendHub = function (hub) { this.hubs.push(hub); };
    HubManager.prototype.size = function () { return this.hubs.length; };
    HubManager.prototype.getAllHubs = function () { return this.hubs; };
    HubManager.prototype.clearHubs = function () { this.hubs = []; };
    HubManager.prototype.unreadCount = function () {
        return this.hubs.filter(function (h) { return h.readLatest == false; }).length;
    };
    return HubManager;
}());
var MessageManager = /** @class */ (function () {
    function MessageManager() {
        this.messages = new Array();
    }
    MessageManager.prototype.addMessage = function (message) { this.messages.push(message); };
    MessageManager.prototype.size = function () { return this.messages.length; };
    MessageManager.prototype.getAllMessages = function () { return this.messages; };
    MessageManager.prototype.clearMessages = function () { this.messages = []; };
    return MessageManager;
}());
var MessageUIManager = /** @class */ (function () {
    function MessageUIManager() {
        var self = this;
        self.message_input = $('#message-input');
        self.send_inner = $('.send__inner');
        self.send_btn_wrapper = $('.btn__send-wrapper');
        self.send_btn_wrapper.hover(function () {
            self.readyState();
        }, function () {
            if (!(self.message_input.val())) {
                self.defaultState(100);
            }
        });
        self.send_btn_wrapper.click(function () {
            self.flyAnimation();
            messageHandler.sendMessage();
            self.clearInput();
            self.focusInput();
        });
        self.message_input.bind('change keyup', function () {
            this.value ? self.readyState() : self.defaultState(250);
        });
        self.message_input.focus();
    }
    MessageUIManager.prototype.readyState = function () {
        this.send_inner.addClass('ready');
    };
    MessageUIManager.prototype.defaultState = function (ms) {
        var self = this;
        setTimeout(function () {
            self.send_inner.removeClass('ready');
        }, ms);
    };
    MessageUIManager.prototype.clearInput = function () {
        this.message_input.val('');
    };
    MessageUIManager.prototype.focusInput = function () {
        this.message_input.focus();
    };
    MessageUIManager.prototype.setColorScheme = function (color) {
        this.send_inner.css({
            backgroundColor: color,
        });
        this.message_input.css({
            caretColor: color,
        });
    };
    MessageUIManager.prototype.flyAnimation = function () {
        var self = this;
        if (!(self.message_input.val()))
            return; // check that input is not empty
        $('.btn__send').stop().animate({
            opacity: 0,
            top: "-=40px",
        }, 300, function () {
            $('.btn__send').css({
                opacity: '100',
                top: '0',
            });
            self.defaultState();
        });
    };
    return MessageUIManager;
}());
var MessageHandler = /** @class */ (function () {
    function MessageHandler() {
        var self = this;
        this.message_input = $('#message-input');
        this.container = $('.messages__container');
        self.bindEnterKeyPress();
    }
    MessageHandler.prototype.bindEnterKeyPress = function () {
        var self = this;
        $(document).keypress(function (e) {
            if (e.which == 13) {
                self.sendMessage();
                messageUIManager.clearInput();
            }
        });
    };
    MessageHandler.prototype.sendMessage = function () {
        var self = this;
        if (self.message_input.val() == "")
            return; // validate if not blank
        messageUIManager.flyAnimation();
        goManager.sendMessage(self.message_input.val());
        emojiPicker.hideEmojiPicker();
    };
    MessageHandler.prototype.send = function (msg) {
        fluidMotion.loadFluidMotionElement(decodeMessage(msg));
    };
    MessageHandler.prototype.clearMessages = function () {
        this.container.html('');
    };
    MessageHandler.prototype.clearInput = function () {
        this.message_input.val('');
    };
    return MessageHandler;
}());
