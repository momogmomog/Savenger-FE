import { Injectable } from '@angular/core';
import { TransferRepository } from './transfer.repository';
import { CreateTransferPayload } from './dto/create-transfer.payload';
import { Transfer, TransferFull } from './transfer';
import { TransferQuery } from './transfer.query';
import { Page } from '../../shared/util/page';
import {
  FieldErrorWrapper,
  WrappedResponse,
} from '../../shared/util/field-error-wrapper';

@Injectable({ providedIn: 'root' })
export class TransferService {
  constructor(private repository: TransferRepository) {}

  public async createTransfer(
    payload: CreateTransferPayload,
  ): Promise<WrappedResponse<TransferFull>> {
    return await new FieldErrorWrapper(() =>
      this.repository.createTransfer(payload),
    ).execute();
  }

  public async deleteTransfer(
    transferId: number,
  ): Promise<WrappedResponse<any>> {
    return await new FieldErrorWrapper(() =>
      this.repository.deleteTransfer(transferId),
    ).execute();
  }

  public async searchTransfers(
    query: TransferQuery,
  ): Promise<WrappedResponse<Page<Transfer>>> {
    return await new FieldErrorWrapper(() =>
      this.repository.searchTransfers(query),
    ).execute();
  }
}
