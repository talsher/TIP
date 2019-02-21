import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {MatTableDataSource} from '@angular/material';

import {PageMetadata} from '../../pages.module';


import { PageService } from '../../page.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {

  pages: PageMetadata[];
  displayedColumns = ['name', 'actions'];
  constructor(private pageService : PageService, private router:Router) { }

  ngOnInit() {
    this.fetchPages();
  }

  fetchPages() {
    console.log('getting data');
    this.pageService.getPages().
      subscribe((data: PageMetadata[]) => {
          this.pages = data;
          console.log('go data!');
          console.log(data);
      });
  }

  trainPage(id) {
    this.router.navigate([`/view/${id}`]);
  }

}
