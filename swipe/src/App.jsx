import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Tabs, Layout, Typography } from 'antd';
import { UserOutlined, DashboardOutlined } from '@ant-design/icons';
import IntervieweeView from './components/IntervieweeView';
import InterviewerView from './components/InterviewerView';
import WelcomeBackModal from './components/WelcomeBackModal';
import { setShowWelcomeBack } from './slices/interviewSlice';

const { Header, Content } = Layout;
const { Title } = Typography;

const App = () => {
  const dispatch = useDispatch();
  const { showWelcomeBack } = useSelector(state => state.interview);

  useEffect(() => {
    // Check if there's an ongoing interview to show welcome back modal
    const hasOngoingInterview = localStorage.getItem('redux-persist:root');
    if (hasOngoingInterview) {
      try {
        const persistedState = JSON.parse(hasOngoingInterview);
        if (persistedState.interview && persistedState.interview.status === 'in_progress') {
          dispatch(setShowWelcomeBack(true));
        }
      } catch (error) {
        console.error('Error checking persisted state:', error);
      }
    }
  }, [dispatch]);

  const tabItems = [
    {
      key: 'interviewee',
      label: (
        <span>
          <UserOutlined />
          Interviewee
        </span>
      ),
      children: <IntervieweeView />,
    },
    {
      key: 'interviewer',
      label: (
        <span>
          <DashboardOutlined />
          Interviewer
        </span>
      ),
      children: <InterviewerView />,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        alignItems: 'center'
      }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          AI-Powered Interview Assistant
        </Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <Tabs
          defaultActiveKey="interviewee"
          items={tabItems}
          size="large"
          style={{ marginBottom: 32 }}
        />
      </Content>
      <WelcomeBackModal
        open={showWelcomeBack}
        onClose={() => dispatch(setShowWelcomeBack(false))}
      />
    </Layout>
  );
};

export default App;