import { Component } from '@angular/core';
import { BgAuthService } from './bg-auth-service';
import { MatDialog } from '@angular/material/dialog';
import { ComponentConnexionModale } from './component-connexion-modale/component-connexion-modale';
import { CommonModule } from '@angular/common';
import { ComponentSettingsModale } from './component-settings-modale/component-settings-modale';

@Component({
  selector: 'app-bg-auth',
  imports: [CommonModule],
  templateUrl: './bg-auth.html',
  styleUrl: './bg-auth.scss',
})
export class BgAuth {
  constructor(public authservice  : BgAuthService, private dialog: MatDialog) {}

  onSettings() {
    console.log('Ouverture des paramètres utilisateur');
    this.dialog.open(ComponentSettingsModale, {
      data: 'bbb',
    });
  }

  onConnectionRequest() {
    console.log('Tentative de connexion  :');

    this.dialog.open(ComponentConnexionModale, {
      data: 'aaa',
    });
  }
}
