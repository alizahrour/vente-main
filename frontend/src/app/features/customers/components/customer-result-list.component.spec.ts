import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { CustomerResultCardComponent } from './customer-result-card.component';
import { CustomerResultListComponent } from './customer-result-list.component';

describe('CustomerResultListComponent', () => {
  let fixture: ComponentFixture<CustomerResultListComponent>;
  let component: CustomerResultListComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerResultListComponent, CustomerResultCardComponent],
      imports: [RouterTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerResultListComponent);
    component = fixture.componentInstance;
    component.records = [
      {
        id: 1,
        category: 'individual',
        displayName: 'Alpha Benali',
        customerNumber: '1.10000001',
        addressLines: ['10, Avenue de Test'],
        contracts: [],
      },
    ];
    component.pageStart = 1;
    component.pageEnd = 1;
    component.total = 6;
    component.hasPreviousPage = false;
    component.hasNextPage = true;
    fixture.detectChanges();
  });

  it('affiche la plage courante et les boutons de pagination', () => {
    spyOn(component.nextPage, 'emit');

    expect(fixture.nativeElement.textContent).toContain('1 - 1 sur 6');

    const paginationButtons = fixture.debugElement.queryAll(By.css('.result-list__pagination button'));
    expect((paginationButtons[0].nativeElement as HTMLButtonElement).disabled).toBeTrue();
    expect((paginationButtons[1].nativeElement as HTMLButtonElement).disabled).toBeFalse();

    paginationButtons[1].nativeElement.click();
    expect(component.nextPage.emit).toHaveBeenCalled();
  });
});
