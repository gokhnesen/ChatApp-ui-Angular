import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, LOCALE_ID } from '@angular/core';
import { Member } from '../_models/member';


const httpOptions={
  headers:new HttpHeaders({
    'Authorization':'Bearer ' + JSON.parse(localStorage.getItem('user'))?.token
  })
}

@Injectable({
  providedIn: 'root'
})
export class MembersService {
baseUrl='https://localhost:44391/api/'
  constructor(
    private http:HttpClient
  ) { }

  getMembers(){
    return this.http.get<Member[]>(this.baseUrl+'users',httpOptions);
  }

  getMember(username:string){
    return this.http.get<Member>(this.baseUrl +'users/'+username,httpOptions);
  }
}
