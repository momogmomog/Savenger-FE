import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { CreateTransferPayload } from './dto/create-transfer.payload';
import { Observable } from 'rxjs';
import { Transfer, TransferFull } from './transfer';
import { Endpoints } from '../../shared/http/endpoints';
import { RouteUtils } from '../../shared/routing/route-utils';
import { TransferQuery } from './transfer.query';
import { Page } from '../../shared/util/page';

@Injectable({ providedIn: 'root' })
export class TransferRepository {
  constructor(private http: HttpClientSecuredService) {}

  public createTransfer(
    payload: CreateTransferPayload,
  ): Observable<TransferFull> {
    return this.http.put<CreateTransferPayload, TransferFull>(
      Endpoints.TRANSFERS,
      payload,
    );
  }

  public deleteTransfer(transferId: number): Observable<any> {
    return this.http.delete(
      RouteUtils.setPathParams(Endpoints.TRANSFER, [transferId]),
    );
  }

  public searchTransfers(query: TransferQuery): Observable<Page<Transfer>> {
    return this.http.post<TransferQuery, Page<Transfer>>(
      Endpoints.TRANSFERS_SEARCH,
      query,
    );
  }
}
