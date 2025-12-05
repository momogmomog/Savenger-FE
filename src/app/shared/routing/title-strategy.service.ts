import { Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BasicTitleStrategy extends TitleStrategy {
  constructor(private readonly title: Title) {
    super();
  }

  override updateTitle(routerState: RouterStateSnapshot): void {
    const title = this.buildTitle(routerState);
    // const localSuffix = environment.isLocal ? ' Local' : '';
    const localSuffix = '';
    if (title !== undefined) {
      this.title.setTitle(`${title} - ${environment.appName}${localSuffix}`);
    } else {
      this.title.setTitle(environment.appName);
    }
  }
}
