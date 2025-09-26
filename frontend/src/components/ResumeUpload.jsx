import React, { useState } from "react";
import { Button, Form, Input } from "antd";

export default function ResumeUpload({ onParsed }) {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    onParsed(values);
  };

  return (
    <div>
      <h3>Upload Resume / Enter Details</h3>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item label="Name" name="name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Phone" name="phone" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Button type="primary" htmlType="submit">Start Interview</Button>
      </Form>
    </div>
  );
}