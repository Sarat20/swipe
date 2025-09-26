import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Table, Modal } from "antd";

export default function Interviewer() {
  const candidates = useSelector((state) => state.list);
  const [selected, setSelected] = useState(null);

  const columns = [
    { title: "Name", dataIndex: "name", sorter: (a, b) => a.name.localeCompare(b.name) },
    { title: "Email", dataIndex: "email" },
    { title: "Score", dataIndex: "score", sorter: (a, b) => (a.score || 0) - (b.score || 0) },
    { title: "Summary", dataIndex: "summary" },
  ];

  return (
    <>
      <Table
        dataSource={candidates}
        columns={columns}
        rowKey="id"
        onRow={(record) => ({
          onClick: () => setSelected(record),
        })}
      />

      <Modal
        open={!!selected}
        onCancel={() => setSelected(null)}
        footer={null}
        title={selected?.name}
      >
        <p><b>Email:</b> {selected?.email}</p>
        <p><b>Phone:</b> {selected?.phone}</p>
        <p><b>Score:</b> {selected?.score}</p>
        <p><b>Summary:</b> {selected?.summary}</p>
        <h4>Answers</h4>
        <ul>
          {(selected?.answers || []).map((ans, idx) => (
            <li key={idx}><b>Q{idx+1}:</b> {ans || "(No Answer)"}</li>
          ))}
        </ul>
      </Modal>
    </>
  );
}