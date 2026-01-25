import { RRule } from 'rrule';

export class RRuleUtils {
  public static toHumanReadableText(rrule: string): string {
    try {
      return RRule.fromString(rrule).toText();
    } catch (err) {
      console.warn('Error parsing rrule!', err);
      return 'Invalid Rule';
    }
  }
}
