

class MessageUIManager {

    message_input: any;
    send_inner: any;
    send_btn_wrapper: any;

    constructor() {
        var self: any = this;

        self.message_input = $( '#message-input' );
        self.send_inner = $( '.send__inner' );
        self.send_btn_wrapper = $( '.btn__send-wrapper' );

        self.send_btn_wrapper.hover(
            function() { // on hover
                self.readyState();
            },
            function() { // on unhover
                if (!(self.message_input.val())) {
                    self.defaultState(100);
                }
            }
        );

        self.send_btn_wrapper.click(function() {
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
        $('.btn__send').stop().animate({
            opacity: 0,
            top: "-=40px",
        }, 300, function() { // Animation complete.
            $('.btn__send').css({
                opacity: '100',
                top: '0',
            });
            self.defaultState();
        });
        
    }

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
        this.container = $( '.messages__container' );
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

    public sendMessage() {
        var self: any = this;
        if (self.message_input.val() == "") return; // validate if not blank

        messageUIManager.flyAnimation();
        goManager.sendMessage(self.message_input.val())
    }

    public send(msg) {
        fluidMotion.loadFluidMotionElement(decodeMessage(msg));
    }

    public clearMessages() {
        this.container.html('');
    }

    private clearInput() {
        this.message_input.val('');
    }
    
}