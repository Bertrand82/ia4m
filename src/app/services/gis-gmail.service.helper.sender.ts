import { Injectable } from '@angular/core';
import { GisGmailService } from './gis-gmail.service';
import { BgGemini } from './bg-gemini';

@Injectable({
  providedIn: 'root',
})
export class GisGmailServiceHelperSender {


   constructor(public gmail: GisGmailService, private gemini: BgGemini) {
    
    }
  
}
