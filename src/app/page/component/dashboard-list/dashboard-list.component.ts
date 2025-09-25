import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
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
  @Output() resourceClick = new EventEmitter<Resource>();

  onResourceClick(resource: Resource): void {
    this.resourceClick.emit(resource);
  }

  onViewResourceClick(): void {
    // Add route to related page
  }
}
