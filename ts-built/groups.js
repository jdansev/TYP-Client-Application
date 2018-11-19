// NEW
var GroupUIManager = /** @class */ (function () {
    function GroupUIManager() {
        var self = this;
        self.group_container = $('.groups__container');
        self.message_input = $('#message-input');
        self.menu_div = $('.app__menu');
        self.dim = $('.menu__dim');
        self.group_item = $('.group');
        self.api_manager = new APIManager();
        self.mouse_leave_lock = false;
        self.menu_div.mouseleave(function () {
            (!self.mouse_leave_lock) ? self.hideMenu() : self.mouse_leave_lock = false;
        });
        // self.getFirstGroup();
    }
    GroupUIManager.prototype.showMenu = function () {
        // this.getGroups();
        this.mouse_leave_lock = false;
        this.menu_div.stop().animate({
            right: "0",
        }, 280);
        this.dim.css({
            display: 'block',
        });
        this.dim.stop().animate({
            opacity: 0.65,
        }, 280, function () {
        });
    };
    GroupUIManager.prototype.hideMenu = function () {
        var self = this;
        self.menu_div.stop().animate({
            right: "-400px",
        }, 280, function () {
            self.mouse_leave_lock = false;
        });
        self.dim.stop().animate({
            opacity: 0,
        }, 280, function () {
            self.dim.css({
                display: 'none',
            });
        });
        messageUIManager.focusInput();
    };
    GroupUIManager.prototype.clearGroupContainer = function () {
        this.group_container.html('');
    };
    GroupUIManager.prototype.loadFirstGroupMessages = function (data) {
        if (data[0]) {
            var first_group = data[0];
            groupManager.addGroup(first_group.id, first_group.name, first_group.description, first_group.unique_token);
            // set as current group
            groupManager.setCurrentGroup(first_group.id);
            // load group messages
            // messageHandler.getMessages();
        }
    };
    GroupUIManager.prototype.getFirstGroup = function () {
        var api_url = "http://127.0.0.1:8000/groups.json";
        this.api_manager.makeAPICall(api_url, this.loadFirstGroupMessages, this);
    };
    GroupUIManager.prototype.getGroups = function () {
        var api_url = "http://127.0.0.1:8000/groups.json";
        this.api_manager.makeAPICall(api_url, this.loadGroups, this);
    };
    GroupUIManager.prototype.loadGroups = function (data) {
        var self = this;
        self.clearGroupContainer();
        groupManager.clearGroupList();
        $.each(data, function (k, group) {
            var group_element = $('<div></div>');
            group_element.addClass('group');
            group_element.data('id', group.id); // attach id to retrive associated data when clicked
            var group_title = $('<h1></h1>');
            group_title.addClass('group__item');
            group_title.addClass('group--name');
            group_title.html(group.name);
            var group_description = $('<p></p>');
            group_description.addClass('group__item');
            group_description.addClass('group--description');
            group_description.html(group.description);
            group_element.append(group_title);
            group_element.append(group_description);
            self.group_container.append(group_element);
            // bind click event to each individual group element
            group_element.click(function () {
                self.mouse_leave_lock = true;
                if (groupManager.getGroupList()) {
                    var gid = group_element.data('id');
                    // set as current group
                    groupManager.setCurrentGroup(gid);
                    // load group messages
                    messageHandler.getMessages();
                }
                setTimeout(function () {
                    self.hideMenu();
                }, 300);
            });
            groupManager.addGroup(group.id, group.name, group.description, group.unique_token);
        });
    };
    return GroupUIManager;
}());
var GroupManager = /** @class */ (function () {
    function GroupManager() {
        this.groups = new Array();
        this.current_group = null;
    }
    GroupManager.prototype.addGroup = function (id, name, description, token) {
        this.groups.push({
            id: id,
            name: name,
            description: description,
            token: token,
        });
    };
    GroupManager.prototype.getGroupData = function (id) {
        var self = this;
        for (var i = 0; i < self.groups.length; i++) {
            if (self.groups[i].id == id)
                return self.groups[i];
        }
        return null;
    };
    GroupManager.prototype.checkExists = function (id) {
        var self = this;
        for (var i = 0; i < self.groups.length; i++) {
            if (self.groups[i].id == id)
                return true;
        }
        return false;
    };
    GroupManager.prototype.setCurrentGroup = function (id) { this.current_group = this.getGroupData(id); };
    GroupManager.prototype.getCurrentGroup = function () { return this.current_group; };
    GroupManager.prototype.clearGroupList = function () { this.groups = []; };
    GroupManager.prototype.numberOfGroups = function () { return this.groups.length; };
    GroupManager.prototype.getGroupList = function () { return this.groups; };
    return GroupManager;
}());
