import { WhatsAppProviderFactory } from "./provider/whatsappProviderFactory.";

class WhatsAppService {

    private provider = WhatsAppProviderFactory.getProvider();
    private initialized = false;

    public async initialize(): Promise<void> {

        if (this.initialized) {
            return;
        }

        if (this.provider.connect) {
            await this.provider.connect();
        }

        this.initialized = true;
    }

    public async sendMessage(
        phone: string,
        message: string
    ): Promise<void> {

        await this.initialize();

        await this.provider.sendMessage(phone, message);

    }

    public async shutdown(): Promise<void> {

        if (this.provider.disconnect) {
            await this.provider.disconnect();
        }

    }

}

export const whatsAppService = new WhatsAppService();