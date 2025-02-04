import { TestBed } from '@angular/core/testing';

import { Msal2Guard } from './msal2.guard';

describe('Msal2Guard', () => {
  let guard: Msal2Guard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(Msal2Guard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
