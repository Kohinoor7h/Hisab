import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Settings, BookOpen, Brain, LogIn, LogOut, Plus, Edit, Trash2, Calendar, DollarSign, Tag, User, Lightbulb, BarChart2 } from 'lucide-react'; // Added Lightbulb and BarChart2 icons

// Tailwind CSS is assumed to be available.
// Ensure you have <script src="https://cdn.tailwindcss.com"></script> in your HTML if running standalone.

// Global Firebase variables (provided by Canvas environment)
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Context for language and theme
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [language, setLanguage] = useState('en'); // 'en' for English, 'hi' for Hinenglish
    const [theme, setTheme] = useState('light'); // 'light', 'dark', 'blue'

    const translations = {
        en: {
            loginTitle: 'Shop Book Login',
            username: 'Username',
            password: 'Password',
            loginButton: 'Login',
            loginSuccess: 'Login Successful!',
            loginFailed: 'Invalid Username or Password.',
            dashboardTitle: 'My Shop Book',
            addEntry: 'Add New Entry',
            description: 'Description',
            amount: 'Amount',
            type: 'Type',
            income: 'Income',
            expense: 'Expense',
            date: 'Date',
            add: 'Add',
            totalIncome: 'Total Income',
            totalExpense: 'Total Expense',
            netBalance: 'Net Balance',
            aiAssistant: 'AI Assistant',
            askAi: 'Ask AI about your book...',
            aiResponse: 'AI Response:',
            settings: 'Settings',
            selectTheme: 'Select Theme',
            selectLanguage: 'Select Language',
            logout: 'Logout',
            editEntry: 'Edit Entry',
            update: 'Update',
            cancel: 'Cancel',
            confirmDelete: 'Are you sure you want to delete this entry?',
            delete: 'Delete',
            noEntries: 'No entries yet. Add some to get started!',
            userId: 'Your User ID:',
            loading: 'Loading...',
            expenseInsights: '✨ Expense Insights', // New translation
            monthlySummary: '✨ Monthly Summary',   // New translation
            generatingInsights: 'Generating insights...',
            generatingSummary: 'Generating summary...'
        },
        hi: {
            loginTitle: 'Dukaan Hisab Login',
            username: 'Username',
            password: 'Password',
            loginButton: 'Login Karein',
            loginSuccess: 'Login Safal Hua!',
            loginFailed: 'Galat Username Ya Password.',
            dashboardTitle: 'Meri Dukaan Ki Hisab Kitaab',
            addEntry: 'Nayi Entry Daalein',
            description: 'Vivaran',
            amount: 'Rashi',
            type: 'Prakar',
            income: 'Aamdani',
            expense: 'Kharcha',
            date: 'Tareekh',
            add: 'Jodein',
            totalIncome: 'Kul Aamdani',
            totalExpense: 'Kul Kharcha',
            netBalance: 'Shuddh Balance',
            aiAssistant: 'AI Sahayak',
            askAi: 'Apni book ke baare mein AI se poochhein...',
            aiResponse: 'AI Jawab:',
            settings: 'Settings',
            selectTheme: 'Theme Chunein',
            selectLanguage: 'Bhasha Chunein',
            logout: 'Logout Karein',
            editEntry: 'Entry Edit Karein',
            update: 'Update Karein',
            cancel: 'Cancel Karein',
            confirmDelete: 'Kya aap is entry ko delete karna chahte hain?',
            delete: 'Delete Karein',
            noEntries: 'Abhi tak koi entry nahi hai. Shuru karne ke liye kuch jodein!',
            userId: 'Aapka User ID:',
            loading: 'Load ho raha hai...',
            expenseInsights: '✨ Kharcha Insights', // New translation
            monthlySummary: '✨ Masik Saraansh',   // New translation
            generatingInsights: 'Insights bana raha hai...',
            generatingSummary: 'Saraansh bana raha hai...'
        }
    };

    const t = (key) => translations[language][key] || key;

    return (
        <AppContext.Provider value={{ language, setLanguage, theme, setTheme, t }}>
            {children}
        </AppContext.Provider>
    );
};

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [db, setDb] = useState(null);
    const [auth, setAuth] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        try {
            const app = initializeApp(firebaseConfig);
            const firestoreDb = getFirestore(app);
            const firebaseAuth = getAuth(app);

            setDb(firestoreDb);
            setAuth(firebaseAuth);

            // Sign in anonymously if no custom token, otherwise use custom token
            if (initialAuthToken) {
                signInWithCustomToken(firebaseAuth, initialAuthToken)
                    .then((userCredential) => {
                        setUser(userCredential.user);
                        setUserId(userCredential.user.uid);
                        setIsAuthReady(true);
                    })
                    .catch((error) => {
                        console.error("Error signing in with custom token:", error);
                        // Fallback to anonymous if custom token fails
                        signInAnonymously(firebaseAuth)
                            .then((userCredential) => {
                                setUser(userCredential.user);
                                setUserId(userCredential.user.uid);
                                setIsAuthReady(true);
                            })
                            .catch((anonError) => {
                                console.error("Error signing in anonymously:", anonError);
                                setIsAuthReady(true); // Still set ready even on failure
                            });
                    });
            } else {
                signInAnonymously(firebaseAuth)
                    .then((userCredential) => {
                        setUser(userCredential.user);
                        setUserId(userCredential.user.uid);
                        setIsAuthReady(true);
                    })
                    .catch((error) => {
                        console.error("Error signing in anonymously:", error);
                        setIsAuthReady(true); // Still set ready even on failure
                    });
            }

            // Listen for auth state changes
            const unsubscribe = onAuthStateChanged(firebaseAuth, (currentUser) => {
                setUser(currentUser);
                setUserId(currentUser?.uid || crypto.randomUUID()); // Use random ID if not authenticated
                setIsAuthReady(true);
            });

            return () => unsubscribe();
        } catch (error) {
            console.error("Firebase initialization error:", error);
            setIsAuthReady(true); // Indicate ready even if init failed
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, db, auth, isAuthReady, userId }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom Modal Component (replaces alert/confirm)
const Modal = ({ show, title, message, onConfirm, onCancel, type = 'alert' }) => {
    if (!show) return null;
    const { t } = useContext(AppContext);

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-sm transform transition-all duration-300 scale-100 opacity-100">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
                <p className="text-gray-700 dark:text-gray-300 mb-6">{message}</p>
                <div className="flex justify-end space-x-3">
                    {type === 'confirm' && (
                        <button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                        >
                            {t('cancel')}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        {type === 'confirm' ? t('delete') : 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [showModal, setShowModal] = useState(false);
    const { t } = useContext(AppContext);

    const handleLogin = () => {
        // Log the entered credentials for debugging
        console.log("Entered Username:", username);
        console.log("Entered Password:", password);

        // Hardcoded credentials for login
        if (username === 'mushahid' && password === 'hisab') {
            setMessage(t('loginSuccess'));
            setShowModal(true);
            setTimeout(() => {
                setShowModal(false);
                onLoginSuccess();
            }, 1500);
        } else {
            setMessage(t('loginFailed'));
            setShowModal(true);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-8">
                    <LogIn className="inline-block mr-2 text-blue-600" size={32} />
                    {t('loginTitle')}
                </h2>
                <div className="mb-6">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="username">
                        {t('username')}
                    </label>
                    <input
                        type="text"
                        id="username"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-200"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="mushahid"
                    />
                </div>
                <div className="mb-8">
                    <label className="block text-gray-700 dark:text-gray-300 text-sm font-medium mb-2" htmlFor="password">
                        {t('password')}
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition duration-200"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="hisab"
                    />
                </div>
                <button
                    onClick={handleLogin}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                    {t('loginButton')}
                </button>
            </div>
            <Modal
                show={showModal}
                title={message.includes(t('loginSuccess')) ? 'Success' : 'Error'}
                message={message}
                onConfirm={() => setShowModal(false)}
            />
        </div>
    );
};

const DashboardPage = ({ onLogout }) => {
    const { db, userId, isAuthReady } = useContext(AuthContext);
    const { t, theme } = useContext(AppContext);
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('expense'); // 'income' or 'expense'
    const [editingEntry, setEditingEntry] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState(null);

    useEffect(() => {
        if (db && userId && isAuthReady) {
            const q = query(collection(db, `artifacts/${appId}/users/${userId}/transactions`));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const fetchedTransactions = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                // Sort by date descending
                fetchedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                setTransactions(fetchedTransactions);
            }, (error) => {
                console.error("Error fetching transactions:", error);
            });
            return () => unsubscribe();
        }
    }, [db, userId, isAuthReady]);

    const handleAddOrUpdateEntry = async () => {
        if (!description || !amount || isNaN(amount) || parseFloat(amount) <= 0) {
            alert('Please enter valid description and amount.'); // Using alert for simplicity, replace with modal
            return;
        }

        const newEntry = {
            description,
            amount: parseFloat(amount),
            type,
            date: new Date().toISOString().split('T')[0], //YYYY-MM-DD
            timestamp: Date.now() // For sorting if date strings are problematic
        };

        try {
            if (editingEntry) {
                // Update existing entry
                const entryRef = doc(db, `artifacts/${appId}/users/${userId}/transactions`, editingEntry.id);
                await updateDoc(entryRef, newEntry);
                setEditingEntry(null);
            } else {
                // Add new entry
                await addDoc(collection(db, `artifacts/${appId}/users/${userId}/transactions`), newEntry);
            }
            setDescription('');
            setAmount('');
            setType('expense');
        } catch (e) {
            console.error("Error adding/updating document: ", e);
        }
    };

    const handleEditClick = (entry) => {
        setEditingEntry(entry);
        setDescription(entry.description);
        setAmount(entry.amount.toString());
        setType(entry.type);
    };

    const handleDeleteClick = (entry) => {
        setEntryToDelete(entry);
        setShowDeleteConfirm(true);
    };

    const confirmDeleteEntry = async () => {
        if (entryToDelete) {
            try {
                await deleteDoc(doc(db, `artifacts/${appId}/users/${userId}/transactions`, entryToDelete.id));
            } catch (e) {
                console.error("Error deleting document: ", e);
            } finally {
                setShowDeleteConfirm(false);
                setEntryToDelete(null);
            }
        }
    };

    const cancelDeleteEntry = () => {
        setShowDeleteConfirm(false);
        setEntryToDelete(null);
    };

    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalIncome - totalExpense;

    const getThemeClasses = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-900 text-gray-100';
            case 'blue':
                return 'bg-blue-900 text-blue-100';
            default: // light
                return 'bg-gray-100 text-gray-900';
        }
    };

    const getCardClasses = () => {
        switch (theme) {
            case 'dark':
                return 'bg-gray-800 border-gray-700';
            case 'blue':
                return 'bg-blue-800 border-blue-700';
            default: // light
                return 'bg-white border-gray-200';
        }
    };

    if (!isAuthReady) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${getThemeClasses()}`}>
                <p className="text-xl font-semibold flex items-center">
                    <span className="animate-spin mr-2">⚙️</span> {t('loading')}
                </p>
            </div>
        );
    }

    return (
        <div className={`min-h-screen p-4 ${getThemeClasses()} transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto">
                <div className={`p-6 rounded-xl shadow-lg mb-8 ${getCardClasses()} border`}>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-4xl font-extrabold flex items-center">
                            <BookOpen className="mr-3 text-blue-500" size={40} />
                            {t('dashboardTitle')}
                        </h1>
                        <button
                            onClick={onLogout}
                            className="px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition duration-300 shadow-md flex items-center"
                        >
                            <LogOut className="mr-2" size={20} /> {t('logout')}
                        </button>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex items-center">
                        <User className="mr-2" size={16} /> {t('userId')} {userId}
                    </p>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className={`p-5 rounded-lg shadow-md ${getCardClasses()} border`}>
                            <h3 className="text-lg font-medium text-green-500 mb-2">{t('totalIncome')}</h3>
                            <p className="text-3xl font-bold">₹{totalIncome.toFixed(2)}</p>
                        </div>
                        <div className={`p-5 rounded-lg shadow-md ${getCardClasses()} border`}>
                            <h3 className="text-lg font-medium text-red-500 mb-2">{t('totalExpense')}</h3>
                            <p className="text-3xl font-bold">₹{totalExpense.toFixed(2)}</p>
                        </div>
                        <div className={`p-5 rounded-lg shadow-md ${getCardClasses()} border`}>
                            <h3 className="text-lg font-medium text-blue-500 mb-2">{t('netBalance')}</h3>
                            <p className="text-3xl font-bold">₹{netBalance.toFixed(2)}</p>
               