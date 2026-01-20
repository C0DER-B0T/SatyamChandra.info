import { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Loader } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import { AboutFormData } from '../../types/types';

const AboutManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<AboutFormData>({
    profilePicture: '',
    tagline: '',
    shortBio: '',
    fullBio: '',
    currentFocus: '',
    mission: '',
    currentExp: 0,
    maxExp: 100,
    level: 1,
  });

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const docRef = doc(db, 'about', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setFormData(docSnap.data() as AboutFormData);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
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
      setFormData({ ...formData, profilePicture: result.secure_url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'about', 'main'), {
        ...formData,
        updatedAt: new Date(),
      });
      alert('About section updated successfully!');
    } catch (error) {
      console.error('Error saving about data:', error);
      alert('Failed to save about data');
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
          About Section Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </motion.button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 space-y-6">
        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Picture
          </label>
          <div className="flex items-center space-x-4">
            {formData.profilePicture && (
              <img
                src={formData.profilePicture}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-blue-400"
              />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-picture"
                disabled={uploading}
              />
              <label
                htmlFor="profile-picture"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>{uploading ? `Uploading ${uploadProgress}%` : 'Upload Photo'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tagline
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
            placeholder="e.g., Passionate AI/ML Engineer | Building Intelligent Solutions"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Short Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Short Bio
          </label>
          <textarea
            value={formData.shortBio}
            onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
            rows={3}
            placeholder="A brief introduction about yourself..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Full Bio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Detailed Bio
          </label>
          <textarea
            value={formData.fullBio}
            onChange={(e) => setFormData({ ...formData, fullBio: e.target.value })}
            rows={6}
            placeholder="A detailed description of your background, skills, and experience..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Current Focus */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Focus
          </label>
          <textarea
            value={formData.currentFocus}
            onChange={(e) => setFormData({ ...formData, currentFocus: e.target.value })}
            rows={2}
            placeholder="What you're currently working on or learning..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Mission */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mission Statement
          </label>
          <textarea
            value={formData.mission}
            onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
            rows={3}
            placeholder="Your mission and goals..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* EXP System */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">🎮 EXP System</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current EXP
              </label>
              <input
                type="number"
                value={formData.currentExp}
                onChange={(e) => setFormData({ ...formData, currentExp: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Max EXP
              </label>
              <input
                type="number"
                value={formData.maxExp}
                onChange={(e) => setFormData({ ...formData, maxExp: parseInt(e.target.value) || 100 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Level
              </label>
              <input
                type="number"
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Quick EXP Actions:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, currentExp: Math.min(formData.currentExp + 10, formData.maxExp) })}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                +10 EXP 💪
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, currentExp: Math.min(formData.currentExp + 5, formData.maxExp) })}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                +5 EXP 📚
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, currentExp: Math.max(formData.currentExp - 5, 0) })}
                className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                -5 EXP ⏰
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, currentExp: Math.max(formData.currentExp - 10, 0) })}
                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                -10 EXP 😴
              </button>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-3">
              💪 Coding/Gym | 📚 Projects/Study | ⏰ Wasted Time | 😴 Procrastination
            </p>
          </div>

          {/* EXP Preview */}
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Preview:</p>
            <div className="flex items-center space-x-3">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Level {formData.level}</span>
              <div className="flex-1 h-6 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${(formData.currentExp / formData.maxExp) * 100}%` }}
                >
                  <span className="text-xs font-bold text-white">
                    {formData.currentExp > 0 && `${formData.currentExp}/${formData.maxExp}`}
                  </span>
                </div>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round((formData.currentExp / formData.maxExp) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutManager;
