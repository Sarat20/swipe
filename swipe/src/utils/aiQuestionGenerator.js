
import { v4 as uuidv4 } from 'uuid';
import { QUESTION_DIFFICULTY } from '../types';
import { generateQuestionWithHF, evaluateAnswerWithHF, generateSummaryWithHF } from './huggingFaceService';

const QUESTION_TEMPLATES = {
  [QUESTION_DIFFICULTY.EASY]: {
    react: [
      'What is React and why would you use it?',
      'Explain the difference between functional and class components in React.',
      'What is JSX and how does it work?',
      'What are React Hooks and why are they useful?',
      'Explain the concept of props in React.',
      'What is state in React and how do you manage it?',
      'What is the virtual DOM and how does it improve performance?',
      'Explain the component lifecycle in React.',
    ],
    javascript: [
      'What is the difference between let, const, and var in JavaScript?',
      'Explain the concept of hoisting in JavaScript.',
      'What are arrow functions and how do they differ from regular functions?',
      'Explain the difference between == and === in JavaScript.',
      'What is a closure in JavaScript?',
      'What are template literals and how do you use them?',
      'Explain the concept of promises in JavaScript.',
      'What is the event loop in JavaScript?',
    ],
    general: [
      'What is version control and why is it important?',
      'Explain the difference between frontend and backend development.',
      'What is REST API and how does it work?',
      'What is a database and why do we need them?',
      'Explain the concept of responsive design.',
      'What is the difference between HTTP and HTTPS?',
      'What is a web server and how does it work?',
      'Explain the concept of caching in web development.',
    ]
  },
  [QUESTION_DIFFICULTY.MEDIUM]: {
    react: [
      'How does React handle state management in complex applications?',
      'Explain React Context API and when to use it.',
      'What are React Portals and when would you use them?',
      'Explain the concept of React refs and their use cases.',
      'How do you optimize React application performance?',
      'What is React.memo and how does it work?',
      'Explain the difference between useEffect and useLayoutEffect.',
      'How do you handle forms in React?',
    ],
    javascript: [
      'Explain the concept of prototypal inheritance in JavaScript.',
      'What is the module pattern and how do you implement it?',
      'Explain event delegation in JavaScript.',
      'What are generators and iterators in JavaScript?',
      'How does JavaScript handle asynchronous operations?',
      'Explain the concept of currying in JavaScript.',
      'What is the difference between call, apply, and bind?',
      'How do you implement inheritance in JavaScript?',
    ],
    general: [
      'What is the difference between SQL and NoSQL databases?',
      'Explain the concept of microservices architecture.',
      'What is Docker and how does it help in development?',
      'Explain the concept of API rate limiting.',
      'What is WebSocket and how does it differ from HTTP?',
      'Explain the concept of JWT authentication.',
      'What is CORS and why do we need it?',
      'How does browser caching work?',
    ]
  },
  [QUESTION_DIFFICULTY.HARD]: {
    react: [
      'How would you implement a custom React hook for data fetching?',
      'Explain React Fiber architecture and reconciliation algorithm.',
      'How do you handle error boundaries in React applications?',
      'What are React concurrent features and how do they work?',
      'Explain the concept of React Suspense and lazy loading.',
      'How do you optimize bundle size in React applications?',
      'What is React Server Components and how do they work?',
      'Explain the concept of React DevTools Profiler.',
    ],
    javascript: [
      'Explain the concept of closures in JavaScript and provide a practical example.',
      'How does JavaScript garbage collection work?',
      'What is the event delegation pattern and when to use it?',
      'Explain the module loading process in JavaScript.',
      'How do you implement a custom bind function?',
      'What is the difference between macro tasks and micro tasks?',
      'Explain the concept of tail call optimization.',
      'How do you implement a debounce function from scratch?',
    ],
    general: [
      'Explain the concept of distributed systems and their challenges.',
      'What is load balancing and how does it work?',
      'Explain the CAP theorem in distributed systems.',
      'What is container orchestration and why do we need it?',
      'Explain the concept of service mesh in microservices.',
      'What is serverless computing and its benefits?',
      'How does CDN (Content Delivery Network) work?',
      'Explain the concept of progressive web apps (PWA).',
    ]
  }
};


const KEYWORD_WEIGHTS = {
  react: {
    high: ['component', 'state', 'props', 'jsx', 'hook', 'virtual dom', 'lifecycle', 'context'],
    medium: ['render', 'update', 'performance', 'optimization', 'ref', 'portal', 'suspense'],
    low: ['function', 'class', 'element', 'attribute', 'event', 'handler']
  },
  javascript: {
    high: ['closure', 'prototype', 'inheritance', 'asynchronous', 'promise', 'callback', 'scope'],
    medium: ['hoisting', 'event loop', 'garbage collection', 'module', 'bind', 'apply'],
    low: ['variable', 'function', 'object', 'array', 'string', 'number']
  },
  general: {
    high: ['architecture', 'scalability', 'performance', 'security', 'optimization', 'efficiency'],
    medium: ['design', 'pattern', 'structure', 'implementation', 'integration', 'deployment'],
    low: ['system', 'application', 'service', 'component', 'feature', 'functionality']
  }
};

