import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../../shared/http/http-client-secured.service';
import { CreateTransferTransactionPayload } from './create-transfer-transaction.payload';
import { Observable } from 'rxjs';
import { TransferTransaction } from './transfer-transaction';
import { Endpoints } from '../../../shared/http/endpoints';
import { RouteUtils } from '../../../shared/routing/route-utils';

@Injectable({
  providedIn: 'root',
})
export class TransferTransactionRepository {
  constructor(private http: HttpClientSecuredService) {}

  public createTransferTransaction(
    payload: CreateTransferTransactionPayload,
  ): Observable<TransferTransaction> {
    return this.http.post<
      CreateTransferTransactionPayload,
      TransferTransaction
    >(Endpoints.TRANSFER_TRANSACTIONS, payload);
  }

  public getTransferTransaction(
    transferTransactionId: number,
  ): Observable<TransferTransaction> {
    return this.http.get<TransferTransaction>(
      RouteUtils.setPathParams(Endpoints.TRANSFER_TRANSACTION, [
        transferTransactionId,
      ]),
    );
  }

  public deleteTransferTransaction(
    transferTransactionId: number,
  ): Observable<any> {
    return this.http.delete(
      RouteUtils.setPathParams(Endpoints.TRANSFER_TRANSACTION, [
        transferTransactionId,
      ]),
    );
  }
}
