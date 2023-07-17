import { Component, HostListener, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  movies = null;
  collectionSize = 20;
  limit = 5;
  currentPage = 1;
  initialUrl = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initialUrl = this.router.url;
    this.fetchData();
    this.appendToUrl();
  }

  fetchData(): void {
    this.http
      .get<any>(
        `https://yts.mx/api/v2/list_movies.json/movies?limit=${this.limit}&page=${this.currentPage}`
      )
      .subscribe(
        (response) => {
          this.movies = response.data.movies;
        },
        (error) => {
          console.log('Error occurred while fetching data:', error);
        }
      );
  }

  appendToUrl(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: this.currentPage },
      queryParamsHandling: 'merge',
    });
    this.fetchData();
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.appendToUrl();
  }

  @HostListener('window:popstate')
  onPopState() {
    this.route.queryParamMap.subscribe((params) => {
      const pageNumber = params.get('page');
      console.log(pageNumber);
      if (pageNumber && parseInt(pageNumber as string) !== this.currentPage) {
        this.currentPage = parseInt(pageNumber as string);
        this.appendToUrl();
      }
    });
  }
}
