import { ComponentFixture, TestBed } from '@angular/core/testing';
import { I18NextModule } from 'angular-i18next';
import { DashboardListComponent } from './dashboard-list.component';

describe('DashboardListComponent', () => {
  let component: DashboardListComponent;
  let fixture: ComponentFixture<DashboardListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DashboardListComponent],
      imports: [I18NextModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
