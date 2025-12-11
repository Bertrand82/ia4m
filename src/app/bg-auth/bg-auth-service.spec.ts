import { TestBed } from '@angular/core/testing';

import { BgAuthService } from './bg-auth-service';

describe('BgAuthService', () => {
  let service: BgAuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BgAuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
