import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Modal, Result, Button, Typography, Card } from 'antd';
import { SmileOutlined } from '@ant-design/icons';
import ResumeUpload from '../components/ResumeUpload';
import ChatBox from '../components/ChatBox';
import { 
  addCandidate, 
  selectActiveCandidate, 
  selectInterviewInProgress,
  resetInterview
} from '../store/candidateSlice';

const { Title } = Typography;

export default function Interviewee() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeCandidate = useSelector(selectActiveCandidate);
  const interviewInProgress = useSelector(selectInterviewInProgress);
  
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSessionExpired, setShowSessionExpired] = useState(false);

  // Check for existing interview session on mount
  useEffect(() => {
    const hasUnfinishedInterview = activeCandidate && !activeCandidate.finished;
    
    if (hasUnfinishedInterview) {
      const lastUpdated = new Date(activeCandidate.updatedAt);
      const hoursSinceLastUpdate = (new Date() - lastUpdated) / (1000 * 60 * 60);
      
      // If it's been more than 24 hours since last update, consider it expired
      if (hoursSinceLastUpdate > 24) {
        setShowSessionExpired(true);
        dispatch(resetInterview());
      } else {
        setShowWelcome(true);
      }
    }
  }, [activeCandidate, dispatch]);

  const handleResumeUpload = (profile) => {
    const newCandidate = {
      ...profile,
      appliedAt: new Date().toISOString(),
      status: 'in_progress',
      answers: [],
      score: null,
      summary: '',
      finished: false,
    };
    
    dispatch(addCandidate(newCandidate));
  };

  const handleResumeInterview = () => {
    setShowWelcome(false);
  };

  const handleStartNewInterview = () => {
    dispatch(resetInterview());
    setShowWelcome(false);
    setShowSessionExpired(false);
  };

  const handleFinishInterview = () => {
    dispatch(resetInterview());
    navigate('/');
  };

  // If there's an active interview, show the chat interface
  if (interviewInProgress || (activeCandidate && !activeCandidate.finished)) {
    return <ChatBox candidate={activeCandidate} />;
  }

  // Show session expired message
  if (showSessionExpired) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto' }}>
        <Result
          status="warning"
          title="Session Expired"
          subTitle="Your previous interview session has expired. Please start a new interview."
          extra={[
            <Button 
              type="primary" 
              key="new-interview" 
              onClick={handleStartNewInterview}
            >
              Start New Interview
            </Button>,
          ]}
        />
      </div>
    );
  }

  // Show welcome back modal for unfinished interview
  if (showWelcome) {
    return (
      <div style={{ maxWidth: 800, margin: '40px auto' }}>
        <Result
          icon={<SmileOutlined />}
          title="Welcome Back!"
          subTitle="You have an unfinished interview. Would you like to continue where you left off?"
          extra={[
            <Button 
              type="primary" 
              key="resume" 
              onClick={handleResumeInterview}
            >
              Resume Interview
            </Button>,
            <Button 
              key="new" 
              onClick={handleStartNewInterview}
            >
              Start New Interview
            </Button>,
          ]}
        />
      </div>
    );
  }

  
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          Start Your Interview
        </Title>
        <ResumeUpload onParsed={handleResumeUpload} />
      </Card>
      
      {/* Session expired modal */}
      <Modal
        open={showSessionExpired}
        title="Session Expired"
        onCancel={handleStartNewInterview}
        footer={[
          <Button key="ok" type="primary" onClick={handleStartNewInterview}>
            Start New Interview
          </Button>
        ]}
      >
        <p>Your previous interview session has expired. Please start a new interview.</p>
      </Modal>
    </div>
  );
}