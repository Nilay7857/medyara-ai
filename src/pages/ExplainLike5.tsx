import GeneratorLayout from '../components/GeneratorLayout';
import { Baby } from 'lucide-react';

export default function ExplainLike5() {
  return (
    <GeneratorLayout
      title="Explain Like I'm 5"
      description="Break down complex medical jargon and diagnoses into super simple, friendly language."
      type="Explain Like I'm 5"
      placeholder="e.g. What is a Myocardial Infarction? Why do we get fevers? Explain Asthma..."
      icon={Baby}
      inputLabel="Enter a medical term or question"
    />
  );
}
