import { TestBed } from '@angular/core/testing';
import { OAuth2ProfileService } from 'src/app/services/profile.service';

describe('ProfileService', () => {
  let service: OAuth2ProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OAuth2ProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
