import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { BgMail } from '../modeles/BgMail';
import { GisGmailServiceHelper } from '../services/gis-gmail.service.helper';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'email-response',
  imports: [FormsModule],
  templateUrl: './component-email-response.html',
  styleUrl: './component-email-response.scss',
})
export class ComponentEmailResponse {

  @Input() selectedEmail: BgMail | null = null;
  role: string = 'ami'; // Par défaut, le rôle est 'ami'
  lengthResponse: number = 100; // Longueur par défaut de la réponse

  constructor(private gmailHelper: GisGmailServiceHelper, public changeDetectorRef: ChangeDetectorRef) { } 


}
