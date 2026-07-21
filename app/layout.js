import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'SkillsConnect Ghana - Local Artisan Marketplace',
  description: 'Connecting skilled Ghanaian professionals with clients securely.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Google Fonts Poppins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* Bootstrap 5.3 CSS */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
          integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" 
          crossOrigin="anonymous" 
        />
        {/* Font Awesome 6.4 */}
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" 
          integrity="sha512-z3gLpd7yknf1YoNbCzqRKc4qyor8gaKU1qmn+CShxbuBusANI9QpRohGBreCFkKxLhei6S9CQXFEbbKuqLg0DA==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        {/* Bootstrap 5.3 Bundle JS */}
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js" 
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL" 
          crossOrigin="anonymous"
          async
        ></script>
        
        <style dangerouslySetInnerHTML={{ __html: `
          :root {
            --primary: #1A6B3C;
            --secondary: #F5A623;
            --background: #F8F9FA;
            --card: #FFFFFF;
            --text: #212529;
            --danger: #DC3545;
            --success: #198754;
            --muted: #6C757D;
          }

          body {
            font-family: 'Poppins', sans-serif;
            background-color: var(--background);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
          }

          /* Custom styling and overrides */
          .btn-primary {
            background-color: var(--primary) !important;
            border-color: var(--primary) !important;
            color: #ffffff !important;
            font-weight: 500;
          }
          .btn-primary:hover, .btn-primary:focus, .btn-primary:active {
            background-color: #14542F !important;
            border-color: #14542F !important;
          }

          .btn-outline-primary {
            color: var(--primary) !important;
            border-color: var(--primary) !important;
            background-color: transparent !important;
            font-weight: 500;
          }
          .btn-outline-primary:hover, .btn-outline-primary:focus, .btn-outline-primary:active {
            background-color: var(--primary) !important;
            border-color: var(--primary) !important;
            color: #ffffff !important;
          }

          .btn-secondary {
            background-color: var(--secondary) !important;
            border-color: var(--secondary) !important;
            color: #212529 !important;
            font-weight: 500;
          }
          .btn-secondary:hover {
            background-color: #e09316 !important;
            border-color: #e09316 !important;
          }

          .text-primary {
            color: var(--primary) !important;
          }
          .text-secondary {
            color: var(--secondary) !important;
          }
          .text-success {
            color: var(--success) !important;
          }
          .text-danger {
            color: var(--danger) !important;
          }

          .bg-primary {
            background-color: var(--primary) !important;
          }
          .bg-secondary {
            background-color: var(--secondary) !important;
          }

          /* Card Styling & Hover Effects */
          .custom-card {
            background: var(--card);
            border: 1px solid rgba(0, 0, 0, 0.08);
            border-radius: 12px;
            transition: transform 0.25s ease, box-shadow 0.25s ease;
          }
          .custom-card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.08);
            border-color: var(--primary);
          }

          /* Stat Cards */
          .stat-card {
            background: var(--card);
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
            border: 1px solid rgba(0, 0, 0, 0.05);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          /* Dashboard Sidebar Styling */
          .dashboard-container {
            display: flex;
            min-height: calc(100vh - 72px);
          }
          .sidebar-nav {
            width: 260px;
            background: #ffffff;
            border-right: 1px solid rgba(0, 0, 0, 0.08);
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
            z-index: 1020;
          }
          .sidebar-link {
            display: flex;
            align-items: center;
            padding: 0.75rem 1.25rem;
            color: var(--text);
            text-decoration: none;
            border-radius: 8px;
            margin: 0.2rem 0.75rem;
            font-size: 0.9rem;
            font-weight: 500;
            transition: all 0.2s ease;
          }
          .sidebar-link:hover {
            background-color: rgba(26, 107, 60, 0.08);
            color: var(--primary);
          }
          .sidebar-link.active {
            background-color: var(--secondary) !important;
            color: #212529 !important;
            font-weight: 600;
          }
          .sidebar-badge {
            margin-left: auto;
            font-size: 0.75rem;
            padding: 0.25em 0.6em;
            border-radius: 50rem;
          }

          /* General Badges */
          .badge-primary {
            background-color: var(--primary);
            color: #fff;
          }
          .badge-secondary {
            background-color: var(--secondary);
            color: #212529;
          }

          /* Navigation and headers */
          .navbar-brand {
            font-weight: 700;
            letter-spacing: -0.5px;
          }

          /* Star colors */
          .star-filled {
            color: var(--secondary);
          }
          .star-empty {
            color: #dee2e6;
          }
        ` }} />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          <Toaster position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
