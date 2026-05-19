import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { App } from './app';
import { AuthService } from './core/services/auth.service';

describe('App', () => {
  it('creates the root component and restores the session', async () => {
    const authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['restoreSession']);

    await TestBed.configureTestingModule({
      declarations: [App],
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authServiceSpy }],
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;

    expect(app).toBeTruthy();
    expect(authServiceSpy.restoreSession).toHaveBeenCalled();
  });
});
