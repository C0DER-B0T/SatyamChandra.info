import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface ArrayInputProps {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  buttonText?: string;
}

const ArrayInput = ({ label, values, onChange, placeholder = 'Enter item', buttonText = 'Add Item' }: ArrayInputProps) => {
  const [newItem, setNewItem] = useState('');

  const handleAdd = () => {
    if (newItem.trim()) {
      onChange([...values, newItem.trim()]);
      setNewItem('');
    }
  };

  const handleRemove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {/* Display existing items */}
      <div className="space-y-2">
        {values.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-700 p-2 rounded-lg"
          >
            <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item}</span>
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Add new item */}
      <div className="flex space-x-2">
        <input
          type="text"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{buttonText}</span>
        </button>
      </div>
    </div>
  );
};

export default ArrayInput;
