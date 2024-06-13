export interface IContent {
    type: string;
    value: string;
}

export interface IMessage {
    '@context': string;
    '@type': string;
    actor: string;
    content: IContent;
    chatId: string;
}