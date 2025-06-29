import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { LoaderService } from './loader.service';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  imports: [NgIf],
})
export class LoaderComponent implements OnInit {
  active = false;

  constructor(
    private loaderService: LoaderService,
    private ref: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loaderService.loading$.subscribe((value) => {
      if (this.active === value) {
        return;
      }

      this.active = value;
      this.ref.detectChanges();
    });
  }
}
