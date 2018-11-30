const { ipcRenderer } = require('electron');

const { of, Observer, Observable, Subject, fromEvent } = require('rxjs');
const { ajax } = require('rxjs/ajax');
const { webSocket } = require('rxjs/webSocket');
const { pipe, map, mergeMap, tap, retry, filter, share, defer, flatMap, debounce, debounceTime, distinctUntilChanged } = require('rxjs/operators');


class WebsocketService {
    private subject: any;
    private ws: any;

    public connect(URL) {
        if (!this.subject)
            this.subject = this.create(URL);
        return this.subject;
    }

    private create(URL) {
        this.ws = new WebSocket(URL);
        this.ws.onopen = () => console.log('connected successfully to ' + URL);
        let observable = Observable.create(
            obs => {
                this.ws.onmessage = obs.next.bind(obs);
                this.ws.onerror = obs.error.bind(obs);
                this.ws.onclose = obs.complete.bind(obs);
                return this.ws.close.bind(this.ws);
            }
        )
        let observer = {
            next: (data: Object) => {
                if (this.ws.readyState === WebSocket.OPEN) {
                    this.ws.send(JSON.stringify(data));
                }
            }
        }
        return Subject.create(observer, observable).pipe(
            map((response: any) => JSON.parse(response.data)),
            retry(),
            share()
        );
    }

    public close() {
        this.ws.close();
        this.subject = null;
    }

    public send(data) {
        this.subject.next(data);
    }
  
}

class GoManager {

    hubSearchWS: any;
    userSearchWS: any;

    username: string;
    id: string;
    token: string;

    chatSocket$: WebsocketService;
    notificationSocket$: WebsocketService;

    hubSearchSocket$: WebsocketService;

    constructor() {}

    public start() {
        var self: any = this;

        /* Hub search */
        fromEvent($( '#hub-search' ).get(0), 'keyup')
        .pipe(
            map(e => e.target.value),
        )
        .subscribe(
            x => {
                if (x == '') {
                    tabManager.resetHubTab();
                    return;
                }

                if (self.hubSearchWS == null || self.hubSearchWS.readyState != self.hubSearchWS.OPEN) {
                    console.log('you are not connected.');
                    self.connectHubSearchWebsocket();
                }
                self.waitForSocketConnection(self.hubSearchWS, function() {
                    self.hubSearchWS.send(x);
                });
            }
        );

        /* User search */
        fromEvent($( '#user-search' ).get(0), 'keyup')
        .pipe(
            map(e => e.target.value),
        )
        .subscribe(
            x => {
                if (x == '') {
                    tabManager.resetFriendsTab();
                    return;
                }
                if (self.userSearchWS == null || self.userSearchWS.readyState != self.userSearchWS.OPEN) {
                    console.log('you are not connected.');
                    self.connectUserSearchWebsocket();
                }
                self.waitForSocketConnection(self.userSearchWS, function() {
                    self.userSearchWS.send(x);
                });
            }
        );

    }

    public setup(u, p) {
        this.login(u, p);
    }

    public login(usr, pwd) {
        var self: any = this;

        ajax({
            method: 'POST',
            url: 'http://localhost:1212/login',
            body: { username: usr, password: pwd },
        })
        .pipe(
            map(res => res.response)
        )
        .subscribe(
            ret => {
                self.username = ret.username;
                self.id = ret.id;
                self.token = ret.token;

                my_token = ret.token;
                my_id = ret.id;

                self.createDefaultHub();
                self.connectMainSocket();
            },
            err => console.log(err)
        );

    }

    public register(usr, pwd) {
        var self: any = this;

        ajax({
            method: 'POST',
            url: 'http://localhost:1212/register',
            body: { username: usr, password: pwd },
        })
        .pipe(
            map(res => res.response)
        )
        .subscribe(
            ret => {
                console.log(ret);
                self.login(usr, pwd);
            },
            err => self.login(usr, pwd)
        );
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
        const MESSAGING_URL = 'ws://localhost:1212/ws?token=' + this.token + '&hub=' + hub_id;

        if (this.chatSocket$) this.chatSocket$.close();

        this.chatSocket$ = new WebsocketService();
        this.chatSocket$.connect(MESSAGING_URL)
        .subscribe(
            msg => messageHandler.send(msg)
        );
        self.loadHubMessages(hub_id)
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
        self.chatSocket$.send({
            ID: my_id,
            username: self.username,
            Message: msg
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

    private notify(n) {
        let senderID = n.Body.Sender.ID;
        if (senderID != my_id) {
            const notification = new Notification(n.Body.Hub.ID, {
                body: n.Body.Sender.Username + ': ' + n.Body.Message,
                silent: true
            });
            notification.onclick = () => ipcRenderer.send('focusWindow', 'main');
        }
    }

    // Main Socket
    public connectMainSocket() {
        var self: any = this;

        const NOTIFICATION_URL = "ws://localhost:1212/ws/notificationHandler?token=" + self.token;

        if (self.notificationSocket$) self.notificationSocket$.close();

        self.notificationSocket$ = new WebsocketService();
        const socket = self.notificationSocket$.connect(NOTIFICATION_URL);

        socket.subscribe(
            n => console.log(n)
        );

        const receivedHubMessage$ = socket
        .pipe(filter(res => res.Type == "hubMessage"));

        receivedHubMessage$.subscribe(
            n => {
                this.notify(n);
                self.loadHubs();
                //TODO: only increment if hub tab isn't already opened
                hubAlertBadge.incrementAlertCount();
            }
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

