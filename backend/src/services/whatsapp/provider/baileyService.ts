import makeWASocket, {
    Browsers,
    DisconnectReason,
    fetchLatestBaileysVersion,
    useMultiFileAuthState,
    WASocket
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import pino from "pino";
import qrcode from "qrcode-terminal";
import { IWhatsAppProvider } from "./IWhatsAppProvider";

export class BaileysProvider implements IWhatsAppProvider {

    private socket: WASocket | null = null;
    private connected = false;

    public async connect(): Promise<void> {

    if (this.connected && this.socket) {
        return;
    }

    const { state, saveCreds } =
        await useMultiFileAuthState("./auth");

    const { version } =
        await fetchLatestBaileysVersion();

    this.socket = makeWASocket({
        version,
        auth: state,
        browser: Browsers.windows("TechDigest AI"),
        logger: pino({ level: "silent" }),
        markOnlineOnConnect: false,
        printQRInTerminal: true,
    });

    this.socket.ev.on("creds.update", saveCreds);

    await new Promise<void>((resolve, reject) => {

        this.socket!.ev.on("connection.update", async ({ connection, qr, lastDisconnect }) => {

            if (qr) {
                console.clear();
                console.log("\nScan this QR using WhatsApp\n");
                qrcode.generate(qr, { small: true });
            }

            if (connection === "open") {
                this.connected = true;
                console.log("✅ WhatsApp Connected");
                resolve();
            }

            if (connection === "close") {

                this.connected = false;

                const statusCode =
                    (lastDisconnect?.error as Boom)?.output?.statusCode;

                if (statusCode === DisconnectReason.loggedOut) {
                    reject(new Error("WhatsApp logged out."));
                    return;
                }

                console.log("Reconnecting...");
                this.connected = false;
                this.socket = null;

                setTimeout(() => {
                    this.connect().catch(console.error);
                }, 5000);
            }
        });

    });

}

    public async sendMessage(
        phone: string,
        message: string
    ): Promise<void> {

      console.log({
    socket: !!this.socket,
    connected: this.connected,
    phone
});

        if (!this.socket) {
            throw new Error("WhatsApp socket is not connected.");
        }

        const jid = `${phone}@s.whatsapp.net`;

        await this.socket.sendMessage(jid, {

            text: message

        });

    }

   public async disconnect(): Promise<void> {
    if (this.socket) {
        await this.socket.logout();
    }

    this.socket = null;
    this.connected = false;
}

}