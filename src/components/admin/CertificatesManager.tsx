import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Upload, Loader } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { uploadToCloudinary } from '../../config/cloudinary';
import { Certificate, CertificateFormData } from '../../types/types';
import ArrayInput from './ArrayInput';

const CertificatesManager = () => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CertificateFormData>({
    certificateName: '',
    issuingOrganization: '',
    description: '',
    skillsLearned: [],
    verificationLink: '',
    certificateImage: '',
  });

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'certificates'));
      const certsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Certificate[];
      setCertificates(certsData.sort((a, b) => (b.order || 0) - (a.order || 0)));
    } catch (error) {
      console.error('Error fetching certificates:', error);
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
      setFormData({ ...formData, certificateImage: result.secure_url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateDoc(doc(db, 'certificates', editingId), {
          ...formData,
          updatedAt: new Date(),
        });
      } else {
        await addDoc(collection(db, 'certificates'), {
          ...formData,
          order: certificates.length,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      resetForm();
      fetchCertificates();
    } catch (error) {
      console.error('Error saving certificate:', error);
      alert('Failed to save certificate');
    }
  };

  const handleEdit = (cert: Certificate) => {
    setFormData({
      certificateName: cert.certificateName,
      issuingOrganization: cert.issuingOrganization,
      description: cert.description,
      skillsLearned: cert.skillsLearned,
      verificationLink: cert.verificationLink,
      certificateImage: cert.certificateImage,
    });
    setEditingId(cert.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certificate?')) return;
    
    try {
      await deleteDoc(doc(db, 'certificates', id));
      fetchCertificates();
    } catch (error) {
      console.error('Error deleting certificate:', error);
      alert('Failed to delete certificate');
    }
  };

  const resetForm = () => {
    setFormData({
      certificateName: '',
      issuingOrganization: '',
      description: '',
      skillsLearned: [],
      verificationLink: '',
      certificateImage: '',
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
          Certificates Management
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Certificate</span>
        </motion.button>
      </div>

      {/* Certificate Form Modal */}
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
                  {editingId ? 'Edit Certificate' : 'Add New Certificate'}
                </h3>
                <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certificate Name
                  </label>
                  <input
                    type="text"
                    value={formData.certificateName}
                    onChange={(e) => setFormData({ ...formData, certificateName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Issuing Organization
                  </label>
                  <input
                    type="text"
                    value={formData.issuingOrganization}
                    onChange={(e) => setFormData({ ...formData, issuingOrganization: e.target.value })}
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
                  label="Skills / Technologies Learned"
                  values={formData.skillsLearned}
                  onChange={(skillsLearned) => setFormData({ ...formData, skillsLearned })}
                  placeholder="e.g., Machine Learning, Python"
                  buttonText="Add Skill"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Verification Link
                  </label>
                  <input
                    type="url"
                    value={formData.verificationLink}
                    onChange={(e) => setFormData({ ...formData, verificationLink: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Certificate Image
                  </label>
                  {formData.certificateImage && (
                    <img
                      src={formData.certificateImage}
                      alt="Certificate"
                      className="w-full h-48 object-cover rounded-lg mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="certificate-image"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="certificate-image"
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{uploading ? `Uploading ${uploadProgress}%` : 'Upload Certificate'}</span>
                  </label>
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

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((cert) => (
          <motion.div
            key={cert.id}
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
          >
            {cert.certificateImage && (
              <img
                src={cert.certificateImage}
                alt={cert.certificateName}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {cert.certificateName}
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400 mb-2">
                {cert.issuingOrganization}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {cert.description}
              </p>

              {cert.skillsLearned.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">
                    Skills Learned:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {cert.skillsLearned.map((skill, i) => (
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

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(cert)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(cert.id)}
                  className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {certificates.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No certificates yet. Click "Add Certificate" to get started.
        </div>
      )}
    </div>
  );
};

export default CertificatesManager;
