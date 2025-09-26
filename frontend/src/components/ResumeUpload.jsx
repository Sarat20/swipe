import React, { useState } from "react";
import { Button, Form, Input, Upload, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

export default function ResumeUpload({ onParsed }) {
  const [form] = Form.useForm();
  const [fileUploaded, setFileUploaded] = useState(false);
  const [fileName, setFileName] = useState("");

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".pdf,.docx",
    beforeUpload: (file) => {
      const isPDF = file.type === "application/pdf";
      const isDOCX = file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      
      if (!isPDF && !isDOCX) {
        message.error("You can only upload PDF or DOCX files!");
        return false;
      }
      
      // For now, just store file name (later we'll send to backend)
      setFileName(file.name);
      setFileUploaded(true);
      message.success(`${file.name} uploaded successfully`);
      
      // Simulate extraction - in real app, backend would extract these
      form.setFieldsValue({
        name: "",
        email: "",
        phone: ""
      });
      
      return false; // Prevent automatic upload
    },
    onRemove: () => {
      setFileUploaded(false);
      setFileName("");
    }
  };

  const onFinish = (values) => {
    if (!fileUploaded) {
      message.error("Please upload your resume first!");
      return;
    }
    
    onParsed({
      name: values.name,
      email: values.email,
      phone: values.phone,
      resumeFile: fileName
    });
  };

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto" }}>
      <h2>AI Interview Assistant</h2>
      
      <Dragger {...uploadProps} style={{ marginBottom: 24 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag your resume to upload
        </p>
        <p className="ant-upload-hint">
          Support PDF and DOCX files only
        </p>
      </Dragger>

      {fileUploaded && (
        <div style={{ background: "#f0f2f5", padding: 16, marginBottom: 24, borderRadius: 8 }}>
          <p><b>Resume uploaded:</b> {fileName}</p>
          <p style={{ fontSize: 12, color: "#666" }}>
            Please fill in the details below (later this will be auto-extracted)
          </p>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        disabled={!fileUploaded}
      >
        <Form.Item 
          label="Full Name" 
          name="name" 
          rules={[{ required: true, message: "Please enter your name" }]}
        >
          <Input placeholder="John Doe" />
        </Form.Item>
        
        <Form.Item 
          label="Email" 
          name="email" 
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" }
          ]}
        >
          <Input placeholder="john@example.com" />
        </Form.Item>
        
        <Form.Item 
          label="Phone Number" 
          name="phone" 
          rules={[{ required: true, message: "Please enter your phone number" }]}
        >
          <Input placeholder="+1 234 567 8900" />
        </Form.Item>
        
        <Button 
          type="primary" 
          htmlType="submit" 
          block 
          size="large"
          disabled={!fileUploaded}
        >
          Start Interview
        </Button>
      </Form>
    </div>
  );
}