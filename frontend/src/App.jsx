import React, { useState, useMemo } from "react";
import { Tabs, Layout, ConfigProvider, theme, Typography } from "antd";
import { UserOutlined, DashboardOutlined } from "@ant-design/icons";
import Interviewee from "./pages/Interviewee";
import Interviewer from "./pages/Interviewer";
import "./App.css";

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {
  const [activeTab, setActiveTab] = useState("1");

  const tabItems = useMemo(() => [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined />
          <span>Interviewee</span>
        </span>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <DashboardOutlined />
          <span>Interviewer</span>
        </span>
      ),
    },
  ], []);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 6,
          colorBgContainer: '#fff',
        },
        components: {
          Layout: {
            headerBg: '#fff',
            headerPadding: '0 24px',
            headerHeight: 64,
          },
          Tabs: {
            horizontalItemGutter: 32,
            horizontalMargin: '0',
          },
        },
      }}
    >
      <Layout className="app-layout">
        <Header style={{ 
          display: 'flex', 
          alignItems: 'center',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          zIndex: 1,
          padding: '0 24px',
        }}>
          <div className="logo" style={{ marginRight: '32px' }}>
            <Title level={4} style={{ margin: 0, color: '#1890ff' }}>Swipe Interview</Title>
          </div>
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            items={tabItems}
            style={{ height: '100%' }}
            tabBarStyle={{ margin: 0 }}
          />
        </Header>
        <Content style={{ 
          padding: '24px', 
          margin: 0,
          minHeight: 'calc(100vh - 64px)',
          backgroundColor: '#f0f2f5',
        }}>
          <div className="site-layout-content">
            {activeTab === '1' ? <Interviewee /> : <Interviewer />}
          </div>
        </Content>
      </Layout>
    </ConfigProvider>
  );
}