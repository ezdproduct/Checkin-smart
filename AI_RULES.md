# AI Studio Application Rules

This document outlines the core technologies used in this application and provides clear guidelines on which libraries to use for specific functionalities.

## Tech Stack Description

*   **Frontend Framework**: React with TypeScript for building dynamic and type-safe user interfaces.
*   **Styling**: Tailwind CSS is used exclusively for all styling, promoting a utility-first approach for responsive and consistent designs.
*   **Build Tool**: Vite provides a fast development server and optimized build process for the application.
*   **State Management**: React's `useReducer` hook is employed for managing complex application-level state, while `useState` is used for local component state.
*   **AI Integration**: The `@google/genai` SDK is the designated library for all AI model interactions and content generation features.
*   **Icons**: Custom SVG icons are currently in use, but `lucide-react` is available and recommended for any new icon requirements.
*   **Component Library**: shadcn/ui (built on Radix UI and Tailwind CSS) is available and should be prioritized for creating new, accessible, and styled UI components.
*   **Presentation Rendering**: The `createPortal` feature from `react-dom` is utilized to render the presentation view in a separate browser window.
*   **Inter-window Communication**: The `BroadcastChannel` API facilitates real-time communication between the main editor window and the live presentation window.

## Library Usage Rules

*   **UI Development**: Always use React with TypeScript for building all user interface components.
*   **Styling**: All visual styling must be implemented using Tailwind CSS classes. Avoid custom CSS files or inline styles where Tailwind utilities are sufficient.
*   **State Management**:
    *   For simple, component-specific state, use React's `useState` hook.
    *   For more complex state logic involving multiple actions and shared state across components, use React's `useReducer` hook.
*   **AI Features**: All interactions with AI models, including content generation, must be done using the `@google/genai` package.
*   **Icons**: For any new icons, prefer importing them from `lucide-react`. If a specific icon is not available in `lucide-react`, you may add a custom SVG to the `src/components/Icons.tsx` file.
*   **Reusable UI Components**: When developing new UI elements such as buttons, input fields, modals, dialogs, or forms, prioritize using or adapting existing components from the shadcn/ui library. If a suitable shadcn/ui component does not exist, create a new component following the project's established styling and structure.
*   **Routing**: The application currently manages different views (Editor/Data) using a `currentView` state variable. For more advanced or nested routing requirements, `react-router-dom` should be introduced.
*   **External Window Rendering**: Use `createPortal` from `react-dom` when rendering content into a new browser window, such as for the live presentation view.
*   **Cross-Window Communication**: Utilize the `BroadcastChannel` API for any necessary communication between the main application window and any external windows (e.g., the presentation view).