import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader, Code2, Plus, X, Trash2 } from 'lucide-react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { SkillCategory, Skill, SKILL_CATEGORIES } from '../../types/types';

const SkillsManager = () => {
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'skills'));
      const skillsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SkillCategory[];

      // Initialize with fixed categories if empty
      if (skillsData.length === 0) {
        const initialCategories: SkillCategory[] = SKILL_CATEGORIES.map((category, index) => ({
          id: category.toLowerCase().replace(/\s+/g, '-').replace(/&/g, 'and'),
          category,
          skills: [],
          order: index,
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        setSkillCategories(initialCategories);
      } else {
        setSkillCategories(skillsData.sort((a, b) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = (categoryId: string) => {
    setSkillCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, skills: [...cat.skills, { name: '', confidence: 80 }] }
          : cat
      )
    );
  };

  const handleRemoveSkill = (categoryId: string, skillIndex: number) => {
    setSkillCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? { ...cat, skills: cat.skills.filter((_, i) => i !== skillIndex) }
          : cat
      )
    );
  };

  const handleSkillChange = (categoryId: string, skillIndex: number, field: keyof Skill, value: string | number) => {
    setSkillCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              skills: cat.skills.map((skill, i) =>
                i === skillIndex ? { ...skill, [field]: value } : skill
              ),
            }
          : cat
      )
    );
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // Save each category to Firestore
      const savePromises = skillCategories.map(category =>
        setDoc(doc(db, 'skills', category.id), {
          category: category.category,
          skills: category.skills,
          order: category.order,
          updatedAt: new Date(),
          createdAt: category.createdAt || new Date(),
        })
      );

      await Promise.all(savePromises);
      alert('All skills saved successfully!');
    } catch (error) {
      console.error('Error saving skills:', error);
      alert('Failed to save skills');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Skills Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSaveAll}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save All Skills'}</span>
        </motion.button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Manage your skills with confidence levels (0-100%). Each skill will display with a progress bar on your portfolio.
        </p>

        <div className="space-y-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {category.category}
                  </h3>
                </div>
                <button
                  onClick={() => handleAddSkill(category.id)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Skill</span>
                </button>
              </div>

              <div className="space-y-3">
                {category.skills.map((skill, skillIndex) => (
                  <div
                    key={skillIndex}
                    className="bg-white dark:bg-gray-600 rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Skill #{skillIndex + 1}
                      </span>
                      <button
                        onClick={() => handleRemoveSkill(category.id, skillIndex)}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Skill Name
                        </label>
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => handleSkillChange(category.id, skillIndex, 'name', e.target.value)}
                          placeholder="e.g., Python, TensorFlow"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          Confidence (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={skill.confidence}
                          onChange={(e) => handleSkillChange(category.id, skillIndex, 'confidence', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                        />
                      </div>
                    </div>

                    {/* Preview Progress Bar */}
                    {skill.name && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                          <span>{skill.name}</span>
                          <span>{skill.confidence}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-500 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${skill.confidence}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {category.skills.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                    No skills added yet. Click "Add Skill" to get started.
                  </p>
                )}
              </div>

              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                {category.skills.length} skill{category.skills.length !== 1 ? 's' : ''} added
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Set confidence levels based on your proficiency. 90-100% for expert level, 70-89% for proficient, 50-69% for intermediate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;
