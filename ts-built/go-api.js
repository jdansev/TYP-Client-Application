var GoManager = /** @class */ (function () {
    function GoManager() {
    }
    GoManager.prototype.initialise = function () {
        var self = this;
        // hub search
        $("#hub-search").keyup(function (e) {
            if ($('#hub-search').val() == '') {
                tabManager.resetHubTab();
                return;
            }
            if (self.hubSearchWS == null || self.hubSearchWS.readyState != self.hubSearchWS.OPEN) {
                console.log('you are not connected.');
                self.connectHubSearchWebsocket();
            }
            self.waitForSocketConnection(self.hubSearchWS, function () {
                self.hubSearchWS.send($('#hub-search').val());
            });
        });
        // user search
        $("#user-search").keyup(function (e) {
            if ($('#user-search').val() == '') {
                tabManager.resetFriendsTab();
                return;
            }
            if (self.userSearchWS == null || self.userSearchWS.readyState != self.userSearchWS.OPEN) {
                console.log('you are not connected.');
                self.connectUserSearchWebsocket();
            }
            self.waitForSocketConnection(self.userSearchWS, function () {
                self.userSearchWS.send($('#user-search').val());
            });
        });
    };
    GoManager.prototype.setup = function (u, p) {
        this.login(u, p);
    };
    GoManager.prototype.login = function (u, p) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: 'http://localhost:1212/login',
            data: { username: u, password: p },
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    console.log(data);
                    self.username = data.username;
                    self.id = data.id;
                    self.token = data.token;
                    my_token = data.token;
                    my_id = data.id;
                    self.createHub();
                    self.loadHubs();
                    self.loadFriends();
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
            }
        });
    };
    GoManager.prototype.register = function (u, p) {
        var self = this;
        $.ajax({
            type: 'POST',
            url: 'http://localhost:1212/register',
            data: { username: u, password: p },
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    var js = JSON.parse(data);
                    console.log(js);
                    self.login(u, p);
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
                // already logged in
                self.login(u, p);
            }
        });
    };
    GoManager.prototype.cHub = function (e) {
        e.preventDefault();
        var self = this;
        var visibility = $('input[name=hub-visibility]:checked').attr('id');
        console.log(visibility);
        var name = $('input[name=hub-name]').val();
        console.log(name);
        var spec = $('#create-hub-form .dropdown').find('span').data('Spectrum');
        console.log(spec);
        var url = 'http://localhost:1212/create-hub?token=' + this.token;
        $.ajax({
            type: 'POST',
            url: url,
            data: {
                hub_id: name,
                hub_visibility: visibility,
                hub_spec_start: spec[0],
                hub_spec_end: spec[1],
            },
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    console.log('hub successfully created');
                    var js = JSON.parse(data);
                    console.log(js);
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
            }
        });
        return false;
    };
    GoManager.prototype.createHub = function () {
        var self = this;
        var hub_id = 'privatehub';
        var visibility = 'private';
        var url = 'http://localhost:1212/create-hub?token=' + this.token;
        $.ajax({
            type: 'POST',
            url: url,
            data: {
                hub_id: hub_id,
                hub_visibility: visibility,
                hub_spec_start: '#36D1DC',
                hub_spec_end: '#5B86E5',
            },
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    console.log('hub successfully created');
                    var js = JSON.parse(data);
                    console.log(js);
                    self.joinHub(hub_id);
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
                // hub already exists
                self.joinHub(hub_id);
            }
        });
    };
    GoManager.prototype.joinHub = function (hub_id) {
        var self = this;
        if (this.ws != null)
            this.ws.close();
        this.ws = new WebSocket("ws://localhost:1212/ws?token=" + this.token + "&hub=" + hub_id);
        self.waitForSocketConnection(this.ws, function () {
            console.log("Connected.");
            self.loadHubMessages(hub_id);
            self.ws.onmessage = function (evt) {
                var messages = evt.data.split('\n');
                if (messages.length > 0) {
                    var msg = JSON.parse(messages[0]);
                    console.log(msg);
                    messageHandler.send(msg);
                }
                else {
                    console.log("error parsing message!");
                }
            };
        });
    };
    GoManager.prototype.waitForSocketConnection = function (socket, callback) {
        setTimeout(function () {
            if (socket.readyState === 1) {
                if (callback != null) {
                    callback();
                }
                return;
            }
            else {
                console.log("Waiting to connect.");
                this.waitForSocketConnection(socket, callback);
            }
        }, 5); // wait 5 miliseconds
    };
    GoManager.prototype.sendMessage = function (msg) {
        var self = this;
        if (self.ws == null) {
            console.log('you are not connected.');
            return;
        }
        self.waitForSocketConnection(self.ws, function () {
            self.ws.send(JSON.stringify({
                ID: my_id,
                username: self.username,
                Message: msg
            }));
        });
    };
    // User Search Websocket
    GoManager.prototype.connectUserSearchWebsocket = function () {
        var self = this;
        self.userSearchWS = new WebSocket("ws://localhost:1212/ws/find-users");
        self.waitForSocketConnection(self.userSearchWS, function () {
            console.log("Connected to user search websocket.");
            self.userSearchWS.onmessage = function (evt) {
                $('#friends__title').text('Search Results');
                var results = evt.data.split('\n');
                if (results.length > 0) {
                    var json = JSON.parse(results[0]);
                    tabManager.emptyFriendList();
                    tabManager.resultsCount(json.length, $('#tab__people .results-count'));
                    for (var user in json) {
                        tabManager.addItemToFriendList(json[user].Username);
                    }
                }
                else {
                    console.log("error parsing message!");
                }
            };
        });
    };
    // Hub Search Websocket
    GoManager.prototype.connectHubSearchWebsocket = function () {
        var self = this;
        self.hubSearchWS = new WebSocket("ws://localhost:1212/ws/find-hubs");
        self.waitForSocketConnection(self.hubSearchWS, function () {
            console.log("Connected to hub search websocket.");
            self.hubSearchWS.onmessage = function (evt) {
                var results = evt.data.split('\n');
                if (results.length > 0) {
                    var json = JSON.parse(results[0]);
                    $('#hubs__title').text('Search Results');
                    $('#create-hub').hide();
                    tabManager.emptyHubList();
                    tabManager.resultsCount(json.length, $('#tab__hubs .results-count'));
                    for (var hub in json) {
                        tabManager.addItemToHubList(json[hub].ID, json[hub].Visibility, json[hub].Spectrum);
                    }
                }
                else {
                    console.log("error parsing message!");
                }
            };
        });
    };
    // Load Hubs
    GoManager.prototype.loadHubs = function () {
        var self = this;
        $.ajax({
            type: 'GET',
            url: "http://localhost:1212/my-hubs?token=" + my_token,
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    var json = JSON.parse(data);
                    tabManager.emptyHubList();
                    for (var hub in json) {
                        tabManager.addItemToHubList(json[hub].ID, json[hub].Visibility, json[hub].Spectrum);
                    }
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
            }
        });
    };
    GoManager.prototype.getHubInfo = function (hub_id) {
        var self = this;
        $.ajax({
            type: 'GET',
            url: "http://localhost:1212/hub-info/" + hub_id + "?token=" + my_token,
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    var json = JSON.parse(data);
                    console.log(json);
                    tabManager.showHubInfo(json);
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
            }
        });
        return null;
    };
    // Load Hub Messages
    GoManager.prototype.loadHubMessages = function (hub_id) {
        var self = this;
        $.ajax({
            type: 'GET',
            url: "http://localhost:1212/hub-messages/" + hub_id + "?token=" + my_token,
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    messageManager.clearMessages();
                    messageHandler.clearMessages();
                    var json = JSON.parse(data);
                    // save messages
                    for (var m in json) {
                        var message = json[m];
                        var new_message = {
                            message: message.Message,
                            sender_username: message.Username,
                            sender_id: message.ID,
                            sender_token: "",
                        };
                        messageManager.addMessage(new_message);
                    }
                    // load them into the ui
                    fluidMotion.loadFluidMotionElementsFromArray(messageManager.getAllMessages());
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
            }
        });
    };
    // Load Friends
    GoManager.prototype.loadFriends = function () {
        var self = this;
        $.ajax({
            type: 'GET',
            url: "http://localhost:1212/my-friends?token=" + my_token,
            success: function (data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                }
                else {
                    var json = JSON.parse(data);
                    tabManager.emptyFriendList();
                    for (var hub in json) {
                        tabManager.addItemToFriendList(json[hub].Username);
                    }
                }
            },
            error: function (data, textStatus, xhr) {
                console.log(data.responseText);
            }
        });
    };
    return GoManager;
}());
