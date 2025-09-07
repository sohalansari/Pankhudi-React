// Mock API service to simulate backend responses
const mockApi = {
    login: (email, password) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Simulate network delay
                if (email === 'admin@pankhudi.com' && password === 'admin123') {
                    resolve({
                        success: true,
                        token: 'mock-jwt-token-12345',
                        user: {
                            id: 1,
                            name: 'Admin User',
                            email: 'admin@pankhudi.com',
                            role: 'admin'
                        }
                    });
                } else {
                    resolve({
                        success: false,
                        message: 'Invalid email or password'
                    });
                }
            }, 1000); // Simulate network delay
        });
    },

    verifyToken: (token) => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (token === 'mock-jwt-token-12345') {
                    resolve({
                        success: true,
                        user: {
                            id: 1,
                            name: 'Admin User',
                            email: 'admin@pankhudi.com',
                            role: 'admin'
                        }
                    });
                } else {
                    resolve({ success: false });
                }
            }, 500);
        });
    },

    getDashboardStats: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    totalUsers: 1245,
                    activeUsers: 987,
                    newUsers: 42
                });
            }, 800);
        });
    },

    getUsers: () => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve([
                    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', joinDate: '2023-01-15' },
                    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active', joinDate: '2023-02-20' },
                    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', joinDate: '2023-03-10' },
                    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'active', joinDate: '2023-04-05' },
                    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', status: 'active', joinDate: '2023-05-12' }
                ]);
            }, 1000);
        });
    }
};

export default mockApi;