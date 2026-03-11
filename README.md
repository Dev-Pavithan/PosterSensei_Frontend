<div align="center">
  <img src="https://poster-sensei-frontend.vercel.app/assets/logo-CrwZsG8L.png" alt="PosterSensei Logo" height="100"/>
  <h1>⛩️ PosterSensei - Frontend</h1>
  <p><strong>Turn Your Walls into Anime Worlds.</strong></p>
  
  [![React](https://img.shields.io/badge/React-18.2.0-blue.svg?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.0.0-purple.svg?style=for-the-badge&logo=vite)](https://vitejs.dev/)
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black.svg?style=for-the-badge&logo=vercel)](https://poster-sensei-frontend.vercel.app/)
</div>

<br />

## 🌟 Overview
**PosterSensei** is a premium e-commerce platform dedicated to selling high-quality anime and gaming posters. Built from the ground up to be lightning-fast, highly responsive, and beautifully animated. The platform includes a full customer shopping experience alongside a comprehensive Admin Dashboard.

## ✨ Key Features
- **🛍️ Complete E-commerce Flow:** Browse, Filter by Anime, Search, Add to Wishlist, Add to Cart, and Checkout.
- **🎨 Custom Design System:** Built without external component libraries. Employs a custom CSS grid, fluid typography, glassmorphism, and a cohesive light/dark theme switcher.
- **🛡️ Secure Authentication:** JWT-based login/registration with secure HTTP-only cookies and protected routing.
- **👑 Admin Dashboard:** A dedicated, secure panel for managing Products, Categories, Orders, and Users. Includes sales analytics and Cloudinary image uploads.
- **⚡ Blazing Fast:** Powered by React + Vite for instant Hot Module Replacement (HMR) and optimized production builds.
- **📱 Fully Responsive:** Carefully crafted layouts using modern CSS Flexbox, Grid, and `clamp()` that adapt beautifully from small mobiles to 4K displays.
- **🖼️ Image Protection:** Built-in dynamic CSS watermarks on all product display images to prevent unauthorized downloads.
- **🔍 SEO Optimized:** Configured with semantic HTML, Meta descriptions, Open Graph (OG) tags, and Twitter Cards for social media sharing.

## 🛠️ Tech Stack
| Category | Technology |
|---|---|
| **Core** | React 18, TypeScript, Vite |
| **Routing** | React Router DOM v6 |
| **Styling** | Vanilla CSS (Custom Design System, CSS Variables) |
| **Icons & Animations** | Lucide React, Framer Motion |
| **Data Fetching** | Axios (with interceptors for cookies) |
| **Testing** | Playwright (E2E) |

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+ recommended)
- A running PosterSensei Backend server.

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/Dev-Pavithan/PosterSensei_Frontend.git
   cd PosterSensei_Frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Environment Setup
   - By default, the application is pre-configured to point to the production Vercel backend.
   - For local backend development, update the `baseURL` in `src/App.tsx` and the proxy in `vite.config.ts` to point to `http://localhost:5000`.

4. Start the development server
   ```bash
   npm run dev
   ```

5. Build for production
   ```bash
   npm run build
   ```

## 🌐 Deployment to Vercel

### Step-by-Step Guide
1. **Push your code to GitHub**: (Already done!)
   - Ensure all recent changes (including the new `vercel.json`) are pushed.
2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in with GitHub.
   - Click **"Add New..."** > **"Project"**.
   - Select your repository: `PosterSensei_Frontend`.
3. **Configure Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Deploy**:
   - Click **Deploy**. Vercel will automatically handle the build and give you a live URL.

> [!NOTE]
> The `vercel.json` file in this repository has been configured to support Single Page Application (SPA) routing, so refreshing on sub-pages will work correctly.

## 📂 Project Structure
```text
src/
├── components/      # Reusable UI components (Header, Footer, ProductCard)
├── contexts/        # React Context providers (Auth, Cart, Wishlist)
├── pages/           # Route-level components (Home, Shop, Admin Dashboard)
├── index.css        # Global styles, variables, and utility classes
├── App.tsx          # Main application routing logic
└── main.tsx         # React root entry point
```

## 🤝 Contribution
Contributions are always welcome. Please follow these guidelines:
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Developed with ❤️ in Sri Lanka for anime fans worldwide.*
