import React from 'react';

export interface ServerAvatarProps {
  name?: string;
  avatar?: string;
  community?: { name: string; avatar?: string };
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'rounded' | 'circle' | 'squircle';
  className?: string;
  isOnline?: boolean;
}

export const ServerAvatar: React.FC<ServerAvatarProps> = ({
  name,
  avatar,
  community,
  size = 'md',
  shape = 'rounded',
  className = '',
  isOnline = false,
}) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const finalName = name || community?.name || '';
  const finalAvatar = avatar || community?.avatar;

  React.useEffect(() => {
    setImgFailed(false);
  }, [finalAvatar]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
  };

  const shapeClasses = {
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    squircle: 'rounded-[16px]',
  };

  const initial = finalName ? finalName.charAt(0).toUpperCase() : '?';

  return (
    <div className={`relative shrink-0 ${sizeClasses[size]} ${className}`}>
      {finalAvatar && !imgFailed ? (
        <img
          src={finalAvatar}
          alt={finalName}
          decoding="async"
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover shadow-sm ${shapeClasses[shape]}`}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <div
          className={`w-full h-full flex items-center justify-center font-bold bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-sm ${shapeClasses[shape]}`}
        >
          {initial}
        </div>
      )}

      {isOnline && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
      )}
    </div>
  );
};
