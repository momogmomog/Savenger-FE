export class Endpoints {
  public static readonly LOGIN = '/login';
  public static readonly USER_DETAILS = '/user-details';
  public static readonly OTHER_USER_DETAILS = '/user-details/:username';
  public static readonly BUDGETS = '/budgets';
  public static readonly BUDGET_STATISTICS = '/budgets/:id/statistics';
  public static readonly BUDGET = '/budgets/:id';
  public static readonly BUDGET_SEARCH = '/budgets/search';
  public static readonly CATEGORIES = '/categories';
  public static readonly CATEGORIES_SEARCH = '/categories/search';
  public static readonly TAGS = '/tags';
  public static readonly TAGS_SEARCH = '/tags/search';
  public static readonly PARTICIPANTS = '/budgets/:id/participants';
  public static readonly TRANSACTIONS = '/transactions';
  public static readonly TRANSACTIONS_SEARCH = '/transactions/search';
  public static readonly TRANSACTION = '/transactions/:id';
  public static readonly REVISIONS = '/revisions';
  public static readonly DEBTS = '/debts';
  public static readonly PAY_DEBT = '/debts/:id/pay-debt';
  public static readonly PREPAYMENTS = '/prepayments';
  public static readonly PAY_R_TRANSACTION = '/recurring-transaction/{rTransactionId}/pay';
  public static readonly ANALYTICS_CATEGORIES = '/analytics/categories';
  public static readonly ANALYTICS_TAGS = '/analytics/tags';
}
