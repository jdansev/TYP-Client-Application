
class FluidMotionElement {
	element: any;
	easing: string;
	duration: string;
    top: any;
    
	constructor(element: any) {
		this.element = element;
		this.easing = 'ease-out';
        this.top = element.get(0).offsetTop;
    }

    public initialize() {
		var self = this;
        self.element.css({
            transition: 'transform ' + self.duration + ' ' + self.easing,
            position: 'absolute',
            top: self.top,
        });
    }
    
    public disableFluidTransition() {
        this.element.css({ transition: 'none', });
    }
    
	public enableFluidTransition(i:number) {
		var self = this;
        var duration = (i * 0.02) + 0.1;
        self.duration = duration.toFixed(2) + 's';
		self.element.css({
			transition: 'transform ' + self.duration + ' ' + self.easing,
		});
	}
}

enum Direction {
	Normal,
	Reversed,
}

class FluidMotion {
	target_container: any;
	fluid_motion_elements: FluidMotionElement[];
	scroll_container: any;
	scroll_view: any;
    direction: Direction;

	constructor(direction: Direction) {
        var self: any = this;

		self.target_container = $( '.messages__container' );
		self.scroll_view = $( '.scroll__view' );
        self.scroll_container = $( '.scroll__container' );

        self.fluid_motion_elements = [];
        self.direction = direction;

        self.scroll_container.on({
            scroll: function () {
                self.fluid_motion_elements.forEach(function(element) {
                    element.element.css('transform', 'translateY(' + -self.scroll_container.scrollTop() + 'px)')
                });
            },
        });
    }
    
    public clearFluidMotionElements() {
        this.target_container.empty();
        this.fluid_motion_elements = [];
    }

    // can apply to both receiving or sending messages
    public loadFluidMotionElement(message: Message) {

        var self: any = this;

        // constrain the messages on display to fixed size
        self.disableAllFluidTransitions();
        while (self.fluid_motion_elements.length > 20) {
            self.target_container[0].removeChild(self.fluid_motion_elements[self.fluid_motion_elements.length-1].element[0])
            self.fluid_motion_elements.splice(-1,1);
        }
        self.finishLoad();
        

        self.disableAllFluidTransitions();
        self.fluid_motion_elements.forEach(function(item) {
			item.element.css({
				position: 'relative',
			});
        });

        // check if user tag is needed
        var messages: Array<Message> = messageManager.getAllMessages();
        if ((messages.length == 0 || // if first message, or
            (messages.length >= 1 && // last message is defined, and
            messages[messages.length-1].sender.id != message.sender.id)) // this message was sent by a different user, and
            && (message.sender.id != my_id)) // user who sent it is not me
        {
            fluidMotion.addUserTag(message.sender.username);
        }

        // add the message to list
        messageManager.addMessage(message);

        // div.message-container
        var fluid_element = $('<div/>');
        fluid_element.addClass('message-container');

        // determine if message direction is to or from

        (message.sender.id == my_id) ? fluid_element.addClass('from') : fluid_element.addClass('to');

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
            case Direction.Normal: self.fluid_motion_elements.push(new_fluid_element); break;
            case Direction.Reversed: self.fluid_motion_elements.unshift(new_fluid_element); break;
            default: self.fluid_motion_elements.push(new_fluid_element);
        }
        self.finishLoad();

    }

    public finishLoad() {
        var self: any = this;
        // resize the scroll view
        self.resizeScrollView();
        // after load, scroll the container to bottom and re-enable all transitions
        self.scroll_container.stop().animate({
            scrollTop : self.scroll_view.outerHeight(true)
        }, 800, function() {
            // comment to disable fluid scrolling
            self.recalcAllFluidTransitions();
        });
        // update color fade colors
        colorFade.refreshGradients();
    }


    public loadFluidMotionElementsFromArray(messages: Array<Message>) {
        var self: any = this;
        self.clearFluidMotionElements();

        // loop through all message objects
        for (var i = 0; i < messages.length; i++) {


            // constrain the messages on display to fixed size
            while (self.fluid_motion_elements.length > 20) {
                self.target_container[0].removeChild(self.fluid_motion_elements[self.fluid_motion_elements.length-1].element[0])
                self.fluid_motion_elements.splice(-1,1);
            }
            

            // before creating the message, check if user tag should be made
            if ((!messages[i-1] || // if it's the first message in the array or
                (messages[i-1] &&   // check first if not undefined
                messages[i-1].sender.id != messages[i].sender.id)) // this message was sent by a different user
                && (messages[i].sender.id != my_id)) // and that user is not me, then add a user tag
            {
                fluidMotion.addUserTag(messages[i].sender.username);
            }
            // div.message-container
            var fluid_element = $('<div/>');
            fluid_element.addClass('message-container');

            // determine if message direction is to or from

            (messages[i].sender.id == my_id) ? fluid_element.addClass('from') : fluid_element.addClass('to');

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
                case Direction.Normal: self.fluid_motion_elements.push(new_fluid_element); break;
                case Direction.Reversed: self.fluid_motion_elements.unshift(new_fluid_element); break;
                default: self.fluid_motion_elements.push(new_fluid_element);
            }

            // resize the scroll view
            self.resizeScrollView();
        }
        self.finishLoad();
    }

    public addUserTag(username: string) {
        var self: any = this;
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
    }
    
	public recalcAllFluidTransitions() {
		this.fluid_motion_elements.forEach(function(item, i) {
			item.enableFluidTransition(i);
		});
    }

    public disableAllFluidTransitions() {
		this.fluid_motion_elements.forEach(function(item) {
			item.disableFluidTransition();
		});
    }
    
	public initAllFluidElements() {
		if (typeof window.ontouchstart == 'undefined') {
			this.fluid_motion_elements.forEach(item => {
				item.initialize();
			});
		}
    }
    
	private resizeScrollView() {
        var self: any = this;
		self.scroll_view.css({
			height: function() {
                var h: number = 0;
				self.fluid_motion_elements.forEach(function(item) {
                    h += item.element.outerHeight(true);
                });
				return h + 30;
			},
        });
	}

}
