import { ChangeDetectorRef, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom, from, Observable, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { environment_secret } from '../environments/environment_secret';
import { BgMail } from '../modeles/BgMail';
import { onLabelsDownloaded } from './UpDatable';
@Injectable({ providedIn: 'root' })
export class GisGmailService {
  
  private tokenClient: any = null;
  private accessToken: string | null = null;
  private tokenExpiryTs = 0; // timestamp en ms
  public isSignedIn$ = new BehaviorSubject<boolean>(false);

  private readonly SCOPES = environment.gmailScopes;
  private readonly CLIENT_ID = environment_secret.googleClientId;
  public  labelAlreadyProcessed="processedByGemini";
  public  labelAlreadyProcessedId="processedByGemini";
  labelsGmail: Array<GmailLabel> = [];

  constructor(private http: HttpClient) {
   
  }

  /** Initialise le token client GIS. */
  private initTokenClient() {
    if (!(window as any).google || !(window as any).google.accounts || !(window as any).google.accounts.oauth2) {
      console.warn('GIS client non chargé — assurez-vous d\'inclure https://accounts.google.com/gsi/client dans index.html');
      return;
    }
    console.log('bg00 Initialisation du token client GIS avec client ID=', this.CLIENT_ID);
    this.tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: this.CLIENT_ID,
      scope: this.SCOPES,
      // callback sera appelé lorsque requestAccessToken retourne un token (ou une erreur)
      callback: (resp: any) => {
        console.log('bg01 response de GIS token client:', resp);
        if (resp.error) {

          this.isSignedIn$.next(false);
          return;
        }
        this.accessToken = resp.access_token;
        // expires_in est en secondes
        this.tokenExpiryTs = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 0);
        this.isSignedIn$.next(true);
      }
    });
  }

  /** Démarre le flux d'authentification et récupère un access token.
   *  prompt peut être 'consent' pour forcer écran consentement la première fois,
   *  ou '' (vide) pour comportement silencieux si possible.
   */
  public signIn(prompt: '' | 'consent' = 'consent'): Promise<void> {
    console.log('bg10 login GIS requested with prompt=', prompt);
    console.log('bg10 login tokenClient=', this.tokenClient);
    if (!this.tokenClient) {
      console.log('bg11 Initialisation du token client GIS...');
      this.initTokenClient();
      if (!this.tokenClient) {
        console.log('bg12 token reject...');
        return Promise.reject(new Error('bg03 Google Identity Services non initialisé.'));
      }
    }

    return new Promise<void>((resolve, reject) => {
      try {
        console.log('bg13 promise  created ', this.tokenClient);
        this.tokenClient.callback = (resp: any) => {
          console.log('bg14 token client callback called with resp=', resp);
          if (resp.error) {
            this.isSignedIn$.next(false);
            reject(resp);
            return;
          }
          this.accessToken = resp.access_token;
          this.tokenExpiryTs = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 0);
          this.isSignedIn$.next(true);
          console.log('bg13 resolve called');
          resolve();
        };

        // demande d'Access Token : ouvrira le popup UI de Google si besoin
        this.tokenClient.requestAccessToken({ prompt });
      } catch (err) {
        reject(err);
      }
    });
  }

  /** Révoque le token côté serveur Google et nettoie l'état local */
  public async signOut(): Promise<void> {
    if (!this.accessToken) {
      this.clearState();
      return;
    }

    try {
      const url = 'https://oauth2.googleapis.com/revoke';
      const params = new HttpParams().set('token', this.accessToken);
      await this.http.post(url, params.toString(), {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
      }).toPromise();
    } catch (err) {
      // Même si la révocation échoue côté réseau, on nettoie l'état local
      console.warn('Révocation du token échouée', err);
    } finally {
      this.clearState();
    }
  }

  private clearState() {
    this.accessToken = null;
    this.tokenExpiryTs = 0;
    this.isSignedIn$.next(false);
  }

  /** Retourne un access token valide; si expiré, tente de rafraîchir via token client (silencieusement). */
  private ensureAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiryTs - 10000) {
      return Promise.resolve(this.accessToken);
    }

    if (!this.tokenClient) {
      this.initTokenClient();
      if (!this.tokenClient) {
        return Promise.reject(new Error('Token client non initialisé'));
      }
    }

    return new Promise<string>((resolve, reject) => {
      // callback temporaire pour récupérer le token rafraîchi
      this.tokenClient.callback = (resp: any) => {
        if (resp.error) {
          this.isSignedIn$.next(false);
          reject(resp);
          return;
        }
        this.accessToken = resp.access_token;
        this.tokenExpiryTs = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 0);
        this.isSignedIn$.next(true);
        resolve(this.accessToken as string);
      };

      try {
        // prompt vide => tentative silencieuse si Google a déjà autorisé
        this.tokenClient.requestAccessToken({ prompt: '' });
      } catch (err) {
        reject(err);
      }
    });
  }

  /** Helper pour ajouter header Authorization et faire GET */


  private async get<T>(url: string, params?: HttpParams): Promise<T> {
    const token = await this.ensureAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    const obs$ = this.http.get<T>(url, { headers, params }).pipe(
      // throwError now expects a factory: () => error
      catchError(err => throwError(() => err))
    );

    return firstValueFrom(obs$);
  }

  private async post<T>(url: string, body: any = {}, params?: HttpParams): Promise<T> {
    const token = await this.ensureAccessToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    const obs$ = this.http.post<T>(url, body, { headers, params }).pipe(
      // throwError now expects a factory: () => error
      catchError(err => throwError(() => err))
    );

    return firstValueFrom(obs$);
  }

  hasAlreadyBeProcessedByGemini(bgMail: BgMail) : boolean {
        console.log('bgA hasAlreadyBeProcessedByGemini bgMail.id:' + bgMail.id + " bgMail ", bgMail);
        console.log('bgA hasAlreadyBeProcessedByGemini bgMail.id:' + bgMail.id + " bgMail.labelIds= ", bgMail.labelIds);
        console.log('bgA hasAlreadyBeProcessedByGemini bgMail.id :' + bgMail.id + " labelAlreadyProcessedId= ", this.labelAlreadyProcessedId);
        if (!bgMail.labelIds) {  
           console.log('bgA hasAlreadyBeProcessedByGemini bgMail.id :' + bgMail.id + " bgMail.labelIds= ", bgMail.labelIds);
            return false;
        }
       
        return bgMail.labelIds.includes(this.labelAlreadyProcessedId);
  }
  // --- Gmail specific helpers ---

  /** Liste des messages (retourne uniquement les ids et threadId) */
  public async listMessages(maxResults = 20, q = ''): Promise<{ messages?: Array<{ id: string; threadId: string }>, resultSizeEstimate?: number }> {
    const params = new HttpParams()
      .set('maxResults', String(maxResults))
      .set('q', q || '');
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
    return this.get<{ messages?: Array<{ id: string; threadId: string }>, resultSizeEstimate?: number }>(url, params);
  }

  /** Récupère un message complet (format: 'full'|'metadata'|'minimal'|'raw') */
  public async getMessage(messageId: string, format: 'full' | 'metadata' | 'minimal' | 'raw' = 'full'): Promise<any> {
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}`;
    const params = new HttpParams().set('format', format);
    return this.get<any>(url, params);
  }

  /** Récupère le profil du compte (adresse email) */
  public async getProfile(): Promise<{ emailAddress: string; messagesTotal: number; threadsTotal: number }> {
    const url = 'https://gmail.googleapis.com/gmail/v1/users/me/profile';
    return this.get<{ emailAddress: string; messagesTotal: number; threadsTotal: number }>(url);
  }

  fetchingLabels = false;
  public async getLabelsFromGmail(): Promise<{ labels: GmailLabel[] }> {
    this.fetchingLabels = true;
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/labels`;
    const params = new HttpParams();
    return this.get<{ labels: GmailLabel[] }>(url, params);
  }


  public async downloadLabelsGmail() : Promise<void> {
    console.log('processLabelToMessages called');
    if (this.fetchingLabels) {
      console.log('bg process Label :' + " already fetching labels, return");
      return;
    } 
    const promiseLabels = this.getLabelsFromGmail()
    promiseLabels
      .then((resp) => {
        this.labelsGmail = resp.labels;
        console.log('bgB process Label :' + " labels:", this.labelsGmail);
        this.updateLabelAlreadyProcessedId(resp.labels);
        this.listenerOnLabelsDownloaded?.onLabelsDownloaded(resp.labels);
        this.fetchingLabels = false;
        
      })
      .catch((err) => {
        console.error('bgB process Label :' + "  err:", err);
        this.fetchingLabels = false;
      });
  };
  listenerOnLabelsDownloaded: onLabelsDownloaded | undefined;
  public updateLabelAlreadyProcessedId (labels: Array<GmailLabel>) {
    const  labelAlreadyProcessedId =labels.find(lbl => lbl.name === this.labelAlreadyProcessed)?.id;
    console.log('bgB updateLabelAlreadyProcessedId :' ,labelAlreadyProcessedId);
    if(labelAlreadyProcessedId){
      this.labelAlreadyProcessedId=labelAlreadyProcessedId;
    }
    console.log('bgB updateLabelAlreadyProcessedId this.labelAlreadyProcessedId :' ,this.labelAlreadyProcessedId); 
   }
  public getLabels() {
    if (this.labelsGmail.length === 0) {
      this.downloadLabelsGmail();
    }
    return this.labelsGmail;
  }

  public async getLabelsPromise(): Promise<GmailLabel[]> {
    if (this.labelsGmail.length === 0) {
      await this.downloadLabelsGmail();
    }
    return this.labelsGmail;
  }

  /** Crée un label utilisateur dans Gmail */
  public async createLabel(labelName: string) {
    console.log('bg createLabel called with labelName=', labelName);
    const existing = this.getIdLabelFromLabelName(labelName, this.labelsGmail);
    if (existing) {
      console.log('Label déjà existant avec id=', existing);
      return Promise.resolve(this.labelsGmail.find(lbl => lbl.id === existing)!);
    }
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/labels`;
    const body = {
      name: labelName,
      // visibilités par défaut ; tu peux les adapter ('show'|'hide' et 'labelShow'|'labelHide')
      labelListVisibility: 'labelShow',
      messageListVisibility: 'show'
    };
    if(labelName==="processedByGemini"){
      body.labelListVisibility='labelHide';
      body.messageListVisibility='hide';
    } 
    const promise: Promise<GmailLabel> = this.post<GmailLabel>(url, body);
    promise.then((newLabel) => {
      // Met à jour la liste locale des labels
      this.labelsGmail.push(newLabel);
    }, (error) => {
      console.error('Erreur lors de la création du label:', error);
    }
    );
    return promise;
  }

   /** Crée un label utilisateur dans Gmail */
  public async getOrCreateLabelAlreadyProcessed____OLD() {
    const labelName=this.labelAlreadyProcessed;
    console.log('bg createLabel called with labelName=', labelName);
    const existing = this.getIdLabelFromLabelName(labelName, this.labelsGmail);
    if (existing) {
      console.log('Label labelAlreadyProcessed existe avec id=', existing);
      return Promise.resolve(this.labelsGmail.find(lbl => lbl.id === existing)!);
    }
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/labels`;
    const body = {
      name: labelName,
      // visibilités par défaut ; tu peux les adapter ('show'|'hide' et 'labelShow'|'labelHide')
      labelListVisibility: 'labelHide',
      messageListVisibility: 'hide'
    };
    const promise: Promise<GmailLabel> = this.post<GmailLabel>(url, body);
    promise.then((newLabel) => {
      // Met à jour la liste locale des labels
      this.labelsGmail.push(newLabel);
    }, (error) => {
      console.error('Erreur lors de la création du label:', error);
    }
    );
    return promise;
  }
  

  /** Ajoute un label à un message Gmail */
  public async affectLabelToMessage2(idMessage: string, label: string): Promise<any> {
    if(!label) {
      return Promise.reject(new Error('Label vide ou invalide'));
    } 
    if(label.length===0) {
      return Promise.reject(new Error('Label vide ou invalide'));
    }
    console.log('bg affectLabetToMessage label', label); 
    const idLabel: string = await this.getIdLabelFromLabelNameOrCreate(label);     
    console.log('bg affectLabetToMessage label :'+label+' idLabel', idLabel); 
    return this.affectIdLabetToMessage(idMessage, idLabel);
  }

  getIdLabelFromLabelName(label: string, labelsGmail: GmailLabel[]): string {
    for (const lbl of labelsGmail) {
      if (lbl.name === label) {
        return lbl.id;
      }
    }
    return '';
  }

   public async getIdLabelFromLabelNameOrCreate(label: string): Promise<string> {
    // Cherche d'abord dans la liste existante
    console.log('bgC Recherche du label existant: labelsGmail', this.labelsGmail);
    const existing = this.getLabels().find(lbl => lbl.name === label);
    console.log('bgC  Recherche du label existant: existing', existing);
    if (existing) {
      return existing.id;
    }

    // Si pas trouvé, crée le label et attend le résultat
    try {
      const newLabel = await this.createLabel(label);
      console.log('Label créé avec succès:', newLabel);
      console.log('Label créé avec succès: id', newLabel.id);
      return newLabel.id ?? '';
    } catch (error) {
      console.error('Erreur lors de la création du label:', error);
      return '';
    }
  }
  public async affectIdLabetToMessage(idMessage: string, idLabel: string): Promise<any> {
    console.log('bg affectIdLabetToMessage idMessage :'+idMessage+' idLabel', idLabel);
    const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(idMessage)}/modify`;
    const body = {
      addLabelIds: [idLabel],
      removeLabelIds: []
    };
    return this.post<any>(url, body);
  }
}

export interface GmailLabel {
  /** Identifiant du label (ex: "INBOX", "Label_1") */
  id: string;
  /** Nom affiché du label */
  name: string;
  /** Visibilité du message dans la liste des messages (optionnel) */
  messageListVisibility?: 'hide' | 'show';
  /** Visibilité du label dans la liste des labels (optionnel) du message */
  labelListVisibility?: 'labelHide' | 'labelShow';
  /** Type du label : système ou utilisateur */
  type: 'system' | 'user';
}

