import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CustomerSearchSummaryBarComponent } from './customer-search-summary-bar.component';

describe('CustomerSearchSummaryBarComponent', () => {
  let fixture: ComponentFixture<CustomerSearchSummaryBarComponent>;
  let component: CustomerSearchSummaryBarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerSearchSummaryBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerSearchSummaryBarComponent);
    component = fixture.componentInstance;
    component.items = [
      { type: 'field', name: 'clientCode', label: 'N° client', value: '1.10000001', active: true },
      { type: 'separator' },
      { type: 'field', name: 'email', label: 'Email', value: '', active: false },
    ];
    fixture.detectChanges();
  });

  it('met en evidence les criteres actifs', () => {
    expect(fixture.debugElement.queryAll(By.css('.summary-chip--active')).length).toBe(1);
    expect(fixture.nativeElement.textContent).toContain('1.10000001');
  });

  it('emet une demande de modification et affiche le bouton de fermeture en edition', () => {
    spyOn(component.editRequested, 'emit');
    spyOn(component.closeRequested, 'emit');

    fixture.debugElement.query(By.css('.summary-chip')).nativeElement.click();
    expect(component.editRequested.emit).toHaveBeenCalled();

    component.isEditing = true;
    fixture.detectChanges();
    fixture.debugElement.query(By.css('button[aria-label="Fermer la modification des criteres"]')).nativeElement.click();
    expect(component.closeRequested.emit).toHaveBeenCalled();
  });
});
