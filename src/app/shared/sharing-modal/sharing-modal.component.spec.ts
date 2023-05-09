import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { SharingModalComponent } from './sharing-modal.component';

describe('SharingModalComponent', () => {
  let component: SharingModalComponent;
  let fixture: ComponentFixture<SharingModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SharingModalComponent],
      imports: [ToastrModule.forRoot()],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharingModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
