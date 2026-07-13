import { Injectable, signal, computed } from '@angular/core';
import { WikiPage } from '../models/wiki.model';

@Injectable({
  providedIn: 'root'
})
export class WikiService {
  private apiUrl = '/api/wiki';

  private pagesSignal = signal<WikiPage[]>([]);
  public pages = this.pagesSignal.asReadonly();
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor() {}

  async loadPages() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Failed to load wiki pages');
      const data = await response.json();
      this.pagesSignal.set(data);
    } catch (err: any) {
      this.error.set(err.message);
    } finally {
      this.loading.set(false);
    }
  }

  async getPage(slug: string): Promise<WikiPage | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${slug}`);
      if (!response.ok) {
         if (response.status === 404) return null;
         throw new Error('Failed to load page');
      }
      return await response.json();
    } catch (err: any) {
      console.error(err);
      return null;
    }
  }

  async createPage(title: string, content: string, authorId: string): Promise<WikiPage> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, authorId })
    });
    if (!response.ok) throw new Error('Failed to create page');
    const newPage = await response.json();
    this.pagesSignal.update(pages => [newPage, ...pages]);
    return newPage;
  }

  async updatePage(slug: string, title: string, content: string, authorId: string): Promise<WikiPage> {
    const response = await fetch(`${this.apiUrl}/${slug}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, authorId })
    });
    if (!response.ok) throw new Error('Failed to update page');
    const updated = await response.json();
    this.pagesSignal.update(pages => pages.map(p => p.slug === slug ? updated : p));
    return updated;
  }

  async restoreHistory(slug: string, historyId: string, authorId: string): Promise<WikiPage> {
    const response = await fetch(`${this.apiUrl}/${slug}/restore/${historyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ authorId })
    });
    if (!response.ok) throw new Error('Failed to restore history');
    const restored = await response.json();
    this.pagesSignal.update(pages => pages.map(p => p.slug === slug ? restored : p));
    return restored;
  }
}
