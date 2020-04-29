export interface IPlayer {
    id: string;
    assignedColor?: string;
    isCurrent: boolean;
    isHost: boolean;
    username: string;
    joinedAtTimestamp: number;
}

type protocolName = 'partygam.es';
export const sProtocolName = 'partygam.es';

export enum PartyTimeIncomingMessageType {
    IFRAME_IS_READY,
    MESSAGE,
    SHOW_TOAST,
    PLAYERS_DID_UPDATE,
}

export enum PartyTimeOutgoingMessageType {
    BROADCAST_MESSAGE = 4,
    EMIT_MESSAGE,
    DIRECT_MESSAGE,
    REQUEST_PLAYERS_UPDATE,
    SHOW_GENERAL_TOAST,
    SHOW_PLAYER_TOAST,
    SET_IFRAME_HEIGHT,
}

export enum PartyTimeInternalMessageType {
    HANDSHAKE = 11,
    CONNECTIONS_DID_UPDATE ,
}

export interface PartyTimeIncomingMessage {
    source: protocolName,
    type: PartyTimeIncomingMessageType,
    playerId?: string;
    payload?: any;
}

export interface PartyTimeOutgoingMessage {
    source: protocolName;
    type: PartyTimeOutgoingMessageType;
    playerId?: string;
    payload?: any;
}

export interface PartyTimeInternalMessage {
    source: protocolName;
    type: PartyTimeInternalMessageType;
    payload?: any;
}

type OnMessageReceivedListener = (playerId: string, payload: any) => void;
type OnPlayersUpdateListener = ({ players }: { players: ReadonlyArray<IPlayer> }) => void;

let iframeIsReady: boolean = false;
let messageQueue: ReadonlyArray<PartyTimeOutgoingMessage> = [];
let messageReceivedListeners: ReadonlyArray<OnMessageReceivedListener> = [];
let playersUpdateListeners: ReadonlyArray<OnPlayersUpdateListener> = [];

const handleQueue = () => {
    if (!iframeIsReady) {
        return;
    }
    console.log({messageQueue});
    // TODO: maybe send all at once?
    messageQueue.forEach((message) => {
        window.parent.postMessage(
            message,
            '*'
        );
    });
    messageQueue = [];
};

// TODO: add possibility to send multiple messages at once (array of messages)?
// TODO: on start set a timeout with a queue while we wait
const messageParent = (message: PartyTimeOutgoingMessage) => {
    messageQueue = messageQueue.concat(
        message
    );
    handleQueue();
};

export const onPlayersUpdate = (listener: OnPlayersUpdateListener, { immediate = false }) => {
    playersUpdateListeners = playersUpdateListeners.concat(listener);
    // TODO: if immediate, check if the number of players is known and fire the event off immediately
    if (true === immediate) {
        messageParent({
            source: sProtocolName,
            type: PartyTimeOutgoingMessageType.REQUEST_PLAYERS_UPDATE,
        });
    }
    return () => {
        playersUpdateListeners = playersUpdateListeners.filter(l => l !== listener);
    };
};

/**
 * Update the game's iframe height. Between screen filling and 200vh.
 * @param height
 */
export const updateGameHeight = (height?: number) => {
    console.log('send message nr', PartyTimeOutgoingMessageType.SET_IFRAME_HEIGHT);
    messageParent({
        source: sProtocolName,
        type: PartyTimeOutgoingMessageType.SET_IFRAME_HEIGHT,
        payload: {
            height,
        }
    });
};

export const broadcastMessage = (payload: any) => {
    messageParent({
        source: sProtocolName,
        type: PartyTimeOutgoingMessageType.BROADCAST_MESSAGE,
        payload
    });
};

export const emitMessage = (payload: any) => {
    messageParent({
        source: sProtocolName,
        type: PartyTimeOutgoingMessageType.EMIT_MESSAGE,
        payload
    });
};

export const directMessage = (playerId: string, payload: any) => {
    messageParent({
        source: sProtocolName,
        type: PartyTimeOutgoingMessageType.DIRECT_MESSAGE,
        playerId,
        payload
    });
};

export const onMessageReceived = (listener: OnMessageReceivedListener) => {
    messageReceivedListeners = messageReceivedListeners.concat(
        listener
    );
    return () => {
        messageReceivedListeners = messageReceivedListeners.filter(l => l !== listener);
    };
};


export const showPlayerToast = ({ message  }: { message: string }) => {
    messageParent({
        source: sProtocolName,
        type: PartyTimeOutgoingMessageType.SHOW_PLAYER_TOAST,
        payload: {
            message
        },
    });
};

export const showToast = ({ message }: { message: string }) => {
    messageParent({
        source: sProtocolName,
        type: PartyTimeOutgoingMessageType.SHOW_GENERAL_TOAST,
        payload: {
            message
        },
    });
};

window.addEventListener('message', (event) => {

    const {source, type, playerId, payload} = event.data as PartyTimeIncomingMessage;

    if (source !== sProtocolName) {
        console.log('Another source, ignore:', source);
        return;
    }

    console.log('IFRAME got message', event);

    if (type === PartyTimeIncomingMessageType.IFRAME_IS_READY) {
        iframeIsReady = true;
        handleQueue();
        return;
    }

    if (type === PartyTimeIncomingMessageType.PLAYERS_DID_UPDATE) {
        playersUpdateListeners.forEach((listener) => listener(
            payload
        ));
        return;
    }

    if (type === PartyTimeIncomingMessageType.MESSAGE) {
        console.log('message from peer or server', payload);
        // create a better json-format for messaging > one for developers use and some for internal use
        messageReceivedListeners.forEach(
            (listener) => listener(
                playerId, payload
            )
        );
        return;
    }

});
