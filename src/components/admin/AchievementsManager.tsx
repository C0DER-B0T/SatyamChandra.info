import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Upload, Loader, ChevronUp, ChevronDown, Trophy } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import { Achievement, AchievementFormData } from '../../types/types';

const AchievementsManager = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AchievementFormData>({
    title: '',
    platform: '',
    description: '',
    badgeImage: '',
    link: '',
  });

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'achievements'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Achievement[];
      setAchievements(data.sort((a, b) => (a.order || 0) - (b.order || 0)));
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const result = await uploadToCloudinary(file, (progress) => {
        setUploadProgress(progress);
      });
      setFormData({ ...formData, badgeImage: result.secure_url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Ensure Cloudinary is configured, or paste an image URL directly.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'achievements', editingId), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'achievements'), {
          ...formData,
          order: achievements.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      resetForm();
      fetchAchievements();
    } catch (error) {
      console.error('Error saving achievement:', error);
      alert('Failed to save achievement');
    }
  };

  const handleEdit = (item: Achievement) => {
    setFormData({
      title: item.title,
      platform: item.platform,
      description: item.description,
      badgeImage: item.badgeImage,
      link: item.link || '',
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;
    
    try {
      await deleteDoc(doc(db, 'achievements', id));
      fetchAchievements();
    } catch (error) {
      console.error('Error deleting achievement:', error);
      alert('Failed to delete achievement');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === achievements.length - 1)
    ) {
      return;
    }

    const newAchievements = [...achievements];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the elements in the local array to immediately show the change (optimistic UI update)
    const temp = newAchievements[index];
    newAchievements[index] = newAchievements[targetIndex];
    newAchievements[targetIndex] = temp;
    
    // Reassign order values based on the new array positions
    const updatedAchievements = newAchievements.map((item, idx) => ({
      ...item,
      order: idx
    }));

    setAchievements(updatedAchievements); // Optimistic update

    try {
      // Create a batch to update both documents simultaneously
      const batch = writeBatch(db);
      
      const currentDocRef = doc(db, 'achievements', achievements[index].id);
      const targetDocRef = doc(db, 'achievements', achievements[targetIndex].id);
      
      batch.update(currentDocRef, { order: targetIndex });
      batch.update(targetDocRef, { order: index });
      
      await batch.commit();
    } catch (error) {
      console.error('Error reordering achievements:', error);
      alert('Failed to save new order. Refreshing the list.');
      fetchAchievements(); // Revert back to database state on error
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      platform: '',
      description: '',
      badgeImage: '',
      link: '',
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
          Achievements & Medals
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Achievement</span>
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
                  {editingId ? 'Edit Achievement' : 'Add New Achievement'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title (e.g., Google Cloud Certified, Pull Shark)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform (e.g., GitHub, Google Cloud)
                  </label>
                  <input
                    type="text"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification / Credential Link (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Badge Image (PNG)
                  </label>
                  {formData.badgeImage && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-3 flex justify-center">
                      <img
                        src={formData.badgeImage}
                        alt="Badge Preview"
                        className="h-32 object-contain"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="badge-image"
                    disabled={uploading}
                  />
                  <div className="flex items-center space-x-4">
                    <label
                      htmlFor="badge-image"
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg cursor-pointer transition-colors border border-blue-200 dark:border-blue-800"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{uploading ? `Uploading ${uploadProgress}%` : 'Upload PNG'}</span>
                    </label>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Or paste an image URL below:
                    </div>
                  </div>
                  <input
                    type="url"
                    value={formData.badgeImage}
                    onChange={(e) => setFormData({ ...formData, badgeImage: e.target.value })}
                    placeholder="Image URL"
                    className="w-full mt-3 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>

                <div className="flex space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
                  <button
                    onClick={handleSubmit}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
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

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {achievements.map((item, index) => (
          <motion.div
            key={item.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col items-center p-6 text-center relative"
          >
            {/* Reorder Controls */}
            <div className="absolute top-2 right-2 flex flex-col space-y-1">
              <button
                onClick={() => handleMove(index, 'up')}
                disabled={index === 0}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-400 rounded transition-colors"
                title="Move Up"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleMove(index, 'down')}
                disabled={index === achievements.length - 1}
                className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-30 disabled:hover:text-gray-400 rounded transition-colors"
                title="Move Down"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {item.badgeImage && (
              <img
                src={item.badgeImage}
                alt={item.title}
                className="w-24 h-24 object-contain mb-4 drop-shadow-md"
              />
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {item.title}
            </h3>
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded text-xs mb-3 font-medium">
              {item.platform}
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6 line-clamp-3">
              {item.description}
            </p>

            <div className="flex space-x-2 w-full mt-auto">
              <button
                onClick={() => handleEdit(item)}
                className="flex-[2] flex items-center justify-center space-x-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {achievements.length === 0 && (
        <div className="text-center py-20 px-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trophy className="w-8 h-8 text-blue-400 dark:text-blue-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No achievements yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            Showcase your GitHub badges, Google Cloud certifications, hackathon medals, and other accomplishments.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add your first achievement</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementsManager;
