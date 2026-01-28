import React, { useState } from 'react';
import { FaDatabase, FaCog, FaSearch, FaSortAmountDown, FaFilter, FaChartBar } from 'react-icons/fa';
const nodes = [
    {
        key: 'data-reader',
        label: 'Example Data Reader',
        icon: <FaDatabase className="text-yellow-600 w-6 h-6"/>,
        desc: 'Load raw/un-cleaned WorldBank population data.'
    },
    {
        key: 'preprocess',
        label: 'Preprocess data',
        icon: <FaCog className="text-gray-500 w-6 h-6"/>,
        desc: 'This metanode contains more nodes. It keeps your workflow tidy until you need to refactor what is inside.'
    },
    {
        key: 'value-lookup',
        label: 'Value Lookup',
        icon: <FaSearch className="text-yellow-600 w-6 h-6"/>,
        desc: 'Match up country and region data from above with the population data using the 3-letter country code.'
    },
    {
        key: 'sorter',
        label: 'Sorter',
        icon: <FaSortAmountDown className="text-yellow-600 w-6 h-6"/>,
        desc: 'Sort countries by population.'
    },
    {
        key: 'row-filter',
        label: 'Row Filter',
        icon: <FaFilter className="text-yellow-600 w-6 h-6"/>,
        desc: 'Keep only countries from South Asia.'
    },
    {
        key: 'bar-chart',
        label: 'Bar Chart',
        icon: <FaChartBar className="text-blue-600 w-6 h-6"/>,
        desc: 'Show the populations of countries in South Asia.'
    }
];
const resources = [
    { label: 'Download KNIME Analytics Platform', url: '#' },
    { label: 'Watch "What is KNIME Analytics Platform?" video', url: '#' },
    { label: 'Explore examples in Starter collection', url: '#' },
    { label: 'Take self-paced, basic course', url: '#' },
    { label: 'Read KNIME Analytics Platform user guide', url: '#' },
];
export default function KnimeOutput() {
    const [selected, setSelected] = useState(null);
    const selectedNode = nodes.find(n => n.key === selected);
    return (<div className="flex min-h-[80vh] bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r p-6 flex flex-col justify-between">
        <div>
          <div className="text-xs text-gray-500 mb-2">Last update: Jan 23, 2025</div>
          <div className="mb-4 text-gray-700 text-sm">
            This is an example workflow in the KNIME playground.<br />
            <b>Start exploring or follow the two examples:</b>
            <ol className="list-decimal ml-5 mt-2">
              <li>Load, filter, and visualize data to find out which currencies are shared across countries.</li>
              <li>Blend data sources to identify the most populated countries in the South Asia.</li>
            </ol>
          </div>
          <div className="font-semibold text-gray-700 mb-2">External resources</div>
          <ul className="text-blue-700 text-sm space-y-1 mb-4">
            {resources.map(r => (<li key={r.label}><a href={r.url} className="hover:underline">{r.label}</a></li>))}
          </ul>
          <div className="font-semibold text-gray-700 mb-2">Tags</div>
          <div className="text-xs text-gray-400 italic mb-2">No tags have been set yet</div>
        </div>
        <div className="text-xs text-gray-400">This is a demo version of KNIME Analytics Platform. Download the product for free to start building your own workflows.</div>
      </aside>

      {/* Main Workflow Area */}
      <main className="flex-1 flex flex-col items-center justify-start p-8">
        <div className="w-full max-w-4xl">
          <div className="text-lg font-semibold text-gray-700 mb-2">2. Example: Which countries in South Asia are the most populated?</div>
          <div className="flex items-center overflow-x-auto pb-8 pt-4">
            {nodes.map((node, idx) => (<React.Fragment key={node.key}>
                <div className={`flex flex-col items-center cursor-pointer group ${selected === node.key ? 'ring-2 ring-blue-400' : ''}`} onClick={() => setSelected(node.key)}>
                  <div className={`bg-white border shadow rounded-lg flex flex-col items-center px-4 py-3 min-w-[140px] max-w-[160px] mb-2 transition-all group-hover:shadow-lg ${selected === node.key ? 'border-blue-400' : 'border-gray-200'}`}>
                    {node.icon}
                    <div className="font-medium text-gray-800 text-center text-sm mt-2">{node.label}</div>
                  </div>
                  <div className="text-xs text-gray-500 text-center max-w-[140px]">{node.desc}</div>
                </div>
                {idx < nodes.length - 1 && (<div className="mx-2 flex items-center">
                    <svg width="32" height="24" viewBox="0 0 32 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 12h28m0 0l-5-5m5 5l-5 5" stroke="#bbb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>)}
              </React.Fragment>))}
          </div>
        </div>
      </main>

      {/* Right Panel for Node Details */}
      <aside className="w-80 bg-gray-100 border-l p-6 flex flex-col">
        {selectedNode ? (<>
            <div className="flex items-center gap-2 mb-2">
              {selectedNode.icon}
              <span className="font-semibold text-gray-800 text-lg">{selectedNode.label}</span>
            </div>
            <div className="text-gray-700 mb-2">{selectedNode.desc}</div>
            <div className="text-xs text-gray-500">Select a configured or executed node to show the node output.</div>
          </>) : (<div className="text-gray-400 text-sm">Select a node to show its dialog.</div>)}
      </aside>
    </div>);
}
