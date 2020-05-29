import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AppSettings} from '../../app-settings';


@Injectable({
  providedIn: 'root'
})


export class DownloadCsvFileService {

  constructor(public http: HttpClient) { }

    downloadFile(requestPath): Observable<any>{
        return this.http.get(AppSettings.URL_BACKEND + requestPath, {responseType: 'blob'});
    }

}
