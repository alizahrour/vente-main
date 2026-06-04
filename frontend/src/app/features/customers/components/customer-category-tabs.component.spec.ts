import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { CustomerCategoryTabsComponent } from './customer-category-tabs.component';

describe('CustomerCategoryTabsComponent', () => {
  let fixture: ComponentFixture<CustomerCategoryTabsComponent>;
  let component: CustomerCategoryTabsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomerCategoryTabsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerCategoryTabsComponent);
    component = fixture.componentInstance;
    component.tabs = [
      { key: 'individual', label: 'Particulier', icon: 'user', count: 6 },
      { key: 'corporate', label: 'Grand compte', icon: 'company', count: 1 },
    ];
    component.activeCategory = 'individual';
    fixture.detectChanges();
  });

  it('affiche les compteurs et emet la categorie selectionnee', () => {
    spyOn(component.categorySelected, 'emit');

    const tabButtons = fixture.debugElement.queryAll(By.css('.result-tab'));
    expect(tabButtons[0].nativeElement.textContent).toContain('Particulier - 6');
    expect(tabButtons[1].nativeElement.textContent).toContain('Grand compte - 1');

    tabButtons[1].nativeElement.click();
    expect(component.categorySelected.emit).toHaveBeenCalledWith('corporate');
  });
});
