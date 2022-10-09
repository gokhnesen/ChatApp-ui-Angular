import { Message } from './../_models/message';
import { map, take } from 'rxjs/operators';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PaginatedResult } from '../_models/pagination';
import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr';
import { User } from '../_models/user';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  baseUrl='https://localhost:44391/api/'
  hubUrl='https://localhost:44391/hubs/'
  private hubConnection:HubConnection;
  private messageThreadSource=new BehaviorSubject<Message[]>([]);
  messageThread$=this.messageThreadSource.asObservable();

  constructor(
    private http:HttpClient
  ) {

   }

   createHubConnection(user:User,otherUsername:string){
    this.hubConnection=new HubConnectionBuilder()
    .withUrl(this.hubUrl+'message?user='+otherUsername,{
      accessTokenFactory:()=>user.token
    })
    .withAutomaticReconnect()
    .build();

    this.hubConnection.start().catch(error=>console.log(error));

    this.hubConnection.on('ReceiveMessageThread',messages=>{
      this.messageThreadSource.next(messages);
    });

    this.hubConnection.on('NewMessage',message=>{
      this.messageThread$.pipe(take(1)).subscribe(messages=>{
        this.messageThreadSource.next([...messages,message])
      })
    })
   }

   stopHubConnection(){
    if(this.hubConnection){
      this.hubConnection.stop();


    }
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

async sendMessage(username:string,content:string){
  return this.hubConnection.invoke('SendMessage', {recipientUsername:username,content})
  .catch(error=>console.log(error));
}

deleteMessage(id:number){
  return this.http.delete(this.baseUrl + 'messages/' + id);
}
}
