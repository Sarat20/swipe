import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Input, 
  Button, 
  Progress, 
  Card, 
  Typography, 
  message, 
  Space,
  Result,
  Modal
} from 'antd';
import { 
  SendOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  updateAnswer, 
  finishInterview, 
  setCurrentQuestion,
  selectCurrentQuestion,
  selectInterviewProgress,
  selectInterviewInProgress,
  fetchQuestions,
  resetInterview
} from '../store/candidateSlice';

const { Text, Title } = Typography;

export default function ChatBox({ candidate }) {
  const dispatch = useDispatch();
  const currentQuestion = useSelector(selectCurrentQuestion);
  const interviewProgress = useSelector(selectInterviewProgress);
  const interviewInProgress = useSelector(selectInterviewInProgress);
  
  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: `Hi ${candidate.name || 'there'}! 👋 Welcome to your technical interview.`,
      timestamp: new Date()
    },
    { 
      sender: 'bot', 
      text: 'I\'ll be asking you a series of questions. Take your time to think before answering.',
      timestamp: new Date()
    }
  ]);
  
  const [timeLeft, setTimeLeft] = useState(0);
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInterviewComplete, setShowInterviewComplete] = useState(false);
  const messagesEndRef = useRef(null);

 
  useEffect(() => {
    if (interviewInProgress && !currentQuestion) {
      dispatch(fetchQuestions(candidate.resumeText || ''))
        .unwrap()
        .then(() => {
          addBotMessage('I\'ve reviewed your resume. Let\'s get started with the interview!');
        })
        .catch((error) => {
          console.error('Failed to load questions:', error);
          addBotMessage('Sorry, there was an error loading the interview questions. Please try again later.');
        });
    }
  }, [dispatch, interviewInProgress, candidate.resumeText]);

  
  useEffect(() => {
    if (currentQuestion) {
      addBotMessage(currentQuestion.question);
      setTimeLeft(currentQuestion.time);
    }
  }, [currentQuestion]);

  
  useEffect(() => {
    let timer;
    if (interviewInProgress && currentQuestion && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && interviewInProgress && currentQuestion) {
      handleSubmit(); 
    }
    return () => clearTimeout(timer);
  }, [timeLeft, currentQuestion, interviewInProgress]);

 
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addBotMessage = (text) => {
    setMessages(prev => [...prev, { 
      sender: 'bot', 
      text,
      timestamp: new Date()
    }]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      
      setMessages(prev => [...prev, { 
        sender: 'user', 
        text: answer,
        timestamp: new Date()
      }]);
      
      
      if (currentQuestion) {
        await dispatch(updateAnswer({ 
          qIndex: interviewProgress.current - 1, 
          answer: answer.trim() 
        })).unwrap();
      }
      
      setAnswer('');
      
     
      if (interviewProgress.isLastQuestion) {
        
        const score = Math.floor(Math.random() * 40) + 60; 
        const summary = score >= 70 ? 'Strong candidate with good technical knowledge.' : 
                        score >= 50 ? 'Candidate shows potential but needs improvement.' : 
                        'Candidate may need more experience.';
        
        await dispatch(finishInterview({ score, summary }));
        setShowInterviewComplete(true);
      } else {
        
        dispatch(setCurrentQuestion(interviewProgress.current));
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      message.error('Failed to submit answer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInterviewComplete = () => {
    setShowInterviewComplete(false);
    dispatch(resetInterview());
    
  };

  if (!interviewInProgress) {
    return (
      <Result
        status="success"
        title="Interview Completed!"
        subTitle="Thank you for completing the interview. Your responses have been recorded."
        extra={[
          <Button 
            type="primary" 
            key="dashboard" 
            onClick={() => window.location.reload()}
          >
            Return to Dashboard
          </Button>,
        ]}
      />
    );
  }

  return (
    <Card 
      style={{ maxWidth: 800, margin: '0 auto' }}
      styles={{ body: { padding: 0, display: 'flex', flexDirection: 'column', height: '100%' } }}
    >
      {/* Header with progress */}
      <div style={{ 
        padding: '16px 24px',
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Text strong>Question {interviewProgress.current} of {interviewProgress.total}</Text>
        <Space>
          <ClockCircleOutlined style={{ color: '#faad14' }} />
          <Text type="secondary">{formatTime(timeLeft)}</Text>
        </Space>
      </div>
      
      {/* Progress bar */}
      {currentQuestion && (
        <Progress 
          percent={Math.round((timeLeft / currentQuestion.time) * 100)} 
          showInfo={false} 
          strokeColor={
            (timeLeft / currentQuestion.time) > 0.5 ? '#52c41a' : 
            (timeLeft / currentQuestion.time) > 0.2 ? '#faad14' : '#ff4d4f'
          }
          style={{ height: '4px' }}
        />
      )}

      {/* Messages area */}
      <div 
        style={{ 
          flex: 1,
          overflowY: 'auto', 
          padding: '16px 24px',
          backgroundColor: '#f9f9f9',
          minHeight: '400px',
          maxHeight: '60vh'
        }}
      >
        {messages.map((m, i) => (
          <div 
            key={i} 
            style={{ 
              marginBottom: 16,
              textAlign: m.sender === 'bot' ? 'left' : 'right'
            }}
          >
            <div 
              style={{
                display: 'inline-block',
                padding: '12px 16px',
                borderRadius: m.sender === 'bot' ? '0 18px 18px 18px' : '18px 0 18px 18px',
                backgroundColor: m.sender === 'bot' ? '#fff' : '#1890ff',
                color: m.sender === 'bot' ? '#333' : '#fff',
                maxWidth: '85%',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                lineHeight: 1.5
              }}
            >
              {m.text}
              <div style={{ 
                fontSize: '11px', 
                opacity: 0.7, 
                marginTop: '4px',
                color: m.sender === 'bot' ? '#666' : 'rgba(255,255,255,0.8)'
              }}>
                {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      
      <div style={{ 
        padding: '16px 24px', 
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fff'
      }}>
        <Input.TextArea 
          rows={4} 
          placeholder={currentQuestion ? "Type your answer here..." : "Loading next question..."} 
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          autoSize={{ minRows: 4, maxRows: 8 }}
          style={{ marginBottom: 12 }}
          disabled={!currentQuestion || isSubmitting}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Press Enter to send, Shift+Enter for new line
          </Text>
          <Button 
            type="primary" 
            onClick={handleSubmit} 
            icon={<SendOutlined />}
            loading={isSubmitting}
            disabled={!answer.trim() || !currentQuestion || isSubmitting}
          >
            {interviewProgress.isLastQuestion ? 'Finish Interview' : 'Send'}
          </Button>
        </div>
      </div>
      
      {/* Interview Complete Modal */}
      <Modal
        open={showInterviewComplete}
        title="Interview Complete!"
        onOk={handleInterviewComplete}
        onCancel={handleInterviewComplete}
        footer={[
          <Button 
            key="submit" 
            type="primary" 
            onClick={handleInterviewComplete}
            icon={<CheckCircleOutlined />}
          >
            Return to Dashboard
          </Button>
        ]}
        width={600}
        centered
      >
        <div style={{ textAlign: 'center', padding: '24px 0' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={4} style={{ marginBottom: '8px' }}>Thank You!</Title>
          <Text type="secondary">
            Your interview has been successfully submitted. You can view your results in the Interviewer Dashboard.
          </Text>
        </div>
      </Modal>
    </Card>
  );
}