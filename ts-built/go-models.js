/* Decoders */
var decodeUser = function (json) {
    return {
        id: json.ID,
        username: json.Username,
        token: '',
    };
};
var decodeUserHub = function (json) {
    return {
        id: json.Tag.ID,
        visibility: json.Tag.Visibility,
        spectrum: json.Tag.Spectrum,
        lastMessage: json.LastMessage.Message,
        readLatest: json.ReadLatest,
    };
};
var decodeHub = function (json) {
    return {
        id: json.ID,
        visibility: json.Visibility,
        spectrum: json.Spectrum,
    };
};
var decodeMessage = function (json) {
    return {
        sender: {
            id: json.ID,
            token: '',
            username: json.Username,
        },
        message: json.Message,
    };
};
