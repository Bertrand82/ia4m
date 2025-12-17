import { ChangeDetectorRef, Injectable, OnInit } from '@angular/core';
import { GisGmailService, GmailLabel } from './gis-gmail.service';
import { BgMail, GeminiResponse, GeminiUsageMetaData } from '../modeles/BgMail';
import { BgGemini } from './bg-gemini';
import { onChangeEmailSelected, onLabelsDownloaded, Updatable } from './UpDatable';
import { ComponentEmailDetail } from '../component-email-detail/component-email-detail';

@Injectable({
  providedIn: 'root',
})
export class GisGmailServiceHelper implements OnInit, onLabelsDownloaded {



  listenerOnChangeEmailSelected: onChangeEmailSelected | undefined;

  addListenerOnChangeEmailSelected(listener: onChangeEmailSelected): void {
   this.listenerOnChangeEmailSelected =listener;

  }

  private   messages2: Array<BgMail> = [];

  profile: any = null;
  updatable: Updatable | null = null;
  selectedEmail: BgMail | null = null;

  constructor(public gmail: GisGmailService, private gemini: BgGemini) {
    this.gmail.listenerOnLabelsDownloaded = this;
  }

  onLabelsDownloaded(labelsGmail: Array<GmailLabel>): void {
    this.getMessages().forEach(message => {
      this.updateLabelsFromLabelIds2(message, labelsGmail);
    });
  }

  public getMessages(): Array<BgMail> {
    return this.messages2;
  } 

  ngOnInit(): void {
    this.gmail.isSignedIn$.subscribe((s) => {
      if (s) {
        this.gmail
          .getProfile()
          .then((p) => (this.profile = p))
          .catch(() => { });
      } else {
        this.profile = null;
      }
    });
  }


  setSelectedMessage(email: BgMail) {

    this.selectedEmail = email;
    this.listenerOnChangeEmailSelected?.onChangeEmailSelected(email);
     this.updatable?.updateView();
  }

  deselectEmail() {
   
     this.listenerOnChangeEmailSelected?.onChangeEmailSelected(null);
      this.selectedEmail = null;
    this.updatable?.updateView();
  }

  onSignIn() {
    console.log('bg00 GmailListComponent onSignIn called');
    this.gmail
      .signIn('consent')
      .catch((err) => console.error('bg01 Erreur lors de la connexion:', err));
  }

  onSignOut() {
    this.gmail.signOut().catch((err) => console.error(err));
  }

  processMessages(updatable: Updatable) {
    this.updatable = updatable;
    const messagesToday = this.loadMessagesToday();
    messagesToday.forEach((m) => {
      this.fetchMessageAndProcess(m.id);
    });
  }
  fetchMessageAndProcess(idMessage: string) {
    this.gmail
      .getMessage(idMessage, 'full')
      .then((mg) => { this.updateLabelsFromLabelIds(mg); this?.updatable?.updateView(); this.processMessageDetailsByGemini(mg) })
      .catch((err) => console.error('bg processMessage error id :' + idMessage + "  err:", err));
  }


  getMessageById(id: string): any {
    const index = this.getMessages().findIndex((m) => m.id === id);
    if (index === -1) {
      console.error('getMessageById: message not found in list id=', id);
      return null;
    }
    return this.getMessages()[index];
  }

  trackById(index: number, item: BgMail): string {
    return item.id;
  }

