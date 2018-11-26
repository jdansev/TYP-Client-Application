var ipcRenderer = require('electron').ipcRenderer;
var of = require('rxjs').of;
var Observable = require('rxjs').Observable;
var ajax = require('rxjs/ajax').ajax;
var webSocket = require('rxjs/webSocket').webSocket;
var _a = require('rxjs/operators'), pipe = _a.pipe, map = _a.map, mergeMap = _a.mergeMap, tap = _a.tap, retry = _a.retry;
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
                    self.createDefaultHub();
                    self.loadHubs();
                    self.loadFriends();
                    // connect the main socket
                    if (self.mainWS == null || self.mainWS.readyState != self.mainWS.OPEN) {
                        console.log('you are not connected.');
                        self.connectMainSocket();
                    }
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
    GoManager.prototype.createHub = function (e) {
        var self = this;
        e.preventDefault();
        var visibility = $('input[name=hub-visibility]:checked').attr('id');
        var name = $('input[name=hub-name]').val();
        var spec = $('#create-hub-form .dropdown').find('span').data('Spectrum');
        var url = 'http://localhost:1212/create-hub?token=' + this.token;
        ajax({
            method: 'POST',
            url: url,
            body: {
                hub_id: name,
                hub_visibility: visibility,
                hub_spec_start: spec[0],
                hub_spec_end: spec[1],
            },
        })
            .pipe(map(function (r) { return r.response; }))
            .subscribe(function (x) { return console.log(x); }, function (err) { return console.log(err); });
    };
    GoManager.prototype.createDefaultHub = function () {
        var self = this;
        var hub_id = 'privatehub';
        var visibility = 'private';
        var url = 'http://localhost:1212/create-hub?token=' + this.token;
        ajax({
            method: 'POST',
            url: url,
            body: {
                hub_id: hub_id,
                hub_visibility: visibility,
                hub_spec_start: '#36D1DC',
                hub_spec_end: '#5B86E5',
            },
        })
            .pipe(map(function (r) { return r.response; }))
            .subscribe(function (x) { return self.joinHub(x.ID); }, function (err) { return self.joinHub(hub_id); });
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
                    messageHandler.send(msg);
                }
                else {
                    console.log("error parsing message!");
                }
            };
        });
    };
    GoManager.prototype.waitForSocketConnection = function (socket, callback) {
        var self = this;
        setTimeout(function () {
            if (socket.readyState === 1) {
                if (callback != null) {
                    callback();
                }
                return;
            }
            else {
                console.log("Waiting to connect.");
                self.waitForSocketConnection(socket, callback);
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
                    for (var _i = 0, json_1 = json; _i < json_1.length; _i++) {
                        var user = json_1[_i];
                        tabManager.addItemToFriendList(decodeUser(user));
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
                    for (var _i = 0, json_2 = json; _i < json_2.length; _i++) {
                        var hub = json_2[_i];
                        tabManager.addItemToHubList(decodeHub(hub));
                    }
                }
                else {
                    console.log("error parsing message!");
                }
            };
        });
    };
    // Main Socket
    GoManager.prototype.connectMainSocket = function () {
        var self = this;
        self.mainWS = webSocket("ws://localhost:1212/ws/notificationHandler?token=" + self.token);
        self.mainWS.pipe(retry())
            .subscribe(function (n) {
            switch (n.Type) {
                case "friendRequestReceived":
                    self.loadFriends();
                    break;
                case "youAcceptedFriendRequest":
                    self.loadFriends();
                    break;
                case "requestAccepted":
                    self.loadFriends();
                    break;
                case "youDeclinedFriendRequest":
                    self.loadFriends();
                    break;
                case "hubMessage":
                    console.log(n);
                    var senderID = n.Body.Sender.ID;
                    if (senderID != my_id) {
                        var notification = new Notification(n.Body.Hub.ID, {
                            body: n.Body.Sender.Username + ': ' + n.Body.Message,
                            silent: true
                        });
                        notification.onclick = function () {
                            ipcRenderer.send('focusWindow', 'main');
                        };
                    }
                    self.loadHubs();
                    break;
                default:
            }
        }, function (err) { return console.log(err); });
    };
    GoManager.prototype.loadHubs = function () {
        ajax({
            method: 'GET',
            url: 'http://localhost:1212/my-hubs?token=' + my_token
        })
            .pipe(map(function (r) { return r.response; }), tap(function (x) { return tabManager.emptyHubList(); }), mergeMap(function (s) { return s.slice(); }), map(function (h) { return decodeUserHub(h); }))
            .subscribe(function (hub) { return tabManager.addItemToHubList(hub); }, function (err) { return console.log(err); });
    };
    GoManager.prototype.getHubInfo = function (hid) {
        ajax({
            method: 'GET',
            url: 'http://localhost:1212/hub-info/' + hid + '?token=' + my_token
        })
            .pipe(map(function (r) { return r.response; }), map(function (h) { return decodeHub(h); }))
            .subscribe(function (hub) { return tabManager.showHubDetails(hub); }, function (err) { return console.log(err); });
    };
    GoManager.prototype.loadHubMessages = function (hub_id) {
        ajax({
            method: 'GET',
            url: "http://localhost:1212/hub-messages/" + hub_id + "?token=" + my_token
        })
            .pipe(map(function (r) { return r.response; }), tap(function () {
            messageManager.clearMessages();
            messageHandler.clearMessages();
        }), mergeMap(function (s) { return s.slice(); }), map(function (m) { return decodeMessage(m); }))
            .subscribe(function (m) {
            messageManager.addMessage(m);
        }, function (err) { return console.log(err); }, function () { return fluidMotion.loadFluidMotionElementsFromArray(messageManager.getAllMessages()); });
    };
    GoManager.prototype.loadFriends = function () {
        ajax({
            method: 'GET',
            url: "http://localhost:1212/my-friends?token=" + my_token,
        })
            .pipe(map(function (r) { return r.response; }), tap(function (x) { return tabManager.emptyFriendList(); }), mergeMap(function (s) { return s.slice(); }), map(function (u) { return decodeUser(u); }))
            .subscribe(function (u) { return tabManager.addItemToFriendList(u); }, function (err) { return console.log(err); });
    };
    return GoManager;
}());
