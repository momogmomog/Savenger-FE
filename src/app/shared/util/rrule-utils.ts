import { RRule, Weekday } from 'rrule';
import { ObjectUtils } from './object-utils';

const JS_DAY_TO_RRULE_WEEKDAY: Weekday[] = [
  RRule.SU,
  RRule.MO,
  RRule.TU,
  RRule.WE,
  RRule.TH,
  RRule.FR,
  RRule.SA,
];

export class RRuleUtils {
  public static toHumanReadableText(rrule: string): string {
    try {
      return RRule.fromString(rrule).toText();
    } catch (err) {
      console.warn('Error parsing rrule!', err);
      return 'Invalid Rule';
    }
  }

  public static toRRuleString(options: any): string {
    if (ObjectUtils.isNil(options)) {
      return '';
    }

    try {
      const rule = new RRule(options);
      return rule.toString().replace('RRULE:', '');
    } catch (err) {
      console.warn(err);
      return '';
    }
  }

  /**
   * Builds a default recurrence rule for an installment schedule based on a budget's
   * recurring rule and the schedule's startFrom date (1 installment per budget lifecycle).
   */
  public static buildScheduleRuleFromBudgetRule(
    budgetRecurringRule: string,
    startFrom: Date,
  ): string {
    if (!budgetRecurringRule || ObjectUtils.isNil(startFrom)) {
      return '';
    }

    try {
      const parsed = RRule.fromString(budgetRecurringRule);
      const freq = parsed.options.freq;
      const interval = parsed.options.interval || 1;
      const options: any = {
        freq,
        interval,
      };

      if (freq === RRule.WEEKLY) {
        options.byweekday = [JS_DAY_TO_RRULE_WEEKDAY[startFrom.getDay()]];
      } else if (freq === RRule.MONTHLY) {
        options.bymonthday = startFrom.getDate();
      } else if (freq === RRule.YEARLY) {
        options.bymonth = startFrom.getMonth() + 1;
        options.bymonthday = startFrom.getDate();
      }

      return this.toRRuleString(options);
    } catch (err) {
      console.warn('Error building schedule rule from budget rule!', err);
      return '';
    }
  }

  /**
   * Counts the number of occurrences produced by a recurring rule between startFrom and untilDate (inclusive).
   */
  public static countOccurrencesBetween(
    rrule: string,
    startFrom: Date,
    untilDate: Date,
  ): number {
    if (
      !rrule ||
      ObjectUtils.isNil(startFrom) ||
      ObjectUtils.isNil(untilDate)
    ) {
      return 0;
    }

    try {
      const startUtc = new Date(
        Date.UTC(
          startFrom.getFullYear(),
          startFrom.getMonth(),
          startFrom.getDate(),
          0,
          0,
          0,
        ),
      );
      const endUtc = new Date(
        Date.UTC(
          untilDate.getFullYear(),
          untilDate.getMonth(),
          untilDate.getDate(),
          23,
          59,
          59,
        ),
      );

      if (endUtc < startUtc) {
        return 0;
      }

      const parsed = RRule.fromString(rrule);
      const ruleWithStart = new RRule({
        ...parsed.origOptions,
        dtstart: startUtc,
      });

      return ruleWithStart.between(startUtc, endUtc, true).length;
    } catch (err) {
      console.warn('Error counting occurrences between dates!', err);
      return 0;
    }
  }

  /**
   * Calculates the installment amount by equally dividing totalAmount across the number of
   * occurrences and rounding up to the nearest cent so there is no 1-cent leftover final payment.
   */
  public static calculateInstallmentAmount(
    totalAmount: number,
    rrule: string,
    startFrom: Date,
    paidUntil: Date,
  ): number | null {
    if (!totalAmount || totalAmount <= 0) {
      return null;
    }

    const occurrences = this.countOccurrencesBetween(
      rrule,
      startFrom,
      paidUntil,
    );
    if (occurrences <= 0) {
      return null;
    }

    return Math.ceil((totalAmount / occurrences) * 100) / 100;
  }
}
