import React, { useEffect } from 'react';
import { Alert } from 'antd';

export default function MyAlert({ type = 'success', message, description, onClose, duration = 3000 }) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose?.();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return (
        <div
            style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999,
                width: 320,
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
            }}
        >
            <Alert
                type={type}
                message={message}
                description={description}
                closable
                showIcon
                onClose={onClose}
            />
        </div>
    );
}
