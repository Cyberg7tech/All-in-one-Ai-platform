# BuilderKit

BuilderKit is an AI-powered content creation tool designed to streamline the process of generating high-quality content for various platforms.

## Table of Contents

- [How to Run the App](#how-to-run-the-app)
- [Possibilities](#possibilities)
- [Requirements](#requirements)

## How to Run the App

### Development

To run the app in development mode:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd builderkit
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

### Production

To build and run the app in production mode:

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the application:
   ```bash
   npm start
   ```

### Other Commands

- Lint the code:
  ```bash
  npm run lint
  ```
- Format the code:
  ```bash
  npm run format
  ```
- Run type checks:
  ```bash
  npm run typecheck
  ```

## Possibilities

BuilderKit offers a range of functionalities:

1. **Content Creation**: Generate various types of content based on user-defined topics and styles.
2. **Image Generation**: Create images based on prompts, including interior designs and headshots.
3. **Voice Transcriptions**: Convert audio files into text transcriptions and summaries.
4. **QR Code Generation**: Create QR codes based on user-provided URLs.
5. **User Authentication**: Secure user authentication using Supabase with support for OAuth and email/password sign-in.
6. **Dashboard Features**: Access a dashboard with features like content history, user settings, and subscription management.

## Requirements

To run BuilderKit, ensure you have the following:

1. **Node.js**: Version 18 or higher.
2. **npm**: Version 8 or higher.
3. **Environment Variables**: Create a `.env` file in the root directory and add the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
   NEXT_PUBLIC_GOOGLE_ANALYTICS_KEY=<your-google-analytics-key>
   OPENAI_API_KEY=<your-openai-api-key>
   ```
4. **Supabase**: A Supabase project with the necessary tables and configurations.

## Dependencies

The project relies on several key dependencies, including but not limited to:

- `next`: Latest version
- `react`: ^18
- `supabase`: Latest version
- `tailwindcss`: ^3.4.1
- `typescript`: ^5.3.3
- Various Radix UI components for enhanced UI/UX

## License

This project is licensed under the MIT License.

## Author

BuilderKit is developed and maintained by [@saddysk](https://github.com/saddysk).

---

Feel free to contribute to the project by submitting issues or pull requests.
