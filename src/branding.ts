/**
 * Branding information for Polar3D G-Code Viewer
 * 
 * IMPORTANT: Per the license agreement, this branding MUST be displayed
 * in a visible location when using this package. Removal or hiding of
 * this branding is a violation of the license terms.
 */

import { WHITELISTED_DOMAINS } from './types';

export interface BrandingInfo {
  text: string;
  url: string;
  html: string;
  required: boolean;
}

/**
 * Check if current domain is whitelisted (Polar3D owned)
 */
export function isWhitelistedDomain(): boolean {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname.toLowerCase();
  return WHITELISTED_DOMAINS.some(domain => 
    hostname === domain || hostname.endsWith('.' + domain)
  );
}

/**
 * Get the required branding information
 */
export function getBranding(): BrandingInfo {
  return {
    text: 'Powered by Polar3D',
    url: 'https://polar3d.com',
    html: '<a href="https://polar3d.com" target="_blank" rel="noopener noreferrer" style="color: #0ea5e9; text-decoration: none; font-size: 12px;">Powered by <strong>Polar3D</strong></a>',
    required: !isWhitelistedDomain()
  };
}

/**
 * Create a branding DOM element - automatically injected for non-whitelisted domains
 */
export function createBrandingElement(options?: {
  position?: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  className?: string;
}): HTMLElement {
  const position = options?.position || 'bottom-left';
  
  const container = document.createElement('div');
  container.className = options?.className || 'polar3d-branding';
  container.setAttribute('data-polar3d-branding', 'true');
  
  // Position styles
  const positionStyles: Record<string, string> = {
    'bottom-left': 'bottom: 8px; left: 8px;',
    'bottom-right': 'bottom: 8px; right: 8px;',
    'top-left': 'top: 8px; left: 8px;',
    'top-right': 'top: 8px; right: 8px;',
  };
  
  container.style.cssText = `
    position: absolute;
    ${positionStyles[position]}
    z-index: 1000;
    padding: 4px 8px;
    background: rgba(0, 0, 0, 0.7);
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    pointer-events: auto;
  `;
  
  const link = document.createElement('a');
  link.href = 'https://polar3d.com';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.style.cssText = `
    color: #38bdf8;
    text-decoration: none;
    font-size: 11px;
    display: flex;
    align-items: center;
    gap: 4px;
  `;
  link.innerHTML = `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
    <span>Powered by <strong>Polar3D</strong></span>
  `;
  
  link.addEventListener('mouseenter', () => {
    link.style.color = '#7dd3fc';
  });
  link.addEventListener('mouseleave', () => {
    link.style.color = '#38bdf8';
  });
  
  container.appendChild(link);
  
  return container;
}

/**
 * Inject branding into a container element (called automatically by GCodeViewer)
 * Only injects if not on a whitelisted domain
 */
export function injectBranding(container: HTMLElement): HTMLElement | null {
  // Don't inject on whitelisted domains
  if (isWhitelistedDomain()) {
    return null;
  }
  
  // Don't inject if already present
  if (container.querySelector('[data-polar3d-branding]')) {
    return null;
  }
  
  // Ensure container has relative positioning
  const computedStyle = window.getComputedStyle(container);
  if (computedStyle.position === 'static') {
    container.style.position = 'relative';
  }
  
  const branding = createBrandingElement({ position: 'bottom-left' });
  container.appendChild(branding);
  
  return branding;
}

/**
 * CSS styles for the branding element (for manual styling)
 */
export const BRANDING_CSS = `
.polar3d-branding {
  position: absolute;
  bottom: 8px;
  left: 8px;
  z-index: 1000;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 4px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.polar3d-branding a {
  color: #38bdf8;
  text-decoration: none;
  font-size: 11px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.polar3d-branding a:hover {
  color: #7dd3fc;
}
`;
