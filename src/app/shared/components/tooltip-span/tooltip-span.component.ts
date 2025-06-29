import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { CopyIconComponent } from '../copy-icon/copy-icon.component';
import { NgIf } from '@angular/common';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'app-tooltip-span',
  standalone: true,
  imports: [CopyIconComponent, NgIf, MatTooltip],
  templateUrl: './tooltip-span.component.html',
  styleUrl: './tooltip-span.component.scss',
})
export class TooltipSpanComponent implements OnInit {
  private _displayText!: string;
  private _tooltipText!: string;

  @Input()
  set displayText(value: any) {
    if (!value) {
      value = '';
    }

    value = value + '';

    this._displayText = value;

    if (this.isInit && this.trimDisplayTextChars > 0) {
      this._displayText = this.shortenStr(this._displayText);
    }
  }

  get displayText(): string {
    return this._displayText;
  }

  private isInit = false;

  @Input()
  trimDisplayTextChars = -1;

  @Input()
  set tooltipText(val: any) {
    if (!val) {
      val = '';
    }

    val = val + '';
    this._tooltipText = val;
  }

  get tooltipText(): string {
    return this._tooltipText;
  }

  @Input()
  enableCopy = false;

  @Input()
  onCopy = new EventEmitter<string>();

  constructor() {}

  ngOnInit(): void {
    if (this.trimDisplayTextChars > 0) {
      this.displayText = this.shortenStr(this.displayText);
    }

    this.isInit = true;
  }

  onTextCopy(val: string): void {
    this.onCopy.emit(val);
  }

  private shortenStr(str: any): string {
    return (
      str.substring(0, Math.min(str.length, this.trimDisplayTextChars)) +
      (str.length > this.trimDisplayTextChars ? '...' : '')
    );
  }
}
