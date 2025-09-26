import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { 
  Upload, 
  Button, 
  Form, 
  Input, 
  message, 
  Card, 
  Typography, 
  Progress,
  Space,
  Row,
  Col,
  Alert
} from 'antd';
import { 
  InboxOutlined, 
  UploadOutlined, 
  FilePdfOutlined, 
  FileWordOutlined,
  CheckCircleOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { parseResume } from '../utils/resumeParser';

const { Dragger } = Upload;
const { Text, Title } = Typography;

export default function ResumeUpload({ onParsed }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extracted, setExtracted] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const acceptedFileTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword'
  ];
  const maxFileSize = 5 * 1024 * 1024; // 5MB

  const validateFile = (file) => {
    const isAcceptedType = acceptedFileTypes.includes(file.type);
    const isSizeValid = file.size <= maxFileSize;
    
    if (!isAcceptedType) {
      setFileError('Only PDF and DOCX files are allowed');
      return false;
    }
    
    if (!isSizeValid) {
      setFileError('File size must be less than 5MB');
      return false;
    }
    
    setFileError('');
    return true;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
      }
    }
  };

  
  const handleFileChange = (file) => {
    if (file && validateFile(file)) {
      setFile(file);
    }
  
    return false;
  };

  const uploadResume = async () => {
    if (!file) {
      message.error('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    
    try {
      
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          return next >= 90 ? 90 : next;
        });
      }, 150);

      let parsed;
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      if (baseUrl) {
        try {
         
          const url = `${baseUrl}/api/parse-resume`;
          const formData = new FormData();
          formData.append('resume', file);

          const resp = await fetch(url, { method: 'POST', body: formData });
          if (!resp.ok) throw new Error(`Backend parse failed: ${resp.status}`);
          const payload = await resp.json();

          
          if (!payload || payload.success === false || !payload.data) {
            throw new Error('Invalid backend payload');
          }
          parsed = {
            name: payload.data.name || '',
            email: payload.data.email || '',
            phone: payload.data.phone || '',
            skills: payload.data.skills || [],
            experience: payload.data.experience || '',
            education: payload.data.education || '',
            text: payload.data.text || '',
          };
        } catch (backendErr) {
        
          parsed = await parseResume(file);
        }
      } else {
      
        parsed = await parseResume(file);
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      setExtracted(parsed);
      form.setFieldsValue({
        name: parsed.name || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
      });
      message.success('Resume parsed successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      message.error('An error occurred while uploading your resume');
    } finally {
      setUploading(false);
    }
  };

  const onFinish = (values) => {
    const candidateData = {
      ...values,
      resumeText: extracted?.text || '',
      skills: extracted?.skills || [],
      experience: extracted?.experience || '',
      education: extracted?.education || '',
      appliedAt: new Date().toISOString(),
      status: 'in_progress',
    };
    
    onParsed(candidateData);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    const ext = fileName.split('.').pop().toLowerCase();
    return ext === 'pdf' ? 
      <FilePdfOutlined style={{ color: '#ff4d4f', fontSize: '24px' }} /> : 
      <FileWordOutlined style={{ color: '#1890ff', fontSize: '24px' }} />;
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card 
        title="Upload Your Resume" 
        variant="borderless"
        styles={{
          header: { borderBottom: 'none', padding: '0 24px', marginTop: '16px' },
          body: { padding: '24px' },
        }}
      >
        {!extracted ? (
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? '#1890ff' : '#d9d9d9'}`,
              borderRadius: '8px',
              padding: '40px 20px',
              textAlign: 'center',
              backgroundColor: isDragging ? '#f0f9ff' : '#fafafa',
              transition: 'all 0.3s',
              cursor: 'pointer'
            }}
          >
            <Upload
              name="resume"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              showUploadList={false}
              beforeUpload={handleFileChange}
              maxCount={1}
              disabled={uploading}
            >
              <div>
                <InboxOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {isDragging ? 'Drop your resume here' : 'Drag & drop your resume here'}
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  or click to browse files (PDF, DOC, DOCX)
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Max file size: 5MB
                </Text>
                {fileError && (
                  <Alert 
                    message={fileError} 
                    type="error" 
                    showIcon 
                    style={{ marginTop: '16px', textAlign: 'left' }}
                  />
                )}
              </div>
            </Upload>
          </div>
        ) : (
          <div style={{ marginBottom: '24px' }}>
            <Alert
              message="Resume Successfully Uploaded"
              description={
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    {getFileIcon(file.name)}
                    <Text strong style={{ marginLeft: '8px' }}>{file.name}</Text>
                  </div>
                  <Progress 
                    percent={100} 
                    status="success" 
                    showInfo={false} 
                    style={{ width: '100%' }}
                  />
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: '24px' }}
            />
            
            <div style={{ marginTop: '24px' }}>
              <Title level={5} style={{ marginBottom: '16px' }}>Extracted Information</Title>
              <Card size="small">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Text strong>Name:</Text>
                    <div>{extracted.name || 'Not found'}</div>
                  </Col>
                  <Col xs={24} md={8}>
                    <Text strong>Email:</Text>
                    <div>{extracted.email || 'Not found'}</div>
                  </Col>
                  <Col xs={24} md={8}>
                    <Text strong>Phone:</Text>
                    <div>{extracted.phone || 'Not found'}</div>
                  </Col>
                  <Col xs={24}>
                    <Text strong>Skills:</Text>
                    <div>
                      {extracted.skills?.length > 0 ? 
                        extracted.skills.join(', ') : 'No skills detected'}
                    </div>
                  </Col>
                </Row>
              </Card>
            </div>
          </div>
        )}

        {file && !extracted && (
          <div style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              {getFileIcon(file.name)}
              <Text style={{ marginLeft: '8px', flex: 1 }}>{file.name}</Text>
              <Text type="secondary">{(file.size / 1024 / 1024).toFixed(2)} MB</Text>
            </div>
            <Progress 
              percent={uploadProgress} 
              status={uploading ? 'active' : 'normal'} 
              showInfo={false}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <Button 
                type="primary" 
                onClick={uploadResume}
                loading={uploading}
                icon={uploading ? <LoadingOutlined /> : <UploadOutlined />}
                disabled={!!fileError}
              >
                {uploading ? 'Uploading...' : 'Parse Resume'}
              </Button>
            </div>
          </div>
        )}

        {extracted && (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            style={{ marginTop: '24px' }}
            initialValues={{
              name: extracted.name || '',
              email: extracted.email || '',
              phone: extracted.phone || ''
            }}
          >
            <Title level={5} style={{ marginBottom: '16px' }}>Verify Your Information</Title>
            <Row gutter={16}>
              <Col xs={24} md={8}>
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Please input your name!' }]}
                >
                  <Input placeholder="John Doe" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' },
                  ]}
                >
                  <Input placeholder="john@example.com" size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please input your phone number!' },
                    {
                      pattern: /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/,
                      message: 'Please enter a valid phone number!',
                    },
                  ]}
                >
                  <Input placeholder="+1234567890" size="large" />
                </Form.Item>
              </Col>
            </Row>
            
            <div style={{ marginTop: '24px', textAlign: 'right' }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large"
                icon={<CheckCircleOutlined />}
              >
                Start Interview
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}