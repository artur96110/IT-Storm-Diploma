import { Injectable } from '@angular/core';
import {Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class LoaderService {
  isShowed$ = new Subject<boolean>();

  constructor() { }

  public show() {
    this.isShowed$.next(true);
  }

  public hide() {
    this.isShowed$.next(false);
  }
}
