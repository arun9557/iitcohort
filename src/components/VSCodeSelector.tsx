import AdvancedVSCode from './AdvancedVSCode';
import MonacoVSCode from './MonacoVSCode';

// Minimal outline icons
const FolderIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 6a2 2 0 0 1 2-2h4.465a2 2 0 0 1 1.414.586l1.535 1.535A2 2 0 0 0 14.828 7H19a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z" stroke="#bbb" strokeWidth="1.5"/></svg>
);
const SearchIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#bbb" strokeWidth="1.5"/><path d="M21 21l-4.35-4.35" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/></svg>
);
const BugIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="14" r="4" stroke="#bbb" strokeWidth="1.5"/><path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2m16 0h2m-1.34-7.07l-1.41 1.41M12 22v-2" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round"/></svg>
);
const ExtensionIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="#bbb" strokeWidth="1.5"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="#bbb" strokeWidth="1.5"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="#bbb" strokeWidth="1.5"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="#bbb" strokeWidth="1.5"/></svg>
);

export default function VSCodeSelector({ selectedOption }: { selectedOption: 'advanced' | 'monaco' }) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#23272e]">
      <div className="flex-1 min-h-0 min-w-0 bg-[#181a20] overflow-hidden">
        {selectedOption === 'advanced' ? <AdvancedVSCode /> : <MonacoVSCode />}
      </div>
    </div>
  );
} 