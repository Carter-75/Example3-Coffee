import { Component, signal, inject, OnInit, viewChild, ElementRef, afterNextRender, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';

gsap.registerPlugin(ScrollTrigger);

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
  private scene?: THREE.Scene;
  private camera?: THREE.PerspectiveCamera;
  private renderer?: THREE.WebGLRenderer;
  private particles: THREE.Points[] = [];
  private animationFrameId?: number;
  private lenis?: Lenis;

  constructor() {
    afterNextRender(() => {
      this.initLenis();
      this.initThreeJS();
      
      setTimeout(() => {
        this.initGSAP();
      }, 100);

      window.addEventListener('resize', this.handleResize);
    });
  }

  ngOnInit() {
    this.api.getRoasts().subscribe({
      next: (data) => this.roasts.set(data),
      error: (err) => console.error('Failed to load roasts:', err)
    });
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.renderer) this.renderer.dispose();
    if (this.lenis) this.lenis.destroy();
    ScrollTrigger.getAll().forEach(t => t.kill());
  }

  private initLenis() {
    this.lenis = new Lenis({
      duration: 1.8, // slower for luxury feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
    });

    const raf = (time: number) => {
      this.lenis?.raf(time);
      ScrollTrigger.update();
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  private initGSAP() {
    // Fade in content
    gsap.utils.toArray('.gs-reveal').forEach((elem: any) => {
      gsap.fromTo(elem, 
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.5,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    });

    // Expand gold lines
    gsap.utils.toArray('.gold-line').forEach((elem: any) => {
      gsap.fromTo(elem,
        { width: 0 },
        {
          width: '100%',
          duration: 2,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 90%'
          }
        }
      );
    });
  }

  private initThreeJS() {
    const el = this.container()?.nativeElement;
    if (!el) return;

    this.scene = new THREE.Scene();
    // Dark fog for depth
    this.scene.fog = new THREE.FogExp2(0x0A0A0A, 0.02);
    
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 25;

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    el.appendChild(this.renderer.domElement);

    // Create luxury gold dust particles
    const geometry = new THREE.BufferGeometry();
    const particlesCount = 400;
    const posArray = new Float32Array(particlesCount * 3);
    const scaleArray = new Float32Array(particlesCount);

    for(let i = 0; i < particlesCount * 3; i++) {
      posArray[i] = (Math.random() - 0.5) * 60;
    }
    for(let i = 0; i < particlesCount; i++) {
      scaleArray[i] = Math.random();
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('aScale', new THREE.BufferAttribute(scaleArray, 1));

    // Using a simple PointsMaterial for gold dust
    const material = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xD4AF37,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });

    const particlesMesh = new THREE.Points(geometry, material);
    this.scene.add(particlesMesh);
    this.particles.push(particlesMesh);

    // Subtle lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      this.animationFrameId = requestAnimationFrame(animate);
      
      particlesMesh.rotation.y += 0.0005;
      particlesMesh.rotation.x += 0.0002;
      
      // Floating effect
      particlesMesh.position.y = Math.sin(Date.now() * 0.0005) * 1.5;

      // Parallax effect with mouse
      gsap.to(particlesMesh.position, {
        x: mouseX * 2,
        y: mouseY * 2,
        duration: 3,
        ease: 'power2.out'
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();

    const origDestroy = this.ngOnDestroy.bind(this);
    this.ngOnDestroy = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      origDestroy();
    };
  }

  private handleResize = () => {
    if (this.camera && this.renderer) {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
  };
}
