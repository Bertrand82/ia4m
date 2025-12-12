import { Component } from '@angular/core';
import { BgAuthService } from './bg-auth-service';

@Component({
  selector: 'app-bg-auth',
  imports: [],
  templateUrl: './bg-auth.html',
  styleUrl: './bg-auth.scss',
})
export class BgAuth {
  constructor(authservice: BgAuthService) {}
}
