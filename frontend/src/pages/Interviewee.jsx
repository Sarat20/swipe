import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ResumeUpload from "../components/ResumeUpload";
import ChatBox from "../components/ChatBox";
import { addCandidate } from "../store/candidateSlice";
import { Modal } from "antd";

export default function Interviewee() {
  const dispatch = useDispatch();
  const candidate = useSelector((state) => state.active);
  const [started, setStarted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    // If active candidate exists but not finished → show Welcome Back Modal
    if (candidate && !candidate.finished) {
      setShowWelcome(true);
    }
  }, []);

  const handleResumeUpload = (profile) => {
    dispatch(addCandidate({
      id: Date.now(),
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      answers: [],
      finished: false
    }));
    setStarted(true);
  };

  return (
    <div>
      {!started && !candidate ? (
        <ResumeUpload onParsed={handleResumeUpload} />
      ) : (
        <ChatBox candidate={candidate} />
      )}

      <Modal
        open={showWelcome}
        onCancel={() => setShowWelcome(false)}
        onOk={() => { setShowWelcome(false); setStarted(true); }}
        title="Welcome Back!"
      >
        <p>You had an unfinished interview. Would you like to resume from where you left off?</p>
      </Modal>
    </div>
  );
}