import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Table, Modal, Card, Typography, Tag, Space, Button, Input, Empty } from "antd";
import { SearchOutlined, StarFilled, StarOutlined, UserOutlined, MailOutlined, PhoneOutlined } from "@ant-design/icons";
import { formatDistanceToNow } from 'date-fns';

const { Title, Text } = Typography;
const { Search } = Input;

const getScoreColor = (score) => {
  if (score >= 80) return '#52c41a';
  if (score >= 50) return '#faad14';
  return '#ff4d4f';
};

const ScoreTag = ({ score }) => (
  <Tag 
    color={getScoreColor(score)}
    style={{ 
      fontWeight: 'bold',
      fontSize: '14px',
      padding: '2px 8px',
      borderRadius: '10px',
      minWidth: '50px',
      textAlign: 'center'
    }}
  >
    {score || 'N/A'}
  </Tag>
);

export default function Interviewer() {
  const candidates = useSelector((state) => state.candidates.list);
  const [selected, setSelected] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [showOnlyStarred, setShowOnlyStarred] = useState(false);
  const [starredCandidates, setStarredCandidates] = useState(() => {
    const saved = localStorage.getItem('starredCandidates');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const filtered = candidates.filter(candidate => {
      const matchesSearch = 
        candidate.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchText.toLowerCase());
      
      if (showOnlyStarred) {
        return matchesSearch && starredCandidates.includes(candidate.id);
      }
      return matchesSearch;
    });
    setFilteredCandidates(filtered);
  }, [candidates, searchText, showOnlyStarred, starredCandidates]);

  const toggleStarred = (id, e) => {
    e.stopPropagation();
    const newStarred = starredCandidates.includes(id)
      ? starredCandidates.filter(candidateId => candidateId !== id)
      : [...starredCandidates, id];
    
    setStarredCandidates(newStarred);
    localStorage.setItem('starredCandidates', JSON.stringify(newStarred));
  };

  const columns = [
    {
      title: 'Candidate',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Button 
            type="text" 
            icon={starredCandidates.includes(record.id) ? 
              <StarFilled style={{ color: '#faad14' }} /> : 
              <StarOutlined />
            }
            onClick={(e) => toggleStarred(record.id, e)}
          />
          <div>
            <div style={{ fontWeight: 500 }}>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      sorter: (a, b) => (a.score || 0) - (b.score || 0),
      render: (score) => <ScoreTag score={score} />,
      align: 'center',
      width: 120,
    },
    {
      title: 'Status',
      dataIndex: 'finished',
      key: 'status',
      render: (finished) => (
        <Tag color={finished ? 'success' : 'processing'}>
          {finished ? 'Completed' : 'In Progress'}
        </Tag>
      ),
      align: 'center',
      width: 120,
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : 'N/A',
      sorter: (a, b) => new Date(a.updatedAt || 0) - new Date(b.updatedAt || 0),
      width: 180,
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Candidate Dashboard</Title>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Search
            placeholder="Search candidates..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
            prefix={<SearchOutlined />}
          />
          <Button 
            type={showOnlyStarred ? 'primary' : 'default'}
            icon={<StarFilled style={{ color: showOnlyStarred ? '#fff' : '#faad14' }} />}
            onClick={() => setShowOnlyStarred(!showOnlyStarred)}
          >
            {showOnlyStarred ? 'Show All' : 'Starred'}
          </Button>
        </div>
      </div>

      <Card>
        <Table
          dataSource={filteredCandidates}
          columns={columns}
          rowKey="id"
          onRow={(record) => ({
            onClick: () => setSelected(record),
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>No candidates found</span>
                }
              />
            )
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: false,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} candidates`,
          }}
        />
      </Card>

      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={[
          <Button key="close" onClick={() => setSelected(null)}>
            Close
          </Button>
        ]}
        width={800}
        title={
          <div>
            <div style={{ fontSize: '20px', fontWeight: 600 }}>{selected?.name}</div>
            <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
              {selected?.email} • {selected?.phone}
            </div>
          </div>
        }
      >
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '32px', marginBottom: '16px' }}>
            <div>
              <Text type="secondary">Score</Text>
              <div style={{ marginTop: '4px' }}>
                <ScoreTag score={selected?.score} />
              </div>
            </div>
            <div>
              <Text type="secondary">Status</Text>
              <div style={{ marginTop: '4px' }}>
                <Tag color={selected?.finished ? 'success' : 'processing'}>
                  {selected?.finished ? 'Interview Completed' : 'Interview In Progress'}
                </Tag>
              </div>
            </div>
          </div>
          
          {selected?.summary && (
            <div style={{ marginTop: '16px' }}>
              <Text strong>AI Summary:</Text>
              <div style={{ 
                backgroundColor: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '4px',
                marginTop: '8px'
              }}>
                {selected.summary}
              </div>
            </div>
          )}
        </div>

        <div>
          <Title level={5} style={{ marginBottom: '16px' }}>Interview Responses</Title>
          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
            {(selected?.answers || []).map((ans, idx) => (
              <Card 
                key={idx} 
                size="small" 
                style={{ marginBottom: '16px', backgroundColor: idx % 2 === 0 ? '#fafafa' : '#fff' }}
                styles={{ body: { padding: '12px 16px' } }}
              >
                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ 
                    width: '28px', 
                    height: '28px', 
                    borderRadius: '50%', 
                    backgroundColor: '#1890ff', 
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    Q{idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: '8px' }}>
                      {selected.questions?.[idx]?.question || `Question ${idx + 1}`}
                    </div>
                    <div style={{ 
                      backgroundColor: '#f5f5f5', 
                      padding: '8px 12px', 
                      borderRadius: '4px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {ans || <Text type="secondary">No answer provided</Text>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {(selected?.answers?.length === 0 || !selected?.answers) && (
              <div style={{ textAlign: 'center', padding: '24px' }}>
                <Text type="secondary">No interview responses yet</Text>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}