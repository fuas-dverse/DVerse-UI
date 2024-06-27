export interface IContent {
    type: string;
    value: string;
}

export interface IMessage {
    actor: string;
    chatId: string | string[];
    "@type": string;
    "@context": string;
    content: IContent | IContent[];
}