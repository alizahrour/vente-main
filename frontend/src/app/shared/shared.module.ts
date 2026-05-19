import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StatCardComponent } from './components/stat-card/stat-card.component';

@NgModule({
  declarations: [StatCardComponent],
  imports: [CommonModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule, StatCardComponent],
})
export class SharedModule {}
