import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ToastrModule } from 'ngx-toastr';
import { buildShareUrl } from '../../api/url';
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

  describe('shareTo', () => {
    // A tool title with characters that would break out of a query parameter
    // if it were interpolated into the share URL without encoding.
    const HOSTILE_BOOK = 'Knowing God & Prayer #1: "Where?"';
    let openSpy: jasmine.Spy;

    beforeEach(() => {
      openSpy = spyOn(window, 'open');
      component.book = HOSTILE_BOOK;
    });

    // How each target encodes its parameters is covered by api/url.spec.ts;
    // these only check that the component hands over the right values.
    it('opens the share URL built from the title and the current page URL', () => {
      component.shareTo('TWITTER');

      expect(openSpy).toHaveBeenCalledWith(
        buildShareUrl('TWITTER', HOSTILE_BOOK, window.location.href),
        '_blank',
        'noopener'
      );
    });

    it('does not open a window for an unknown share target', () => {
      component.shareTo('MYSPACE');

      expect(openSpy).not.toHaveBeenCalled();
    });
  });
});
