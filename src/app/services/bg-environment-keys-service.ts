import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../environments/environment';
import { environment_secret } from '../environments/environment_secret';
@Injectable({ providedIn: 'root' })
export class KeysService {
  private keys: any = {...environment, ...environment_secret};
  private readonly url =
    'https://europe-west1-job4you-78ed0.cloudfunctions.net/keys2';

  constructor(private http: HttpClient) {

  }

  async loadKeys(): Promise<void> {
    console.log('loadKeys start deactivated:');
    try {
     // this.keys = await firstValueFrom(this.http.get(this.url));
     // console.log('Keys loaded:', this.keys);
    } catch (error: any) {
      console.error('Error loading keys:', error);
    }
  }

  getKeys(): any {
    return this.keys;
  }
}
