import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Loader } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Experience, ExperienceFormData } from '../../types/types';
import ArrayInput from './ArrayInput';

const ExperienceManager = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ExperienceFormData>({
    jobRole: '',
    companyName: '',
    location: '',
    duration: '',
    activityDescription: '',
    keyContributions: [],
    technicalSkills: [],
    softSkills: [],
  });

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'experience'));
      const expData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Experience[];
      setExperiences(expData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    } catch (error) {
      console.error('Error fetching experience:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'experience', editingId), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'experience'), {
          ...formData,
          order: experiences.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      resetForm();
      fetchExperiences();
    } catch (error) {
      console.error('Error saving experience:', error);
      alert('Failed to save experience');
    }
  };

  const handleEdit = (exp: Experience) => {
    setFormData({
      jobRole: exp.jobRole,
      companyName: exp.companyName,
      location: exp.location,
      duration: exp.duration,
      activityDescription: exp.activityDescription,
      keyContributions: exp.keyContributions,
      technicalSkills: exp.technicalSkills,
      softSkills: exp.softSkills,
    });
    setEditingId(exp.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    
    try {
      await deleteDoc(doc(db, 'experience', id));
      fetchExperiences();
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience');
    }
  };

  const resetForm = () => {
    setFormData({
      jobRole: '',
      companyName: '',
      location: '',
      duration: '',
      activityDescription: '',
      keyContributions: [],
      technicalSkills: [],
      softSkills: [],
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
          Experience Management
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

      {/* Experience Form Modal */}
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
              className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingId ? 'Edit Experience' : 'Add New Experience'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Role
                    </label>
                    <input
                      type="text"
                      value={formData.jobRole}
                      onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., New York, USA"
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
                      placeholder="e.g., Jan 2023 - Present"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Activity Description
                  </label>
                  <textarea
                    value={formData.activityDescription}
                    onChange={(e) => setFormData({ ...formData, activityDescription: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <ArrayInput
                  label="Key Contributions"
                  values={formData.keyContributions}
                  onChange={(keyContributions) => setFormData({ ...formData, keyContributions })}
                  placeholder="Enter a contribution"
                  buttonText="Add Contribution"
                />

                <ArrayInput
                  label="Technical Skills"
                  values={formData.technicalSkills}
                  onChange={(technicalSkills) => setFormData({ ...formData, technicalSkills })}
                  placeholder="e.g., Python, TensorFlow"
                  buttonText="Add Skill"
                />

                <ArrayInput
                  label="Soft Skills"
                  values={formData.softSkills}
                  onChange={(softSkills) => setFormData({ ...formData, softSkills })}
                  placeholder="e.g., Leadership, Communication"
                  buttonText="Add Skill"
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

      {/* Experience List */}
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
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {exp.jobRole}
                </h3>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{exp.companyName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {exp.location} • {exp.duration}
                </p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 mb-4">{exp.activityDescription}</p>

            {exp.keyContributions.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Key Contributions:
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  {exp.keyContributions.map((contribution, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-300">
                      {contribution}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {exp.technicalSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Technical Skills:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.technicalSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {exp.softSkills.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Soft Skills:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {exp.softSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
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
          No experience entries yet. Click "Add Experience" to get started.
        </div>
      )}
    </div>
  );
};

export default ExperienceManager;
