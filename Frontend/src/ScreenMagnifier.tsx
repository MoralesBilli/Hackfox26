import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAccessibility } from './AccesibilidadContext';

export const ScreenMagnifier: React.FC = () => {
    const { settings } = useAccessibility();
    const [position, setPosition] = useState({ x: -1000, y: -1000 });
    const [scrollOffset, setScrollOffset] = useState({ x: 0, y: 0 });
    const [cloneHtml, setCloneHtml] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);

    const radius = 95; // 190px diameter
    const scale = 2.2;  // 2.2x zoom

    const updateClone = () => {
        const rootEl = document.getElementById('root');
        if (rootEl) {
            const clone = rootEl.cloneNode(true) as HTMLElement;
            
            // Prevent self-cloning recursion
            const nestedMagnifier = clone.querySelector('.magnifier-lens');
            if (nestedMagnifier) {
                nestedMagnifier.remove();
            }

            // Sync scroll positions and input values into attributes before getting HTML string
            const sourceElements = rootEl.querySelectorAll('*');
            const cloneElements = clone.querySelectorAll('*');
            const len = Math.min(sourceElements.length, cloneElements.length);
            for (let i = 0; i < len; i++) {
                const srcEl = sourceElements[i] as HTMLElement;
                const tgtEl = cloneElements[i] as HTMLElement;

                if (srcEl.scrollTop !== 0) {
                    tgtEl.setAttribute('data-scroll-top', String(srcEl.scrollTop));
                }
                if (srcEl.scrollLeft !== 0) {
                    tgtEl.setAttribute('data-scroll-left', String(srcEl.scrollLeft));
                }

                if (srcEl.tagName === 'INPUT' || srcEl.tagName === 'TEXTAREA') {
                    const val = (srcEl as HTMLInputElement).value;
                    (tgtEl as HTMLInputElement).value = val;
                    tgtEl.setAttribute('value', val);
                } else if (srcEl.tagName === 'SELECT') {
                    const val = (srcEl as HTMLSelectElement).value;
                    tgtEl.setAttribute('value', val);
                }
            }

            setCloneHtml(clone.innerHTML);
        }
    };

    useEffect(() => {
        if (!settings.mouseMagnifier) return;

        // Initial clone
        updateClone();

        const handleSync = () => {
            setTimeout(updateClone, 50);
        };

        window.addEventListener('click', handleSync, true);
        window.addEventListener('keydown', handleSync, true);
        window.addEventListener('scroll', handleSync, true);

        const interval = setInterval(updateClone, 1500);

        return () => {
            window.removeEventListener('click', handleSync, true);
            window.removeEventListener('keydown', handleSync, true);
            window.removeEventListener('scroll', handleSync, true);
            clearInterval(interval);
        };
    }, [settings.mouseMagnifier]);

    useEffect(() => {
        if (!settings.mouseMagnifier) return;

        const handleMouseMove = (e: MouseEvent) => {
            setPosition({ x: e.clientX, y: e.clientY });
        };

        const handleScroll = () => {
            setScrollOffset({ x: window.scrollX, y: window.scrollY });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });

        // Initialize scroll offset
        setScrollOffset({ x: window.scrollX, y: window.scrollY });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
        };
    }, [settings.mouseMagnifier]);

    // Apply scroll positions, canvas drawings, and absolute positions for sticky/fixed elements after clone html changes
    useEffect(() => {
        if (!containerRef.current || !settings.mouseMagnifier) return;

        const rootEl = document.getElementById('root');
        if (!rootEl) return;

        // Restore scroll positions inside cloned elements
        const scrolledElements = containerRef.current.querySelectorAll('[data-scroll-top], [data-scroll-left]');
        scrolledElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const scrollTop = htmlEl.getAttribute('data-scroll-top');
            const scrollLeft = htmlEl.getAttribute('data-scroll-left');
            if (scrollTop) htmlEl.scrollTop = parseInt(scrollTop, 10);
            if (scrollLeft) htmlEl.scrollLeft = parseInt(scrollLeft, 10);
        });

        // Restore canvas layers (such as routes and maps)
        const originalCanvases = rootEl.querySelectorAll('canvas');
        const clonedCanvases = containerRef.current.querySelectorAll('canvas');
        const canvasLen = Math.min(originalCanvases.length, clonedCanvases.length);
        for (let i = 0; i < canvasLen; i++) {
            const srcCanvas = originalCanvases[i] as HTMLCanvasElement;
            const tgtCanvas = clonedCanvases[i] as HTMLCanvasElement;
            const ctx = tgtCanvas.getContext('2d');
            if (ctx) {
                try {
                    ctx.drawImage(srcCanvas, 0, 0);
                } catch (e) {
                    // Safe ignore
                }
            }
        }

        // Force exact positioning on sticky/fixed components (like headers, sidebars, modals)
        const originalStickyFixed = rootEl.querySelectorAll('.sticky, .fixed');
        const clonedStickyFixed = containerRef.current.querySelectorAll('.sticky, .fixed');
        const stickyLen = Math.min(originalStickyFixed.length, clonedStickyFixed.length);
        const rootRect = rootEl.getBoundingClientRect();

        for (let i = 0; i < stickyLen; i++) {
            const srcEl = originalStickyFixed[i] as HTMLElement;
            const tgtEl = clonedStickyFixed[i] as HTMLElement;
            const srcRect = srcEl.getBoundingClientRect();

            tgtEl.style.setProperty('position', 'absolute', 'important');
            tgtEl.style.setProperty('left', `${srcRect.left - rootRect.left}px`, 'important');
            tgtEl.style.setProperty('top', `${srcRect.top - rootRect.top}px`, 'important');
            tgtEl.style.setProperty('right', 'auto', 'important');
            tgtEl.style.setProperty('bottom', 'auto', 'important');
            tgtEl.style.setProperty('margin', '0', 'important');
            tgtEl.style.setProperty('z-index', '100000', 'important');
        }
    }, [cloneHtml, settings.mouseMagnifier]);

    const rootEl = document.getElementById('root');
    const rootRect = rootEl ? rootEl.getBoundingClientRect() : null;

    if (!settings.mouseMagnifier || !rootRect) return null;

    // Position of the lens
    const lensX = position.x - radius;
    const lensY = position.y - radius;

    // Calculate exact cursor coordinates relative to the root boundaries
    const cursorRelX = position.x - rootRect.left;
    const cursorRelY = position.y - rootRect.top;

    // Shifts the cloned content to align with the cursor zoom target
    const contentLeft = radius - cursorRelX * scale;
    const contentTop = radius - cursorRelY * scale;

    const rootWidth = rootRect.width;
    const rootHeight = rootRect.height;

    return createPortal(
        <div
            className="magnifier-lens"
            style={{
                position: 'fixed',
                left: `${lensX}px`,
                top: `${lensY}px`,
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                borderRadius: '50%',
                border: '4px solid #660000',
                boxShadow: '0 8px 32px rgba(102, 0, 0, 0.45), inset 0 0 16px rgba(0,0,0,0.25)',
                overflow: 'hidden',
                pointerEvents: 'none',
                zIndex: 999999,
                backgroundColor: '#FFF8F6',
            }}
        >
            {/* Cloned viewport container (sized to match original root layout boundaries) */}
            <div
                ref={containerRef}
                dangerouslySetInnerHTML={{ __html: cloneHtml }}
                style={{
                    position: 'absolute',
                    left: `${contentLeft}px`,
                    top: `${contentTop}px`,
                    width: `${rootWidth}px`,
                    height: `${rootHeight}px`,
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                }}
            />

            {/* Glossy lens reflection overlay */}
            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                    zIndex: 10,
                }}
            />
        </div>,
        document.body
    );
};
