import React from 'react';

interface IconProps {
  className?: string;
}

export const DashboardIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M2 4.25A2.25 2.25 0 014.25 2h11.5A2.25 2.25 0 0118 4.25v8.5A2.25 2.25 0 0115.75 15H4.25A2.25 2.25 0 012 12.75v-8.5zm1.5 0a.75.75 0 01.75-.75h11.5a.75.75 0 01.75.75v7.5a.75.75 0 01-.75.75H4.25a.75.75 0 01-.75-.75v-7.5zM2 16.75A.75.75 0 012.75 16h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const SearchIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
    </svg>
);

export const ProjectsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M3.5 3.75a.75.75 0 00-1.5 0v12.5c0 .414.336.75.75.75h14.5a.75.75 0 000-1.5H3.5V3.75z" />
        <path d="M6.25 5.5A.75.75 0 005.5 6.25v10a.75.75 0 001.5 0v-10A.75.75 0 006.25 5.5zM9.25 7.5A.75.75 0 008.5 8.25v8a.75.75 0 001.5 0v-8A.75.75 0 009.25 7.5zM12.25 9.5A.75.75 0 0011.5 10.25v6a.75.75 0 001.5 0v-6a.75.75 0 00-.75-.75zM15.25 11.5a.75.75 0 00-.75.75v4a.75.75 0 001.5 0v-4a.75.75 0 00-.75-.75z" />
    </svg>
);

export const TeamsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.41-1.412a6.998 6.998 0 00-12.262 0zM17 15.5a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const HelpIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.44a.75.75 0 011.06 0l.707.707a.75.75 0 01-1.06 1.06L8.94 7.5l-.707-.707a.75.75 0 010-1.061zM10 15.25a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75h-.01a.75.75 0 01-.75-.75v-.01zM10 10a.75.75 0 00-1.5 0v3.5a.75.75 0 001.5 0v-3.5z" clipRule="evenodd" />
    </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.078 2.25c-.217-.065-.434-.1-.652-.107c-.452-.014-1.02-.014-1.474 0c-.218.007-.435.042-.652.107c-1.13.336-2.14 1.14-2.735 2.144c-.337.568-.538 1.233-.596 1.93c-.027.313-.035.666-.035 1.012c0 .346.008.7.035 1.012c.058.697.26 1.362.596 1.93c.596 1.004 1.605 1.808 2.735 2.144c.217.065.434.1.652.107c.452.014 1.02.014 1.474 0c.218-.007.435-.042-.652-.107c1.13-.336 2.14-1.14 2.735-2.144c.337-.568.538 1.233.596-1.93c.027-.313.035-.666-.035-1.012c0-.346-.008-.7-.035-1.012c-.058-.697-.26-1.362-.596-1.93c-.596-1.004-1.605-1.808-2.735-2.144zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
    </svg>
);


export const CloseIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
    </svg>
);

export const ListBulletIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10zm0 5.25a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const BugIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a.75.75 0 01.75.75v1.256a.75.75 0 01-.5.707l-.159.08a2 2 0 00-1.182 0l-.159-.08A.75.75 0 018.5 4.006V2.75A.75.75 0 0110 2zM3.668 5.422a.75.75 0 01.96 1.14l-1.32 1.1A2 2 0 001.999 9.5v1a2 2 0 001.309 1.838l1.32 1.1a.75.75 0 11-.96 1.14l-1.32-1.1A3.5 3.5 0 01.5 10.5v-1a3.5 3.5 0 013.168-3.478zM16.332 5.422a.75.75 0 10-.96 1.14l1.32 1.1a2 2 0 011.309 1.838v1a2 2 0 01-1.309 1.838l-1.32 1.1a.75.75 0 00.96 1.14l1.32-1.1A3.5 3.5 0 0019.5 10.5v-1a3.5 3.5 0 00-3.168-3.478zM10 6a4 4 0 00-4 4v.75a.75.75 0 01-1.5 0V10a5.5 5.5 0 0111 0v.75a.75.75 0 01-1.5 0V10a4 4 0 00-4-4zm-2.75 6.5a.75.75 0 000 1.5h5.5a.75.75 0 000-1.5h-5.5z" clipRule="evenodd" />
    </svg>
);

export const UserCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z" clipRule="evenodd" />
    </svg>
);

