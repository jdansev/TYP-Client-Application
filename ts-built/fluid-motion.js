var FluidMotionElement = /** @class */ (function () {
    function FluidMotionElement(element) {
        this.element = element;
        this.easing = 'ease-out';
        this.top = element.get(0).offsetTop;
    }
    FluidMotionElement.prototype.initialize = function () {
        var self = this;
        self.element.css({
            transition: 'transform ' + self.duration + ' ' + self.easing,
            position: 'absolute',
            top: self.top,
        });
    };
    FluidMotionElement.prototype.disableFluidTransition = function () {
        this.element.css({ transition: 'none', });
    };
    FluidMotionElement.prototype.enableFluidTransition = function (i) {
        var self = this;
        var duration = (i * 0.02) + 0.1;
        self.duration = duration.toFixed(2) + 's';
        self.element.css({
            transition: 'transform ' + self.duration + ' ' + self.easing,
        });
    };
    return FluidMotionElement;
}());
var Direction;
(function (Direction) {
    Direction[Direction["Normal"] = 0] = "Normal";
    Direction[Direction["Reversed"] = 1] = "Reversed";
})(Direction || (Direction = {}));
var FluidMotion = /** @class */ (function () {
    function FluidMotion(direction) {
        var self = this;
        self.target_container = $('.container');
        self.scroll_view = $('.scroll-view');
        self.scroll_container = $('.scroll-container');
        self.fluid_motion_elements = [];
        self.direction = direction;
        self.scroll_container.on({
            scroll: function () {
                self.fluid_motion_elements.forEach(function (element) {
                    element.element.css('transform', 'translateY(' + -self.scroll_container.scrollTop() + 'px)');
                });
            },
        });
    }
    FluidMotion.prototype.clearFluidMotionElements = function () {
        this.target_container.empty();
        this.fluid_motion_elements = [];
    };
    // can apply to both receiving or sending messages
    FluidMotion.prototype.loadFluidMotionElement = function (message) {
        var self = this;
        // constrain the messages on display to fixed size
        self.disableAllFluidTransitions();
        while (self.fluid_motion_elements.length > 20) {
            self.target_container[0].removeChild(self.fluid_motion_elements[self.fluid_motion_elements.length - 1].element[0]);
            self.fluid_motion_elements.splice(-1, 1);
        }
        self.finishLoad();
        self.disableAllFluidTransitions();
        self.fluid_motion_elements.forEach(function (item) {
            item.element.css({
                position: 'relative',
            });
        });
        // check if user tag is needed
        var messages = messageManager.getAllMessages();
        if ((messages.length == 0 || // if first message, or
            (messages.length >= 1 && // last message is defined, and
                messages[messages.length - 1].sender_id != message.sender_id)) // this message was sent by a different user, and
            && (message.sender_id != my_id)) {
            fluidMotion.addUserTag(message.sender_username);
        }
        // add the message to list
        messageManager.addMessage(message);
        // div.message-container
        var fluid_element = $('<div/>');
        fluid_element.addClass('message-container');
        // determine if message direction is to or from
        (message.sender_id == my_id) ? fluid_element.addClass('from') : fluid_element.addClass('to');
        // div.message
        var message_div = $('<div/>');
        message_div.addClass('message');
        message_div.html(message.message);
        // div.message-container > div.message
        fluid_element.append(message_div);
        // div.container > div.message-container
        self.target_container.append(fluid_element);
        // initialize as a new fluid motion element
        var new_fluid_element = new FluidMotionElement(fluid_element);
        switch (self.direction) {
            case Direction.Normal:
                self.fluid_motion_elements.push(new_fluid_element);
                break;
            case Direction.Reversed:
                self.fluid_motion_elements.unshift(new_fluid_element);
                break;
            default: self.fluid_motion_elements.push(new_fluid_element);
        }
        self.finishLoad();
    };
    FluidMotion.prototype.finishLoad = function () {
        var self = this;
        // resize the scroll view
        self.resizeScrollView();
        // after load, scroll the container to bottom and re-enable all transitions
        self.scroll_container.stop().animate({
            scrollTop: self.scroll_view.outerHeight(true)
        }, 800, function () {
            // comment to disable fluid scrolling
            self.recalcAllFluidTransitions();
        });
        // update color fade colors
        colorFade.refreshGradients();
    };
    FluidMotion.prototype.loadFluidMotionElementsFromArray = function (messages) {
        var self = this;
        self.clearFluidMotionElements();
        // loop through all message objects
        for (var i = 0; i < messages.length; i++) {
            // constrain the messages on display to fixed size
            while (self.fluid_motion_elements.length > 20) {
                self.target_container[0].removeChild(self.fluid_motion_elements[self.fluid_motion_elements.length - 1].element[0]);
                self.fluid_motion_elements.splice(-1, 1);
            }
            // before creating the message, check if user tag should be made
            if ((!messages[i - 1] || // if it's the first message in the array or
                (messages[i - 1] && // check first if not undefined
                    messages[i - 1].sender_id != messages[i].sender_id)) // this message was sent by a different user
                && (messages[i].sender_id != my_id)) {
                fluidMotion.addUserTag(messages[i].sender_username);
            }
            // div.message-container
            var fluid_element = $('<div/>');
            fluid_element.addClass('message-container');
            // determine if message direction is to or from
            (messages[i].sender_id == my_id) ? fluid_element.addClass('from') : fluid_element.addClass('to');
            // now to actually construct the DOM element
            // div.message
            var message_div = $('<div/>');
            message_div.addClass('message');
            message_div.html(messages[i].message);
            // div.message-container > div.message
            fluid_element.append(message_div);
            // div.container > div.message-container
            self.target_container.append(fluid_element);
            // initialize as a new fluid motion element
            var new_fluid_element = new FluidMotionElement(fluid_element);
            switch (self.direction) {
                case Direction.Normal:
                    self.fluid_motion_elements.push(new_fluid_element);
                    break;
                case Direction.Reversed:
                    self.fluid_motion_elements.unshift(new_fluid_element);
                    break;
                default: self.fluid_motion_elements.push(new_fluid_element);
            }
            // resize the scroll view
            self.resizeScrollView();
        }
        self.finishLoad();
    };
    FluidMotion.prototype.addUserTag = function (username) {
        var self = this;
        var fluid_element = $('<div/>');
        fluid_element.addClass('message-container');
        fluid_element.addClass('to');
        var message_div = $('<div/>');
        message_div.addClass('user-tag');
        message_div.html(username);
        fluid_element.append(message_div);
        self.target_container.append(fluid_element);
        var new_fluid_element = new FluidMotionElement(fluid_element);
        switch (self.direction) {
            case Direction.Normal:
                self.fluid_motion_elements.push(new_fluid_element);
                break;
            case Direction.Reversed:
                self.fluid_motion_elements.unshift(new_fluid_element);
                break;
            default:
                self.fluid_motion_elements.push(new_fluid_element);
        }
    };
    FluidMotion.prototype.recalcAllFluidTransitions = function () {
        this.fluid_motion_elements.forEach(function (item, i) {
            item.enableFluidTransition(i);
        });
    };
    FluidMotion.prototype.disableAllFluidTransitions = function () {
        this.fluid_motion_elements.forEach(function (item) {
            item.disableFluidTransition();
        });
    };
    FluidMotion.prototype.initAllFluidElements = function () {
        if (typeof window.ontouchstart == 'undefined') {
            this.fluid_motion_elements.forEach(function (item) {
                item.initialize();
            });
        }
    };
    FluidMotion.prototype.resizeScrollView = function () {
        var self = this;
        self.scroll_view.css({
            height: function () {
                var h = 0;
                self.fluid_motion_elements.forEach(function (item) {
                    h += item.element.outerHeight(true);
                });
                return h + 30;
            },
        });
    };
    return FluidMotion;
}());
