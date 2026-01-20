import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader, MapPin, Mail, Phone, Github, Linkedin, Twitter } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { ContactFormData } from '../../types/types';

const ContactManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    location: '',
    email: '',
    mobile: '',
    github: '',
    linkedin: '',
    twitter: '',
    preferredContact: 'both',
  });

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const docRef = doc(db, 'contact', 'main');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setFormData(docSnap.data() as ContactFormData);
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'contact', 'main'), {
        ...formData,
        updatedAt: new Date(),
      });
      alert('Contact information updated successfully!');
    } catch (error) {
      console.error('Error saving contact data:', error);
      alert('Failed to save contact data');
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
          Contact Section Management
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
        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., New Delhi, India"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="your.email@example.com"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Mobile Number (with country code)
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="e.g., +919876543210"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Include country code for WhatsApp (e.g., +91 for India)
            </p>
          </div>

          {/* GitHub */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Github className="w-4 h-4 inline mr-2" />
              GitHub URL
            </label>
            <input
              type="url"
              value={formData.github}
              onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              placeholder="https://github.com/username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Linkedin className="w-4 h-4 inline mr-2" />
              LinkedIn URL
            </label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="https://linkedin.com/in/username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Twitter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Twitter className="w-4 h-4 inline mr-2" />
              Twitter/X URL
            </label>
            <input
              type="url"
              value={formData.twitter}
              onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
              placeholder="https://x.com/username"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Contact Preference */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            📬 Contact Form Redirect Preference
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose where visitors should be redirected when they submit the contact form:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.preferredContact === 'whatsapp' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-green-300'
            }`}>
              <input
                type="radio"
                name="preferredContact"
                value="whatsapp"
                checked={formData.preferredContact === 'whatsapp'}
                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
                className="mr-3"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">WhatsApp Only</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Direct to WhatsApp chat</p>
              </div>
            </label>

            <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.preferredContact === 'email' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-300'
            }`}>
              <input
                type="radio"
                name="preferredContact"
                value="email"
                checked={formData.preferredContact === 'email'}
                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
                className="mr-3"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Only</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Open email client</p>
              </div>
            </label>

            <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
              formData.preferredContact === 'both' 
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
            }`}>
              <input
                type="radio"
                name="preferredContact"
                value="both"
                checked={formData.preferredContact === 'both'}
                onChange={(e) => setFormData({ ...formData, preferredContact: e.target.value as any })}
                className="mr-3"
              />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Both Options</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Let visitor choose</p>
              </div>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Preview:</h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2 text-sm">
            <p><strong>Location:</strong> {formData.location || 'Not set'}</p>
            <p><strong>Email:</strong> {formData.email || 'Not set'}</p>
            <p><strong>Mobile:</strong> {formData.mobile || 'Not set'}</p>
            <p><strong>Redirect Preference:</strong> {formData.preferredContact === 'both' ? 'Show both options' : formData.preferredContact === 'whatsapp' ? 'WhatsApp only' : 'Email only'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
