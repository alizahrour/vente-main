import { NgModule } from '@angular/core';
import { TopbarComponent } from './components/topbar/topbar.component';
import { ShellComponent } from './shell/shell.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [TopbarComponent, ShellComponent],
  imports: [SharedModule],
  exports: [ShellComponent],
})
export class LayoutModule {}
