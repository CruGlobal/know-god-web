import { HttpClientModule } from '@angular/common/http';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { I18NextModule } from 'angular-i18next';
import { mockPageComponent } from '../_tests/mocks';
import { CommonService } from '../services/common.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientModule, RouterTestingModule, I18NextModule.forRoot()],
      providers: [CommonService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('prepareLanguageSwitcher() should set availableLangs based on languagesWithLessons and current page', fakeAsync(() => {
    component['_languagesData'] = [
      mockPageComponent.languageEnglish,
      mockPageComponent.languageGerman,
      mockPageComponent.languageChineseTraditional
    ];
    const isLessonsPage = spyOn(component, 'isLessonsPage').and.returnValue(
      false
    );

    // No languagesWithLessons, should include all languages
    component.languagesWithLessons = null;
    component['prepareLanguageSwitcher']();
    tick();
    expect(component.availableLangs.length).toEqual(3);

    component['_languageChanged'].next();

    // On lessons page with languagesWithLessons set, should filter languages
    component.languagesWithLessons = new Set<string>(['3333']);
    isLessonsPage.and.returnValue(true);
    component['prepareLanguageSwitcher']();
    tick();
    expect(component.availableLangs.length).toEqual(1);
    expect(component.availableLangs[0].code).toEqual('zh-Hant');
  }));

  it('setDisplayLanguage() should match case-insensitively and store API correct casing', () => {
    component['_languagesData'] = [
      mockPageComponent.languageChineseTraditional
    ];
    component['setDisplayLanguage']('zh-hant');
    expect(component.dispLanguage).toEqual(3333);
    expect(component.dispLanguageCode).toEqual('zh-Hant');
    expect(component.dispLanguageName).toEqual('Chinese (Traditional)');
  });

  it('onSelectLanguage() should navigate to correct route based on current page', () => {
    const navigateSpy = spyOn(component.route, 'navigate');
    const isToolsPage = spyOn(component, 'isToolsPage').and.returnValue(false);
    const isLessonsPage = spyOn(component, 'isLessonsPage').and.returnValue(
      false
    );

    // On tools page
    isToolsPage.and.returnValue(true);
    component.onSelectLanguage('zh-Hant');
    expect(navigateSpy).toHaveBeenCalledWith(['/', 'zh-Hant', 'tools']);

    // On lessons page
    isToolsPage.and.returnValue(false);
    isLessonsPage.and.returnValue(true);
    component.onSelectLanguage('zh-Hant');
    expect(navigateSpy).toHaveBeenCalledWith(['/', 'zh-Hant', 'lessons']);

    // On dashboard page
    isLessonsPage.and.returnValue(false);
    component.onSelectLanguage('zh-Hant');
    expect(navigateSpy).toHaveBeenCalledWith(['/', 'zh-Hant']);
  });
});
