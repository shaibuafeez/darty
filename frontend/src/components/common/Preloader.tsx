import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './preloader.css';

const LOGO_TEXT = 'Harbor';
const FOOTER_LINES = [
  'Private real estate securities',
  'infrastructure on Aleo.',
];

export default function Preloader() {
  const [visible, setVisible] = useState(true);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!visible || !rootRef.current) return undefined;

    const context = gsap.context(() => {
      const chars = gsap.utils.toArray<HTMLElement>('.preloader-char');
      const lines = gsap.utils.toArray<HTMLElement>('.preloader-line-text');

      gsap.set(chars, { x: '100%' });
      gsap.set(lines, { y: '100%' });
      gsap.set('.preloader-progress-bar', {
        xPercent: -50,
        scaleX: 0,
        transformOrigin: 'left center',
      });

      const animateProgress = (duration = 3.5) => {
        const timeline = gsap.timeline();
        const steps = [0.24, 0.61, 1];

        steps.forEach((progress, index) => {
          timeline.to('.preloader-progress-bar', {
            scaleX: progress,
            duration: duration / steps.length,
            ease: index === steps.length - 1 ? 'power4.out' : 'power3.out',
          });
        });

        return timeline;
      };

      gsap.timeline({
        delay: 0.5,
        onComplete: () => setVisible(false),
      })
        .to(chars, {
          x: '0%',
          stagger: 0.05,
          duration: 1,
          ease: 'power4.inOut',
        })
        .to(lines, {
          y: '0%',
          stagger: 0.1,
          duration: 1,
          ease: 'power4.inOut',
        }, '0.25')
        .add(animateProgress(), '<')
        .to(chars, {
          x: '-100%',
          stagger: 0.05,
          duration: 1,
          ease: 'power4.inOut',
        }, '+=0.15')
        .to(lines, {
          y: '-100%',
          stagger: 0.1,
          duration: 0.5,
          ease: 'power4.inOut',
        }, '-=0.1')
        .to('.preloader-progress', {
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
        }, '<')
        .to('.preloader-mask', {
          scale: 6,
          duration: 4,
          ease: 'power3.out',
        }, '<')
        .to('.preloader-mask', {
          delay: 1,
          opacity: 0,
          duration: 0.2,
          ease: 'none',
        }, '<');
    }, rootRef);

    return () => context.revert();
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={rootRef} className="preloader" aria-hidden="true">
      <div className="preloader-progress">
        <div className="preloader-progress-bar" />
        <div className="preloader-logo">
          <h1>
            {LOGO_TEXT.split('').map((char, i) => (
              <span key={`${char}-${i}`} className="preloader-char">
                {char}
              </span>
            ))}
          </h1>
        </div>
      </div>

      <div className="preloader-mask" />

      <div className="preloader-content">
        <div className="preloader-footer">
          {FOOTER_LINES.map((line) => (
            <div key={line} className="preloader-line-wrap">
              <p className="preloader-line-text">{line}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
