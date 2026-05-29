import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {RouterModule} from "@angular/router";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {PopupComponent} from "./components/popup/popup.component";
import {LoaderComponent} from "./components/loader/loader.component";
import {ArticleCardComponent} from "./components/article-card/article-card.component";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";

@NgModule({
  declarations: [
    PopupComponent,
    ArticleCardComponent,
    LoaderComponent,
  ],
  imports: [
    CommonModule,
    NgbModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    MatProgressSpinnerModule
  ],
  exports: [
    PopupComponent,
    ArticleCardComponent,
    LoaderComponent,
  ]
})
export class SharedModule {
}
