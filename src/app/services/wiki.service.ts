import { Injectable, signal } from '@angular/core';
import { WikiPage } from '../models/wiki.model';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WikiService {
  private apiUrl = '/api/wiki';

  private pagesSignal = signal<WikiPage[]>([]);
  public pages = this.pagesSignal.asReadonly();
  public loading = signal<boolean>(false);
  public error = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  async loadPages() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const data = await firstValueFrom(this.http.get<WikiPage[]>(this.apiUrl));
      this.pagesSignal.set(data);
    } catch (err: any) {
      this.error.set(err.message || 'Failed to load wiki pages');
    } finally {
      this.loading.set(false);
    }
  }

  async getPage(slug: string): Promise<WikiPage | null> {
    try {
      return await firstValueFrom(this.http.get<WikiPage>(`${this.apiUrl}/${slug}`));
    } catch (err: any) {
      console.error(err);
      return null;
    }
  }

  async createPage(title: string, content: string, authorId: number | null): Promise<WikiPage> {
    const newPage = await firstValueFrom(
      this.http.post<WikiPage>(this.apiUrl, { title, content, authorId })
    );
    this.pagesSignal.update(pages => [newPage, ...pages]);
    return newPage;
  }

  async updatePage(slug: string, title: string, content: string, authorId: number | null): Promise<WikiPage> {
    const updated = await firstValueFrom(
      this.http.put<WikiPage>(`${this.apiUrl}/${slug}`, { title, content, authorId })
    );
    this.pagesSignal.update(pages => pages.map(p => p.slug === slug ? updated : p));
    return updated;
  }

  async restoreHistory(slug: string, historyId: string, authorId: number | null): Promise<WikiPage> {
    const restored = await firstValueFrom(
      this.http.post<WikiPage>(`${this.apiUrl}/${slug}/restore/${historyId}`, { authorId })
    );
    this.pagesSignal.update(pages => pages.map(p => p.slug === slug ? restored : p));
    return restored;
  }
}
