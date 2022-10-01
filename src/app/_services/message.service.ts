import { Message } from './../_models/message';
import { map } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from '../_models/pagination';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl='https://localhost:44391/api/'

  constructor(
    private http:HttpClient
  ) {

   }

  getMessages(pageNumber,pageSize,container){
    let params=this.getPaginationHeaders(pageNumber,pageSize);
    params=params.append('Container',container);
    return this.getPaginatedResult<Message[]>(this.baseUrl+'messages',params);

  }

  getMessageThread(username:string){
    return this.http.get<Message[]>(this.baseUrl+'messages/thread/'+username);
  }

  private getPaginatedResult<T>(url,params) {
    const paginatedResult:PaginatedResult<T>=new PaginatedResult<T>();

    return this.http.get<T>(this.baseUrl + 'users', { observe: 'response', params }).pipe(
      map(response => {
        paginatedResult.result = response.body;
        if (response.headers.get('Pagination') !== null) {
          paginatedResult.pagination = JSON.parse(response.headers.get('Pagination'));
        }
        return paginatedResult;
      })

    );
  }

private getPaginationHeaders(pageNumber:number,pageSize:number){
  let params=new HttpParams();
    params=params.append('pageNumber',pageNumber.toString());
    params=params.append('pageSize',pageSize.toString());
return params;

}

sendMessage(username:string,content:string){
  return this.http.post<Message>(this.baseUrl+'messages',{recipientUsername:username,content})
}

deleteMessage(id:number){
  return this.http.delete(this.baseUrl + 'messages/' + id);
}
}
