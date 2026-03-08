import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Loader, Code2, Plus, Trash2 } from 'lucide-react';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
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

      // Initialize with default categories if completely empty
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

  const handleAddCategory = () => {
    const newCategory: SkillCategory = {
      id: `category-${Date.now()}`,
      category: 'New Category',
      skills: [],
      order: skillCategories.length,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSkillCategories([...skillCategories, newCategory]);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this entire category and all its skills?')) return;
    
    // Optimistically update UI
    setSkillCategories(prev => prev.filter(cat => cat.id !== categoryId));
    
    // Delete from Firestore immediately
    try {
      await deleteDoc(doc(db, 'skills', categoryId));
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Failed to delete category from database. Please refresh and try again.');
      fetchSkills(); // Revert on failure
    }
  };

  const handleCategoryNameChange = (categoryId: string, newName: string) => {
    setSkillCategories(prev =>
      prev.map(cat =>
        cat.id === categoryId ? { ...cat, category: newName } : cat
      )
    );
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
      const savePromises = skillCategories.map((category, index) =>
        setDoc(doc(db, 'skills', category.id), {
          category: category.category,
          skills: category.skills,
          order: index, // Ensure order matches current array position
          updatedAt: new Date(),
          createdAt: category.createdAt || new Date(),
        })
      );

      await Promise.all(savePromises);
      alert('All skills saved successfully!');
      fetchSkills(); // Refresh to ensure sync
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
        <div className="flex space-x-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleAddCategory}
            className="flex items-center space-x-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Category</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save All'}</span>
          </motion.button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <p className="text-gray-600 dark:text-gray-300 mb-6 flex justify-between items-center">
          <span>Manage your skill categories and individual skills. You can add new categories, rename existing ones, or delete them entirely.</span>
        </p>

        <AnimatePresence>
          <div className="space-y-8">
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center flex-1 space-x-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg shrink-0">
                      <Code2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    {/* Editable Category Title */}
                    <input
                      type="text"
                      value={category.category}
                      onChange={(e) => handleCategoryNameChange(category.id, e.target.value)}
                      placeholder="Category Name"
                      className="text-xl font-bold bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-0 text-gray-900 dark:text-white px-2 py-1 w-full sm:w-auto transition-colors"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      onClick={() => handleAddSkill(category.id)}
                      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Skill</span>
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {category.skills.map((skill, skillIndex) => (
                      <motion.div
                        key={`${category.id}-skill-${skillIndex}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-white dark:bg-gray-600 rounded-lg p-4 space-y-3 border border-gray-100 dark:border-gray-500 shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Skill #{skillIndex + 1}
                          </span>
                          <button
                            onClick={() => handleRemoveSkill(category.id, skillIndex)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/50 rounded transition-colors"
                            title="Remove Skill"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Skill Name
                            </label>
                            <input
                              type="text"
                              value={skill.name}
                              onChange={(e) => handleSkillChange(category.id, skillIndex, 'name', e.target.value)}
                              placeholder="e.g., React, Node.js, TensorFlow"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                              Confidence Level ({skill.confidence}%)
                            </label>
                            <div className="flex items-center space-x-3">
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={skill.confidence}
                                onChange={(e) => handleSkillChange(category.id, skillIndex, 'confidence', parseInt(e.target.value) || 0)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Preview Progress Bar */}
                        {skill.name && (
                          <div className="pt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-500 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${skill.confidence}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {category.skills.length === 0 && (
                    <div className="text-center py-6 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No skills in this category yet. Click "Add Skill".
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
                  {category.skills.length} skill{category.skills.length !== 1 ? 's' : ''} added
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {skillCategories.length === 0 && (
          <div className="text-center py-20 px-4 bg-gray-50 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 mt-6">
            <Code2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Skill Categories</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
              You've deleted all skill categories. Add a new one to start displaying your skills again!
            </p>
            <button
              onClick={handleAddCategory}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Category</span>
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-100 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 <strong>Tip:</strong> Click directly on a category name (like "Programming Languages") to rename it. Don't forget to click <strong>Save All</strong> after making changes!
          </p>
        </div>
      </div>
    </div>
  );
};

export default SkillsManager;
