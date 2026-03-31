// src/components/Modal/Modal.jsx
import React, { useEffect, useRef } from 'react';
import './Modal.css';

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    closeOnOverlayClick = true,
    showCloseButton = true,
    footer = null
}) => {
    const modalRef = useRef(null);
    const closeButtonRef = useRef(null);

    // Handle escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';

            // Focus trap - focus on close button when modal opens
            if (closeButtonRef.current) {
                closeButtonRef.current.focus();
            }
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle click outside
    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    // Size classes
    const sizeClasses = {
        small: 'modal-small',
        medium: 'modal-medium',
        large: 'modal-large',
        fullscreen: 'modal-fullscreen'
    };

    const modalSizeClass = sizeClasses[size] || sizeClasses.medium;

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
        >
            <div className={`modal-container ${modalSizeClass}`} ref={modalRef}>
                <div className="modal-header">
                    {title && (
                        <h3 id="modal-title" className="modal-title">
                            {title}
                        </h3>
                    )}
                    {showCloseButton && (
                        <button
                            ref={closeButtonRef}
                            className="modal-close-btn"
                            onClick={onClose}
                            aria-label="Close modal"
                        >
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M18 6L6 18M6 6L18 18"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                <div className="modal-body">
                    {children}
                </div>

                {footer && (
                    <div className="modal-footer">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

// Modal with confirmation buttons (Convenience component)
export const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message = "Are you sure you want to proceed?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "primary",
    isLoading = false
}) => {
    const confirmVariants = {
        primary: 'btn-confirm-primary',
        danger: 'btn-confirm-danger',
        success: 'btn-confirm-success',
        warning: 'btn-confirm-warning'
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="small"
            footer={
                <div className="modal-footer-buttons">
                    <button
                        className="btn-cancel-modal"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        {cancelText}
                    </button>
                    <button
                        className={`btn-confirm ${confirmVariants[confirmVariant]}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : confirmText}
                    </button>
                </div>
            }
        >
            <p className="confirm-message">{message}</p>
        </Modal>
    );
};

export default Modal;