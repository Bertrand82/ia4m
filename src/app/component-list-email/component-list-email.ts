import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BgAuth } from '../bg-auth/bg-auth';
import { GisGmailServiceHelper } from '../services/gis-gmail.service.helper';
import { BgMail, Email } from '../modeles/BgMail';
import { Updatable } from '../services/UpDatable';


@Component({
  selector: 'list-email',
  standalone: true,
  imports: [CommonModule], // nécessaire pour *ngFor et *ngIf
  templateUrl: './component-list-email.html',
  styleUrls: ['./component-list-email.scss'],
})
export class ComponentListEmail implements Updatable {




  emails: Email[] = [];


  constructor(private gmailHelper: GisGmailServiceHelper, private changeDetectorRef: ChangeDetectorRef) { }

  updateView(): void {
    this.changeDetectorRef.detectChanges();
  }

  select(email: BgMail) {
    console.log('bg Email sélectionned:', email);
    console.log('bg Email sélectionned gmailHelper :', this.gmailHelper);
    console.log('bg Email sélectionned gmail :', this.gmailHelper.gmail);
    this.gmailHelper.setSelectedMessage(email);
    // Marquer comme lu pour l'exemple
    email.read = true;
  }

  debug() {
    console.log('Debug info :');
    this.processMessages();
  }

  processMessages() {
    console.log('Traitement des messages...');
    this.gmailHelper.processMessages(this);
  }

  getEmails(): BgMail[] {
    return this.gmailHelper.getMessages();
  }

  getEmailSelected(): Email | null {
    return this.getSelectedEmail();
  }
  getSelectedEmail(): Email | null {
    return this.gmailHelper.selectedEmail;
  }
  getLabel(arg0: string[]): string {
    return this.gmailHelper.getLabelNames(arg0);
  }

}