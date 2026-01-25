import { Component, computed, effect, forwardRef, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IonicModule, SegmentValue } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { RRule, Frequency } from 'rrule';
import { RRuleUtils } from '../../util/rrule-utils';

@Component({
  selector: 'app-rrule-picker',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './rrule-picker.component.html',
  styleUrls: ['./rrule-picker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RrulePickerComponent),
      multi: true,
    },
  ],
})
export class RrulePickerComponent implements ControlValueAccessor {
  // Updated list with full labels for the dropdown
  readonly weekDaysList = [
    { label: 'M', fullLabel: 'Monday', val: RRule.MO },
    { label: 'T', fullLabel: 'Tuesday', val: RRule.TU },
    { label: 'W', fullLabel: 'Wednesday', val: RRule.WE },
    { label: 'T', fullLabel: 'Thursday', val: RRule.TH },
    { label: 'F', fullLabel: 'Friday', val: RRule.FR },
    { label: 'S', fullLabel: 'Saturday', val: RRule.SA },
    { label: 'S', fullLabel: 'Sunday', val: RRule.SU },
  ];

  readonly monthDaysArray = Array.from({ length: 31 }, (_, i) => i + 1);

  freq = signal<Frequency>(RRule.WEEKLY);
  interval = signal<number>(1);
  selectedDays = signal<any[]>([]); // For Weekly: Array of RRule weekdays

  // -- New Monthly Signals --
  monthMode = signal<'day' | 'pos'>('day'); // 'day' = On Day 4, 'pos' = On First Sunday
  monthDay = signal<number>(1); // 1-31
  monthPos = signal<number>(1); // 1, 2, 3, 4, -1
  monthWeekday = signal<any>(RRule.MO); // Specific weekday for month pos

  endType = signal<SegmentValue>('never');
  count = signal<number>(10);
  untilDate = signal<any>(new Date().toISOString());

  rruleValue = computed(() => {
    const options: any = {
      freq: this.freq(),
      interval: this.interval() || 1,
    };

    // 1. Weekly Logic
    if (this.freq() === RRule.WEEKLY && this.selectedDays().length > 0) {
      options.byweekday = this.selectedDays();
    }

    // 2. Monthly Logic
    if (this.freq() === RRule.MONTHLY) {
      if (this.monthMode() === 'day') {
        options.bymonthday = this.monthDay();
      } else {
        // "On the First Sunday": bysetpos=1, byweekday=SU
        options.bysetpos = this.monthPos();
        options.byweekday = this.monthWeekday();
      }
    }

    // End Condition
    if (this.endType() === 'count') {
      options.count = this.count();
    } else if (this.endType() === 'date' && this.untilDate()) {
      options.until = new Date(this.untilDate());
    }

    try {
      const rule = new RRule(options);
      return rule.toString();
    } catch (err) {
      console.warn(err);
      return '';
    }
  });

  humanReadableText = computed(() => {
    // If you don't have RRuleUtils in this context, use:
    // try { return RRule.fromString(this.rruleValue()).toText(); } catch { return ''; }
    return RRuleUtils.toHumanReadableText(this.rruleValue());
  });

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor() {
    effect(() => {
      const val = this.rruleValue();
      this.onChange(val);
    });
  }

  writeValue(value: string): void {
    if (!value) return;
    try {
      const rule = RRule.fromString(value);

      this.freq.set(rule.options.freq);
      this.interval.set(rule.options.interval);
      this.selectedDays.set(rule.options.byweekday || []);

      // Parse Monthly Specifics
      if (rule.options.freq === RRule.MONTHLY) {
        if (rule.options.bysetpos) {
          this.monthMode.set('pos');
          this.monthPos.set(
            Array.isArray(rule.options.bysetpos)
              ? rule.options.bysetpos[0]
              : rule.options.bysetpos,
          );

          // byweekday can be an array in RRule options, grab the first one
          const day = Array.isArray(rule.options.byweekday)
            ? rule.options.byweekday[0]
            : rule.options.byweekday;
          this.monthWeekday.set(day || RRule.MO);
        } else {
          this.monthMode.set('day');
          const mDay = Array.isArray(rule.options.bymonthday)
            ? rule.options.bymonthday[0]
            : rule.options.bymonthday;
          this.monthDay.set(mDay || 1);
        }
      }

      if (rule.options.count) {
        this.endType.set('count');
        this.count.set(rule.options.count);
      } else if (rule.options.until) {
        this.endType.set('date');
        this.untilDate.set(rule.options.until.toISOString());
      } else {
        this.endType.set('never');
      }
    } catch (e) {
      console.error('Invalid RRULE string passed to component', e);
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  toggleDay(day: any): void {
    const current = this.selectedDays();
    if (current.includes(day)) {
      this.selectedDays.set(current.filter((d) => d !== day));
    } else {
      this.selectedDays.set([...current, day]);
    }
  }
}
