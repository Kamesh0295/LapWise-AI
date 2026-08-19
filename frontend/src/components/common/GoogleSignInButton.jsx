import React, { useEffect, useRef } from 'react';
import { FaGoogle } from 'react-icons/fa';

const GoogleSignInButton = ({ onGoogleSuccess, onError, text = 'continue_with' }) => {
  const googleBtnRef = useRef(null);
  const clientId = import.meta.env?.VITE_GOOGLE_CLIENT_ID || '';
  const isPlaceholder = !clientId || clientId.includes('placeholder');

  useEffect(() => {
    if (isPlaceholder) return;

    // Load Google Identity Services SDK script dynamically if real Client ID exists
    const loadGoogleSdk = () => {
      if (document.getElementById('google-gsi-client')) {
        initializeGoogleButton();
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        initializeGoogleButton();
      };
      document.body.appendChild(script);
    };

    const initializeGoogleButton = () => {
      if (window.google?.accounts?.id && googleBtnRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              if (response && response.credential) {
                onGoogleSuccess(response.credential);
              } else {
                onError && onError('Google credential response empty.');
              }
            }
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: text, // 'continue_with' | 'signin_with' | 'signup_with'
            shape: 'pill',
            logo_alignment: 'left',
            width: '320'
          });
        } catch (err) {
          console.warn('Google Identity button initialization notice:', err.message);
        }
      }
    };

    loadGoogleSdk();
  }, [clientId, isPlaceholder, onGoogleSuccess, onError, text]);

  // Click handler when testing without real Google Client ID
  const handleGoogleClick = () => {
    onGoogleSuccess('mock-google-id-token-dev');
  };

  if (isPlaceholder) {
    return (
      <div className="w-full flex justify-center my-2">
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full max-w-[320px] py-2.5 px-4 border border-gray-200 dark:border-darkBorder hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
        >
          <FaGoogle className="text-red-500" size={16} />
          <span>Continue with Google</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center my-2">
      <div ref={googleBtnRef} className="w-full max-w-[320px]" />
    </div>
  );
};

export default GoogleSignInButton;
