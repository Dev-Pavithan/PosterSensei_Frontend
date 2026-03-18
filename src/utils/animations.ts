export const triggerFlyAnimation = (e: React.MouseEvent | MouseEvent, actionType: 'cart' | 'wishlist' = 'cart') => {
    // We target the user menu button in the header (which holds both cart and wishlist in this design)
    const isMobile = window.innerWidth < 768;
    const targetId = isMobile ? 'header-user-menu-mobile' : 'header-user-menu-desktop';
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();

    // Starting coordinates based on the clicked element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    const endX = targetRect.left + targetRect.width / 2;
    const endY = targetRect.top + targetRect.height / 2;

    // Create the flying element
    const dot = document.createElement('div');
    dot.style.position = 'fixed';
    dot.style.left = `${startX}px`;
    dot.style.top = `${startY}px`;
    dot.style.width = '48px';
    dot.style.height = '48px';
    dot.style.display = 'flex';
    dot.style.alignItems = 'center';
    dot.style.justifyContent = 'center';
    dot.style.zIndex = '99999';
    dot.style.pointerEvents = 'none';
    dot.style.transform = 'translate(-50%, -50%) scale(1)';
    dot.style.filter = 'drop-shadow(0 10px 15px rgba(0,0,0,0.3))';

    if (actionType === 'wishlist') {
        dot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
    } else {
        dot.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`;
    }
    dot.style.transition = 'top 1.4s cubic-bezier(0.5, -0.2, 0.8, 1), left 1s linear, transform 1s ease-in, opacity 0.8s ease-in 0.2s';

    document.body.appendChild(dot);

    // Initial reflow
    void dot.offsetWidth;

    // Start animation
    dot.style.left = `${endX}px`;
    dot.style.top = `${endY}px`;
    dot.style.transform = 'translate(-50%, -50%) scale(0.2)';
    dot.style.opacity = '0.1';

    // Bump the target element slightly when 'caught'
    setTimeout(() => {
        dot.remove();
        targetElement.style.transition = 'transform 0.25s cubic-bezier(0.25, 1.5, 0.5, 1)';
        targetElement.style.transform = 'scale(1.25)';
        setTimeout(() => {
            targetElement.style.transform = 'scale(1)';
        }, 250);
    }, 1400);
};
