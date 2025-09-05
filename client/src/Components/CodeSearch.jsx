import React, { useState } from 'react';
import { FaSearch, FaUser, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { getAllUsers } from '../Redux/Slices/AdminUserSlice';

const CodeSearch = ({ onUserSelect, className = "" }) => {
    const [searchCode, setSearchCode] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    
    const dispatch = useDispatch();
    const { users, loading } = useSelector((state) => state.adminUser);

    const handleCodeSearch = async () => {
        if (!searchCode.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        setIsSearching(true);
        try {
            // Search for users with the specific code
            const response = await dispatch(getAllUsers({ 
                page: 1, 
                limit: 100, // Get more results to find the code
                codeSearch: searchCode.trim()
            })).unwrap();

            if (response.success && response.data.users) {
                const filteredUsers = response.data.users.filter(user => 
                    user.code && user.code.toLowerCase().includes(searchCode.toLowerCase())
                );
                setSearchResults(filteredUsers);
                setShowResults(true);
            } else {
                setSearchResults([]);
                setShowResults(true);
            }
        } catch (error) {
            console.error('Code search error:', error);
            setSearchResults([]);
            setShowResults(true);
        } finally {
            setIsSearching(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleCodeSearch();
        }
    };

    const handleUserSelect = (user) => {
        if (onUserSelect) {
            onUserSelect(user);
        }
        setShowResults(false);
        setSearchCode('');
    };

    const clearSearch = () => {
        setSearchCode('');
        setSearchResults([]);
        setShowResults(false);
    };

    return (
        <div className={`relative ${className}`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchCode}
                        onChange={(e) => setSearchCode(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="البحث بالرمز التعريفي..."
                        className="w-full px-3 sm:px-4 py-2 sm:py-2 pl-10 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm sm:text-base"
                    />
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm sm:text-base" />
                    {searchCode && (
                        <button
                            onClick={clearSearch}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <FaTimes className="text-sm" />
                        </button>
                    )}
                </div>
                <button
                    onClick={handleCodeSearch}
                    disabled={isSearching || !searchCode.trim()}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base font-medium"
                >
                    {isSearching ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                        <FaSearch className="text-sm sm:text-base" />
                    )}
                    <span className="whitespace-nowrap">بحث</span>
                </button>
            </div>

            {/* Search Results */}
            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-64 sm:max-h-96 overflow-y-auto w-full">
                    {searchResults.length > 0 ? (
                        <div className="p-2">
                            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 px-2 sm:px-3 py-2 border-b border-gray-200 dark:border-gray-600">
                                تم العثور على {searchResults.length} مستخدم
                            </div>
                            {searchResults.map((user) => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserSelect(user)}
                                    className="flex items-center space-x-2 sm:space-x-3 p-2 sm:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                                >
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FaUser className="text-indigo-600 dark:text-indigo-400 text-xs sm:text-sm" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                                            {user.fullName}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                            {user.email}
                                        </div>
                                        <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                                            الرمز: {user.code}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                        {user.role === 'SUPER_ADMIN' ? 'مدير مميز' : user.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-3 sm:p-4 text-center text-gray-500 dark:text-gray-400">
                            <FaUser className="mx-auto h-6 w-6 sm:h-8 sm:w-8 mb-2 text-gray-300" />
                            <p className="text-xs sm:text-sm">لم يتم العثور على مستخدمين بهذا الرمز</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CodeSearch;
