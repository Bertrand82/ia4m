import { TestBed } from '@angular/core/testing';

import { GisGmailServiceHelperSender } from './gis-gmail.service.helper.sender';

describe('GisGmailServiceHelperSender', () => {
  let service: GisGmailServiceHelperSender;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GisGmailServiceHelperSender);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
