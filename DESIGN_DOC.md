# Design Document - VIONNE

## 1. Architecture Overview
VIONNE is built as a full-stack web application using a modern, component-based architecture. It leverages a React frontend for dynamic UI, an Express backend for API routes and static serving, and Firebase for data storage and authentication.

### 1.1. High-Level Architecture
- **Frontend**: Single Page Application (SPA) built with React 19 and Vite.
- **Backend**: Node.js with Express, serving as an API layer and static file server.
- **Database**: Firebase Firestore (NoSQL) for products, orders, and settings.
- **Authentication**: Firebase Authentication (Google Login).
- **State Management**: Zustand for global cart and UI state.
- **Routing**: React Router DOM 7 for client-side navigation.

## 2. Frontend Design

### 2.1. Component Structure
- **Layouts**: Main layout wrapper including Header, Footer, and dynamic content area.
- **Sections**: Reusable page sections (Hero, FeaturedProducts, Collections, Benefits, Testimonials).
- **Pages**: Top-level route components (HomePage, ProductPage, CartPage, CheckoutPage, OrderTrackingPage).
- **UI Components**: Atomic components (Button, Input, Card, Modal, Badge).

### 2.2. Styling & UI
- **Tailwind CSS 4**: Utility-first styling for rapid development and consistent design.
- **Framer Motion**: Advanced animations for page transitions, image galleries, and interactive elements.
- **Lucide React**: Consistent iconography across the platform.
- **Responsive Design**: Mobile-first approach using Tailwind's responsive breakpoints.

### 2.3. State Management (Zustand)
- **Cart Store**: Manages items in the cart, quantities, and persistence to `localStorage`.
- **UI Store**: Manages global UI states like search visibility and mobile menu.

## 3. Backend Design

### 3.1. Server (Express)
- **API Routes**:
  - `/api/products`: Fetch product data from Firestore.
  - `/api/orders`: Create and retrieve orders.
  - `/api/settings`: Fetch store-wide settings (e.g., store name, logo).
- **Static Serving**: Serves the `dist/` directory in production.
- **Vite Middleware**: Integrated Vite dev server for HMR-like experience in development.

### 3.2. Data Models (Firestore)
- **Products Collection**:
  - `id`: string (Document ID)
  - `title`: string
  - `price`: number
  - `image`: string (Main image URL)
  - `gallery`: string[] (Additional images)
  - `category`: string
  - `description`: string
  - `variants`: object[] (Options like Color, Size)
- **Orders Collection**:
  - `id`: string (Document ID)
  - `customerInfo`: object (Name, Email, Phone, Address)
  - `items`: object[] (Product ID, Quantity, Price)
  - `total`: number
  - `status`: string (e.g., "pending", "shipped")
  - `createdAt`: timestamp

## 4. Security

### 4.1. Firestore Security Rules
- **Products**: Publicly readable, admin-only write access.
- **Orders**: Create-only for users, read-only for the order owner (by ID).
- **Settings**: Publicly readable, admin-only write access.

### 4.2. Authentication
- **Admin Access**: Restricted to specific UIDs or emails defined in Firestore rules.
- **Customer Identity**: Optional authentication for order history (extensible).

## 5. Deployment
- **Containerization**: Runs in a Cloud Run container.
- **Build Process**: `npm run build` generates static assets in `dist/`.
- **Start Command**: `node server.ts` starts the Express server.
