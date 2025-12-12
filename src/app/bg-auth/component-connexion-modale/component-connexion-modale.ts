import { BgAuthService } from '../bg-auth-service';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-component-connexion-modale',
  imports: [CommonModule, FormsModule],
  templateUrl: './component-connexion-modale.html',
  styleUrl: './component-connexion-modale.css',
})
export class ComponentConnexionModale {
  email = '';
  password = '';

  constructor(
    public dialogRef: MatDialogRef<ComponentConnexionModale>,
    public auth: BgAuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onLogin() {
    console.log('A Tentative de connexion avec email :', this.email);
    console.log('B Tentative de connexion avec auth :', this.auth);

    this.auth.login(this.email, this.password).then(() => {
      // Login réussi, on appelle Stripe
      this.auth.bg_stripe.searchStripeCustomerOrCreate0(this.email);
      this.onClose();
    })
    .catch((err) => {
      console.log('C Erreur Auth err:', err);
      window.alert(err.message);
    });
    this.onClose();
  }

  onRegister() {
    this.auth.register(this.email, this.password)
    .then(()=>{
      this.auth.bg_stripe.searchStripeCustomerOrCreate0(this.email);
      this.onClose();
    })
    .catch((err) => {
      console.log('C Erreur Auth err:', err);
      window.alert(err.message);
    });
    this.onClose();
  }

  onPasswordReset() {
    console.log('A Tentative de reset password avec email :', this.email);
    const obj: Promise<any> = this.auth
      .sendPasswordResetEmail2(this.email)
      .catch((err) => {
        console.log('C Erreur Auth err:', err);
        window.alert(err.message);
      });
    console.log('B Objet de reset password:', obj);
    obj.then((res) => {
      console.log('D Réponse de reset password: res', res);
      console.log('E mail de reset password: ', this.email);
      window.alert('Email de réinitialisation envoyé à ' + this.email);
    });
    this.onClose();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onLoginWithGoogle(): void {
    this.auth.loginWithGoogle();
    this.onClose();
  }
}
