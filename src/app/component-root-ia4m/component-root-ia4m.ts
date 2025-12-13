import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BgAuth } from '../bg-auth/bg-auth';

interface Email {
  id: number;
  from: string;
  fromInitial: string;
  time: string;
  subject: string;
  snippet: string;
  body: string;
  read: boolean;
}

@Component({
  selector: 'Ia4m',
  standalone: true,
  imports: [CommonModule, BgAuth], // nécessaire pour *ngFor et *ngIf
  templateUrl: './component-root-ia4m.html',
  styleUrls: ['./component-root-ia4m.scss'],
})
export class Ia4m {

  emails: Email[] = [
    {
      id: 1,
      from: 'Alice Martin',
      fromInitial: 'A',
      time: '09:12',
      subject: 'Réunion projet — points à valider',
      snippet: "Salut, peux-tu confirmer les éléments discutés hier ? J'ai joint l'agenda...",
      body: "Salut,\n\nPeux-tu confirmer les éléments discutés hier ? J'ai joint l'agenda et les actions. Merci !\n\n— Alice",
      read: false
    },
    {
      id: 2,
      from: 'Newsletter IA',
      fromInitial: 'N',
      time: 'Hier',
      subject: '10 nouvelles techniques pour améliorer vos modèles',
      snippet: "Découvrez des approches récentes pour optimiser le fine-tuning et la généralisation...",
      body: "Bonjour,\n\nVoici notre sélection des 10 techniques à connaître pour 2025...\n\nCordialement,\nL'équipe",
      read: true
    },
    {
      id: 3,
      from: 'Service client',
      fromInitial: 'S',
      time: '2 Dec',
      subject: 'Votre commande a été expédiée',
      snippet: "Bonjour, votre commande #12345 est en route. Suivi et détails dans le lien ci-dessous...",
      body: "Bonjour,\n\nVotre commande #12345 a été expédiée. Suivi : ...\n\nMerci pour votre achat.",
      read: true
    }
  ];

  selectedEmail: Email | null = null;

  select(email: Email) {
    this.selectedEmail = email;
    // Marquer comme lu pour l'exemple
    email.read = true;
  }

  debug() {
    console.log('Debug info :');
  }
}