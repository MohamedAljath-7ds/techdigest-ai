export interface IWhatsAppProvider {

    connect?(): Promise<void>;

    sendMessage(
        phone: string,
        message: string
    ): Promise<void>;

    disconnect?(): Promise<void>;

}