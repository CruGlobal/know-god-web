import { PageService } from '../../../service/page-service.service';
import { CYOAComponent } from './cyoa-page.component';

describe('CyoaPageComponent', () => {
  let component: CYOAComponent;
  let pageService: PageService;

  beforeEach(() => {
    pageService = new PageService();
    component = new CYOAComponent(pageService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
