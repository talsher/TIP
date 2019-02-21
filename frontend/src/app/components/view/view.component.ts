import { Component, OnInit , ViewChildren, QueryList  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import {MatTableDataSource, MatSelectionList, MatSelectionListChange, MatListOption} from '@angular/material';

import {PageView, ModelMetadata , ModelTrainResult} from '../../pages.module';

import { PageService } from '../../page.service';
import { SelectionModel } from '@angular/cdk/collections';


@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {

  displayedColumns = ['name', 'img', 'archi', 'models','actions', 'trainImg', 'saveModel', 'trainStatus'];
  defaultNoneModel = 'none';

  page_id : String;
  page : PageView[];
  model_id : String;
  model_name : String = '';

  trainDone : Boolean = false;

  img : any;
  trainImg : any;

  isImageLoading : Boolean;
  isTrainImage : Boolean = false;

  selectedArchi : String ;
  selectedModel : String = "none";

  trainStatus : String = '';

  @ViewChildren('listmodels') listmodels: QueryList<MatSelectionList>;
  modelsSelectionList : MatSelectionList;

  @ViewChildren('listarchi') listarchi: QueryList<MatSelectionList>;
  archiSelectionList : MatSelectionList;

  @ViewChildren('modelOption') modelOptions: QueryList<MatListOption>;

  constructor(private pageService : PageService, private route : ActivatedRoute) { }

  ngOnInit() {
    
    this.route.params.subscribe( params => {
      this.page_id = params.id;
      this.fetchPage();
      this.fetchImage();
    });
  }

  ngAfterViewInit() {
    this.listmodels.changes.subscribe(() => {
      this.modelsSelectionList = this.listmodels.first;

      this.modelsSelectionList.selectionChange.subscribe((s: MatSelectionListChange) => {          
        this.modelsSelectionList.deselectAll();
        s.option.selected = true;
        this.selectedModel = s.option.value;
      });

      setTimeout(() => {
        this.modelsSelectionList.options.first.selected = true;
      });
      
    });
    
    this.listarchi.changes.subscribe(() => {
      this.archiSelectionList = this.listarchi.first;  
      setTimeout(() => {
        this.changedArchi(this.archiSelectionList.options.first.value);
      });
      this.archiSelectionList.selectionChange.subscribe((s: MatSelectionListChange) => {  
        this.changedArchi(s.option.value);        
        this.archiSelectionList.deselectAll();
        s.option.selected = true;
      });

      
      setTimeout(() => {
        this.archiSelectionList.options.first.selected = true;
      });

    });
  }

  changedArchi(archiName) {
    this.selectedArchi = archiName;
    setTimeout(() => {
      this.modelsSelectionList.deselectAll();
      this.modelsSelectionList.options.first.selected = true;
    });
  }

  modelNameChanged(event : any) {
    this.model_name = event.target.value;
  }

  saveModel(model_id : String) {
    console.log(`saving model ${this.model_name}`)
    this.pageService.saveModel(model_id, this.model_name).subscribe( (data) => {
      this.trainDone = true;
      this.trainStatus = "model saved";
      console.log(data);
    });
  }
  discardModel(model_id : String) {
    console.log(`discarding model ${this.model_name}`)
    this.pageService.discardModel(model_id).subscribe( (data) => {
      this.trainDone = true;
      this.trainStatus = "model discarded";
      console.log(data);
    });
  }

  fetchPage() {
    console.log('getting data');
    this.pageService.getPageByID(this.page_id).
      subscribe((data: PageView) => {
          this.page = [data];
          console.log('go data!');
          console.log(data);
      });
  }
  fetchImage()
  {
    this.isImageLoading = true;
    this.pageService.getPageImgById(this.page_id).subscribe(data => {
        this.createPageImageFromBlob(data);
        this.isImageLoading = false;
      }, error => {
        this.isImageLoading = false;
        console.log(error);
      });
  }

  createPageImageFromBlob(image: Blob) {
    let reader = new FileReader();
    reader.addEventListener("load", () => {
       this.img = reader.result;
    }, false);
 
    if (image) {
       reader.readAsDataURL(image);
    }
 }

 createTrainImageFromBlob(image: Blob) {
  let reader = new FileReader();
  reader.addEventListener("load", () => {
    if(reader.error){
      console.log(reader.error);
    }
     this.trainImg = reader.result;
     this.isTrainImage = true;
  }, false);

  if (image) {
    console.log("loading image")
     reader.readAsDataURL(image);
  } else {
    console.log("no image")
  }
}

 trainPage() {
   this.trainDone = false;
   this.isTrainImage = false;
   this.trainStatus = "trainning...";
  this.pageService.trainPage (this.page_id, this.selectedModel, this.selectedArchi).then((data : ModelTrainResult) => {
        console.log("got img");
        console.log(data);
        this.model_id = data.model_id;
        this.createTrainImageFromBlob(data.train_img);
        this.trainStatus = "Done training!";
      }).catch( (error) => {
        this.isTrainImage = false;
        console.log(error);
        this.trainStatus = `Error training: ${error.reason}`;
      });

 }


}
