import GeneratorLayout from '../components/GeneratorLayout';
import { BookOpen } from 'lucide-react';

export default function StudyMode() {
  return (
    <GeneratorLayout
      title="Study Mode"
      description="Learn about any medical condition, procedure, or topic in a structured clinical format."
      type="Study Mode"
      placeholder="e.g. Type 2 Diabetes Mellitus, Myocardial Infarction, or Pharmacokinetics of Aspirin..."
      icon={BookOpen}
      inputLabel="Enter Medical Topic"
      showLevel={true}
      levelOptions={["Beginner (Simple)", "Intermediate (Exam Oriented)", "Advanced (Clinical Depth)", "Last-Minute Revision"]}
      disclaimer="This is an AI-generated response for educational purposes only. It is NOT a medical diagnosis. Consult a qualified healthcare professional."
    />
  );
}
