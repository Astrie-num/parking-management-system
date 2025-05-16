import React from 'react';

function Home() {
    return (
        <div className="min-h-screen bg-white-100 flex items-center justify-center">
            <div className="text-center p-6 bg-white shadow-lg rounded-lg max-w-md">
                <h1 className="text-4xl font-bold text-blue-700 mb-4">
                    Welcome to Car Parking Management System
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Manage vehicle parking with ease!
                </p>
                <a
                    href="/register"
                    className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                >
                    Get Started
                </a>
            </div>
        </div>
    );
}

export default Home;