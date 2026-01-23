import { Injectable } from '@angular/core';
import { TransferTransactionRepository } from './transfer-transaction.repository';
import { CreateTransferTransactionPayload } from './create-transfer-transaction.payload';
import { firstValueFrom } from 'rxjs';
import { TransferTransaction } from './transfer-transaction';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../../shared/util/field-error-wrapper';

@Injectable({ providedIn: 'root' })
export class TransferTransactionService {
  constructor(private repository: TransferTransactionRepository) {}

  public async createTransferTransaction(
    payload: CreateTransferTransactionPayload,
  ): Promise<WrappedResponse<TransferTransaction>> {
    return await new FieldErrorWrapper(() =>
      this.repository.createTransferTransaction(payload),
    ).execute();
  }

  public async getTransferTransaction(
    transferTransactionId: number,
  ): Promise<TransferTransaction> {
    return await firstValueFrom(
      this.repository.getTransferTransaction(transferTransactionId),
    );
  }

  public async deleteTransferTransaction(
    transferTransactionId: number,
  ): Promise<WrappedResponse<any>> {
    return await new FieldErrorWrapper(() =>
      this.repository.deleteTransferTransaction(transferTransactionId),
    ).execute();
  }
}
