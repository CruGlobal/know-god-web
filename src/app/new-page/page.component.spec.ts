import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { LoaderService } from '../services/loader-service/loader.service';
import { PageNewComponent } from './page.component';
import { CommonService } from '../services/common.service';
import { PageService } from './service/page-service.service';

describe('PageComponent', () => {
  let component: PageNewComponent;
  let fixture: ComponentFixture<PageNewComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PageNewComponent],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [LoaderService, CommonService, PageService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
