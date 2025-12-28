const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { supabase } = require('../config/supabase');
const { validateRegistration, validateLogin } = require('../utils/validators');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

class AuthController {
    /**
     * Register a new user
     */
    static async register(req, res) {
        try {
            // Validate input
            const { error, value } = validateRegistration(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.details
                });
            }

            const { email, password, business_name } = value;

            // Check if user already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .single();

            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            // Create user in database
            const { data: user, error: createError } = await supabase
                .from('users')
                .insert([{
                    email,
                    password_hash: passwordHash,
                    business_name: business_name || null
                }])
                .select()
                .single();

            if (createError) {
                throw createError;
            }

            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Remove password hash from response
            delete user.password_hash;

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error registering user',
                error: error.message
            });
        }
    }

    /**
     * Login user
     */
    static async login(req, res) {
        try {
            // Validate input
            const { error, value } = validateLogin(req.body);
            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation error',
                    errors: error.details
                });
            }

            const { email, password } = value;

            // Find user by email
            const { data: user, error: findError } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (findError || !user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Verify password
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }

            // Create JWT token
            const token = jwt.sign(
                { userId: user.id, email: user.email },
                JWT_SECRET,
                { expiresIn: JWT_EXPIRES_IN }
            );

            // Remove password hash from response
            delete user.password_hash;

            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user,
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Error logging in',
                error: error.message
            });
        }
    }

    /**
     * Get current user profile
     */
    static async getProfile(req, res) {
        try {
            const userId = req.user.userId;

            const { data: user, error } = await supabase
                .from('users')
                .select('id, email, business_name, created_at')
                .eq('id', userId)
                .single();

            if (error || !user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching profile',
                error: error.message
            });
        }
    }

    /**
     * Update user profile
     */
    static async updateProfile(req, res) {
        try {
            const userId = req.user.userId;
            const { business_name } = req.body;

            const { data: user, error } = await supabase
                .from('users')
                .update({
                    business_name: business_name || null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                throw error;
            }

            // Remove password hash from response
            delete user.password_hash;

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating profile',
                error: error.message
            });
        }
    }
}

module.exports = AuthController;