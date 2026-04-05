import GeneratorLayout from '../components/GeneratorLayout';
import { FileQuestion } from 'lucide-react';

export default function MCQSolver() {
  return (
    <GeneratorLayout
      title="MCQ Question Solver"
      description="Stuck on a medical question? Upload an image of the MCQ and get a step-by-step solution."
      type="MCQ Solver"
      placeholder="e.g. Can you explain why option B is incorrect?"
      icon={FileQuestion}
      inputLabel="Additional Context (Optional)"
      allowImageUpload={true}
    />
  );
}
