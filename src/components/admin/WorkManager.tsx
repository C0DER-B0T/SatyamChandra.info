import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Loader } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { WorkExperience, WorkExperienceFormData } from '../../types/types';

const WorkManager = () => {
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<WorkExperienceFormData>({
    role: '',
    company: '',
    period: '',
    description: '',
    responsibilities: [],
    technologies: [],
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'workExperience'));
      const expData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as WorkExperience[];
      setExperiences(expData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    } catch (error) {
      console.error('Error fetching work experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'workExperience', editingId), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'workExperience'), {
          ...formData,
          order: experiences.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      resetForm();
      fetchExperiences();
    } catch (error) {
      console.error('Error saving work experience:', error);
      alert('Failed to save work experience');
    }
  };

  const handleEdit = (exp: WorkExperience) => {
    setFormData({
      role: exp.role,
      company: exp.company,
      period: exp.period,
      description: exp.description,
      responsibilities: exp.responsibilities,
      technologies: exp.technologies,
    });
    setEditingId(exp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this work experience?')) return;
    
    try {
      await deleteDoc(doc(db, 'workExperience', id));
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting work experience:', error);
      alert('Failed to delete work experience');
    }
  };

  const resetForm = () => {
    setFormData({
      role: '',
      company: '',
      period: '',
      description: '',
      responsibilities: [],
      technologies: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleResponsibilitiesChange = (value: string) => {
    const respArray = value.split('\n').map(r => r.trim()).filter(r => r);
    setFormData({ ...formData, responsibilities: respArray });
  };

  const handleTechnologiesChange = (value: string) => {
    const techArray = value.split(',').map(t => t.trim()).filter(t => t);
    setFormData({ ...formData, technologies: techArray });
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
          Work Experience Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Experience</span>
        </motion.button>
      </div>

      {/* Form Modal */}
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
                  {editingId ? 'Edit Work Experience' : 'Add New Work Experience'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company</label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Period</label>
                  <input
                    type="text"
                    value={formData.period}
                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                    placeholder="e.g., 2024 - Present"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    value={formData.responsibilities.join('\n')}
                    onChange={(e) => handleResponsibilitiesChange(e.target.value)}
                    rows={5}
                    placeholder="Developed machine learning models&#10;Led team of 5 engineers&#10;Improved system performance by 40%"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Technologies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.technologies.join(', ')}
                    onChange={(e) => handleTechnologiesChange(e.target.value)}
                    placeholder="Python, TensorFlow, AWS, Docker"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

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

      {/* Experiences List */}
      <div className="space-y-6">
        {experiences.map((exp) => (
          <motion.div
            key={exp.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{exp.role}</h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.company}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{exp.period}</p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-3">{exp.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {exp.technologies.slice(0, 5).map((tech, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded">
                  {tech}
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(exp)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(exp.id)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {experiences.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No work experience yet. Click "Add Experience" to get started.
        </div>
      )}
    </div>
  );
};

export default WorkManager;
