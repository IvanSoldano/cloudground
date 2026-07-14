import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WikiService } from '../../../services/wiki.service';
import { WikiPage } from '../../../models/wiki.model';
import { SupabaseAuthService } from '../../../services/supabase-auth.service';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

@Component({
  selector: 'app-wiki-page',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule,
    MatButtonModule, 
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="wiki-page-container">
      @if (loading()) {
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
          <p>Loading page...</p>
        </div>
      } @else if (page() || isNewPage()) {
        <div class="page-header">
          <div class="header-left">
            <button mat-icon-button routerLink="/wiki" color="primary">
              <mat-icon>arrow_back</mat-icon>
            </button>
            @if (!isEditing()) {
              <h1>{{ page()?.title }}</h1>
            }
          </div>
          
          <div class="header-actions">
            @if (!isEditing()) {
              <!-- History Menu -->
              @if (page()?.history && page()!.history!.length > 0) {
                <button mat-button [matMenuTriggerFor]="historyMenu">
                  <mat-icon>history</mat-icon> History
                </button>
                <mat-menu #historyMenu="matMenu">
                  @for (hist of page()!.history; track hist.id) {
                    <button mat-menu-item (click)="restoreHistory(hist.id)">
                      Restore {{ hist.created_at | date:'short' }}
                    </button>
                  }
                </mat-menu>
              }
              
              <button mat-flat-button color="primary" (click)="toggleEdit()">
                <mat-icon>edit</mat-icon> Edit
              </button>
            } @else {
              <button mat-button (click)="cancelEdit()">Cancel</button>
              <button mat-flat-button color="primary" (click)="savePage()">
                <mat-icon>save</mat-icon> Save
              </button>
            }
          </div>
        </div>

        <div class="page-content">
          @if (isEditing()) {
            <div class="editor-mode">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Page Title</mat-label>
                <input matInput [(ngModel)]="editTitle" placeholder="Enter title...">
              </mat-form-field>
              
              <mat-form-field appearance="outline" class="full-width editor-field">
                <mat-label>Markdown Content</mat-label>
                <textarea matInput [(ngModel)]="editContent" rows="20" class="markdown-textarea"></textarea>
              </mat-form-field>
            </div>
          } @else {
            <div class="markdown-content" [innerHTML]="renderedHtml()"></div>
            <div class="page-meta">
              Last updated on {{ page()?.updated_at | date:'medium' }} by {{ page()?.author_name }}
            </div>
          }
        </div>
      } @else {
        <div class="not-found">
          <h2>Page not found</h2>
          <button mat-flat-button color="primary" routerLink="/wiki">Back to Wiki</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .wiki-page-container {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }
    .loading-state, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      gap: 1rem;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      border-bottom: 1px solid var(--mat-sys-outline-variant);
      padding-bottom: 1rem;
    }
    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    .header-left h1 {
      margin: 0;
      color: var(--mat-sys-on-surface);
    }
    .header-actions {
      display: flex;
      gap: 0.5rem;
    }
    .full-width {
      width: 100%;
    }
    .editor-field ::ng-deep .mat-mdc-text-field-wrapper {
      padding: 0;
    }
    .markdown-textarea {
      font-family: 'Courier New', Courier, monospace;
      font-size: 1rem;
      line-height: 1.5;
    }
    .markdown-content {
      line-height: 1.6;
      color: var(--mat-sys-on-surface);
      font-size: 1.1rem;
    }
    .markdown-content h1, .markdown-content h2, .markdown-content h3 {
      color: var(--mat-sys-primary);
      margin-top: 1.5em;
      margin-bottom: 0.5em;
    }
    .markdown-content pre {
      background: var(--mat-sys-surface-variant);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
    }
    .markdown-content code {
      background: var(--mat-sys-surface-variant);
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: monospace;
    }
    .markdown-content blockquote {
      border-left: 4px solid var(--mat-sys-primary);
      margin: 0;
      padding-left: 1rem;
      color: var(--mat-sys-on-surface-variant);
    }
    .page-meta {
      margin-top: 3rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--mat-sys-outline-variant);
      font-size: 0.85rem;
      color: var(--mat-sys-on-surface-variant);
    }
  `]
})
export class WikiPageComponent implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  wikiService = inject(WikiService);
  authService = inject(SupabaseAuthService);

  page = signal<WikiPage | null>(null);
  loading = signal<boolean>(true);
  isEditing = signal<boolean>(false);
  isNewPage = signal<boolean>(false);

  editTitle = '';
  editContent = '';
  renderedHtml = signal<string>('');

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      const slug = params.get('slug');
      if (slug === 'new') {
        this.isNewPage.set(true);
        this.isEditing.set(true);
        this.page.set(null);
        this.loading.set(false);
      } else if (slug) {
        this.isNewPage.set(false);
        this.isEditing.set(false);
        await this.loadPage(slug);
      }
    });
  }

  async loadPage(slug: string) {
    this.loading.set(true);
    const fetchedPage = await this.wikiService.getPage(slug);
    this.page.set(fetchedPage);
    this.updateRenderedContent();
    this.loading.set(false);
  }

  async updateRenderedContent() {
    const content = this.page()?.content || '';
    if (content) {
      // Parse markdown to HTML and sanitize
      const rawHtml = await marked.parse(content);
      const safeHtml = DOMPurify.sanitize(rawHtml);
      this.renderedHtml.set(safeHtml);
    } else {
      this.renderedHtml.set('');
    }
  }

  toggleEdit() {
    const p = this.page();
    this.editTitle = p?.title || '';
    this.editContent = p?.content || '';
    this.isEditing.set(true);
  }

  cancelEdit() {
    if (this.isNewPage()) {
      this.router.navigate(['/wiki']);
    } else {
      this.isEditing.set(false);
    }
  }

  async savePage() {
    let authorId: number | null = null;
    try {
      const user = await firstValueFrom(this.authService.currentUser$);
      authorId = user?.persona_id || null;
    } catch (e) {
      console.warn('Could not get current user', e);
    }

    this.loading.set(true);
    
    try {
      if (this.isNewPage()) {
        const newPage = await this.wikiService.createPage(this.editTitle, this.editContent, authorId);
        this.router.navigate(['/wiki', newPage.slug]);
      } else {
        const p = this.page()!;
        const updated = await this.wikiService.updatePage(p.slug, this.editTitle, this.editContent, authorId);
        // Reload page to get updated history
        await this.loadPage(updated.slug);
        this.isEditing.set(false);
      }
    } catch (err) {
      console.error('Failed to save', err);
    } finally {
      this.loading.set(false);
    }
  }

  async restoreHistory(historyId: string) {
    const p = this.page();
    if (!p) return;
    
    if (confirm('Are you sure you want to restore this version? Your current version will be saved to history.')) {
      this.loading.set(true);
      try {
        let authorId: number | null = null;
        try {
          const user = await firstValueFrom(this.authService.currentUser$);
          authorId = user?.persona_id || null;
        } catch (e) {
          console.warn('Could not get current user', e);
        }
        
        const restored = await this.wikiService.restoreHistory(p.slug, historyId, authorId);
        await this.loadPage(restored.slug);
      } catch (err) {
        console.error('Failed to restore', err);
      } finally {
        this.loading.set(false);
      }
    }
  }
}
