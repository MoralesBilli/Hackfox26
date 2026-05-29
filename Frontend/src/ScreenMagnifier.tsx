import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAccessibility } from './AccesibilidadContext';

export const ScreenMagnifier: React.FC = () => {
    const { settings } = useAccessibility();
    const [position, setPosition] = useState({ x: -1000, y: -1000 });
    const [cloneHtml, setCloneHtml] = useState<string>('');
    const containerRef = useRef<HTMLDivElement>(null);
    const updateTimeoutRef = useRef<number | null>(null);

    const radius = 100; // 200px diameter for better view
    const scale = 2.2;  // 2.2x zoom

    const updateClone = () => {
        const clone = document.body.cloneNode(true) as HTMLElement;
        
        // Prevent self-cloning recursion
        const nestedMagnifier = clone.querySelector('.magnifier-lens');
        if (nestedMagnifier) nestedMagnifier.remove();

        // Sync inputs and internal scrolls
        const sourceElements = document.body.querySelectorAll('*');
        const cloneElements = clone.querySelectorAll('*');
        const len = Math.min(sourceElements.length, cloneElements.length);
        
        for (let i = 0; i < len; i++) {
            const srcEl = sourceElements[i] as HTMLElement;
            const tgtEl = cloneElements[i] as HTMLElement;

            if (srcEl.scrollTop > 0) tgtEl.setAttribute('data-scroll-top', String(srcEl.scrollTop));
            if (srcEl.scrollLeft > 0) tgtEl.setAttribute('data-scroll-left', String(srcEl.scrollLeft));

            if (srcEl.tagName === 'INPUT' || srcEl.tagName === 'TEXTAREA') {
                const val = (srcEl as HTMLInputElement).value;
                tgtEl.setAttribute('value', val);
                (tgtEl as HTMLInputElement).value = val;
            } else if (srcEl.tagName === 'SELECT') {
                const val = (srcEl as HTMLSelectElement).value;
                tgtEl.setAttribute('value', val);
            }
        }

        setCloneHtml(clone.innerHTML);
    };

    const scheduleUpdate = (delay = 150) => {
        if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
        updateTimeoutRef.current = window.setTimeout(updateClone, delay);
    };

    // Main DOM Cloning Effect
    useEffect(() => {
        if (!settings.mouseMagnifier) return;

        updateClone();

        const observer = new MutationObserver((mutations) => {
            // Ignore mutations that are just the magnifier moving
            const isOnlyMagnifier = mutations.every(m => 
                m.target === document.body || 
                (m.target as HTMLElement).closest?.('.magnifier-lens')
            );
            if (!isOnlyMagnifier) {
                scheduleUpdate(250); // Debounce heavy clone
            }
        });

        observer.observe(document.body, { childList: true, subtree: true, characterData: true });

        const handleInput = () => scheduleUpdate(200);
        const handleResize = () => scheduleUpdate(200);

        window.addEventListener('input', handleInput, true);
        window.addEventListener('resize', handleResize);

        return () => {
            observer.disconnect();
            window.removeEventListener('input', handleInput, true);
            window.removeEventListener('resize', handleResize);
            if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
        };
    }, [settings.mouseMagnifier]);

    // Mouse movement and window scroll syncing
    useEffect(() => {
        if (!settings.mouseMagnifier) return;

        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            animationFrameId = requestAnimationFrame(() => {
                setPosition({ x: e.clientX, y: e.clientY });
            });
        };

        const syncPageScroll = () => {
            if (containerRef.current) {
                containerRef.current.scrollTop = window.scrollY;
                containerRef.current.scrollLeft = window.scrollX;
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', syncPageScroll, { passive: true });
        
        // Initial sync
        syncPageScroll();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', syncPageScroll);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [settings.mouseMagnifier]);

    // Post-clone DOM adjustments (Canvas and inner scrolls)
    useEffect(() => {
        if (!containerRef.current || !settings.mouseMagnifier) return;

        // Restore scrolls
        const scrolledElements = containerRef.current.querySelectorAll('[data-scroll-top], [data-scroll-left]');
        scrolledElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const scrollTop = htmlEl.getAttribute('data-scroll-top');
            const scrollLeft = htmlEl.getAttribute('data-scroll-left');
            if (scrollTop) htmlEl.scrollTop = parseInt(scrollTop, 10);
            if (scrollLeft) htmlEl.scrollLeft = parseInt(scrollLeft, 10);
        });

        // Restore canvases (Map overlays, etc)
        const originalCanvases = document.body.querySelectorAll('canvas');
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
                    // Safe ignore cross-origin
                }
            }
        }
        
        // Ensure the main scroll is synced immediately after a clone update
        containerRef.current.scrollTop = window.scrollY;
        containerRef.current.scrollLeft = window.scrollX;

    }, [cloneHtml, settings.mouseMagnifier]);

    if (!settings.mouseMagnifier) return null;

    // Viewport relative coordinates
    const lensX = position.x - radius;
    const lensY = position.y - radius;

    // Scale mapping inside the lens
    const contentLeft = radius - position.x * scale;
    const contentTop = radius - position.y * scale;

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
                pointerEvents: 'none', // Crucial for clicking through
                zIndex: 2147483647, // Max z-index to stay above modals
                backgroundColor: '#FFF8F6',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: `${contentLeft}px`,
                    top: `${contentTop}px`,
                    width: '100vw',
                    height: '100vh',
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    pointerEvents: 'none',
                    overflow: 'hidden', // Required so we can manually control scrollTop
                }}
                ref={containerRef}
            >
                {/* Simulated body container */}
                <div 
                    dangerouslySetInnerHTML={{ __html: cloneHtml }} 
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Glossy lens reflection overlay */}
            <div 
                style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 100%)',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }}
            />
        </div>,
        document.body
    );
};
