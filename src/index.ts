import {
    IPlayer,
    PartyTimeIncomingMessage,
    PartyTimeIncomingMessageType,
    PartyTimeOutgoingMessage,
    PartyTimeOutgoingMessageType,
    sProtocolName
} from "./protocol";

type OnMessageReceivedListener = (playerId: string, payload: any) => void;
type OnPlayersUpdateListener = (players: ReadonlyArray<IPlayer>) => void;

let messageReceivedListeners: ReadonlyArray<OnMessageReceivedListener> = [];
let playersUpdateListeners: ReadonlyArray<OnPlayersUpdateListener> = [];

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

// TODO: add possibility to send multiple messages at once (array of messages)?
const messageParent = (message: PartyTimeOutgoingMessage) => {
    window.parent.postMessage(
        message,
        '*'
    );
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
