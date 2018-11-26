/* decoders */
function decodeUser(json) {
    return {
        id: json.ID,
        username: json.Username,
        token: '',
    };
}
function decodeUserHub(json) {
    return {
        id: json.Tag.ID,
        visibility: json.Tag.Visibility,
        spectrum: json.Tag.Spectrum,
        lastMessage: json.LastMessage.Message,
        readLatest: json.ReadLatest,
    };
}
function decodeHub(json) {
    return {
        id: json.ID,
        visibility: json.Visibility,
        spectrum: json.Spectrum,
    };
}
function decodeMessage(json) {
    return {
        sender: {
            id: json.ID,
            token: '',
            username: json.Username,
        },
        message: json.Message,
    };
}
