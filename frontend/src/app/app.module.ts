import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';

import { MatListModule , MatToolbarModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatSelectModule, MatIconModule, MatButtonModule, MatCardModule, MatTableModule, MatDividerModule, MatSnackBarModule} from '@angular/material'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TrainComponent } from './components/train/train.component';
import { IndexComponent } from './components/index/index.component';
import { ViewComponent } from './components/view/view.component';
import { InsertComponent } from './insert/insert.component';

import {PageService} from './page.service';

const routes : Routes = [
  {path: 'view/:id', component: ViewComponent},
  {path: 'train:/id', component: TrainComponent},
  {path: 'insert', component: InsertComponent},
  {path: 'index', component: IndexComponent},
  {path: '', redirectTo: 'index', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    TrainComponent,
    IndexComponent,
    ViewComponent,
    InsertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NoopAnimationsModule,
    HttpClientModule,
    MatListModule, MatToolbarModule, MatFormFieldModule, MatInputModule, MatOptionModule, MatSelectModule, MatIconModule, MatButtonModule, MatCardModule, MatTableModule, MatDividerModule, MatSnackBarModule,
    RouterModule.forRoot(routes)
  ],
  providers: [PageService],
  bootstrap: [AppComponent]
})
export class AppModule { }
