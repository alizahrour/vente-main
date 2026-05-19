import { NgModule } from '@angular/core';
import { LoginPageComponent } from './pages/login-page.component';
import { SharedModule } from '../../shared/shared.module';
import { AuthRoutingModule } from './auth-routing.module';

@NgModule({
  declarations: [LoginPageComponent],
  imports: [SharedModule, AuthRoutingModule],
})
export class AuthModule {}
