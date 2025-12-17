import { MatListItemLine } from "@angular/material/list";
import { parseSingleAddress } from "../services/bg-utilMail";

export interface Email {
    id: string;
    from?: string;
    fromInitial?: string;
    time?: string;
    subject?: string;
    snippet?: string;
    body?: string;
    read?: boolean;
}
export class BgMail implements Email {




    id: string;
    from?: string;
    fromInitial?: string;
    fromShort?: string;
    to?: string;
    date?: string;
    time?: string;
    safeBodyHtml?: string;
    subject?: string;
    snippet?: string;
    bodyTxt?: string;
    bodyHtml?: string;
    isHtmlBody?: boolean;
    geminiResponse?: GeminiResponse;
    geminiMetaData?: GeminiUsageMetaData;
    labelIds: string[] | undefined;
    labels?: string[];
    selected = false;
    read?: boolean;
    fromParsedAdress: ParsedAddress | undefined;
    constructor(
        id: string,
        from?: string,
        subject?: string,
        snippet?: string,
        bodyTxt?: string,
        bodyHtml?: string,
        geminiResponse?: GeminiResponse,
        isHtmlBody = false,
        fromParsedAdress = parseSingleAddress(from)
    ) {
        this.id = id;
        this.setFrom(from);

        this.subject ||= subject;
        this.snippet ||= snippet;
        this.bodyTxt ||= bodyTxt;
        this.bodyHtml ||= bodyHtml;
        this.geminiResponse ||= geminiResponse;
        this.isHtmlBodyUpdate();
        if (this.isHtmlBody) {
            this.safeBodyHtml = bodyTxt;
        }
    }

    public setFrom(from?: string): void {
        if (from) {

            this.from = from;
            this.fromShort = extractDisplayName(from);
            this.fromParsedAdress = parseSingleAddress(from) ?? undefined;
        }
    }
    public toString2(): string {
        if (!this.subject && this.bodyTxt) {
            return this.id;
        } else {

            return "Object:  " + this.subject;
        }

    }

    public toStringMeta(): string {
        if (!this.geminiMetaData) {
            return "No Gemini MetaDData";
        }
        return JSON.stringify(this.geminiMetaData.totalTokenCount + " cost: " + this.geminiMetaData.totalCostForRequest());
    }



    public isOffreEmploi(): boolean {
        return (this.hasLabel("jobOffer"))
    }

    public getBackgroundColor(): string {
        if (this.geminiResponse === undefined) {
            return '#ffffff';;
        }
        if (this.isOffreEmploi()) {
            if (this.nbOffresEmplois() == 1) {
                return '#7a0e3dff'; // vert clair pour les offres d'emploi
            } else {
                return '#57af4cff'; // vert plus foncé si plusieurs offres
            }
        } else if (this.isPriseDeContact()) {
            return '#d61b1eff'; // 
        } else {
            return '#f8d7da'; // rouge clair pour les autres types de mails
        }
    }
    public isPriseDeContact(): boolean {

        return this.hasLabel("contactRequest");
    }

    public hasLabel(labelToCheck: string): boolean {
        if (this.geminiResponse === undefined || this.geminiResponse.labels === undefined) {
            return false;
        }
        return this.geminiResponse.labels.includes(labelToCheck);
    }

    public nbOffresEmplois(): number {
        if (this.geminiResponse === undefined) {
            return 0;
        }
        return this.geminiResponse.nbOffresEmplois || 0;
    }

    public getLabelsStr(): string {
        if (this.geminiResponse === undefined) {
            return "";
        }
        return this.geminiResponse.labels?.join(", ") || "";
    }

    // Deprecated
    isConsistent(): Boolean {
        // Vérifie que les champs essentiels sont présents
        if (!this.from) {
            return false;
        }
        if (!this.subject && !this.bodyTxt) {
            return false;
        }
        return true;
    }

    displayInGmailByMessageId(messageId: string, accountIndex = 0) {
        if (!messageId) { return; }
        // construction d'URL : on utilise #all pour être plus général
        const url = `https://mail.google.com/mail/u/${accountIndex}/#all/${encodeURIComponent(messageId)}`;
        window.open(url, '_blank');
    }

    displayApplyLink() {
        if (!this.geminiResponse?.applyLink) { return; }
        window.open(this.geminiResponse?.applyLink, '_blank')
    }

