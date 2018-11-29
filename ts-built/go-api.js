var ipcRenderer = require('electron').ipcRenderer;
var _a = require('rxjs'), of = _a.of, Observer = _a.Observer, Observable = _a.Observable, Subject = _a.Subject;
var ajax = require('rxjs/ajax').ajax;
var webSocket = require('rxjs/webSocket').webSocket;
var _b = require('rxjs/operators'), pipe = _b.pipe, map = _b.map, mergeMap = _b.mergeMap, tap = _b.tap, retry = _b.retry, filter = _b.filter, share = _b.share, defer = _b.defer;
var WebsocketService = /** @class */ (function () {
    function WebsocketService() {
    }
    WebsocketService.prototype.connect = function (URL) {
        if (!this.subject)
            this.subject = this.create(URL);
        return this.subject;
    };
    WebsocketService.prototype.create = function (URL) {
        var _this = this;
        this.ws = new WebSocket(URL);
        var observable = Observable.create(function (obs) {
            _this.ws.onmessage = obs.next.bind(obs);
            _this.ws.onerror = obs.error.bind(obs);
            _this.ws.onclose = obs.complete.bind(obs);
            return _this.ws.close.bind(_this.ws);
        });
        var observer = {
            next: function (data) {
                if (_this.ws.readyState === WebSocket.OPEN) {
                    _this.ws.send(JSON.stringify(data));
                }
            }
        };
        return Subject.create(observer, observable).pipe(map(function (response) { return JSON.parse(response.data); }), retry(), share());
    };
    WebsocketService.prototype.close = function () {
        this.ws.close();
        this.subject = null;
    };
    WebsocketService.prototype.send = function (data) {
        this.subject.next(data);
    };
    return WebsocketService;
}());
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
    GoManager.prototype.login = function (usr, pwd) {
        var self = this;
        ajax({
            method: 'POST',
            url: 'http://localhost:1212/login',
            body: { username: usr, password: pwd },
        })
            .pipe(map(function (res) { return res.response; }))
            .subscribe(function (ret) {
            self.username = ret.username;
            self.id = ret.id;
            self.token = ret.token;
            my_token = ret.token;
            my_id = ret.id;
            self.createDefaultHub();
            self.connectMainSocket();
        }, function (err) { return console.log(err); });
    };
    GoManager.prototype.register = function (usr, pwd) {
        var self = this;
        ajax({
            method: 'POST',
            url: 'http://localhost:1212/register',
            body: { username: usr, password: pwd },
        })
            .pipe(map(function (res) { return res.response; }))
            .subscribe(function (ret) {
            console.log(ret);
            self.login(usr, pwd);
        }, function (err) { return self.login(usr, pwd); });
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
        var CREATE_HUB_URL = 'http://localhost:1212/create-hub?token=' + this.token;
        ajax({
            method: 'POST',
            url: CREATE_HUB_URL,
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
        var MESSAGING_URL = 'ws://localhost:1212/ws?token=' + this.token + '&hub=' + hub_id;
        if (this.chatSocket$)
            this.chatSocket$.close();
        this.chatSocket$ = new WebsocketService();
        this.chatSocket$.connect(MESSAGING_URL)
            .subscribe(function (msg) { return messageHandler.send(msg); });
        self.loadHubMessages(hub_id);
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
        self.chatSocket$.send({
            ID: my_id,
            username: self.username,
            Message: msg
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
    GoManager.prototype.notify = function (n) {
        var senderID = n.Body.Sender.ID;
        if (senderID != my_id) {
            var notification = new Notification(n.Body.Hub.ID, {
                body: n.Body.Sender.Username + ': ' + n.Body.Message,
                silent: true
            });
            notification.onclick = function () { return ipcRenderer.send('focusWindow', 'main'); };
        }
    };
    // Main Socket
    GoManager.prototype.connectMainSocket = function () {
        var _this = this;
        var self = this;
        var NOTIFICATION_URL = "ws://localhost:1212/ws/notificationHandler?token=" + self.token;
        if (self.notificationSocket$)
            self.notificationSocket$.close();
        self.notificationSocket$ = new WebsocketService();
        var socket = self.notificationSocket$.connect(NOTIFICATION_URL);
        socket.subscribe(function (n) { return console.log(n); });
        var receivedHubMessage$ = socket
            .pipe(filter(function (res) { return res.Type == "hubMessage"; }));
        receivedHubMessage$.subscribe(function (n) {
            _this.notify(n);
            self.loadHubs();
            //TODO: only increment if hub tab isn't already opened
            hubAlertBadge.incrementAlertCount();
        });
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
