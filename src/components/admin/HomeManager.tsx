import { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader, Plus, X, Upload } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import { HomeFormData, SocialLink } from '../../types/types';
import ArrayInput from './ArrayInput';

// Built-in icon options
const BUILTIN_ICONS = [
  { value: 'Github', label: 'GitHub' },
  { value: 'Linkedin', label: 'LinkedIn' },
  { value: 'Twitter', label: 'X (Twitter)' },
  { value: 'Mail', label: 'Email' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Youtube', label: 'YouTube' },
  { value: 'Discord', label: 'Discord' },
  { value: 'Whatsapp', label: 'WhatsApp' },
  { value: 'Telegram', label: 'Telegram' },
  { value: 'Leetcode', label: 'LeetCode' },
  { value: 'Medium', label: 'Medium' },
  { value: 'Dev', label: 'Dev.to' },
  { value: 'Stackoverflow', label: 'Stack Overflow' },
] as const;

const HomeManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<HomeFormData>({
    displayName: '',
    profilePicture: '',
    description: '',
    roles: [],
    resumeLink: '',
    socialLinks: [],
  });

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const docRef = doc(db, 'home', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setFormData(docSnap.data() as HomeFormData);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'home', 'main'), {
        ...formData,
        updatedAt: new Date(),
      });
      alert('Home section updated successfully!');
    } catch (error) {
      console.error('Error saving home data:', error);
      alert('Failed to save home data');
    } finally {
      setSaving(false);
    }
  };

  const handleAddSocialLink = () => {
    setFormData({
      ...formData,
      socialLinks: [...formData.socialLinks, { name: '', iconType: 'builtin', icon: '', url: '' }],
    });
  };

  const handleRemoveSocialLink = (index: number) => {
    setFormData({
      ...formData,
      socialLinks: formData.socialLinks.filter((_, i) => i !== index),
    });
  };

  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: string) => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = { ...newSocialLinks[index], [field]: value };
    setFormData({ ...formData, socialLinks: newSocialLinks });
  };

  const handleIconTypeChange = (index: number, type: 'builtin' | 'custom') => {
    const newSocialLinks = [...formData.socialLinks];
    newSocialLinks[index] = {
      ...newSocialLinks[index],
      iconType: type,
      icon: type === 'builtin' ? '' : undefined,
      iconUrl: type === 'custom' ? '' : undefined,
    };
    setFormData({ ...formData, socialLinks: newSocialLinks });
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
          Home Section Management
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
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-400"
              />
            )}
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="home-profile-picture"
                disabled={uploading}
              />
              <label
                htmlFor="home-profile-picture"
                className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer"
              >
                <Upload className="w-5 h-5" />
                <span>{uploading ? `Uploading ${uploadProgress}%` : 'Upload Photo'}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            placeholder="e.g., Satyam Chandra"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description / Tagline
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            placeholder="e.g., Passionate about building intelligent systems and solving complex problems through innovative AI solutions."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Roles/Taglines Array */}
        <ArrayInput
          label="Roles / Taglines"
          values={formData.roles}
          onChange={(roles) => setFormData({ ...formData, roles })}
          placeholder="e.g., AI/ML Engineer"
          buttonText="Add Role"
        />

        {/* Resume Link */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Resume Download Link
          </label>
          <input
            type="url"
            value={formData.resumeLink}
            onChange={(e) => setFormData({ ...formData, resumeLink: e.target.value })}
            placeholder="https://..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Social Links */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Social Media Links
            </label>
            <button
              type="button"
              onClick={handleAddSocialLink}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Link</span>
            </button>
          </div>

          <div className="space-y-4">
            {formData.socialLinks.map((link, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Link #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocialLink(index)}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={link.name}
                      onChange={(e) => handleSocialLinkChange(index, 'name', e.target.value)}
                      placeholder="e.g., GitHub, GeeksforGeeks"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                    />
                  </div>

                  {/* Icon Type Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Icon Type
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={link.iconType === 'builtin'}
                          onChange={() => handleIconTypeChange(index, 'builtin')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Built-in Icon</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          checked={link.iconType === 'custom'}
                          onChange={() => handleIconTypeChange(index, 'custom')}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Custom URL</span>
                      </label>
                    </div>
                  </div>

                  {/* Built-in Icon Selector */}
                  {link.iconType === 'builtin' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Select Icon
                      </label>
                      <select
                        value={link.icon || ''}
                        onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      >
                        <option value="">Select an icon...</option>
                        {BUILTIN_ICONS.map((icon) => (
                          <option key={icon.value} value={icon.value}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Custom Icon URL */}
                  {link.iconType === 'custom' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                        Icon URL (SVG/PNG)
                      </label>
                      <input
                        type="url"
                        value={link.iconUrl || ''}
                        onChange={(e) => handleSocialLinkChange(index, 'iconUrl', e.target.value)}
                        placeholder="https://example.com/icon.svg"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      />
                      {link.iconUrl && (
                        <div className="mt-2 flex items-center space-x-2 p-2 bg-white dark:bg-gray-600 rounded border border-gray-200 dark:border-gray-500">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Preview:</span>
                          <img 
                            src={link.iconUrl} 
                            alt="Icon preview"
                            className="w-6 h-6 object-contain"
                            onError={(e) => e.currentTarget.style.display = 'none'}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Profile URL */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                      Profile URL
                    </label>
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                      placeholder="https://github.com/yourusername"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-600 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {formData.socialLinks.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No social links added yet. Click "Add Link" to get started.
              </p>
            )}
          </div>
          
          {/* Help Text */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg space-y-2">
            <p className="text-sm text-blue-800 dark:text-blue-200 font-semibold">
              💡 Icon Options:
            </p>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-4 list-disc">
              <li><strong>Built-in Icons:</strong> For common platforms (GitHub, LinkedIn, LeetCode, etc.)</li>
              <li><strong>Custom URL:</strong> For uncommon platforms (GeeksforGeeks, HackerRank, Codechef, etc.)</li>
            </ul>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
              Get custom icons from: <a href="https://github.com/rahuldkjain/github-profile-readme-generator" target="_blank" rel="noopener noreferrer" className="underline">GitHub Profile README Generator</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeManager;
