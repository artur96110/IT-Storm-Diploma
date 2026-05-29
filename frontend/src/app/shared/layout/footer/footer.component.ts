import {Component, OnInit, ViewChild} from '@angular/core';
import {PopupComponent} from "../../components/popup/popup.component";
import {ActiveMenuService} from "../../services/active-menu.service";
import {CategoryURLType} from "../../../../types/categoryURL.type";
import { PopupStyleType } from 'src/types/popup-style.type';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})

export class FooterComponent implements OnInit {

  @ViewChild(PopupComponent)
  private popupComponent!: PopupComponent;

  constructor(private activeMenu: ActiveMenuService) { }

  ngOnInit(): void {
  }

 public ngAfterViewChecked() {
    this.activeMenu.activeMenuItem();
  }

  public openPopup(param: PopupStyleType) {
    this.popupComponent.openPopup(param, CategoryURLType.smm);
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  protected readonly PopupStyleType = PopupStyleType;
}