/**
 
 * @param {string} difficulty - The difficulty level (easy, medium, hard)
 * @param {string} topic - The topic area (react, javascript, general)
 * @returns {object} - The generated question object
 */
export const generateQuestion = async (difficulty = QUESTION_DIFFICULTY.EASY, topic = 'react') => {
  try {

    const hfQuestion = await generateQuestionWithHF(topic, difficulty);
    return hfQuestion;
  } catch (error) {
    console.warn('Hugging Face question generation failed, using fallback:', error);

    const templates = QUESTION_TEMPLATES[difficulty]?.[topic] || QUESTION_TEMPLATES[difficulty]?.react || [];

    if (templates.length === 0) {
      return {
        id: uuidv4(),
        question: `Tell me about your experience with ${topic} development.`,
        difficulty,
        type: 'general',
        topic,
        generatedBy: 'fallback'
      };
    }

    const randomIndex = Math.floor(Math.random() * templates.length);
    const questionText = templates[randomIndex];

    return {
      id: uuidv4(),
      question: questionText,
      difficulty,
      type: 'technical',
      topic,
      category: topic,
      generatedBy: 'fallback'
    };
  }
};

/**
 
 * @param {string} answer - The candidate's answer
 * @param {object} question - The question object
 * @returns {object} - Score and feedback object
 */
export const evaluateAnswer = async (answer, question) => {
  try {
    // Try Hugging Face API first
    const hfEvaluation = await evaluateAnswerWithHF(answer, question);
    return hfEvaluation;
  } catch (error) {
    console.warn('Hugging Face answer evaluation failed, using fallback:', error);

    if (!answer || answer.trim().length < 10) {
      return {
        score: 2,
        feedback: 'Answer is too brief. Please provide more detailed explanation.',
        keywords: [],
        generatedBy: 'fallback'
      };
    }

    const normalizedAnswer = answer.toLowerCase();
    const topic = question.category || 'general';
    const keywords = KEYWORD_WEIGHTS[topic] || KEYWORD_WEIGHTS.general;

    let highMatches = 0;
    let mediumMatches = 0;
    let lowMatches = 0;

    keywords.high.forEach(keyword => {
      if (normalizedAnswer.includes(keyword)) highMatches++;
    });

    keywords.medium.forEach(keyword => {
      if (normalizedAnswer.includes(keyword)) mediumMatches++;
    });

    keywords.low.forEach(keyword => {
      if (normalizedAnswer.includes(keyword)) lowMatches++;
    });

    const baseScore = (highMatches * 3) + (mediumMatches * 2) + (lowMatches * 1);
    const lengthBonus = Math.min(answer.length / 100, 2); 
    const totalScore = Math.min(baseScore + lengthBonus, 10);

    let feedback = '';
    if (totalScore >= 8) {
      feedback = 'Excellent answer! Demonstrates strong understanding of the topic.';
    } else if (totalScore >= 6) {
      feedback = 'Good answer with solid understanding. Consider elaborating on key concepts.';
    } else if (totalScore >= 4) {
      feedback = 'Decent answer, but could benefit from more specific details and examples.';
    } else {
      feedback = 'Answer needs more depth and specific technical details.';
    }

    return {
      score: Math.round(totalScore),
      feedback,
      keywords: {
        high: highMatches,
        medium: mediumMatches,
        low: lowMatches
      },
      generatedBy: 'fallback'
    };
  }
};

/**
 * Generate a set of interview questions for a full-stack role
 * @param {number} totalQuestions - Total number of questions to generate (default: 6)
 * @returns {Array} - Array of question objects
 */
