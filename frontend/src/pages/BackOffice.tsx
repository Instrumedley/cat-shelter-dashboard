import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { catsService, Cat, CreateCatData, UpdateCatData } from '../services/api/cats';
import Header from '../components/Header';
import toast from 'react-hot-toast';

const BackOffice: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cats, setCats] = useState<Cat[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [selectedCat, setSelectedCat] = useState<Cat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCats, setIsLoadingCats] = useState(false);
  const [formData, setFormData] = useState<CreateCatData>({
    name: '',
    age: 0,
    ageGroup: 'adult',
    gender: 'male',
    breed: '',
    color: '',
    status: 'available',
    description: '',
    imageUrl: '',
    entryDate: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
    entryType: 'rescue',
    isNeuteredOrSpayed: false,
    isBooked: false,
    isAdopted: false,
    medicalNotes: '',
  });

  // Check authentication and role
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (user.role !== 'super_admin' && user.role !== 'clinic_staff') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Load cats list
  useEffect(() => {
    loadCats();
  }, []);

  const loadCats = async () => {
    setIsLoadingCats(true);
    try {
      const catsList = await catsService.getAll();
      setCats(catsList);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load cats');
    } finally {
      setIsLoadingCats(false);
    }
  };

  // Load selected cat data
  useEffect(() => {
    if (selectedCatId) {
      loadCat(selectedCatId);
    } else {
      setSelectedCat(null);
      resetForm();
    }
  }, [selectedCatId]);

  const loadCat = async (id: number) => {
    setIsLoading(true);
    try {
      const cat = await catsService.getById(id);
      setSelectedCat(cat);
      setFormData({
        name: cat.name,
        age: cat.age,
        ageGroup: cat.ageGroup,
        gender: cat.gender,
        breed: cat.breed || '',
        color: cat.color || '',
        status: cat.status,
        description: cat.description || '',
        imageUrl: cat.imageUrl || '',
        entryDate: new Date(cat.entryDate).toISOString(),
        entryType: cat.entryType,
        isNeuteredOrSpayed: cat.isNeuteredOrSpayed,
        isBooked: cat.isBooked,
        isAdopted: cat.isAdopted,
        medicalNotes: cat.medicalNotes || '',
      });
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to load cat');
      setSelectedCatId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: 0,
      ageGroup: 'adult',
      gender: 'male',
      breed: '',
      color: '',
      status: 'available',
      description: '',
      imageUrl: '',
      entryDate: new Date().toISOString().split('T')[0] + 'T00:00:00Z',
      entryType: 'rescue',
      isNeuteredOrSpayed: false,
      isBooked: false,
      isAdopted: false,
      medicalNotes: '',
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
          : type === 'number'
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (selectedCatId && selectedCat) {
        // Update existing cat
        const updateData: UpdateCatData = { ...formData };
        await catsService.update(selectedCatId, updateData);
        toast.success('Cat updated successfully!');
      } else {
        // Create new cat
        const createData: CreateCatData = { ...formData };
        await catsService.create(createData);
        toast.success('Cat created successfully!');
        resetForm();
      }
      await loadCats();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error?.message || 'Failed to save cat'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewCat = () => {
    setSelectedCatId(null);
    setSelectedCat(null);
    resetForm();
  };

  if (!user || (user.role !== 'super_admin' && user.role !== 'clinic_staff')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Back Office - Cat Management</h1>
            <button
              onClick={handleNewCat}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add New Cat
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Cat Selection */}
            <div className="lg:col-span-1">
              <div className="card bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Select Cat to Edit
                </h2>
                {isLoadingCats ? (
                  <div className="text-center py-4 text-gray-500">Loading cats...</div>
                ) : (
                  <select
                    value={selectedCatId || ''}
                    onChange={(e) =>
                      setSelectedCatId(e.target.value ? parseInt(e.target.value) : null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">-- Select a cat --</option>
                    {cats.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} (ID: {cat.id})
                      </option>
                    ))}
                  </select>
                )}
                {selectedCat && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <strong>Current Status:</strong> {selectedCat.status}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Age:</strong> {selectedCat.age} years ({selectedCat.ageGroup})
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Gender:</strong> {selectedCat.gender}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2">
              <div className="card bg-white">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {selectedCatId ? 'Edit Cat' : 'Add New Cat'}
                </h2>

                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">Loading cat data...</div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      {/* Age */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age *
                        </label>
                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleInputChange}
                          required
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      {/* Age Group */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Age Group *
                        </label>
                        <select
                          name="ageGroup"
                          value={formData.ageGroup}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="kitten">Kitten</option>
                          <option value="adult">Adult</option>
                          <option value="senior">Senior</option>
                        </select>
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Gender *
                        </label>
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                      </div>

                      {/* Breed */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Breed
                        </label>
                        <input
                          type="text"
                          name="breed"
                          value={formData.breed}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      {/* Color */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Color
                        </label>
                        <input
                          type="text"
                          name="color"
                          value={formData.color}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="available">Available</option>
                          <option value="booked">Booked</option>
                          <option value="adopted">Adopted</option>
                          <option value="deceased">Deceased</option>
                        </select>
                      </div>

                      {/* Entry Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Entry Type *
                        </label>
                        <select
                          name="entryType"
                          value={formData.entryType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          <option value="rescue">Rescue</option>
                          <option value="surrender">Surrender</option>
                          <option value="stray">Stray</option>
                        </select>
                      </div>

                      {/* Entry Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Entry Date *
                        </label>
                        <input
                          type="datetime-local"
                          name="entryDate"
                          value={
                            formData.entryDate
                              ? new Date(formData.entryDate).toISOString().slice(0, 16)
                              : ''
                          }
                          onChange={(e) => {
                            const dateValue = e.target.value
                              ? new Date(e.target.value).toISOString()
                              : new Date().toISOString();
                            setFormData((prev) => ({ ...prev, entryDate: dateValue }));
                          }}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>

                      {/* Image URL */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Image URL
                        </label>
                        <input
                          type="url"
                          name="imageUrl"
                          value={formData.imageUrl}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Medical Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medical Notes
                      </label>
                      <textarea
                        name="medicalNotes"
                        value={formData.medicalNotes}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isNeuteredOrSpayed"
                          checked={formData.isNeuteredOrSpayed}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Neutered/Spayed</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isBooked"
                          checked={formData.isBooked}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Booked</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          name="isAdopted"
                          checked={formData.isAdopted}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Adopted</span>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                      {selectedCatId && (
                        <button
                          type="button"
                          onClick={handleNewCat}
                          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSaving
                          ? 'Saving...'
                          : selectedCatId
                          ? 'Update Cat'
                          : 'Create Cat'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BackOffice;

