


/* User */
interface User {
    id: string;
    token: string;
    username: string;
}


/* Hubs */

interface Spectrum {
    start: string;
    end: string;
}

interface UserHub {
    hub: Hub;
    lastMessage: string;
    readLatest: boolean;
}

interface Hub {
    id: string;
    visibility: string;
    spectrum: Spectrum;
}

/* Message */
interface Message {
    sender: User;
    message: string;
}

/* decoders */

function decodeUser(json): User {
    return {
        id: json.ID,
        username: json.Username,
        token: '',
    }
}

function decodeUserHub(json) {
    return {
        id: json.Tag.ID,
        visibility: json.Tag.Visibility,
        spectrum: json.Tag.Spectrum,
        lastMessage: json.LastMessage.Message,
        readLatest: json.ReadLatest,
    }
}

function decodeHub(json): Hub {
    return {
        id: json.ID,
        visibility: json.Visibility,
        spectrum: json.Spectrum,
    }
}

function decodeMessage(json) {
    return {
        sender: {
            id: json.ID,
            token: '',
            username: json.Username,
        },
        message: json.Message,
    }
}