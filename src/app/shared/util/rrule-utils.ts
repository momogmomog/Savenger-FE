import { RRule } from 'rrule';
import { ObjectUtils } from './object-utils';

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
}
