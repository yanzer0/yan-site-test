'use client';
import { cn } from '@/lib/utils';
import React, { useEffect, useRef } from 'react';
import {
	BufferGeometry,
	Float32BufferAttribute,
	Fog,
	PerspectiveCamera,
	Points,
	PointsMaterial,
	Scene,
	WebGLRenderer,
} from 'three';

interface DottedSurfaceProps extends Omit<React.ComponentProps<'div'>, 'ref'> {
	/** Dot color as normalized RGB. Default: brand green #A8E84C. */
	dotColor?: readonly [number, number, number];
	/** Color the far dots fade into; match the page background. */
	fogColor?: number;
	dotOpacity?: number;
}

export function DottedSurface({
	className,
	dotColor = [0.66, 0.91, 0.3],
	fogColor = 0x000000,
	dotOpacity = 0.8,
	...props
}: DottedSurfaceProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const animationRef = useRef<number>(0);
	const rendererRef = useRef<WebGLRenderer | null>(null);

	useEffect(() => {
		if (!containerRef.current) return;

		// Skip heavy WebGL on reduced-motion preference
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const container = containerRef.current;
		const SEPARATION = 150;
		const AMOUNTX = 40;
		const AMOUNTY = 60;

		const scene = new Scene();
		scene.fog = new Fog(fogColor, 2000, 10000);

		const camera = new PerspectiveCamera(
			60,
			window.innerWidth / window.innerHeight,
			1,
			10000,
		);
		camera.position.set(0, 355, 1220);

		const renderer = new WebGLRenderer({
			alpha: true,
			antialias: false,
		});
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.setClearColor(0x000000, 0);
		rendererRef.current = renderer;

		container.appendChild(renderer.domElement);

		// Create particles
		const positions: number[] = [];
		const colors: number[] = [];
		const geometry = new BufferGeometry();

		for (let ix = 0; ix < AMOUNTX; ix++) {
			for (let iy = 0; iy < AMOUNTY; iy++) {
				const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
				const y = 0;
				const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

				positions.push(x, y, z);
				colors.push(dotColor[0], dotColor[1], dotColor[2]);
			}
		}

		geometry.setAttribute(
			'position',
			new Float32BufferAttribute(positions, 3),
		);
		geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));

		const material = new PointsMaterial({
			size: 8,
			vertexColors: true,
			transparent: true,
			opacity: dotOpacity,
			sizeAttenuation: true,
		});

		const points = new Points(geometry, material);
		scene.add(points);

		let count = 0;

		const animate = () => {
			animationRef.current = requestAnimationFrame(animate);

			const positionAttribute = geometry.attributes.position;
			const pos = positionAttribute.array as Float32Array;

			let i = 0;
			for (let ix = 0; ix < AMOUNTX; ix++) {
				for (let iy = 0; iy < AMOUNTY; iy++) {
					const index = i * 3;
					pos[index + 1] =
						Math.sin((ix + count) * 0.3) * 50 +
						Math.sin((iy + count) * 0.5) * 50;
					i++;
				}
			}

			positionAttribute.needsUpdate = true;
			renderer.render(scene, camera);
			count += 0.1;
		};

		const handleResize = () => {
			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();
			renderer.setSize(window.innerWidth, window.innerHeight);
		};

		window.addEventListener('resize', handleResize);
		animate();

		return () => {
			window.removeEventListener('resize', handleResize);
			cancelAnimationFrame(animationRef.current);

			scene.traverse((object) => {
				if (object instanceof Points) {
					object.geometry.dispose();
					if (Array.isArray(object.material)) {
						object.material.forEach((m) => m.dispose());
					} else {
						object.material.dispose();
					}
				}
			});

			renderer.dispose();

			if (container && renderer.domElement.parentNode === container) {
				container.removeChild(renderer.domElement);
			}
			rendererRef.current = null;
		};
		// Colors are read once at mount; rebuilding the WebGL scene on a prop change is not wanted.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<div
			ref={containerRef}
			className={cn('pointer-events-none absolute inset-0 -z-1', className)}
			{...props}
		/>
	);
}
