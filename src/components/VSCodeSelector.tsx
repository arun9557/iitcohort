import AdvancedVSCode from './AdvancedVSCode';
import MonacoVSCode from './MonacoVSCode';

export default function VSCodeSelector({ selectedOption }: { selectedOption: 'advanced' | 'monaco' }) {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-[#23272e]">
      <div className="flex-1 min-h-0 min-w-0 bg-[#181a20] overflow-hidden">
        {selectedOption === 'advanced' ? <AdvancedVSCode /> : <MonacoVSCode />}
      </div>
    </div>
  );
} 