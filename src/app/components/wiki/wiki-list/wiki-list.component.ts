import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { WikiService } from '../../../services/wiki.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-wiki-list',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule, MatCardModule],
  template: `
    <div class="wiki-container">
      <div class="header">
        <h1>Wiki Pages</h1>
        <button mat-flat-button color="primary" routerLink="/wiki/new/edit">
          <mat-icon>add</mat-icon> New Page
        </button>
      </div>

      <div class="page-grid">
        @if (wikiService.loading()) {
          <p>Loading wiki pages...</p>
        } @else {
          @for (page of wikiService.pages(); track page.id) {
            <mat-card class="page-card" [routerLink]="['/wiki', page.slug]">
              <mat-card-header>
                <mat-card-title>{{ page.title }}</mat-card-title>
                <mat-card-subtitle>Updated: {{ page.updated_at | date:'short' }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <p class="author-info">By Author: {{ page.author_id }}</p>
              </mat-card-content>
            </mat-card>
          }
          @if (wikiService.pages().length === 0) {
            <p class="empty-state">No wiki pages found. Create one!</p>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .wiki-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header h1 {
      margin: 0;
      color: var(--mat-sys-primary);
    }
    .page-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .page-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .page-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }
    .author-info {
      font-size: 0.8rem;
      color: var(--mat-sys-on-surface-variant);
      margin-top: 1rem;
    }
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 3rem;
      color: var(--mat-sys-on-surface-variant);
      background: var(--mat-sys-surface-variant);
      border-radius: 8px;
    }
  `]
})
export class WikiListComponent implements OnInit {
  wikiService = inject(WikiService);

  ngOnInit() {
    this.wikiService.loadPages();
  }
}
