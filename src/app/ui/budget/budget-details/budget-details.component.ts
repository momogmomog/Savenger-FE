import { Component, input, computed, inject, output } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  PercentPipe,
} from '@angular/common';
import {
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonGrid,
  IonRow,
  IonCol,
  IonProgressBar,
  IonLabel,
  IonItem,
  IonList,
  IonBadge,
  IonAccordionGroup,
  IonAccordion,
  IonAvatar,
  ActionSheetController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  ellipsisVertical,
  walletOutline,
  trendingUpOutline,
  trendingDownOutline,
  peopleOutline,
  swapHorizontalOutline,
  pencilOutline,
  trashOutline,
  personAddOutline,
} from 'ionicons/icons';
import { BudgetStatistics } from '../../../api/budget/budget.statistics';
import { AppRoutingPath } from '../../../app-routing.path';

@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
    DatePipe,
    PercentPipe,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonGrid,
    IonRow,
    IonCol,
    IonProgressBar,
    IonLabel,
    IonItem,
    IonList,
    IonBadge,
    IonAccordionGroup,
    IonAccordion,
    IonAvatar,
  ],
  templateUrl: './budget-details.component.html',
  styleUrls: ['./budget-details.component.scss'],
})
export class BudgetDetailsPage {
  private actionSheetCtrl = inject(ActionSheetController);

  routes = AppRoutingPath;
  stats = input.required<BudgetStatistics>();

  navigateAway = output<void>();

  usagePercentage = computed(() => {
    const cap = this.stats().budget.budgetCap;
    if (!cap || cap === 0) return 0;
    return Math.min(this.stats().expensesAmount / cap, 1);
  });

  healthColor = computed(() => {
    const pct = this.usagePercentage();
    if (pct >= 1) return 'danger';
    if (pct > 0.85) return 'warning';
    return 'primary';
  });

  pendingTransactions = computed(() => {
    return this.stats().balance - this.stats().realBalance;
  });

  constructor() {
    addIcons({
      ellipsisVertical,
      walletOutline,
      trendingUpOutline,
      trendingDownOutline,
      peopleOutline,
      swapHorizontalOutline,
      pencilOutline,
      trashOutline,
      personAddOutline,
    });
  }

  async presentActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.stats().budget.budgetName,
      buttons: [
        {
          text: 'Edit Budget',
          icon: 'pencil-outline',
          handler: (): void => {
            console.log('Edit clicked');
          },
        },
        {
          text: 'Manage Participants',
          icon: 'person-add-outline',
          handler: (): void => {
            console.log('Participants clicked');
          },
        },
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash-outline',
          handler: (): void => {
            alert('del');
            console.log('Delete clicked');
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          data: { action: 'cancel' },
        },
      ],
    });
    await actionSheet.present();
  }

  protected onNavigate(): void {
    this.navigateAway.emit();
  }
}
