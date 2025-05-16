import React from 'react';

function Home() {
    return (
        <div className="min-h-screen bg-white-100 flex items-center justify-center">
            <div className="text-center p-6 bg-white shadow-2xl rounded-lg max-w-md">
                <h1 className="text-4xl font-bold text-black mb-4">
                    Welcome to Parking Management System
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                    Manage parking with ease!
                </p>
                <a
                    href="/register"
                    className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-300"
                >
                    Get Started
                </a>
            </div>
        </div>
    );
}

export default Home;