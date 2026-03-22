import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { adminAPI } from '../../services/api';

const HospitalsManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchHospitals = async () => {
      setLoading(true);
      try {
        const response = await adminAPI.getHospitals({ limit: 100 });
        if (!isMounted) {
          return;
        }

        const allHospitals = response.data?.hospitals || [];
        const filtered = allHospitals.filter((hospital) => {
          const matchesSearch = !searchTerm ||
            hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            hospital.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'verified' && hospital.isVerified) ||
            (statusFilter === 'pending' && !hospital.isVerified);

          return matchesSearch && matchesStatus;
        });

        setHospitals(filtered);
      } catch (error) {
        console.error('Error fetching hospitals:', error);
        if (isMounted) {
          setHospitals([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchHospitals, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [searchTerm, statusFilter]);

  const stats = useMemo(() => [
    { label: 'Total Hospitals', value: hospitals.length, color: 'bg-blue-500' },
    { label: 'Verified', value: hospitals.filter((hospital) => hospital.isVerified).length, color: 'bg-green-500' },
    { label: 'Pending Review', value: hospitals.filter((hospital) => !hospital.isVerified).length, color: 'bg-yellow-500' }
  ], [hospitals]);

  const handleVerify = async (hospitalId) => {
    try {
      await adminAPI.verifyHospital(hospitalId);
      setHospitals((current) =>
        current.map((hospital) =>
          hospital._id === hospitalId ? { ...hospital, isVerified: true } : hospital
        )
      );
      setSelectedHospital((current) => (current?._id === hospitalId ? { ...current, isVerified: true } : current));
      toast.success('Hospital verified.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to verify hospital.');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Hospitals Management</h1>
        <p className="text-gray-600 mt-1">Real hospital registrations from the admin API.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="glass-card p-4">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 ${stat.color} rounded-xl`} />
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <input type="text" placeholder="Search hospitals..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="input-field flex-1" />
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field md:w-40">
            <option value="all">All Status</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="glass-card p-10 text-center text-gray-500 md:col-span-2 lg:col-span-3">Loading hospitals...</div>
        ) : hospitals.length === 0 ? (
          <div className="glass-card p-10 text-center text-gray-500 md:col-span-2 lg:col-span-3">No hospitals found.</div>
        ) : hospitals.map((hospital) => (
          <div key={hospital._id} className="glass-card p-6 hover:shadow-xl transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{hospital.name}</h3>
                <p className="text-sm text-gray-500">{hospital.type || 'Hospital'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${hospital.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {hospital.isVerified ? 'verified' : 'pending'}
              </span>
            </div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>{hospital.user?.email || 'No email'}</p>
              <p>{hospital.phone || hospital.user?.phone || 'No phone'}</p>
              <p>{hospital.address?.city || 'Unknown city'}, {hospital.address?.state || 'Unknown state'}</p>
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setSelectedHospital(hospital)} className="text-primary-600 hover:text-primary-700 font-medium text-sm" type="button">
                View
              </button>
              {!hospital.isVerified ? (
                <button onClick={() => handleVerify(hospital._id)} className="text-green-600 hover:text-green-700 font-medium text-sm" type="button">
                  Verify
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedHospital ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedHospital(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden" onClick={(event) => event.stopPropagation()}>
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-6 py-4">
                <h3 className="text-xl font-semibold text-white">Hospital Details</h3>
              </div>
              <div className="p-6 space-y-4">
                <p><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-800">{selectedHospital.name}</span></p>
                <p><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-800">{selectedHospital.user?.email || 'N/A'}</span></p>
                <p><span className="text-gray-500">Phone:</span> <span className="font-medium text-gray-800">{selectedHospital.phone || selectedHospital.user?.phone || 'N/A'}</span></p>
                <p><span className="text-gray-500">Address:</span> <span className="font-medium text-gray-800">{selectedHospital.address?.street || ''} {selectedHospital.address?.city || ''}</span></p>
              </div>
              <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                {!selectedHospital.isVerified ? (
                  <button onClick={() => handleVerify(selectedHospital._id)} className="btn-secondary text-green-600 border-green-200 hover:bg-green-50" type="button">
                    Verify
                  </button>
                ) : null}
                <button onClick={() => setSelectedHospital(null)} className="btn-primary" type="button">
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default HospitalsManagement;
