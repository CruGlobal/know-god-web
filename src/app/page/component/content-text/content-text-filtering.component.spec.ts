import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  ParserState,
  Text
} from 'src/app/services/xml-parser-service/xml-parser.service';
import { mockText } from '../../../_tests/mocks';
import { PageService } from '../../service/page-service.service';
import { ContentTextComponent } from './content-text.component';

describe('ContentTextComponent - Visibility Rendering', () => {
  let component: ContentTextComponent;
  let fixture: ComponentFixture<ContentTextComponent>;
  let pageService: PageService;

  const renderWith = (flags: { gone?: boolean; invisible?: boolean }) => {
    const testText = mockText('Test content') as Text;
    testText.watchIsGone = (
      _state: ParserState,
      callback: (value: boolean) => void
    ) => {
      callback(flags.gone ?? false);
      return { close: () => {} };
    };
    testText.watchIsInvisible = (
      _state: ParserState,
      callback: (value: boolean) => void
    ) => {
      callback(flags.invisible ?? false);
      return { close: () => {} };
    };

    component.item = testText;
    component.ngOnChanges({ item: new SimpleChange(null, testText, true) });
    fixture.detectChanges();

    return fixture.nativeElement.querySelector(
      'p.textContent'
    ) as HTMLElement | null;
  };

  beforeEach(waitForAsync(() => {
    pageService = new PageService();
    TestBed.configureTestingModule({
      declarations: [ContentTextComponent],
      providers: [{ provide: PageService, useValue: pageService }]
    }).compileComponents();
    fixture = TestBed.createComponent(ContentTextComponent);
    component = fixture.componentInstance;
  }));

  it('removes the element from the DOM when gone-if is true', () => {
    expect(renderWith({ gone: true })).toBeNull();
  });

  it('renders the element when gone-if is false', () => {
    expect(renderWith({ gone: false })).not.toBeNull();
  });

  it('keeps the element but hides it when invisible-if is true', () => {
    const element = renderWith({ invisible: true });

    expect(element).not.toBeNull();
    expect(element.style.visibility).toBe('hidden');
  });

  it('shows the element normally when neither gone nor invisible', () => {
    const element = renderWith({});

    expect(element).not.toBeNull();
    expect(element.style.visibility).toBe('visible');
  });
});
