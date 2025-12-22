import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BgMail } from '../modeles/BgMail';
import { GisGmailServiceHelper } from '../services/gis-gmail.service.helper';
import { FormsModule } from '@angular/forms';
import { GisGmailServiceHelperSender } from '../services/gis-gmail.service.helper.sender';
import { BgGemini } from '../services/bg-gemini';
import { BgAuthService } from '../bg-auth/bg-auth-service copy';

@Component({
  selector: 'email-response',
  imports: [FormsModule, CommonModule],
  templateUrl: './component-email-response.html',
  styleUrl: './component-email-response.scss',
})
export class ComponentEmailResponse {


  @Input() selectedEmail: BgMail | null = null;
  role: string = 'Office manager'; // assistante de direction,  ami, secretaire, expert, chercheur emploi, commercial Par défaut, le rôle est 'ami'
  lengthResponse: number = 100; // Longueur par défaut de la réponse
  mySignature: string = "";
  flagGeneratingResponse: boolean = false;
  flagGeneratedResponse: boolean = false;
  generatedResponse: geminiResponseEmail | null = null;
  replyBoolean: boolean = true;

  constructor(public gmailSender: GisGmailServiceHelperSender, private gmailHelper: GisGmailServiceHelper, public changeDetectorRef: ChangeDetectorRef, private gemini: BgGemini) { }

  ngOnInit(): void {
    this.mySignature = this.getMySignature();
  }
  generateEmailResponse() {
    console.log(`Génération de la réponse email avec le rôle: ${this.role} et la longueur: ${this.lengthResponse}`);
    const prompt = this.getPrompt();
    console.log('Prompt généré :', prompt);

    this.gemini.generateContent(prompt, reponseGenerationMessage).subscribe({
      next: (res: { geminiData: { error: any; usageMetadata: any; candidates: any[]; }; }) => {
        console.log('Réponse Gemini reçue :', res);
        const payload = extractPayLoad(res);
        this.flagGeneratingResponse = false;
        if (payload) {
          console.log('Payload extrait :', payload);
          this.flagGeneratedResponse = true;
          this.generatedResponse = payload as geminiResponseEmail;
          this.changeDetectorRef.detectChanges();
          this.replyBoolean = this.generatedResponse.responseAdviceLevel !== 'No_Reply';
        }

      }
    })

  }
  getPrompt(): string {
    const prompt = "You have the role of \"" + this.role + "\", write an email response to the following email:\n\n" +
      " with the signature: " + this.mySignature + "\n" +
      " with the labels: " + (this.selectedEmail && this.selectedEmail.labels ? this.selectedEmail.labels.join(', ') : 'No labels') + "\n" +
      " No Reply if it is a NewsLetter " + " \n\n" +
      " from: " + (this.selectedEmail ? this.selectedEmail.from : 'Unknown sender') + "\n  Subject: " + (this.selectedEmail ? this.selectedEmail.subject : 'No subject') + "\n\n  Email content:\n" +
      (this.selectedEmail ? this.selectedEmail.bodyTxt : 'No email selected.');
    return prompt;
  }

  getMySignature(): string {
    const mailDest = this.selectedEmail?.to;
    console.log('bg mailDest :', mailDest);
    const signature = "" + mailDest;
    return this.extrairePrenom(signature);
  }

  extrairePrenom(chaine: string): string {
    // Regex pour capturer le prénom (premier mot avant l'email)
    const str = chaine.replaceAll('<', ' ').replaceAll('>', ' ').replaceAll('.', ' ').replaceAll('_', ' ').replaceAll('.', ' ').trim();
    console.log('bg mail str :', str);
    const signature = str.split(' ')[0];
    return signature;
  }



}



export const reponseGenerationMessage = {
  type: 'object',
  properties: {
    responseAdviceLevel: {
      type: 'string',
      enum: ['No_Reply', 'Reply_Appreciated', 'Reply_Optional', 'Reply_Required'],
      description: 'Level of response needed for this email',
    },

    responseShort: {
      type: 'string',
      description: 'Short response to the email',
    },
    responseLong: {
      type: 'string',
      description: 'Long response to the email',
    },
    advice: {
      type: 'string',
      description: 'Advice from Gemini on this email',
    },
    confidence: {
      type: 'number',
      description: 'Confidence level of the email classification between 0 (no confidence) and 1 (full confidence)',
    },
  },
  required: ['responseAdviceLevel', 'responseShort', 'responseLong', 'confidence'],
};

interface geminiResponseEmail {
  responseAdviceLevel: 'No_Reply' | 'Reply_Appreciated' | 'Reply_Optional' | 'Reply_Required';
  responseShort: string;
  responseLong: string;
  advice?: string;
  confidence: number;
  role: string;

}

function extractPayLoad(resGemini: any): object | null {
  if (resGemini.geminiData.error) {
    console.error('Erreur de Gemini :', resGemini.geminiData.error);
    return null;

  } else if (resGemini.geminiData.candidates && resGemini.geminiData.candidates.length > 0) {
    const content = resGemini.geminiData.candidates[0].content;
    console.log('content :', content);
    console.log('content.role :', content.role);
    console.log("content.text :", content.parts[0]);
    console.log("content.text :", content.parts[0].text);
    const parsedObject = JSON.parse(content.parts[0].text);
    console.log("content.text :", parsedObject);
    const payload = parsedObject;
    payload.role = content.role;

    return payload;
  } else {

    console.warn('Aucun candidat trouvé dans la réponse de Gemini.');
    return null;
  }

} 
