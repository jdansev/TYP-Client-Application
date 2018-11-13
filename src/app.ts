


var my_id;
var my_token;


var tabManager: TabManager;

var groupManager: GroupManager;
var groupUIManager: GroupUIManager;
var messageManager: MessageManager;
var messageHandler: MessageHandler;
var messageUIManager: MessageUIManager;
var fluidMotion: FluidMotion;
var colorFade: ColorFade;

var goManager: GoManager;


function electronConfig() {
    // set electron zoom
    const {webFrame} = require('electron');
    webFrame.setZoomFactor(1);
}

window.onload = function() {

    electronConfig();


    var themePalette = {
        'endless river': ['#43cea2', '#185a9d'],
        'redish yellow': ['#f1c40f', '#e74c3c'],
        'vivid': ['#fcb045', '#ee0979'],
        'ibiza sunset': ['#ff6a00','#ee0979'],
        'ocean': ['#36D1DC','#5B86E5'],
        'purplish red': ['#8e44ad','#c0392b'],
        'redgray': ['#f3f3f3','#5B86E5'],
        'quepal': ['#38ef7d', '#11998e'],
    }

    
    messageManager = new MessageManager();
    messageHandler = new MessageHandler();
    messageUIManager = new MessageUIManager();

    groupManager = new GroupManager();
    groupUIManager = new GroupUIManager();
    
    colorFade = new ColorFade(
        themePalette['endless river'],
        // themePalette['redish yellow'],
        // themePalette['vivid'],
        // themePalette['ibiza sunset'],
        // themePalette['ocean'],
        // themePalette['purplish red'],

        // themePalette['redgray'],
        // themePalette['quepal'],
    );

    fluidMotion = new FluidMotion(Direction.Reversed);


    goManager = new GoManager();
    goManager.register('asdf','asdf');

    tabManager = new TabManager();
    tabManager.initialiseTabs();

}





