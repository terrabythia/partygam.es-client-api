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
    MESSAGE,
    SHOW_TOAST,
    PLAYERS_DID_UPDATE,
}

export enum PartyTimeOutgoingMessageType {
    BROADCAST_MESSAGE = 3,
    EMIT_MESSAGE,
    DIRECT_MESSAGE,
    REQUEST_PLAYERS_UPDATE,
    SHOW_GENERAL_TOAST,
    SHOW_PLAYER_TOAST,
}

export enum PartyTimeInternalMessageType {
    HANDSHAKE = 9,
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

