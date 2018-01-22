const { remote, ipcRenderer } = require('electron');
const { BDIpc } = require('../frontend/main.js');

//Options
const options = {
    alwaysOnTop: false,
    liveUpdate: false
};

function sendToDiscord(channel, message) {
    BDIpc.send('bd-sendToDiscord', {channel, message});
}

//Elements
const
    $spinner = $('#spinner'),
    $toggleaot = $('#toggleaot'),
    $closeeditor = $('#closeeditor'),
    $editor = $('#editor'),
    $btnSave = $('#btnSave'),
    $btnUpdate = $('#btnUpdate'),
    $chkboxLiveUpdate = $("#chkboxLiveUpdate input");

$toggleaot.on('click', e => {
    $toggleaot.toggleClass("active");
    remote.getCurrentWindow().setAlwaysOnTop(options.alwaysOnTop = !options.alwaysOnTop);
});
$closeeditor.on('click', e => window.close());

$btnSave.on('click', () => sendToDiscord("save-css", codeMirror.getValue()));
$btnUpdate.on('click', () => sendToDiscord("update-css", codeMirror.getValue()));
$chkboxLiveUpdate.on('change', () => options.liveUpdate = $chkboxLiveUpdate[0].checked);

BDIpc.on("set-css", (_, data) => {
    if (data.error) {
        alert(data.error);
        return;
    }

    setCss(data.css);
    $spinner.hide();
});

function setCss(css) {
    codeMirror.setValue(css);
}

function alert(message) {}

const codeMirror = CodeMirror($editor[0], {
    lineNumbers: true,
    mode: 'css',
    indentUnit: 4,
    theme: 'material',
    scrollbarStyle: 'overlay',
    extraKeys: { 'Ctrl-Space': 'autocomplete' },
    dialog: { 'position': 'bottom' }
});

codeMirror.on('change', () => {
    if (options.liveUpdate)
        sendToDiscord("update-css", codeMirror.getValue());
});

codeMirror.on('keyup', function (editor, event) {
    if (window.controlDown) return;
    if (ExcludedIntelliSenseTriggerKeys[event.keyCode]) return;
    CodeMirror.commands.autocomplete(editor, null, { completeSingle: false });
});

const ExcludedIntelliSenseTriggerKeys = {
    '8': 'backspace',
    '9': 'tab',
    '13': 'enter',
    '16': 'shift',
    '17': 'ctrl',
    '18': 'alt',
    '19': 'pause',
    '20': 'capslock',
    '27': 'escape',
    '33': 'pageup',
    '34': 'pagedown',
    '35': 'end',
    '36': 'home',
    '37': 'left',
    '38': 'up',
    '39': 'right',
    '40': 'down',
    '45': 'insert',
    '46': 'delete',
    '91': 'left window key',
    '92': 'right window key',
    '93': 'select',
    '107': 'add',
    '109': 'subtract',
    '110': 'decimal point',
    '111': 'divide',
    '112': 'f1',
    '113': 'f2',
    '114': 'f3',
    '115': 'f4',
    '116': 'f5',
    '117': 'f6',
    '118': 'f7',
    '119': 'f8',
    '120': 'f9',
    '121': 'f10',
    '122': 'f11',
    '123': 'f12',
    '144': 'numlock',
    '145': 'scrolllock',
    '186': 'semicolon',
    '187': 'equalsign',
    '188': 'comma',
    '189': 'dash',
    '190': 'period',
    '191': 'slash',
    '192': 'graveaccent',
    '220': 'backslash',
    '222': 'quote'
};

BDIpc.send('bd-get-css');
