import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BgAuth } from '../bg-auth/bg-auth';
import { GisGmailServiceHelper } from '../services/gis-gmail.service.helper';
import { BgMail, Email } from '../modeles/BgMail';
import { Updatable } from '../services/UpDatable';
import { ComponentListEmail } from '../component-list-email/component-list-email';
import { ComponentEmailDetail } from '../component-email-detail/component-email-detail';  
import { GmailLabel } from '../services/gis-gmail.service';

@Component({
  selector: 'Ia4m',
  standalone: true,
  imports: [CommonModule, BgAuth, ComponentListEmail, ComponentEmailDetail], // nécessaire pour *ngFor et *ngIf
  templateUrl: './component-root-ia4m.html',
  styleUrls: ['./component-root-ia4m.scss'],
})
export class Ia4m implements Updatable {

  selectedEmail: BgMail | null = null;

  showDetail:boolean=false;
  constructor(public gmailHelper: GisGmailServiceHelper,private changeDetectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.gmailHelper.deselectEmail();
    this.processMessages();
    
  }
  
  updateView(): void {
   this.changeDetectorRef.detectChanges();
   if( this.gmailHelper.selectedEmail){
    this.showDetail=true;
   }else{
    this.showDetail=false;
   }  
  }

  select(email: BgMail) {
    console.log('Email sélectionné :', email);
    this.selectedEmail = email;
    // Marquer comme lu pour l'exemple
    email.read = true;
  }

  debug() {
    console.log('Debug info :');
    this.gmailHelper.deselectEmail();
    this.processMessages();
  }
 debug2() {
    console.log('Debug2 info listMessages :', this.gmailHelper.getMessages());
    console.log('Debug2 info showDetail :', this.showDetail);
    
  }
  processMessages() {
    console.log('Traitement des messages...');
    this.gmailHelper.processMessages(this);
  } 

  getEmails(): BgMail[] {
    return this.gmailHelper.getMessages();
  }

  getSelectedEmail(): Email | null {
    return this.gmailHelper.selectedEmail;
  }
  deselectEmail() {
    this.gmailHelper.deselectEmail();
  }

  showDetail_(){
    this.showDetail=true;
  }
  showList_(){
    this.showDetail=false;
  }

  getLabels(): GmailLabel[] {
    return this.gmailHelper.gmail.labelsGmail;
  }
}