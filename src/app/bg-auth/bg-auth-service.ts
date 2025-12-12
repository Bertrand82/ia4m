
import { HttpClient } from '@angular/common/http';
import {  Injectable, signal } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  sendPasswordResetEmail,
} from '@angular/fire/auth';
import { BgStripeService } from './bg-stripe-service';

@Injectable({ providedIn: 'root' })
export class BgAuthService {

   private userSignal = signal<User | null>(null);


 constructor(public auth: Auth, private http: HttpClient, public bg_stripe: BgStripeService) {
   onAuthStateChanged(this.auth, (user) => {
      this.userSignal.set(user);
    });
 }

 get currentUser() {
    return this.userSignal.asReadonly();
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    console.log('login Tentative de connexion avec email :', email);
    return signInWithEmailAndPassword(this.auth, email, password);

  }

  logout() {

    this.bg_stripe.stripeCustomer = null;
    this.bg_stripe.stripeSession = null;
    this.bg_stripe.stripeSubscription = null
    this.bg_stripe.saveStripeCustomerInLocal();
    this.bg_stripe.saveStripeSessionInLocal();
    this.bg_stripe.saveStripeSubscriptionInLocal();
    return signOut(this.auth);
  }

   getEmail() {
    if (this.currentUser() !== null) {
      return this.currentUser()?.email;
    } else {
      return 'No name';
    }
}

  sendPasswordResetEmail2(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  loginWithGoogle() {
    const provider = new GoogleAuthProvider();

    signInWithPopup(this.auth, provider)
      .then((result) => {
        // L'utilisateur est connecté
        const user = result.user;
        console.log('Connecté :', user.email);
        this.bg_stripe.searchStripeCustomerOrCreate0(user.email);
      })
      .catch((error) => {
        console.error('loginWithGoogle Erreur lors de la connexion :', error);
        window.alert(error.message);
      });
  }


}