    isHtmlBodyUpdate(): void {
        if (this.bodyHtml === undefined) {
            this.isHtmlBody = false;
        } else if (this.bodyHtml.length > 0) {
            this.isHtmlBody = true;
        } else if (!this.bodyTxt) {
            this.isHtmlBody = false;
        } else {
            // Heuristique simple : présence d'une balise HTML
            const htmlLike: boolean = /<\/?[a-z][\s\S]*>/i.test(this.bodyTxt);
            if (htmlLike && this.bodyTxt.length < 10000) {
                // Si le corps est trop long, on évite de le marquer comme HTML pour des raisons de performance
                this.bodyHtml = this.bodyTxt;
                this.isHtmlBody = htmlLike;
            }

        }

    }


    getBodyHtml() {

        return this.bodyHtml;
    }


    merge(msgG0: BgMail) {
        if (!this.from) {
            this.from = msgG0.from;
        }
        if (!this.bodyTxt) {
            this.bodyTxt = msgG0.bodyTxt;
        }
        if (!this.subject) {
            this.subject = msgG0.subject;
        }
    }
}

export interface ParsedAddress {
    name: string | null;
    email: string | null;
}

export class GeminiResponse {

    nbOffresEmplois: number = 0;
    company: string | undefined;
    position: string | undefined;
    salary: string | undefined;
    location: string | undefined;
    contact: string | undefined;
    applyLink: string | undefined;
    offerDate: string | undefined;
    extraNotes: string | undefined;
    confidence: number | undefined;
    label: string | undefined;
    labels: Array<string> | undefined;

}

export class GeminiUsageMetaData {

    promptTokenCount: number = 0;
    candidatesTokenCount: number = 0;
    totalTokenCount: number = 0;



    totalCostForRequest() {
        const priceInputPer1k = 0.03;
        const priceOutputPer1k = 0.06;
        const inputCost = (this.promptTokenCount / 1000) * priceInputPer1k;
        const outputCost = (this.candidatesTokenCount / 1000) * priceOutputPer1k;
        const totalCost = inputCost + outputCost;
        return "" + Number(totalCost.toFixed(6)) + "  USD/100";

    }
}



function extractDisplayName(raw: string | undefined): string | undefined {
    if (!raw) return raw;

    // Prendre le premier élément si plusieurs adresses (garde les guillemets ensemble)
    const first = raw.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)[0].trim();

    // Si format "Nom <email>", prendre la partie avant '<'
    const ltIndex = first.indexOf('<');
    let namePart = ltIndex !== -1 ? first.slice(0, ltIndex).trim() : first;

    // Enlever quotes autour du nom
    namePart = namePart.replace(/^"(.*)"$/, '$1').trim();

    // Enlever commentaires finaux comme "Nom (Société)"
    namePart = namePart.replace(/\s*\(.*\)$/, '').trim();

    // Si namePart vide ou contient un email (pas de nom), extraire la partie locale de l'email
    if (!namePart || /@/.test(namePart)) {
        const m = first.match(/([^<>@\s]+)@/);
        return m ? m[1] : raw;
    }

    // Décoder les mots encodés RFC2047 s'il y en a
    return decodeMimeWords(namePart);


}

function decodeMimeWords(str: string): string {
    // Remplace toutes les occurrences =?charset?B?base64?= ou =?charset?Q?qp?=
    return str.replace(/=\?([^?]+)\?([bqBQ])\?([^?]+)\?=/g, (_match, charset, enc, encoded) => {
        enc = enc.toUpperCase();
        try {
            if (enc === 'B') {
                // Base64
                const binary = atob(encoded);
                if (typeof TextDecoder !== 'undefined') {
                    const arr = new Uint8Array(binary.length);
                    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
                    return new TextDecoder(charset).decode(arr);
                }
                return binary;
            } else {
                // Q-encoding (quot-printable like for headers)
                let q = encoded.replace(/_/g, ' ');
                // q = q.replace(/=([A-Fa-f0-9]{2})/g, (_m, hex) => String.fromCharCode(parseInt(hex, 16)));
                if (typeof TextDecoder !== 'undefined') {
                    const arr = new Uint8Array(q.length);
                    for (let i = 0; i < q.length; i++) arr[i] = q.charCodeAt(i);
                    return new TextDecoder(charset).decode(arr);
                }
                return q;
            }
        } catch (e) {
            // En cas d'échec, retourne la chaîne encodée brute
            return encoded;
        }
    });


}