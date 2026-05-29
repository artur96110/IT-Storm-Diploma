import {Component, OnInit, ViewChild} from '@angular/core';
import {OwlOptions} from "ngx-owl-carousel-o";
import {PopupComponent} from "../../shared/components/popup/popup.component";
import {ArticleType} from "../../../types/article.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ArticlesService} from "../../shared/services/articles.service";
import {DefaultResponseType} from "../../../types/default-response.type";
import {PopupStyleType} from 'src/types/popup-style.type';
import {CategoryURLType} from 'src/types/categoryURL.type';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

  customOptions: OwlOptions = {
    nav: false,
    items: 1,
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    dots: true,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 1
      },
      740: {
        items: 1
      },
      940: {
        items: 1
      }
    },
  }

  customOptionsRev: OwlOptions = {
    loop: true,
    mouseDrag: false,
    touchDrag: false,
    pullDrag: false,
    margin: 26,
    dots: false,
    navSpeed: 700,
    navText: ['', ''],
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 3
      }
    },
    nav: false
  }

  @ViewChild(PopupComponent)
  private popupComponent!: PopupComponent;
  popularArticles: ArticleType[] = [];
  reviews = [
    {
      image: 'rev1.png',
      name: 'Станислав',
      text: 'Спасибо огромное АйтиШторму за прекрасный блог с полезными статьями! Именно они и побудили меня\n' +
        '                углубиться в тему SMM и начать свою карьеру.'
    },
    {
      image: 'rev2.png',
      name: 'Алена',
      text: ' Обратилась в АйтиШторм за помощью копирайтера. Ни разу ещё не пожалела! Ребята действительно вкладывают\n' +
        '                душу в то, что делают, и каждый текст, который я получаю, с нетерпением хочется выложить в сеть.\n' +
        '             '
    },
    {
      image: 'rev3.png',
      name: 'Мария',
      text: 'Команда АйтиШторма за такой короткий промежуток времени сделала невозможное: от простой фирмы по услуге\n' +
        '                продвижения выросла в мощный блог о важности личного бренда. Класс!'
    },
    {
      image: 'rev4.jpg',
      name: 'Виктория',
      text: 'От всей души благодарю команду ITStorm за создание идеального сайта — современного, удобного и\n' +
        '                функционального! Вы воплотили мои мечты в реальность.'
    },
    {
      image: 'rev5.jpg',
      name: 'Елена',
      text: ' Выражаю огромную признательность специалистам ITStorm за эффективное продвижение моего ресурса!\n' +
        '                Благодаря вам сайт стал узнаваемым и успешным.'
    },
    {
      image: 'rev6.jpg',
      name: 'Наташа',
      text: 'Искренне благодарю АйтиШторма за качественную рекламу! Ваша работа принесла мне новых клиентов и повысила\n' +
        '                мою прибыль.'
    },
  ];

  constructor(private articlesService: ArticlesService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.articlesService.getPopularArticles()
      .subscribe({
        next: ((data: ArticleType[]) => {
          this.popularArticles = data;
        }),
        error: ((error: DefaultResponseType) => {
          if (error.message) {
            this._snackBar.open(error.message)
          } else {
            this._snackBar.open("Ошибка получения данных!");
          }
        })
      })
  }

  public openPopup(param: PopupStyleType, categoryUrl: CategoryURLType) {
    this.popupComponent.openPopup(param, categoryUrl);
  }

  get currentMonth(): string {
    const now = new Date();
    return this.getMonthName(now.getMonth());
  }

  private getMonthName(monthNumber: number): string {
    const months = [
      'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'
    ];
    return months[monthNumber];
  }

  protected readonly PopupStyleType = PopupStyleType;
  protected readonly CategoryURLType = CategoryURLType;
}
