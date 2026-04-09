'use client';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

type DottedSurfaceProps = Omit<React.ComponentProps<'div'>, 'ref'>;

const DOT_SIZE = '2px';
const DOT_SPACING = '28px';
const DOT_COLOR = '#A8E84C';

const STYLE_ID = 'dotted-surface-keyframes';

const keyframesCSS = `
@keyframes dotWave1{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes dotWave2{0%,100%{transform:translateY(0)}50%{transform:translateY(4px)}}
@keyframes dotWave3{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@media(prefers-reduced-motion:reduce){
  .dotted-wave-1,.dotted-wave-2,.dotted-wave-3{animation:none!important}
}`;

function useKeyframes() {
	useEffect(() => {
		if (document.getElementById(STYLE_ID)) return;
		const style = document.createElement('style');
		style.id = STYLE_ID;
		style.textContent = keyframesCSS;
		document.head.appendChild(style);
		return () => {
			style.remove();
		};
	}, []);
}

export function DottedSurface({ className, ...props }: DottedSurfaceProps) {
	useKeyframes();

	return (
		<div
			className={cn('pointer-events-none absolute inset-0 -z-1', className)}
			{...props}
		>
			{/* Layer 1 — base dots */}
			<div
				className="dotted-wave-1 absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(${DOT_COLOR} ${DOT_SIZE}, transparent ${DOT_SIZE})`,
					backgroundSize: `${DOT_SPACING} ${DOT_SPACING}`,
					opacity: 0.45,
					animation: 'dotWave1 6s ease-in-out infinite',
				}}
			/>
			{/* Layer 2 — offset dots, slower wave */}
			<div
				className="dotted-wave-2 absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(${DOT_COLOR} ${DOT_SIZE}, transparent ${DOT_SIZE})`,
					backgroundSize: `${DOT_SPACING} ${DOT_SPACING}`,
					backgroundPosition: '14px 14px',
					opacity: 0.25,
					animation: 'dotWave2 8s ease-in-out infinite',
				}}
			/>
			{/* Layer 3 — sparse larger dots */}
			<div
				className="dotted-wave-3 absolute inset-0"
				style={{
					backgroundImage: `radial-gradient(${DOT_COLOR} 1.5px, transparent 1.5px)`,
					backgroundSize: '56px 56px',
					backgroundPosition: '7px 7px',
					opacity: 0.15,
					animation: 'dotWave3 10s ease-in-out infinite',
				}}
			/>
		</div>
	);
}
