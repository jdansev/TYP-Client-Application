

class MessageUIManager {

    message_input: any;
    send_inner: any;
    send_btn_div: any;

    constructor() {
        var self: any = this;

        self.message_input = $( '#message-input' );
        self.send_inner = $( '.send-inner' );
        self.send_btn_div = $( '.send-btn-div' );

        self.send_btn_div.hover(
            function() { // on hover
                self.readyState();
            },
            function() { // on unhover
                if (!(self.message_input.val())) {
                    self.defaultState(100);
                }
            }
        );

        self.send_btn_div.click(function() {
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

    private readyState() {
        this.send_inner.addClass('ready');
    }

    private defaultState(ms: any) {
        var self: any = this;
        setTimeout(function() {
            self.send_inner.removeClass('ready');
        }, ms);
    }

    public clearInput() {
        this.message_input.val('');
    }

    public focusInput() {
        this.message_input.focus();
    }

    public setColorScheme(color: string) {
        this.send_inner.css({
            backgroundColor: color,
        });
        this.message_input.css({
            caretColor: color,
        })
    }

    public flyAnimation() {
        var self: any = this;

        if (!(self.message_input.val())) return; // check that input is not empty

        // fly animation
        $('.send-btn').stop().animate({
            opacity: 0,
            top: "-=40px",
        }, 300, function() { // Animation complete.
            $('.send-btn').css({
                opacity: '100',
                top: '0',
            });
            self.defaultState();
        });
        
    }

}

interface Message {
    message: string;
    sender_username: string;
    sender_id: string;
    sender_token: string;
}

class MessageManager {
    messages: Array<Message>;
    constructor() { this.messages = new Array<Message>(); }
    public addMessage(message: Message) { this.messages.push(message); }

    public constrainList() {
        while (this.messages.length > 30) {
            console.log('splicing');
            this.messages.shift();
        }
    }

    public size() { return this.messages.length; }
    public getAllMessages() { return this.messages; }
    public clearMessages() { this.messages = []; }
}

// NEW
class MessageHandler {
    
    message_input: any;
    container: any;
    socket: any;
    api_manager: APIManager;

    constructor() {
        var self: any = this;
        this.message_input = $( '#message-input' );
        this.container = $( '.container' );
        this.socket = null;
        this.api_manager = new APIManager();
        self.bindEnterKeyPress();
    }

    private bindEnterKeyPress() {
        var self: any = this;
        $(document).keypress(function(e) {
            if (e.which == 13) { // when enter key is pressed
                self.sendMessage();
                messageUIManager.clearInput();
            }
        });
    }

    private sendMessageAjax() {

        var self: any = this;
        var current_group_id = groupManager.getCurrentGroup().id;
        var user_token = my_token;

        $.ajax({
            url: 'http://127.0.0.1:8000/messages/' + current_group_id + '/',
            type: 'POST',
            data: {
                message: self.message_input.val(),
                user_token: user_token,
            },
            // DEBUGGING FUNCTIONS
            // error: function() {
                // alert('an error occured');
                // console.log('send error');
            // },
            // success: function() {
                // alert('sent successful');
                // console.log('send success');
            // },
        });

    }

    public sendMessage() {
        var self: any = this;
        if (self.message_input.val() == "") return; // validate if not blank

        // bypassing socket and ajax stuff for now

        // self.sendMessageAjax();
        messageUIManager.flyAnimation();
        // self.sendMessageSocket(self.message_input.val());

        goManager.sendMessage(self.message_input.val())

    }


    public send(msg) {

        var message: Message = {
            message: msg.Message,
            sender_username: msg.Username,
            sender_id: msg.ID,
            sender_token: "no token",
        };

        fluidMotion.loadFluidMotionElement(message);

    }

    private loadMessages(data) {

        this.beginChatSocket(groupManager.getCurrentGroup().token);
        this.clearMessages();

        messageManager.clearMessages();

        // save messages
        $.each(data, function(k, message) {
            var new_message: Message = {
                message: message.message,
                sender_username: message.sender.username,
                sender_id: "no id",
                sender_token: message.token.key,
            }
            messageManager.addMessage(new_message);
        });

        // load all messages into fluid motion elements
        fluidMotion.loadFluidMotionElementsFromArray(messageManager.getAllMessages());
    }

    public getMessages() {
        var api_url = 'http://127.0.0.1:8000/messages/' + groupManager.getCurrentGroup().id + '.json';
        this.api_manager.makeAPICall(api_url, this.loadMessages, this);
    }

    private clearMessages() {
        this.container.html('');
    }

    private clearInput() {
        this.message_input.val('');
    }

    public beginChatSocket(unique_group_identifier: string) {

        if (this.socket) this.socket.close();

        this.socket = new WebSocket("ws://127.0.0.1:8000/chat/" + unique_group_identifier + "?token=" + my_token);

        this.waitForSocketConnection(null);

    }

    public sendMessageSocket(message: string) {

        var self: any = this;

        self.waitForSocketConnection(function() {
            self.socket.send(message);
        });

    }
    
    public waitForSocketConnection(callback) {

        var self: any = this;

        setTimeout(function () {

            if (self.socket.readyState === 1) { // connection is made

                self.socket.onmessage = function(e) {

                    var json_object_data = JSON.parse(e.data);
                    // construct a new message object

                    var message: Message = {
                        message: json_object_data.message,
                        sender_id: my_id,
                        sender_username: json_object_data.username,
                        sender_token: json_object_data.token,
                    };

                    fluidMotion.loadFluidMotionElement(message);
                }

                if (callback != null && typeof callback == 'function'){
                    callback();
                }

                return;

            } else { // wait for a connection
                self.waitForSocketConnection(callback);
            }

        }, 50);
    }

}