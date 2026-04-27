import { Component, signal, inject, OnInit, viewChild, ElementRef, afterNextRender, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import * as Matter from 'matter-js';
import anime from 'animejs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  protected roasts = signal<any[]>([]);

  private container = viewChild<ElementRef<HTMLDivElement>>('scene');
  private engine?: Matter.Engine;
  private render?: Matter.Render;

  constructor() {
    afterNextRender(() => {
      this.initPhysics();
      this.animateLuxe();
    });
  }

  ngOnInit() {
    this.api.getRoasts().subscribe({
      next: (data) => this.roasts.set(data),
      error: (err) => console.error('Failed to load roasts:', err)
    });
  }

  ngOnDestroy() {
    if (this.render) {
      Matter.Render.stop(this.render);
      if (this.render.canvas.parentNode) {
        this.render.canvas.parentNode.removeChild(this.render.canvas);
      }
    }
    if (this.engine) Matter.Engine.clear(this.engine);
  }

  private animateLuxe() {
    anime({
      targets: '.luxe-card',
      opacity: [0, 1],
      scale: [0.95, 1],
      translateY: [20, 0],
      delay: anime.stagger(200),
      easing: 'easeOutExpo'
    });

    anime({
      targets: '.gold-line',
      width: [0, '100%'],
      duration: 2000,
      easing: 'easeInOutQuad'
    });
  }

  private initPhysics() {
    const el = this.container()?.nativeElement;
    if (!el) return;

    this.engine = Matter.Engine.create();
    this.render = Matter.Render.create({
      element: el,
      engine: this.engine,
      options: {
        width: el.clientWidth,
        height: el.clientHeight,
        background: 'transparent',
        wireframes: false
      }
    });

    const ground = Matter.Bodies.rectangle(el.clientWidth / 2, el.clientHeight + 10, el.clientWidth, 20, { isStatic: true });
    Matter.World.add(this.engine.world, ground);

    // Floating gold particles
    const addParticle = () => {
      if (!this.engine) return;
      const x = Math.random() * el.clientWidth;
      const particle = Matter.Bodies.circle(x, el.clientHeight + 10, Math.random() * 2 + 1, {
        render: { fillStyle: '#D4AF37', opacity: 0.3 },
        force: { x: (Math.random() - 0.5) * 0.001, y: -Math.random() * 0.005 },
        frictionAir: 0.02
      });
      Matter.World.add(this.engine.world, particle);
      if (this.engine.world.bodies.length > 30) Matter.World.remove(this.engine.world, this.engine.world.bodies[1]);
    };

    setInterval(addParticle, 1000);
    
    Matter.Runner.run(Matter.Runner.create(), this.engine);
    Matter.Render.run(this.render);
  }
}
