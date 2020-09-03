import { Injectable } from '@angular/core'
import { tap, map, switchMap, pluck } from 'rxjs/operators'
import { Observable, Subject } from 'rxjs'
import { HttpParams, HttpClient } from '@angular/common/http'


export interface Article {
  title: string
  url: string
  source: {
    name: string
  }
}

export interface NewsApiResponse {
  totalResults: number
  articles: Article[]
}

@Injectable({
  providedIn: 'root'
})
export class NewsApiService {

  private url = 'https://newsapi.org/v2/top-headlines'
  private pageSize = 10
  private apiKey = '0674a71416124d07aa62aedbae11b4cc'
  private country = 'us'

  pagesInput: Subject<number>
  pagesOutput: Observable<Article[]>
  numberOfPages: Subject<number>

  constructor(private http: HttpClient) {
    this.numberOfPages = new Subject()
    this.pagesInput = new Subject()
    this.pagesOutput = this.pagesInput.pipe(
      map((page) => {
        return new HttpParams()
          .set('apiKey', this.apiKey)
          .set('country', this.country)
          .set('pageSize', String(this.pageSize))
          .set('page', String(page))
      }),
      switchMap(params => {
        return this.http.get<NewsApiResponse>(this.url, { params })
      }),
      tap(response => {
        const totalPages = Math.ceil(response.totalResults / this.pageSize)
        this.numberOfPages.next(totalPages)
      }),
      pluck('articles')
    )
  }

  getPage(page: number) {
    this.pagesInput.next(page)
  }
}