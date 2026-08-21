import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { SharingModalComponent } from './sharing-modal.component';

describe('SharingModalComponent', () => {
  let component: SharingModalComponent;
  let fixture: ComponentFixture<SharingModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SharingModalComponent],
      imports: [ToastrModule.forRoot()]
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

  it('shares to the current X intent URL', () => {
    component.book = 'Knowing God Personally';
    const open = spyOn(window, 'open');

    component.shareTo('TWITTER');

    expect(open).toHaveBeenCalledWith(
      `https://x.com/intent/tweet?text=Knowing God Personally via %40crutweets&url=${window.location.href}`,
      '_blank'
    );
  });

  it('keeps the Facebook and email sharing targets working', () => {
    component.book = 'Knowing God Personally';
    const open = spyOn(window, 'open');

    component.shareTo('FACEBOOK');
    component.shareTo('MAILTO');

    expect(open.calls.allArgs()).toEqual([
      [
        `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
        '_blank'
      ],
      [
        `mailto:?subject=Knowing God Personally&body=${window.location.href}`,
        '_blank'
      ]
    ]);
  });

  it('does not render the retired Google+ target', () => {
    component.ShareState = 'max';
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[title="Google+"]')).toBeNull();
  });
});
