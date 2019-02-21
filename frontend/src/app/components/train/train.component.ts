import { Component, OnInit } from '@angular/core';
import { PageService } from '../../page.service';

@Component({
  selector: 'app-train',
  templateUrl: './train.component.html',
  styleUrls: ['./train.component.css']
})
export class TrainComponent implements OnInit {

  constructor(private pageService : PageService) { }

  ngOnInit() {
  }

}
