import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import { LoaderService } from '../services/loader-service/loader.service';
import { PageV2Component } from './page-v2.component';
import { CommonService } from '../services/common.service';
import { PageService } from './service/page-service.service';
import { RouterTestingModule } from "@angular/router/testing";

describe('PageV2Component', () => {
  let component: PageV2Component;
  let fixture: ComponentFixture<PageV2Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageV2Component],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [LoaderService, CommonService, PageService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
