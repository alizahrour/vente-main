import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('stores the session after a successful login', () => {
    service.login({ username: 'agent', password: 'agent123' }).subscribe((response) => {
      expect(response.role).toBe('AGENT');
      expect(localStorage.getItem('telecom_crm_token')).toBe('jwt-token');
      expect(service.isAuthenticated()).toBeTrue();
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({
      token: 'jwt-token',
      username: 'agent',
      fullName: 'Agent Commercial',
      role: 'AGENT',
    });
  });
});
