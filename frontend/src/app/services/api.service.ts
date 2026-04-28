import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);

  private get apiUrl(): string {
    const isProd = ('__PRODUCTION__' as string) === 'true';
    if (isProd) {
      return '/api';
    }
    return '/api';
  }

  getRoasts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/roasts`);
  }
}
