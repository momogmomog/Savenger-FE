import {
  Component,
  computed,
  inject,
  model,
  OnInit,
  output,
} from '@angular/core';
import { CommonModule, CurrencyPipe, PercentPipe } from '@angular/common';
import {
  ActionSheetController,
  IonAccordion,
  IonAccordionGroup,
  IonAvatar,
  IonBackButton,
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonProgressBar,
  IonRow,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  ellipsisVertical,
  folderOpenOutline,
  pencilOutline,
  peopleOutline,
  personAddOutline,
  stopCircleOutline,
  swapHorizontalOutline,
  trashOutline,
  trendingDownOutline,
  trendingUpOutline,
  walletOutline,
} from 'ionicons/icons';
import { BudgetStatistics } from '../../../api/budget/budget.statistics';
import { AppRoutingPath } from '../../../app-routing.path';
import { ModalService } from '../../../shared/modal/modal.service';
import { ManageParticipantsModal } from '../manage-participants/manage-participants.modal';
import { ShellType } from '../../../shared/modal/shells/modal-shell.types';
import { Category } from '../../../api/category/category';
import { CategoryService } from '../../../api/category/category.service';

@Component({
  selector: 'app-budget-details',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyPipe,
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
export class BudgetDetailsPage implements OnInit {
  private actionSheetCtrl = inject(ActionSheetController);
  private modalService = inject(ModalService);
  private categoryService = inject(CategoryService);

  routes = AppRoutingPath;
  stats = model.required<BudgetStatistics>();
  protected categories = model<Category[]>([]);

  navigateAway = output<void>();
  editTriggered = output<void>();
  budgetUpdated = output<void>();

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
      stopCircleOutline,
      trashOutline,
      personAddOutline,
      folderOpenOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    this.categories.set(
      await this.categoryService.fetchAllCategories(this.stats().budget.id),
    );
  }

  async presentActionSheet(): Promise<void> {
    const actionSheet = await this.actionSheetCtrl.create({
      header: this.stats().budget.budgetName,
      buttons: [
        {
          text: 'Edit Budget',
          icon: 'pencil-outline',
          handler: (): void => {
            this.editTriggered.emit();
          },
        },
        {
          text: 'Manage Participants',
          icon: 'person-add-outline',
          handler: async (): Promise<void> => {
            const modal = await this.modalService.open(
              ManageParticipantsModal,
              this.stats().budget,
              {
                shellType: ShellType.HEADER,
                title: `Manage Participants`,
                showCloseButton: true,
              },
            );

            const { data } = await modal.onDidDismiss();
            if (data) {
              this.stats.set({
                ...this.stats(),
                budget: data,
              });
              this.budgetUpdated.emit();
            }
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
