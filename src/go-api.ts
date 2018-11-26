const { ipcRenderer } = require('electron');

const { of } = require('rxjs');
const { Observable } = require('rxjs');
const { ajax } = require('rxjs/ajax');
const { webSocket } = require('rxjs/webSocket');
const { pipe, map, mergeMap, tap, retry } = require('rxjs/operators');

class GoManager {

    ws: any;
    hubSearchWS: any;
    userSearchWS: any;

    mainWS: any;

    username: string;
    id: string;
    token: string;

    constructor() {}

    public initialise() {
        var self: any = this;

        // hub search
        $("#hub-search").keyup(function(e) {

            if ($('#hub-search').val() == '') {
                tabManager.resetHubTab();
                return;
            }

            if (self.hubSearchWS == null || self.hubSearchWS.readyState != self.hubSearchWS.OPEN) {
                console.log('you are not connected.');
                self.connectHubSearchWebsocket();
            }

            self.waitForSocketConnection(self.hubSearchWS, function() {
                self.hubSearchWS.send($('#hub-search').val());
            });

        });

        // user search
        $("#user-search").keyup(function(e) {

            if ($('#user-search').val() == '') {
                tabManager.resetFriendsTab();
                return;
            }

            if (self.userSearchWS == null || self.userSearchWS.readyState != self.userSearchWS.OPEN) {
                console.log('you are not connected.');
                self.connectUserSearchWebsocket();
            }

            self.waitForSocketConnection(self.userSearchWS, function() {
                self.userSearchWS.send($('#user-search').val());
            });

        });
    }

    public setup(u, p) {
        this.login(u, p);
    }

