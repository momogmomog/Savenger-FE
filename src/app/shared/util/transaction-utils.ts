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

export interface TransactionDateGroup<T> {
  dateLabel: string;
  dateObj: string | Date;
  items: T[];
}

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

  public static getUtilizationGradient(current: number, max: number): string {
    const stageColors: Record<number, string> = {
      60: 'var(--color-utilization-low)',
      90: 'var(--color-utilization-moderate)',
      105: 'var(--color-utilization-high)',
    };
    const exceededColor = 'var(--color-utilization-exceeded)';

    const stages = Object.entries(stageColors)
      .map(([percent, color]) => ({ percent: Number(percent), color }))
      .sort((a, b) => a.percent - b.percent);

    const pct = TransactionUtils.getUtilizationPercentage(current, max) * 100;
    const maxStagePercent = stages[stages.length - 1]?.percent ?? 100;

    if (pct > maxStagePercent) {
      return exceededColor;
    }

    if (pct <= stages[0].percent) {
      return stages[0].color;
    }

    const fill = Math.min(pct, 100);
    const toStop = (pos: number): string =>
      `${Math.min(100, Math.round((pos / fill) * 1000) / 10)}%`;

    const activeStages: { percent: number; color: string }[] = [];
    for (const stage of stages) {
      activeStages.push(stage);
      if (pct <= stage.percent) {
        break;
      }
    }

    const gradientStops: string[] = [];
    activeStages.forEach((stage, index) => {
      const isFirst = index === 0;
      const isLast = index === activeStages.length - 1;
      const stageStart = isFirst ? 0 : activeStages[index - 1].percent;
      const stageEnd = isLast ? fill : Math.min(stage.percent, fill);
      const stageWidth = Math.max(0, stageEnd - stageStart);

      const startPos = isFirst
        ? 0
        : Math.min(fill, stageStart + Math.min(2, stageWidth * 0.25));
      const endPos = isLast
        ? fill
        : Math.max(startPos, stageEnd - Math.min(4, stageWidth * 0.25));

      gradientStops.push(
        `${stage.color} ${isFirst ? '0%' : toStop(startPos)}`,
        `${stage.color} ${isLast ? '100%' : toStop(endPos)}`,
      );
    });

    return `linear-gradient(90deg, ${gradientStops.join(', ')})`;
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

  public static groupByDate<T>(
    items: T[],
    dateExtractor: (item: T) => string | Date,
  ): TransactionDateGroup<T>[] {
    const groups = new Map<string, T[]>();

    items.forEach((item) => {
      const date = new Date(dateExtractor(item));
      const dateKey = date.toDateString();

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(item);
    });

    return Array.from(groups.entries()).map(([dateLabel, groupItems]) => ({
      dateLabel,
      dateObj: dateExtractor(groupItems[0]),
      items: groupItems,
    }));
  }
}
