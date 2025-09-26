import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Input, Button, Progress } from "antd";
import { updateAnswer, finishInterview } from "../store/candidateSlice";

const QUESTIONS = [
  { text: "Explain closures in JavaScript.", difficulty: "easy", time: 20 },
  { text: "Explain virtual DOM in React.", difficulty: "easy", time: 20 },
  { text: "What are middleware functions in Node.js?", difficulty: "medium", time: 60 },
  { text: "Explain how you’d optimize a React app.", difficulty: "medium", time: 60 },
  { text: "Design a scalable authentication system.", difficulty: "hard", time: 120 },
  { text: "How does event loop work in Node.js?", difficulty: "hard", time: 120 }
];

export default function ChatBox({ candidate }) {
  const dispatch = useDispatch();
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].time);

  const currentQ = QUESTIONS[qIndex];

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleSubmit = () => {
    dispatch(updateAnswer({ qIndex, answer }));
    setAnswer("");
    if (qIndex < QUESTIONS.length - 1) {
      setQIndex(qIndex + 1);
      setTimeLeft(QUESTIONS[qIndex + 1].time);
    } else {
      
      const score = candidate.answers.reduce((s, ans) => s + (ans?.length > 10 ? 10 : 5), 0);
      dispatch(finishInterview({ score, summary: "Completed interview." }));
    }
  };

  return (
    <div>
      <h3>Question {qIndex + 1} / {QUESTIONS.length}</h3>
      <p><b>{currentQ.text}</b></p>
      <Progress percent={(timeLeft / currentQ.time) * 100} showInfo={false}/>
      <Input.TextArea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
      />
      <Button onClick={handleSubmit} type="primary" style={{ marginTop: 8 }}>Submit</Button>
    </div>
  );
}