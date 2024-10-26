import React, { useState, useEffect } from 'react';
import '../assets/css/index.css';
import Navbar from '../components/Navbar';
import api from '../services/api';
import SettingsIcon from '@mui/icons-material/Settings';

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(null);
  const [email, setEmail] = useState(null);
  const [profileData, setProfileData] = useState(null); // State to hold the user's profile data
  const [error, setError] = useState(''); // State to hold any error message
  const [avatarColor, setAvatarColor] = useState('bg-purple-600');

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put(
        '/users/profile',
        {
          username: username || profileData.username,
          email: email || profileData.email,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass token in Authorization header
          },
        }
      );
      setProfileData(response.data); // Update profile data with the saved changes
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    }
  };

  const handleCustomize = () => {
    // This is a simple color change. In a real app, you might open a color picker or avatar customization modal
    const colors = ['bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-red-600', 'bg-yellow-600'];
    const currentIndex = colors.indexOf(avatarColor);
    const nextIndex = (currentIndex + 1) % colors.length;
    setAvatarColor(colors[nextIndex]);
  };

  // Fetch profile data when the component mounts
  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/users/profile', {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in Authorization header
        },
      });
      setProfileData(response.data); // Set the profile data in state
      setUsername(response.data.username);
      setEmail(response.data.email);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Display loading or error messages
  if (!profileData && !error) {
    return <p>Loading profile...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="bg-[white] min-h-screen pt-20 pb-5 px-5 flex flex-col items-center">
      <Navbar />
      <div className="w-full max-w-5xl rounded-lg overflow-y-auto p-5">
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="flex flex-col md:items-start md:flex-row md:space-x-6 w-full">
                <div className={`flex-shrink-0 ${avatarColor} w-40 h-40 rounded-full mx-auto md:mx-0`}></div>
                {isEditing && (
                  <button
                    onClick={handleCustomize}
                    className="w-auto bg-white p-2 rounded-full shadow-md hover:bg-gray-100 mt-4 md:mt-0"
                    aria-label="Customize avatar"
                  >
                    <SettingsIcon className="w-5 h-5 text-gray-600" />
                  </button>
                )}
                <div className="mt-6 md:mt-0 md:ml-8 w-full">
                  {isEditing ? (
                    <>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-4 border rounded-2xl bg-[#D9D9D9] text-xl mb-4"
                        placeholder={profileData.username}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 border rounded-2xl bg-[#D9D9D9] text-xl"
                        placeholder={profileData.email}
                      />
                    </>
                  ) : (
                    <div className='flex-col mt-10 ml-10'>
                      <div className='flex'>
                        <p className="text-2xl font-semibold mb-4">{profileData.username}</p>
                      </div>
                      <div className='flex'>
                        <p className="text-2xl font-semibold">{profileData.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-center md:justify-end">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="w-auto px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  Save Changes
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-auto px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {['Essay Shared', 'Total Likes', 'AVG. Word Count/Essay'].map((label, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow text-center">
              <div className="text-4xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;