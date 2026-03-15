import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Loader, ChevronUp, ChevronDown } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Certification, CertificationFormData } from '../../types/types';

const CertificationsManager = () => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CertificationFormData>({
    title: '',
    issuer: '',
    date: '',
    credential: '',
    description: '',
    skills: [],
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'certifications'));
      const certsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Certification[];
      setCertifications(certsData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'certifications', editingId), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'certifications'), {
          ...formData,
          order: certifications.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      resetForm();
      fetchCertifications();
    } catch (error) {
      console.error('Error saving certification:', error);
      alert('Failed to save certification');
    }
  };

  const handleEdit = (cert: Certification) => {
    setFormData({
      title: cert.title,
      issuer: cert.issuer,
      date: cert.date,
      credential: cert.credential,
      description: cert.description,
      skills: cert.skills,
    });
    setEditingId(cert.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;
    
    try {
      await deleteDoc(doc(db, 'certifications', id));
      fetchCertifications();
    } catch (error) {
      console.error('Error deleting certification:', error);
      alert('Failed to delete certification');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      issuer: '',
      date: '',
      credential: '',
      description: '',
      skills: [],
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSkillsChange = (value: string) => {
    const skillsArray = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData({ ...formData, skills: skillsArray });
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === certifications.length - 1)
    ) return;

    const newCerts = [...certifications];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap strictly visually for optimistic UI update
    const temp = newCerts[index];
    newCerts[index] = newCerts[swapIndex];
    newCerts[swapIndex] = temp;

    // Fix the order values continuously 
    const orderedCerts = newCerts.map((cert, i) => ({
      ...cert,
      order: newCerts.length - 1 - i // descending order like how it's sorted
    }));

    setCertifications(orderedCerts);

    try {
      const batch = writeBatch(db);
      // Update both swapped documents
      const item1Ref = doc(db, 'certifications', orderedCerts[index].id);
      batch.update(item1Ref, { order: orderedCerts[index].order });

      const item2Ref = doc(db, 'certifications', orderedCerts[swapIndex].id);
      batch.update(item2Ref, { order: orderedCerts[swapIndex].order });

      await batch.commit();
    } catch (error) {
      console.error('Error reordering certifications:', error);
      alert('Failed to save new order');
      fetchCertifications(); // Revert on failure
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
          Certifications Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Certification</span>
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
                  {editingId ? 'Edit Certification' : 'Add New Certification'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Issuer</label>
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date</label>
                  <input
                    type="text"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    placeholder="e.g., 2023"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Credential ID</label>
                  <input
                    type="text"
                    value={formData.credential}
                    onChange={(e) => setFormData({ ...formData, credential: e.target.value })}
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
                    Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.skills.join(', ')}
                    onChange={(e) => handleSkillsChange(e.target.value)}
                    placeholder="Python, Machine Learning, TensorFlow"
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

      {/* Certifications List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certifications.map((cert, index) => (
          <motion.div
            key={cert.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative group"
          >
            <div className="absolute right-4 top-4 flex flex-col space-y-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-400"
                title="Move up"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove(index, 'down')}
                disabled={index === certifications.length - 1}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-400"
                title="Move down"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pr-10">{cert.title}</h3>
            <p className="text-blue-600 dark:text-blue-400 font-medium mb-2">{cert.issuer}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{cert.date}</p>
            <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">{cert.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {cert.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(cert)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(cert.id)}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {certifications.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No certifications yet. Click "Add Certification" to get started.
        </div>
      )}
    </div>
  );
};

export default CertificationsManager;