export const generateInterviewQuestions = async (totalQuestions = 6) => {
  const questionsPerDifficulty = Math.floor(totalQuestions / 3); 
  const questions = [];

  const questionOrder = [];
  for (let i = 0; i < questionsPerDifficulty && questionOrder.length < totalQuestions; i++) {
    questionOrder.push({ difficulty: QUESTION_DIFFICULTY.EASY, topic: 'react' });
  }
  for (let i = 0; i < questionsPerDifficulty && questionOrder.length < totalQuestions; i++) {
    questionOrder.push({ difficulty: QUESTION_DIFFICULTY.MEDIUM, topic: 'javascript' });
  }
  for (let i = 0; i < questionsPerDifficulty && questionOrder.length < totalQuestions; i++) {
    questionOrder.push({ difficulty: QUESTION_DIFFICULTY.HARD, topic: 'general' });
  }

  console.log('Question order before generation:', questionOrder);
  console.log('Questions per difficulty should be:', questionsPerDifficulty);

  try {
   
    const aiQuestions = [];

    for (const { difficulty, topic } of questionOrder) {
      try {
        const question = await generateQuestion(difficulty, topic);
        aiQuestions.push(question);
        console.log(`Generated ${difficulty} question:`, question.question.substring(0, 50) + '...');
      } catch (error) {
        console.warn(`Failed to generate ${difficulty} ${topic} question:`, error);
       
        const templates = QUESTION_TEMPLATES[difficulty]?.[topic] || QUESTION_TEMPLATES[difficulty]?.react || [];
        if (templates.length > 0) {
          const randomIndex = Math.floor(Math.random() * templates.length);
          const questionText = templates[randomIndex];
          aiQuestions.push({
            id: uuidv4(),
            question: questionText,
            difficulty,
            type: 'technical',
            topic,
            category: topic,
            generatedBy: 'template-fallback'
          });
        }
      }
    }

    console.log('AI questions generated:', aiQuestions.length, aiQuestions.map(q => ({ difficulty: q.difficulty, topic: q.topic })));

    
    const questions = [];
    const questionsPerDifficulty = Math.floor(totalQuestions / 3);

    for (let i = 0; i < totalQuestions; i++) {
      const orderIndex = i % questionOrder.length;
      const { difficulty, topic } = questionOrder[orderIndex];

      const availableQuestions = aiQuestions.filter(q => q.difficulty === difficulty);

      if (availableQuestions.length > 0) {
       
        const questionToUse = availableQuestions.shift(); // Remove from available pool
        questions.push(questionToUse);
        console.log(`Used AI ${difficulty} question for slot ${i + 1}`);
      } else {
       
        const templates = QUESTION_TEMPLATES[difficulty]?.[topic] || QUESTION_TEMPLATES[difficulty]?.react || [];
        if (templates.length > 0) {
          const randomIndex = Math.floor(Math.random() * templates.length);
          const questionText = templates[randomIndex];

          questions.push({
            id: uuidv4(),
            question: questionText,
            difficulty,
            type: 'technical',
            topic,
            category: topic,
            generatedBy: 'template'
          });
          console.log(`Used template ${difficulty} question for slot ${i + 1}`);
        }
      }
    }

    console.log('Final questions before return:', questions.length, questions.map(q => ({ difficulty: q.difficulty, topic: q.topic })));
    console.log('Difficulty breakdown:', {
      easy: questions.filter(q => q.difficulty === QUESTION_DIFFICULTY.EASY).length,
      medium: questions.filter(q => q.difficulty === QUESTION_DIFFICULTY.MEDIUM).length,
      hard: questions.filter(q => q.difficulty === QUESTION_DIFFICULTY.HARD).length
    });

    return questions;
  } catch (error) {
    console.error('Error in generateInterviewQuestions:', error);

    const questions = [];
    for (let i = 0; i < totalQuestions; i++) {
      const { difficulty, topic } = questionOrder[i] || questionOrder[i % questionOrder.length];

      const templates = QUESTION_TEMPLATES[difficulty]?.[topic] || QUESTION_TEMPLATES[difficulty]?.react || [];
      if (templates.length > 0) {
        const randomIndex = Math.floor(Math.random() * templates.length);
        const questionText = templates[randomIndex];

        questions.push({
          id: uuidv4(),
          question: questionText,
          difficulty,
          type: 'technical',
          topic,
          category: topic,
          generatedBy: 'template'
        });
      }
    }

    return questions;
  }
};

/**
 
 * @param {Array} questions - Array of question objects
 * @returns {Array} - Array with unique questions
 */
const removeDuplicateQuestions = (questions) => {
  const seen = new Set();
  return questions.filter(question => {
    const questionText = question.question.toLowerCase().trim();
    if (seen.has(questionText)) {
      return false;
    }
    seen.add(questionText);
    return true;
  });
};

/**
 * Generate interview summary based on candidate performance
 * @param {Array} answers - Array of answer objects with scores
 * @param {object} candidate - Candidate information
 * @returns {string} - Generated summary
 */
export const generateInterviewSummary = async (answers, candidate) => {
  try {
 
    const hfSummary = await generateSummaryWithHF(answers, candidate);
    return hfSummary;
  } catch (error) {
    console.warn('Hugging Face summary generation failed, using fallback:', error);

    const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    const averageScore = totalScore / answers.length;

    let summary = '';

    if (averageScore >= 8) {
      summary = `${candidate.name} demonstrated excellent technical knowledge and problem-solving skills throughout the interview. `;
      summary += 'They provided detailed, well-structured answers that showed deep understanding of React, JavaScript, and web development concepts. ';
      summary += 'Strong candidate for full-stack development roles with immediate contribution potential.';
    } else if (averageScore >= 6) {
      summary = `${candidate.name} showed good understanding of fundamental concepts with some areas for improvement. `;
      summary += 'Their answers were generally clear and demonstrated practical knowledge. ';
      summary += 'With some additional experience, they would be a solid contributor to development teams.';
    } else if (averageScore >= 4) {
      summary = `${candidate.name} has basic understanding of the topics but needs more hands-on experience. `;
      summary += 'Their answers lacked depth in some technical areas and would benefit from further study. ';
      summary += 'May need mentorship and training before taking on complex development tasks.';
    } else {
      summary = `${candidate.name} needs significant improvement in technical knowledge and problem-solving skills. `;
      summary += 'Their answers were often brief and lacked understanding of key concepts. ';
      summary += 'Would benefit from foundational training before being considered for development roles.';
    }

    return summary;
  }
};