    public login(u, p) {

        var self: any = this;

        $.ajax({
            type: 'POST',
            url: 'http://localhost:1212/login',
            data: { username: u, password: p },
            success: function(data, textStatus, xhr) {

                if (xhr.status != 200) {

                    console.log(data.responseText);

                } else {

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
            error: function(data, textStatus, xhr) {
                console.log(data.responseText);
            }
        });

    }

    public register(u, p) {

        var self: any = this;

        $.ajax({
            type: 'POST',
            url: 'http://localhost:1212/register',
            data: { username: u, password: p },
            success: function(data, textStatus, xhr) {
                if (xhr.status != 200) {
                    console.log(data.responseText);
                } else {
                    var js = JSON.parse(data);
                    console.log(js);

                    self.login(u, p);

                }

            },
            error: function(data, textStatus, xhr) {
                console.log(data.responseText);

                // already logged in
                self.login(u, p);

            }
        });

    }

    public createHub(e) {
        var self: any = this;

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
        .pipe(
            map(r => r.response),
        )
        .subscribe(
            x => console.log(x),
            err => console.log(err)
        );

    }

    public createDefaultHub() {
        var self: any = this;

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
        .pipe(
            map(r => r.response),
        )
        .subscribe(
            x => self.joinHub(x.ID),
            err => self.joinHub(hub_id)
        );

    }

    public joinHub(hub_id) {
        var self: any = this;

        if (this.ws != null) this.ws.close();

        this.ws = new WebSocket("ws://localhost:1212/ws?token=" + this.token + "&hub=" + hub_id);

        self.waitForSocketConnection(this.ws, function() {

            console.log("Connected.");

            self.loadHubMessages(hub_id);

            self.ws.onmessage = function (evt) {

                var messages = evt.data.split('\n');
                if (messages.length > 0) {
                    var msg = JSON.parse(messages[0]);
                    messageHandler.send(msg);
                } else {
                    console.log("error parsing message!");
                }
            };
        });

    }

    private waitForSocketConnection(socket, callback){
        var self: any = this;
        setTimeout(function () {
                if (socket.readyState === 1) {
                    if(callback != null) {
                        callback();
                    }
                    return;
                } else {
                    console.log("Waiting to connect.");
                    self.waitForSocketConnection(socket, callback);
                }
            },
        5); // wait 5 miliseconds
    }

    public sendMessage(msg){
        var self: any = this;

        if (self.ws == null) {
            console.log('you are not connected.');
            return;
        }

        self.waitForSocketConnection(self.ws, function() {
            self.ws.send(JSON.stringify({
                ID: my_id,
                username: self.username,
                Message: msg
            }));
        });

    }

    // User Search Websocket
    public connectUserSearchWebsocket() {
        var self: any = this;

        self.userSearchWS = new WebSocket("ws://localhost:1212/ws/find-users");
        self.waitForSocketConnection(self.userSearchWS, function() {
            console.log("Connected to user search websocket.");

            self.userSearchWS.onmessage = function (evt) {

                $('#friends__title').text('Search Results');

                var results = evt.data.split('\n');

                if (results.length > 0) {
                    var json = JSON.parse(results[0]);

                    tabManager.emptyFriendList();
                    tabManager.resultsCount(json.length, $('#tab__people .results-count'));

                    for (var user of json) {
                        tabManager.addItemToFriendList(decodeUser(user));
                    }
                } else {
                    console.log("error parsing message!");
                }
            };
        });

    }

    // Hub Search Websocket
    public connectHubSearchWebsocket() {
        var self: any = this;

        self.hubSearchWS = new WebSocket("ws://localhost:1212/ws/find-hubs");
        self.waitForSocketConnection(self.hubSearchWS, function() {

            console.log("Connected to hub search websocket.");

            self.hubSearchWS.onmessage = function (evt) {

                var results = evt.data.split('\n');

                if (results.length > 0) {

                    var json = JSON.parse(results[0]);

                    $('#hubs__title').text('Search Results');
                    $('#create-hub').hide();
                    tabManager.emptyHubList();

                    tabManager.resultsCount(json.length, $('#tab__hubs .results-count'));
                    
                    for (var hub of json) {
                        tabManager.addItemToHubList(decodeHub(hub));
                    }

                } else {
                    console.log("error parsing message!");
                }
            };
        });

    }

    // Main Socket
    public connectMainSocket() {
        var self: any = this;

        self.mainWS = webSocket("ws://localhost:1212/ws/notificationHandler?token="+self.token);
        self.mainWS.pipe(
            retry(),
        )
        .subscribe(
            n => {
                switch(n.Type) {
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

                        let senderID = n.Body.Sender.ID;
                        if (senderID != my_id) {
                            const notification = new Notification(n.Body.Hub.ID, {
                                body: n.Body.Sender.Username + ': ' + n.Body.Message,
                                silent: true
                            });
                            notification.onclick = () => {
                                ipcRenderer.send('focusWindow', 'main');
                            }

                        }
                        
                        self.loadHubs();
                        
                        break;
                    default:
                }
            },
            err => console.log(err)
        );

    }

    public loadHubs() {

        ajax({
            method: 'GET',
            url: 'http://localhost:1212/my-hubs?token=' + my_token
        })
        .pipe(
            map(r => r.response),
            tap(x => tabManager.emptyHubList()),
            mergeMap(s => [...s]),
            map(h => decodeUserHub(h))
        )
        .subscribe(
            hub => tabManager.addItemToHubList(hub),
            err => console.log(err)
        );

    }

    public getHubInfo(hid) {

        ajax({
            method: 'GET',
            url: 'http://localhost:1212/hub-info/' + hid + '?token=' + my_token
        })
        .pipe(
            map(r => r.response),
            map(h => decodeHub(h))
        )
        .subscribe(
            hub => tabManager.showHubDetails(hub),
            err => console.log(err)
        );

    }

    public loadHubMessages(hub_id) {

        ajax({
            method: 'GET',
            url: "http://localhost:1212/hub-messages/" + hub_id + "?token=" + my_token
        })
        .pipe(
            map(r => r.response),
            tap(() => {
                messageManager.clearMessages();
                messageHandler.clearMessages();
            }),
            mergeMap(s => [...s]),
            map(m => decodeMessage(m))
        )
        .subscribe(
            m => {
                messageManager.addMessage(m);
            },
            err => console.log(err),
            () => fluidMotion.loadFluidMotionElementsFromArray(messageManager.getAllMessages())
        );

    }

    public loadFriends() {

        ajax({
            method: 'GET',
            url: "http://localhost:1212/my-friends?token=" + my_token,
        })
        .pipe(
            map(r => r.response),
            tap(x => tabManager.emptyFriendList()),
            mergeMap(s => [...s]),
            map(u => decodeUser(u))
        )
        .subscribe(
            u => tabManager.addItemToFriendList(u),
            err => console.log(err)
        );

    }

}

