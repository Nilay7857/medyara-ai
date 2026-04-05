import GeneratorLayout from '../components/GeneratorLayout';
import { HelpCircle } from 'lucide-react';

export default function MCQGenerator() {
  return (
    <GeneratorLayout
      title="MCQ Generator"
      description="Test your medical knowledge. Generate customized multiple-choice questions on specific topics."
      type="MCQ Generator"
      placeholder="e.g. Cardiac Action Potential, Cranial Nerves, or Pediatric Asthma Guidelines..."
      icon={HelpCircle}
      inputLabel="Topic for MCQs"
    />
  );
}
