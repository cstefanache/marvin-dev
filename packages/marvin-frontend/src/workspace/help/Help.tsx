import MarkDown from 'markdown-to-jsx';
import mdFile from '../../README.md';

export default function Help() {
  return (
    <div className="container">
      <MarkDown options={{ wrapper: 'article' }}>{mdFile}</MarkDown>
    </div>
  );
}
