import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {UserService} from "../../services/user.service";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {UserInfoType} from "../../../../types/user-info.type";
import {HttpErrorResponse} from "@angular/common/http";
import {ActiveMenuService} from "../../services/active-menu.service";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  userLogged: boolean;
  userName: string | null = null;

  constructor(
    private authService: AuthService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private userService: UserService,
    private activeMenu: ActiveMenuService
  ) {
    this.userLogged = this.authService.getIsLoggedIn();
  }

  ngOnInit(): void {

    if (this.userLogged) {
      this.getUserName();
    }

    this.authService.isLogged$.subscribe((isLoggedIn: boolean) => {
      this.userLogged = isLoggedIn;

      if (isLoggedIn) {
        this.getUserName();
      } else {
        this.userName = null;
      }
    });
  }

  public ngAfterViewChecked() {
    this.activeMenu.activeMenuItem();
  }

  public logOut(): void {
    this.authService.logout()
      .subscribe({
        next: () => {
          this.doLogOut();
        },
        error: () => {
          this.doLogOut();
        }
      })
  }

  public doLogOut(): void {
    this.authService.removeTokens();
    this.authService.userId = null;
    this.userName = null;
    this.userLogged = false;
    this._snackBar.open('Вы успешно вышли из системы!');
    this.router.navigate(['/']);
  }

  public getUserName() {

    if (!this.authService.getIsLoggedIn()) {
      return;
    }

    this.userService.getUserInfo()
      .subscribe({
        next: ((data: DefaultResponseType | UserInfoType) => {

          let error = null;

          if ((data as DefaultResponseType).error !== undefined) {
            error = (data as DefaultResponseType).message;
          }

          const userInfo = data as UserInfoType;

          if (!userInfo.id || !userInfo.name || !userInfo.email) {
            this._snackBar.open('Ошибка! Не полные данные пользователя!');
            return;
          }

          if (error) {
            return;
          }

          this.userName = userInfo.name;
        }),

        error: ((errorResponse: HttpErrorResponse) => {

          if (errorResponse.status === 401) {
            return;
          }

          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open(errorResponse.error.message);
          } else {
            this._snackBar.open('Ошибка при запросе данных пользователя!');
          }
        })
      })
  }
}
