import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import {HttpClientModule} from '@angular/common/http';
import { PageV1Component } from './page-v1.component';
import { CommonService } from '../services/common.service';
import { LoaderService } from '../services/loader-service/loader.service';
import { RouterTestingModule } from "@angular/router/testing";

describe('PageComponent', () => {
  let component: PageV1Component;
  let fixture: ComponentFixture<PageV1Component>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageV1Component],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [LoaderService, CommonService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageV1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
