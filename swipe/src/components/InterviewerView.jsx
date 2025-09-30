// components/InterviewerView.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Descriptions,
  Collapse,
  Progress,
  Statistic,
  Row,
  Col,
  Avatar,
  Badge
} from 'antd';
import {
  SearchOutlined,
  SortAscendingOutlined,
  EyeOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  TrophyOutlined,
  FilterOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { CANDIDATE_STATUS } from '../types';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const InterviewerView = () => {
  const dispatch = useDispatch();
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const {
    candidates,
    searchTerm,
    sortBy,
    sortOrder
  } = useSelector(state => state.candidate);

  const filteredCandidates = candidates
    .filter(candidate => {
      const matchesSearch = searchTerm === '' ||
        candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.phone?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'name') {
        aValue = aValue?.toLowerCase() || '';
        bValue = bValue?.toLowerCase() || '';
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleViewDetails = (candidate) => {
    setSelectedCandidate(candidate);
    setDetailModalVisible(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case CANDIDATE_STATUS.COMPLETED: return 'green';
      case CANDIDATE_STATUS.INTERVIEWING: return 'blue';
      case CANDIDATE_STATUS.PENDING: return 'orange';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 48) return '#52c41a'; // 80% of 60 = 48 (excellent)
    if (score >= 36) return '#faad14'; // 60% of 60 = 36 (good)
    return '#ff4d4f'; // needs improvement
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'UN';
  };

  // Debug: Log candidates data with more details
  console.log('Dashboard candidates:', candidates);
  console.log('Dashboard filtered candidates:', filteredCandidates);
  console.log('Redux state candidate keys:', Object.keys(candidates));
  console.log('Redux state structure:', candidates);
  console.log('Redux state length:', candidates.length);
  console.log('Redux state type:', typeof candidates);
  console.log('Redux state isArray:', Array.isArray(candidates));

  // Check localStorage directly
  const localStorageData = localStorage.getItem('redux-persist:root');
  if (localStorageData) {
    try {
      const parsed = JSON.parse(localStorageData);
      console.log('localStorage candidate data:', parsed.candidate);
    } catch (e) {
      console.log('localStorage parse error:', e);
    }
  } else {
    console.log('No localStorage data found');
  }

  const completedCandidates = candidates.filter(c => c.status === CANDIDATE_STATUS.COMPLETED).length;
  const totalCandidates = candidates.length;
  const averageScore = candidates
    .filter(c => c.interviewData?.totalScore)
    .reduce((sum, c) => sum + c.interviewData.totalScore, 0) /
    Math.max(candidates.filter(c => c.interviewData?.totalScore).length, 1);

  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      render: (name, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            style={{
              backgroundColor: record.status === CANDIDATE_STATUS.COMPLETED ? '#52c41a' :
                              record.status === CANDIDATE_STATUS.INTERVIEWING ? '#1890ff' : '#faad14',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
            icon={<UserOutlined />}
          >
            {getInitials(name)}
          </Avatar>
          <div>
            <div style={{ fontWeight: '600', color: '#262626' }}>{name || 'N/A'}</div>
            <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <MailOutlined style={{ color: '#8c8c8c' }} />
            <Text style={{ fontSize: '13px' }}>{record.email || 'N/A'}</Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PhoneOutlined style={{ color: '#8c8c8c' }} />
            <Text style={{ fontSize: '13px' }}>{record.phone || 'N/A'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge
          status={status === CANDIDATE_STATUS.COMPLETED ? 'success' :
                  status === CANDIDATE_STATUS.INTERVIEWING ? 'processing' : 'default'}
          text={
            <Tag color={getStatusColor(status)} style={{
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '11px'
            }}>
              {status?.toUpperCase() || 'PENDING'}
            </Tag>
          }
        />
      ),
    },
    {
      title: 'Score',
      dataIndex: ['interviewData', 'totalScore'],
      key: 'score',
      sorter: true,
      render: (score) => score ? (
        <div style={{
          textAlign: 'center',
          padding: '8px',
          backgroundColor: score >= 48 ? '#f6ffed' :
                          score >= 36 ? '#fff7e6' : '#fff1f0',
          borderRadius: '8px',
          border: `2px solid ${score >= 48 ? '#b7eb8f' :
                              score >= 36 ? '#ffd591' : '#ffccc7'}`
        }}>
          <Text style={{
            color: getScoreColor(score),
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {score}/60
          </Text>
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '8px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '2px solid #d9d9d9'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>Not completed</Text>
        </div>
      ),
    },
    {
      title: 'Applied',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', color: '#262626', fontWeight: '500' }}>
            {date ? new Date(date).toLocaleDateString() : 'N/A'}
          </div>
          <div style={{ fontSize: '11px', color: '#8c8c8c' }}>
            {date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, candidate) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetails(candidate)}
          style={{
            borderRadius: '6px',
            backgroundColor: '#1890ff',
            borderColor: '#1890ff'
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1890ff',
          color: 'white',
          padding: '24px 32px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <TrophyOutlined style={{ fontSize: '28px' }} />
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '600'
            }}>
              Interviewer Dashboard
            </h1>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '14px',
              opacity: 0.9
            }}>
              Manage and review candidate interviews
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card style={{
              textAlign: 'center',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <Statistic
                title="Total Candidates"
                value={totalCandidates}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#1890ff', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{
              textAlign: 'center',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <Statistic
                title="Completed Interviews"
                value={completedCandidates}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#52c41a', fontSize: '24px' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{
              textAlign: 'center',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
            }}>
              <Statistic
                title="Average Score"
                value={averageScore.toFixed(1)}
                suffix="/60"
                prefix={<TrophyOutlined />}
                valueStyle={{
                  color: getScoreColor(averageScore),
                  fontSize: '24px'
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Main Content Card */}
        <Card style={{
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          {/* Search and Filter Controls */}
          <div style={{
            marginBottom: '24px',
            padding: '20px',
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px solid #e8e8e8'
          }}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={12} lg={8}>
                <Search
                  placeholder="Search candidates by name or email"
                  allowClear
                  enterButton={<SearchOutlined />}
                  size="large"
                  value={searchTerm}
                  onChange={(e) => dispatch(setSearchTerm(e.target.value))}
                  style={{ borderRadius: '8px' }}
                />
              </Col>
              <Col xs={24} sm={12} lg={8}>
                <Select
                  size="large"
                  style={{ width: '100%', borderRadius: '8px' }}
                  placeholder="Sort by"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(value) => {
                    const [field, order] = value.split('-');
                    dispatch(setSortOptions({ sortBy: field, sortOrder: order }));
                  }}
                  suffixIcon={<SortAscendingOutlined />}
                >
                  <Option value="name-asc">Name (A-Z)</Option>
                  <Option value="name-desc">Name (Z-A)</Option>
                  <Option value="score-desc">Score (High-Low)</Option>
                  <Option value="score-asc">Score (Low-High)</Option>
                  <Option value="createdAt-desc">Newest First</Option>
                  <Option value="createdAt-asc">Oldest First</Option>
                </Select>
              </Col>
              <Col xs={24} lg={8}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  justifyContent: 'flex-end'
                }}>
                  <Text style={{
                    fontSize: '14px',
                    color: '#595959',
                    backgroundColor: '#f0f2f5',
                    padding: '8px 16px',
                    borderRadius: '20px'
                  }}>
                    Showing {filteredCandidates.length} candidates
                  </Text>
                  <Button
                    icon={<DownloadOutlined />}
                    size="large"
                    style={{
                      borderRadius: '8px',
                      backgroundColor: '#52c41a',
                      borderColor: '#52c41a'
                    }}
                  >
                    Export Data
                  </Button>
                </div>
              </Col>
            </Row>
          </div>

          {/* Candidates Table */}
          {filteredCandidates.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredCandidates}
              rowKey="id"
              pagination={{
                total: filteredCandidates.length,
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} candidates`,
                style: { marginTop: '16px' }
              }}
              scroll={{ x: 800 }}
              style={{ borderRadius: '8px' }}
              rowClassName={(record) => {
                if (record.status === CANDIDATE_STATUS.COMPLETED) return 'completed-row';
                if (record.status === CANDIDATE_STATUS.INTERVIEWING) return 'interviewing-row';
                return 'pending-row';
              }}
            />
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              backgroundColor: '#fafafa',
              borderRadius: '8px',
              border: '1px solid #e8e8e8'
            }}>
              <UserOutlined style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }} />
              <h3 style={{ color: '#666', marginBottom: '8px' }}>
                {searchTerm ? 'No candidates found' : 'No candidates yet'}
              </h3>
              <p style={{ color: '#999' }}>
                {searchTerm
                  ? 'Try adjusting your search terms or clear the search to see all candidates.'
                  : 'Complete some interviews to see candidate data here.'
                }
              </p>
              {searchTerm && (
                <Button
                  onClick={() => dispatch(setSearchTerm(''))}
                  style={{ marginTop: '16px' }}
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}

          {/* Candidate Detail Modal */}
          <Modal
            title={
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 0',
                borderBottom: '1px solid #e8e8e8',
                marginBottom: '0'
              }}>
                <Avatar
                  size="large"
                  style={{
                    backgroundColor: selectedCandidate?.status === CANDIDATE_STATUS.COMPLETED ? '#52c41a' :
                                    selectedCandidate?.status === CANDIDATE_STATUS.INTERVIEWING ? '#1890ff' : '#faad14',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                  icon={<UserOutlined />}
                >
                  {selectedCandidate ? getInitials(selectedCandidate.name) : 'UN'}
                </Avatar>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: '600', color: '#262626' }}>
                    {selectedCandidate?.name || 'Candidate Details'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#595959' }}>
                    {selectedCandidate?.email}
                  </div>
                </div>
              </div>
            }
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            width={900}
            footer={[
              <Button
                key="close"
                onClick={() => setDetailModalVisible(false)}
                size="large"
                style={{ borderRadius: '6px' }}
              >
                Close
              </Button>,
            ]}
            style={{ borderRadius: '12px' }}
          >
            {selectedCandidate && (
              <div>
                {/* Candidate Overview */}
                <Card style={{
                  marginBottom: '24px',
                  borderRadius: '8px',
                  border: '1px solid #e8e8e8'
                }}>
                  <Row gutter={16}>
                    <Col span={8}>
                      <Statistic
                        title="Interview Status"
                        value={selectedCandidate.status?.toUpperCase() || 'PENDING'}
                        valueStyle={{
                          color: getStatusColor(selectedCandidate.status) === 'green' ? '#52c41a' :
                                 getStatusColor(selectedCandidate.status) === 'blue' ? '#1890ff' : '#faad14'
                        }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Final Score"
                        value={selectedCandidate.interviewData?.totalScore || 0}
                        suffix="/60"
                        valueStyle={{
                          color: selectedCandidate.interviewData?.totalScore ?
                                 getScoreColor(selectedCandidate.interviewData.totalScore) : '#8c8c8c'
                        }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Questions Answered"
                        value={selectedCandidate.interviewData?.questions?.length || 0}
                        suffix={`/6`}
                      />
                    </Col>
                  </Row>
                </Card>

                {/* Candidate Info */}
                <Card
                  title={
                    <span style={{ fontSize: '16px', fontWeight: '600' }}>
                      Candidate Information
                    </span>
                  }
                  style={{ marginBottom: '24px' }}
                >
                  <Descriptions
                    bordered
                    column={2}
                    size="small"
                    labelStyle={{ fontWeight: '600', width: '120px' }}
                  >
                    <Descriptions.Item label="Full Name">
                      {selectedCandidate.name || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Email Address">
                      {selectedCandidate.email || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Phone Number">
                      {selectedCandidate.phone || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Application Date">
                      {selectedCandidate.createdAt ?
                        new Date(selectedCandidate.createdAt).toLocaleString() :
                        'N/A'
                      }
                    </Descriptions.Item>
                    <Descriptions.Item label="Interview Status">
                      <Tag color={getStatusColor(selectedCandidate.status)} style={{
                        borderRadius: '12px',
                        padding: '2px 8px'
                      }}>
                        {selectedCandidate.status?.toUpperCase() || 'PENDING'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Resume">
                      {selectedCandidate.resume ? 'Uploaded' : 'Not provided'}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                {/* Interview Summary */}
                {selectedCandidate.interviewData?.summary && (
                  <Card
                    title={
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>
                        🤖 AI Interview Summary
                      </span>
                    }
                    style={{ marginBottom: '24px' }}
                  >
                    <Text style={{
                      fontSize: '15px',
                      lineHeight: '1.6',
                      color: '#262626'
                    }}>
                      {selectedCandidate.interviewData.summary}
                    </Text>
                  </Card>
                )}

                {/* Question & Answer Details */}
                {selectedCandidate.interviewData?.questions?.length > 0 && (
                  <Card
                    title={
                      <span style={{ fontSize: '16px', fontWeight: '600' }}>
                        📋 Interview Details
                      </span>
                    }
                  >
                    <Collapse
                      accordion
                      style={{ borderRadius: '8px' }}
                    >
                      {selectedCandidate.interviewData.questions.map((question, index) => {
                        const answer = selectedCandidate.interviewData.answers?.[index];
                        return (
                          <Panel
                            header={
                              <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                width: '100%'
                              }}>
                                <div style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px'
                                }}>
                                  <span style={{
                                    fontSize: '14px',
                                    fontWeight: '600',
                                    color: '#262626'
                                  }}>
                                    Question {index + 1}
                                  </span>
                                  <Tag
                                    color={getStatusColor(question.difficulty)}
                                    style={{
                                      borderRadius: '12px',
                                      padding: '2px 8px',
                                      fontSize: '11px'
                                    }}
                                  >
                                    {question.difficulty?.toUpperCase()}
                                  </Tag>
                                  {question.generatedBy && (
                                    <Tag
                                      size="small"
                                      color={question.generatedBy === 'huggingface' ? 'blue' : 'orange'}
                                      style={{ borderRadius: '12px', fontSize: '10px' }}
                                    >
                                      {question.generatedBy === 'huggingface' ? '🤖 AI' : '📋 Template'}
                                    </Tag>
                                  )}
                                </div>
                                {answer?.score && (
                                  <div style={{
                                    padding: '4px 12px',
                                    backgroundColor: answer.score >= 8 ? '#f6ffed' :
                                                    answer.score >= 6 ? '#fff7e6' : '#fff1f0',
                                    borderRadius: '20px',
                                    border: `2px solid ${answer.score >= 8 ? '#b7eb8f' :
                                                        answer.score >= 6 ? '#ffd591' : '#ffccc7'}`
                                  }}>
                                    <Text style={{
                                      color: getScoreColor(answer.score * 10),
                                      fontWeight: 'bold',
                                      fontSize: '13px'
                                    }}>
                                      Score: {answer.score}/10
                                    </Text>
                                  </div>
                                )}
                              </div>
                            }
                            key={question.id}
                          >
                            <div style={{
                              padding: '20px',
                              backgroundColor: '#fafafa',
                              borderRadius: '8px',
                              marginBottom: '16px'
                            }}>
                              <h4 style={{
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#262626',
                                marginBottom: '12px'
                              }}>
                                Question:
                              </h4>
                              <Text style={{
                                fontSize: '15px',
                                lineHeight: '1.6',
                                color: '#262626',
                                display: 'block',
                                marginBottom: '20px'
                              }}>
                                {question.question}
                              </Text>

                              {answer ? (
                                <div>
                                  <h4 style={{
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    color: '#262626',
                                    marginBottom: '12px'
                                  }}>
                                    Answer:
                                  </h4>
                                  <div style={{
                                    padding: '16px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #e8e8e8',
                                    marginBottom: '16px'
                                  }}>
                                    <Text style={{
                                      fontSize: '15px',
                                      lineHeight: '1.6',
                                      color: '#595959'
                                    }}>
                                      {answer.answer}
                                    </Text>
                                  </div>

                                  <Row gutter={16}>
                                    <Col span={8}>
                                      <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f0f2f5',
                                        borderRadius: '6px',
                                        textAlign: 'center'
                                      }}>
                                        <div style={{
                                          fontSize: '18px',
                                          fontWeight: 'bold',
                                          color: getScoreColor(answer.score * 10)
                                        }}>
                                          {answer.score}/10
                                        </div>
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#595959'
                                        }}>
                                          Score
                                        </div>
                                      </div>
                                    </Col>
                                    <Col span={8}>
                                      <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f0f2f5',
                                        borderRadius: '6px',
                                        textAlign: 'center'
                                      }}>
                                        <div style={{
                                          fontSize: '16px',
                                          fontWeight: '600',
                                          color: '#262626'
                                        }}>
                                          {answer.timeSpent ?
                                            `${Math.floor(answer.timeSpent / 60)}:${(answer.timeSpent % 60).toString().padStart(2, '0')}` :
                                            'N/A'
                                          }
                                        </div>
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#595959'
                                        }}>
                                          Time Spent
                                        </div>
                                      </div>
                                    </Col>
                                    <Col span={8}>
                                      <div style={{
                                        padding: '12px',
                                        backgroundColor: '#f0f2f5',
                                        borderRadius: '6px',
                                        textAlign: 'center'
                                      }}>
                                        <Tag
                                          color={answer.generatedBy === 'huggingface' ? 'blue' : 'orange'}
                                          style={{
                                            borderRadius: '12px',
                                            fontSize: '11px'
                                          }}
                                        >
                                          {answer.generatedBy === 'huggingface' ? '🤖 AI' : '📋 Template'}
                                        </Tag>
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#595959'
                                        }}>
                                          Evaluation
                                        </div>
                                      </div>
                                    </Col>
                                  </Row>

                                  {answer.feedback && (
                                    <div style={{
                                      marginTop: '16px',
                                      padding: '16px',
                                      backgroundColor: '#fff7e6',
                                      borderRadius: '8px',
                                      borderLeft: '4px solid #faad14'
                                    }}>
                                      <h5 style={{
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        color: '#262626',
                                        marginBottom: '8px'
                                      }}>
                                        💡 AI Feedback:
                                      </h5>
                                      <Text style={{
                                        fontSize: '14px',
                                        color: '#595959',
                                        lineHeight: '1.5'
                                      }}>
                                        {answer.feedback}
                                      </Text>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div style={{
                                  padding: '16px',
                                  backgroundColor: '#fff1f0',
                                  borderRadius: '8px',
                                  border: '1px solid #ffccc7',
                                  textAlign: 'center'
                                }}>
                                  <Text style={{
                                    color: '#ff4d4f',
                                    fontSize: '14px'
                                  }}>
                                    No answer provided for this question
                                  </Text>
                                </div>
                              )}
                            </div>
                          </Panel>
                        );
                      })}
                    </Collapse>
                  </Card>
                )}
              </div>
            )}
          </Modal>
        </Card>
      </div>
    </div>
  );
};

export default InterviewerView;
