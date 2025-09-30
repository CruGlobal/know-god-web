import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation,
  inject
} from '@angular/core';
import { Router } from '@angular/router';
import { Resource } from '../../../services/resource.service';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DashboardListComponent {
  @Input() title: string = '';
  @Input() resources: Resource[] = [];
  @Input() dispLanguageDirection: string = 'ltr';
  @Input() viewAllText: string = 'View All';
  @Input() viewAllRoute: string = '';
  @Input() dispLanguageCode: string = '';
  @Output() resourceClick = new EventEmitter<Resource>();

  readonly router = inject(Router);

  onResourceClick(resource: Resource): void {
    this.resourceClick.emit(resource);
  }

  routeSelected(): boolean {
    const isSelected =
      this.router.url.includes('/tools') ||
      this.router.url.includes('/lessons');
    return isSelected;
  }
}
