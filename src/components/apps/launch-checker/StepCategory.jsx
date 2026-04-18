import React from 'react';
import { AlertCircle, BarChart3, FileText, Megaphone, MessageSquare, Rocket, Scale, Search, ShieldCheck, Smartphone, Target } from 'lucide-react';
import ChecklistItem from './ChecklistItem';

const ICONS = {
  Rocket,
  Megaphone,
  MessageSquare,
  BarChart3,
  ShieldCheck,
  FileText,
  Search,
  Smartphone,
  Scale,
  Target,
};

const StepCategory = ({ category, answers, onAnswer }) => {
  if (!category) {
    return (
      <div className="launch-step launch-step--empty">
        <AlertCircle size={18} />
        <p>Select a track first to start your checklist.</p>
      </div>
    );
  }

  const Icon = ICONS[category.icon] || BarChart3;
  const answeredCount = category.questions.filter((question) => Boolean(answers?.[question.id])).length;

  return (
    <div className="launch-step">
      <header className="launch-step__header">
        <p className="launch-step__eyebrow">
          <Icon size={15} />
          Let&apos;s check your {category.name}
        </p>
        <h2>{category.name}</h2>
        <p>{answeredCount}/{category.questions.length} answered</p>
      </header>

      <div className="launch-checklist">
        {category.questions.map((question, index) => (
          <ChecklistItem
            key={question.id}
            question={question}
            answer={answers?.[question.id]}
            onAnswer={onAnswer}
            delay={index * 0.06}
          />
        ))}
      </div>
    </div>
  );
};

export default StepCategory;
