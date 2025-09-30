// components/IntervieweeView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Layout,
  Card,
  Button,
  Input,
  Upload,
  Form,
  message,
  Typography,
  Progress,
  Alert,
  Space,
  Tag
} from 'antd';
import {
  UploadOutlined,
  SendOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  UserOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import {
  setCurrentCandidate,
  addCandidate,
  updateCandidate,
  updateCandidateInterview
} from '../slices/candidateSlice';
import {
  setCurrentPhase,
  setMissingFields,
  clearMissingField,
  setCurrentQuestion,
  addQuestion,
  addAnswer,
  nextQuestion,
  setTimeRemaining,
  startTimer,
  stopTimer,
  setShowWelcomeBack,
  resetInterview
} from '../slices/interviewSlice';
import { QUESTION_DIFFICULTY, INTERVIEW_STATUS } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { parseResume } from '../utils/resumeParser';
import { generateInterviewQuestions, evaluateAnswer, generateInterviewSummary } from '../utils/aiQuestionGenerator';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const IntervieweeView = () => {
  const dispatch = useDispatch();
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [answer, setAnswer] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const chatEndRef = useRef(null);
  const timerRef = useRef(null);

  const {
    currentCandidateId,
    candidates
  } = useSelector(state => state.candidate);

  // Get current candidate object
  const currentCandidate = candidates.find(c => c.id === currentCandidateId) || null;

  const {
    currentPhase,
    currentQuestion,
    timeRemaining,
    questions,
    answers,
    missingFields,
    status,
    timerActive
  } = useSelector(state => state.interview);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [questions, answers, currentPhase]);

  // Timer effect - handle countdown and auto-submit
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        dispatch(setTimeRemaining(timeRemaining - 1));
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [timerActive, timeRemaining, dispatch]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeRemaining === 0 && currentQuestion && (currentPhase === 'asking_question' || currentPhase === 'waiting_answer')) {
      handleTimeUp();
    }
  }, [timeRemaining, currentPhase, currentQuestion]);

  const handleTimeUp = () => {
    handleSubmitAnswer('Time ran out - no answer provided');
  };

  const handleResumeUpload = (file) => {
    setResumeFile(file);
    return false; // Prevent default upload behavior
  };

  const handleParseResume = async () => {
    if (!resumeFile) {
      messageApi.error('Please upload a resume file first');
      return;
    }

    setIsParsing(true);
    try {
      const extractedData = await parseResume(resumeFile);

      const missing = [];
      if (!extractedData.name) missing.push('name');
      if (!extractedData.email) missing.push('email');
      if (!extractedData.phone) missing.push('phone');

      if (missing.length > 0) {
        dispatch(setMissingFields(missing));
        messageApi.info('Resume uploaded and parsed successfully. Please fill in the missing information.');
      } else {
        // Create candidate and start interview
        const candidateId = uuidv4();
        dispatch(addCandidate({
          id: candidateId,
          ...extractedData
        }));

        console.log('Candidate created from resume:', {
          candidateId,
          candidateData: {
            id: candidateId,
            ...extractedData,
            status: 'pending'
          }
        });

        dispatch(setCurrentCandidate(candidateId));
        startInterview();
      }
    } catch (error) {
      console.error('Resume parsing error:', error);
      messageApi.error(error.message || 'Failed to parse resume. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const startInterview = async () => {
    try {
      // Reset interview state before starting new interview
      dispatch(resetInterview());

      // Generate AI-powered questions using Hugging Face API
      const interviewQuestions = await generateInterviewQuestions(6);

      if (interviewQuestions.length === 0) {
        throw new Error('No questions generated');
      }

      console.log('Generated questions:', interviewQuestions.length, interviewQuestions);

      // Add all questions to Redux state
      interviewQuestions.forEach(q => dispatch(addQuestion(q)));

      if (interviewQuestions.length > 0) {
        // Set the first question as current
        dispatch(setCurrentQuestion(interviewQuestions[0]));
        dispatch(setCurrentPhase('asking_question'));
        dispatch(startTimer());

        console.log('Started interview with question:', interviewQuestions[0].question);
      } else {
        throw new Error('Failed to generate interview questions');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      messageApi.error('Failed to start interview. Please try again.');
    }
  };

  const handleSubmitAnswer = async (answerText) => {
    if (!answerText.trim()) return;

    try {
      // Evaluate the answer using AI system (now async)
      const evaluation = await evaluateAnswer(answerText, currentQuestion);

      dispatch(addAnswer({
        id: uuidv4(),
        questionId: currentQuestion.id,
        answer: answerText,
        submittedAt: new Date().toISOString(),
        timeSpent: currentQuestion.difficulty === QUESTION_DIFFICULTY.EASY ? 20 - timeRemaining :
                   currentQuestion.difficulty === QUESTION_DIFFICULTY.MEDIUM ? 60 - timeRemaining :
                   120 - timeRemaining,
        score: evaluation.score,
        feedback: evaluation.feedback,
        keywords: evaluation.keywords
      }));

      dispatch(stopTimer());

      if (questions.length > answers.length) {
        // Move to next question
        dispatch(nextQuestion());
        setTimeout(() => {
          dispatch(setCurrentPhase('asking_question')); // Show next question
          dispatch(startTimer());
        }, 1000);
      } else {
        // Interview completed
        completeInterview();
      }

      setAnswer('');
    } catch (error) {
      console.error('Error submitting answer:', error);
      messageApi.error('Failed to evaluate answer. Please try again.');

      // Still proceed with basic evaluation
      dispatch(addAnswer({
        id: uuidv4(),
        questionId: currentQuestion.id,
        answer: answerText,
        submittedAt: new Date().toISOString(),
        timeSpent: currentQuestion.difficulty === QUESTION_DIFFICULTY.EASY ? 20 - timeRemaining :
                   currentQuestion.difficulty === QUESTION_DIFFICULTY.MEDIUM ? 60 - timeRemaining :
                   120 - timeRemaining,
        score: 5, // Default score
        feedback: 'Answer received.',
        keywords: { high: 0, medium: 0, low: 0 }
      }));

      dispatch(stopTimer());
      if (questions.length > answers.length) {
        dispatch(nextQuestion());
        setTimeout(() => {
          dispatch(setCurrentPhase('asking_question'));
          dispatch(startTimer());
        }, 1000);
      } else {
        completeInterview();
      }

      setAnswer('');
    }
  };

  const completeInterview = async () => {
    try {
      const allAnswers = [...answers]; // Get current answers
      const totalScore = allAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);

      // Create a fallback candidate object if currentCandidate is not available
      const candidateForSummary = currentCandidate || {
        name: 'Anonymous Candidate',
        email: 'anonymous@example.com'
      };

      const summary = await generateInterviewSummary(allAnswers, candidateForSummary);

      if (currentCandidate) {
        dispatch(updateCandidateInterview({
          candidateId: currentCandidateId,
          interviewData: {
            totalScore,
            summary,
            endTime: new Date().toISOString(),
            questions: questions, // Save questions for dashboard
            answers: allAnswers   // Save answers for dashboard
          }
        }));

        // Debug: Log the updated candidate data
        console.log('Interview completed - candidate data saved:', {
          candidateId: currentCandidateId,
          totalScore,
          summary,
          questionsCount: questions.length,
          answersCount: allAnswers.length,
          status: 'completed'
        });

        // Debug: Check Redux state after saving
        setTimeout(() => {
          console.log('Redux state after interview completion:', {
            candidates: candidates.length,
            currentCandidate: currentCandidateId,
            candidateData: currentCandidate ? {
              id: currentCandidate.id,
              name: currentCandidate.name,
              status: currentCandidate.status,
              interviewData: currentCandidate.interviewData
            } : null
          });
        }, 100);
      }

      dispatch(setCurrentPhase('completed'));
      messageApi.success(`Interview completed! Your score: ${totalScore}/60`);
    } catch (error) {
      console.error('Error completing interview:', error);
      messageApi.error('Failed to complete interview evaluation. Please check results manually.');

      // Still show completion with basic scoring
      const allAnswers = [...answers];
      const totalScore = allAnswers.reduce((sum, answer) => sum + (answer.score || 0), 0);

      // Use fallback candidate for summary even in error case
      const fallbackCandidate = currentCandidate || {
        name: 'Anonymous Candidate',
        email: 'anonymous@example.com'
      };

      try {
        const summary = await generateInterviewSummary(allAnswers, fallbackCandidate);

        if (currentCandidate) {
          dispatch(updateCandidateInterview({
            candidateId: currentCandidateId,
            interviewData: {
              totalScore,
              summary,
              endTime: new Date().toISOString(),
              questions: questions, // Save questions for dashboard
              answers: allAnswers   // Save answers for dashboard
            }
          }));

          // Status is now updated automatically in the reducer
        }
      } catch (summaryError) {
        console.warn('Summary generation also failed:', summaryError);
        // Use basic summary as final fallback
        if (currentCandidate) {
          dispatch(updateCandidateInterview({
            candidateId: currentCandidateId,
            interviewData: {
              totalScore,
              summary: 'Interview completed successfully.',
              endTime: new Date().toISOString(),
              questions: questions, // Save questions for dashboard
              answers: allAnswers   // Save answers for dashboard
            }
          }));

          // Status is now updated automatically in the reducer
        }
      }

      dispatch(setCurrentPhase('completed'));
      messageApi.success(`Interview completed! Your score: ${totalScore}/60`);
    }
  };

  const handleFieldSubmit = (field, value) => {
    if (currentCandidate) {
      dispatch(updateCandidate({
        id: currentCandidateId,
        updates: { [field]: value }
      }));
      dispatch(clearMissingField(field));

      // Don't auto-start interview anymore - let the button handler do it
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = questions.length > 0 ? ((answers.length) / questions.length) * 100 : 0;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case QUESTION_DIFFICULTY.EASY: return 'green';
      case QUESTION_DIFFICULTY.MEDIUM: return 'orange';
      case QUESTION_DIFFICULTY.HARD: return 'red';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a'; // Green for excellent
    if (score >= 60) return '#faad14'; // Orange for good
    return '#ff4d4f'; // Red for needs improvement
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      {contextHolder}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1890ff',
          color: 'white',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <UserOutlined style={{ fontSize: '24px' }} />
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600'
          }}>
            Interviewee Portal
          </h1>
        </div>

        <div style={{ padding: '24px' }}>
          {/* Resume Upload Phase */}
          {currentPhase === 'idle' && (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              marginBottom: '24px'
            }}>
              <h2 style={{
                color: '#262626',
                fontSize: '24px',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                Welcome to Your AI Interview
              </h2>
              <p style={{
                color: '#595959',
                fontSize: '16px',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Please upload your resume to begin the interview process
              </p>

              <Upload
                beforeUpload={handleResumeUpload}
                accept=".pdf,.docx"
                maxCount={1}
                showUploadList={false}
              >
                <Button
                  icon={<UploadOutlined />}
                  size="large"
                  type="primary"
                  style={{
                    height: '48px',
                    fontSize: '16px',
                    padding: '0 32px',
                    borderRadius: '8px',
                    marginRight: '16px'
                  }}
                >
                  Upload Resume (PDF/DOCX)
                </Button>
              </Upload>

              {resumeFile && (
                <div style={{
                  marginTop: '24px',
                  padding: '20px',
                  backgroundColor: '#f6ffed',
                  borderRadius: '8px',
                  border: '1px solid #b7eb8f'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px',
                    fontSize: '16px',
                    color: '#262626'
                  }}>
                    <FileTextOutlined style={{
                      fontSize: '20px',
                      marginRight: '12px',
                      color: '#52c41a'
                    }} />
                    <strong>File: {resumeFile.name}</strong>
                  </div>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'center'
                  }}>
                    <Button
                      type="primary"
                      loading={isParsing}
                      onClick={handleParseResume}
                      size="large"
                      style={{
                        height: '44px',
                        padding: '0 32px',
                        fontSize: '16px',
                        borderRadius: '6px'
                      }}
                    >
                      {isParsing ? 'Parsing Resume...' : 'Parse Resume & Start Interview'}
                    </Button>
                    <Button
                      onClick={() => setResumeFile(null)}
                      size="large"
                      style={{
                        height: '44px',
                        padding: '0 32px',
                        fontSize: '16px',
                        borderRadius: '6px'
                      }}
                    >
                      Remove File
                    </Button>
                  </div>
                </div>
              )}

              {!resumeFile && (
                <div style={{ marginTop: '32px' }}>
                  <Button
                    type="default"
                    size="large"
                    onClick={() => {
                      const candidateId = uuidv4();
                      dispatch(addCandidate({
                        id: candidateId,
                        name: 'Anonymous Candidate',
                        email: 'anonymous@example.com',
                        phone: 'Not provided',
                        resume: null
                      }));

                      console.log('Candidate created:', {
                        candidateId,
                        candidateData: {
                          id: candidateId,
                          name: 'Anonymous Candidate',
                          email: 'anonymous@example.com',
                          phone: 'Not provided',
                          resume: null,
                          status: 'pending'
                        }
                      });

                      dispatch(setCurrentCandidate(candidateId));
                      startInterview();
                    }}
                    style={{
                      height: '44px',
                      padding: '0 32px',
                      fontSize: '16px',
                      borderRadius: '6px'
                    }}
                  >
                    Skip Resume Upload & Start Interview
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Missing Fields Collection Phase */}
          {currentPhase === 'collecting_info' && (
            <div style={{ marginBottom: '24px' }}>
              <Alert
                message="Complete Your Profile"
                description="Please provide the missing information from your resume to continue."
                type="info"
                showIcon
                style={{
                  marginBottom: '24px',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />

              <Form form={form} layout="vertical">
                {missingFields.includes('name') && (
                  <Form.Item label="Full Name" name="name">
                    <Input
                      placeholder="Enter your full name"
                      style={{
                        height: '44px',
                        fontSize: '16px',
                        borderRadius: '6px'
                      }}
                    />
                  </Form.Item>
                )}

                {missingFields.includes('email') && (
                  <Form.Item label="Email Address" name="email">
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      style={{
                        height: '44px',
                        fontSize: '16px',
                        borderRadius: '6px'
                      }}
                    />
                  </Form.Item>
                )}

                {missingFields.includes('phone') && (
                  <Form.Item label="Phone Number" name="phone">
                    <Input
                      placeholder="Enter your phone number"
                      style={{
                        height: '44px',
                        fontSize: '16px',
                        borderRadius: '6px'
                      }}
                    />
                  </Form.Item>
                )}

                <div style={{
                  marginTop: '32px',
                  textAlign: 'center',
                  display: 'flex',
                  gap: '16px',
                  justifyContent: 'center'
                }}>
                  <Button
                    type="primary"
                    size="large"
                    onClick={async () => {
                      const values = form.getFieldsValue();
                      const filledFields = Object.keys(values).filter(key => values[key]?.trim());

                      if (filledFields.length === missingFields.length) {
                        try {
                          for (const field of missingFields) {
                            if (values[field]?.trim()) {
                              dispatch(updateCandidate({
                                id: currentCandidateId,
                                updates: { [field]: values[field].trim() }
                              }));
                              dispatch(clearMissingField(field));
                              await new Promise(resolve => setTimeout(resolve, 50));
                            }
                          }

                          setTimeout(() => {
                            startInterview();
                          }, 100);
                        } catch (error) {
                          console.error('Error processing fields:', error);
                          messageApi.error('Error processing information. Please try again.');
                        }
                      } else {
                        messageApi.warning('Please fill in all required fields before continuing.');
                      }
                    }}
                    style={{
                      height: '44px',
                      padding: '0 32px',
                      fontSize: '16px',
                      borderRadius: '6px'
                    }}
                  >
                    Continue to Interview
                  </Button>
                  <Button
                    size="large"
                    onClick={() => {
                      dispatch(setMissingFields([]));
                      startInterview();
                    }}
                    style={{
                      height: '44px',
                      padding: '0 32px',
                      fontSize: '16px',
                      borderRadius: '6px'
                    }}
                  >
                    Skip and Continue
                  </Button>
                </div>
              </Form>
            </div>
          )}

          {/* Interview Phase */}
          {(currentPhase === 'asking_question' || currentPhase === 'waiting_answer') && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 'calc(100vh - 200px)',
              gap: '20px'
            }}>
              {/* Progress */}
              <div style={{
                backgroundColor: '#f0f2f5',
                padding: '16px 20px',
                borderRadius: '8px',
                border: '1px solid #e8e8e8'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <Text style={{ fontSize: '16px', fontWeight: '500', color: '#262626' }}>
                    Progress: {answers.length} of {questions.length} questions
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#595959' }}>
                    {Math.round(progress)}% Complete
                  </Text>
                </div>
                <Progress
                  percent={progress}
                  size="small"
                  strokeColor={{
                    from: '#108ee9',
                    to: '#87d068',
                  }}
                />
              </div>

              {/* Chat Messages - Scrollable */}
              <div style={{
                flex: 1,
                border: '1px solid #e8e8e8',
                borderRadius: '8px',
                padding: '20px',
                overflowY: 'auto',
                backgroundColor: '#ffffff',
                minHeight: '300px',
                maxHeight: 'calc(100vh - 400px)'
              }}>
                {/* Show previous questions with answers */}
                {questions.slice(0, answers.length).map((q, index) => (
                  <div key={q.id} style={{
                    marginBottom: '24px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    border: '1px solid #e8e8e8'
                  }}>
                    {/* Previous Question Header */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #e8e8e8'
                    }}>
                      <Tag
                        color={getDifficultyColor ? getDifficultyColor(q.difficulty) : 'default'}
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          padding: '6px 16px',
                          borderRadius: '20px'
                        }}
                      >
                        {q.difficulty?.toUpperCase() || 'UNKNOWN'}
                      </Tag>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#595959'
                      }}>
                        <span>Question {index + 1} of {questions.length}</span>
                        {q.generatedBy && (
                          <Tag size="small" color={q.generatedBy === 'huggingface' ? 'blue' : 'orange'}>
                            {q.generatedBy === 'huggingface' ? '🤖 AI Generated' : '📋 Template'}
                          </Tag>
                        )}
                      </div>
                    </div>

                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#262626',
                      marginBottom: '16px',
                      lineHeight: '1.4'
                    }}>
                      {q.question}
                    </h3>

                    {/* Answer Section */}
                    {answers[index] && (
                      <div style={{
                        marginTop: '20px',
                        padding: '20px',
                        backgroundColor: answers[index].score >= 7 ? '#f6ffed' :
                                       answers[index].score >= 4 ? '#fff7e6' : '#fff1f0',
                        borderRadius: '8px',
                        border: `2px solid ${answers[index].score >= 7 ? '#b7eb8f' :
                                           answers[index].score >= 4 ? '#ffd591' : '#ffccc7'}`
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <Text style={{
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#262626'
                          }}>
                            Your Answer:
                          </Text>
                          <div style={{ marginLeft: 'auto' }}>
                            <Text style={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: getScoreColor ? getScoreColor(answers[index].score * 10) : '#1890ff'
                            }}>
                              Score: {answers[index].score}/10
                            </Text>
                          </div>
                        </div>
                        <Text style={{
                          fontSize: '16px',
                          lineHeight: '1.6',
                          color: '#595959',
                          display: 'block',
                          marginBottom: '12px'
                        }}>
                          {answers[index].answer}
                        </Text>
                        {answers[index].feedback && (
                          <div style={{
                            padding: '12px',
                            backgroundColor: 'rgba(255,255,255,0.8)',
                            borderRadius: '6px',
                            borderLeft: '4px solid #1890ff'
                          }}>
                            <Text style={{
                              fontSize: '14px',
                              color: '#595959',
                              fontStyle: 'italic'
                            }}>
                              💡 {answers[index].feedback}
                            </Text>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {/* Show current question being asked */}
                {currentQuestion && answers.length < questions.length && (
                  <div style={{
                    padding: '20px',
                    backgroundColor: '#e6f7ff',
                    borderRadius: '8px',
                    border: '2px solid #91d5ff'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '16px',
                      paddingBottom: '12px',
                      borderBottom: '1px solid #91d5ff'
                    }}>
                      <Tag
                        color={getDifficultyColor ? getDifficultyColor(currentQuestion.difficulty) : 'default'}
                        style={{
                          fontSize: '14px',
                          fontWeight: 'bold',
                          padding: '6px 16px',
                          borderRadius: '20px'
                        }}
                      >
                        {currentQuestion.difficulty?.toUpperCase() || 'UNKNOWN'}
                      </Tag>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        fontSize: '14px',
                        color: '#595959'
                      }}>
                        <span>Current Question</span>
                        {currentQuestion.generatedBy && (
                          <Tag size="small" color={currentQuestion.generatedBy === 'huggingface' ? 'blue' : 'orange'}>
                            {currentQuestion.generatedBy === 'huggingface' ? '🤖 AI Generated' : '📋 Template'}
                          </Tag>
                        )}
                      </div>
                    </div>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#262626',
                      lineHeight: '1.4'
                    }}>
                      {currentQuestion.question}
                    </h3>
                  </div>
                )}

                {/* No questions loaded message */}
                {questions.length === 0 && !currentQuestion && (
                  <div style={{
                    textAlign: 'center',
                    padding: '60px 20px',
                    color: '#999'
                  }}>
                    <Text style={{ fontSize: '16px' }}>No questions loaded yet...</Text>
                  </div>
                )}

                {/* Current Question Timer */}
                {currentQuestion && (currentPhase === 'asking_question' || currentPhase === 'waiting_answer') && (
                  <div style={{
                    backgroundColor: timeRemaining <= 30 ? '#fff1f0' : '#fff7e6',
                    padding: '20px',
                    borderRadius: '8px',
                    border: `2px solid ${timeRemaining <= 30 ? '#ffccc7' : '#ffd591'}`,
                    textAlign: 'center',
                    marginTop: '20px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '8px'
                    }}>
                      <ClockCircleOutlined style={{
                        marginRight: '12px',
                        fontSize: '20px',
                        color: timeRemaining <= 30 ? '#ff4d4f' : '#fa8c16'
                      }} />
                      <Text style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: timeRemaining <= 30 ? '#ff4d4f' : '#fa8c16',
                        fontFamily: 'monospace'
                      }}>
                        {formatTime(timeRemaining)}
                      </Text>
                    </div>
                    <Text style={{
                      fontSize: '16px',
                      color: timeRemaining <= 30 ? '#ff4d4f' : '#fa8c16'
                    }}>
                      Time remaining for this question
                    </Text>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Answer Input - Fixed at bottom */}
              {(currentPhase === 'asking_question' || currentPhase === 'waiting_answer') && currentQuestion && (
                <div style={{
                  backgroundColor: '#ffffff',
                  padding: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e8e8e8',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  marginTop: 'auto'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#262626',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      Your Answer:
                    </label>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Press Shift+Enter for new line
                    </Text>
                  </div>
                  <TextArea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Type your thoughtful answer here..."
                    autoSize={{ minRows: 4, maxRows: 8 }}
                    style={{
                      marginBottom: '20px',
                      borderRadius: '8px',
                      border: '2px solid #d9d9d9',
                      fontSize: '16px',
                      lineHeight: '1.6',
                      padding: '16px'
                    }}
                  />
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    justifyContent: 'flex-end',
                    alignItems: 'center'
                  }}>
                    <Button
                      onClick={() => setAnswer('')}
                      disabled={!answer.trim()}
                      size="large"
                      style={{
                        height: '44px',
                        padding: '0 24px',
                        fontSize: '16px',
                        borderRadius: '6px'
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      onClick={() => handleSubmitAnswer(answer)}
                      disabled={!answer.trim()}
                      size="large"
                      style={{
                        height: '44px',
                        padding: '0 32px',
                        fontSize: '16px',
                        borderRadius: '6px',
                        backgroundColor: '#1890ff',
                        borderColor: '#1890ff'
                      }}
                    >
                      Submit Answer
                    </Button>
                    {/* Show Finish Interview button when all questions are answered */}
                    {answers.length === questions.length && answers.length > 0 && (
                      <Button
                        type="primary"
                        icon={<CheckCircleOutlined />}
                        onClick={completeInterview}
                        size="large"
                        style={{
                          height: '44px',
                          padding: '0 32px',
                          fontSize: '16px',
                          borderRadius: '6px',
                          backgroundColor: '#52c41a',
                          borderColor: '#52c41a'
                        }}
                      >
                        Finish Interview
                      </Button>
                    )}
                  </div>
                  <div style={{
                    marginTop: '16px',
                    textAlign: 'center'
                  }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      💡 Tip: You can also press Enter to submit your answer
                    </Text>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interview Completed */}
          {currentPhase === 'completed' && (
            <div style={{
              textAlign: 'center',
              padding: '60px 40px',
              backgroundColor: '#f6ffed',
              borderRadius: '8px',
              border: '1px solid #b7eb8f'
            }}>
              <CheckCircleOutlined style={{
                fontSize: '64px',
                color: '#52c41a',
                marginBottom: '24px'
              }} />
              <h2 style={{
                color: '#262626',
                fontSize: '28px',
                marginBottom: '16px',
                fontWeight: '600'
              }}>
                Interview Completed!
              </h2>
              <p style={{
                color: '#595959',
                fontSize: '18px',
                marginBottom: '32px',
                lineHeight: '1.6'
              }}>
                Thank you for completing the interview. Here are your results:
              </p>

              {currentCandidate?.interviewData?.totalScore && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    fontSize: '32px',
                    fontWeight: 'bold',
                    color: '#52c41a',
                    marginBottom: '16px'
                  }}>
                    Score: {currentCandidate.interviewData.totalScore}/60
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: '#595959',
                    lineHeight: '1.6',
                    maxWidth: '600px',
                    margin: '0 auto'
                  }}>
                    {currentCandidate.interviewData.summary}
                  </div>
                </div>
              )}

              <Button
                type="primary"
                size="large"
                icon={<CheckCircleOutlined />}
                onClick={() => {
                  dispatch(setCurrentPhase('idle'));
                  setResumeFile(null);
                  setAnswer('');
                }}
                style={{
                  height: '48px',
                  padding: '0 40px',
                  fontSize: '18px',
                  borderRadius: '8px',
                  backgroundColor: '#1890ff',
                  borderColor: '#1890ff'
                }}
              >
                Start New Interview
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntervieweeView;