  processMessageDetailsByGemini(msgG: BgMail): any {

    console.log('processMessageDetails msgG:', msgG);

    const index = this.getMessages().findIndex((m) => m.id === msgG.id);
    console.log('processMessageDetails msgG.id:', msgG.id, ' index=', index);
    if (index === -1) {
      console.error(
        'processMessageDetailsByGemini: message not found in list id=', msgG.id
      );
      return;
    }
    const bgMessage = new BgMail(msgG.id);
    console.log('bgA processMessageDetails msgG.id:', msgG.id, ' msg', msgG);
    console.log('bgA processMessageDetails msgG.id:', msgG.id, ' msgG.labelIds=', msgG.labelIds);
    try {
      bgMessage.to = this.extractHeader(msgG, 'To') || '';
      bgMessage.subject = this.extractHeader(msgG, 'Subject') || '';
      bgMessage.snippet = msgG.snippet || '';
      bgMessage.bodyTxt = this.getPlainTextFromMessage(msgG, 3000); // tronque à 3000 chars
      bgMessage.bodyHtml = this.getHtmlFromMessage(msgG, -1); // tronque à 3000 chars
      bgMessage.setFrom(this.extractHeader(msgG, 'From') || '');
      bgMessage.labelIds = msgG.labelIds;
      bgMessage.isHtmlBodyUpdate();
      this.updateLabelsFromLabelIds(bgMessage);
    } catch (e) {
      console.error('bgA Erreur lors de l\'extraction des détails du message id=' + msgG.id + ' :', e);
      return;
    }
    console.log('bgA processMessageDetails msgG.id:', msgG.id, ' bgMessage:', bgMessage);
    const hasAlreadyBeProcessed = this.gmail.hasAlreadyBeProcessedByGemini(bgMessage);
    console.log('bgA hasAlreadyBeProcessed id :' + msgG.id + " = ", hasAlreadyBeProcessed);
    if (hasAlreadyBeProcessed) {
      console.log('bg processMessageDetailsByGemini msgG id :' + msgG.id + " already processed by Gemini, skipping.");
      //
      const geminiResponse = new GeminiResponse();
      geminiResponse.labels = bgMessage.labels;
      return;
    }
    this.getMessages()[index] = bgMessage;
    console.log('bg AA1 processMessageDetails index zz' + index+'z', ' msgG.id:', msgG.id, ' message=', bgMessage);
    console.log('bg AA2 processMessageDetails index zz' + index+'z', ' isConsistent  :', isConsistant(bgMessage));
    console.log('bg AA3 zz' + index + "z  " + msgG.id);
    // build prompt
    if (isConsistant(bgMessage)) {
      console.log('bg C processMessageDetails message is consistant id=', bgMessage.id, "message:", bgMessage);
      if (index !== -1) {
        this.getMessages()[index] = bgMessage;
      } 
      console.log('bg AA1bis processMessageDetails index zz' + index+'z', ' msgG.id:', msgG.id, ' messag[index]=', this.messages2[index]  );
    
     } else {
      console.error('bg C bg Message non consistent, skipping Gemini analysis id=', bgMessage, "  zz" + index);
      return;
    }
    console.log('bg AA4 zz' + index + "z  " + msgG.id);
    this.processMessageDetailsByGemini2(bgMessage);
    console.log('bg AA5 zz' + index + "z  " + msgG.id);
   
  }

  processMessageDetailsByGemini2(bgMessage: BgMail): any {
    const prompt = this.buildGeminiPrompt(bgMessage.from, bgMessage.subject || '', bgMessage.snippet, bgMessage.bodyTxt || '');
    // console.log('processMessageDetails prompt:', prompt);

    ///
    this.gemini.generateContent(prompt, reponseAnalyseGmail).subscribe({
      next: (res: { geminiData: { error: any; usageMetadata: any; candidates: any[]; }; }) => {
        console.log('responseRequestGemini msg A res:', res);
        console.log(
          'bg responseRequestGemini msg B' + bgMessage.id + ' geminiData:',
          res.geminiData
        );
        this.updatable?.updateView();
        if (res.geminiData.error) {
          console.error('Erreur Gemini pour le message id=' + bgMessage.id + ' :', res.geminiData.error);

          return;
        }
        console.log('candidates:::', res.geminiData.usageMetadata, "  metaData2 :::", res.geminiData.usageMetadata);
        const objMetaData = res.geminiData.usageMetadata;
        console.log('metaData:::', objMetaData);
        const metaData = new GeminiUsageMetaData();
        metaData.totalTokenCount = objMetaData.totalTokenCount;
        metaData.promptTokenCount = objMetaData.promptTokenCount;
        metaData.candidatesTokenCount = objMetaData.candidatesTokenCount;
        console.log('metaData:::', metaData);
        const candidat = res.geminiData.candidates[0];

        console.log('candidat:::', candidat);
        const content = candidat.content;
        console.log('content::: ', content);
        const parts = content.parts;
        const part0 = parts[0];
        console.log('content.part0', part0);
        const textRetour = part0.text;
        console.log('content.part0.text: ', textRetour);
        const geminiResponse: GeminiResponse = JSON.parse(textRetour);


        // this.messages.push(messageBgMail);
        // mettre à jour la liste des messages avec la réponse Gemini

        bgMessage.geminiResponse = geminiResponse;
        bgMessage.geminiMetaData = metaData;
        console.log('bg14 obj message : ', bgMessage);

        if (bgMessage.labels && !bgMessage.labels.includes(this.gmail.labelAlreadyProcessed)) {
          geminiResponse.labels?.forEach(label2 => {
            this.gmail.affectLabelToMessage2(bgMessage.id, label2)
          });

          this.gmail.affectLabelToMessage2(bgMessage.id, this.gmail.labelAlreadyProcessed)
        }
        //t
      },
      error: (err: { message: any; error: { error: { message: any; }; }; }) => {
        console.log('responseRequest', err);
        console.log('errA', err);
        console.log('err.message', err.message);
        console.log('err.error', err.error);
        console.log('err.error.error', err.error?.error);
        console.log('err.error.error.message', err.error?.error?.message);

      },
    });

    ///
  }
  updateLabelsFromLabelIds(message: BgMail) {
    console.log('bg5 updateLabelsFromLabelIds called for message id :', message.id);
    console.log('bg5 updateLabelsFromLabelIds called for message labelIds :', message.labelIds);
    console.log('bg5 updateLabelsFromLabelIds called  labels :', this.gmail.getLabels());
    this.gmail.getLabelsPromise().then((labels) => {
      const labelNames = message.labelIds?.map((id) => {
        const label = labels.find((l: any) => l.id === id);
        const labelName = getLabelName(label);
        return labelName;
      }).filter((name: string | null) => name !== null) as string[];
      message.labels = labelNames;
    });
  }

