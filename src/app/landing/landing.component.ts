import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="landing-hero">
      <div class="glow-sphere"></div>
      
      <div class="hero-content">
        <span class="badge">Cloudflare Workers + Angular</span>
        <h1>Welcome to <span class="accent">Cloudground</span></h1>
        <p class="description">
          A high-performance, developer-first platform for building modern web applications 
          at the edge. Experience the power of Cloudflare Workers with a premium Angular interface.
        </p>
        
        <div class="cta-group">
          <a routerLink="/tasks" class="btn btn-primary">
            <span>Explore Task List</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </a>
          <button class="btn btn-secondary">Documentation</button>
        </div>
      </div>
      
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">⚡</div>
          <h3>Edge Native</h3>
          <p>Built to run on the Cloudflare global network for 0ms cold starts.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🛰️</div>
          <h3>Modern Signals</h3>
          <p>State-of-the-art reactivity using Angular Signals for buttery smooth UI.</p>
        </div>
        <div class="feature-card">
          <div class="icon">🛡️</div>
          <h3>Type Safe</h3>
          <p>End-to-end type safety from the Worker API to the frontend components.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-hero {
      position: relative;
      padding: 4rem 1rem;
      text-align: center;
      overflow: hidden;
    }

    .glow-sphere {
      position: absolute;
      top: -10%;
      left: 50%;
      transform: translateX(-50%);
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
      z-index: -1;
      filter: blur(40px);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto 5rem;
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 1rem;
      background: rgba(99, 102, 241, 0.1);
      border: 1px solid rgba(99, 102, 241, 0.2);
      border-radius: 99px;
      color: #818cf8;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
    }

    h1 {
      font-size: clamp(2.5rem, 8vw, 4.5rem);
      font-weight: 850;
      line-height: 1.1;
      margin-bottom: 1.5rem;
      color: white;
      
      .accent {
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    }

    .description {
      font-size: 1.25rem;
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 3rem;
      max-width: 650px;
      margin-left: auto;
      margin-right: auto;
    }

    .cta-group {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
      align-items: center;
    }

    .btn {
      padding: 1rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 1.1rem;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      text-decoration: none;
      display: flex;
      align-items: center;
      gap: 0.75rem;

      &.btn-primary {
        background: #6366f1;
        color: white;
        border: none;
        box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);

        &:hover {
          background: #4f46e5;
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(99, 102, 241, 0.5);
        }
      }

      &.btn-secondary {
        background: rgba(255, 255, 255, 0.05);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.1);

        &:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .feature-card {
      padding: 2.5rem;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      text-align: left;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.04);
        border-color: rgba(255, 255, 255, 0.1);
        transform: translateY(-5px);
      }

      .icon {
        font-size: 2rem;
        margin-bottom: 1.5rem;
      }

      h3 {
        color: white;
        font-size: 1.25rem;
        margin-bottom: 0.75rem;
        font-weight: 700;
      }

      p {
        color: #64748b;
        line-height: 1.5;
        font-size: 0.95rem;
      }
    }
  `]
})
export class LandingComponent {}
