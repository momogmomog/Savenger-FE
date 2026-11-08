import { addIcons } from 'ionicons';
import {
  add,
  arrowDown,
  arrowDownCircle,
  arrowUp,
  arrowUpCircle,
  filter,
  funnel,
  remove,
  swapHorizontal,
  swapHorizontalOutline,
  trendingDownOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { TransactionType } from '../../api/transaction/transaction.type';

export class TransactionUtils {
  public static readonly CHART_INCOME_COLOR = '#2dd36f';
  public static readonly CHART_EXPENSE_COLOR = '#428cff';
  public static readonly CHART_TEXT_COLOR = '#9d9fa6';
  public static readonly CHART_GRID_COLOR = 'rgba(157, 159, 166, 0.2)';

  public static readonly CHART_INCOME_PALETTE: string[] = [
    '#2dd36f',
    '#28ba62',
    '#22a053',
    '#1c8645',
    '#42d77d',
    '#59db8c',
    '#6fe09b',
    '#86e4a9',
  ];

  public static readonly CHART_EXPENSE_PALETTE: string[] = [
    '#428cff',
    '#50c8ff',
    '#a58fff',
    '#ffc409',
    '#eb445a',
    '#2dd36f',
    '#e0e0e0',
    '#808080',
  ];

  static {
    addIcons({
      arrowDownCircle,
      arrowUpCircle,
      swapHorizontal,
      swapHorizontalOutline,
      trendingDownOutline,
      trendingUpOutline,
      arrowDown,
      arrowUp,
      add,
      remove,
      filter,
      funnel,
    });
  }

  public static getIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'arrow-down-circle';
      case TransactionType.EXPENSE:
        return 'arrow-up-circle';
      default:
        return 'swap-horizontal';
    }
  }

  public static getTrendIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'trending-up-outline';
      case TransactionType.EXPENSE:
        return 'trending-down-outline';
      default:
        return 'swap-horizontal-outline';
    }
  }

  public static getActionIcon(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'add';
      case TransactionType.EXPENSE:
        return 'remove';
      default:
        return 'swap-horizontal-outline';
    }
  }

  public static getColor(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'success';
      case TransactionType.EXPENSE:
        return 'danger';
      case TransactionType.COMPENSATE:
        return 'primary';
      default:
        return 'medium';
    }
  }

  public static getTextColorClass(type: TransactionType): string {
    switch (type) {
      case TransactionType.INCOME:
        return 'text-success';
      case TransactionType.EXPENSE:
        return 'text-danger';
      case TransactionType.COMPENSATE:
        return 'text-primary';
      default:
        return 'text-medium';
    }
  }

  public static getAmountColor(amount: number): string {
    return amount >= 0 ? 'success' : 'danger';
  }

  public static getSign(type: TransactionType): string {
    return type === TransactionType.EXPENSE ? '-' : '+';
  }

  public static getAmountSign(amount: number): string {
    return amount > 0 ? '+' : '';
  }

  public static getUtilizationPercentage(current: number, max: number): number {
    if (!max || max <= 0) {
      return 0;
    }

    return current / max;
  }

  public static getUtilizationColor(current: number, max: number): string {
    const pct = TransactionUtils.getUtilizationPercentage(current, max);
    if (pct > 1.05) {
      return 'danger';
    }

    if (pct > 0.9) {
      return 'warning';
    }

    if (pct > 0.7) {
      return 'success';
    }

    return 'primary';
  }

  public static getFilterIcon(isFiltering: boolean): string {
    return isFiltering ? 'funnel' : 'filter';
  }

  public static getStatusColor(active: boolean): string {
    return active ? 'success' : 'medium';
  }

  public static getStatusLabel(active: boolean): string {
    return active ? 'Active' : 'Archived';
  }

  public static getUserAvatarUrl(
    username: string,
    randomBackground = false,
  ): string {
    const base = `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}`;
    return randomBackground ? `${base}&background=random` : base;
  }
}
