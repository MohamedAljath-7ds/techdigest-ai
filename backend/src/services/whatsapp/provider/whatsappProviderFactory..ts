import { env } from "../../../config/env";
import { IWhatsAppProvider } from "./IWhatsAppProvider";
import { BaileysProvider } from "./baileyService";

export class WhatsAppProviderFactory {

    private static provider: IWhatsAppProvider;

    public static getProvider(): IWhatsAppProvider {

        if (!this.provider) {

            switch (env.WHATSAPP_PROVIDER.toLowerCase()) {

                case "baileys":
                    this.provider = new BaileysProvider();
                    break;

                default:
                    throw new Error(
                        `Unsupported WhatsApp provider: ${env.WHATSAPP_PROVIDER}`
                    );

            }

        }

        return this.provider;

    }

}