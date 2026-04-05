import GeneratorLayout from '../components/GeneratorLayout';
import { Link } from 'lucide-react';

export default function LinkAnalyzer() {
  return (
    <GeneratorLayout
      title="Link & Social Analyzer"
      description="Paste an article, YouTube, or social media link. AI will extract the content, summarize the medical claims, and detect potential misinformation."
      type="Link Analyzer"
      placeholder="e.g. Can you summarize the findings in this article?"
      icon={Link}
      inputLabel="What do you want to know? (Optional)"
      allowLinkInput={true}
      disclaimer="AI analysis of external content may not be 100% accurate. Always verify medical claims with peer-reviewed sources."
    />
  );
}
