# Pulse Portal - Healthcare Camp Management

A  application for managing healthcare camps. Users can browse, register, pay for, provide feedback on, and cancel camp registrations with a modern, responsive UI.

## Features

- Browse and filter available camps with search and sort
- View detailed camp information and register
- Pay for camps via Stripe (simulated) with payment tracking
- Cancel unpaid registrations
- Submit feedback for paid and confirmed camps
- Responsive design with Tailwind CSS and Framer Motion animations
- Real-time notifications using React Toastify

## Tech Stack

- **Frontend**: React, Vite, React Router DOM, React Hook Form, Tailwind CSS, Framer Motion, React Toastify
- **Backend**: REST API (Node.js/Express, MongoDB )
- **Auth**: Custom \`AuthProvider\` (Firebase-compatible)
- **Payment**: Stripe (simulated)

## Setup

1. **Clone the Repository**:
   \`\`\`bash
   git clone https://github.com/md-sifat/pulse-portal.git
   cd pulse-portal
   \`\`\`

2. **Install Dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure Environment**:
   Create a \`.env\` file:
   \`\`\`env
   VITE_API_URL=https://pulse-portal-server.vercel.app
   \`\`\`

4. **Run the App**:
   \`\`\`bash
   npm run dev
   \`\`\`
   Open \`http://localhost:5173\`.

5. **Build for Production**:
   \`\`\`bash
   npm run build
   \`\`\`

## Available Scripts

- \`npm run dev\`: Start dev server with HMR
- \`npm run build\`: Build for production
- \`npm run preview\`: Preview production build
- \`npm run lint\`: Run ESLint

## API Endpoints

- \`GET /camps\`: List all camps
- \`POST /reg_camps\`: Register for a camp
- \`GET /reg_camps\`: Get registered camps
- \`PUT /reg_camp/:camp_id\`: Update payment status
- \`DELETE /reg_camp/:camp_id\`: Cancel registration
- \`POST /transactions\`: Store transactions
- \`POST /feedbacks\`: Submit feedback
- \`GET /feedbacks\`: Fetch feedback

## Usage

- **Log In**: Go to \`/login\` to authenticate.
- **Browse Camps**: Visit \`/available-camps\` to view and join camps.
- **Manage Registrations**: Access \`/registered-camps\` to pay, cancel, or submit feedback.
