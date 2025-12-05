import { RouteConfig } from './shared/routing/route-config';

export class AppRoutingPath {
  public static readonly NOT_FOUND = new RouteConfig('not-found', null);
  public static readonly HOME = new RouteConfig('', null);
  public static readonly LOGIN = new RouteConfig('login', null);

  public static readonly TABS = new RouteConfig('tabs', null);
  public static readonly TAB_1_REVISIONS = new RouteConfig('revisions', AppRoutingPath.TABS);
  public static readonly TAB_2_ANALYTICS = new RouteConfig('analytics', AppRoutingPath.TABS);
  public static readonly TAB_3_TRANSACTIONS = new RouteConfig('transactions', AppRoutingPath.TABS);

}
