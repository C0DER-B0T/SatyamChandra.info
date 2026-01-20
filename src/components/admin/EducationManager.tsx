import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Loader } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Education, EducationFormData } from '../../types/types';
import ArrayInput from './ArrayInput';

const EducationManager = () => {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<EducationFormData>({
    instituteName: '',
    courseTitle: '',
    duration: '',
    description: '',
    keyAchievements: [],
  });

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'education'));
      const eduData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Education[];
      setEducations(eduData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    } catch (error) {
      console.error('Error fetching education:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'education', editingId), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'education'), {
          ...formData,
          order: educations.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      resetForm();
      fetchEducations();
    } catch (error) {
      console.error('Error saving education:', error);
      alert('Failed to save education');
    }
  };

  const handleEdit = (edu: Education) => {
    setFormData({
      instituteName: edu.instituteName,
      courseTitle: edu.courseTitle,
      duration: edu.duration,
      description: edu.description,
      keyAchievements: edu.keyAchievements,
    });
    setEditingId(edu.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    
    try {
      await deleteDoc(doc(db, 'education', id));
      fetchEducations();
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('Failed to delete education');
    }
  };

  const resetForm = () => {
    setFormData({
      instituteName: '',
      courseTitle: '',
      duration: '',
      description: '',
      keyAchievements: [],
    });
    setEditingId(null);
    setShowForm(false);
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
          Education Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Education</span>
        </motion.button>
      </div>

      {/* Education Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Education' : 'Add New Education'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institute Name
                  </label>
                  <input
                    type="text"
                    value={formData.instituteName}
                    onChange={(e) => setFormData({ ...formData, instituteName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course / Degree Title
                  </label>
                  <input
                    type="text"
                    value={formData.courseTitle}
                    onChange={(e) => setFormData({ ...formData, courseTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2020 - 2024"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <ArrayInput
                  label="Key Achievements"
                  values={formData.keyAchievements}
                  onChange={(keyAchievements) => setFormData({ ...formData, keyAchievements })}
                  placeholder="Enter an achievement"
                  buttonText="Add Achievement"
                />

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    <Save className="w-5 h-5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education List */}
      <div className="space-y-6">
        {educations.map((edu) => (
          <motion.div
            key={edu.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {edu.courseTitle}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{edu.instituteName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{edu.duration}</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">{edu.description}</p>

            {edu.keyAchievements.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Key Achievements:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {edu.keyAchievements.map((achievement, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
                      {achievement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(edu)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(edu.id)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {educations.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No education entries yet. Click "Add Education" to get started.
        </div>
      )}
    </div>
  );
};

export default EducationManager;
