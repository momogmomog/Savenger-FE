import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { ObjectUtils } from '../util/object-utils';
import { HttpOptions } from './http-options';
import { HttpHeader } from './http-header';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HttpClientService {
  constructor(protected httpClient: HttpClient) {}

  public get<TResponse>(url: string, options = {}): Observable<TResponse> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.httpClient.get<TResponse>(
          this.getFullUrl(url),
          ObjectUtils.merge<HttpOptions>([options, { headers: headers }]),
        );
      }),
    );
  }

  public post<TData, TResponse>(
    url: string,
    data: TData,
    options = {},
  ): Observable<TResponse> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.httpClient.post<TResponse>(
          this.getFullUrl(url),
          data,
          ObjectUtils.merge<HttpOptions>([options, { headers: headers }]),
        );
      }),
    );
  }

  public put<TData, TResponse>(
    url: string,
    data: TData,
    options = {},
  ): Observable<TResponse> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.httpClient.put<TResponse>(
          this.getFullUrl(url),
          data,
          ObjectUtils.merge<HttpOptions>([options, { headers: headers }]),
        );
      }),
    );
  }

  public patch<TData, TResponse>(
    url: string,
    data: TData,
    options = {},
  ): Observable<TResponse> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.httpClient.patch<TResponse>(
          this.getFullUrl(url),
          data,
          ObjectUtils.merge<HttpOptions>([options, { headers: headers }]),
        );
      }),
    );
  }

  public delete<TResponse>(url: string, options = {}): Observable<TResponse> {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.httpClient.delete<TResponse>(
          this.getFullUrl(url),
          ObjectUtils.merge<HttpOptions>([options, { headers: headers }]),
        );
      }),
    );
  }

  public deleteBody<TData, TResponse>(
    url: string,
    data: TData,
    options = {},
  ): Observable<TResponse> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    options['body'] = data;
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.httpClient.request<TResponse>(
          'DELETE',
          this.getFullUrl(url),
          ObjectUtils.merge<HttpOptions>([options, { headers: headers }]),
        );
      }),
    );
  }

  protected getHeaders(): Observable<HttpHeader> {
    return new Observable<HttpHeader>((subscriber) => subscriber.next({}));
  }

  private getFullUrl(url: string): string {
    return environment.backendUrl + environment.apiUrl + url;
  }
}
