import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let fixture: ComponentFixture<LoginPageComponent>;
  let component: LoginPageComponent;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'getCurrentUserSnapshot']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [LoginPageComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router },
      ],
    })
      .overrideComponent(LoginPageComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(LoginPageComponent);
    component = fixture.componentInstance;
  });

  it('le formulaire login est invalide si vide', () => {
    component.form.setValue({ username: '', password: '' });

    expect(component.form.invalid).toBeTrue();
  });

  it('appelle AuthService avec username/password', () => {
    authService.login.and.returnValue(of({
      token: 'token',
      username: 'agent',
      fullName: 'Agent Telecom',
      role: 'AGENT',
    }));
    authService.getCurrentUserSnapshot.and.returnValue({
      username: 'agent',
      fullName: 'Agent Telecom',
      role: 'AGENT',
    });
    component.form.setValue({ username: 'agent', password: 'agent123' });

    component.submit();

    expect(authService.login).toHaveBeenCalledWith({ username: 'agent', password: 'agent123' });
    expect(router.navigate).toHaveBeenCalledWith(['/customers']);
  });
});
