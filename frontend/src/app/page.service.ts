import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PageService {

  uri = 'http://localhost:4000'
  constructor(private http: HttpClient) { }

  getPages() {
    return this.http.get(`${this.uri}/pages`);
  }
  getPageByID (pageId) {
    return this.http.get(`${this.uri}/view/${pageId}`);
  }
  getPageImgById (pageId) {
      return this.http.get(`${this.uri}/view/img/${pageId}`, { responseType: 'blob' });
  }

  trainPage (pageId, modelName, archiName) {
    const body = {
      page_id: pageId,
      model_name: modelName,
      archi: archiName
    };
    console.log("train");
    let http = this.http;
    let uri = this.uri;
    let trainPromise = new Promise(function(success, nosuccess) {
      http.post(`${uri}/train`, body).subscribe((data:any) => {
        let model = data.model_id;
        http.get(`${uri}/model/img/${model}`, { responseType: 'blob' }).subscribe(data => {
          console.log("got img and model");
          success({succ: true, model_id: model, train_img: data});
        }, error => {
          nosuccess({succ: false, reason: error.error});
        });

      }, error => {
        nosuccess({succ: false, reason: error.error});
      });
    });

    return trainPromise;
  }

  saveModel(model_id, model_name) {
    let body = {
      model_id: model_id,
      model_name: model_name
    }
    return this.http.post(`${this.uri}/model/save`, body);
  }

  discardModel(model_id) {
    let body = {
      model_id: model_id
    }
    return this.http.post(`${this.uri}/model/discard`, body);
  }
}
