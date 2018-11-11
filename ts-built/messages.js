var MessageUIManager = /** @class */ (function () {
    function MessageUIManager() {
        var self = this;
        self.message_input = $('#message-input');
        self.send_inner = $('.send-inner');
        self.send_btn_div = $('.send-btn-div');
        self.send_btn_div.hover(function () {
            self.readyState();
        }, function () {
            if (!(self.message_input.val())) {
                self.defaultState(100);
            }
        });
        self.send_btn_div.click(function () {
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
        // fly animation
        $('.send-btn').stop().animate({
            opacity: 0,
            top: "-=40px",
        }, 300, function () {
            $('.send-btn').css({
                opacity: '100',
                top: '0',
            });
            self.defaultState();
        });
    };
    return MessageUIManager;
}());
var MessageManager = /** @class */ (function () {
    function MessageManager() {
        this.messages = new Array();
    }
    MessageManager.prototype.addMessage = function (message) { this.messages.push(message); };
    MessageManager.prototype.constrainList = function () {
        while (this.messages.length > 30) {
            console.log('splicing');
            this.messages.shift();
        }
    };
    MessageManager.prototype.size = function () { return this.messages.length; };
    MessageManager.prototype.getAllMessages = function () { return this.messages; };
    MessageManager.prototype.clearMessages = function () { this.messages = []; };
    return MessageManager;
}());
// NEW
var MessageHandler = /** @class */ (function () {
    function MessageHandler() {
        var self = this;
        this.message_input = $('#message-input');
        this.container = $('.container');
        this.socket = null;
        this.api_manager = new APIManager();
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
    MessageHandler.prototype.sendMessageAjax = function () {
        var self = this;
        var current_group_id = groupManager.getCurrentGroup().id;
        var user_token = my_token;
        $.ajax({
            url: 'http://127.0.0.1:8000/messages/' + current_group_id + '/',
            type: 'POST',
            data: {
                message: self.message_input.val(),
                user_token: user_token,
            },
        });
    };
    MessageHandler.prototype.sendMessage = function () {
        var self = this;
        if (self.message_input.val() == "")
            return; // validate if not blank
        // bypassing socket and ajax stuff for now
        // self.sendMessageAjax();
        messageUIManager.flyAnimation();
        // self.sendMessageSocket(self.message_input.val());
        goManager.sendMessage(self.message_input.val());
    };
    MessageHandler.prototype.send = function (msg) {
        var message = {
            message: msg.Message,
            sender_username: msg.Username,
            sender_id: msg.ID,
            sender_token: "no token",
        };
        fluidMotion.loadFluidMotionElement(message);
    };
    MessageHandler.prototype.loadMessages = function (data) {
        this.beginChatSocket(groupManager.getCurrentGroup().token);
        this.clearMessages();
        messageManager.clearMessages();
        // save messages
        $.each(data, function (k, message) {
            var new_message = {
                message: message.message,
                sender_username: message.sender.username,
                sender_id: "no id",
                sender_token: message.token.key,
            };
            messageManager.addMessage(new_message);
        });
        // load all messages into fluid motion elements
        fluidMotion.loadFluidMotionElementsFromArray(messageManager.getAllMessages());
    };
    MessageHandler.prototype.getMessages = function () {
        var api_url = 'http://127.0.0.1:8000/messages/' + groupManager.getCurrentGroup().id + '.json';
        this.api_manager.makeAPICall(api_url, this.loadMessages, this);
    };
    MessageHandler.prototype.clearMessages = function () {
        this.container.html('');
    };
    MessageHandler.prototype.clearInput = function () {
        this.message_input.val('');
    };
    MessageHandler.prototype.beginChatSocket = function (unique_group_identifier) {
        if (this.socket)
            this.socket.close();
        this.socket = new WebSocket("ws://127.0.0.1:8000/chat/" + unique_group_identifier + "?token=" + my_token);
        this.waitForSocketConnection(null);
    };
    MessageHandler.prototype.sendMessageSocket = function (message) {
        var self = this;
        self.waitForSocketConnection(function () {
            self.socket.send(message);
        });
    };
    MessageHandler.prototype.waitForSocketConnection = function (callback) {
        var self = this;
        setTimeout(function () {
            if (self.socket.readyState === 1) {
                self.socket.onmessage = function (e) {
                    var json_object_data = JSON.parse(e.data);
                    // construct a new message object
                    var message = {
                        message: json_object_data.message,
                        sender_id: my_id,
                        sender_username: json_object_data.username,
                        sender_token: json_object_data.token,
                    };
                    fluidMotion.loadFluidMotionElement(message);
                };
                if (callback != null && typeof callback == 'function') {
                    callback();
                }
                return;
            }
            else {
                self.waitForSocketConnection(callback);
            }
        }, 50);
    };
    return MessageHandler;
}());
