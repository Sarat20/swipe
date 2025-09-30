// utils/huggingFaceService.js

/**
 * HuggingFace API Service for AI-powered interview features
 */

// HuggingFace API configuration - you'll need to set this up
const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY || 'your-api-key-here';
const HF_API_URL = 'https://api-inference.huggingface.co/models';

/**
 * Generate a question using HuggingFace API
 * @param {string} topic - The topic area (react, javascript, general)
 * @param {string} difficulty - The difficulty level (easy, medium, hard)
 * @returns {object} - Generated question object
 */
export const generateQuestionWithHF = async (topic, difficulty) => {
  try {
    // For now, return a basic fallback since we don't have API setup
    // In a real implementation, you would call the HuggingFace API here

    const topics = {
      react: ['component', 'state', 'props', 'hooks', 'lifecycle'],
      javascript: ['function', 'object', 'array', 'promise', 'async'],
      general: ['system', 'application', 'development', 'design']
    };

    const difficulties = {
      easy: 'basic concepts and fundamentals',
      medium: 'intermediate patterns and implementations',
      hard: 'advanced concepts and complex scenarios'
    };

    const randomTopic = topics[topic] || topics.react;
    const randomConcept = randomTopic[Math.floor(Math.random() * randomTopic.length)];

    return {
      id: uuidv4(),
      question: `Explain ${randomConcept} in ${topic} and provide an example.`,
      difficulty,
      type: 'technical',
      topic,
      category: topic,
      generatedBy: 'huggingface'
    };
  } catch (error) {
    console.error('Error generating question with HuggingFace:', error);
    throw error;
  }
};

/**
 * Evaluate an answer using HuggingFace API
 * @param {string} answer - The candidate's answer
 * @param {object} question - The question object
 * @returns {object} - Score and feedback object
 */
export const evaluateAnswerWithHF = async (answer, question) => {
  try {
    // For now, return a basic evaluation since we don't have API setup
    // In a real implementation, you would call the HuggingFace API here

    if (!answer || answer.trim().length < 10) {
      return {
        score: 3,
        feedback: 'Answer is too brief. Please provide more detailed explanation.',
        keywords: { high: 0, medium: 0, low: 0 },
        generatedBy: 'huggingface'
      };
    }

    // Simple keyword-based scoring (in real implementation, use AI)
    const normalizedAnswer = answer.toLowerCase();
    const topic = question.category || 'general';
    const keywords = getKeywordsForTopic(topic);

    let highMatches = 0, mediumMatches = 0, lowMatches = 0;

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

    return {
      score: Math.round(totalScore),
      feedback: generateFeedback(totalScore),
      keywords: { high: highMatches, medium: mediumMatches, low: lowMatches },
      generatedBy: 'huggingface'
    };
  } catch (error) {
    console.error('Error evaluating answer with HuggingFace:', error);
    throw error;
  }
};

/**
 * Generate interview summary using HuggingFace API
 * @param {Array} answers - Array of answer objects with scores
 * @param {object} candidate - Candidate information
 * @returns {string} - Generated summary
 */
export const generateSummaryWithHF = async (answers, candidate) => {
  try {
    // For now, return a basic summary since we don't have API setup
    // In a real implementation, you would call the HuggingFace API here

    const totalScore = answers.reduce((sum, answer) => sum + (answer.score || 0), 0);
    const averageScore = totalScore / answers.length;

    if (averageScore >= 8) {
      return `${candidate.name} demonstrated excellent technical knowledge and problem-solving skills throughout the interview. They provided detailed, well-structured answers that showed deep understanding of React, JavaScript, and web development concepts. Strong candidate for full-stack development roles with immediate contribution potential.`;
    } else if (averageScore >= 6) {
      return `${candidate.name} showed good understanding of fundamental concepts with some areas for improvement. Their answers were generally clear and demonstrated practical knowledge. With some additional experience, they would be a solid contributor to development teams.`;
    } else if (averageScore >= 4) {
      return `${candidate.name} has basic understanding of the topics but needs more hands-on experience. Their answers lacked depth in some technical areas and would benefit from further study. May need mentorship and training before taking on complex development tasks.`;
    } else {
      return `${candidate.name} needs significant improvement in technical knowledge and problem-solving skills. Their answers were often brief and lacked understanding of key concepts. Would benefit from foundational training before being considered for development roles.`;
    }
  } catch (error) {
    console.error('Error generating summary with HuggingFace:', error);
    throw error;
  }
};

/**
 * Get keywords for a specific topic
 * @param {string} topic - The topic area
 * @returns {object} - Keywords object with high, medium, low weights
 */
const getKeywordsForTopic = (topic) => {
  const keywordMap = {
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

  return keywordMap[topic] || keywordMap.general;
};

/**
 * Generate feedback based on score
 * @param {number} score - The numerical score
 * @returns {string} - Feedback text
 */
const generateFeedback = (score) => {
  if (score >= 8) {
    return 'Excellent answer! Demonstrates strong understanding of the topic.';
  } else if (score >= 6) {
    return 'Good answer with solid understanding. Consider elaborating on key concepts.';
  } else if (score >= 4) {
    return 'Decent answer, but could benefit from more specific details and examples.';
  } else {
    return 'Answer needs more depth and specific technical details.';
  }
};

// Import uuidv4 for generating unique IDs
import { v4 as uuidv4 } from 'uuid';
