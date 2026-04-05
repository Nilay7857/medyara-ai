import GeneratorLayout from '../components/GeneratorLayout';
import { FileSearch } from 'lucide-react';

export default function ReportExplainer() {
  return (
    <GeneratorLayout
      title="Report & PDF Analyzer"
      description="Upload an image or PDF of a lab report or prescription, or paste the text, to get a simplified explanation."
      type="Report Explainer"
      placeholder="e.g. Can you explain what the high WBC count means in this report?"
      icon={FileSearch}
      inputLabel="Paste Text or Provide Context (Optional)"
      allowImageUpload={true}
      allowPdfUpload={true}
      disclaimer="This is an AI explanation, not medical advice. Always consult your doctor for a proper interpretation of your results."
    />
  );
}
