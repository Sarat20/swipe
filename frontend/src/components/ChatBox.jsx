import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Input, Button, Progress } from "antd";
import { updateAnswer, finishInterview } from "../store/candidateSlice";

const QUESTIONS = [
  { text: "What are closures in JavaScript?", difficulty: "easy", time: 20 },
  { text: "Explain the virtual DOM in React.", difficulty: "easy", time: 20 },
  { text: "What are middleware functions in Node.js?", difficulty: "medium", time: 60 },
  { text: "How would you optimize a React app for performance?", difficulty: "medium", time: 60 },
  { text: "Design a scalable authentication system.", difficulty: "hard", time: 120 },
  { text: "Explain the Node.js event loop with an example.", difficulty: "hard", time: 120 }
];

export default function ChatBox({ candidate }) {
  const dispatch = useDispatch();
  const [qIndex, setQIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].time);

  const currentQ = QUESTIONS[qIndex];

  // countdown timer
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
      // evaluate candidate (simple scoring logic)
      const score = candidate.answers.reduce((s, ans) => {
        if (!ans) return s;
        return s + (ans.split(" ").length > 5 ? 10 : 5); // length-based scoring
      }, 0);
      const summary = score > 40 ? "Strong candidate with solid answers." : "Needs improvement.";
      dispatch(finishInterview({ score, summary }));
    }
  };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h3>Question {qIndex + 1} / {QUESTIONS.length}</h3>
      <p><b>{currentQ.text}</b></p>
      <Progress 
        percent={(timeLeft / currentQ.time) * 100} 
        strokeColor="green" 
        showInfo={false} 
      />
      <Input.TextArea
        rows={4}
        placeholder="Type your answer here..."
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />
      <Button 
        type="primary" 
        onClick={handleSubmit} 
        style={{ marginTop: 10 }}
      >
        Submit
      </Button>
    </div>
  );
}