  updateLabelsFromLabelIds2(message: BgMail, labelsGmail: GmailLabel[]) {
    const labelNames = message.labelIds?.map((id) => {
      const label = labelsGmail.find((l: any) => l.id === id);

      const labelName = getLabelName(label);
      return labelName;
    }).filter((name: string | null) => name !== null) as string[];
    message.labels = labelNames;
  }


  createLabel(labelString: string) {
    console.log('createLabel called');

    this.gmail.createLabel(labelString)
      .then((label) => {
        console.log('bg create Label :' + " label created:", label);
      })
      .catch((err) => console.error('bg create Label :' + "  err:", err));
  }

  getLabelsGmail() {
    console.log('processLabelToMessages called', this.gmail.getLabels());


  };

  processLabelToMessage(message: BgMail) {
    console.log('processLabelToMessage idMessage:', message);
    const label = message.labels && message.labels.length > 0 ? message.labels[0] : '';

  }



  // helpers
  private extractHeader(msg: any, name: string): string | null {
    const headers = msg.payload?.headers || [];
    const h = headers.find(
      (hh: any) => hh.name?.toLowerCase() === name.toLowerCase()
    );
    return h ? h.value : null;
  }


  private getPlainTextFromMessage(msg: any, maxLen = 2000): string {
    // try to extract text/plain parts, fallback to stripping HTML
    const payload = msg.payload;
    let text = '';

    const traverse = (part: any) => {
      if (!part) return;
      if (part.mimeType === 'text/plain' && part.body?.data) {
        text += this.decodeBase64Url(part.body.data) + '\n';
      } else if (part.mimeType === 'text/html' && part.body?.data && !text) {
        const html = this.decodeBase64Url(part.body.data);
        text += this.stripHtml(html) + '\n';
      } else if (part.parts && part.parts.length) {
        part.parts.forEach((p: any) => traverse(p));
      }
    };
    traverse(payload);
    return text ? text.slice(0, maxLen) : '';
  }

   private getHtmlFromMessage(msg: any, maxLen = 8000): string {
    // try to extract text/plain parts, fallback to stripping HTML
    const payload = msg.payload;
    let text = '';

    const traverse = (part: any) => {
      if (!part) return;
      if (part.mimeType === '' && part.body?.data) {
        text += this.decodeBase64Url(part.body.data) + '\n';
      } else if (part.mimeType === 'text/html' && part.body?.data && !text) {
        const html = this.decodeBase64Url(part.body.data);
        text += html + '\n';
      } else if (part.parts && part.parts.length) {
        part.parts.forEach((p: any) => traverse(p));
      }
    };
    traverse(payload);
    if (maxLen < 0) {
      return text;
    } 
    return text ? text.slice(0, maxLen) : '';
  }


  private decodeBase64Url(b64: string): string {
    // Gmail uses base64url
    const fixed = b64.replace(/-/g, '+').replace(/_/g, '/');
    try {
      return decodeURIComponent(escape(window.atob(fixed)));
    } catch {
      return window.atob(fixed);
    }
  }

  getLabelNames(labelId: string[]): string {
    const label = this.gmail.labelsGmail.find(label => labelId.includes(label.id));
    return label ? label.name : '';
  }

  private stripHtml(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }

