import React, { useState } from "react";
import { Tabs, Layout } from "antd";
import Interviewee from "./pages/Interviewee";
import Interviewer from "./pages/Interviewer";

const { TabPane } = Tabs;
const { Content } = Layout;

export default function App() {
  return (
    <Layout style={{ minHeight: "100vh", padding: 24 }}>
      <Content>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Interviewee" key="1">
            <Interviewee />
          </TabPane>
          <TabPane tab="Interviewer Dashboard" key="2">
            <Interviewer />
          </TabPane>
        </Tabs>
      </Content>
    </Layout>
  );
}