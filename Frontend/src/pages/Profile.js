import React, { useState } from 'react';
import '../assets/css/pages/Profile.css';
import Navbar from '../components/Navbar';
import samplePicture from '../assets/images/profile-user.png';


const Profile = () => {
    const [profilePicture, setProfilePicture] = useState(samplePicture);
    const [username, setUsername] = useState("username0");
    const [email, setEmail] = useState("username01@gmail.com");
    const [password, setPassword] = useState("password123");

    const handleEditProfile = (event) => {
        event.preventDefault();
        // Here you would typically handle the update logic (e.g., API call)
        console.log("Profile updated:", { username, email, password });
    };

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
                        <span>{username}</span>
                        <span className='static'></span>
                    </div>
                    <div className='field'>
                        <span className='static'>Email</span>
                        <span>{email}</span>
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