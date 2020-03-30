export interface IPlayer {
    id: string;
    isCurrent: boolean;
    isHost: boolean;
    username: string;
    joinedAtTimestamp: number;
}

type protocolName = 'partygam.es';
export const sProtocolName = 'partygam.es';

export enum PartyTimeIncomingMessageType {
    MESSAGE,
    PLAYERS_DID_UPDATE,
}

export enum PartyTimeOutgoingMessageType {
    BROADCAST_MESSAGE = 2,
    EMIT_MESSAGE,
    DIRECT_MESSAGE,
    REQUEST_PLAYERS_UPDATE,
}

export enum PartyTimeInternalMessageType {
    SET_ROOM_ID = 6,
    HANDSHAKE,
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

