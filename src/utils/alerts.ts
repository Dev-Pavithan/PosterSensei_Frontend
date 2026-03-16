import Swal from 'sweetalert2';

/**
 * Premium alert utility using SweetAlert2
 * Tailored to match the PosterSensei design system
 */

const isDarkMode = () => document.documentElement.getAttribute('data-theme') === 'dark';

const getThemeColors = () => {
    const dark = isDarkMode();
    return {
        background: dark ? '#1e293b' : '#ffffff',
        color: dark ? '#f8fafc' : '#111827',
        confirmButtonColor: '#ff6f61', // var(--primary)
        cancelButtonColor: dark ? '#334155' : '#e5e7eb',
    };
};

export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const colors = getThemeColors();
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        background: colors.background,
        color: colors.color,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: type,
        title: message
    });
};

export const showAlert = async (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const colors = getThemeColors();
    return Swal.fire({
        title,
        text: message,
        icon: type,
        background: colors.background,
        color: colors.color,
        confirmButtonColor: colors.confirmButtonColor,
        customClass: {
            popup: 'premium-swal-popup',
            confirmButton: 'premium-swal-button'
        }
    });
};

export const showConfirm = async (title: string, message: string, confirmText = 'Yes, proceed', cancelText = 'Cancel') => {
    const colors = getThemeColors();
    return Swal.fire({
        title,
        text: message,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: colors.confirmButtonColor,
        cancelButtonColor: colors.cancelButtonColor,
        confirmButtonText: confirmText,
        cancelButtonText: cancelText,
        background: colors.background,
        color: colors.color,
        reverseButtons: true,
        customClass: {
            popup: 'premium-swal-popup',
            confirmButton: 'premium-swal-button',
            cancelButton: 'premium-swal-cancel'
        }
    });
};

export const showSuccess = (title: string, message: string) => showAlert(title, message, 'success');
export const showError = (title: string, message: string) => showAlert(title, message, 'error');
