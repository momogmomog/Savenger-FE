import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-copy-icon',
  standalone: true,
  imports: [NgIf, MatTooltip],
  templateUrl: './copy-icon.component.html',
  styleUrl: './copy-icon.component.scss',
})
export class CopyIconComponent {
  copied = false;
  tooltipTexts = {
    true: 'Copied',
    false: 'Click to copy',
  };

  @Input()
  copyText!: string;

  @Output()
  onCopy = new EventEmitter<string>();

  constructor() {}

  copy(): void {
    // Copy
    navigator.clipboard.writeText(this.copyText);
    this.copied = true;
    this.onCopy.emit(this.copyText);

    setTimeout(() => (this.copied = false), 2000);
  }

  getTooltipText(copied: boolean): string {
    if (copied) {
      return this.tooltipTexts.true;
    }

    return this.tooltipTexts.false;
  }
}
