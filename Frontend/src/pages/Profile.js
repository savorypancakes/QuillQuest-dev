import React, { useState, useEffect } from 'react';
import '../assets/css/pages/Profile.css';
import Navbar from '../components/Navbar';
import samplePicture from '../assets/images/profile-user.png';
import api from '../services/api';


const Profile = () => {
  const [profilePicture, setProfilePicture] = useState(samplePicture);
  const [profileData, setProfileData] = useState(null); // State to hold the user's profile data
  const [error, setError] = useState(''); // State to hold any error message


  // const handleEditProfile = (event) => {
  //     event.preventDefault();
  //     // Here you would typically handle the update logic (e.g., API call)
  //     console.log("Profile updated:", { username, email, password });
  // };

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
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    }

  }
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
    <div>
      <Navbar />
      <div className='profile-container'>
        <div className='profile-card'>

          <div className='fieldP'>
            <img src={profilePicture} alt="Profile" className="profile-picture" />
            <a href='' className='editP'>edit profile picture</a>
          </div>

          <div className='field'>
            <span className='static'>Username</span>
            <span>{profileData.username}</span>
            <span className='static'></span>
          </div>
          <div className='field'>
            <span className='static'>Email</span>
            <span>{profileData.email}</span>
            <span className='static'></span>
          </div>
          <div className='field'>
            <span className='static'>Password</span>
            <span>*********************</span>
            <a href='' className='change'>change</a>
          </div>

          <button className='save'>Save Change</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;