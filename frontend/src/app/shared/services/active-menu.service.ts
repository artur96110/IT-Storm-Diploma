import { Injectable } from '@angular/core';
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class ActiveMenuService {

  constructor(private router: Router) { }
  public activeMenuItem(): void {
    const links = [
      { page: 'offers', headerId: 'offersLink', footerId: 'offersLinkFooter' },
      { page: 'about', headerId: 'aboutLink', footerId: 'aboutLinkFooter' },
      { page: 'blog', headerId: 'blogsLink', footerId: 'blogsLinkFooter' },
      { page: 'reviews', headerId: 'reviewsLink', footerId: 'reviewsLinkFooter' },
      { page: 'contacts', headerId: 'contactsLink', footerId: 'contactsLinkFooter' }
    ];

    for (const link of links) {
      const isCurrentPage = this.router.url.includes(link.page);

      const headerItem = document.getElementById(link.headerId);
      const footerItem = document.getElementById(link.footerId);

      if (isCurrentPage) {
        if (headerItem) headerItem.classList.add('active');
        if (footerItem) footerItem.classList.add('active');
      } else {
        if (headerItem) headerItem.classList.remove('active');
        if (footerItem) footerItem.classList.remove('active');
      }
    }
  }
}
