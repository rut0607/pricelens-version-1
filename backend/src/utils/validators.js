const Joi = require('joi');

// User registration validation schema
const registrationSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().min(8).required().messages({
        'string.min': 'Password must be at least 8 characters long',
        'any.required': 'Password is required'
    }),
    business_name: Joi.string().max(255).optional()
});

// User login validation schema
const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    password: Joi.string().required().messages({
        'any.required': 'Password is required'
    })
});

// Analysis input validation schema
const analysisInputSchema = Joi.object({
    scenario_name: Joi.string().min(3).max(255).required().messages({
        'string.min': 'Scenario name must be at least 3 characters long',
        'any.required': 'Scenario name is required'
    }),
    description: Joi.string().max(1000).optional(),
    cost_price: Joi.number().positive().required().messages({
        'number.positive': 'Cost price must be a positive number',
        'any.required': 'Cost price is required'
    }),
    selling_price: Joi.number().positive().greater(Joi.ref('cost_price')).required().messages({
        'number.positive': 'Selling price must be a positive number',
        'number.greater': 'Selling price must be greater than cost price',
        'any.required': 'Selling price is required'
    }),
    units_sold: Joi.number().integer().min(1).required().messages({
        'number.integer': 'Units sold must be an integer',
        'number.min': 'Units sold must be at least 1',
        'any.required': 'Units sold is required'
    }),
    discount_percentage: Joi.number().min(0).max(100).required().messages({
        'number.min': 'Discount percentage must be between 0 and 100',
        'number.max': 'Discount percentage must be between 0 and 100',
        'any.required': 'Discount percentage is required'
    }),
    units_sold_discount: Joi.number().integer().min(1).required().messages({
        'number.integer': 'Discounted units sold must be an integer',
        'number.min': 'Discounted units sold must be at least 1',
        'any.required': 'Discounted units sold is required'
    }),
    fixed_cost: Joi.number().min(0).optional().default(0),
    variable_cost: Joi.number().min(0).optional().default(0),
    competitor_price: Joi.number().positive().optional(),
    time_period: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional().default('monthly')
});

// Query parameters validation schema
const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('created_at', 'scenario_name', 'updated_at').default('created_at'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

// Comparison validation schema
const comparisonSchema = Joi.object({
    analysisIds: Joi.array().items(Joi.string().uuid()).min(2).required()
});

// Validation functions
const validateRegistration = (data) => registrationSchema.validate(data);
const validateLogin = (data) => loginSchema.validate(data);
const validateAnalysisInput = (data) => analysisInputSchema.validate(data);
const validatePagination = (data) => paginationSchema.validate(data);
const validateComparison = (data) => comparisonSchema.validate(data);

module.exports = {
    validateRegistration,
    validateLogin,
    validateAnalysisInput,
    validatePagination,
    validateComparison
};