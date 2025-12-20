import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { onChangeEmailSelected } from '../services/UpDatable';
import { BgMail, Email } from '../modeles/BgMail';
import { GisGmailServiceHelper } from '../services/gis-gmail.service.helper';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ComponentEmailResponse } from '../component-email-response/component-email-response';  
import DOMPurify from 'dompurify';

@Component({
  selector: 'email-detail',
  imports: [ComponentEmailResponse, CommonModule],
  templateUrl: './component-email-detail.html',
  styleUrl: './component-email-detail.scss',
})
export class ComponentEmailDetail implements onChangeEmailSelected {


  selectedEmail: BgMail | null = null;
  showHtml: boolean = true;
  showReponse :boolean=false;

  constructor(private gmailHelper: GisGmailServiceHelper, public changeDetectorRef: ChangeDetectorRef) { }

  toggleBodyDisplay(): void {
    this.showHtml = !this.showHtml;
  }

  ngOnInit(): void {
    this.gmailHelper.addListenerOnChangeEmailSelected(this);
    this.selectedEmail= this.gmailHelper.selectedEmail;
  }
  onChangeEmailSelected(email: BgMail): void {
    console.log('bg Email sélectionné dans le détail :', email);
    this.selectedEmail = email;
    this.changeDetectorRef.detectChanges();
  }

  analyzeEmailWithGemini(bgMail: BgMail) {
    console.log('Method not implemented.');
    this.gmailHelper.processMessageDetailsByGemini2(bgMail);
  }

  getSanitizedBodyHtml(): SafeHtml | null {
    if (this.selectedEmail && this.selectedEmail.getBodyHtml()) {
      const dirty = this.selectedEmail.getBodyHtml() || '';
      const clean = DOMPurify.sanitize(dirty);
      return clean;
    }
    return null;
  }

  debug() {
    console.log('Debug info : selectedEmail :',this.selectedEmail);
    console.log('Debug info : gmailHelper :',this.gmailHelper);
    console.log('Debug info : gmailHelper.selectedEmail :',this.gmailHelper.selectedEmail);
  }

  repondre(email: BgMail) {
    console.log('Répondre à l\'email :', email);
   // this.gmailHelper.createReplyDraft(email);
    this.showReponse=true;
  } 

}    
