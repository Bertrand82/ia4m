import { ChangeDetectorRef, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BgAuth } from '../bg-auth/bg-auth';
import { GisGmailServiceHelper } from '../services/gis-gmail.service.helper';
import { BgMail, Email } from '../modeles/BgMail';
import { Updatable } from '../services/UpDatable';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'list-email',
  standalone: true,
  imports: [CommonModule, FormsModule], // nécessaire pour *ngFor et *ngIf
  templateUrl: './component-list-email.html',
  styleUrls: ['./component-list-email.scss'],
})
export class ComponentListEmail implements Updatable {
markSelectedEmailsAsUnRead() {
throw new Error('Method not implemented.');
}
markSelectedEmailsAsRead() {
throw new Error('Method not implemented.');
}
markSelectedEmailsAsDeleted() {
    console.log('Marquer les emails sélectionnés comme supprimés...');
    const selectedEmails = this.getEmails().filter(email => email.checked);   
    selectedEmails.forEach(email => {
      this.gmailHelper.markAsDeleted(email);
    }
    );
}


  @ViewChild('bgCheckBoxGeneral') checkboxRef!: ElementRef;

  emails: Email[] = [];

  checkboxState: 'checked' | 'unchecked' | 'indeterminate' = 'indeterminate';
  constructor(private gmailHelper: GisGmailServiceHelper, private changeDetectorRef: ChangeDetectorRef) { }


  ngOnInit(): void {
    
  }

  ngAfterViewInit(): void {
    this.updateCheckboxGeneralState();
  }

  updateView(): void {
    this.changeDetectorRef.detectChanges();
  }

  updateCheckboxGeneralState() {
    const checkbox = this.checkboxRef.nativeElement;
       
    switch (this.checkboxState) {
      case 'checked':
        checkbox.checked = true;
        checkbox.indeterminate = false;
         this.setListMessageState(checkbox.checked)
        break;
      case 'unchecked':
        checkbox.checked = false;
        checkbox.indeterminate = false;
        this.setListMessageState(checkbox.checked)
        break;
      case 'indeterminate':
        checkbox.checked = false;
        checkbox.indeterminate = true;
        break;
    }
    console.log('Updating checkbox state to:', this.checkboxState, 'indeterminate ', checkbox.indeterminate);

  }
  setListMessageState(checked: boolean) {
   this.getEmails().forEach((email) => {
      email.checked = checked;
    });
  }

  setCheckBoxGeneralStateIndeterminate() {
    this.setCheckBoxGeneralState('indeterminate');
  } 

  setCheckBoxGeneralState(state: 'checked' | 'unchecked' | 'indeterminate') {
    this.checkboxState = state;
    this.updateCheckboxGeneralState();
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
    this.gmailHelper.processMessagesToDay(this);
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