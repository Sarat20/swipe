// components/WelcomeBackModal.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal, Button, Typography } from 'antd';
import { resumeInterview, setShowWelcomeBack } from '../slices/interviewSlice';

const { Text } = Typography;

const WelcomeBackModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { currentQuestion, currentQuestionIndex, questions } = useSelector(state => state.interview);

  const handleResume = () => {
    dispatch(resumeInterview());
    dispatch(setShowWelcomeBack(false));
  };

  const handleStartNew = () => {
    dispatch(setShowWelcomeBack(false));
    // Reset will be handled by the interview flow
  };

  return (
    <Modal
      title="Welcome Back!"
      open={open}
      onCancel={handleStartNew}
      footer={[
        <Button key="new" onClick={handleStartNew}>
          Start New Interview
        </Button>,
        <Button key="resume" type="primary" onClick={handleResume}>
          Resume Interview
        </Button>,
      ]}
      closable={false}
      maskClosable={false}
    >
      <div style={{ marginBottom: 16 }}>
        <Text>
          It looks like you have an ongoing interview session.
        </Text>
      </div>
      {currentQuestion && (
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            You were on question {currentQuestionIndex + 1} of {questions.length}:
          </Text>
          <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f6f8fa', borderRadius: 4 }}>
            <Text strong>{currentQuestion.question}</Text>
          </div>
        </div>
      )}
      <Text>
        Would you like to resume where you left off or start a new interview?
      </Text>
    </Modal>
  );
};

export default WelcomeBackModal;
