import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, Validators } from "@angular/forms";
import { DefaultResponseType } from "../../../../types/default-response.type";
import { MatSnackBar } from "@angular/material/snack-bar";
import { RequestsService } from "../../services/requests.service";
import { RequestType } from "../../../../types/request.type";
import { CategoryURLType } from "../../../../types/categoryURL.type";
import { PopupStyleType } from 'src/types/popup-style.type';
import { UserService } from "../../services/user.service";
import { UserInfoType } from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  @ViewChild('popup') popup!: TemplateRef<ElementRef>;

  public auth = this.authService;
  public stylePopup: PopupStyleType = PopupStyleType.consultation;
  public requestError: string | null = null;
  public categories: {url: CategoryURLType, name: string}[] = [
    {url: CategoryURLType.frilans, name: 'Фриланс'},
    {url: CategoryURLType.dizain, name: 'Создание сайтов'},
    {url: CategoryURLType.smm, name: 'Реклама'},
    {url: CategoryURLType.target, name: 'Продвижение'},
    {url: CategoryURLType.kopiraiting, name: 'Копирайтинг'}
  ];

  public popupForm = this.fb.group({
    order: [''],
    name: ['', [Validators.required, Validators.pattern(/^[А-ЯЁ][а-яё]{1,}$/)]],
    phone: ['', [Validators.required, Validators.pattern(/^(\+7|8)[0-9]{9,}$/)]],
  });

  constructor(
    private modalService: NgbModal,
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    private requestsService: RequestsService,
    private authService: AuthService,
    private userService: UserService
  ) {}

  ngOnInit() {
    if (this.authService.getIsLoggedIn()) {
      this.loadUserName();
    }
  }

  public openPopup(param: PopupStyleType, categoryUrl?: CategoryURLType): void {
    this.stylePopup = param;
    this.requestError = null;
    const wasNameDisabled = this.popupForm.get('name')?.disabled;
    this.popupForm.reset();

    if (param === PopupStyleType.order && categoryUrl) {
      this.popupForm.get('order')?.setValue(categoryUrl);
    }

    if (wasNameDisabled) {
      this.popupForm.get('name')?.disable();
    }

    if (this.authService.getIsLoggedIn()) {
      this.loadUserName();
    }

    this.modalService.open(this.popup);
  }

  public closePopup() {
    this.requestError = null;
    this.popupForm.get('order')?.markAsUntouched();
    this.popupForm.get('name')?.markAsUntouched();
    this.popupForm.get('phone')?.markAsUntouched();
    this.modalService.dismissAll();
  }

  public callBack(type: PopupStyleType) {
    if (type === PopupStyleType.order) {
      if (this.popupForm.valid && this.popupForm.get('name')?.value && this.popupForm.get('phone')?.value && this.popupForm.get('order')?.value) {
        const params: RequestType = {
          name: this.popupForm.get('name')?.value!,
          phone: this.popupForm.get('phone')?.value!,
          service: this.popupForm.get('order')?.value!,
          type: type,
        }

        this.requestsService.sendRequestOrder(params)
          .subscribe({
            next: ((data: DefaultResponseType) => {
              if (!data.error) {
                this.stylePopup = PopupStyleType.success;
              }
            }),
            error: (() => {
              this.requestError = 'Ошибка при отправке формы. Попробуйте еще раз';
            })
          });
      }
    }

    if (type === PopupStyleType.consultation) {
      if (this.popupForm.valid && this.popupForm.get('name')?.value && this.popupForm.get('phone')?.value) {
        const params: RequestType = {
          name: this.popupForm.get('name')?.value!,
          phone: this.popupForm.get('phone')?.value!,
          type: type,
        }

        this.requestsService.sendRequestConsultation(params)
          .subscribe({
            next: ((data: DefaultResponseType) => {
              if (!data.error) {
                this.stylePopup = PopupStyleType.success;
              }
            }),
            error: (() => {
              this.requestError = 'Ошибка при отправке формы. Попробуйте еще раз';
            })
          });
      }
    }
  }

  private loadUserName(): void {
    this.userService.getUserInfo().subscribe({
      next: (data: UserInfoType | DefaultResponseType) => {
        if (!('error' in data)) {
          const userName = (data as UserInfoType).name;
          this.popupForm.get('name')?.setValue(userName);
          this.popupForm.get('name')?.disable();
        }
      },
      error: () => {
        this._snackBar.open('Ошибка загрузки данных пользователя!');
      }
    });
  }

  protected readonly PopupStyleType = PopupStyleType;
}
