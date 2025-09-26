import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Table } from "antd";
import { setActiveCandidate } from "../store/candidateSlice";

export default function Interviewer() {
  const candidates = useSelector((state) => state.list);
  const dispatch = useDispatch();

  const columns = [
    { title: "Name", dataIndex: "name" },
    { title: "Email", dataIndex: "email" },
    { title: "Score", dataIndex: "score" },
    { title: "Summary", dataIndex: "summary" },
  ];

  return (
    <Table
      dataSource={candidates}
      columns={columns}
      rowKey="id"
      onRow={(record) => ({
        onClick: () => dispatch(setActiveCandidate(record.id))
      })}
    />
  );
}