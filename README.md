# AI Content Writer Tool by [BuilderKit.ai](https://www.builderkit.ai)

`nextjs` `typescript` `openai` `supabase` `tailwindcss` `shadcn`

## Introduction

Content generation tool designed to assist users in creating high-quality social media posts, blog entries, and other content types efficiently. Utilizing advanced AI models, the platform offers a variety of customization options to match the user's style and preferences.

<a href="https://content-writer.builderkit.ai/home" target="_blank" rel="noopener">
  <picture>
    <img alt="AI Content Writer Tool" src="https://content-writer.builderkit.ai/github-cover.webp" />
  </picture>
</a>

## Features

- 🤖 AI-powered content generation using OpenAI.
- 🔒 Integration with Supabase for authentication and database management.
- 💻 Responsive design using Next.js, TailwindCSS and Shadcn.
- 🎨 Theme switching between light and dark modes.
- 😃 User-friendly dashboard for managing and generating content.
- 🔗 Secure user authentication with OAuth support.

## Quickstart Guide

### Prerequisites

Ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**

   Use the Project Url based on your plan

   - Starter - https://github.com/1811-Labs-LLC/BuilderKit-Starter.git
   - Pro - https://github.com/1811-Labs-LLC/BuilderKit-Pro.git

   ```sh
   git clone <url>

   cd builderkit

   git checkout content-writer
   ```

2. **Install dependencies:**

   ```sh
   npm install
   # or
   yarn install
   ```

3. **Environment Variables:**

   Create a `.env.local` file in the root directory and add the following variables:

   ```plaintext
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   OPENAI_API_KEY=<your-openai-api-key>
   NEXT_PUBLIC_GOOGLE_ANALYTICS_KEY=<your-google-analytics-key>
   ```

4. **Sync Supabase Types:**

   This will sync the table schema locally from Supabase. Run the below commands to login to supabase and sync the schema type.

   ```sh
   supabase login

   npx supabase gen types typescript --project-id <project-id> --schema public > src/types/supabase.ts
   ```

### Running the Application

1. **Run the development server:**

   ```sh
   npm run dev
   # or
   yarn dev
   ```

   This will start the development server on `http://localhost:3000`.

2. **Build for production:**

   ```sh
   npm run build
   # or
   yarn build
   ```

   This command compiles the application for production usage.

3. **Start the production server:**

   ```sh
   npm start
   # or
   yarn start
   ```

   This will start the application in production mode.

### Additional Scripts

- **Prepare Husky for Git hooks:**

  ```sh
  npm run prepare
  ```

- **Validate the code with Linting, Formatting & Typecheck:**

  ```sh
  npm run validate
  ```

## Requirements

- **Node.js**: Download and install from [here](https://nodejs.org/).
- **Supabase**: Create an account and a new project on [Supabase](https://supabase.com/). Obtain the `SUPABASE_URL` and `SUPABASE_ANON_KEY` from your project settings.
- **OpenAI API Key**: Sign up for an API key on [OpenAI](https://openai.com/).

## License

This project is licensed under the MIT License. See the [LICENSE](https://www.builderkit.ai/license) file for details.

## Contact

For any inquiries or issues, please open an issue on the [GitHub repository](https://github.com/1811-Labs-LLC/BuilderKit) or contact the author at [vatsal1811@gmail.com](mailto:vatsal1811@gmail.com).
