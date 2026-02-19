# 👨‍🍳 Chef's Kiss

Chef's Kiss is a modern, AI-powered meal planning application designed to simplify your kitchen experience. It helps users generate personalized meal plans, manage recipes, and streamline their cooking routine using Google's Gemini AI.

## 🌐 Live Demo

Don't want to set up a local environment? You can try the fully functional application at:
👉 **[chefskiss.tech](https://chefskiss.tech)**

**Test Credentials:**
- **Email:** `demo@chefskiss.tech`
- **Password:** `Testing123`

## ✨ Features

- **🤖 AI-Powered Meal Planning**: Generate personalized weekly meal plans based on your preferences using Gemini Flash.
- **🖼️ Automated Imagery**: Recipes are enriched with high-quality images from Unsplash.
- **🛹 Seamless Onboarding**: Quick and easy setup to tailor the experience to your household size, dietary needs, allergens, and spice preferences.
- **📱 Responsive Dashboard**: A sleek, user-friendly interface for managing your active meal plans and viewing recipe details.
- **🔐 Secure Authentication**: Powered by Better Auth for a safe and smooth login experience.
- **🌓 Dark Mode**: Full support for both light and dark themes.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **AI**: [Google Gemini AI SDK](https://ai.google.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Images**: [Unsplash API](https://unsplash.com/developers)

## 🚀 Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/) installed.
- A MongoDB database.
- Google Gemini API key.
- Unsplash Access Key.

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd chefskiss
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   MONGODB_URI=your_mongodb_uri
   GEMINI_API_KEY=your_gemini_api_key
   UNSPLASH_ACCESS_KEY=your_unsplash_access_key

   # Better Auth
   BETTER_AUTH_SECRET=your_secret
   BETTER_AUTH_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📄 License

This project is private.