export const WrenchScrewdriverIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M11.04 2.222a.75.75 0 01.835.28l1.615 2.26a.75.75 0 01-.28.836l-2.26 1.615a.75.75 0 01-.835-.28l-1.615-2.26a.75.75 0 01.28-.836l2.26-1.615zm2.463 6.945a.75.75 0 00-.28-.836l-2.26-1.615a.75.75 0 00-.835.28l-1.615 2.26a.75.75 0 00.28.836l2.26 1.615a.75.75 0 00.835-.28l1.615-2.26zM5.56 12.44a.75.75 0 01.32-.112l3.354-1.02a.75.75 0 01.836.835l-1.02 3.355a.75.75 0 01-1.25.32l-2.26-1.615a.75.75 0 01-.112-.32l-1.02 3.355a.75.75 0 11-1.428-.434l1.02-3.355a.75.75 0 01-.112-.32l-1.615-2.26a.75.75 0 01.32-.112l3.355-1.02a.75.75 0 01.32.112z" clipRule="evenodd" />
      <path d="M9.498 8.632a.75.75 0 00-1.05-.14L4.98 10.158a.75.75 0 10.638 1.29l3.468-1.666a.75.75 0 00.412-1.15z" />
    </svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
    </svg>
);
  
export const ExclamationCircleIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.44a.75.75 0 00-1.88 0l-1.25 1.25a.75.75 0 000 1.06l4.25 4.25a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06L8.94 6.44z" clipRule="evenodd" />
    </svg>
);

export const SparklesIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10.868 2.884c.321-.772 1.415-.772 1.736 0l.64 1.538c.166.401.562.662 1.001.662h1.615c.813 0 1.171 1.01.573 1.547l-1.305 1.01c-.343.264-.501.72-.421 1.162l.49 2.032c.198.82-.67 1.516-1.44 1.056l-1.615-1.002c-.417-.258-.94-.258-1.357 0l-1.615 1.002c-.77.46-1.638-.236-1.44-1.056l.49-2.032c.08-.442-.078-.898-.421-1.162l-1.305-1.01c-.598-.537-.24-1.547.573-1.547h1.615c.439 0 .835-.261 1.001-.662l.64-1.538zM5.5 5.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.25a.75.75 0 01-.75-.75zM8.25 8.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM5.5 10.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H6.25a.75.75 0 01-.75-.75zM8.25 13.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM10.5 5.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM13.25 8.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM10.5 10.5a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75zM13.25 13.25a.75.75 0 01.75-.75h.01a.75.75 0 010 1.5h-.01a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    </svg>
);

export const ChartBarIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12 2.25a.75.75 0 00-1.5 0v15a.75.75 0 001.5 0v-15zM8.25 8.625a.75.75 0 00-1.5 0v8.625a.75.75 0 001.5 0V8.625zM15.75 5.625a.75.75 0 00-1.5 0v11.625a.75.75 0 001.5 0V5.625zM4.5 11.625a.75.75 0 00-1.5 0v5.625a.75.75 0 001.5 0v-5.625z" />
    </svg>
);

export const CameraIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.5 6.375c0-1.036.84-1.875 1.875-1.875h1.372c.421 0 .823.164 1.12.441l.48.48a.75.75 0 001.06 0l.48-.48a1.5 1.5 0 011.12-.441h1.372c1.035 0 1.875.84 1.875 1.875V13.5A2.25 2.25 0 0113.5 15.75h-7A2.25 2.25 0 014.25 13.5v-1.375a.75.75 0 00-1.5 0V13.5c0 1.864 1.511 3.375 3.375 3.375h7c1.864 0 3.375-1.511 3.375-3.375V6.375c0-1.864-1.511-3.375-3.375-3.375h-1.372a3 3 0 00-2.24-1.002.75.75 0 00-.214.037L10 2.25l-.82-1.093a.75.75 0 00-.214-.037 3 3 0 00-2.24 1.002H5.375C3.511 2.125 2 3.636 2 5.5V6.375a.75.75 0 00-1.5 0z" clipRule="evenodd" />
      <path d="M10 9a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
      <path fillRule="evenodd" d="M10 7.5a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5zM13.25 9a.75.75 0 000 1.5h.5a.75.75 0 000-1.5h-.5z" clipRule="evenodd" />
    </svg>
);

export const ArrowPathIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.342a1.25 1.25 0 010 1.768l-3.25 3.25a.75.75 0 11-1.06-1.06l1.72-1.72H8.25a.75.75 0 010-1.5h4.472l-1.72-1.72a.75.75 0 111.06-1.06l3.25 3.25z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M4.156 4.156a6.5 6.5 0 019.192 0l.707.707a.75.75 0 01-1.06 1.06l-.707-.707a5 5 0 00-7.072 0l-.707.707a.75.75 0 01-1.06-1.06l.707-.707z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M15.844 15.844a6.5 6.5 0 01-9.192 0l-.707-.707a.75.75 0 111.06-1.06l.707.707a5 5 0 007.072 0l.707-.707a.75.75 0 111.06 1.06l-.707.707z" clipRule="evenodd" />
    </svg>
);

export const BellIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 16a3 3 0 01-3-3h6a3 3 0 01-3 3z" clipRule="evenodd" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.58.22-2.365.468a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193v-.443A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
    </svg>
);