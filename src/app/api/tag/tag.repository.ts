import { Injectable } from '@angular/core';
import { HttpClientSecuredService } from '../../shared/http/http-client-secured.service';
import { Observable } from 'rxjs';
import { Endpoints } from '../../shared/http/endpoints';
import { Page } from '../../shared/util/page';
import { CreateTagPayload } from './create-tag.payload';
import { TagQuery } from './tag.query';
import { Tag } from './tag';

@Injectable({ providedIn: 'root' })
export class TagRepository {
  constructor(private http: HttpClientSecuredService) {}

  public create(payload: CreateTagPayload): Observable<Tag> {
    return this.http.post<CreateTagPayload, Tag>(Endpoints.TAGS, payload);
  }

  public search(payload: TagQuery): Observable<Page<Tag>> {
    return this.http.post<TagQuery, Page<Tag>>(Endpoints.TAGS_SEARCH, payload);
  }
}
