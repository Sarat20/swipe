import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ResumeUpload from "../components/ResumeUpload";
import ChatBox from "../components/ChatBox";
import { addCandidate } from "../store/candidateSlice";

export default function Interviewee() {
  const dispatch = useDispatch();
  const candidate = useSelector((state) => state.active);
  const [started, setStarted] = useState(false);

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
      {!started ? (
        <ResumeUpload onParsed={handleResumeUpload} />
      ) : (
        <ChatBox candidate={candidate} />
      )}
    </div>
  );
}