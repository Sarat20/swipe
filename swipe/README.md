# Swipe AI - AI-Powered Interview Platform

## Project Overview
Swipe AI is a modern interview platform that leverages AI to facilitate the interview process. The platform provides both interviewer and interviewee interfaces, enabling a seamless interview experience with AI-assisted question generation and response evaluation.

## Live Demo
Check out the live demo: [Swipe AI Demo](https://swipe-2b1ruibvy-sarat20s-projects.vercel.app/)

## Project Structure
```
swipe/
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # React components
│   │   ├── IntervieweeView.jsx  # Interviewee interface
│   │   └── InterviewerView.jsx  # Interviewer interface
│   ├── slices/           # Redux slices
│   │   └── candidateSlice.js  # Candidate state management
│   ├── store/            # Redux store setup
│   └── utils/            # Utility functions
├── public/               # Public assets
└── package.json          # Project dependencies
```

## Key Features

### Interviewer View
- Create interview sessions
- Generate questions using AI
- Evaluate candidate responses
- View candidate submissions

### Interviewee View
- DashBoard of candidates.

## Technologies Used

### Frontend
- React.js (v19)
- Redux Toolkit & React-Redux
- Ant Design (v5) for UI components
- Vite for build tooling

### AI/ML
- Hugging Face Inference API (@huggingface/inference)
- Document processing with Mammoth and PDF.js

### State Management
- Redux Toolkit for global state
- Redux Persist for state persistence

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Sarat20/swipe-ai.git
   cd swipe
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add:
   ```
   VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## Usage
1. **As an Interviewer**:
   - Create a new interview session
   - Generate questions using AI
   - Invite candidates using a unique session ID
   - Evaluate responses in real-time

2. **As an Interviewee**:
   - Join a session using the provided ID
   - Respond to questions via audio/video
   - Receive instant feedback on your responses

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements
- Multi-language support
- Advanced analytics dashboard
- Integration with job portals
- Mobile application
- Enhanced AI evaluation metrics

## Contact
For any queries or support, please contact [your-email@example.com]
