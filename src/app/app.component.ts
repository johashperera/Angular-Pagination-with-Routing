import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
} from '@angular/core';
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
  previousRating = '';

  form!: FormGroup;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.appendToUrl();

    this.form = this.fb.group({
      ratingFilter: ['', []],
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
    this.fetchData();
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
    this.appendToUrl();
  }

  onSelectionChange(e: Event) {
    const selectedValue = (e.target as HTMLSelectElement).value;
    if (selectedValue !== null && selectedValue !== this.selectedRating) {
      // selectedRating: '', selectedValue: 7
      this.previousRating = this.selectedRating;
      this.selectedRating = selectedValue;
      this.appendToUrl();
    }
  }

  @HostListener('window:popstate')
  onPopState() {
    this.route.queryParamMap.subscribe((params) => {
      const pageNumber = params.get('page'); // 2
      const rating = params.get('rating'); // 7

      if (pageNumber && parseInt(pageNumber as string) !== this.currentPage) {
        //pageNumber 2 | currentPage 2

        this.currentPage = parseInt(pageNumber as string);
        this.appendToUrl();
      }
      console.log('Rating', rating);
      console.log('Selected Rating', this.selectedRating);
      console.log('Previous Rating', this.previousRating);
      if (rating !== this.selectedRating) {
        this.patchRating(this.previousRating);
      }
    });
  }
}

/* 
  Steps

  Go to page 2 
  Select rating : selected 7
  Go back to default rating : expected All
  Go back to page 1 : expect page 1 with default rating
  Select rating : selected 6
  Go to page 4 : expected to see page 4 with rating 6
  Select rating : selected 3
  Go back to previous rating : expect rating 6
  GO back to page 1 : expect page 1 with rating 6
  Go back to default rating : expect rating default
  
*/
