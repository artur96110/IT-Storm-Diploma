import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-document',
  templateUrl: './document.component.html',
  styleUrls: ['./document.component.scss']
})
export class DocumentComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  public goToSignup(): void {
    this.router.navigate(['/signup']);
  }



}
