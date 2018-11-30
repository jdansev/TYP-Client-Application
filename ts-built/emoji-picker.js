/* Emoji Picker */
var EmojiPicker = /** @class */ (function () {
    function EmojiPicker(pickerElement, inputElement) {
        this.emojiPickerElement = pickerElement;
        this.messageInputElement = inputElement;
    }
    EmojiPicker.prototype.createEmojiPicker = function () {
        var self = this;
        self.emojiPickerElement.lsxEmojiPicker({
            width: 420,
            height: 120,
            twemoji: false,
            onSelect: function (emoji) {
                var e = self.findSurrogatePair(emoji.value.replace("&#x", "0x"))
                    .map(function (el) { return parseInt(el, 16); })
                    .map(function (el) { return String.fromCharCode(el); })
                    .join('');
                self.insertAtCaret(self.messageInputElement.get(0), e);
            }
        });
    };
    EmojiPicker.prototype.findSurrogatePair = function (point) {
        // assumes code point > 0xffff
        var offset = point - 0x10000, lead = 0xd800 + (offset >> 10), trail = 0xdc00 + (offset & 0x3ff);
        return [lead.toString(16), trail.toString(16)];
    };
    EmojiPicker.prototype.insertAtCaret = function (inputField, myValue) {
        if (document.selection) {
            // Internet Explorer compatible
            inputField.focus();
            var sel = document.selection.createRange();
            sel.text = myValue;
            inputField.focus();
        }
        else if (inputField.selectionStart || inputField.selectionStart == '0') {
            // Firefox and Webkit compatible
            var startPos = inputField.selectionStart;
            var endPos = inputField.selectionEnd;
            var scrollTop = inputField.scrollTop;
            inputField.value = inputField.value.substring(0, startPos) + myValue + inputField.value.substring(endPos, inputField.value.length);
            inputField.focus();
            inputField.selectionStart = startPos + myValue.length;
            inputField.selectionEnd = startPos + myValue.length;
            inputField.scrollTop = scrollTop;
        }
        else {
            inputField.focus();
            inputField.value += myValue;
        }
    };
    EmojiPicker.prototype.hideEmojiPicker = function () {
        $('.lsx-emojipicker-container').hide();
    };
    return EmojiPicker;
}());
