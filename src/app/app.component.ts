import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

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
  selectedRating = '';

  form!: FormGroup;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.appendToUrl();

    this.form = this.fb.group({
      ratingFilter: ['', []],
    });

    this.route.queryParamMap.subscribe((value) => {
      const page = value.get('page');
      const rating = value.get('rating');
      if (rating == null) {
        this.patchRating('');
      } else {
        this.patchRating(rating);
      }

      if (page) {
        this.currentPage = parseInt(page as string);
      } else {
        this.currentPage = 1;
      }

      this.fetchData();
    });
  }

  fetchData(): void {
    this.http
      .get<any>(
        `https://yts.mx/api/v2/list_movies.json/movies?limit=${
          this.limit
        }&page=${this.currentPage}${
          this.selectedRating !== ''
            ? `&minimum_rating=${this.selectedRating}`
            : ''
        }`
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
      queryParams: {
        page: this.currentPage,
        rating: this.selectedRating !== '' ? this.selectedRating : null,
      },
      queryParamsHandling: 'merge',
    });
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.appendToUrl();
  }

  patchRating(rating: string): void {
    this.form.patchValue({
      ratingFilter: rating,
    });
    this.selectedRating = rating;
  }

  onSelectionChange(e: Event) {
    const selectedValue = (e.target as HTMLSelectElement).value;
    this.selectedRating = selectedValue;
    this.appendToUrl();
  }
}
