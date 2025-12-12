import { Injectable } from '@angular/core';
/**
 * Service providing backend function URLs and versioning.
 * Pour lancer l'emulateur local: >bg build && firebase emulators:start --only functions
 * Pour déployer les fonctions: > bg build && firebase deploy --only functions
 *
 */
@Injectable({
  providedIn: 'root'
})
export class BgBackFunctions {

   baseUrl0 =  'https://europe-west1-job4you-78ed0.cloudfunctions.net/';
  public host = this.baseUrl0;

  updateHost() {
    this.host = this.getUrlHost();
  }
   

  getUrlHost():string {
    if ((window.location.hostname === '127.0.0.1') || (window.location.hostname === 'localhost')) {
      return this.baseUrl0;
    }
    return this.baseUrl0;
  }


  getVerion():string {
    return '2';
  }

}

