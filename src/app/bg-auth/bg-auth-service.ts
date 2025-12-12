
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
baseUrl0 =
      'https://europe-west1-job4you-78ed0.cloudfunctions.net/';

 constructor(public auth: Auth, private http: HttpClient, bg_stripe: BgStripeService) {
   onAuthStateChanged(this.auth, (user) => {
      this.userSignal.set(user);
    });
 }

}