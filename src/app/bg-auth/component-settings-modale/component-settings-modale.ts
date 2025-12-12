import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BgAuthService } from '../bg-auth-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { BgBackFunctions } from '../bg-back-functions';
import {baseUrl0} from '../bg-auth-environment';

@Component({
  selector: 'app-component-connexion-modale',
  imports: [CommonModule, FormsModule],
  templateUrl: './component-settings-modale.html',
  styleUrls: ['./component-settings-modale.css'],
})
export class ComponentSettingsModale {
  email = '';
  stripeIdClient = 'No StripeIdClien';
  stripeIdSession= 'No IdSession';
  stripeIdSubscription= 'No IdSubscription';
  dateFinAbonnement= 'No DateFinAbonnement';

  priceIdStripeOneTime = {
    id: 'price_1SBWfpI256EUPY44i7gmazbu',
    mode: 'payment',
  };
  priceIdStripeAbonnement = {
    id: 'price_1SC2ZiI256EUPY44UFeNCj8x',
    mode: 'subscription',
  };


  constructor(
    public dialogRef: MatDialogRef<ComponentSettingsModale>,
    public bgAuth: BgAuthService,
    private http: HttpClient,
    private changeDetectorRef: ChangeDetectorRef,
    private bgBackFunctions: BgBackFunctions

  ) {
    console.log('ComponentSettingsModale constructor bgAuth :', this.bgAuth);

  }

  isAbonnementActif(){
    return this.bgAuth.bg_stripe.isSubscriptionActif();
  }

  ngOnInit(): void {
    this.email = this.bgAuth.currentUser()?.email || '';
    this.stripeIdClient = this.bgAuth.bg_stripe.stripeCustomer?.id || 'No StripeIdClient';
    this.stripeIdSession = this.bgAuth.bg_stripe.stripeSession?.id || 'No IdSession';
    this.stripeIdSubscription = this.bgAuth.bg_stripe.stripeSubscription?.id || 'No IdSubscription';
    this.bgBackFunctions.updateHost();
    if (this.bgAuth.bg_stripe.stripeSubscription?.ended_at){
      this.dateFinAbonnement = new Date(this.bgAuth.bg_stripe.stripeSubscription.ended_at * 1000).toLocaleString();

    }
  }
  onLogout() {
    console.log('B Tentative de logout avec auth :', this.bgAuth) ;
    this.bgAuth.logout();
    this.onClose();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  abonnement() {
    console.log('abonnement request');
    this.getStripePaymentLink();
  }

  getStripeCustomerId() {
    return this.bgAuth.bg_stripe.stripeCustomer?.id;
  }

  getStripePaymentLink() {
    if (this.getStripeCustomerId()) {
      this.getStripePaymentLink2();
    } else {
      console.log('Aucun client Stripe rencontré pour cet utilisateur.');
      this.bgAuth.bg_stripe.searchStripeCustomerOrCreate(this.getStripePaymentLink2.bind(this));
    }
  }
  getStripePaymentLink2() {
    const priceIdStripe = this.priceIdStripeAbonnement;
    console.log('getStripePaymentLink pour le priceIdStripe :', priceIdStripe);
    const currentHost = window.location.origin;

    if (!priceIdStripe?.id || !priceIdStripe?.mode || !this.getStripeCustomerId()  || !this.bgAuth.getEmail()) {
      console.error('Paramètre manquant pour Stripe ! email :', this.bgAuth.getEmail());
      console.error('Paramètre manquant pour Stripe ! priceIdStripe :', priceIdStripe);
      console.error('Paramètre manquant pour Stripe ! stripeCustomerId :',  this.getStripeCustomerId());
    return;
  }
    const params = new URLSearchParams({
      email: this.bgAuth.getEmail() ?? '',
      priceIdStripe: priceIdStripe.id,
      mode: priceIdStripe.mode,
      clientIdStripe: this.getStripeCustomerId() ?? '',
      succesUrl: `${currentHost}/merci`,
      cancelUrl: `${currentHost}/cancelStripe`,
    });
    console.log('Appel de la fonction cloud bgstripegetpaymentlink avec :', params.toString());
    const url0 = `${baseUrl0}/bgstripegetpaymentlink2?${params.toString()}`;
    console.log('URL complète:', url0);
    this.http.get<any>(url0, {}).subscribe({
      next: (res) => {
        console.log('Response from bgstripegetpaymentlink:', res);
        const url = res.url;
        console.log('url:', url);
        // window.open(url, '_self');
        if (url){
          window.location.href = url;
        }
        else {
          console.error('Pas de lien de paiement reçu de Stripe !');
          if (res.error) {
            const message = res.error.message;
            console.error('Message d\'erreur Stripe:', message);
            console.error('Erreur Stripe:', res.error);
          }
        }

      },
      error: (err) => {
        console.error('Erreur from bgstripegetpaymentlink:', err);
      },
    });
  }


  desabonnement() {
    console.log('desabonnement request');
     const stripeCustomerId = this.getStripeCustomerId();
   if (!stripeCustomerId) {
     console.log('Aucun client Stripe rencontré pour cet utilisateur.');
     this.bgAuth.bg_stripe.searchStripeCustomerOrCreate(this.resilierAbonnement2.bind(this));
   } else {
     this.resilierAbonnement2(stripeCustomerId);
   }
  }
  resilierAbonnement2(stripeCustomerId: string) {
    console.log('resilierAbonnement2 pour le stripeCustomerId :', stripeCustomerId);
    this.http
      .post<any>(
        `${baseUrl0}/bgstripegetsession2`,
        {
        clientId: stripeCustomerId ,
        urlRetour: window.location.origin + "/moncomptebg"
      }
      )
      .subscribe({
        next: (res) => {
          console.log('Response from bgstripesubscriptionresilience2:', res);
          const url = res.url;
          console.log('url:', url);
          if (url) {
            window.location.href = url;
          }
        },
        error: (err) => {
          console.error('Erreur from bgstripesubscriptionresilience2:', err);
        },
      });
  }





}