  private buildGeminiPrompt(from: string | undefined, subject: string, snippet: string | undefined, body: string) {
    const template = `
Tu es un extracteur d'offres d'emploi. Réponds uniquement par du JSON strict conforme au schema fourni.
Message:
From: ${from} 
Subject: ${subject}
Snippet: ${snippet}
Body:
${body}
`;
    return template;
  }

  loadMessagesToday() {
    const now = new Date();
    // début de la journée locale
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0
    );
    // début du jour suivant
    const startOfNextDay = new Date(startOfDay);
    startOfNextDay.setDate(startOfNextDay.getDate() + 1);

    const startSeconds = Math.floor(startOfDay.getTime() / 1000);
    const endSeconds = Math.floor(startOfNextDay.getTime() / 1000);

    const q = `after:${startSeconds} before:${endSeconds}`;

    // demande au service en lui passant la query
    this.gmail
      .listMessages(100, q)
      .then((res) => {
        const msgs = res.messages || [];
        msgs.forEach((m: any) => {
          const msg = new BgMail(m.id);
          this.mergeMessage(msg);
        });
      })
      .catch((err) => console.error(err));

    return this.messages2;
  }



  mergeMessage(msgG0: BgMail): void {
    const index = this.getMessages().findIndex((m) => m.id === msgG0.id);   
    if (index !== -1) {
       const msgG1 = this.getMessages()[index] ;
       msgG1.merge(msgG0);
    } else {
      this.getMessages().push(msgG0);
    }   
  }
}

  







export const reponseAnalyseGmail = {
  type: 'object',
  properties: {

    company: {
      type: 'string',
      maxLength: 80,
      description: 'nom de la société',
    },
    position: {
      type: 'string',
      maxLength: 80,
      description: 'intitulé du poste',
    },
    salary: { type: 'string', maxLength: 80, description: 'salaire proposé' },
    location: { type: 'string', maxLength: 80, description: 'lieu du poste' },
    contact: {
      type: 'string',
      description: 'personne à contacter',
    },
    applyLink: {
      type: 'string',
      maxLength: 200,
      description: 'lien pour postuler',
    },
    offerDate: {
      type: 'string',
      format: 'date-time',
      description: "date de l'offre",
    },
    extraNotes: {
      type: 'string',
      maxLength: 300,
      description: 'notes supplémentaires',
    },
    confidence: {
      type: 'number',
      description: "niveau de confiance de l'analyse (0 à 1)",
    },
    nbOffresEmplois: {
      type: 'number',
      description: "nombre d'offres d'emplois détectées dans le mail (0 si aucune)",
    },
    // Nouveau champ "label" : une seule valeur choisie parmi une énumération de labels
    labels: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'jobOffer',       // une seule offre d'emploi
          'jobOffers',      // plusieurs offres listées dans le même mail
          'advertisement',  // publicité / promo
          'contactRequest', // prise de contact / demande de contact
          'bank',           // communication bancaire (ex: relevé, alerte)
          'newsletter',     // newsletter non personnelle
          'invoice',        // facture
          'meeting',        // invitation / réunion
          'other'           // autre / indéterminé
        ],
      },
      description:
        "Catégories du mail. Utiliser un tableau de valeurs parmi l'énumération (jobOffer, jobOffers, advertisement, contactRequest, bank, newsletter, invoice, meeting, other).",
      minItems: 1

    },

  },
  required: ['nbOffresEmplois', 'labels', 'confidence'],
};

function isLabelShowable(label: GmailLabel | undefined) {
  if (!label) {
    return false;
  }
  if (label.id.startsWith('CATEGORY_')) {
    return true;
  } else if (label.type === 'system') {
    return false
  }
  return true;
}

function getLabelName(label: GmailLabel | undefined): string | null {
  if (!isLabelShowable(label)) {
    return null;
  }
  if (!label) {
    return null;
  }
  if (label.id === 'INBOX' || label.id === 'UNREAD') {
    return null;
  }
  if (label.id.startsWith('CATEGORY_')) {
    const name = label.name.replace('CATEGORY_', '').toLowerCase();
    return name;
  }
  const labelName = label.name;
  if (labelName) {
    if (labelName === "processedByGemini") {
      return null;
    }
  }
  return label.name;
}


function isConsistant(bgMessage: BgMail): any {
  // Vérifie que les champs essentiels sont présents
  if (!bgMessage) {
    return false;
  }
  if (!bgMessage.from) {
    return false;
  }
  if (!bgMessage.subject && !bgMessage.bodyTxt) {
    return false;
  }
  return true;
}

