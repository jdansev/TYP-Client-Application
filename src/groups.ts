

// NEW
class GroupUIManager {

    group_container: any;
    message_input: any;
    menu_div: any;
    dim: any;
    group_item: any;

    api_manager: APIManager;
    mouse_leave_lock: boolean;

    constructor() {
        var self: any = this;

        self.group_container = $( '.groups__container' );
        self.message_input = $( '#message-input' );
        self.menu_div = $( '.app__menu' );
        self.dim = $( '.menu__dim' );
        self.group_item = $( '.group' );

        self.api_manager = new APIManager();
        self.mouse_leave_lock = false;

        self.menu_div.mouseleave(function() {
            (!self.mouse_leave_lock) ? self.hideMenu() : self.mouse_leave_lock = false;
        });

        // self.getFirstGroup();
    }

    public showMenu() {

        // this.getGroups();

        this.mouse_leave_lock = false;
        this.menu_div.stop().animate({
            right: "0",
        }, 300);
        this.dim.css({
            display: 'block',
        })
        this.dim.stop().animate({
            opacity: 0.65,
        }, 300, function() {
        });
    }

    public hideMenu() {
        var self: any = this;
        self.menu_div.stop().animate({
            right: "-400px",
        }, 300, function() {
            self.mouse_leave_lock = false;
        });
        self.dim.stop().animate({
            opacity: 0,
        }, 300, function() {
            self.dim.css({
                display: 'none',
            })
        });
        messageUIManager.focusInput();
    }

    private clearGroupContainer() {
        this.group_container.html('');
    }

    private loadFirstGroupMessages(data) {

        if (data[0]) {
            var first_group = data[0];
            groupManager.addGroup(
                first_group.id,
                first_group.name,
                first_group.description,
                first_group.unique_token,
            );
            // set as current group
            groupManager.setCurrentGroup(first_group.id);

            // load group messages
            // messageHandler.getMessages();
        }

    }


    private getFirstGroup() {
        var api_url: string = "http://127.0.0.1:8000/groups.json";
        this.api_manager.makeAPICall(api_url, this.loadFirstGroupMessages, this);
    }


    private getGroups() {
        var api_url: string = "http://127.0.0.1:8000/groups.json";
        this.api_manager.makeAPICall(api_url, this.loadGroups, this);
    }

    public loadGroups(data) {
        var self: any = this;

        self.clearGroupContainer();
        groupManager.clearGroupList();

        $.each(data, function(k, group) {

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
            group_element.click(function() {
                self.mouse_leave_lock = true;

                if (groupManager.getGroupList()) {

                    var gid = group_element.data('id');

                    // set as current group
                    groupManager.setCurrentGroup(gid);

                    // load group messages
                    messageHandler.getMessages();

                }

                setTimeout(function() {
                    self.hideMenu();
                }, 300);
            });

            groupManager.addGroup(
                group.id,
                group.name,
                group.description,
                group.unique_token,
            );

        });

    }

}

interface Group {
    id: number,
    name: string,
    description: string,
    token: string,
}

class GroupManager {

    groups: Array<Group>;
    current_group: Group;

    constructor() {
        this.groups = new Array<Group>();
        this.current_group = null;
    }

    public addGroup(id: number, name: string, description: string, token: string) {
        this.groups.push({
            id: id,
            name: name,
            description: description,
            token: token,
        });
    }

    public getGroupData(id: number): Group {
        var self = this;
        for (var i = 0; i < self.groups.length; i++) {
            if (self.groups[i].id == id) return self.groups[i];
        }
        return null;
    }

    public checkExists(id: number): Boolean {
        var self = this;
        for (var i = 0; i < self.groups.length; i++) {
            if (self.groups[i].id == id) return true;
        }
        return false;
    }

    public setCurrentGroup(id: number) { this.current_group = this.getGroupData(id); }
    public getCurrentGroup(): Group { return this.current_group; }
    public clearGroupList() { this.groups = []; }
    public numberOfGroups() { return this.groups.length; }
    public getGroupList() { return this.groups; }

}