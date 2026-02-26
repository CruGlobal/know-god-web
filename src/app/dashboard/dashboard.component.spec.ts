import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { mockPageComponent } from '../_tests/mocks';
import { CommonService } from '../services/common.service';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: any;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      imports: [HttpClientModule, RouterTestingModule],
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

  it('setDisplayLanguage() should match case-insensitively and store API correct casing', () => {
    component._languagesData = [mockPageComponent.languageChineseTraditional];
    component.setDisplayLanguage('zh-hant');
    expect(component.dispLanguage).toEqual(3333);
    expect(component.dispLanguageCode).toEqual('zh-Hant');
    expect(component.dispLanguageName).toEqual('Chinese (Traditional)');
  });
});
