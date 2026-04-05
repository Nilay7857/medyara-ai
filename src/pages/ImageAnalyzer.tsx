import GeneratorLayout from '../components/GeneratorLayout';
import { ScanFace } from 'lucide-react';

export default function ImageAnalyzer() {
  return (
    <GeneratorLayout
      title="Medical Image Analyzer"
      description="Upload an image of a body part, rash, wound, or X-ray for AI visual analysis."
      type="Image Analysis"
      placeholder="e.g. What happened to my hand? I fell yesterday..."
      icon={ScanFace}
      inputLabel="Additional Context (Optional)"
      allowImageUpload={true}
      disclaimer="Image analysis is experimental and prone to errors. It cannot replace a physical examination. Never rely on this for a final diagnosis."
    />
  );
}
