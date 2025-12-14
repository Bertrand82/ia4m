import { ChangeDetectorRef, Component } from '@angular/core';
import { onChangeEmailSelected } from '../services/UpDatable';
import { BgMail, Email } from '../modeles/BgMail';
import { GisGmailServiceHelper } from '../services/gis-gmail.service.helper';

@Component({
  selector: 'email-detail',
  imports: [],
  templateUrl: './component-email-detail.html',
  styleUrl: './component-email-detail.scss',
})
export class ComponentEmailDetail implements onChangeEmailSelected{
  
  selectedEmail: BgMail | null = null;
  
  constructor(private gmailHelper: GisGmailServiceHelper,public changeDetectorRef: ChangeDetectorRef) {}
  
  ngOnInit():void {
    this.gmailHelper.addListenerOnChangeEmailSelected(this);
  }
  onChangeEmailSelected(email: BgMail): void {
    console.log('bg Email sélectionné dans le détail :', email);
    this.selectedEmail = email;
    this.changeDetectorRef.detectChanges();
  }

}
