import {Component, HostListener, OnInit} from '@angular/core';
import {ArticlesService} from "../../../shared/services/articles.service";
import {ArticlesFiltersType} from "../../../../types/articles-filters.type";
import {ArticlesAllType} from "../../../../types/articles-all.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {MatSnackBar} from "@angular/material/snack-bar";
import {ArticleType} from "../../../../types/article.type";
import {CategoriesType} from "../../../../types/categories.type";
import {CategoriesService} from "../../../shared/services/categories.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  filtersOpen: boolean = false;
  activeParams: ArticlesFiltersType = {};
  articles: ArticleType[] = [];
  categories: CategoriesType[] = [];
  iconsFilters: { name: string, url: string }[] = [];
  pages: number[] = [];
  visiblePages: (number | string)[] = [];

  articlesPerPage: number =
    window.innerWidth <= 768 ? 2 :
      window.innerWidth <= 1024 ? 3 : 8;

  constructor(private articlesService: ArticlesService,
              private _snackBar: MatSnackBar,
              private categoriesService: CategoriesService,
              private router: Router,
              private activatedRoute: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.categoriesService.getCategories()
      .subscribe({
        next: (data: CategoriesType[]) => {
          this.categories = data;

          this.activatedRoute.queryParams.subscribe({
            next: (data) => {
              const activeParams: ArticlesFiltersType = {};

              if (data.hasOwnProperty('categories')) {
                activeParams.categories = Array.isArray(data['categories']) ? data['categories'] : [data['categories']];
              }

              if (data.hasOwnProperty('page')) {
                activeParams.page = +data['page'];
              }

              this.activeParams = activeParams;
              this.loadArticles();
              this.updateIconsFilters();
            },
            error: (error: DefaultResponseType) => {
              this._snackBar.open(error.message || "Ошибка получения категорий");
            }
          });
        },
        error: (error: DefaultResponseType) => {
          this._snackBar.open(error.message || "Ошибка получения категорий");
        }
      });
  }

  private loadArticles(): void {
    const requestParams: ArticlesFiltersType = {
      ...this.activeParams,
      itemsPerPage: this.articlesPerPage
    };

    this.articlesService.getArticles(requestParams)
      .subscribe({
        next: (data: ArticlesAllType) => {
          this.pages = [];

          for (let i = 1; i <= data.pages; i++) {
            this.pages.push(i);
          }

          this.updateVisiblePages();

          this.articles = data.items;
        },
        error: (error: DefaultResponseType) => {
          this._snackBar.open(error.message || "Ошибка получения данных");
        }
      });
  }

  private updateVisiblePages(): void {
    const currentPage = this.activeParams.page || 1;
    const totalPages = this.pages.length;

    this.visiblePages = [];

    if (totalPages <= 2) {
      this.visiblePages = this.pages;
      return;
    }

    if (currentPage === totalPages) {
      this.visiblePages = ['...', totalPages - 1, totalPages, '...'];
    } else {
      this.visiblePages = ['...', currentPage, currentPage + 1, '...'];
    }
  }

  private updateIconsFilters(): void {
    this.iconsFilters = [];

    this.activeParams.categories?.forEach(url => {
      const foundCategory = this.categories.find(item => item.url === url);

      if (foundCategory) {
        this.iconsFilters.push({
          name: foundCategory.name,
          url: foundCategory.url
        });
      }
    });
  }

  @HostListener('window:resize')
  onResize(): void {

    let newArticlesPerPage = 8;

    if (window.innerWidth <= 768) {
      newArticlesPerPage = 2;
    } else if (window.innerWidth <= 1024) {
      newArticlesPerPage = 3;
    }

    if (newArticlesPerPage !== this.articlesPerPage) {
      this.articlesPerPage = newArticlesPerPage;

      this.activeParams.page = 1;

      this.router.navigate(['/blog'], {
        queryParams: this.activeParams
      });

      this.loadArticles();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.filtersOpen = false;
  }

  toggleFilters(): void {
    this.filtersOpen = !this.filtersOpen;
  }

  openPage(page: number): void {
    this.activeParams.page = page;

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  openPrevPage(): void {
    if ((this.activeParams.page || 1) > 1) {
      this.activeParams.page = (this.activeParams.page || 1) - 1;

      this.router.navigate(['/blog'], {
        queryParams: this.activeParams
      });
    }
  }

  openNextPage(): void {
    const currentPage = this.activeParams.page || 1;

    if (currentPage < this.pages.length) {
      this.activeParams.page = currentPage + 1;

      this.router.navigate(['/blog'], {
        queryParams: this.activeParams
      });
    }
  }

  updateFilterParam(url: string): void {
    if (this.activeParams.categories && this.activeParams.categories.length > 0) {
      const existingCategoryInParams = this.activeParams.categories.find(item => item === url);

      if (existingCategoryInParams) {
        this.activeParams.categories = this.activeParams.categories.filter(item => item !== url);
      } else {
        this.activeParams.categories = [...this.activeParams.categories, url];
      }
    } else {
      this.activeParams.categories = [url];
    }

    this.activeParams.page = 1;

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  removeIconFilter(url: string): void {
    this.activeParams.categories = this.activeParams.categories?.filter(item => item !== url);
    this.activeParams.page = 1;

    this.router.navigate(['/blog'], {
      queryParams: this.activeParams
    });
  }

  isCategoryActive(url: string): boolean {
    return !!this.activeParams.categories?.includes(url);
  }
}
